import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AssignPartyRoleDto } from './dto/assign-party-role.dto';
import { CreatePartyDto } from './dto/create-party.dto';
import { PartiesService } from './parties.service';

@Controller('organisations/:organisationId/parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  findAll(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
  ) {
    return this.partiesService.findAll(organisationId);
  }

  @Get('available-roles')
  getAvailableRoles() {
    return this.partiesService.getAvailableRoles();
  }

  @Get(':partyId')
  findOne(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,

    @Param('partyId', new ParseUUIDPipe())
    partyId: string,
  ) {
    return this.partiesService.findOne(organisationId, partyId);
  }

  @Post()
  create(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,

    @Body() dto: CreatePartyDto,
  ) {
    return this.partiesService.create(organisationId, dto);
  }

  @Post(':partyId/roles')
  assignRole(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,

    @Param('partyId', new ParseUUIDPipe())
    partyId: string,

    @Body() dto: AssignPartyRoleDto,
  ) {
    return this.partiesService.assignRole(organisationId, partyId, dto);
  }
}
