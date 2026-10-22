import { BusinessTemplate } from '../platform/business-template';
import { validateBusinessTemplate } from '../platform/templates/validate-template';
import { generalTradingTemplate } from './general-trading.template';
import { gymTemplate } from './gym.template';
import { restaurantTemplate } from './restaurant.template';

const templates: BusinessTemplate[] = [
  generalTradingTemplate,
  gymTemplate,
  restaurantTemplate,
];

const latestTemplateVersions = new Map<string, string>([
  ['general-trading', '1.0.0'],
  ['gym', '1.0.0'],
  ['restaurant', '1.0.0'],
]);

let templatesValidated = false;

/**
 * Called by initialisePlatformRegistries after platform modules and roles
 * have been registered.
 */
export function validateRegisteredBusinessTemplates(): void {
  if (templatesValidated) {
    return;
  }

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

  templatesValidated = true;
}

function assertTemplatesValidated(): void {
  if (!templatesValidated) {
    throw new Error(
      'Business template registry is not initialised. ' +
        'Call initialisePlatformRegistries() before accessing templates.',
    );
  }
}

export function getBusinessTemplate(
  id: string,
  version?: string,
): BusinessTemplate | undefined {
  assertTemplatesValidated();

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
  assertTemplatesValidated();

  const latest: BusinessTemplate[] = [];

  for (const [id, version] of latestTemplateVersions) {
    const template = getBusinessTemplate(id, version);

    if (template) {
      latest.push(template);
    }
  }

  return latest;
}
