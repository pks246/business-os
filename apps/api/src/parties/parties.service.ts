import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service';
import { OrganisationModuleAccessService } from '../organisations/organisation-module-access.service';
import { getPartyRole } from '../platform/parties/party-role-registry';
import { OrganisationPartyRolePolicyService } from '../organisations/organisation-party-role-policy.service';
import { AssignPartyRoleDto } from './dto/assign-party-role.dto';
import { CreatePartyDto } from './dto/create-party.dto';

@Injectable()
export class PartiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleAccess: OrganisationModuleAccessService,
    private readonly rolePolicies: OrganisationPartyRolePolicyService,
  ) {}

  async findAll(organisationId: string) {
    await this.moduleAccess.ensureModuleEnabled(organisationId, 'parties');

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
    await this.moduleAccess.ensureModuleEnabled(organisationId, 'parties');

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
    await this.moduleAccess.ensureModuleEnabled(organisationId, 'parties');

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
    await this.moduleAccess.ensureModuleEnabled(organisationId, 'parties');

    const role = getPartyRole(dto.roleId);

    if (!role) {
      throw new BadRequestException(`Unknown party role: ${dto.roleId}`);
    }

    const rolePolicy = await this.rolePolicies.getPolicy(
      organisationId,
      dto.roleId,
    );

    if (!rolePolicy.enabled) {
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
    const policies = await this.rolePolicies.getPolicies(organisationId);

    return policies.filter((policy) => policy.enabled);
  }
}
