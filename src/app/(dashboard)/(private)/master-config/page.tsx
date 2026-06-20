import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import MasterConfigTabs from './components/MasterConfigTabs'
import {
  getAllCostCenters,
  getAllUserTypes,
  getAllOwnerTypes,
  getAllFacilityTypes,
  getAllAssetStatuses
} from './api/master-config.action'

export default async function MasterConfigPage({ searchParams }: PageProps) {
  const params = await (searchParams ||
    Promise.resolve({
      tab: 'cost-centers',
      q: '',
      page: '0',
      'per-page': '10',
      b_id: ''
    }))

  const activeTab = params.tab || 'cost-centers'
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  let tabData: any[] = []
  let pagination = { totalData: 0, totalPages: 0, currentPage: 0 }
  let errorRes: any = null

  // Fetch target tab data on the server
  switch (activeTab) {
    case 'cost-centers': {
      const res = await getAllCostCenters({ search: query, size: perPageCount, page: pageCount + 1, b_id })

      tabData = res?.data?.costCenters?.data || []
      pagination = {
        totalData: res?.data?.costCenters?.totalData || 0,
        totalPages: res?.data?.costCenters?.totalPages || 0,
        currentPage: res?.data?.costCenters?.currentPage || 0
      }
      errorRes = res?.errors
      break
    }

    case 'user-types': {
      const res = await getAllUserTypes({ search: query, size: perPageCount, page: pageCount + 1, b_id })

      tabData = res?.data?.userTypes?.data || []
      pagination = {
        totalData: res?.data?.userTypes?.totalData || 0,
        totalPages: res?.data?.userTypes?.totalPages || 0,
        currentPage: res?.data?.userTypes?.currentPage || 0
      }
      errorRes = res?.errors
      break
    }

    case 'owner-types': {
      const res = await getAllOwnerTypes({ search: query, size: perPageCount, page: pageCount + 1, b_id })

      tabData = res?.data?.ownerTypes?.data || []
      pagination = {
        totalData: res?.data?.ownerTypes?.totalData || 0,
        totalPages: res?.data?.ownerTypes?.totalPages || 0,
        currentPage: res?.data?.ownerTypes?.currentPage || 0
      }
      errorRes = res?.errors
      break
    }

    case 'facility-types': {
      const res = await getAllFacilityTypes({ search: query, size: perPageCount, page: pageCount + 1, b_id })

      tabData = res?.data?.facilityTypes?.data || []
      pagination = {
        totalData: res?.data?.facilityTypes?.totalData || 0,
        totalPages: res?.data?.facilityTypes?.totalPages || 0,
        currentPage: res?.data?.facilityTypes?.currentPage || 0
      }
      errorRes = res?.errors
      break
    }

    case 'asset-statuses': {
      const res = await getAllAssetStatuses({ search: query, size: perPageCount, page: pageCount + 1, b_id })

      tabData = res?.data?.assetStatuses?.data || []
      pagination = {
        totalData: res?.data?.assetStatuses?.totalData || 0,
        totalPages: res?.data?.assetStatuses?.totalPages || 0,
        currentPage: res?.data?.assetStatuses?.currentPage || 0
      }
      errorRes = res?.errors

      break
    }
  }

  // Fetch businesses list if Super Admin
  const businessesRes = isSuperAdmin ? await getAllBusinesses({ size: 1000 }) : null
  const businessesData = businessesRes?.data?.businesses?.data || []

  if (errorRes || (isSuperAdmin && businessesRes?.errors)) {
    const error = errorRes || businessesRes?.errors

    throw new Error(error?.message || 'Failed to fetch Master Configuration data.')
  }

  return (
    <MasterConfigTabs
      activeTab={activeTab}
      tabData={tabData}
      pagination={pagination}
      perPageCount={perPageCount}
      pageCount={pageCount}
      loading={false}
      businessesData={businessesData}
      isSuperAdmin={isSuperAdmin}
    />
  )
}
