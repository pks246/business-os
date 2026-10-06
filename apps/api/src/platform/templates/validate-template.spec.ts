import { registerPlatformModules } from '../../modules/module-definitions';
import {
  validateBusinessTemplate,
  validateModuleConfigurations,
} from './validate-template';

describe('template validation', () => {
  beforeAll(() => {
    registerPlatformModules();
  });

  it('accepts valid module configurations', () => {
    expect(() =>
      validateModuleConfigurations(
        [
          {
            id: 'customers',
            enabled: true,
          },
          {
            id: 'orders',
            enabled: true,
          },
        ],
        'Test organisation',
      ),
    ).not.toThrow();
  });

  it('rejects duplicate modules', () => {
    expect(() =>
      validateModuleConfigurations(
        [
          {
            id: 'customers',
            enabled: true,
          },
          {
            id: 'customers',
            enabled: true,
          },
        ],
        'Test organisation',
      ),
    ).toThrow();
  });

  it('rejects unknown modules', () => {
    expect(() =>
      validateModuleConfigurations(
        [
          {
            id: 'does-not-exist',
            enabled: true,
          },
        ],
        'Test organisation',
      ),
    ).toThrow();
  });

  it('rejects an enabled module with a disabled dependency', () => {
    expect(() =>
      validateModuleConfigurations(
        [
          {
            id: 'customers',
            enabled: false,
          },
          {
            id: 'orders',
            enabled: true,
          },
        ],
        'Test organisation',
      ),
    ).toThrow();
  });

  it('allows disabled dependent modules', () => {
    expect(() =>
      validateModuleConfigurations(
        [
          {
            id: 'customers',
            enabled: false,
          },
          {
            id: 'orders',
            enabled: false,
          },
        ],
        'Test organisation',
      ),
    ).not.toThrow();
  });

  it('validates complete business templates', () => {
    expect(() =>
      validateBusinessTemplate({
        id: 'test',
        name: 'Test',
        modules: [
          {
            id: 'customers',
            enabled: true,
          },
          {
            id: 'orders',
            enabled: true,
          },
        ],
      }),
    ).not.toThrow();
  });
});
