import { ModuleDefinition } from './module-definition';

const modules = new Map<string, ModuleDefinition>();

export function registerModule(definition: ModuleDefinition): void {
  if (modules.has(definition.id)) {
    throw new Error(`Module already registered: ${definition.id}`);
  }

  modules.set(definition.id, definition);
}

export function getModule(id: string): ModuleDefinition | undefined {
  return modules.get(id);
}

export function getModules(): ModuleDefinition[] {
  return Array.from(modules.values());
}

export function hasModule(id: string): boolean {
  return modules.has(id);
}
