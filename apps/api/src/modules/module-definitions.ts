import { registerModule } from '../platform/modules/module-registry';

let registered = false;

export function registerPlatformModules(): void {
  if (registered) {
    return;
  }

  registerModule({
    id: 'customers',
    name: 'Customers',
    description:
      'Manage people or organisations that purchase or use services.',
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
    dependencies: ['customers'],
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
    dependencies: ['customers'],
  });
  registered = true;
}
