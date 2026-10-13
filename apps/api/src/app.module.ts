import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { TemplatesModule } from './templates/templates.module';
import { PartiesModule } from './parties/parties.module';
import { PartyContactDetailsModule } from './party-contact-details/party-contact-details.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    OrganisationsModule,
    TemplatesModule,
    PartiesModule,
    PartyContactDetailsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
