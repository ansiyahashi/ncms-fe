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
import { deleteDesignation, updateDesignation } from '../api/master-config.action'
import ConfigFormDialog from './ConfigFormDialog'

const columnHelper = createColumnHelper<any>()

interface DesignationsListProps {
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
  departmentsData?: any[]
  isSuperAdmin?: boolean
}

const DesignationsList = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  departmentsData = [],
  isSuperAdmin = false
}: DesignationsListProps) => {
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

  const onDeleteDesignation = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this Designation?')) return

      try {
        const { errors } = await deleteDesignation({ id, b_id: currentBId }, pathname)

        if (!errors) {
          toast.success('Designation deleted successfully!')
          setData(prev => prev.filter(item => item?.id !== id))
        } else {
          validateError(errors)
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete the Designation.')
      }
    },
    [currentBId, pathname]
  )

  const handleStatusChange = useCallback(
    async (item: any) => {
      const updatedStatus = !item?.status

      try {
        const { data: responseData, errors } = await updateDesignation(
          {
            configData: {
              id: item?.id,
              b_id: currentBId,
              status: updatedStatus,
              name: item.name,
              dep_id: item.dep_id,
              description: item.description
            }
          },
          pathname
        )

        if (responseData?.updateDesignation) {
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
    [currentBId, pathname]
  )

  const onEditItem = useCallback((item: any) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }, [])

  const handleDataChange = (updatedItem: any) => {
    // If designations return populated dep_id object, formatDesignation formats it,
    // otherwise we ensure raw dep_id matches.
    addOrUpdateItem(setData, updatedItem, 'id')
  }

  const columns = useMemo(
    () => [
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
      columnHelper.accessor('dep_id', {
        header: 'Department',
        cell: ({ row }) => {
          const depId = row?.original?.dep_id
          const department = departmentsData.find((d: any) => d.id === depId)

          return department ? (
            <Chip
              variant='tonal'
              label={department.name}
              size='small'
              color='primary'
              className='font-semibold text-[10px]'
            />
          ) : (
            <Typography color='text.secondary' className='text-xs'>-</Typography>
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
            <IconButton size='small' onClick={() => onDeleteDesignation(row?.original?.id)} color='error'>
              <i className='ri-delete-bin-7-line text-textSecondary text-[18px]' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteDesignation, handleStatusChange, onEditItem, departmentsData]
  )

  const showAddButton = true

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
            <LocalSearchbar
              route={pathname}
              placeholder='Search Designations'
              className='max-sm:is-full sm:min-is-[220px]'
            />

            {isSuperAdmin && (
              <FormControl size='small' className='max-sm:is-full' sx={{ minWidth: 180 }}>
                <InputLabel id='business-select-label'>Business</InputLabel>
                <Select
                  labelId='business-select-label'
                  id='business-select'
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

          {showAddButton && (
            <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                startIcon={<i className='ri-add-line' />}
                onClick={() => {
                  setSelectedItem(null)
                  setDialogOpen(true)
                }}
                className='max-sm:is-full'
              >
                Add Designation
              </Button>
            </div>
          )}
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
        type='designations'
        details={selectedItem}
        onDataChange={handleDataChange}
        businessesData={businessesData}
        departmentsData={departmentsData}
        isSuperAdmin={isSuperAdmin}
      />
    </>
  )
}

export default DesignationsList
