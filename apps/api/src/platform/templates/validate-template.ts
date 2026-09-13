import { BusinessTemplate } from '../business-template';
import { getModule, hasModule } from '../modules/module-registry';

export function validateBusinessTemplate(template: BusinessTemplate): void {
  const configuredModuleIds = new Set<string>();

  for (const moduleConfig of template.modules) {
    if (configuredModuleIds.has(moduleConfig.id)) {
      throw new Error(
        `Template "${template.id}" contains duplicate module "${moduleConfig.id}"`,
      );
    }

    configuredModuleIds.add(moduleConfig.id);

    if (!hasModule(moduleConfig.id)) {
      throw new Error(
        `Template "${template.id}" references unknown module "${moduleConfig.id}"`,
      );
    }
  }

  for (const moduleConfig of template.modules) {
    if (!moduleConfig.enabled) {
      continue;
    }

    const moduleDefinition = getModule(moduleConfig.id);

    for (const dependency of moduleDefinition?.dependencies ?? []) {
      const dependencyConfig = template.modules.find(
        (configuredModule) => configuredModule.id === dependency,
      );

      if (!dependencyConfig?.enabled) {
        throw new Error(
          `Module "${moduleConfig.id}" requires enabled module "${dependency}" in template "${template.id}"`,
        );
      }
    }
  }
}
