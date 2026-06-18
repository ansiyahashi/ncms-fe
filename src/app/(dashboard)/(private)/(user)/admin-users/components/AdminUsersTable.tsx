'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import LocalSearchbar from '@components/common/LocalSearchbar'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import DataTable from '@components/data-table/DataTable'
import RoleGuard from '@components/RoleGuard'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import { validateError } from '@/api'
import { PERMISSIONS } from '@/libs/paths'

import { deleteAdminUser, updateAdmin } from '@/libs/actions/adminUser.action'
import AdminUsersFormDialog from './AdminUsersFormDialog'
import UpdatePasswordDialog from './UpdatePasswordDialog'

const columnHelper = createColumnHelper<any>()

interface AdminUsersTableProps {
  initialData: any[]
  initialPagination: {
    totalData: number
    totalPages: number
    currentPage: number
  }
  perPageCount: number
  pageCount: number
  loading: boolean
  rolesData?: any[]
}

const AdminUsersTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  rolesData = []
}: AdminUsersTableProps) => {
  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [passwordResetOpen, setPasswordResetOpen] = useState(false)
  const [passwordResetUserId, setPasswordResetUserId] = useState('')
  const [passwordResetUserName, setPasswordResetUserName] = useState('')

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const onDeleteUser = useCallback(async (userId: string) => {
    try {
      const { data: responseData, errors } = await deleteAdminUser({ id: userId }, '/admin-users')

      if (responseData?.deleteAdminUser) {
        toast.success('User deleted successfully!')
        setData(prev => prev.filter(user => user?.id !== responseData?.deleteAdminUser?.id))
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete the user.')
    }
  }, [])

  const handleStatusChange = useCallback(async (user: any) => {
    const updatedStatus = !user?.status

    try {
      const { data: responseData, errors } = await updateAdmin(
        {
          adminData: {
            id: user?.id,
            status: updatedStatus
          }
        },
        '/admin-users'
      )

      if (responseData?.updateAdmin) {
        toast.success(`Status successfully updated for ${user?.name || 'N/A'}`)
        addOrUpdateItem(setData, { ...user, status: updatedStatus }, 'id')
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || `Failed to update status for ${user?.name || 'N/A'}`)
    }
  }, [])

  const onEditItem = useCallback((item: any) => {
    setSelectedItem(item)
    setOpenDialog(true)
  }, [])

  const onResetPasswordClick = useCallback((item: any) => {
    setPasswordResetUserId(item?.id)
    setPasswordResetUserName(item?.name || '')
    setPasswordResetOpen(true)
  }, [])

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
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row?.original?.email}</Typography>
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => <Typography>{row?.original?.role?.name || 'N/A'}</Typography>
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
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <RoleGuard allowedPermissions={[PERMISSIONS.USER_DELETE]}>
              <IconButton size='small' onClick={() => onDeleteUser(row?.original?.id)} color='error'>
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>
            </RoleGuard>

            <RoleGuard allowedPermissions={[PERMISSIONS.USER_EDIT]}>
              <IconButton size='small' onClick={() => onEditItem(row?.original)} color='error'>
                <i className='ri-edit-box-line text-textSecondary' />
              </IconButton>
            </RoleGuard>

            <RoleGuard allowedPermissions={[PERMISSIONS.USER_EDIT]}>
              <IconButton size='small' onClick={() => onResetPasswordClick(row?.original)} color='info' title='Reset Password'>
                <i className='ri-key-2-line text-textSecondary' />
              </IconButton>
            </RoleGuard>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteUser, handleStatusChange, onEditItem, onResetPasswordClick]
  )

  const onDataChange = useCallback((data: any) => {
    addOrUpdateItem(setData, data)
  }, [])

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <LocalSearchbar route={'/admin-users'} placeholder='Search' className='max-sm:is-full' />
          <RoleGuard allowedPermissions={[PERMISSIONS.USER_CREATE]}>
            <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{
                  variant: 'contained',
                  color: 'primary',
                  className: 'max-sm:is-full',
                  startIcon: <i className='ri-add-line' />,
                  children: 'Add Users'
                }}
                dialog={AdminUsersFormDialog}
                dialogProps={{
                  onDataChange: onDataChange,
                  roles: rolesData
                }}
              />
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
      <AdminUsersFormDialog
        open={openDialog}
        setOpen={setOpenDialog}
        details={selectedItem}
        onDataChange={onDataChange}
        roles={rolesData}
      />
      <UpdatePasswordDialog
        open={passwordResetOpen}
        setOpen={setPasswordResetOpen}
        userId={passwordResetUserId}
        userName={passwordResetUserName}
      />
    </>
  )
}

export default AdminUsersTable
