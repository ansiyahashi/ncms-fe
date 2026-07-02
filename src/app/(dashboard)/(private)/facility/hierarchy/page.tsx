import { getServerSession } from 'next-auth'

import FacilityHierarchyViews from './components/FacilityHierarchyViews'
import { getAllFacilities } from '../api/facility.action'
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

export default async function FacilityHierarchyPage({ searchParams }: PageProps) {
  const params = await (searchParams ||
    Promise.resolve({
      view: 'facilities',
      q: '',
      page: '0',
      'per-page': '10',
      b_id: ''
    }))

  const activeView = params.view || 'facilities'
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  let viewData: any[] = []
  let pagination = { totalData: 0, totalPages: 0, currentPage: 0 }
  let errorRes: any = null

  // Fetch target view data on the server
  switch (activeView) {
    case 'facilities': {
      const res = await getAllFacilities({
        search: query,
        size: perPageCount,
        page: pageCount + 1,
        b_id
      })

      viewData = res?.data?.facilities?.data || []
      pagination = {
        totalData: res?.data?.facilities?.totalData || 0,
        totalPages: res?.data?.facilities?.totalPages || 0,
        currentPage: res?.data?.facilities?.currentPage || 0
      }
      errorRes = res?.errors
      break
    }

    default: {
      // For buildings, floors, zones, units placeholders
      viewData = []
      pagination = { totalData: 0, totalPages: 0, currentPage: 0 }
      break
    }
  }

  // Fetch businesses list if Super Admin
  const businessesRes = isSuperAdmin ? await getAllBusinesses({ size: 1000 }) : null
  const businessesData = businessesRes?.data?.businesses?.data || []

  if (errorRes || (isSuperAdmin && businessesRes?.errors)) {
    const error = errorRes || businessesRes?.errors

    throw new Error(error?.message || 'Failed to fetch Facility Hierarchy data.')
  }

  return (
    <FacilityHierarchyViews
      activeView={activeView}
      viewData={viewData}
      pagination={pagination}
      perPageCount={perPageCount}
      pageCount={pageCount}
      loading={false}
      businessesData={businessesData}
      isSuperAdmin={isSuperAdmin}
    />
  )
}
