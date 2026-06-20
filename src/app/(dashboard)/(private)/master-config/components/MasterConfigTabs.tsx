'use client'

import type { SyntheticEvent } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Box from '@mui/material/Box'

import CostCentersTab from './CostCentersTab'
import UserTypesTab from './UserTypesTab'
import OwnerTypesTab from './OwnerTypesTab'
import FacilityTypesTab from './FacilityTypesTab'
import AssetStatusesTab from './AssetStatusesTab'

interface MasterConfigTabsProps {
  activeTab: string
  tabData: any[]
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

const MasterConfigTabs = ({
  activeTab,
  tabData,
  pagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  isSuperAdmin = false
}: MasterConfigTabsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    const params = new URLSearchParams(searchParams.toString())

    params.set('tab', newValue)
    params.delete('page')
    params.delete('q') // Clear query on tab change

    router.push(`/master-config?${params.toString()}`, { scroll: false })
  }

  return (
    <Box className='flex flex-col gap-6'>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label='master config tabs'
        className='border-be border-divider'
      >
        <Tab value='cost-centers' label='Cost Centers' />
        <Tab value='user-types' label='User Types' />
        <Tab value='owner-types' label='Owner Types' />
        <Tab value='facility-types' label='Facility Types' />
        <Tab value='asset-statuses' label='Asset Statuses' />
      </Tabs>

      <Box>
        {activeTab === 'cost-centers' && (
          <CostCentersTab
            initialData={tabData}
            initialPagination={pagination}
            perPageCount={perPageCount}
            pageCount={pageCount}
            loading={loading}
            businessesData={businessesData}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        {activeTab === 'user-types' && (
          <UserTypesTab
            initialData={tabData}
            initialPagination={pagination}
            perPageCount={perPageCount}
            pageCount={pageCount}
            loading={loading}
            businessesData={businessesData}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        {activeTab === 'owner-types' && (
          <OwnerTypesTab
            initialData={tabData}
            initialPagination={pagination}
            perPageCount={perPageCount}
            pageCount={pageCount}
            loading={loading}
            businessesData={businessesData}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        {activeTab === 'facility-types' && (
          <FacilityTypesTab
            initialData={tabData}
            initialPagination={pagination}
            perPageCount={perPageCount}
            pageCount={pageCount}
            loading={loading}
            businessesData={businessesData}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        {activeTab === 'asset-statuses' && (
          <AssetStatusesTab
            initialData={tabData}
            initialPagination={pagination}
            perPageCount={perPageCount}
            pageCount={pageCount}
            loading={loading}
            businessesData={businessesData}
            isSuperAdmin={isSuperAdmin}
          />
        )}
      </Box>
    </Box>
  )
}

export default MasterConfigTabs
