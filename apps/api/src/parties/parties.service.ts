import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service';
import { getPartyRole } from '../platform/parties/party-role-registry';
import { getBusinessTemplate } from '../templates/template-registry';
import { AssignPartyRoleDto } from './dto/assign-party-role.dto';
import { CreatePartyDto } from './dto/create-party.dto';

@Injectable()
export class PartiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organisationId: string) {
    await this.ensureOrganisationExists(organisationId);

    return this.prisma.party.findMany({
      where: {
        organisationId,
      },
      include: {
        roleAssignments: true,
      },
      orderBy: {
        displayName: 'asc',
      },
    });
  }

  async findOne(organisationId: string, partyId: string) {
    const party = await this.prisma.party.findFirst({
      where: {
        id: partyId,
        organisationId,
      },
      include: {
        roleAssignments: true,
      },
    });

    if (!party) {
      throw new NotFoundException(`Party not found: ${partyId}`);
    }

    return party;
  }

  async create(organisationId: string, dto: CreatePartyDto) {
    await this.ensureOrganisationExists(organisationId);

    return this.prisma.party.create({
      data: {
        organisationId,
        type: dto.type,
        displayName: dto.displayName,
      },
      include: {
        roleAssignments: true,
      },
    });
  }

  async assignRole(
    organisationId: string,
    partyId: string,
    dto: AssignPartyRoleDto,
  ) {
    const role = getPartyRole(dto.roleId);

    if (!role) {
      throw new BadRequestException(`Unknown party role: ${dto.roleId}`);
    }

    const template = await this.getOrganisationTemplate(organisationId);

    const roleConfiguration = template.partyRoles?.find(
      (configuration) => configuration.roleId === dto.roleId,
    );

    if (!roleConfiguration?.enabled) {
      throw new BadRequestException(
        `Party role "${dto.roleId}" is not enabled for this organisation`,
      );
    }

    const party = await this.prisma.party.findFirst({
      where: {
        id: partyId,
        organisationId,
      },
    });

    if (!party) {
      throw new NotFoundException(`Party not found: ${partyId}`);
    }

    return this.prisma.partyRoleAssignment.create({
      data: {
        partyId,
        roleId: dto.roleId,
        status: dto.status ?? 'active',
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
    });
  }

  async getAvailableRoles(organisationId: string) {
    const template = await this.getOrganisationTemplate(organisationId);

    return (template.partyRoles ?? [])
      .filter((configuration) => configuration.enabled)
      .map((configuration) => {
        const role = getPartyRole(configuration.roleId);

        if (!role) {
          throw new BadRequestException(
            `Unknown party role: ${configuration.roleId}`,
          );
        }

        return {
          ...role,
          captureMode: configuration.captureMode,
          settings: configuration.settings ?? null,
        };
      });
  }

  private async ensureOrganisationExists(
    organisationId: string,
  ): Promise<void> {
    const organisation = await this.prisma.organisation.findUnique({
      where: {
        id: organisationId,
      },
    });

    if (!organisation) {
      throw new NotFoundException(`Organisation not found: ${organisationId}`);
    }
  }

  private async getOrganisationTemplate(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: {
        id: organisationId,
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

    return template;
  }
}
