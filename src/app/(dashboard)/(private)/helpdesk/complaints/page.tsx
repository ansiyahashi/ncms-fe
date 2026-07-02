import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import { getLookupFacilities } from '@/libs/actions/lookup.action'
import { getAllComplaints } from './api/complaint.action'
import ComplaintsTable from './components/ComplaintsTable'

export default async function ComplaintsPage({ searchParams }: PageProps) {
  const params = await (searchParams ||
    Promise.resolve({
      q: '',
      page: '0',
      'per-page': '10',
      b_id: '',
      status: '',
      facility_id: ''
    }))

  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''
  const status = params.status || ''
  const facility_id = params.facility_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [res, facilitiesRes, businessesRes] = await Promise.all([
    getAllComplaints({
      search: query,
      size: perPageCount,
      page: pageCount + 1,
      b_id,
      status,
      facility_id
    }),
    getLookupFacilities({ b_id }),
    isSuperAdmin ? getAllBusinesses({ size: 1000 }) : Promise.resolve(null)
  ])

  const complaintsData = res?.data?.complaints?.data || []
  const facilitiesData = facilitiesRes?.data?.facilities?.data || []
  const businessesData = businessesRes?.data?.businesses?.data || []

  const pagination = {
    totalData: res?.data?.complaints?.totalData || 0,
    totalPages: res?.data?.complaints?.totalPages || 0,
    currentPage: res?.data?.complaints?.currentPage || 0
  }

  if (res?.errors || facilitiesRes?.errors || (isSuperAdmin && businessesRes?.errors)) {
    const error = res?.errors || facilitiesRes?.errors || businessesRes?.errors

    throw new Error(error?.message || 'Failed to fetch Complaints data.')
  }

  return (
    <ComplaintsTable
      initialData={complaintsData}
      initialPagination={pagination}
      perPageCount={perPageCount}
      pageCount={pageCount}
      loading={false}
      businessesData={businessesData}
      facilitiesData={facilitiesData}
    />
  )
}
