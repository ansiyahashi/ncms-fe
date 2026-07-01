'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, FormControl, InputLabel, Select, MenuItem, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import LocalSearchbar from '@components/common/LocalSearchbar'
import DataTable from '@components/data-table/DataTable'
import RoleGuard from '@components/RoleGuard'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'
import { validateError } from '@/api'
import { PERMISSIONS } from '@/libs/paths'
import { useCheckUserPermission } from '@/hooks/useCheckUserPermission'

import { deleteServiceRequest, assignServiceRequest, escalateServiceRequest } from '../api/serviceRequest.action'
import ServiceRequestFormDialog from './ServiceRequestFormDialog'
import ServiceRequestDetailDialog from './ServiceRequestDetailDialog'
import WorkOrderFormDialog from '../../../maintenance/work-orders/components/WorkOrderFormDialog'

const columnHelper = createColumnHelper<any>()

interface ServiceRequestsTableProps {
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
  departmentsData?: any[]
  techniciansData?: any[]
}

const ServiceRequestsTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  facilitiesData = [],
  departmentsData = [],
  techniciansData = []
}: ServiceRequestsTableProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [openCreateWODialog, setOpenCreateWODialog] = useState(false)

  // Assignment Modal State
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignId, setAssignId] = useState('')
  const [assignedDepId, setAssignedDepId] = useState('')
  const [assignedTechId, setAssignedTechId] = useState('')
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false)

  // Escalation Modal State
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [escalateId, setEscalateId] = useState('')
  const [escalateRemarks, setEscalateRemarks] = useState('')
  const [isSubmittingEscalate, setIsSubmittingEscalate] = useState(false)

  const currentBId = searchParams.get('b_id') || ''
  const currentStatus = searchParams.get('status') || ''
  const currentPriority = searchParams.get('priority') || ''
  const currentFacilityId = searchParams.get('facility_id') || ''

  const hasAccess = useCheckUserPermission()

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

  const handleStatusChange = useCallback((status: string) => {
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
  }, [searchParams, router])

  const handlePriorityChange = useCallback((priority: string) => {
    let newUrl = ''
    if (priority) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'priority',
        value: priority,
        keysToRemove: ['page']
      })
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['priority', 'page']
      })
    }
    router.push(newUrl, { scroll: false })
  }, [searchParams, router])

  const handleFacilityChange = useCallback((fId: string) => {
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
  }, [searchParams, router])

  const onDeleteSR = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this Service Request?')) return

    try {
      const { data: responseData, errors } = await deleteServiceRequest(id, pathname)
      if (responseData?.deleteServiceRequest) {
        toast.success('Service Request deleted successfully!')
        setData(prev => prev.filter(c => c?.id !== id))
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete Service Request.')
    }
  }, [pathname])

  const onAssignSubmit = async () => {
    if (!assignedDepId && !assignedTechId) {
      toast.error('Please select either a department or a technician')
      return
    }

    setIsSubmittingAssign(true)
    try {
      const { data: responseData, errors } = await assignServiceRequest(assignId, {
        assigned_dep_id: assignedDepId || null,
        assigned_tech_id: assignedTechId || null
      }, pathname)

      if (responseData?.assignServiceRequest) {
        toast.success('Service Request assigned successfully!')
        addOrUpdateItem(setData, responseData.assignServiceRequest, 'id')
        setAssignOpen(false)
        setAssignedDepId('')
        setAssignedTechId('')
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign Service Request.')
    } finally {
      setIsSubmittingAssign(false)
    }
  }

  const onEscalateSubmit = async () => {
    setIsSubmittingEscalate(true)
    try {
      const { data: responseData, errors } = await escalateServiceRequest(escalateId, escalateRemarks, pathname)
      if (responseData?.escalateServiceRequest) {
        toast.success('Service Request escalated successfully!')
        addOrUpdateItem(setData, responseData.escalateServiceRequest, 'id')
        setEscalateOpen(false)
        setEscalateRemarks('')
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to escalate Service Request.')
    } finally {
      setIsSubmittingEscalate(false)
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Request Details',
      cell: ({ row }) => (
        <Box className='flex flex-col gap-1 py-1'>
          <Typography className='font-semibold text-sm cursor-pointer hover:underline text-primary' onClick={() => {
            setSelectedItem(row.original)
            setOpenDetailDialog(true)
          }}>
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
      cell: ({ row }) => (
        <Typography variant='body2'>
          {row.original.facility_name || 'N/A'}
        </Typography>
      )
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.original.priority
        let color: 'success' | 'warning' | 'error' | 'secondary' = 'secondary'
        if (priority === 'low') color = 'secondary'
        if (priority === 'medium') color = 'success'
        if (priority === 'high') color = 'warning'
        if (priority === 'emergency') color = 'error'

        return <Chip label={priority.toUpperCase()} color={color} size='small' variant='tonal' />
      }
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        let color: 'primary' | 'info' | 'warning' | 'success' | 'secondary' = 'primary'
        if (status === 'assigned') color = 'info'
        if (status === 'escalated') color = 'warning'
        if (status === 'work_order_created') color = 'success'
        if (status === 'cancelled') color = 'secondary'

        const statusLabels = {
          new: 'New',
          assigned: 'Assigned',
          escalated: 'Escalated',
          work_order_created: 'Work Order Created',
          cancelled: 'Cancelled'
        }

        return <Chip label={statusLabels[status as keyof typeof statusLabels] || status} color={color} size='small' variant='tonal' />
      }
    }),
    columnHelper.accessor('technician_name', {
      header: 'Assigned Tech',
      cell: ({ row }) => (
        <Typography variant='body2'>
          {row.original.technician_name || 'Unassigned'}
        </Typography>
      )
    }),
    columnHelper.accessor('created_at', {
      header: 'Date Raised',
      cell: ({ row }) => (
        <Typography variant='body2'>
          {new Date(row.original.created_at).toLocaleDateString()}
        </Typography>
      )
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
      cell: ({ row }) => {
        const canAssign = ['new', 'assigned', 'escalated'].includes(row.original.status) && hasAccess(PERMISSIONS.SERVICE_REQUEST_ASSIGN)
        const canEscalate = ['assigned', 'escalated'].includes(row.original.status) && hasAccess(PERMISSIONS.SERVICE_REQUEST_ESCALATE)
        const canCreateWO = ['assigned', 'escalated'].includes(row.original.status) && hasAccess(PERMISSIONS.WORK_ORDER_CREATE)
        const canDelete = hasAccess(PERMISSIONS.SERVICE_REQUEST_DELETE)

        return (
          <Box className='flex items-center gap-1'>
            {canCreateWO && (
              <IconButton size='small' color='primary' title='Create Work Order' onClick={() => {
                setSelectedItem(row.original)
                setOpenCreateWODialog(true)
              }}>
                <i className='ri-tools-line text-lg' />
              </IconButton>
            )}
            {canAssign && (
              <IconButton size='small' color='info' title='Assign' onClick={() => {
                setAssignId(row.original.id)
                setAssignedDepId(row.original.assigned_dep_id || '')
                setAssignedTechId(row.original.assigned_tech_id || '')
                setAssignOpen(true)
              }}>
                <i className='ri-user-add-line text-lg' />
              </IconButton>
            )}
            {canEscalate && (
              <IconButton size='small' color='warning' title='Escalate' onClick={() => {
                setEscalateId(row.original.id)
                setEscalateOpen(true)
              }}>
                <i className='ri-arrow-up-double-line text-lg' />
              </IconButton>
            )}
            {canDelete && (
              <IconButton size='small' color='error' title='Delete' onClick={() => {
                onDeleteSR(row.original.id)
              }}>
                <i className='ri-delete-bin-line text-lg' />
              </IconButton>
            )}
          </Box>
        )
      }
    })
  ], [onDeleteSR, hasAccess])

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <Box className='flex flex-wrap items-center justify-between gap-4'>
            <Typography variant='h5'>Service Requests</Typography>
            <RoleGuard allowedPermissions={[PERMISSIONS.SERVICE_REQUEST_CREATE]}>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={() => {
                  setSelectedItem(null)
                  setOpenFormDialog(true)
                }}
              >
                Create Service Request
              </Button>
            </RoleGuard>
          </Box>

          <Grid container spacing={3}>
            {isSuperAdmin && (
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Business</InputLabel>
                  <Select value={currentBId} label='Business' onChange={e => handleBusinessChange(e.target.value)}>
                    <MenuItem value=''>All Businesses</MenuItem>
                    {businessesData.map((b: any) => (
                      <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 3 : 4 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select value={currentStatus} label='Status' onChange={e => handleStatusChange(e.target.value)}>
                  <MenuItem value=''>All Statuses</MenuItem>
                  <MenuItem value='new'>New</MenuItem>
                  <MenuItem value='assigned'>Assigned</MenuItem>
                  <MenuItem value='escalated'>Escalated</MenuItem>
                  <MenuItem value='work_order_created'>Work Order Created</MenuItem>
                  <MenuItem value='cancelled'>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 3 : 4 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Priority</InputLabel>
                <Select value={currentPriority} label='Priority' onChange={e => handlePriorityChange(e.target.value)}>
                  <MenuItem value=''>All Priorities</MenuItem>
                  <MenuItem value='low'>Low</MenuItem>
                  <MenuItem value='medium'>Medium</MenuItem>
                  <MenuItem value='high'>High</MenuItem>
                  <MenuItem value='emergency'>Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 3 : 4 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Facility</InputLabel>
                <Select value={currentFacilityId} label='Facility' onChange={e => handleFacilityChange(e.target.value)}>
                  <MenuItem value=''>All Facilities</MenuItem>
                  {facilitiesData.map((f: any) => (
                    <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <LocalSearchbar route={pathname} placeholder='Search service requests...' />

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

      {/* Service Request Creation/Edit Form */}
      <ServiceRequestFormDialog
        open={openFormDialog}
        setOpen={setOpenFormDialog}
        onDataChange={(savedItem) => {
          addOrUpdateItem(setData, savedItem, 'id')
        }}
        facilitiesData={facilitiesData}
        currentBId={currentBId}
      />

      {/* Service Request Details Dialog */}
      <ServiceRequestDetailDialog
        open={openDetailDialog}
        setOpen={setOpenDetailDialog}
        details={selectedItem}
      />

      {/* Convert SR to Work Order Dialog */}
      {openCreateWODialog && selectedItem && (
        <WorkOrderFormDialog
          open={openCreateWODialog}
          setOpen={setOpenCreateWODialog}
          prefillSR={selectedItem}
          onDataChange={(savedWo: any) => {
            // Update SR status locally
            addOrUpdateItem(setData, { ...selectedItem, status: 'work_order_created' }, 'id')
            toast.success(`Successfully created Work Order ${savedWo.wo_number}`)
          }}
          facilitiesData={facilitiesData}
          currentBId={currentBId}
        />
      )}

      {/* Assign Modal */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Assign Service Request</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-1'>
          <FormControl fullWidth size='small'>
            <InputLabel>Department</InputLabel>
            <Select value={assignedDepId} label='Department' onChange={(e) => setAssignedDepId(e.target.value)}>
              <MenuItem value=''>Unassigned</MenuItem>
              {departmentsData.map((d: any) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size='small'>
            <InputLabel>Technician</InputLabel>
            <Select value={assignedTechId} label='Technician' onChange={(e) => setAssignedTechId(e.target.value)}>
              <MenuItem value=''>Unassigned</MenuItem>
              {techniciansData.map((t: any) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button onClick={onAssignSubmit} variant='contained' disabled={isSubmittingAssign}>
            Save Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Escalate Modal */}
      <Dialog open={escalateOpen} onClose={() => setEscalateOpen(false)}>
        <DialogTitle>Escalate Service Request</DialogTitle>
        <DialogContent className='flex flex-col gap-3 min-w-[320px] pt-1'>
          <Typography variant='body2' className='mb-2'>
            Add escalation remarks or reasons below.
          </Typography>
          <TextField
            autoFocus
            label='Remarks'
            fullWidth
            size='small'
            multiline
            rows={3}
            value={escalateRemarks}
            onChange={(e) => setEscalateRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalateOpen(false)}>Cancel</Button>
          <Button onClick={onEscalateSubmit} variant='contained' color='warning' disabled={isSubmittingEscalate}>
            Escalate Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ServiceRequestsTable
