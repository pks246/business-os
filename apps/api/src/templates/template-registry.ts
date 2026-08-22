import { BusinessTemplate } from '../platform/business-template';
import { gymTemplate } from './gym.template';
import { restaurantTemplate } from './restaurant.template';

const templates: BusinessTemplate[] = [gymTemplate, restaurantTemplate];

export function getBusinessTemplate(id: string): BusinessTemplate | undefined {
  return templates.find((template) => template.id === id);
}

export function getBusinessTemplates(): BusinessTemplate[] {
  return templates;
}
