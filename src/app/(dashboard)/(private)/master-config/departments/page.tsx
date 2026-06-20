import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import DepartmentsList from '../components/DepartmentsList'
import { getAllDepartments } from '../api/master-config.action'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default async function DepartmentsPage({ searchParams }: PageProps) {
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

  const res = await getAllDepartments({ search: query, size: perPageCount, page: pageCount + 1, b_id })
  const listData = res?.data?.departments?.data || []
  const pagination = {
    totalData: res?.data?.departments?.totalData || 0,
    totalPages: res?.data?.departments?.totalPages || 0,
    currentPage: res?.data?.departments?.currentPage || 0
  }

  const businessesRes = isSuperAdmin ? await getAllBusinesses({ size: 1000 }) : null
  const businessesData = businessesRes?.data?.businesses?.data || []

  if (res?.errors || (isSuperAdmin && businessesRes?.errors)) {
    const error = res?.errors || businessesRes?.errors
    throw new Error(error?.message || 'Failed to fetch Departments data.')
  }

  return (
    <Box className='flex flex-col gap-6 w-full'>
      <Box className='flex flex-col gap-1'>
        <Typography variant='h4' className='font-bold tracking-tight text-textPrimary'>
          Departments
        </Typography>
        <Typography variant='body2' className='text-textSecondary'>
          Structure your organizational layout. Define workgroups (e.g. Facilities, Security, Finance) to route service tickets and group staff.
        </Typography>
      </Box>

      <DepartmentsList
        initialData={listData}
        initialPagination={pagination}
        perPageCount={perPageCount}
        pageCount={pageCount}
        loading={false}
        businessesData={businessesData}
        isSuperAdmin={isSuperAdmin}
      />
    </Box>
  )
}
