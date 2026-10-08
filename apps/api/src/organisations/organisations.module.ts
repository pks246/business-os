import { Module } from '@nestjs/common';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { OrganisationModuleAccessService } from './organisation-module-access.service';

@Module({
  controllers: [OrganisationsController],
  providers: [OrganisationsService, OrganisationModuleAccessService],
  exports: [OrganisationModuleAccessService],
})
export class OrganisationsModule {}
