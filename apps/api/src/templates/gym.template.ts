import { BusinessTemplate } from '../platform/business-template';

export const gymTemplate: BusinessTemplate = {
  id: 'gym',
  name: 'Gym',

  modules: [
    {
      id: 'customers',
      enabled: true,
    },
    {
      id: 'memberships',
      enabled: true,
    },
    {
      id: 'bookings',
      enabled: true,
    },
    {
      id: 'payments',
      enabled: true,
    },
  ],
};
