'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import { format } from 'date-fns'

import LocalSearchbar from '@components/common/LocalSearchbar'
import { deleteRole, updateRole } from '../api/role.action'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import DataTable from '@components/data-table/DataTable'
import { PERMISSIONS } from '@/libs/paths'
import RoleGuard from '@components/RoleGuard'
import { validateError } from '@/api'
import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'

const columnHelper = createColumnHelper<any>()

interface RolesTableProps {
  initialData: any[]
  initialPagination: {
    totalData: number
    totalPages: number
    currentPage: number
  }
  perPageCount: number
  pageCount: number
  loading: boolean
  businessesData?: any[]
}

const RolesTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = []
}: RolesTableProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin || false
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState(initialData)

  const currentBId = searchParams.get('b_id') || ''

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleBusinessChange = useCallback((bId: string) => {
    let newUrl = ''

    if (bId) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'b_id',
        value: bId,
        keysToRemove: ['page']
      })
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['b_id', 'page']
      })
    }

    router.push(newUrl, { scroll: false })
  }, [searchParams, router])

  const onDeleteRole = useCallback(async (roleId: string) => {
    try {
      const { data: responseData, errors } = await deleteRole({ deleteRoleId: roleId }, '/roles')

      if (responseData?.deleteRole) {
        toast.success('Role deleted successfully!')
        setData(prev => prev.filter(role => role?.id !== responseData?.deleteRole?.id))
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete the Role.')
    }
  }, [])

  const handleStatusChange = useCallback(async (role: any) => {
    const updatedStatus = !role?.status

    try {
      const { data: responseData, errors } = await updateRole(
        {
          roleData: {
            id: role?.id,
            status: updatedStatus
          }
        },
        '/roles'
      )

      if (responseData?.updateRole) {
        toast.success(`Status successfully updated for ${role?.name || 'N/A'}`)
        addOrUpdateItem(setData, { ...role, status: updatedStatus }, 'id')
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || `Failed to update status for ${role?.name || 'N/A'}`)
    }
  }, [])

  const onEditItem = useCallback(
    (item: any) => {
      router.push(`/roles/${item.id}/edit`)
    },
    [router]
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row?.original?.name}
          </Typography>
        )
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row?.original?.status ? 'Active' : 'Inactive'}
              size='small'
              color={row?.original?.status ? 'success' : 'warning'}
            />
            <Switch
              checked={row?.original?.status}
              onChange={() => handleStatusChange(row?.original)}
              inputProps={{ 'aria-label': 'status-toggle' }}
            />
          </div>
        )
      }),
      columnHelper.accessor('created_at', {
        header: 'Created At',
        cell: ({ row }) => {
          const createdAt = row?.original?.created_at
          let formattedDate = '-'

          if (createdAt) {
            const date = isNaN(Number(createdAt)) ? new Date(createdAt) : new Date(Number(createdAt))

            if (!isNaN(date.getTime())) {
              formattedDate = format(date, 'MMM dd, yyyy')
            }
          }

          return <Typography>{formattedDate}</Typography>
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <RoleGuard allowedPermissions={[PERMISSIONS.ROLE_DELETE]}>
              <IconButton size='small' onClick={() => onDeleteRole(row?.original?.id)} color='error'>
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>
            </RoleGuard>

            <RoleGuard allowedPermissions={[PERMISSIONS.ROLE_EDIT]}>
              <IconButton size='small' onClick={() => onEditItem(row?.original)} color='error'>
                <i className='ri-edit-box-line text-textSecondary' />
              </IconButton>
            </RoleGuard>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteRole, handleStatusChange, onEditItem]
  )

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
            <LocalSearchbar route={'/roles'} placeholder='Search' className='max-sm:is-full sm:min-is-[220px]' />
            
            {isSuperAdmin && (
              <FormControl size='small' className='max-sm:is-full' sx={{ minWidth: 180 }}>
                <InputLabel id='business-filter-select-label'>Business</InputLabel>
                <Select
                  labelId='business-filter-select-label'
                  id='business-filter-select'
                  value={currentBId}
                  label='Business'
                  onChange={e => handleBusinessChange(e.target.value as string)}
                >
                  <MenuItem value=''>All Businesses</MenuItem>
                  {businessesData.map((business: any) => (
                    <MenuItem key={business.id} value={business.id}>
                      {business.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          <RoleGuard allowedPermissions={[PERMISSIONS.ROLE_CREATE]}>
            <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                className='max-sm:is-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => router.push('/roles/add')}
              >
                Add Roles
              </Button>
            </div>
          </RoleGuard>
        </CardContent>
        <DataTable
          data={data}
          columns={columns}
          totalData={initialPagination?.totalData}
          pageCount={pageCount}
          perPageCount={perPageCount}
          loading={loading}
        />
      </Card>
    </>
  )
}

export default RolesTable
