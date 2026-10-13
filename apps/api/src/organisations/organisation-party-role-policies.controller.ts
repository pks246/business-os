import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { OrganisationPartyRolePolicyService } from './organisation-party-role-policy.service';
import { UpdatePartyRolePolicyDto } from './dto/update-party-role-policy.dto';

@Controller('organisations/:organisationId/party-role-policies')
export class OrganisationPartyRolePoliciesController {
  constructor(
    private readonly policyService: OrganisationPartyRolePolicyService,
  ) {}

  @Get()
  getPolicies(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
  ) {
    return this.policyService.getPolicies(organisationId);
  }

  @Patch(':roleId')
  updatePolicy(
    @Param('organisationId', new ParseUUIDPipe())
    organisationId: string,
    @Param('roleId')
    roleId: string,
    @Body()
    dto: UpdatePartyRolePolicyDto,
  ) {
    return this.policyService.updatePolicy(organisationId, roleId, dto);
  }
}
