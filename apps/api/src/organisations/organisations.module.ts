import { Module } from '@nestjs/common';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { OrganisationModuleAccessService } from './organisation-module-access.service';
import { OrganisationPartyRolePolicyService } from './organisation-party-role-policy.service';
import { OrganisationPartyRolePoliciesController } from './organisation-party-role-policies.controller';

@Module({
  controllers: [
    OrganisationsController,
    OrganisationPartyRolePoliciesController,
  ],
  providers: [
    OrganisationsService,
    OrganisationModuleAccessService,
    OrganisationPartyRolePolicyService,
  ],
  exports: [
    OrganisationModuleAccessService,
    OrganisationPartyRolePolicyService,
  ],
})
export class OrganisationsModule {}
