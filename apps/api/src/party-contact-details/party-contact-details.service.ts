import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service';
import { OrganisationModuleAccessService } from '../organisations/organisation-module-access.service';
import { CreateContactMethodDto } from './dto/create-contact-method.dto';
import { CreatePartyAddressDto } from './dto/create-party-address.dto';

@Injectable()
export class PartyContactDetailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleAccess: OrganisationModuleAccessService,
  ) {}

  async listContactMethods(organisationId: string, partyId: string) {
    await this.ensureContactsAvailable(organisationId, partyId);

    return this.prisma.partyContactMethod.findMany({
      where: {
        partyId,
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
  }

  async createContactMethod(
    organisationId: string,
    partyId: string,
    dto: CreateContactMethodDto,
  ) {
    await this.ensureContactsAvailable(organisationId, partyId);

    return this.prisma.partyContactMethod.create({
      data: {
        partyId,
        channel: dto.channel,
        value: dto.value,
        label: dto.label,
        isPrimary: dto.isPrimary ?? false,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async removeContactMethod(
    organisationId: string,
    partyId: string,
    contactMethodId: string,
  ) {
    await this.ensureContactsAvailable(organisationId, partyId);

    const contactMethod = await this.prisma.partyContactMethod.findFirst({
      where: {
        id: contactMethodId,
        partyId,
      },
    });

    if (!contactMethod) {
      throw new NotFoundException(
        `Contact method not found: ${contactMethodId}`,
      );
    }

    return this.prisma.partyContactMethod.delete({
      where: {
        id: contactMethodId,
      },
    });
  }

  async listAddresses(organisationId: string, partyId: string) {
    await this.ensureContactsAvailable(organisationId, partyId);

    return this.prisma.partyAddress.findMany({
      where: {
        partyId,
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
  }

  async createAddress(
    organisationId: string,
    partyId: string,
    dto: CreatePartyAddressDto,
  ) {
    await this.ensureContactsAvailable(organisationId, partyId);

    return this.prisma.partyAddress.create({
      data: {
        partyId,
        type: dto.type,
        label: dto.label,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        countryCode: dto.countryCode.toUpperCase(),
        isPrimary: dto.isPrimary ?? false,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async removeAddress(
    organisationId: string,
    partyId: string,
    addressId: string,
  ) {
    await this.ensureContactsAvailable(organisationId, partyId);

    const address = await this.prisma.partyAddress.findFirst({
      where: {
        id: addressId,
        partyId,
      },
    });

    if (!address) {
      throw new NotFoundException(`Address not found: ${addressId}`);
    }

    return this.prisma.partyAddress.delete({
      where: {
        id: addressId,
      },
    });
  }

  private async ensureContactsAvailable(
    organisationId: string,
    partyId: string,
  ) {
    await this.moduleAccess.ensureModuleEnabled(organisationId, 'contacts');

    const party = await this.prisma.party.findFirst({
      where: {
        id: partyId,
        organisationId,
      },
    });

    if (!party) {
      throw new NotFoundException(`Party not found: ${partyId}`);
    }

    return party;
  }
}
