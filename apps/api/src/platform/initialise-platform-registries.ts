import { registerPlatformModules } from '../modules/module-definitions';
import { registerPlatformPartyRoles } from '../parties/party-role-definitions';
import { validateRegisteredBusinessTemplates } from '../templates/template-registry';

let initialised = false;

/**
 * Registers platform definitions and validates all registered templates.
 * Safe to call more than once during the same application lifecycle.
 */
export function initialisePlatformRegistries(): void {
  if (initialised) {
    return;
  }

  registerPlatformModules();
  registerPlatformPartyRoles();
  validateRegisteredBusinessTemplates();

  initialised = true;
}
