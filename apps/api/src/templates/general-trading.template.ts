import { BusinessTemplate } from '../platform/business-template';

export const generalTradingTemplate: BusinessTemplate = {
  id: 'general-trading',
  name: 'General Trading',

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
  ],
};
