import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import { getLookupFacilities, getLookupUsers } from '@/libs/actions/lookup.action'
import { getAllWorkOrders } from './api/workOrder.action'
import WorkOrdersTable from './components/WorkOrdersTable'

export default async function WorkOrdersPage({ searchParams }: PageProps) {
  const params = await (searchParams ||
    Promise.resolve({
      q: '',
      page: '0',
      'per-page': '10',
      b_id: '',
      status: '',
      priority: '',
      type: '',
      facility_id: '',
      technician_id: ''
    }))

  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''
  const status = params.status || ''
  const priority = params.priority || ''
  const type = params.type || ''
  const facility_id = params.facility_id || ''
  const technician_id = params.technician_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [res, facilitiesRes, techniciansRes, businessesRes] = await Promise.all([
    getAllWorkOrders({
      search: query,
      size: perPageCount,
      page: pageCount + 1,
      b_id,
      status,
      priority,
      type,
      facility_id,
      technician_id
    }),
    getLookupFacilities({ b_id }),
    getLookupUsers({ b_id }),
    isSuperAdmin ? getAllBusinesses({ size: 1000 }) : Promise.resolve(null)
  ])

  const woData = res?.data?.workOrders?.data || []
  const facilitiesData = facilitiesRes?.data?.facilities?.data || []
  const techniciansData = techniciansRes?.data?.users?.data || []
  const businessesData = businessesRes?.data?.businesses?.data || []

  const pagination = {
    totalData: res?.data?.workOrders?.totalData || 0,
    totalPages: res?.data?.workOrders?.totalPages || 0,
    currentPage: res?.data?.workOrders?.currentPage || 0
  }

  if (res?.errors || facilitiesRes?.errors || techniciansRes?.errors || (isSuperAdmin && businessesRes?.errors)) {
    const error = res?.errors || facilitiesRes?.errors || techniciansRes?.errors || businessesRes?.errors
    throw new Error(error?.message || 'Failed to fetch Work Orders data.')
  }

  return (
    <WorkOrdersTable
      initialData={woData}
      initialPagination={pagination}
      perPageCount={perPageCount}
      pageCount={pageCount}
      loading={false}
      businessesData={businessesData}
      facilitiesData={facilitiesData}
      techniciansData={techniciansData}
    />
  )
}
