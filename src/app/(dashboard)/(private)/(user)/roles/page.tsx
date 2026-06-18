import { getAllPermissions } from '@/libs/actions/permissions.action'
import { getAllRoles } from '@/libs/actions/role.action'
import RolesTable from '@/app/(dashboard)/(private)/(user)/roles/components/RolesTable'
import type { PageProps } from '@/types/pageTypes'

export default async function RolesListPage({ searchParams }: PageProps) {
  const params = await (searchParams || Promise.resolve({ q: '', page: '0', 'per-page': '10' }))
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)

  const [rolesRes, permissionRes] = await Promise.all([
    getAllRoles({
      search: query,
      size: +perPageCount,
      page: +pageCount + 1
    }),
    getAllPermissions({})
  ])

  const rolesData = rolesRes?.data?.roles ?? {}

  const permissionData = permissionRes?.data?.permissions?.data || []

  if (rolesData?.errors || permissionRes?.errors) {
    const errors = rolesData?.errors || permissionRes?.errors

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
    />
  )
}
