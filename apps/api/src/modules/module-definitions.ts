import { registerModule } from '../platform/modules/module-registry';

let registered = false;

export function registerPlatformModules(): void {
  if (registered) {
    return;
  }

  registerModule({
    id: 'parties',
    name: 'Parties',
    description:
      'Manage persistent people and organisations associated with a business.',
  });

  registerModule({
    id: 'contacts',
    name: 'Contacts',
    description: 'Manage contact methods and addresses for persistent parties.',
    dependencies: ['parties'],
  });

  registerModule({
    id: 'customers',
    name: 'Customers',
    description: 'Manage persistent customer relationships.',
    dependencies: ['parties'],
  });

  registerModule({
    id: 'inventory',
    name: 'Inventory',
    description: 'Track items, stock levels and inventory movements.',
  });

  registerModule({
    id: 'orders',
    name: 'Orders',
    description: 'Create and manage orders.',
  });

  registerModule({
    id: 'payments',
    name: 'Payments',
    description: 'Record and process payments.',
  });

  registerModule({
    id: 'bookings',
    name: 'Bookings',
    description: 'Manage scheduled reservations or appointments.',
  });

  registerModule({
    id: 'memberships',
    name: 'Memberships',
    description: 'Manage recurring memberships and membership status.',
    dependencies: ['parties'],
  });

  registered = true;
}
