'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

import LocalSearchbar from '@components/common/LocalSearchbar'
import DataTable from '@components/data-table/DataTable'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import { getAvatarColor } from '@/utils/helper-functions/getAvatarColor'
import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'
import { validateError } from '@/api'
import { deleteFacilityType, updateFacilityType } from '../api/master-config.action'
import ConfigFormDialog from './ConfigFormDialog'

const columnHelper = createColumnHelper<any>()

interface FacilityTypesListProps {
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
  isSuperAdmin?: boolean
}

const FacilityTypesList = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  isSuperAdmin = false
}: FacilityTypesListProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  const currentBId = searchParams.get('b_id') || ''

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleBusinessChange = useCallback(
    (bId: string) => {
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
    },
    [searchParams, router]
  )

  const onDeleteFacilityType = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this Facility Type?')) return

      try {
        const { errors } = await deleteFacilityType({ id, b_id: currentBId }, pathname)

        if (!errors) {
          toast.success('Facility Type deleted successfully!')
          setData(prev => prev.filter(item => item?.id !== id))
        } else {
          validateError(errors)
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete the Facility Type.')
      }
    },
    [currentBId]
  )

  const handleStatusChange = useCallback(
    async (item: any) => {
      const updatedStatus = !item?.status

      try {
        const { data: responseData, errors } = await updateFacilityType(
          {
            configData: {
              id: item?.id,
              b_id: currentBId,
              status: updatedStatus,
              name: item.name,
              key: item.key,
              description: item.description
            }
          },
          pathname
        )

        if (responseData?.updateFacilityType) {
          toast.success(`Status updated for ${item?.name || 'N/A'}`)
          addOrUpdateItem(setData, { ...item, status: updatedStatus }, 'id')
        }

        if (errors) {
          validateError(errors)
        }
      } catch (error: any) {
        toast.error(error?.message || `Failed to update status for ${item?.name || 'N/A'}`)
      }
    },
    [currentBId]
  )

  const onEditItem = useCallback((item: any) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }, [])

  const handleDataChange = (updatedItem: any) => {
    addOrUpdateItem(setData, updatedItem, 'id')
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('key', {
        header: 'Key',
        cell: ({ row }) => (
          <Typography color='text.secondary' className='font-mono text-xs bg-actionHover px-2 py-0.5 rounded border border-divider inline-block'>
            {row?.original?.key}
          </Typography>
        )
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => {
          const name = row?.original?.name || ''
          const firstLetter = name.charAt(0).toUpperCase()
          const colorClass = getAvatarColor(name)

          return (
            <div className='flex items-center gap-3'>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${colorClass}`}>
                {firstLetter}
              </div>
              <Typography color='text.primary' className='font-semibold text-[13px]'>
                {name}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Typography color='text.secondary' variant='body2' noWrap className='max-w-[200px] text-xs'>
            {row?.original?.description || '-'}
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

          return <Typography color='text.secondary' className='text-xs'>{formattedDate}</Typography>
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => onEditItem(row?.original)} color='secondary'>
              <i className='ri-edit-box-line text-textSecondary text-[18px]' />
            </IconButton>
            <IconButton size='small' onClick={() => onDeleteFacilityType(row?.original?.id)} color='error'>
              <i className='ri-delete-bin-7-line text-textSecondary text-[18px]' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteFacilityType, handleStatusChange, onEditItem]
  )

  const showAddButton = true

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
            <LocalSearchbar
              route={pathname}
              placeholder='Search Facility Types'
              className='max-sm:is-full sm:min-is-[220px]'
            />

            {isSuperAdmin && (
              <FormControl size='small' className='max-sm:is-full' sx={{ minWidth: 200 }}>
                <InputLabel id='facility-type-business-select-label'>Business Context</InputLabel>
                <Select
                  labelId='facility-type-business-select-label'
                  id='facility-type-business-select'
                  value={currentBId}
                  label='Business Context'
                  onChange={e => handleBusinessChange(e.target.value as string)}
                >
                  <MenuItem value=''>
                    All Businesses
                  </MenuItem>
                  {businessesData.map((business: any) => (
                    <MenuItem key={business.id} value={business.id}>
                      {business.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
            {showAddButton ? (
              <Button
                variant='contained'
                color='primary'
                className='max-sm:is-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => {
                  setSelectedItem(currentBId ? { b_id: currentBId } : null)
                  setDialogOpen(true)
                }}
              >
                Add Facility Type
              </Button>
            ) : (
              <Typography color='text.secondary' variant='body2' className='italic'>
                Select a business context to add facility type
              </Typography>
            )}
          </div>
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

      <ConfigFormDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        type='facility-types'
        details={selectedItem}
        onDataChange={handleDataChange}
        businessesData={businessesData}
        isSuperAdmin={isSuperAdmin}
      />
    </>
  )
}

export default FacilityTypesList
