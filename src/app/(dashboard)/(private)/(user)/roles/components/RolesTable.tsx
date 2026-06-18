'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import { format } from 'date-fns'

import LocalSearchbar from '@components/common/LocalSearchbar'
import { deleteRole, updateRole } from '@/libs/actions/role.action'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import DataTable from '@components/data-table/DataTable'
import { PERMISSIONS } from '@/libs/paths'
import RoleGuard from '@components/RoleGuard'
import { validateError } from '@/api'

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
  permissionData?: any[]
}

const RolesTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  permissionData = []
}: RolesTableProps) => {
  const router = useRouter()
  const [data, setData] = useState(initialData)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

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

      // columnHelper.accessor('adminUserCount', {
      //   header: 'Admin Users',
      //   cell: ({ row }) => <Typography>{row?.original?.adminUserCount || 0}</Typography>
      // }),
      // columnHelper.accessor('role_permissions', {
      //   header: 'Permissions',
      //   cell: ({ row }) => {
      //     const permissions = row?.original?.role_permissions || []

      //     const permissionNames = permissions
      //       .map((rp: any) => rp?.permission?.name)
      //       .filter(Boolean)
      //       .join(', ')

      //     return <Typography className='text-wrap'>{permissionNames || 'No Permissions'}</Typography>
      //   }
      // }),
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
          <LocalSearchbar route={'/roles'} placeholder='Search' className='max-sm:is-full' />
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
