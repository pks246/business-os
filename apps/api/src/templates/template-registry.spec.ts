import { getBusinessTemplate, getBusinessTemplates } from './template-registry';
import { initialisePlatformRegistries } from '../platform/initialise-platform-registries';

describe('business template registry', () => {
  beforeAll(() => initialisePlatformRegistries());
  it('returns current templates with explicit versions', () => {
    const templates = getBusinessTemplates();
    expect(templates[0]?.id).toBe('general-trading');
    expect(templates.length).toBeGreaterThan(0);
    expect(
      templates.every((template) => /^\d+\.\d+\.\d+$/.test(template.version)),
    ).toBe(true);
    expect(getBusinessTemplate('general-trading')?.version).toBe('1.0.0');
  });

  it('returns a specifically pinned template version only when it exists', () => {
    expect(getBusinessTemplate('general-trading', '1.0.0')?.id).toBe(
      'general-trading',
    );
    expect(getBusinessTemplate('general-trading', '9.9.9')).toBeUndefined();
  });

  it('does not resolve an unknown template family to another template', () => {
    expect(getBusinessTemplate('not-a-template')).toBeUndefined();
  });
});
