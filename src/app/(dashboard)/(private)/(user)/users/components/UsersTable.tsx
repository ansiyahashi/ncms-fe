'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import LocalSearchbar from '@components/common/LocalSearchbar'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import DataTable from '@components/data-table/DataTable'
import RoleGuard from '@components/RoleGuard'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import { validateError } from '@/api'
import { PERMISSIONS } from '@/libs/paths'
import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'

import { deleteUser, updateUser } from '../api/user.action'
import UsersFormDialog from './UsersFormDialog'
import UpdatePasswordDialog from './UpdatePasswordDialog'

const columnHelper = createColumnHelper<any>()

interface UsersTableProps {
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
  businessesData?: any[]
  departmentsData?: any[]
  designationsData?: any[]
}

const UsersTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  rolesData = [],
  businessesData = [],
  departmentsData = [],
  designationsData = []
}: UsersTableProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [passwordResetOpen, setPasswordResetOpen] = useState(false)
  const [passwordResetUserId, setPasswordResetUserId] = useState('')
  const [passwordResetUserName, setPasswordResetUserName] = useState('')

  const currentRoleId = searchParams.get('role_id') || ''
  const currentBId = searchParams.get('b_id') || ''

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleRoleChange = useCallback((roleId: string) => {
    let newUrl = ''
    if (roleId) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'role_id',
        value: roleId,
        keysToRemove: ['page']
      })
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['role_id', 'page']
      })
    }
    router.push(newUrl, { scroll: false })
  }, [searchParams, router])

  const handleBusinessChange = useCallback((bId: string) => {
    let newUrl = ''
    if (bId) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'b_id',
        value: bId,
        keysToRemove: ['page', 'role_id']
      })
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['b_id', 'page', 'role_id']
      })
    }
    router.push(newUrl, { scroll: false })
  }, [searchParams, router])

  const onDeleteUser = useCallback(async (userId: string) => {
    try {
      const { data: responseData, errors } = await deleteUser({ id: userId }, '/users')

      if (responseData?.deleteUser) {
        toast.success('User deleted successfully!')
        setData(prev => prev.filter(user => user?.id !== responseData?.deleteUser?.id))
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete the user.')
    }
  }, [])

  const handleStatusChange = useCallback(async (user: any) => {
    const updatedStatus = !user?.status

    try {
      const { data: responseData, errors } = await updateUser(
        {
          userData: {
            id: user?.id,
            status: updatedStatus
          }
        },
        '/users'
      )

      if (responseData?.updateUser) {
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
      columnHelper.accessor('dep_id', {
        header: 'Department',
        cell: ({ row }) => {
          const depId = row?.original?.dep_id
          const department = departmentsData.find((d: any) => d.id === depId)
          return <Typography className='text-xs'>{department?.name || 'N/A'}</Typography>
        }
      }),
      columnHelper.accessor('des_id', {
        header: 'Designation',
        cell: ({ row }) => {
          const desId = row?.original?.des_id
          const designation = designationsData.find((d: any) => d.id === desId)
          return <Typography className='text-xs'>{designation?.name || 'N/A'}</Typography>
        }
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
    [onDeleteUser, handleStatusChange, onEditItem, onResetPasswordClick, departmentsData, designationsData]
  )

  const onDataChange = useCallback((data: any) => {
    addOrUpdateItem(setData, data)
  }, [])

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
            <LocalSearchbar route={'/users'} placeholder='Search' className='max-sm:is-full sm:min-is-[220px]' />
            
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

            <FormControl size='small' className='max-sm:is-full' sx={{ minWidth: 180 }}>
              <InputLabel id='role-filter-select-label'>Role</InputLabel>
              <Select
                labelId='role-filter-select-label'
                id='role-filter-select'
                value={currentRoleId}
                label='Role'
                onChange={e => handleRoleChange(e.target.value as string)}
              >
                <MenuItem value=''>All Roles</MenuItem>
                {rolesData.map((role: any) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

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
                dialog={UsersFormDialog}
                dialogProps={{
                  onDataChange: onDataChange,
                  roles: rolesData,
                  businesses: businessesData,
                  departments: departmentsData,
                  designations: designationsData,
                  currentBId: currentBId
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
      <UsersFormDialog
        open={openDialog}
        setOpen={setOpenDialog}
        details={selectedItem}
        onDataChange={onDataChange}
        roles={rolesData}
        businesses={businessesData}
        departments={departmentsData}
        designations={designationsData}
        currentBId={currentBId}
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

export default UsersTable
