import {
  BusinessTemplate,
  TemplatePartyRoleConfig,
} from '../business-template';
import { getModule, hasModule } from '../modules/module-registry';
import { hasPartyRole, getPartyRole } from '../parties/party-role-registry';

const STABLE_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

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

export function validatePartyRoleConfigurations(
  configurations: TemplatePartyRoleConfig[],
  context: string,
): void {
  const configuredRoleIds = new Set<string>();

  for (const roleConfig of configurations) {
    if (configuredRoleIds.has(roleConfig.roleId)) {
      throw new Error(
        `${context} contains duplicate party role "${roleConfig.roleId}"`,
      );
    }

    configuredRoleIds.add(roleConfig.roleId);

    if (!hasPartyRole(roleConfig.roleId)) {
      throw new Error(
        `${context} references unknown party role "${roleConfig.roleId}"`,
      );
    }

    getPartyRole(roleConfig.roleId);
  }
}

export function validateBusinessTemplate(template: BusinessTemplate): void {
  if (!template.id.trim()) {
    throw new Error('Business template id must not be empty');
  }

  if (!STABLE_VERSION_PATTERN.test(template.version)) {
    throw new Error(
      `Template "${template.id}" must use a stable semantic version (major.minor.patch)`,
    );
  }

  validateModuleConfigurations(template.modules, `Template "${template.id}@${template.version}"`);
  validatePartyRoleConfigurations(
    template.partyRoles ?? [],
    `Template "${template.id}@${template.version}"`,
  );
}
