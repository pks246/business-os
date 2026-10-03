import { Injectable } from '@nestjs/common';
import { getBusinessTemplates } from './template-registry';

@Injectable()
export class TemplatesService {
  findAll() {
    return getBusinessTemplates();
  }
}
