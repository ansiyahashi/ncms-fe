import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getAllPermissions } from '@/libs/actions/permissions.action'
import { getAllRoles } from './api/role.action'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import RolesTable from '@/app/(dashboard)/(private)/(user)/roles/components/RolesTable'
import type { PageProps } from '@/types/pageTypes'

export default async function RolesListPage({ searchParams }: PageProps) {
  const params: any = await (searchParams || Promise.resolve({ q: '', page: '0', 'per-page': '10' }))
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [rolesRes, permissionRes, businessesRes] = await Promise.all([
    getAllRoles({
      search: query,
      size: +perPageCount,
      page: +pageCount + 1,
      b_id
    }),
    getAllPermissions({}),
    isSuperAdmin ? getAllBusinesses({ size: 1000 }) : Promise.resolve(null)
  ])

  const rolesData = rolesRes?.data?.roles ?? {}
  const permissionData = permissionRes?.data?.permissions?.data || []
  const businessesData = businessesRes?.data?.businesses?.data || []

  if (rolesRes?.errors || permissionRes?.errors || (isSuperAdmin && businessesRes?.errors)) {
    const errors = rolesRes?.errors || permissionRes?.errors || businessesRes?.errors

    if (errors) throw new Error(errors?.message || 'Failed to fetch roles. Please try again later')
  }

  return (
    <RolesTable
      initialData={rolesData?.data || []}
      initialPagination={{
        totalData: rolesData?.totalData || 0,
        totalPages: rolesData?.totalPages || 0,
        currentPage: rolesData?.currentPage || 0
      }}
      loading={false}
      perPageCount={perPageCount}
      pageCount={pageCount}
      permissionData={permissionData}
      businessesData={businessesData}
    />
  )
}
