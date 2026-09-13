import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getBusinessTemplate } from '../templates/template-registry';

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
}
