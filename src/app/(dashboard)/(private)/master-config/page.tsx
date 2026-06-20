import { getServerSession } from 'next-auth'
import MasterConfigViews from './components/MasterConfigViews'
import {
  getAllCostCenters,
  getAllUserTypes,
  getAllOwnerTypes,
  getAllFacilityTypes,
  getAllAssetStatuses,
  getAllDepartments,
  getAllDesignations
} from './api/master-config.action'
import { authOptions } from '@/libs/auth'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'

interface PageProps {
  searchParams: Promise<{
    view?: string
    q?: string
    page?: string
    'per-page'?: string
    b_id?: string
  }>
}

export default async function MasterConfigPage({ searchParams }: PageProps) {
  const params = await (searchParams ||
    Promise.resolve({
      view: 'cost-centers',
      q: '',
      page: '0',
      'per-page': '10',
      b_id: ''
    }))

  const activeView = params.view || 'cost-centers'
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  let viewData: any[] = []
  let pagination = { totalData: 0, totalPages: 0, currentPage: 0 }
  let errorRes: any = null
  let departmentsData: any[] = []

  // Fetch target view data on the server
  switch (activeView) {
    case 'cost-centers': {
      const res = await getAllCostCenters({ search: query, size: perPageCount, page: pageCount + 1, b_id })

      viewData = res?.data?.costCenters?.data || []
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

      viewData = res?.data?.userTypes?.data || []
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

      viewData = res?.data?.ownerTypes?.data || []
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

      viewData = res?.data?.facilityTypes?.data || []
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

      viewData = res?.data?.assetStatuses?.data || []
      pagination = {
        totalData: res?.data?.assetStatuses?.totalData || 0,
        totalPages: res?.data?.assetStatuses?.totalPages || 0,
        currentPage: res?.data?.assetStatuses?.currentPage || 0
      }
      errorRes = res?.errors

      break
    }

    case 'departments': {
      const res = await getAllDepartments({ search: query, size: perPageCount, page: pageCount + 1, b_id })

      viewData = res?.data?.departments?.data || []
      pagination = {
        totalData: res?.data?.departments?.totalData || 0,
        totalPages: res?.data?.departments?.totalPages || 0,
        currentPage: res?.data?.departments?.currentPage || 0
      }
      errorRes = res?.errors

      break
    }

    case 'designations': {
      const [res, deptsRes] = await Promise.all([
        getAllDesignations({ search: query, size: perPageCount, page: pageCount + 1, b_id }),
        getAllDepartments({ size: 1000, b_id })
      ])

      viewData = res?.data?.designations?.data || []
      pagination = {
        totalData: res?.data?.designations?.totalData || 0,
        totalPages: res?.data?.designations?.totalPages || 0,
        currentPage: res?.data?.designations?.currentPage || 0
      }
      errorRes = res?.errors || deptsRes?.errors
      departmentsData = deptsRes?.data?.departments?.data || []

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
    <MasterConfigViews
      activeView={activeView}
      viewData={viewData}
      pagination={pagination}
      perPageCount={perPageCount}
      pageCount={pageCount}
      loading={false}
      businessesData={businessesData}
      departmentsData={departmentsData}
      isSuperAdmin={isSuperAdmin}
    />
  )
}
