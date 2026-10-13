import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateContactMethodDto } from './dto/create-contact-method.dto';
import { CreatePartyAddressDto } from './dto/create-party-address.dto';
import { PartyContactDetailsService } from './party-contact-details.service';

@Controller('organisations/:organisationId/parties/:partyId')
export class PartyContactDetailsController {
  constructor(private readonly service: PartyContactDetailsService) {}

  @Get('contact-methods')
  listContactMethods(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
    @Param('partyId', new ParseUUIDPipe())
    partyId: string,
  ) {
    return this.service.listContactMethods(organisationId, partyId);
  }

  @Post('contact-methods')
  createContactMethod(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
    @Param('partyId', new ParseUUIDPipe())
    partyId: string,
    @Body() dto: CreateContactMethodDto,
  ) {
    return this.service.createContactMethod(organisationId, partyId, dto);
  }

  @Delete('contact-methods/:contactMethodId')
  removeContactMethod(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
    @Param('partyId', new ParseUUIDPipe())
    partyId: string,
    @Param('contactMethodId', new ParseUUIDPipe())
    contactMethodId: string,
  ) {
    return this.service.removeContactMethod(
      organisationId,
      partyId,
      contactMethodId,
    );
  }

  @Get('addresses')
  listAddresses(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
    @Param('partyId', new ParseUUIDPipe())
    partyId: string,
  ) {
    return this.service.listAddresses(organisationId, partyId);
  }

  @Post('addresses')
  createAddress(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
    @Param('partyId', new ParseUUIDPipe())
    partyId: string,
    @Body() dto: CreatePartyAddressDto,
  ) {
    return this.service.createAddress(organisationId, partyId, dto);
  }

  @Delete('addresses/:addressId')
  removeAddress(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
    @Param('partyId', new ParseUUIDPipe())
    partyId: string,
    @Param('addressId', new ParseUUIDPipe())
    addressId: string,
  ) {
    return this.service.removeAddress(organisationId, partyId, addressId);
  }
}
