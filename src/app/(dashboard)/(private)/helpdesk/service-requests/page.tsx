import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import { getLookupFacilities, getLookupDepartments, getLookupUsers } from '@/libs/actions/lookup.action'
import { getAllServiceRequests } from './api/serviceRequest.action'
import ServiceRequestsTable from './components/ServiceRequestsTable'

export default async function ServiceRequestsPage({ searchParams }: PageProps) {
  const params = await (searchParams ||
    Promise.resolve({
      q: '',
      page: '0',
      'per-page': '10',
      b_id: '',
      status: '',
      priority: '',
      facility_id: ''
    }))

  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''
  const status = params.status || ''
  const priority = params.priority || ''
  const facility_id = params.facility_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [res, facilitiesRes, departmentsRes, techniciansRes, businessesRes] = await Promise.all([
    getAllServiceRequests({
      search: query,
      size: perPageCount,
      page: pageCount + 1,
      b_id,
      status,
      priority,
      facility_id
    }),
    getLookupFacilities({ b_id }),
    getLookupDepartments({ b_id }),
    getLookupUsers({ b_id }),
    isSuperAdmin ? getAllBusinesses({ size: 1000 }) : Promise.resolve(null)
  ])

  const srData = res?.data?.serviceRequests?.data || []
  const facilitiesData = facilitiesRes?.data?.facilities?.data || []
  const departmentsData = departmentsRes?.data?.departments?.data || []
  const techniciansData = techniciansRes?.data?.users?.data || []
  const businessesData = businessesRes?.data?.businesses?.data || []

  const pagination = {
    totalData: res?.data?.serviceRequests?.totalData || 0,
    totalPages: res?.data?.serviceRequests?.totalPages || 0,
    currentPage: res?.data?.serviceRequests?.currentPage || 0
  }

  if (res?.errors || facilitiesRes?.errors || departmentsRes?.errors || techniciansRes?.errors || (isSuperAdmin && businessesRes?.errors)) {
    const error = res?.errors || facilitiesRes?.errors || departmentsRes?.errors || techniciansRes?.errors || businessesRes?.errors
    throw new Error(error?.message || 'Failed to fetch Service Requests data.')
  }

  return (
    <ServiceRequestsTable
      initialData={srData}
      initialPagination={pagination}
      perPageCount={perPageCount}
      pageCount={pageCount}
      loading={false}
      businessesData={businessesData}
      facilitiesData={facilitiesData}
      departmentsData={departmentsData}
      techniciansData={techniciansData}
    />
  )
}
