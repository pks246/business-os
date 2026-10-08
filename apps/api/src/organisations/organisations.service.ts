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

    return this.prisma.organisation.create({
      data: {
        name,
        templateId,

        modules: {
          create: template.modules.map((moduleConfig) => ({
            moduleId: moduleConfig.id,
            enabled: moduleConfig.enabled,
            settings: moduleConfig.settings ?? {},
          })),
        },
      },

      include: {
        modules: true,
      },
    });
  }

  async getConfiguration(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: {
        id: organisationId,
      },

      include: {
        modules: true,
      },
    });

    if (!organisation) {
      throw new NotFoundException(`Organisation not found: ${organisationId}`);
    }

    return {
      id: organisation.id,
      name: organisation.name,
      templateId: organisation.templateId,
      modules: organisation.modules,
    };
  }

  async getModules(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: {
        id: organisationId,
      },

      include: {
        modules: true,
      },
    });

    if (!organisation) {
      throw new NotFoundException(`Organisation not found: ${organisationId}`);
    }

    const template = getBusinessTemplate(organisation.templateId);

    if (!template) {
      throw new BadRequestException(
        `Organisation uses unknown template: ${organisation.templateId}`,
      );
    }

    const configuredModules = new Map(
      organisation.modules.map((moduleConfig) => [
        moduleConfig.moduleId,
        moduleConfig,
      ]),
    );

    return getRegisteredModules().map((moduleDefinition) => {
      const organisationConfiguration = configuredModules.get(
        moduleDefinition.id,
      );

      const templateConfiguration = template.modules.find(
        (module) => module.id === moduleDefinition.id,
      );

      return {
        id: moduleDefinition.id,
        name: moduleDefinition.name,
        description: moduleDefinition.description,
        dependencies: moduleDefinition.dependencies ?? [],
        configured: organisationConfiguration !== undefined,
        enabled:
          organisationConfiguration?.enabled ??
          templateConfiguration?.enabled ??
          false,
        settings:
          organisationConfiguration?.settings ??
          templateConfiguration?.settings ??
          null,
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
        where: {
          id: organisationId,
        },

        include: {
          modules: true,
        },
      });

      if (!organisation) {
        throw new NotFoundException(
          `Organisation not found: ${organisationId}`,
        );
      }

      const template = getBusinessTemplate(organisation.templateId);

      if (!template) {
        throw new BadRequestException(
          `Organisation uses unknown template: ${organisation.templateId}`,
        );
      }

      const persistedConfigurations = new Map(
        organisation.modules.map((organisationModule) => [
          organisationModule.moduleId,
          organisationModule,
        ]),
      );

      const configurations = template.modules.map((templateModule) => {
        const persisted = persistedConfigurations.get(templateModule.id);

        return {
          id: templateModule.id,
          enabled: persisted?.enabled ?? templateModule.enabled,
        };
      });

      const existingConfiguration = configurations.find(
        (configuration) => configuration.id === moduleId,
      );

      if (existingConfiguration) {
        existingConfiguration.enabled = dto.enabled;
      } else {
        configurations.push({
          id: moduleId,
          enabled: dto.enabled,
        });
      }

      validateModuleConfigurations(
        configurations,
        `Organisation "${organisationId}"`,
      );

      const updateData: Prisma.OrganisationModuleUpdateInput = {
        enabled: dto.enabled,
      };

      if (dto.settings !== undefined) {
        updateData.settings = dto.settings;
      }

      return transaction.organisationModule.upsert({
        where: {
          organisationId_moduleId: {
            organisationId,
            moduleId,
          },
        },

        update: updateData,

        create: {
          organisationId,
          moduleId,
          enabled: dto.enabled,
          settings: dto.settings ?? {},
        },
      });
    });
  }
}
