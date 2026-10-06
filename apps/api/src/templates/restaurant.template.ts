import { BusinessTemplate } from '../platform/business-template';

export const restaurantTemplate: BusinessTemplate = {
  id: 'restaurant',
  name: 'Restaurant',

  modules: [
    {
      id: 'customers',
      enabled: true,
    },
    {
      id: 'inventory',
      enabled: true,
    },
    {
      id: 'orders',
      enabled: true,
    },
    {
      id: 'payments',
      enabled: true,
    },
    {
      id: 'bookings',
      enabled: true,
    },
  ],
  partyRoles: [
    {
      roleId: 'customer',
      enabled: true,
      captureMode: 'optional',
    },
    {
      roleId: 'employee',
      enabled: true,
      captureMode: 'optional',
    },
  ],
};
