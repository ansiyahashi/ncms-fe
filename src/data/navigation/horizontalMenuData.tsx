import { PERMISSIONS } from '@/libs/paths'

// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'ri-home-smile-line'
  },

  // {
  //   label: 'Dashboard',
  //   href: '/dashboard/reports',
  //   icon: 'ri-bar-chart-2-line',
  //   permission: PERMISSIONS.REPORTS
  // },
  {
    label: 'Access Control',
    icon: 'ri-shield-keyhole-line',
    children: [
      {
        label: 'Roles',
        href: '/roles',
        icon: 'ri-account-box-line',
        permission: PERMISSIONS.ROLE
      },
      {
        label: 'Users',
        href: '/users',
        icon: 'ri-user-line',
        permission: PERMISSIONS.USER
      },
      {
        label: 'Permissions',
        href: '/permission',
        icon: 'ri-shield-keyhole-line',
        permission: PERMISSIONS.PERMISSION
      }
    ]
  },
  {
    label: 'Organization',
    icon: 'ri-building-line',
    children: [
      {
        label: 'Business Profile',
        href: '/organization/business',
        icon: 'ri-building-line',
        permission: PERMISSIONS.BUSINESS
      },
      {
        label: 'Clients',
        href: '/organization/client',
        icon: 'ri-briefcase-line',
        permission: PERMISSIONS.CLIENT
      },
      {
        label: 'Departments',
        href: '/master-config/departments',
        icon: 'ri-community-line',
        permission: PERMISSIONS.DEPARTMENT
      },
      {
        label: 'Designations',
        href: '/master-config/designations',
        icon: 'ri-briefcase-line',
        permission: PERMISSIONS.DESIGNATION
      },
      {
        label: 'Approval Workflows',
        href: '/organization/approvals',
        icon: 'ri-check-double-line',
        permission: PERMISSIONS.APPROVAL
      }
    ]
  },
  {
    label: 'Facilities & Config',
    icon: 'ri-map-pin-2-line',
    children: [
      {
        label: 'Facility Hierarchy',
        href: '/facility/hierarchy',
        icon: 'ri-map-pin-2-line',
        permission: PERMISSIONS.FACILITY
      },
      {
        label: 'Master Config',
        href: '/master-config',
        icon: 'ri-settings-4-line',
        permission: PERMISSIONS.LOCATION
      }
    ]
  }

  // {
  //   label: 'Assets & PM',
  //   icon: 'ri-tools-line',
  //   children: [
  //     {
  //       label: 'Asset Registry',
  //       href: '/assets/registry',
  //       icon: 'ri-tools-line',
  //       permission: PERMISSIONS.ASSET
  //     },
  //     {
  //       label: 'PM Schedules',
  //       href: '/maintenance/schedules',
  //       icon: 'ri-calendar-todo-line',
  //       permission: PERMISSIONS.MAINTENANCE
  //     },
  //     {
  //       label: 'Work Orders',
  //       href: '/work-orders',
  //       icon: 'ri-task-line',
  //       permission: PERMISSIONS.WORK_ORDER
  //     }
  //   ]
  // },
  // {
  //   label: 'Commercials & Logs',
  //   icon: 'ri-home-8-line',
  //   children: [
  //     {
  //       label: 'Property Leases',
  //       href: '/property/leases',
  //       icon: 'ri-home-8-line',
  //       permission: PERMISSIONS.PROPERTY
  //     },
  //     {
  //       label: 'Utility Readings',
  //       href: '/utilities/readings',
  //       icon: 'ri-water-flash-line',
  //       permission: PERMISSIONS.UTILITY
  //     },
  //     {
  //       label: 'Financial Costs',
  //       href: '/financial/costs',
  //       icon: 'ri-money-dollar-circle-line',
  //       permission: PERMISSIONS.FINANCIAL
  //     },
  //     {
  //       label: 'Inventory & Stock',
  //       href: '/inventory/stock',
  //       icon: 'ri-archive-line',
  //       permission: PERMISSIONS.INVENTORY
  //     }
  //   ]
  // }
]

export default horizontalMenuData
