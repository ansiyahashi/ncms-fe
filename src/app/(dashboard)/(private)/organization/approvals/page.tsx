import { getServerSession } from 'next-auth'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllWorkflows } from './api/approval.action'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import ApprovalsTable from './components/ApprovalsTable'

export default async function ApprovalsListPage({ searchParams }: PageProps) {
  const params: any = await (searchParams || Promise.resolve({ q: '', page: '0', 'per-page': '10', b_id: '', entity_type: '' }))
  const query = params.q || ''
  const perPageCount = Number(params['per-page'] ?? 10)
  const pageCount = Number(params.page ?? 0)
  const b_id = params.b_id || ''
  const entity_type = params.entity_type || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [workflowsRes, businessesRes] = await Promise.all([
    getAllWorkflows({
      search: query,
      size: perPageCount,
      page: pageCount + 1,
      b_id,
      entity_type
    }),
    isSuperAdmin ? getAllBusinesses({ size: 1000 }) : Promise.resolve(null)
  ])

  const workflowsData = workflowsRes?.data?.workflows ?? {}
  const businessesData = businessesRes?.data?.businesses?.data || []

  if (workflowsRes?.errors || (isSuperAdmin && businessesRes?.errors)) {
    const errors = workflowsRes?.errors || businessesRes?.errors

    if (errors) throw new Error(errors?.message || 'Failed to fetch approval workflows. Please try again later')
  }

  return (
    <Box className='flex flex-col gap-6 w-full'>
      <Box className='flex flex-col gap-1'>
        <Typography variant='h4' className='font-bold tracking-tight text-textPrimary'>
          Approval Workflows
        </Typography>
        <Typography variant='body2' className='text-textSecondary'>
          Manage approval processes for key entities. Create multi-level steps routing through users, roles, or manager hierarchy.
        </Typography>
      </Box>

      <ApprovalsTable
        initialData={workflowsData?.data || []}
        initialPagination={{
          totalData: workflowsData?.totalData || 0,
          totalPages: workflowsData?.totalPages || 0,
          currentPage: workflowsData?.currentPage || 0
        }}
        loading={false}
        perPageCount={perPageCount}
        pageCount={pageCount}
        businessesData={businessesData}
      />
    </Box>
  )
}
