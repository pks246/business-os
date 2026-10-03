import { BusinessTemplate } from '../platform/business-template';
import { validateBusinessTemplate } from '../platform/templates/validate-template';
import { registerPlatformModules } from '../modules/module-definitions';
import { generalTradingTemplate } from './general-trading.template';
import { gymTemplate } from './gym.template';
import { restaurantTemplate } from './restaurant.template';

registerPlatformModules();

const templates: BusinessTemplate[] = [
  gymTemplate,
  restaurantTemplate,
  generalTradingTemplate,
];

for (const template of templates) {
  validateBusinessTemplate(template);
}

export function getBusinessTemplate(id: string): BusinessTemplate | undefined {
  return templates.find((template) => template.id === id);
}

export function getBusinessTemplates(): BusinessTemplate[] {
  return templates;
}
