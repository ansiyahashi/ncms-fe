'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import LocalSearchbar from '@components/common/LocalSearchbar'
import { deletePermission } from '@/libs/actions/permissions.action'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import PermissionsFormDialog from './PermissionsFormDialog'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import DataTable from '@components/data-table/DataTable'
import { PERMISSIONS } from '@/libs/paths'
import RoleGuard from '@components/RoleGuard'
import { validateError } from '@/api'

const columnHelper = createColumnHelper<any>()

interface PermissionsTableProps {
  initialData: any[]
  initialPagination: {
    totalData: number
    totalPages: number
    currentPage: number
  }
  perPageCount: number
  pageCount: number
  loading: boolean
}

const PermissionsTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading
}: PermissionsTableProps) => {
  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const onDataChange = useCallback((data: any) => {
    addOrUpdateItem(setData, data)
  }, [])

  const onEditItem = useCallback((item: any) => {
    setSelectedItem(item)
    setOpenDialog(true)
  }, [])

  const onDeletePermission = useCallback(async (permissionId: string) => {
    try {
      const { data: responseData, errors } = await deletePermission({ deletePermissionId: permissionId }, '/permission')

      if (responseData?.deletePermission) {
        toast.success('Permission deleted successfully!')
        setData(prev => prev.filter(permission => permission?.id !== responseData?.deletePermission?.id))
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete the Permission.')
    }
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
      columnHelper.accessor('permission_code', {
        header: 'Permission Code',
        cell: ({ row }) => <Typography>{row?.original?.permission_code}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => <Typography>{row?.original?.description || 'N/A'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row?.original?.status ? 'Active' : 'Inactive'}
            size='small'
            color={row?.original?.status ? 'success' : 'warning'}
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <RoleGuard allowedPermissions={[PERMISSIONS.PERMISSION_DELETE]}>
              <IconButton size='small' onClick={() => onDeletePermission(row?.original?.id)} color='error'>
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>
            </RoleGuard>

            <RoleGuard allowedPermissions={[PERMISSIONS.PERMISSION_EDIT]}>
              <IconButton size='small' onClick={() => onEditItem(row?.original)} color='error'>
                <i className='ri-edit-box-line text-textSecondary' />
              </IconButton>
            </RoleGuard>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeletePermission, onEditItem]
  )



  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <LocalSearchbar route={'/permission'} placeholder='Search' className='max-sm:is-full' />
          <RoleGuard allowedPermissions={[PERMISSIONS.PERMISSION_CREATE]}>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{
                variant: 'contained',
                color: 'primary',
                className: 'max-sm:is-full',
                startIcon: <i className='ri-add-line' />,
                children: 'Add Permission'
              }}
              dialog={PermissionsFormDialog}
              dialogProps={{
                onDataChange: onDataChange
              }}
            />
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
      <PermissionsFormDialog
        open={openDialog}
        setOpen={setOpenDialog}
        details={selectedItem}
        onDataChange={onDataChange}
      />
    </>
  )
}

export default PermissionsTable
