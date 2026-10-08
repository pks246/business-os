import { BusinessTemplate } from '../platform/business-template';

export const generalTradingTemplate: BusinessTemplate = {
  id: 'general-trading',
  name: 'General Trading',

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

  partyRoles: [
    {
      roleId: 'customer',
      enabled: true,
      captureMode: 'required',
    },
    {
      roleId: 'supplier',
      enabled: true,
      captureMode: 'required',
    },
    {
      roleId: 'employee',
      enabled: true,
      captureMode: 'optional',
    },
  ],
};
