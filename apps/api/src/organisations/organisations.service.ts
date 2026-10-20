import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service';
import {
  getModule,
  getModules as getRegisteredModules,
} from '../platform/modules/module-registry';
import { validateModuleConfigurations } from '../platform/templates/validate-template';
import { getBusinessTemplate } from '../templates/template-registry';
import { UpdateOrganisationModuleDto } from './dto/update-organisation-module.dto';

@Injectable()
export class OrganisationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.organisation.findMany();
  }

  create(name: string, templateId: string) {
    const template = getBusinessTemplate(templateId);

    if (!template) {
      throw new BadRequestException(`Unknown business template: ${templateId}`);
    }

    // Persist the template pin only. Module rows represent tenant overrides;
    // absent overrides inherit defaults from this exact template version.
    return this.prisma.organisation.create({
      data: {
        name,
        templateId: template.id,
        templateVersion: template.version,
      },
      include: {
        modules: true,
      },
    });
  }

  async getConfiguration(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      include: { modules: true },
    });

    if (!organisation) {
      throw new NotFoundException(`Organisation not found: ${organisationId}`);
    }

    return {
      id: organisation.id,
      name: organisation.name,
      templateId: organisation.templateId,
      templateVersion: organisation.templateVersion,
      modules: organisation.modules,
    };
  }

  async getModules(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      include: { modules: true },
    });

    if (!organisation) {
      throw new NotFoundException(`Organisation not found: ${organisationId}`);
    }

    const template = getBusinessTemplate(
      organisation.templateId,
      organisation.templateVersion,
    );

    if (!template) {
      throw new BadRequestException(
        `Organisation uses unavailable business template version: ${organisation.templateId}@${organisation.templateVersion}`,
      );
    }

    const configuredModules = new Map(
      organisation.modules.map((moduleConfig) => [moduleConfig.moduleId, moduleConfig]),
    );

    return getRegisteredModules().map((moduleDefinition) => {
      const override = configuredModules.get(moduleDefinition.id);
      const templateConfiguration = template.modules.find(
        (module) => module.id === moduleDefinition.id,
      );

      return {
        id: moduleDefinition.id,
        name: moduleDefinition.name,
        description: moduleDefinition.description,
        dependencies: moduleDefinition.dependencies ?? [],
        configured: override !== undefined,
        enabled: override?.enabled ?? templateConfiguration?.enabled ?? false,
        settings: override?.settings ?? templateConfiguration?.settings ?? null,
      };
    });
  }

  async updateModule(
    organisationId: string,
    moduleId: string,
    dto: UpdateOrganisationModuleDto,
  ) {
    const moduleDefinition = getModule(moduleId);

    if (!moduleDefinition) {
      throw new BadRequestException(`Unknown platform module: ${moduleId}`);
    }

    return this.prisma.$transaction(async (transaction) => {
      const organisation = await transaction.organisation.findUnique({
        where: { id: organisationId },
        include: { modules: true },
      });

      if (!organisation) {
        throw new NotFoundException(`Organisation not found: ${organisationId}`);
      }

      const template = getBusinessTemplate(
        organisation.templateId,
        organisation.templateVersion,
      );

      if (!template) {
        throw new BadRequestException(
          `Organisation uses unavailable business template version: ${organisation.templateId}@${organisation.templateVersion}`,
        );
      }

      const persistedConfigurations = new Map(
        organisation.modules.map((item) => [item.moduleId, item]),
      );
      const registeredModuleDefinitions = getRegisteredModules();
      const registeredModuleIds = new Set(
        registeredModuleDefinitions.map((item) => item.id),
      );

      const unknownPersistedModule = organisation.modules.find(
        (item) => !registeredModuleIds.has(item.moduleId),
      );
      if (unknownPersistedModule) {
        throw new BadRequestException(
          `Organisation has configuration for unknown platform module: ${unknownPersistedModule.moduleId}`,
        );
      }

      // Validate the complete effective configuration, including valid modules
      // enabled by a tenant override even if its template does not list them.
      const configurations = registeredModuleDefinitions.map((definition) => {
        const override = persistedConfigurations.get(definition.id);
        const templateDefault = template.modules.find(
          (item) => item.id === definition.id,
        );

        return {
          id: definition.id,
          enabled: override?.enabled ?? templateDefault?.enabled ?? false,
        };
      });

      const targetConfiguration = configurations.find(
        (item) => item.id === moduleId,
      );
      if (targetConfiguration) {
        targetConfiguration.enabled = dto.enabled;
      }

      try {
        validateModuleConfigurations(
          configurations,
          `Organisation "${organisationId}"`,
        );
      } catch (error) {
        throw new BadRequestException(
          error instanceof Error ? error.message : 'Invalid module configuration',
        );
      }

      const updateData: Prisma.OrganisationModuleUpdateInput = {
        enabled: dto.enabled,
      };

      if (dto.settings === null) {
        // Explicit null clears a settings override so the pinned template
        // settings become effective again. Omission preserves the current row.
        updateData.settings = Prisma.DbNull;
      } else if (dto.settings !== undefined) {
        // Supplied settings replace the whole settings object.
        updateData.settings = dto.settings;
      }

      return transaction.organisationModule.upsert({
        where: {
          organisationId_moduleId: { organisationId, moduleId },
        },
        update: updateData,
        create: {
          organisationId,
          moduleId,
          enabled: dto.enabled,
          ...(dto.settings !== undefined && dto.settings !== null
            ? { settings: dto.settings }
            : {}),
        },
      });
    });
  }
}
