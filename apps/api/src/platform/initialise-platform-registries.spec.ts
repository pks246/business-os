import { getModules } from './modules/module-registry';
import { getPartyRoles } from './parties/party-role-registry';
import { initialisePlatformRegistries } from './initialise-platform-registries';
import {
  getBusinessTemplate,
  getBusinessTemplates,
} from '../templates/template-registry';

describe('platform registry initialisation', () => {
  it('initialises registries explicitly and idempotently', () => {
    // Importing the template registry must not register or validate templates.
    expect(getModules()).toEqual([]);
    expect(getPartyRoles()).toEqual([]);

    expect(() => getBusinessTemplate('general-trading')).toThrow(
      'Call initialisePlatformRegistries() before accessing templates.',
    );

    initialisePlatformRegistries();

    expect(getModules().map((module) => module.id)).toEqual([
      'parties',
      'contacts',
      'customers',
      'inventory',
      'orders',
      'payments',
      'bookings',
      'memberships',
    ]);

    expect(getPartyRoles().map((role) => role.id)).toEqual([
      'customer',
      'supplier',
      'employee',
      'member',
      'student',
      'guardian',
      'patient',
      'clinician',
    ]);

    expect(getBusinessTemplates()[0]?.id).toBe('general-trading');

    const modulesBeforeSecondCall = getModules();
    const rolesBeforeSecondCall = getPartyRoles();

    expect(() => initialisePlatformRegistries()).not.toThrow();
    expect(getModules()).toEqual(modulesBeforeSecondCall);
    expect(getPartyRoles()).toEqual(rolesBeforeSecondCall);
  });
});
