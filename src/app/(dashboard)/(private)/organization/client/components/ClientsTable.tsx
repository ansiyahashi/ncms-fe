'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch, FormControl, InputLabel, Select, MenuItem, Box, Grid, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, CircularProgress } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import LocalSearchbar from '@components/common/LocalSearchbar'
import DataTable from '@components/data-table/DataTable'
import RoleGuard from '@components/RoleGuard'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import { getAvatarColor } from '@/utils/helper-functions/getAvatarColor'
import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'
import { validateError } from '@/api'
import { PERMISSIONS } from '@/libs/paths'
import { useCheckUserPermission } from '@/hooks/useCheckUserPermission'

import { deleteClient, updateClientStatus, getPendingClients, approveClient, rejectClient } from '../api/client.action'
import ClientFormDialog from './ClientFormDialog'

const columnHelper = createColumnHelper<any>()

interface ClientsTableProps {
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
  rolesData?: any[]
}

const ClientsTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  rolesData = []
}: ClientsTableProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)

  const currentBId = searchParams.get('b_id') || ''

  const hasAccess = useCheckUserPermission()
  const canApprove = hasAccess(PERMISSIONS.CLIENT_APPROVE)
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')

  // Pending Approvals States
  const [pendingData, setPendingData] = useState<any[]>([])

  const [pendingPagination, setPendingPagination] = useState({
    totalData: 0,
    totalPages: 0,
    currentPage: 0
  })

  const [pendingLoading, setPendingLoading] = useState(false)

  // Dialog states for Approve/Reject actions
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [approveClientId, setApproveClientId] = useState('')
  const [approveClientName, setApproveClientName] = useState('')

  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false)
  const [rejectClientId, setRejectClientId] = useState('')
  const [rejectClientName, setRejectClientName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Count Stats
  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(c => c.status).length
    const inactive = total - active

    return { total, active, inactive }
  }, [data])

  const fetchPendingClients = useCallback(async () => {
    setPendingLoading(true)

    try {
      const query = searchParams.get('q') || ''
      const page = Number(searchParams.get('page') || 0)
      const size = Number(searchParams.get('per-page') || 10)
      const b_id = searchParams.get('b_id') || ''

      const res = await getPendingClients({
        search: query,
        page: page + 1,
        size,
        b_id
      })

      if (res?.data?.clients) {
        setPendingData(res.data.clients.data)
        setPendingPagination({
          totalData: res.data.clients.totalData,
          totalPages: res.data.clients.totalPages,
          currentPage: res.data.clients.currentPage
        })
      } else if (res?.errors) {
        toast.error(res.errors.message || 'Failed to load pending clients.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching pending clients.')
    } finally {
      setPendingLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingClients()
    }
  }, [activeTab, fetchPendingClients])

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

  const onDeleteClient = useCallback(async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this Client?')) return

    try {
      const { data: responseData, errors } = await deleteClient({ id: clientId }, pathname)

      if (responseData?.deleteClient) {
        toast.success('Client deleted successfully!')
        setData(prev => prev.filter(c => c?.id !== responseData?.deleteClient?.id))
        setPendingData(prev => prev.filter(c => c?.id !== responseData?.deleteClient?.id))
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete the client.')
    }
  }, [pathname])

  const handleStatusChange = useCallback(async (client: any) => {
    const updatedStatus = !client?.status

    try {
      const { data: responseData, errors } = await updateClientStatus(client?.id, updatedStatus, pathname)

      if (responseData?.updateClientStatus) {
        toast.success(`Status updated for ${client?.name || 'N/A'}`)
        addOrUpdateItem(setData, { ...client, status: updatedStatus }, 'id')
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || `Failed to update status for ${client?.name || 'N/A'}`)
    }
  }, [pathname])

  const onEditItem = useCallback((item: any) => {
    setSelectedItem(item)
    setOpenDialog(true)
  }, [])

  const onDataChange = useCallback((updatedItem: any) => {
    addOrUpdateItem(setData, updatedItem, 'id')

    if (activeTab === 'pending') {
      fetchPendingClients()
    }
  }, [activeTab, fetchPendingClients])

  const getApproverDetail = useCallback((step: any) => {
    if (!step) return 'N/A'
    if (step.approver_type === 'manager') return 'Manager (Direct Supervisor)'

    if (step.approver_type === 'role') {
      const foundRole = rolesData.find((r: any) => r.id === step.approver_id)

      
return foundRole ? `Role: ${foundRole.name}` : `Role: ${step.approver_id}`
    }

    if (step.approver_type === 'user') {
      return `User: ${step.approver_id}`
    }

    return 'N/A'
  }, [rolesData])

  const handleApproveConfirm = async () => {
    setIsSubmittingAction(true)

    try {
      const res = await approveClient(approveClientId, pathname)

      if (res?.data?.approveClient) {
        toast.success(`Successfully approved client ${approveClientName}!`)

        if (activeTab === 'pending') {
          setPendingData(prev => prev.filter(c => c?.id !== approveClientId))
        } else {
          addOrUpdateItem(setData, res.data.approveClient, 'id')
        }

        setApproveConfirmOpen(false)
      } else {
        validateError(res.errors)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve client.')
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) return
    setIsSubmittingAction(true)

    try {
      const res = await rejectClient(rejectClientId, rejectionReason, pathname)

      if (res?.data?.rejectClient) {
        toast.success(`Successfully rejected client ${rejectClientName}.`)

        if (activeTab === 'pending') {
          setPendingData(prev => prev.filter(c => c?.id !== rejectClientId))
        } else {
          addOrUpdateItem(setData, res.data.rejectClient, 'id')
        }

        setRejectConfirmOpen(false)
        setRejectionReason('')
      } else {
        validateError(res.errors)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject client.')
    } finally {
      setIsSubmittingAction(false)
    }
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
      columnHelper.accessor('code', {
        header: 'Code',
        cell: ({ row }) => (
          <Typography color='text.secondary' className='font-mono text-xs bg-actionHover px-2 py-0.5 rounded border border-divider inline-block'>
            {row?.original?.code || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('contact_person', {
        header: 'Contact Details',
        cell: ({ row }) => (
          <div className='flex flex-col gap-0.5'>
            <Typography className='text-xs font-semibold text-textPrimary'>
              {row?.original?.contact_person || '-'}
            </Typography>
            {row?.original?.email && (
              <Typography className='text-[10px] text-textSecondary flex items-center gap-1'>
                <i className='ri-mail-line' /> {row?.original?.email}
              </Typography>
            )}
            {row?.original?.phone && (
              <Typography className='text-[10px] text-textSecondary flex items-center gap-1'>
                <i className='ri-phone-line' /> {row?.original?.phone}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('vat_trn_no', {
        header: 'Tax & License',
        cell: ({ row }) => (
          <div className='flex flex-col gap-0.5'>
            {row?.original?.vat_trn_no && (
              <Typography className='text-[11px] text-textPrimary font-mono'>
                TRN: {row?.original?.vat_trn_no}
              </Typography>
            )}
            {row?.original?.trade_licence_no && (
              <Typography className='text-[10px] text-textSecondary font-mono'>
                Lic: {row?.original?.trade_licence_no}
              </Typography>
            )}
            {!row?.original?.vat_trn_no && !row?.original?.trade_licence_no && (
              <Typography className='text-xs text-textSecondary'>-</Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('approval_status', {
        header: 'Approval Status',
        cell: ({ row }) => {
          const status = row?.original?.approval_status || 'approved'
          let color: 'success' | 'warning' | 'error' = 'success'
          let label = 'Approved'

          if (status === 'pending') {
            color = 'warning'
            label = 'Awaiting Approval'
          } else if (status === 'rejected') {
            color = 'error'
            label = 'Rejected'
          }

          return (
            <Chip
              variant='tonal'
              label={label}
              size='small'
              color={color}
              className='capitalize font-medium text-xs'
            />
          )
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const isPendingOrRejected = row?.original?.approval_status === 'pending' || row?.original?.approval_status === 'rejected'

          return (
            <div className='flex items-center gap-1.5'>
              <Chip
                variant='tonal'
                size='small'
                label={row?.original?.status ? 'Active' : 'Inactive'}
                color={row?.original?.status ? 'success' : 'warning'}
                className='font-medium text-xs'
              />
              {!isPendingOrRejected && (
                <Switch
                  checked={row?.original?.status}
                  onChange={() => handleStatusChange(row?.original)}
                  inputProps={{ 'aria-label': 'status-toggle' }}
                />
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <RoleGuard allowedPermissions={[PERMISSIONS.CLIENT_EDIT]}>
              <IconButton size='small' onClick={() => onEditItem(row?.original)} color='secondary'>
                <i className='ri-edit-box-line text-textSecondary text-[18px]' />
              </IconButton>
            </RoleGuard>
            <RoleGuard allowedPermissions={[PERMISSIONS.CLIENT_DELETE]}>
              <IconButton size='small' onClick={() => onDeleteClient(row?.original?.id)} color='error'>
                <i className='ri-delete-bin-7-line text-textSecondary text-[18px]' />
              </IconButton>
            </RoleGuard>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteClient, handleStatusChange, onEditItem]
  )

  const pendingColumns = useMemo(
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
      columnHelper.accessor('code', {
        header: 'Code',
        cell: ({ row }) => (
          <Typography color='text.secondary' className='font-mono text-xs bg-actionHover px-2 py-0.5 rounded border border-divider inline-block'>
            {row?.original?.code || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('contact_person', {
        header: 'Contact Details',
        cell: ({ row }) => (
          <div className='flex flex-col gap-0.5'>
            <Typography className='text-xs font-semibold text-textPrimary'>
              {row?.original?.contact_person || '-'}
            </Typography>
            {row?.original?.email && (
              <Typography className='text-[10px] text-textSecondary flex items-center gap-1'>
                <i className='ri-mail-line' /> {row?.original?.email}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('workflow_stage', {
        header: 'Workflow Stage',
        cell: ({ row }) => {
          const steps = row?.original?.approval_steps || []
          const currentStepNum = row?.original?.current_approval_step || 1

          if (steps.length === 0) {
            return (
              <Chip
                variant='tonal'
                label='Direct Admin Approval'
                size='small'
                color='primary'
              />
            )
          }

          const currentStep = steps[currentStepNum - 1]

          if (!currentStep) return <Typography color='text.secondary'>Completed</Typography>

          const approverLabel = getApproverDetail(currentStep)

          return (
            <div className='flex flex-col gap-1'>
              <Typography className='text-xs font-semibold'>
                Step {currentStepNum} of {steps.length}
              </Typography>
              <Typography className='text-[11px]' color='text.secondary'>
                {approverLabel}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => {
          const steps = row?.original?.approval_steps || []
          const currentStepNum = row?.original?.current_approval_step || 1
          
          let isAuthorized = false
          let awaitingApproverLabel = ''

          if (steps.length === 0) {
            isAuthorized = canApprove
            awaitingApproverLabel = 'Any Administrator'
          } else {
            const currentStep = steps[currentStepNum - 1]

            if (currentStep) {
              awaitingApproverLabel = getApproverDetail(currentStep)

              if (session?.user?.is_super_admin) {
                isAuthorized = true
              } else if (currentStep.approver_type === 'user') {
                isAuthorized = String(session?.user?.id) === String(currentStep.approver_id)
              } else if (currentStep.approver_type === 'role') {
                isAuthorized = String(session?.user?.role_id) === String(currentStep.approver_id)
              } else if (currentStep.approver_type === 'manager') {
                const userRole = rolesData.find((r: any) => r.id === session?.user?.role_id)

                if (userRole && userRole.name.toLowerCase() === 'manager') {
                  isAuthorized = true
                }
              }
            }
          }

          return (
            <div className='flex items-center gap-1'>
              {isAuthorized ? (
                <>
                  <Tooltip title="Approve Registration">
                    <IconButton
                      size='small'
                      onClick={() => {
                        setApproveClientId(row?.original?.id)
                        setApproveClientName(row?.original?.name || '')
                        setApproveConfirmOpen(true)
                      }}
                      color='success'
                    >
                      <i className='ri-checkbox-circle-line text-success' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject Registration">
                    <IconButton
                      size='small'
                      onClick={() => {
                        setRejectClientId(row?.original?.id)
                        setRejectClientName(row?.original?.name || '')
                        setRejectConfirmOpen(true)
                      }}
                      color='error'
                    >
                      <i className='ri-close-circle-line text-error' />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Typography className='text-xs text-textSecondary italic'>
                  Awaiting {awaitingApproverLabel}
                </Typography>
              )}
            </div>
          )
        },
        enableSorting: false
      })
    ],
    [canApprove, session, getApproverDetail]
  )

  return (
    <Box className='flex flex-col gap-6 w-full'>
      {/* Title Header */}
      <Box className='flex flex-col gap-1'>
        <Typography variant='h4' className='font-bold tracking-tight text-textPrimary'>
          Clients Directory
        </Typography>
        <Typography variant='body2' className='text-textSecondary'>
          Manage client profiles, key accounts, and legal registrations. Setup billing and billing codes to manage invoicing contexts.
        </Typography>
      </Box>

      {/* Modern Stats summary */}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='border border-divider shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 via-backgroundPaper to-backgroundPaper relative'>
            <Box className='absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none' />
            <CardContent className='p-5 flex items-center justify-between'>
              <Box className='flex flex-col gap-1'>
                <Typography className='text-textSecondary font-semibold text-xs uppercase tracking-wider'>Total Clients</Typography>
                <Typography variant='h3' className='font-bold text-textPrimary'>{stats.total}</Typography>
              </Box>
              <Box className='w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-xs'>
                <i className='ri-briefcase-line text-2xl' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='border border-divider shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-success/10 via-backgroundPaper to-backgroundPaper relative'>
            <Box className='absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-2xl pointer-events-none' />
            <CardContent className='p-5 flex items-center justify-between'>
              <Box className='flex flex-col gap-1'>
                <Typography className='text-textSecondary font-semibold text-xs uppercase tracking-wider'>Active Clients</Typography>
                <Typography variant='h3' className='font-bold text-textPrimary'>{stats.active}</Typography>
              </Box>
              <Box className='w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/20 shrink-0 shadow-xs'>
                <i className='ri-checkbox-circle-line text-2xl' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='border border-divider shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-warning/10 via-backgroundPaper to-backgroundPaper relative'>
            <Box className='absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none' />
            <CardContent className='p-5 flex items-center justify-between'>
              <Box className='flex flex-col gap-1'>
                <Typography className='text-textSecondary font-semibold text-xs uppercase tracking-wider'>Inactive Clients</Typography>
                <Typography variant='h3' className='font-bold text-textPrimary'>{stats.inactive}</Typography>
              </Box>
              <Box className='w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center border border-warning/20 shrink-0 shadow-xs'>
                <i className='ri-error-warning-line text-2xl' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {canApprove && (
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{ mb: 4 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab value='all' label='All Clients' />
          <Tab value='pending' label='Pending Approvals' />
        </Tabs>
      )}

      {activeTab === 'all' ? (
        <Card>
          <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
            <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
              <LocalSearchbar route={'/organization/client'} placeholder='Search Clients' className='max-sm:is-full sm:min-is-[220px]' />
              
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
            </div>

            <RoleGuard allowedPermissions={[PERMISSIONS.CLIENT_CREATE]}>
              <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
                <Button
                  variant='contained'
                  color='primary'
                  className='max-sm:is-full'
                  startIcon={<i className='ri-add-line' />}
                  onClick={() => {
                    setSelectedItem(null)
                    setOpenDialog(true)
                  }}
                >
                  Add Client
                </Button>
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
      ) : (
        <Card>
          <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
            <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
              <LocalSearchbar route={'/organization/client'} placeholder='Search Pending Clients' className='max-sm:is-full sm:min-is-[220px]' />
              
              {isSuperAdmin && (
                <FormControl size='small' className='max-sm:is-full' sx={{ minWidth: 180 }}>
                  <InputLabel id='business-pending-select-label'>Business</InputLabel>
                  <Select
                    labelId='business-pending-select-label'
                    id='business-pending-select'
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
          </CardContent>
          <DataTable
            data={pendingData}
            columns={pendingColumns}
            totalData={pendingPagination.totalData}
            pageCount={pageCount}
            perPageCount={perPageCount}
            loading={pendingLoading}
          />
        </Card>
      )}

      <ClientFormDialog
        open={openDialog}
        setOpen={setOpenDialog}
        details={selectedItem}
        onDataChange={onDataChange}
        businessesData={businessesData}
        currentBId={currentBId}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Approve Confirm Dialog */}
      <Dialog open={approveConfirmOpen} onClose={() => setApproveConfirmOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Approve Client Registration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve the client registration for <strong>{approveClientName}</strong>?
            This will progress the client to the next stage or fully activate their client account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveConfirmOpen(false)} color='secondary' disabled={isSubmittingAction}>
            Cancel
          </Button>
          <Button onClick={handleApproveConfirm} color='success' variant='contained' disabled={isSubmittingAction}>
            {isSubmittingAction ? <CircularProgress size={20} color='inherit' /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectConfirmOpen} onClose={() => setRejectConfirmOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Reject Client Registration</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3 }}>
            Please specify the reason for rejecting the registration request for <strong>{rejectClientName}</strong>:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            size='small'
            label='Rejection Reason'
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={isSubmittingAction}
            error={rejectConfirmOpen && !rejectionReason.trim()}
            helperText={rejectConfirmOpen && !rejectionReason.trim() ? 'Reason is required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectConfirmOpen(false)} color='secondary' disabled={isSubmittingAction}>
            Cancel
          </Button>
          <Button onClick={handleRejectConfirm} color='error' variant='contained' disabled={isSubmittingAction}>
            {isSubmittingAction ? <CircularProgress size={20} color='inherit' /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ClientsTable
