import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { PrismaService } from '../database/prisma.service';
import { OrganisationModuleAccessService } from '../organisations/organisation-module-access.service';
import { PartyContactDetailsService } from './party-contact-details.service';

const asyncMock = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

describe('PartyContactDetailsService', () => {
  let service: PartyContactDetailsService;

  const prismaMock = {
    party: {
      findFirst: asyncMock(),
    },

    partyContactMethod: {
      findMany: asyncMock(),
      create: asyncMock(),
      findFirst: asyncMock(),
      delete: asyncMock(),
    },

    partyAddress: {
      findMany: asyncMock(),
      create: asyncMock(),
      findFirst: asyncMock(),
      delete: asyncMock(),
    },
  };

  const moduleAccessMock = {
    ensureModuleEnabled: asyncMock(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    moduleAccessMock.ensureModuleEnabled.mockResolvedValue({
      enabled: true,
      settings: null,
      source: 'template',
    });

    prismaMock.party.findFirst.mockResolvedValue({
      id: 'party-1',
      organisationId: 'org-1',
    });

    service = new PartyContactDetailsService(
      prismaMock as unknown as PrismaService,
      moduleAccessMock as unknown as OrganisationModuleAccessService,
    );
  });

  it('lists contact methods scoped to the party', async () => {
    const contacts = [
      {
        id: 'contact-1',
        partyId: 'party-1',
        channel: 'email',
        value: 'test@example.com',
      },
    ];

    prismaMock.partyContactMethod.findMany.mockResolvedValue(contacts);

    const result = await service.listContactMethods('org-1', 'party-1');

    expect(result).toEqual(contacts);

    expect(prismaMock.partyContactMethod.findMany).toHaveBeenCalledWith({
      where: {
        partyId: 'party-1',
      },
      orderBy: [
        {
          isPrimary: 'desc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  });

  it('creates a contact method only after capability and party checks', async () => {
    const created = {
      id: 'contact-1',
      partyId: 'party-1',
      channel: 'email',
      value: 'test@example.com',
    };

    prismaMock.partyContactMethod.create.mockResolvedValue(created);

    const result = await service.createContactMethod('org-1', 'party-1', {
      channel: 'email',
      value: 'test@example.com',
    });

    expect(result).toEqual(created);

    expect(moduleAccessMock.ensureModuleEnabled).toHaveBeenCalledWith(
      'org-1',
      'contacts',
    );

    expect(prismaMock.partyContactMethod.create).toHaveBeenCalled();
  });

  it('rejects a party that belongs to another organisation', async () => {
    prismaMock.party.findFirst.mockResolvedValue(null);

    await expect(
      service.listContactMethods('org-1', 'party-1'),
    ).rejects.toThrow('Party not found');
  });

  it('removes a contact method scoped to the party', async () => {
    prismaMock.partyContactMethod.findFirst.mockResolvedValue({
      id: 'contact-1',
      partyId: 'party-1',
    });

    prismaMock.partyContactMethod.delete.mockResolvedValue({
      id: 'contact-1',
    });

    await service.removeContactMethod('org-1', 'party-1', 'contact-1');

    expect(prismaMock.partyContactMethod.delete).toHaveBeenCalledWith({
      where: {
        id: 'contact-1',
      },
    });
  });
});
