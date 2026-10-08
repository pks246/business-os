import { Module } from '@nestjs/common';
import { OrganisationsModule } from '../organisations/organisations.module';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';

@Module({
  imports: [OrganisationsModule],
  controllers: [PartiesController],
  providers: [PartiesService],
})
export class PartiesModule {}
