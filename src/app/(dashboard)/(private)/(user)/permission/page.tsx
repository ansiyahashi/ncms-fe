import { getAllPermissions } from '@/libs/actions/permissions.action'
import PermissionsTable from '@/app/(dashboard)/(private)/(user)/permission/components/PermissionsTable'
import type { PageProps } from '@/types/pageTypes'

export default async function PermissionsListPage({ searchParams }: PageProps) {
  const params = await (searchParams || Promise.resolve({ q: '', page: '0', 'per-page': '10' }))
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)

  const permissionRes = await getAllPermissions({
    search: query,
    size: +perPageCount,
    page: +pageCount + 1
  })

  const permissionData = permissionRes?.data?.permissions ?? {}

  if (permissionRes?.errors) {
    const errors = permissionRes?.errors
    
if (errors) throw new Error(errors?.message || 'Failed to fetch permissions. Please try again later')
  }

  return (
    <PermissionsTable
      initialData={permissionData?.data || []}
      initialPagination={{
        totalData: permissionData?.totalData || 0,
        totalPages: permissionData?.totalPages || 0,
        currentPage: permissionData?.currentPage || 0
      }}
      loading={false}
      perPageCount={perPageCount}
      pageCount={pageCount}
    />
  )
}
