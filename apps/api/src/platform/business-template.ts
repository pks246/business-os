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

export interface BusinessTemplate {
  id: string;
  name: string;
  modules: ModuleConfig[];
  partyRoles?: TemplatePartyRoleConfig[];
}
