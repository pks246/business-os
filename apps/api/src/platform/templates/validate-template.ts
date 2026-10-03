import { BusinessTemplate } from '../business-template';
import { getModule, hasModule } from '../modules/module-registry';

export function validateModuleConfigurations(
  configurations: Array<{ id: string; enabled: boolean }>,
  context: string,
): void {
  const configuredModuleIds = new Set<string>();

  for (const moduleConfig of configurations) {
    if (configuredModuleIds.has(moduleConfig.id)) {
      throw new Error(
        `${context} contains duplicate module "${moduleConfig.id}"`,
      );
    }

    configuredModuleIds.add(moduleConfig.id);

    if (!hasModule(moduleConfig.id)) {
      throw new Error(
        `${context} references unknown module "${moduleConfig.id}"`,
      );
    }
  }

  for (const moduleConfig of configurations) {
    if (!moduleConfig.enabled) {
      continue;
    }

    const moduleDefinition = getModule(moduleConfig.id);

    for (const dependency of moduleDefinition?.dependencies ?? []) {
      const dependencyConfig = configurations.find(
        (configuredModule) => configuredModule.id === dependency,
      );

      if (!dependencyConfig?.enabled) {
        throw new Error(
          `Module "${moduleConfig.id}" requires enabled module "${dependency}" in ${context}`,
        );
      }
    }
  }
}

export function validateBusinessTemplate(template: BusinessTemplate): void {
  validateModuleConfigurations(template.modules, `Template "${template.id}"`);
}
