import { PartyRoleDefinition } from './party-role-definition';

const roles = new Map<string, PartyRoleDefinition>();

export function registerPartyRole(definition: PartyRoleDefinition): void {
  if (roles.has(definition.id)) {
    throw new Error(`Party role already registered: ${definition.id}`);
  }

  roles.set(definition.id, definition);
}

export function getPartyRole(id: string): PartyRoleDefinition | undefined {
  return roles.get(id);
}

export function getPartyRoles(): PartyRoleDefinition[] {
  return Array.from(roles.values());
}

export function hasPartyRole(id: string): boolean {
  return roles.has(id);
}
