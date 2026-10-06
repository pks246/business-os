export interface PartyRoleDefinition {
  id: string;
  name: string;
  description: string;

  /**
   * Whether the same party can have multiple assignments
   * for this role within the same business.
   *
   * The core registry describes the rule.
   * Individual modules can later impose more specific rules.
   */
  allowsMultipleAssignments: boolean;
}
