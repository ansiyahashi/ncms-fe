import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import { getLookupRoles } from '@/libs/actions/lookup.action'
import { getAllClients } from './api/client.action'
import ClientsTable from './components/ClientsTable'

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await (searchParams ||
    Promise.resolve({
      q: '',
      page: '0',
      'per-page': '10',
      b_id: ''
    }))

  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [res, rolesRes, businessesRes] = await Promise.all([
    getAllClients({ search: query, size: perPageCount, page: pageCount + 1, b_id }),
    getLookupRoles({ b_id }),
    isSuperAdmin ? getAllBusinesses({ size: 1000 }) : Promise.resolve(null)
  ])
  
  const clientData = res?.data?.clients?.data || []
  const rolesData = rolesRes?.data?.roles?.data || []

  const pagination = {
    totalData: res?.data?.clients?.totalData || 0,
    totalPages: res?.data?.clients?.totalPages || 0,
    currentPage: res?.data?.clients?.currentPage || 0
  }

  const businessesData = businessesRes?.data?.businesses?.data || []

  if (res?.errors || rolesRes?.errors || (isSuperAdmin && businessesRes?.errors)) {
    const error = res?.errors || rolesRes?.errors || businessesRes?.errors

    throw new Error(error?.message || 'Failed to fetch Clients data.')
  }

  return (
    <ClientsTable
      initialData={clientData}
      initialPagination={pagination}
      perPageCount={perPageCount}
      pageCount={pageCount}
      loading={false}
      businessesData={businessesData}
      rolesData={rolesData}
    />
  )
}
