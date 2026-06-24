import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getAllUsers } from './api/user.action'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import { getLookupRoles, getLookupDepartments, getLookupDesignations } from '@/libs/actions/lookup.action'
import UsersTable from '@/app/(dashboard)/(private)/(user)/users/components/UsersTable'
import type { PageProps } from '@/types/pageTypes'

export default async function UsersListPage({ searchParams }: PageProps) {
  const params: any = await (searchParams || Promise.resolve({ q: '', page: '0', 'per-page': '10' }))
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''
  const role_id = params.role_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [usersRes, rolesRes, businessesRes, departmentsRes, designationsRes] = await Promise.all([
    getAllUsers({
      search: query,
      size: +perPageCount,
      page: +pageCount + 1,
      b_id,
      role_id
    }),
    getLookupRoles({
      b_id
    }),
    isSuperAdmin ? getAllBusinesses({ size: 1000 }) : Promise.resolve(null),
    getLookupDepartments({
      b_id
    }),
    getLookupDesignations({
      b_id
    })
  ])

  const usersData = usersRes?.data?.users ?? {}
  const rolesData = rolesRes?.data?.roles?.data || []
  const businessesData = businessesRes?.data?.businesses?.data || []
  const departmentsData = departmentsRes?.data?.departments?.data || []
  const designationsData = designationsRes?.data?.designations?.data || []

  if (usersRes?.errors || rolesRes?.errors || (isSuperAdmin && businessesRes?.errors) || departmentsRes?.errors || designationsRes?.errors) {
    const errors = usersRes?.errors || rolesRes?.errors || businessesRes?.errors || departmentsRes?.errors || designationsRes?.errors
    
    if (errors) throw new Error(errors?.message || 'Failed to fetch page data. Please try again later')
  }

  return (
    <UsersTable
      initialData={usersData?.data || []}
      initialPagination={{
        totalData: usersData?.totalData || 0,
        totalPages: usersData?.totalPages || 0,
        currentPage: usersData?.currentPage || 0
      }}
      loading={false}
      perPageCount={perPageCount}
      pageCount={pageCount}
      rolesData={rolesData}
      businessesData={businessesData}
      departmentsData={departmentsData}
      designationsData={designationsData}
    />
  )
}
