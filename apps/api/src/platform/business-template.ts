export type ConfigValue =
  string | number | boolean | null | ConfigObject | ConfigValue[];

export interface ConfigObject {
  [key: string]: ConfigValue;
}

export interface TemplateModuleConfig {
  id: string;
  enabled: boolean;
  settings?: ConfigObject;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  modules: TemplateModuleConfig[];
}
