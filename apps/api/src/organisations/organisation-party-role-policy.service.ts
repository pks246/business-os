import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service';
import {
  ConfigObject,
  PartyRoleCaptureMode,
} from '../platform/business-template';
import {
  getPartyRole,
  getPartyRoles,
} from '../platform/parties/party-role-registry';
import { OrganisationModuleAccessService } from './organisation-module-access.service';
import { UpdatePartyRolePolicyDto } from './dto/update-party-role-policy.dto';
import { getBusinessTemplate } from '../templates/template-registry';

@Injectable()
export class OrganisationPartyRolePolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleAccess: OrganisationModuleAccessService,
  ) {}

  async getPolicies(organisationId: string) {
    const { organisation, template } = await this.loadContext(organisationId);
    const overrides = new Map(
      organisation.partyRolePolicies.map((policy) => [policy.roleId, policy]),
    );

    return getPartyRoles().map((role) => {
      const override = overrides.get(role.id);
      const templatePolicy = template.partyRoles?.find((policy) => policy.roleId === role.id);

      return {
        ...role,
        enabled: override?.enabled ?? templatePolicy?.enabled ?? false,
        captureMode: (override?.captureMode ?? templatePolicy?.captureMode ?? 'optional') as PartyRoleCaptureMode,
        settings: this.asConfigObject(override?.settings) ?? templatePolicy?.settings ?? null,
        source: override
          ? 'organisation'
          : templatePolicy
            ? 'template'
            : 'platform-default',
      };
    });
  }

  async getPolicy(organisationId: string, roleId: string) {
    const role = getPartyRole(roleId);
    if (!role) {
      throw new BadRequestException(`Unknown party role: ${roleId}`);
    }

    const policies = await this.getPolicies(organisationId);
    const policy = policies.find((item) => item.id === roleId);

    if (!policy) {
      throw new BadRequestException(`Unknown party role: ${roleId}`);
    }

    return policy;
  }

  async updatePolicy(
    organisationId: string,
    roleId: string,
    dto: UpdatePartyRolePolicyDto,
  ) {
    if (!getPartyRole(roleId)) {
      throw new BadRequestException(`Unknown party role: ${roleId}`);
    }

    await this.loadContext(organisationId);

    return this.prisma.organisationPartyRolePolicy.upsert({
      where: {
        organisationId_roleId: { organisationId, roleId },
      },
      create: {
        organisationId,
        roleId,
        enabled: dto.enabled,
        captureMode: dto.captureMode,
        ...(dto.settings !== undefined && dto.settings !== null ? { settings: dto.settings } : {}),
      },
      update: {
        enabled: dto.enabled,
        captureMode: dto.captureMode,
        ...(dto.settings === null
          ? { settings: Prisma.DbNull }
          : dto.settings !== undefined
            ? { settings: dto.settings }
            : {}),
      },
    });
  }

  private async loadContext(organisationId: string) {
    await this.moduleAccess.ensureModuleEnabled(organisationId, 'parties');

    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      include: { partyRolePolicies: true },
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

    return { organisation, template };
  }

  private asConfigObject(value: unknown): ConfigObject | null {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as ConfigObject;
    }

    return null;
  }
}
