import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
  beforeAll,
} from '@jest/globals';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service';
import { OrganisationModuleAccessService } from './organisation-module-access.service';
import { OrganisationPartyRolePolicyService } from './organisation-party-role-policy.service';
import { initialisePlatformRegistries } from '../platform/initialise-platform-registries';

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
  beforeAll(() => initialisePlatformRegistries());
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
      templateVersion: '1.0.0',
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
      templateVersion: '1.0.0',
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

  it('does not copy template settings into an override when settings are omitted', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      templateVersion: '1.0.0',
      partyRolePolicies: [],
    });
    prismaMock.organisationPartyRolePolicy.upsert.mockResolvedValue({
      organisationId: 'org-1',
      roleId: 'customer',
      enabled: true,
      captureMode: 'required',
      settings: null,
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
        create: {
          organisationId: 'org-1',
          roleId: 'customer',
          enabled: true,
          captureMode: 'required',
        },
      }),
    );
  });

  it('clears an explicit settings override so template settings can be inherited', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      templateVersion: '1.0.0',
      partyRolePolicies: [],
    });

    await service.updatePolicy('org-1', 'customer', {
      enabled: true,
      captureMode: 'required',
      settings: null,
    });

    expect(prismaMock.organisationPartyRolePolicy.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {
          enabled: true,
          captureMode: 'required',
          settings: Prisma.DbNull,
        },
      }),
    );
  });

  it('rejects a template version that is not registered', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      templateVersion: '9.9.9',
      partyRolePolicies: [],
    });

    await expect(service.getPolicies('org-1')).rejects.toThrow(
      'unavailable business template version: restaurant@9.9.9',
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
