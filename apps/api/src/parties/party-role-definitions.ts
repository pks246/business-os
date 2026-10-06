import { registerPartyRole } from '../platform/parties/party-role-registry';

let registered = false;

export function registerPlatformPartyRoles(): void {
  if (registered) {
    return;
  }

  registerPartyRole({
    id: 'customer',
    name: 'Customer',
    description: 'A person or business that purchases goods or services.',
    allowsMultipleAssignments: false,
  });

  registerPartyRole({
    id: 'supplier',
    name: 'Supplier',
    description: 'A person or business that supplies goods or services.',
    allowsMultipleAssignments: false,
  });

  registerPartyRole({
    id: 'employee',
    name: 'Employee',
    description: 'A person employed or engaged by the business.',
    allowsMultipleAssignments: true,
  });

  registerPartyRole({
    id: 'member',
    name: 'Member',
    description: 'A person enrolled in a membership or participation program.',
    allowsMultipleAssignments: true,
  });

  registerPartyRole({
    id: 'student',
    name: 'Student',
    description: 'A person enrolled in an educational program.',
    allowsMultipleAssignments: false,
  });

  registerPartyRole({
    id: 'guardian',
    name: 'Guardian',
    description: 'A person responsible for or associated with another person.',
    allowsMultipleAssignments: true,
  });

  registerPartyRole({
    id: 'patient',
    name: 'Patient',
    description: 'A person receiving healthcare services.',
    allowsMultipleAssignments: false,
  });

  registerPartyRole({
    id: 'clinician',
    name: 'Clinician',
    description: 'A person providing healthcare services.',
    allowsMultipleAssignments: true,
  });

  registered = true;
}
