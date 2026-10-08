import { Module } from '@nestjs/common';
import { OrganisationsModule } from '../organisations/organisations.module';
import { PartyContactDetailsController } from './party-contact-details.controller';
import { PartyContactDetailsService } from './party-contact-details.service';

@Module({
  imports: [OrganisationsModule],
  controllers: [PartyContactDetailsController],
  providers: [PartyContactDetailsService],
})
export class PartyContactDetailsModule {}
