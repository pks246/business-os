import { describe, expect, it, beforeEach, jest } from '@jest/globals';

import { OrganisationModuleAccessService } from './organisation-module-access.service';
import { PrismaService } from '../database/prisma.service';

describe('OrganisationModuleAccessService', () => {
  let service: OrganisationModuleAccessService;

  type OrganisationWithModules = {
    id: string;
    templateId: string;
    modules: {
      moduleId: string;
      enabled: boolean;
      settings: Record<string, unknown> | null;
    }[];
  };

  const findUnique = jest.fn<() => Promise<OrganisationWithModules | null>>();

  const prismaMock = {
    organisation: {
      findUnique,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new OrganisationModuleAccessService(
      prismaMock as unknown as PrismaService,
    );
  });

  it('uses template configuration when organisation has no override', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      modules: [],
    });

    const result = await service.getModuleConfiguration('org-1', 'orders');

    expect(result).toEqual({
      enabled: true,
      settings: null,
      source: 'template',
      templateId: 'restaurant',
    });
  });

  it('uses organisation configuration when an override exists', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      modules: [
        {
          moduleId: 'orders',
          enabled: false,
          settings: {},
        },
      ],
    });

    const result = await service.getModuleConfiguration('org-1', 'orders');

    expect(result).toEqual({
      enabled: false,
      settings: {},
      source: 'organisation',
      templateId: 'restaurant',
    });
  });

  it('rejects disabled modules', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'restaurant',
      modules: [
        {
          moduleId: 'contacts',
          enabled: false,
          settings: {},
        },
      ],
    });

    await expect(
      service.ensureModuleEnabled('org-1', 'contacts'),
    ).rejects.toThrow('Module "contacts" is disabled');
  });

  it('rejects unknown organisations', async () => {
    prismaMock.organisation.findUnique.mockResolvedValue(null);

    await expect(
      service.ensureModuleEnabled('missing-org', 'contacts'),
    ).rejects.toThrow('Organisation not found');
  });
});
