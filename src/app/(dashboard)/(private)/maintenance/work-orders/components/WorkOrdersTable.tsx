'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, FormControl, InputLabel, Select, MenuItem, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, FormHelperText, Checkbox, FormControlLabel, List, ListItem, ListItemText } from '@mui/material'
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

import { deleteWorkOrder, assignWorkOrder, updateWorkOrderWorkflow, reviewWorkOrder, closeWorkOrder } from '../api/workOrder.action'
import WorkOrderFormDialog from './WorkOrderFormDialog'
import WorkOrderDetailDialog from './WorkOrderDetailDialog'

const columnHelper = createColumnHelper<any>()

interface WorkOrdersTableProps {
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
  techniciansData?: any[]
}

const WorkOrdersTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  facilitiesData = [],
  techniciansData = []
}: WorkOrdersTableProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin
  const currentUserId = (session?.user as any)?.id || ''
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)

  // Modals state
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignId, setAssignId] = useState('')
  const [assignedTechId, setAssignedTechId] = useState('')
  const [assignRemarks, setAssignRemarks] = useState('')
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false)

  // Technician Complete Action Modal State
  const [techCompleteOpen, setTechCompleteOpen] = useState(false)
  const [techCompleteId, setTechCompleteId] = useState('')
  const [checklistTasks, setChecklistTasks] = useState<any[]>([])
  const [labourCost, setLabourCost] = useState('0')
  const [techRemarks, setTechRemarks] = useState('')
  const [isSubmittingTechAction, setIsSubmittingTechAction] = useState(false)

  // Supervisor Review Action Modal State
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewId, setReviewId] = useState('')
  const [reviewActionType, setReviewActionType] = useState<'approve' | 'reject' | 'return'>('approve')
  const [reviewRemarks, setReviewRemarks] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Client Close Action Modal State
  const [clientCloseOpen, setClientCloseOpen] = useState(false)
  const [clientCloseId, setClientCloseId] = useState('')
  const [feedbackRating, setFeedbackRating] = useState<number | null>(5)
  const [feedbackRemarks, setFeedbackRemarks] = useState('')
  const [closureRemarks, setClosureRemarks] = useState('')
  const [isSubmittingClose, setIsSubmittingClose] = useState(false)

  const currentBId = searchParams.get('b_id') || ''
  const currentStatus = searchParams.get('status') || ''
  const currentPriority = searchParams.get('priority') || ''
  const currentType = searchParams.get('type') || ''
  const currentFacilityId = searchParams.get('facility_id') || ''
  const currentTechnicianId = searchParams.get('technician_id') || ''

  const hasAccess = useCheckUserPermission()

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleQueryChange = useCallback((key: string, value: string) => {
    let newUrl = ''
    if (value) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key,
        value,
        keysToRemove: ['page']
      })
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: [key, 'page']
      })
    }
    router.push(newUrl, { scroll: false })
  }, [searchParams, router])

  const onDeleteWO = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this Work Order?')) return

    try {
      const { data: responseData, errors } = await deleteWorkOrder(id, pathname)
      if (responseData?.deleteWorkOrder) {
        toast.success('Work Order deleted successfully!')
        setData(prev => prev.filter(c => c?.id !== id))
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete Work Order.')
    }
  }, [pathname])

  const onAssignSubmit = async () => {
    if (!assignedTechId) {
      toast.error('Technician is required')
      return
    }

    setIsSubmittingAssign(true)
    try {
      const { data: responseData, errors } = await assignWorkOrder(assignId, {
        technician_id: assignedTechId,
        remarks: assignRemarks
      }, pathname)

      if (responseData?.assignWorkOrder) {
        toast.success('Technician assigned successfully!')
        addOrUpdateItem(setData, responseData.assignWorkOrder, 'id')
        setAssignOpen(false)
        setAssignedTechId('')
        setAssignRemarks('')
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign Technician.')
    } finally {
      setIsSubmittingAssign(false)
    }
  }

  const handleTechAction = async (id: string, action: string, extra: any = {}) => {
    try {
      const { data: responseData, errors } = await updateWorkOrderWorkflow(id, {
        action,
        ...extra
      }, pathname)

      if (responseData?.updateWorkOrderWorkflow) {
        toast.success(`Work Order workflow updated [${action}] successfully!`)
        addOrUpdateItem(setData, responseData.updateWorkOrderWorkflow, 'id')
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update workflow.')
    }
  }

  const handleTaskCheckboxChange = (index: number, checked: boolean) => {
    const updated = [...checklistTasks]
    updated[index].completed = checked
    setChecklistTasks(updated)
  }

  const onTechCompleteSubmit = async () => {
    setIsSubmittingTechAction(true)
    try {
      const { data: responseData, errors } = await updateWorkOrderWorkflow(techCompleteId, {
        action: 'complete',
        checklist: checklistTasks,
        labour_cost: parseFloat(labourCost) || 0,
        remarks: techRemarks
      }, pathname)

      if (responseData?.updateWorkOrderWorkflow) {
        toast.success('Work Order submitted for supervisor review!')
        addOrUpdateItem(setData, responseData.updateWorkOrderWorkflow, 'id')
        setTechCompleteOpen(false)
        setTechCompleteId('')
        setChecklistTasks([])
        setLabourCost('0')
        setTechRemarks('')
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit checklist.')
    } finally {
      setIsSubmittingTechAction(false)
    }
  }

  const onReviewSubmit = async () => {
    setIsSubmittingReview(true)
    try {
      const { data: responseData, errors } = await reviewWorkOrder(reviewId, {
        action: reviewActionType,
        remarks: reviewRemarks
      }, pathname)

      if (responseData?.reviewWorkOrder) {
        toast.success(`Supervisor review submitted: ${reviewActionType}`)
        addOrUpdateItem(setData, responseData.reviewWorkOrder, 'id')
        setReviewOpen(false)
        setReviewRemarks('')
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit review.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const onClientCloseSubmit = async () => {
    setIsSubmittingClose(true)
    try {
      const { data: responseData, errors } = await closeWorkOrder(clientCloseId, {
        feedback_rating: feedbackRating || 5,
        feedback_remarks: feedbackRemarks,
        closure_remarks: closureRemarks
      }, pathname)

      if (responseData?.closeWorkOrder) {
        toast.success('Work Order closed and archived!')
        addOrUpdateItem(setData, responseData.closeWorkOrder, 'id')
        setClientCloseOpen(false)
        setFeedbackRating(5)
        setFeedbackRemarks('')
        setClosureRemarks('')
      }
      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to close Work Order.')
    } finally {
      setIsSubmittingClose(false)
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('wo_number', {
      header: 'WO Number',
      cell: ({ row }) => (
        <Typography variant='subtitle2' className='font-bold cursor-pointer hover:underline text-primary' onClick={() => {
          setSelectedItem(row.original)
          setOpenDetailDialog(true)
        }}>
          {row.original.wo_number}
        </Typography>
      )
    }),
    columnHelper.accessor('title', {
      header: 'Title & Type',
      cell: ({ row }) => (
        <Box className='flex flex-col gap-0.5 py-1'>
          <Typography variant='body2' className='font-medium line-clamp-1'>
            {row.original.title}
          </Typography>
          <Box className='flex gap-1 items-center'>
            <Typography variant='caption' className='capitalize font-semibold text-secondary'>
              {row.original.type}
            </Typography>
            <span className='text-[8px] opacity-40'>•</span>
            <Typography variant='caption' color='textSecondary'>
              {row.original.facility_name || 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        let color: 'primary' | 'info' | 'warning' | 'success' | 'secondary' | 'error' = 'primary'
        if (['assigned', 'accepted'].includes(status)) color = 'info'
        if (['in_progress', 'pending_parts', 'submitted'].includes(status)) color = 'warning'
        if (status === 'approved') color = 'success'
        if (status === 'closed') color = 'secondary'
        if (status === 'rejected') color = 'error'

        const statusLabels = {
          draft: 'Draft',
          assigned: 'Assigned',
          accepted: 'Accepted',
          in_progress: 'In Progress',
          pending_parts: 'Pending Parts',
          submitted: 'Submitted for Review',
          approved: 'Approved',
          rejected: 'Rejected',
          closed: 'Closed / Archived'
        }

        return <Chip label={statusLabels[status as keyof typeof statusLabels] || status} color={color} size='small' variant='tonal' />
      }
    }),
    columnHelper.accessor('technician_name', {
      header: 'Technician',
      cell: ({ row }) => (
        <Typography variant='body2'>
          {row.original.technician_name || 'Unassigned'}
        </Typography>
      )
    }),
    columnHelper.accessor('sla_due_time', {
      header: 'SLA Status',
      cell: ({ row }) => {
        const isClosed = row.original.status === 'closed'
        const isBreached = !isClosed && new Date() > new Date(row.original.sla_due_time)

        if (isClosed) return <Chip label='Completed' color='success' size='small' variant='outlined' />

        return (
          <Chip
            label={isBreached ? 'SLA BREACH' : 'In SLA'}
            color={isBreached ? 'error' : 'success'}
            size='small'
            variant='tonal'
            icon={isBreached ? <i className='ri-error-warning-line' /> : <i className='ri-checkbox-circle-line' />}
          />
        )
      }
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
      cell: ({ row }) => {
        const isSupervisor = hasAccess(PERMISSIONS.WORK_ORDER_APPROVE)
        const isTech = currentUserId && row.original.technician_id === currentUserId
        const status = row.original.status

        const canAssign = status === 'draft' && hasAccess(PERMISSIONS.WORK_ORDER_ASSIGN)
        const canDelete = hasAccess(PERMISSIONS.WORK_ORDER_DELETE)

        return (
          <Box className='flex items-center gap-1'>
            {/* Supervisor Review action */}
            {status === 'submitted' && isSupervisor && (
              <IconButton size='small' color='success' title='Review Work Order' onClick={() => {
                setReviewId(row.original.id)
                setReviewOpen(true)
              }}>
                <i className='ri-shield-check-line text-lg' />
              </IconButton>
            )}

            {/* Client feedback/close action */}
            {status === 'approved' && hasAccess(PERMISSIONS.WORK_ORDER_CLOSE) && (
              <IconButton size='small' color='success' title='Close Work Order' onClick={() => {
                setClientCloseId(row.original.id)
                setClientCloseOpen(true)
              }}>
                <i className='ri-archive-line text-lg' />
              </IconButton>
            )}

            {/* Tech flow actions */}
            {isTech && status === 'assigned' && (
              <IconButton size='small' color='info' title='Accept Task' onClick={() => handleTechAction(row.original.id, 'accept')}>
                <i className='ri-thumb-up-line text-lg' />
              </IconButton>
            )}
            {isTech && status === 'accepted' && (
              <IconButton size='small' color='warning' title='Start Work' onClick={() => handleTechAction(row.original.id, 'start')}>
                <i className='ri-play-circle-line text-lg' />
              </IconButton>
            )}
            {isTech && status === 'in_progress' && (
              <IconButton size='small' color='success' title='Complete Checklist & Submit' onClick={() => {
                setTechCompleteId(row.original.id)
                setChecklistTasks(row.original.checklist || [])
                setTechCompleteOpen(true)
              }}>
                <i className='ri-checkbox-circle-line text-lg' />
              </IconButton>
            )}

            {canAssign && (
              <IconButton size='small' color='info' title='Assign Technician' onClick={() => {
                setAssignId(row.original.id)
                setAssignedTechId(row.original.technician_id || '')
                setAssignRemarks('')
                setAssignOpen(true)
              }}>
                <i className='ri-user-add-line text-lg' />
              </IconButton>
            )}

            {canDelete && (
              <IconButton size='small' color='error' title='Delete Work Order' onClick={() => {
                onDeleteWO(row.original.id)
              }}>
                <i className='ri-delete-bin-line text-lg' />
              </IconButton>
            )}
          </Box>
        )
      }
    })
  ], [onDeleteWO, currentUserId, hasAccess])

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <Box className='flex flex-wrap items-center justify-between gap-4'>
            <Typography variant='h5'>Work Orders</Typography>
            <RoleGuard allowedPermissions={[PERMISSIONS.WORK_ORDER_CREATE]}>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={() => {
                  setSelectedItem(null)
                  setOpenFormDialog(true)
                }}
              >
                Create Work Order
              </Button>
            </RoleGuard>
          </Box>

          <Grid container spacing={3}>
            {isSuperAdmin && (
              <Grid size={{ xs: 12, sm: 2.4 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Business</InputLabel>
                  <Select value={currentBId} label='Business' onChange={e => handleQueryChange('b_id', e.target.value)}>
                    <MenuItem value=''>All Businesses</MenuItem>
                    {businessesData.map((b: any) => (
                      <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 2.4 : 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select value={currentStatus} label='Status' onChange={e => handleQueryChange('status', e.target.value)}>
                  <MenuItem value=''>All Statuses</MenuItem>
                  <MenuItem value='draft'>Draft</MenuItem>
                  <MenuItem value='assigned'>Assigned</MenuItem>
                  <MenuItem value='accepted'>Accepted</MenuItem>
                  <MenuItem value='in_progress'>In Progress</MenuItem>
                  <MenuItem value='submitted'>Submitted</MenuItem>
                  <MenuItem value='approved'>Approved</MenuItem>
                  <MenuItem value='closed'>Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 2.4 : 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Type</InputLabel>
                <Select value={currentType} label='Type' onChange={e => handleQueryChange('type', e.target.value)}>
                  <MenuItem value=''>All Types</MenuItem>
                  <MenuItem value='preventive'>Preventive</MenuItem>
                  <MenuItem value='corrective'>Corrective</MenuItem>
                  <MenuItem value='emergency'>Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 2.4 : 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Priority</InputLabel>
                <Select value={currentPriority} label='Priority' onChange={e => handleQueryChange('priority', e.target.value)}>
                  <MenuItem value=''>All Priorities</MenuItem>
                  <MenuItem value='low'>Low</MenuItem>
                  <MenuItem value='medium'>Medium</MenuItem>
                  <MenuItem value='high'>High</MenuItem>
                  <MenuItem value='emergency'>Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: isSuperAdmin ? 2.4 : 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Facility</InputLabel>
                <Select value={currentFacilityId} label='Facility' onChange={e => handleQueryChange('facility_id', e.target.value)}>
                  <MenuItem value=''>All Facilities</MenuItem>
                  {facilitiesData.map((f: any) => (
                    <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <LocalSearchbar route={pathname} placeholder='Search work orders...' />

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

      {/* Create Work Order Modal */}
      <WorkOrderFormDialog
        open={openFormDialog}
        setOpen={setOpenFormDialog}
        onDataChange={(savedItem) => {
          addOrUpdateItem(setData, savedItem, 'id')
        }}
        facilitiesData={facilitiesData}
        currentBId={currentBId}
      />

      {/* Details Dialog */}
      <WorkOrderDetailDialog
        open={openDetailDialog}
        setOpen={setOpenDetailDialog}
        details={selectedItem}
      />

      {/* Assign Technician Modal */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Assign Technician</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-1'>
          <FormControl fullWidth size='small'>
            <InputLabel>Technician</InputLabel>
            <Select value={assignedTechId} label='Technician' onChange={(e) => setAssignedTechId(e.target.value)}>
              <MenuItem value=''>Unassigned</MenuItem>
              {techniciansData.map((t: any) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label='Remarks / Work Dispatch Note'
            fullWidth
            size='small'
            multiline
            rows={2}
            value={assignRemarks}
            onChange={(e) => setAssignRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button onClick={onAssignSubmit} variant='contained' disabled={isSubmittingAssign}>
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Technician Complete Action Modal */}
      <Dialog open={techCompleteOpen} onClose={() => setTechCompleteOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Complete Work Order Checklist</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-1'>
          <Typography variant='subtitle2' className='font-semibold'>
            Mark tasks as completed:
          </Typography>
          <List>
            {checklistTasks.map((item: any, idx: number) => (
              <ListItem key={idx} disablePadding>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!item.completed}
                      onChange={(e) => handleTaskCheckboxChange(idx, e.target.checked)}
                    />
                  }
                  label={item.task}
                />
              </ListItem>
            ))}
          </List>

          <TextField
            label='Labour Cost ($)'
            type='number'
            fullWidth
            size='small'
            value={labourCost}
            onChange={(e) => setLabourCost(e.target.value)}
          />

          <TextField
            label='Technician Remarks / Completion Notes'
            fullWidth
            size='small'
            multiline
            rows={3}
            value={techRemarks}
            onChange={(e) => setTechRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTechCompleteOpen(false)}>Cancel</Button>
          <Button onClick={onTechCompleteSubmit} variant='contained' color='success' disabled={isSubmittingTechAction}>
            Submit Work Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Supervisor Review Action Modal */}
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Review Submitted Work Order</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-1'>
          <FormControl fullWidth size='small'>
            <InputLabel>Review Action</InputLabel>
            <Select value={reviewActionType} label='Review Action' onChange={(e) => setReviewActionType(e.target.value as any)}>
              <MenuItem value='approve'>Approve Work</MenuItem>
              <MenuItem value='reject'>Reject Work</MenuItem>
              <MenuItem value='return'>Return to Technician</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label='Review Remarks'
            fullWidth
            size='small'
            multiline
            rows={3}
            value={reviewRemarks}
            onChange={(e) => setReviewRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)}>Cancel</Button>
          <Button onClick={onReviewSubmit} variant='contained' color='primary' disabled={isSubmittingReview}>
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Client Feedback & Close Action Modal */}
      <Dialog open={clientCloseOpen} onClose={() => setClientCloseOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Close Work Order</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-1'>
          <Box className='flex flex-col gap-1 items-center mb-2'>
            <Typography variant='subtitle2'>Rate Quality of Service</Typography>
            <Rating
              value={feedbackRating}
              onChange={(event, newValue) => setFeedbackRating(newValue)}
            />
          </Box>
          <TextField
            label='Feedback Remarks (What went well/unwell)'
            fullWidth
            size='small'
            multiline
            rows={2}
            value={feedbackRemarks}
            onChange={(e) => setFeedbackRemarks(e.target.value)}
          />
          <TextField
            label='Closure Notes'
            fullWidth
            size='small'
            multiline
            rows={2}
            value={closureRemarks}
            onChange={(e) => setClosureRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientCloseOpen(false)}>Cancel</Button>
          <Button onClick={onClientCloseSubmit} variant='contained' color='success' disabled={isSubmittingClose}>
            Close & Archive WO
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default WorkOrdersTable
