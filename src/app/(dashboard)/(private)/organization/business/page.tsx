import { getAllBusinesses } from '@/libs/actions/business.action'
import BusinessesTable from './components/BusinessesTable'
import type { PageProps } from '@/types/pageTypes'

export default async function BusinessesListPage({ searchParams }: PageProps) {
  const params = await (searchParams || Promise.resolve({ q: '', page: '0', 'per-page': '10' }))
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)

  const businessesRes = await getAllBusinesses({
    search: query,
    size: +perPageCount,
    page: +pageCount + 1
  })

  const businessesData = businessesRes?.data?.businesses ?? {}

  if (businessesRes?.errors) {
    throw new Error(businessesRes?.errors?.message || 'Failed to fetch businesses. Please try again later')
  }

  return (
    <BusinessesTable
      initialData={businessesData?.data || []}
      initialPagination={{
        totalData: businessesData?.totalData || 0,
        totalPages: businessesData?.totalPages || 0,
        currentPage: businessesData?.currentPage || 0
      }}
      loading={false}
      perPageCount={perPageCount}
      pageCount={pageCount}
    />
  )
}
