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

export interface Party {
  id: string;
  organisationId: string;
  type: 'PERSON' | 'ORGANISATION';
  displayName: string;
  roleAssignments: PartyRoleAssignment[];
}

export interface PartyRoleAssignment {
  id: string;
  partyId: string;
  roleId: string;
  status: string;
  metadata: Record<string, unknown> | null;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartyRoleDefinition {
  id: string;
  name: string;
  description: string;
  allowsMultipleAssignments: boolean;
  captureMode: 'optional' | 'required';
  settings: Record<string, unknown> | null;
}

export interface PartyContactMethod {
  id: string;
  partyId: string;
  channel: string;
  value: string;
  label: string | null;
  isPrimary: boolean;
  verifiedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartyAddress {
  id: string;
  partyId: string;
  type: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  countryCode: string;
  isPrimary: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}