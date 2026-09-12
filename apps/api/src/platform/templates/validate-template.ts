import { BusinessTemplate } from '../business-template';
import { hasModule } from '../modules/module-registry';

export function validateBusinessTemplate(template: BusinessTemplate): void {
  for (const moduleConfig of template.modules) {
    if (!hasModule(moduleConfig.id)) {
      throw new Error(
        `Template "${template.id}" references unknown module "${moduleConfig.id}"`,
      );
    }
  }
}
