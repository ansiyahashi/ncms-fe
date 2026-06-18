import { getAllAdminUsers } from '@/libs/actions/adminUser.action'
import { getAllRoles } from '@/libs/actions/role.action'
import AdminUsersTable from '@/app/(dashboard)/(private)/(user)/admin-users/components/AdminUsersTable'
import type { PageProps } from '@/types/pageTypes'

export default async function AdminUsersListPage({ searchParams }: PageProps) {
  const params = await (searchParams || Promise.resolve({ q: '', page: '0', 'per-page': '10' }))
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)

  const [usersRes, rolesRes] = await Promise.all([
    getAllAdminUsers({
      search: query,
      size: +perPageCount,
      page: +pageCount + 1
    }),
    getAllRoles({ size: 1000 })
  ])

  const usersData = usersRes?.data?.users ?? {}
  const rolesData = rolesRes?.data?.roles?.data || []

  if (usersRes?.errors || rolesRes?.errors) {
    const errors = usersRes?.errors || rolesRes?.errors
    
if (errors) throw new Error(errors?.message || 'Failed to fetch users. Please try again later')
  }

  return (
    <AdminUsersTable
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
    />
  )
}
