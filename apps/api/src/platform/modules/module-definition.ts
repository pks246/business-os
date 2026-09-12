export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;

  dependencies?: string[];
}
