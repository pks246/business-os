export interface Organisation {
  id: string;
  name: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  modules: TemplateModuleConfig[];
}

export interface TemplateModuleConfig {
  id: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
}

export interface OrganisationModule {
  id: string;
  organisationId: string;
  moduleId: string;
  enabled: boolean;
  settings: Record<string, unknown> | null;
}

export interface AvailableOrganisationModule {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  configured: boolean;
  enabled: boolean;
  settings: Record<string, unknown> | null;
}