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

    const override = organisation.modules.find((item) => item.moduleId === moduleId);
    const templateConfiguration = template.modules.find((item) => item.id === moduleId);

    if (!override && !templateConfiguration) {
      return null;
    }

    return {
      enabled: override?.enabled ?? templateConfiguration?.enabled ?? false,
      settings: override?.settings ?? templateConfiguration?.settings ?? null,
      source: override ? ('organisation' as const) : ('template' as const),
      templateId: organisation.templateId,
      templateVersion: organisation.templateVersion,
    };
  }

  async ensureModuleEnabled(organisationId: string, moduleId: string) {
    const configuration = await this.getModuleConfiguration(organisationId, moduleId);

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
