import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import { OrganisationModuleAccessService } from './organisation-module-access.service';
import { OrganisationPartyRolePolicyService } from './organisation-party-role-policy.service';

describe('OrganisationPartyRolePolicyService', () => {
  let service: OrganisationPartyRolePolicyService;

  const prismaMock = {
    organisation: {
      findUnique: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    },
    organisationPartyRolePolicy: {
      upsert: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    },
  };

  const moduleAccessMock = {
    ensureModuleEnabled: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    moduleAccessMock.ensureModuleEnabled.mockResolvedValue({
      enabled: true,
      settings: null,
      source: 'template',
    });

    service = new OrganisationPartyRolePolicyService(
      prismaMock as unknown as PrismaService,
      moduleAccessMock as unknown as OrganisationModuleAccessService,
    );
  });

  it('uses template defaults when no override exists', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      partyRolePolicies: [],
    });

    const policies = await service.getPolicies('org-1');

    const customer = policies.find((policy) => policy.id === 'customer');
    const patient = policies.find((policy) => policy.id === 'patient');

    expect(customer?.enabled).toBe(true);
    expect(customer?.captureMode).toBe('optional');
    expect(customer?.source).toBe('template');

    expect(patient?.enabled).toBe(false);
    expect(patient?.source).toBe('platform-default');
  });

  it('uses organisation overrides instead of template defaults', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      partyRolePolicies: [
        {
          roleId: 'customer',
          enabled: true,
          captureMode: 'required',
          settings: {},
        },
      ],
    });

    const policy = await service.getPolicy('org-1', 'customer');

    expect(policy.enabled).toBe(true);
    expect(policy.captureMode).toBe('required');
    expect(policy.source).toBe('organisation');
  });

  it('saves an organisation-specific policy override', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      partyRolePolicies: [],
    });

    prismaMock.organisationPartyRolePolicy.upsert.mockResolvedValue({
      organisationId: 'org-1',
      roleId: 'customer',
      enabled: true,
      captureMode: 'required',
      settings: {},
    });

    await service.updatePolicy('org-1', 'customer', {
      enabled: true,
      captureMode: 'required',
    });

    expect(prismaMock.organisationPartyRolePolicy.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organisationId_roleId: {
            organisationId: 'org-1',
            roleId: 'customer',
          },
        },
        create: expect.objectContaining({
          organisationId: 'org-1',
          roleId: 'customer',
          enabled: true,
          captureMode: 'required',
        }),
      }),
    );
  });

  it('rejects unknown roles', async () => {
    await expect(
      service.updatePolicy('org-1', 'unknown-role', {
        enabled: true,
        captureMode: 'required',
      }),
    ).rejects.toThrow('Unknown party role');
  });
});
