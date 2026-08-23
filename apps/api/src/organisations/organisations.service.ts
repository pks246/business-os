import { BadRequestException, Injectable } from '@nestjs/common';
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
      },
    });
  }
}
