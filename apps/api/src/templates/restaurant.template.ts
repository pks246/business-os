import { BusinessTemplate } from '../platform/business-template';

export const restaurantTemplate: BusinessTemplate = {
  id: 'restaurant',
  name: 'Restaurant',

  modules: ['customers', 'orders', 'payments', 'tables', 'menu'],
};
