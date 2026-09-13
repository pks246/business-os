import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { OrganisationsService } from './organisations.service';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get()
  findAll() {
    return this.organisationsService.findAll();
  }

  @Get(':id/configuration')
  getConfiguration(@Param('id', new ParseUUIDPipe()) organisationId: string) {
    return this.organisationsService.getConfiguration(organisationId);
  }

  @Post()
  create(@Body() createOrganisationDto: CreateOrganisationDto) {
    return this.organisationsService.create(
      createOrganisationDto.name,
      createOrganisationDto.templateId,
    );
  }
}
