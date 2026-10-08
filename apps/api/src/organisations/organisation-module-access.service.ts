import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getBusinessTemplate } from '../templates/template-registry';

@Injectable()
export class OrganisationModuleAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getModuleConfiguration(organisationId: string, moduleId: string) {
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

    const organisationConfiguration = organisation.modules.find(
      (module) => module.moduleId === moduleId,
    );

    if (organisationConfiguration) {
      return {
        enabled: organisationConfiguration.enabled,
        settings: organisationConfiguration.settings,
        source: 'organisation' as const,
        templateId: organisation.templateId,
      };
    }

    const template = getBusinessTemplate(organisation.templateId);

    if (!template) {
      throw new BadRequestException(
        `Organisation uses unknown template: ${organisation.templateId}`,
      );
    }

    const templateConfiguration = template.modules.find(
      (module) => module.id === moduleId,
    );

    if (!templateConfiguration) {
      return null;
    }

    return {
      enabled: templateConfiguration.enabled,
      settings: templateConfiguration.settings ?? null,
      source: 'template' as const,
      templateId: organisation.templateId,
    };
  }

  async ensureModuleEnabled(organisationId: string, moduleId: string) {
    const configuration = await this.getModuleConfiguration(
      organisationId,
      moduleId,
    );

    if (!configuration) {
      throw new BadRequestException(
        `Module "${moduleId}" is not available for this organisation`,
      );
    }

    if (!configuration.enabled) {
      throw new BadRequestException(
        `Module "${moduleId}" is disabled for this organisation`,
      );
    }

    return configuration;
  }
}
