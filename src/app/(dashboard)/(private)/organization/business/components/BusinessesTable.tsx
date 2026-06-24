'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

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

import { deleteBusiness, updateBusiness } from '../api/business.action'
import BusinessFormDialog from './BusinessFormDialog'

const columnHelper = createColumnHelper<any>()

interface BusinessesTableProps {
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

const BusinessesTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading
}: BusinessesTableProps) => {
  const { data: session } = useSession()
  const router = useRouter()
  const isSuperAdmin = session?.user?.is_super_admin

  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const onDeleteBusiness = useCallback(async (businessId: string) => {
    try {
      const { data: responseData, errors } = await deleteBusiness({ id: businessId }, '/organization/business')

      if (responseData?.deleteBusiness) {
        toast.success('Business deleted successfully!')
        setData(prev => prev.filter(b => b?.id !== responseData?.deleteBusiness?.id))
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete the Business.')
    }
  }, [])

  const handleStatusChange = useCallback(async (business: any) => {
    const updatedStatus = !business?.status

    try {
      const { data: responseData, errors } = await updateBusiness(
        {
          businessData: {
            id: business?.id,
            status: updatedStatus
          }
        },
        '/organization/business'
      )

      if (responseData?.updateBusiness) {
        toast.success(`Status successfully updated for ${business?.name || 'N/A'}`)
        addOrUpdateItem(setData, { ...business, status: updatedStatus }, 'id')
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || `Failed to update status for ${business?.name || 'N/A'}`)
    }
  }, [])

  const onEditItem = useCallback((item: any) => {
    setSelectedItem(item)
    setOpenDialog(true)
  }, [])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Business Name',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-semibold'>
              {row?.original?.name}
            </Typography>
            <Typography variant='caption' color='textSecondary'>
              Code: {row?.original?.code || 'N/A'}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email & Contact',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2'>{row?.original?.email}</Typography>
            {row?.original?.contact && (
              <Typography variant='caption' color='textSecondary'>
                Contact: {row?.original?.contact}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('plan', {
        header: 'Plan',
        cell: ({ row }) => {
          const plan = row?.original?.plan
          let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'info'

          if (plan === 'pro') color = 'primary'
          if (plan === 'enterprise') color = 'success'

          return <Chip variant='tonal' label={plan ? plan.toUpperCase() : 'FREE'} size='small' color={color} />
        }
      }),
      columnHelper.accessor('industry', {
        header: 'Industry / Type',
        cell: ({ row }) => (
          <Typography variant='body2'>{row?.original?.industry || row?.original?.business_type || 'N/A'}</Typography>
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
            <RoleGuard allowedPermissions={[PERMISSIONS.BUSINESS_EDIT]}>
              <Switch
                checked={row?.original?.status}
                onChange={() => handleStatusChange(row?.original)}
                inputProps={{ 'aria-label': 'status-toggle' }}
              />
            </RoleGuard>
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <RoleGuard allowedPermissions={[PERMISSIONS.BUSINESS_DELETE]}>
              <IconButton size='small' onClick={() => onDeleteBusiness(row?.original?.id)} color='error'>
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>
            </RoleGuard>

            <RoleGuard allowedPermissions={[PERMISSIONS.BUSINESS_EDIT]}>
              <IconButton size='small' onClick={() => onEditItem(row?.original)} color='primary'>
                <i className='ri-edit-box-line text-textSecondary' />
              </IconButton>
            </RoleGuard>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteBusiness, handleStatusChange, onEditItem, isSuperAdmin, router]
  )

  const onDataChange = useCallback((data: any) => {
    addOrUpdateItem(setData, data)
  }, [])

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <LocalSearchbar route={'/organization/business'} placeholder='Search Business' className='max-sm:is-full' />
          <RoleGuard allowedPermissions={[PERMISSIONS.BUSINESS_CREATE]}>
            <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{
                  variant: 'contained',
                  color: 'primary',
                  className: 'max-sm:is-full',
                  startIcon: <i className='ri-add-line' />,
                  children: 'Add Business'
                }}
                dialog={BusinessFormDialog}
                dialogProps={{
                  onDataChange: onDataChange
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
      <BusinessFormDialog
        open={openDialog}
        setOpen={setOpenDialog}
        details={selectedItem}
        onDataChange={onDataChange}
      />
    </>
  )
}

export default BusinessesTable
