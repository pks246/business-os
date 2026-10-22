import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service';
import { OrganisationsService } from './organisations.service';
import { initialisePlatformRegistries } from '../platform/initialise-platform-registries';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let prismaMock: any;
  let transactionMock: any;

  beforeAll(() => {
    initialisePlatformRegistries();
  });

  beforeEach(async () => {
    transactionMock = {
      organisation: { findUnique: jest.fn() },
      organisationModule: { upsert: jest.fn() },
    };

    prismaMock = {
      organisation: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((callback: (transaction: unknown) => unknown) =>
        callback(transactionMock),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<OrganisationsService>(OrganisationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('pins the latest template version without copying defaults into overrides', async () => {
    prismaMock.organisation.create.mockResolvedValue({
      id: 'org-1',
      name: 'Acme Trading',
      templateId: 'general-trading',
      templateVersion: '1.0.0',
      modules: [],
    });

    const result = await service.create('Acme Trading', 'general-trading');

    expect(result.templateVersion).toBe('1.0.0');
    expect(prismaMock.organisation.create).toHaveBeenCalledWith({
      data: {
        name: 'Acme Trading',
        templateId: 'general-trading',
        templateVersion: '1.0.0',
      },
      include: { modules: true },
    });
  });

  it('validates enabled overrides outside the template when changing dependencies', async () => {
    transactionMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'general-trading',
      templateVersion: '1.0.0',
      modules: [
        { moduleId: 'contacts', enabled: false, settings: null },
        { moduleId: 'customers', enabled: false, settings: null },
        { moduleId: 'memberships', enabled: true, settings: null },
      ],
    });

    await expect(
      service.updateModule('org-1', 'parties', { enabled: false }),
    ).rejects.toThrow('Module "memberships" requires enabled module "parties"');

    expect(transactionMock.organisationModule.upsert).not.toHaveBeenCalled();
  });

  it('clears an explicit settings override so template settings can be inherited', async () => {
    transactionMock.organisation.findUnique.mockResolvedValue({
      id: 'org-1',
      templateId: 'general-trading',
      templateVersion: '1.0.0',
      modules: [],
    });
    transactionMock.organisationModule.upsert.mockResolvedValue({});

    await service.updateModule('org-1', 'contacts', { enabled: true, settings: null });

    expect(transactionMock.organisationModule.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { enabled: true, settings: Prisma.DbNull },
      create: { organisationId: 'org-1', moduleId: 'contacts', enabled: true },
    }));
  });
});
