import { BusinessTemplate } from '../platform/business-template';

export const gymTemplate: BusinessTemplate = {
  id: 'gym',
  name: 'Gym',

  modules: ['customers', 'memberships', 'bookings', 'payments'],
};
