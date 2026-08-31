import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { OrganisationsService } from './organisations.service';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get()
  findAll() {
    return this.organisationsService.findAll();
  }

  @Post()
  create(@Body() createOrganisationDto: CreateOrganisationDto) {
    return this.organisationsService.create(
      createOrganisationDto.name,
      createOrganisationDto.templateId,
    );
  }
}
