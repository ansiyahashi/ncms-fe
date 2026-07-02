'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import {
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import ClientDateTime from '@components/common/ClientDateTime'
import LocalSearchbar from '@components/common/LocalSearchbar'
import DataTable from '@components/data-table/DataTable'
import RoleGuard from '@components/RoleGuard'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'
import { validateError } from '@/api'
import { PERMISSIONS } from '@/libs/paths'
import { useCheckUserPermission } from '@/hooks/useCheckUserPermission'

import { deleteComplaint, cancelComplaint } from '../api/complaint.action'
import ComplaintFormDialog from './ComplaintFormDialog'
import ComplaintDetailDialog from './ComplaintDetailDialog'
import ServiceRequestFormDialog from '../../service-requests/components/ServiceRequestFormDialog'

const columnHelper = createColumnHelper<any>()

interface ComplaintsTableProps {
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
  facilitiesData?: any[]
}

const ComplaintsTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  facilitiesData = []
}: ComplaintsTableProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [openConvertDialog, setOpenConvertDialog] = useState(false)

  // Cancel Complaint Dialog State
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelId, setCancelId] = useState('')
  const [cancelRemarks, setCancelRemarks] = useState('')
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false)

  const currentBId = searchParams.get('b_id') || ''
  const currentStatus = searchParams.get('status') || ''
  const currentFacilityId = searchParams.get('facility_id') || ''

  const hasAccess = useCheckUserPermission()

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

  const handleStatusChange = useCallback(
    (status: string) => {
      let newUrl = ''

      if (status) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'status',
          value: status,
          keysToRemove: ['page']
        })
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['status', 'page']
        })
      }

      router.push(newUrl, { scroll: false })
    },
    [searchParams, router]
  )

  const handleFacilityChange = useCallback(
    (fId: string) => {
      let newUrl = ''

      if (fId) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'facility_id',
          value: fId,
          keysToRemove: ['page']
        })
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['facility_id', 'page']
        })
      }

      router.push(newUrl, { scroll: false })
    },
    [searchParams, router]
  )

  const onDeleteComplaint = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this Complaint?')) return

      try {
        const { data: responseData, errors } = await deleteComplaint(id, pathname)

        if (responseData?.deleteComplaint) {
          toast.success('Complaint deleted successfully!')
          setData(prev => prev.filter(c => c?.id !== id))
        }

        validateError(errors)
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete the complaint.')
      }
    },
    [pathname]
  )

  const onCancelSubmit = async () => {
    if (!cancelRemarks.trim()) {
      toast.error('Cancellation remarks are required')

      return
    }

    setIsSubmittingCancel(true)

    try {
      const { data: responseData, errors } = await cancelComplaint(cancelId, cancelRemarks, pathname)

      if (responseData?.cancelComplaint) {
        toast.success('Complaint cancelled successfully!')
        addOrUpdateItem(setData, responseData.cancelComplaint, 'id')
        setCancelOpen(false)
        setCancelRemarks('')
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to cancel the complaint.')
    } finally {
      setIsSubmittingCancel(false)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Complaint Details',
        cell: ({ row }) => (
          <Box className='flex flex-col gap-1 py-1'>
            <Typography
              className='font-semibold text-sm cursor-pointer hover:underline text-primary'
              onClick={() => {
                setSelectedItem(row.original)
                setOpenDetailDialog(true)
              }}
            >
              {row.original.title}
            </Typography>
            <Typography variant='caption' color='textSecondary' className='line-clamp-1'>
              {row.original.description}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('facility_name', {
        header: 'Facility',
        cell: ({ row }) => <Typography variant='body2'>{row.original.facility_name || 'N/A'}</Typography>
      }),
      columnHelper.accessor('reporter', {
        header: 'Raised By',
        cell: ({ row }) => <Typography variant='body2'>{row.original.reporter || 'System'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          let color: 'primary' | 'success' | 'secondary' = 'primary'

          if (status === 'converted_to_sr') color = 'success'
          if (status === 'cancelled') color = 'secondary'

          const statusLabels = {
            raised: 'Raised',
            converted_to_sr: 'Converted to SR',
            cancelled: 'Cancelled'
          }

          return (
            <Chip
              label={statusLabels[status as keyof typeof statusLabels] || status}
              color={color}
              size='small'
              variant='tonal'
            />
          )
        }
      }),
      columnHelper.accessor('created_at', {
        header: 'Created Date',
        cell: ({ row }) => (
          <Typography variant='body2'>
            <ClientDateTime date={row.original.created_at} formatStr='toLocaleDateString' />
          </Typography>
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => {
          const canEdit = row.original.status === 'raised' && hasAccess(PERMISSIONS.COMPLAINT_EDIT)
          const canDelete = hasAccess(PERMISSIONS.COMPLAINT_DELETE)
          const canConvert = row.original.status === 'raised' && hasAccess(PERMISSIONS.SERVICE_REQUEST_CREATE)

          return (
            <Box className='flex items-center gap-1'>
              {canConvert && (
                <IconButton
                  size='small'
                  color='primary'
                  title='Convert to Service Request'
                  onClick={() => {
                    setSelectedItem(row.original)
                    setOpenConvertDialog(true)
                  }}
                >
                  <i className='ri-arrow-right-up-line text-lg' />
                </IconButton>
              )}
              {canEdit && (
                <IconButton
                  size='small'
                  color='info'
                  title='Edit Complaint'
                  onClick={() => {
                    setSelectedItem(row.original)
                    setOpenFormDialog(true)
                  }}
                >
                  <i className='ri-edit-box-line text-lg' />
                </IconButton>
              )}
              {row.original.status === 'raised' && (
                <IconButton
                  size='small'
                  color='warning'
                  title='Cancel Complaint'
                  onClick={() => {
                    setCancelId(row.original.id)
                    setCancelOpen(true)
                  }}
                >
                  <i className='ri-close-circle-line text-lg' />
                </IconButton>
              )}
              {canDelete && (
                <IconButton
                  size='small'
                  color='error'
                  title='Delete Complaint'
                  onClick={() => {
                    onDeleteComplaint(row.original.id)
                  }}
                >
                  <i className='ri-delete-bin-line text-lg' />
                </IconButton>
              )}
            </Box>
          )
        }
      })
    ],
    [onDeleteComplaint, hasAccess]
  )

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <Box className='flex flex-wrap items-center justify-between gap-4'>
            <Typography variant='h5'>Helpdesk Complaints</Typography>
            <RoleGuard allowedPermissions={[PERMISSIONS.COMPLAINT_CREATE]}>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={() => {
                  setSelectedItem(null)
                  setOpenFormDialog(true)
                }}
              >
                Raise Complaint
              </Button>
            </RoleGuard>
          </Box>

          <Grid container spacing={3}>
            {isSuperAdmin && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Business</InputLabel>
                  <Select value={currentBId} label='Business' onChange={e => handleBusinessChange(e.target.value)}>
                    <MenuItem value=''>All Businesses</MenuItem>
                    {businessesData.map((b: any) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 4 : 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select value={currentStatus} label='Status' onChange={e => handleStatusChange(e.target.value)}>
                  <MenuItem value=''>All Statuses</MenuItem>
                  <MenuItem value='raised'>Raised</MenuItem>
                  <MenuItem value='converted_to_sr'>Converted to SR</MenuItem>
                  <MenuItem value='cancelled'>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 4 : 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Facility</InputLabel>
                <Select value={currentFacilityId} label='Facility' onChange={e => handleFacilityChange(e.target.value)}>
                  <MenuItem value=''>All Facilities</MenuItem>
                  {facilitiesData.map((f: any) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <LocalSearchbar route={pathname} placeholder='Search complaints...' />

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            paginationData={initialPagination}
            pageCount={pageCount}
            perPageCount={perPageCount}
          />
        </CardContent>
      </Card>

      {/* Complaint Create/Edit Dialog */}
      <ComplaintFormDialog
        open={openFormDialog}
        setOpen={setOpenFormDialog}
        details={selectedItem}
        onDataChange={savedItem => {
          addOrUpdateItem(setData, savedItem, 'id')
        }}
        facilitiesData={facilitiesData}
        currentBId={currentBId}
      />

      {/* Complaint Detail Dialog */}
      <ComplaintDetailDialog open={openDetailDialog} setOpen={setOpenDetailDialog} details={selectedItem} />

      {/* Promote Complaint to Service Request Dialog */}
      {openConvertDialog && selectedItem && (
        <ServiceRequestFormDialog
          open={openConvertDialog}
          setOpen={setOpenConvertDialog}
          prefillComplaint={selectedItem}
          onDataChange={savedSr => {
            // Update complaint status to converted_to_sr locally
            addOrUpdateItem(setData, { ...selectedItem, status: 'converted_to_sr' }, 'id')
            toast.success(`Successfully converted complaint to SR ${savedSr.title}`)
          }}
          facilitiesData={facilitiesData}
          currentBId={currentBId}
        />
      )}

      {/* Cancel Complaint Confirmation Dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle>Cancel Complaint</DialogTitle>
        <DialogContent className='flex flex-col gap-3 min-w-[320px] pt-1'>
          <Typography variant='body2' className='mb-2'>
            Please enter remarks for cancelling this complaint.
          </Typography>
          <TextField
            autoFocus
            label='Remarks'
            fullWidth
            size='small'
            multiline
            rows={3}
            value={cancelRemarks}
            onChange={e => setCancelRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Close</Button>
          <Button onClick={onCancelSubmit} variant='contained' color='warning' disabled={isSubmittingCancel}>
            Cancel Complaint
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ComplaintsTable
