import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationModuleDto } from './dto/update-organisation-module.dto';
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

  @Get(':id/modules')
  getModules(@Param('id', new ParseUUIDPipe()) organisationId: string) {
    return this.organisationsService.getModules(organisationId);
  }

  @Patch(':id/modules/:moduleId')
  updateModule(
    @Param('id', new ParseUUIDPipe()) organisationId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateOrganisationModuleDto,
  ) {
    return this.organisationsService.updateModule(
      organisationId,
      moduleId,
      dto,
    );
  }

  @Post()
  create(@Body() createOrganisationDto: CreateOrganisationDto) {
    return this.organisationsService.create(
      createOrganisationDto.name,
      createOrganisationDto.templateId,
    );
  }
}
