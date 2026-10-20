export type ConfigValue =
  string | number | boolean | null | ConfigObject | ConfigValue[];

export interface ConfigObject {
  [key: string]: ConfigValue;
}

export interface ModuleConfig {
  id: string;
  enabled: boolean;
  settings?: ConfigObject;
}

export type PartyRoleCaptureMode = 'optional' | 'required';

export interface TemplatePartyRoleConfig {
  roleId: string;
  enabled: boolean;
  captureMode: PartyRoleCaptureMode;
  settings?: ConfigObject;
}

/**
 * A version is an immutable template release, not a tenant-specific setting.
 * When defaults change, add a new version instead of editing an existing one
 * that is already assigned to organisations.
 */
export interface BusinessTemplate {
  id: string;
  version: string;
  name: string;
  modules: ModuleConfig[];
  partyRoles?: TemplatePartyRoleConfig[];
}
