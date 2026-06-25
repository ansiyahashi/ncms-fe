import { getServerSession } from 'next-auth'

import Box from '@mui/material/Box'

import Typography from '@mui/material/Typography'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import DesignationsList from '../components/DesignationsList'
import { getAllDesignations } from '../api/master-config.action'
import { getLookupDepartments } from '@/libs/actions/lookup.action'

export default async function DesignationsPage({ searchParams }: PageProps) {
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

  const [res, deptsRes] = await Promise.all([
    getAllDesignations({ search: query, size: perPageCount, page: pageCount + 1, b_id }),
    getLookupDepartments({ b_id })
  ])

  const listData = res?.data?.designations?.data || []
  const departmentsData = deptsRes?.data?.departments?.data || []

  const pagination = {
    totalData: res?.data?.designations?.totalData || 0,
    totalPages: res?.data?.designations?.totalPages || 0,
    currentPage: res?.data?.designations?.currentPage || 0
  }

  const businessesRes = isSuperAdmin ? await getAllBusinesses({ size: 1000 }) : null
  const businessesData = businessesRes?.data?.businesses?.data || []

  if (res?.errors || deptsRes?.errors || (isSuperAdmin && businessesRes?.errors)) {
    const error = res?.errors || deptsRes?.errors || businessesRes?.errors

    throw new Error(error?.message || 'Failed to fetch Designations data.')
  }

  return (
    <Box className='flex flex-col gap-6 w-full'>
      <Box className='flex flex-col gap-1'>
        <Typography variant='h4' className='font-bold tracking-tight text-textPrimary'>
          Designations
        </Typography>
        <Typography variant='body2' className='text-textSecondary'>
          Configure corporate rank and title systems. Assign clear titles to staff to organize access hierarchy, duties, and escalations.
        </Typography>
      </Box>

      <DesignationsList
        initialData={listData}
        initialPagination={pagination}
        perPageCount={perPageCount}
        pageCount={pageCount}
        loading={false}
        businessesData={businessesData}
        departmentsData={departmentsData}
        isSuperAdmin={isSuperAdmin}
      />
    </Box>
  )
}
