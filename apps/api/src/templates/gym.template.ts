import { BusinessTemplate } from '../platform/business-template';

export const gymTemplate: BusinessTemplate = {
  id: 'gym',
  name: 'Gym',

  modules: [
    {
      id: 'parties',
      enabled: true,
    },
    {
      id: 'contacts',
      enabled: true,
    },
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

  partyRoles: [
    {
      roleId: 'customer',
      enabled: true,
      captureMode: 'optional',
    },
    {
      roleId: 'member',
      enabled: true,
      captureMode: 'required',
    },
  ],
};
