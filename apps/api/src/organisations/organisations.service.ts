import { Injectable } from '@nestjs/common';
import { Organisation } from './organisation';

@Injectable()
export class OrganisationsService {
  private organisations: Organisation[] = [];

  findAll(): Organisation[] {
    return this.organisations;
  }

  create(name: string, businessType: string): Organisation {
    const organisation: Organisation = {
      id: crypto.randomUUID(),
      name,
      businessType,
    };

    this.organisations.push(organisation);

    return organisation;
  }
}
