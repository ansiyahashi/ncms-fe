'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import FacilitiesList from './FacilitiesList'

interface FacilityHierarchyViewsProps {
  activeView: string
  viewData: any[]
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
  }
  perPageCount: number
  pageCount: number
  loading: boolean
  businessesData?: any[]
  isSuperAdmin?: boolean
}

const FacilityHierarchyViews = ({
  viewData,
  pagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  isSuperAdmin = false
}: FacilityHierarchyViewsProps) => {
  return (
    <Box className='flex flex-col gap-6 w-full'>
      {/* Page Header */}
      <Box className='flex flex-col gap-1'>
        <Typography variant='h4' className='font-bold tracking-tight text-textPrimary'>
          Facilities
        </Typography>
        <Typography variant='body2' className='text-textSecondary'>
          Configure and manage facilities across your organization. Organize buildings, floors, and physical
          infrastructure to support asset management, maintenance, and operational planning.
        </Typography>
      </Box>

      {/* Facilities List */}
      <FacilitiesList
        initialData={viewData}
        initialPagination={pagination}
        perPageCount={perPageCount}
        pageCount={pageCount}
        loading={loading}
        businessesData={businessesData}
        isSuperAdmin={isSuperAdmin}
      />
    </Box>
  )
}

export default FacilityHierarchyViews
