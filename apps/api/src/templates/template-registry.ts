import { BusinessTemplate } from '../platform/business-template';
import { validateBusinessTemplate } from '../platform/templates/validate-template';
import { registerPlatformModules } from '../modules/module-definitions';
import { generalTradingTemplate } from './general-trading.template';
import { gymTemplate } from './gym.template';
import { restaurantTemplate } from './restaurant.template';
import { registerPlatformPartyRoles } from '../parties/party-role-definitions';

// Registry initialisation remains explicit for now. Removing module/role
// registration side effects is a separate maintenance step.
registerPlatformModules();
registerPlatformPartyRoles();

/**
 * Keep every released template version here. Do not edit an existing released
 * version after organisations have been pinned to it; add a new versioned
 * definition and update latestTemplateVersions instead.
 */
const templates: BusinessTemplate[] = [
  gymTemplate,
  restaurantTemplate,
  generalTradingTemplate,
];

const latestTemplateVersions = new Map<string, string>([
  ['gym', '1.0.0'],
  ['restaurant', '1.0.0'],
  ['general-trading', '1.0.0'],
]);

const templateVersionKeys = new Set<string>();
for (const template of templates) {
  const key = `${template.id}@${template.version}`;
  if (templateVersionKeys.has(key)) {
    throw new Error(`Duplicate business template version: ${key}`);
  }
  templateVersionKeys.add(key);
  validateBusinessTemplate(template);
}

for (const [templateId, version] of latestTemplateVersions) {
  if (!templateVersionKeys.has(`${templateId}@${version}`)) {
    throw new Error(
      `Latest template version is not registered: ${templateId}@${version}`,
    );
  }
}

export function getBusinessTemplate(
  id: string,
  version?: string,
): BusinessTemplate | undefined {
  const targetVersion = version ?? latestTemplateVersions.get(id);
  if (!targetVersion) {
    return undefined;
  }

  return templates.find(
    (template) => template.id === id && template.version === targetVersion,
  );
}

/** Returns one current/latest version for each template family. */
export function getBusinessTemplates(): BusinessTemplate[] {
  const latest: BusinessTemplate[] = [];

  for (const [id, version] of latestTemplateVersions) {
    const template = getBusinessTemplate(id, version);
    if (template) {
      latest.push(template);
    }
  }

  return latest;
}
