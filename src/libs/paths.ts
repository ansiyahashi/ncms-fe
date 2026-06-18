export const PERMISSIONS = {
  // Permissions catalog
  PERMISSION: 'permissions.view',
  PERMISSION_CREATE: 'permissions.create',
  PERMISSION_VIEW: 'permissions.view',
  PERMISSION_EDIT: 'permissions.update',
  PERMISSION_DELETE: 'permissions.delete',

  // Roles
  ROLE: 'roles.view',
  ROLE_CREATE: 'roles.create',
  ROLE_VIEW: 'roles.view',
  ROLE_EDIT: 'roles.update',
  ROLE_DELETE: 'roles.delete',

  // Users
  USER: 'users.view',
  USER_CREATE: 'users.create',
  USER_VIEW: 'users.view',
  USER_EDIT: 'users.update',
  USER_DELETE: 'users.delete',
  USER_RESET_PASSWORD: 'users.reset_password',
  USER_APPROVE: 'users.approve',

  // Departments
  DEPARTMENT: 'departments.view',
  DEPARTMENT_CREATE: 'departments.create',
  DEPARTMENT_EDIT: 'departments.update',
  DEPARTMENT_DELETE: 'departments.delete',

  // Designations
  DESIGNATION: 'designations.view',
  DESIGNATION_CREATE: 'designations.create',
  DESIGNATION_EDIT: 'designations.update',
  DESIGNATION_DELETE: 'designations.delete',

  // Locations
  LOCATION: 'locations.view',
  LOCATION_CREATE: 'locations.create',
  LOCATION_EDIT: 'locations.update',
  LOCATION_DELETE: 'locations.delete',

  // Businesses
  BUSINESS: 'businesses.view',
  BUSINESS_CREATE: 'businesses.create',
  BUSINESS_EDIT: 'businesses.update',
  BUSINESS_DELETE: 'businesses.delete',

  // User Types
  USER_TYPE: 'user_types.view',
  USER_TYPE_CREATE: 'user_types.create',
  USER_TYPE_EDIT: 'user_types.update',
  USER_TYPE_DELETE: 'user_types.delete',

  // Facility Types
  FACILITY_TYPE: 'facility_types.view',
  FACILITY_TYPE_CREATE: 'facility_types.create',
  FACILITY_TYPE_EDIT: 'facility_types.update',
  FACILITY_TYPE_DELETE: 'facility_types.delete',

  // Owner Types
  OWNER_TYPE: 'owner_types.view',
  OWNER_TYPE_CREATE: 'owner_types.create',
  OWNER_TYPE_EDIT: 'owner_types.update',
  OWNER_TYPE_DELETE: 'owner_types.delete',

  // Cost Centers
  COST_CENTER: 'cost_centers.view',
  COST_CENTER_CREATE: 'cost_centers.create',
  COST_CENTER_EDIT: 'cost_centers.update',
  COST_CENTER_DELETE: 'cost_centers.delete',

  // Facilities
  FACILITY: 'facilities.view',
  FACILITY_CREATE: 'facilities.create',
  FACILITY_EDIT: 'facilities.update',
  FACILITY_DELETE: 'facilities.delete',

  // Buildings
  BUILDING: 'buildings.view',
  BUILDING_CREATE: 'buildings.create',
  BUILDING_EDIT: 'buildings.update',
  BUILDING_DELETE: 'buildings.delete',

  // Floors
  FLOOR: 'floors.view',
  FLOOR_CREATE: 'floors.create',
  FLOOR_EDIT: 'floors.update',
  FLOOR_DELETE: 'floors.delete',

  // Zones
  ZONE: 'zones.view',
  ZONE_CREATE: 'zones.create',
  ZONE_EDIT: 'zones.update',
  ZONE_DELETE: 'zones.delete',

  // Units
  UNIT: 'units.view',
  UNIT_CREATE: 'units.create',
  UNIT_EDIT: 'units.update',
  UNIT_DELETE: 'units.delete',

  // Asset Categories
  ASSET_CATEGORY: 'asset_categories.view',
  ASSET_CATEGORY_CREATE: 'asset_categories.create',
  ASSET_CATEGORY_EDIT: 'asset_categories.update',
  ASSET_CATEGORY_DELETE: 'asset_categories.delete',

  // Clients
  CLIENT: 'clients.view',
  CLIENT_CREATE: 'clients.create',
  CLIENT_EDIT: 'clients.update',
  CLIENT_DELETE: 'clients.delete',

  // Asset Statuses
  ASSET_STATUS: 'asset_statuses.view',
  ASSET_STATUS_CREATE: 'asset_statuses.create',
  ASSET_STATUS_EDIT: 'asset_statuses.update',
  ASSET_STATUS_DELETE: 'asset_statuses.delete',

  // Approvals
  APPROVAL: 'approvals.view',
  APPROVAL_CREATE: 'approvals.create',
  APPROVAL_EDIT: 'approvals.update',
  APPROVAL_DELETE: 'approvals.delete',

  // Notifications
  NOTIFICATION: 'notifications.view',
  NOTIFICATION_CREATE: 'notifications.create',
  NOTIFICATION_EDIT: 'notifications.update',
  NOTIFICATION_DELETE: 'notifications.delete',

  // Assets general permissions
  ASSET: 'facilities.view', // Placeholder permission for general assets until assets model is seeded
  ASSET_CREATE: 'facilities.view',
  MAINTENANCE: 'facilities.view',
  WORK_ORDER: 'facilities.view',
  INVENTORY: 'facilities.view',
  PROPERTY: 'facilities.view',
  UTILITY: 'facilities.view',
  FINANCIAL: 'facilities.view',
  REPORTS: 'facilities.view'
}

export const ROUTE_PERMISSIONS = [
  // Dashboard
  { path: '/home', permission: '' },

  // Users & Access Control
  { path: '/admin-users', permission: PERMISSIONS.USER },
  { path: '/admin-users/add', permission: PERMISSIONS.USER_CREATE },
  { path: '/admin-users/[id]', permission: PERMISSIONS.USER_VIEW },
  { path: '/admin-users/[id]/edit', permission: PERMISSIONS.USER_EDIT },
  { path: '/admin-users/delete', permission: PERMISSIONS.USER_DELETE },

  { path: '/permission', permission: PERMISSIONS.PERMISSION },
  { path: '/permission/add', permission: PERMISSIONS.PERMISSION_CREATE },
  { path: '/permission/[id]', permission: PERMISSIONS.PERMISSION_VIEW },
  { path: '/permission/[id]/edit', permission: PERMISSIONS.PERMISSION_EDIT },
  { path: '/permission/delete', permission: PERMISSIONS.PERMISSION_DELETE },

  { path: '/roles', permission: PERMISSIONS.ROLE },
  { path: '/roles/add', permission: PERMISSIONS.ROLE_CREATE },
  { path: '/roles/[id]', permission: PERMISSIONS.ROLE_VIEW },
  { path: '/roles/[id]/edit', permission: PERMISSIONS.ROLE_EDIT },
  { path: '/roles/delete', permission: PERMISSIONS.ROLE_DELETE },

  // Organization Setup
  { path: '/organization/business', permission: PERMISSIONS.BUSINESS },
  { path: '/organization/business/add', permission: PERMISSIONS.BUSINESS_CREATE },
  { path: '/organization/business/[id]/edit', permission: PERMISSIONS.BUSINESS_EDIT },

  { path: '/organization/client', permission: PERMISSIONS.CLIENT },
  { path: '/organization/client/add', permission: PERMISSIONS.CLIENT_CREATE },
  { path: '/organization/client/[id]/edit', permission: PERMISSIONS.CLIENT_EDIT },

  { path: '/organization/department', permission: PERMISSIONS.DEPARTMENT },
  { path: '/organization/department/add', permission: PERMISSIONS.DEPARTMENT_CREATE },
  { path: '/organization/department/[id]/edit', permission: PERMISSIONS.DEPARTMENT_EDIT },

  { path: '/organization/approvals', permission: PERMISSIONS.APPROVAL },

  // Facility Management
  { path: '/facility/hierarchy', permission: PERMISSIONS.FACILITY },
  { path: '/facility/list', permission: PERMISSIONS.FACILITY },
  { path: '/facility/building', permission: PERMISSIONS.BUILDING },
  { path: '/facility/floor', permission: PERMISSIONS.FLOOR },
  { path: '/facility/zone', permission: PERMISSIONS.ZONE },
  { path: '/facility/unit', permission: PERMISSIONS.UNIT },

  // Master Configuration
  { path: '/master-config', permission: PERMISSIONS.LOCATION },

  // Asset Management
  { path: '/assets/registry', permission: PERMISSIONS.ASSET },
  { path: '/assets/add', permission: PERMISSIONS.ASSET_CREATE },
  { path: '/assets/[id]', permission: PERMISSIONS.ASSET },

  // Preventive Maintenance
  { path: '/maintenance/checklists', permission: PERMISSIONS.MAINTENANCE },
  { path: '/maintenance/schedules', permission: PERMISSIONS.MAINTENANCE },

  // Work Order Management
  { path: '/work-orders', permission: PERMISSIONS.WORK_ORDER },

  // Inventory & Procurement
  { path: '/inventory/requests', permission: PERMISSIONS.INVENTORY },
  { path: '/inventory/stock', permission: PERMISSIONS.INVENTORY },

  // Property Management
  { path: '/property/leases', permission: PERMISSIONS.PROPERTY },
  { path: '/property/tenants', permission: PERMISSIONS.PROPERTY },

  // Utilities Management
  { path: '/utilities/meters', permission: PERMISSIONS.UTILITY },
  { path: '/utilities/readings', permission: PERMISSIONS.UTILITY },

  // Financial Management
  { path: '/financial/costs', permission: PERMISSIONS.FINANCIAL },

  // Reports & Dashboard
  { path: '/dashboard/reports', permission: PERMISSIONS.REPORTS }
]

