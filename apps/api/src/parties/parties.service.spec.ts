import { PartiesService } from './parties.service';
import { PrismaService } from '../database/prisma.service';
import { PartyType } from '../generated/prisma/enums.js';
import { OrganisationModuleAccessService } from '../organisations/organisation-module-access.service';
import { NotFoundException } from '@nestjs/common';

describe('PartiesService', () => {
  let service: PartiesService;

  const prismaMock = {
    organisation: {
      findUnique: jest.fn(),
    },

    party: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },

    partyRoleAssignment: {
      create: jest.fn(),
    },
  };

  const moduleAccessMock = {
    ensureModuleEnabled: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    moduleAccessMock.ensureModuleEnabled.mockResolvedValue({
      enabled: true,
      settings: null,
      source: 'template',
      templateId: 'restaurant',
    });
    service = new PartiesService(
      prismaMock as unknown as PrismaService,
      moduleAccessMock as unknown as OrganisationModuleAccessService,
    );
  });

  describe('findAll', () => {
    it('scopes parties to the organisation', async () => {
      const parties = [
        {
          id: 'party-1',
          organisationId: 'org-1',
          type: PartyType.PERSON,
          displayName: 'John',
        },
      ];

      prismaMock.organisation.findUnique.mockResolvedValue({
        id: 'org-1',
      });

      prismaMock.party.findMany.mockResolvedValue(parties);

      const result = await service.findAll('org-1');

      expect(result).toEqual(parties);

      expect(prismaMock.party.findMany).toHaveBeenCalledWith({
        where: {
          organisationId: 'org-1',
        },
        include: {
          roleAssignments: true,
        },
        orderBy: {
          displayName: 'asc',
        },
      });
    });
  });

  describe('create', () => {
    it('creates a party inside the correct organisation', async () => {
      prismaMock.organisation.findUnique.mockResolvedValue({
        id: 'org-1',
      });

      const createdParty = {
        id: 'party-1',
        organisationId: 'org-1',
        type: PartyType.PERSON,
        displayName: 'John',
        roleAssignments: [],
      };

      prismaMock.party.create.mockResolvedValue(createdParty);

      const result = await service.create('org-1', {
        type: PartyType.PERSON,
        displayName: 'John',
      });

      expect(result).toEqual(createdParty);
      expect(moduleAccessMock.ensureModuleEnabled).toHaveBeenCalledWith(
        'org-1',
        'parties',
      );

      expect(prismaMock.party.create).toHaveBeenCalledWith({
        data: {
          organisationId: 'org-1',
          type: PartyType.PERSON,
          displayName: 'John',
        },
        include: {
          roleAssignments: true,
        },
      });
    });

    it('rejects creation for an unknown organisation', async () => {
      moduleAccessMock.ensureModuleEnabled.mockRejectedValueOnce(
        new NotFoundException('Organisation not found'),
      );

      await expect(
        service.create('unknown-org', {
          type: PartyType.PERSON,
          displayName: 'John',
        }),
      ).rejects.toThrow('Organisation not found');
    });
  });

  describe('getAvailableRoles', () => {
    it('returns roles enabled by the organisation template', async () => {
      prismaMock.organisation.findUnique.mockResolvedValue({
        id: 'org-1',
        templateId: 'restaurant',
      });

      const result = await service.getAvailableRoles('org-1');

      expect(result.map((role) => role.id)).toContain('customer');

      expect(result.map((role) => role.id)).toContain('employee');

      expect(result.map((role) => role.id)).not.toContain('patient');
    });
  });

  describe('assignRole', () => {
    it('assigns an enabled role to a party', async () => {
      prismaMock.organisation.findUnique.mockResolvedValue({
        id: 'org-1',
        templateId: 'restaurant',
      });

      prismaMock.party.findFirst.mockResolvedValue({
        id: 'party-1',
        organisationId: 'org-1',
      });

      const assignment = {
        id: 'assignment-1',
        partyId: 'party-1',
        roleId: 'customer',
        status: 'active',
      };

      prismaMock.partyRoleAssignment.create.mockResolvedValue(assignment);

      const result = await service.assignRole('org-1', 'party-1', {
        roleId: 'customer',
      });

      expect(result).toEqual(assignment);
      expect(moduleAccessMock.ensureModuleEnabled).toHaveBeenCalledWith(
        'org-1',
        'parties',
      );

      expect(prismaMock.partyRoleAssignment.create).toHaveBeenCalled();
    });

    it('rejects an unknown role', async () => {
      await expect(
        service.assignRole('org-1', 'party-1', {
          roleId: 'does-not-exist',
        }),
      ).rejects.toThrow('Unknown party role');
    });

    it('rejects a role not enabled for the organisation', async () => {
      prismaMock.organisation.findUnique.mockResolvedValue({
        id: 'org-1',
        templateId: 'restaurant',
      });

      prismaMock.party.findFirst.mockResolvedValue({
        id: 'party-1',
        organisationId: 'org-1',
      });

      await expect(
        service.assignRole('org-1', 'party-1', {
          roleId: 'patient',
        }),
      ).rejects.toThrow('is not enabled for this organisation');
    });
  });
});
