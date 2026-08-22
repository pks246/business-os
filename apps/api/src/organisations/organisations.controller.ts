import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get()
  findAll() {
    return this.organisationsService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      templateId: string;
    },
  ) {
    return this.organisationsService.create(body.name, body.templateId);
  }
}
