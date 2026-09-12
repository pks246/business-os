export interface TemplateModuleConfig {
  id: string;
  enabled: boolean;

  settings?: Record<string, unknown>;
}

export interface BusinessTemplate {
  id: string;
  name: string;

  modules: TemplateModuleConfig[];
}
