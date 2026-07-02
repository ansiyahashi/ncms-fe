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
import { deleteFacility, updateFacility } from '../../api/facility.action'

const columnHelper = createColumnHelper<any>()

interface FacilitiesListProps {
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

const FacilitiesList = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  isSuperAdmin = false
}: FacilitiesListProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)

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

  const onDeleteItem = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this Facility?')) return

      try {
        const { errors } = await deleteFacility({ id, b_id: currentBId }, pathname)

        if (!errors) {
          toast.success('Facility deleted successfully!')
          setData(prev => prev.filter(item => item?.id !== id))
        } else {
          validateError(errors)
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete the Facility.')
      }
    },
    [currentBId, pathname]
  )

  const handleStatusChange = useCallback(
    async (item: any) => {
      const updatedStatus = !item?.status

      try {
        const { data: responseData, errors } = await updateFacility(
          {
            facilityData: {
              ...item,
              b_id: currentBId || item.b_id,
              status: updatedStatus
            }
          },
          pathname
        )

        if (responseData?.updateFacility) {
          toast.success(`Status updated for ${item?.facility_name || 'N/A'}`)
          addOrUpdateItem(setData, { ...item, status: updatedStatus }, 'id')
        }

        if (errors) {
          validateError(errors)
        }
      } catch (error: any) {
        toast.error(error?.message || `Failed to update status for ${item?.facility_name || 'N/A'}`)
      }
    },
    [currentBId, pathname]
  )

  const onEditItem = item => {
    router.push(`/facility/edit/${item.id}`)
  }

  const handleDataChange = (updatedItem: any) => {
    addOrUpdateItem(setData, updatedItem, 'id')
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('facility_name', {
        header: 'Facility',
        cell: ({ row }) => {
          const name = row?.original?.facility_name || ''
          const firstLetter = name.charAt(0).toUpperCase()
          const colorClass = getAvatarColor(name)
          const address = row?.original?.facility_address

          return (
            <div className='flex items-center gap-3'>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${colorClass}`}
              >
                {firstLetter}
              </div>
              <div className='flex flex-col'>
                <Typography color='text.primary' className='font-semibold text-[13px]'>
                  {name}
                </Typography>
                {address && (
                  <Typography
                    variant='caption'
                    color='textSecondary'
                    className='text-[10px] line-clamp-1 max-w-[200px]'
                  >
                    {address}
                  </Typography>
                )}
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('security_contact', {
        header: 'Security Contact & Facade',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2' className='text-xs font-medium'>
              {row?.original?.security_contact || '-'}
            </Typography>
            {row?.original?.facade_elevation_type && (
              <Typography variant='caption' color='textSecondary' className='text-[10px]'>
                Facade: {row?.original?.facade_elevation_type}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('structure', {
        header: 'Structure',
        cell: ({ row }) => {
          const floors = row?.original?.number_of_floors
          const staircases = row?.original?.number_of_staircases
          const elevators = row?.original?.number_of_elevators
          const escalators = row?.original?.number_of_escalators

          return (
            <div className='flex flex-col text-xs'>
              {floors != null && (
                <Typography variant='caption' className='text-xs'>
                  Floors: {floors}
                </Typography>
              )}
              <Typography variant='caption' color='textSecondary' className='text-[10px]'>
                Stair: {staircases} | Elev: {elevators} | Esc: {escalators}
              </Typography>
            </div>
          )
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

          return (
            <Typography color='text.secondary' className='text-xs'>
              {formattedDate}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' color='primary' onClick={() => router.push(`/facility/${row.original.id}`)}>
              <i className='ri-eye-line text-textSecondary text-[18px]' />
            </IconButton>
            <IconButton size='small' onClick={() => onEditItem(row?.original)} color='secondary'>
              <i className='ri-edit-box-line text-textSecondary text-[18px]' />
            </IconButton>
            <IconButton size='small' onClick={() => onDeleteItem(row?.original?.id)} color='error'>
              <i className='ri-delete-bin-7-line text-textSecondary text-[18px]' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteItem, handleStatusChange, onEditItem]
  )

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
            <LocalSearchbar
              route={pathname}
              placeholder='Search Facilities'
              className='max-sm:is-full sm:min-is-[220px]'
            />

            {isSuperAdmin && (
              <FormControl size='small' className='max-sm:is-full' sx={{ minWidth: 200 }}>
                <InputLabel id='facilities-business-select-label'>Business Context</InputLabel>
                <Select
                  labelId='facilities-business-select-label'
                  id='facilities-business-select'
                  value={currentBId}
                  label='Business Context'
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
          <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
            <Button
              variant='contained'
              color='primary'
              className='max-sm:is-full'
              startIcon={<i className='ri-add-line' />}
              onClick={() => {
                router.push(`/facility/create?b_id=${currentBId}`)
              }}
            >
              Add Facility
            </Button>
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
    </>
  )
}

export default FacilitiesList
