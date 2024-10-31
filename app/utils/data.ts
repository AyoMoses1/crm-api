export const roleDashboardModules: Record<string, string[]> = {
  super_admin: [
    'Dashboard',
    'Clients',
    'Users',
    'Appointments',
    'Payments',
    'Invoices',
    'Services',
    'Campaigns',
    'Settings',
  ],
  admin: ['Dashboard', 'Clients', 'Appointments', 'Payments', 'Invoices', 'Services', 'Campaigns'],
  manager: ['Dashboard', 'Clients', 'Appointments', 'Payments', 'Invoices', 'Campaigns'],
  sales: ['Dashboard', 'Clients', 'Appointments', 'Invoices', 'Campaigns'],
  user: ['Dashboard', 'Appointments', 'Invoices', 'Payments'],
}
