import { Injectable } from '@nestjs/common';
import { Organisation } from './organisation';
import { getBusinessTemplate } from '../templates/template-registry';

@Injectable()
export class OrganisationsService {
  private organisations: Organisation[] = [];

  findAll(): Organisation[] {
    return this.organisations;
  }

  create(name: string, templateId: string): Organisation {
    const template = getBusinessTemplate(templateId);

    if (!template) {
      throw new Error('Unknown business template');
    }

    const organisation: Organisation = {
      id: crypto.randomUUID(),
      name,
      templateId,
    };

    this.organisations.push(organisation);

    return organisation;
  }
}
