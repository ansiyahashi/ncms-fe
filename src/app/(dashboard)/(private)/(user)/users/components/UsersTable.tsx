'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
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
import { useCheckUserPermission } from '@/hooks/useCheckUserPermission'

import { deleteUser, updateUser, getPendingUsers, approveUser, rejectUser } from '../api/user.action'
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

  // New tab and pending approvals state
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')
  const [pendingData, setPendingData] = useState<any[]>([])

  const [pendingPagination, setPendingPagination] = useState({
    totalData: 0,
    totalPages: 0,
    currentPage: 0
  })

  const [pendingLoading, setPendingLoading] = useState(false)

  // Dialog states for Approve/Reject actions
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [approveUserId, setApproveUserId] = useState('')
  const [approveUserName, setApproveUserName] = useState('')

  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false)
  const [rejectUserId, setRejectUserId] = useState('')
  const [rejectUserName, setRejectUserName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  const hasAccess = useCheckUserPermission()
  const canApprove = hasAccess(PERMISSIONS.USER_APPROVE)

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

  // Fetch pending users from API client-side
  const fetchPendingUsers = useCallback(async () => {
    setPendingLoading(true)
    const q = searchParams.get('q') || ''
    const page = Number(searchParams.get('page') || 0) + 1
    const size = Number(searchParams.get('per-page') || 10)
    const b_id = searchParams.get('b_id') || ''

    try {
      const res = await getPendingUsers({
        search: q,
        page,
        size,
        b_id
      })

      if (res?.data?.users) {
        setPendingData(res.data.users.data)
        setPendingPagination({
          totalData: res.data.users.totalData,
          totalPages: res.data.users.totalPages,
          currentPage: res.data.users.currentPage
        })
      } else if (res?.errors) {
        toast.error(res.errors.message || 'Failed to load pending users.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching pending users.')
    } finally {
      setPendingLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingUsers()
    }
  }, [activeTab, fetchPendingUsers])

  const handleApproveConfirm = async () => {
    setIsSubmittingAction(true)

    try {
      const res = await approveUser(approveUserId, '/users')

      if (res?.data?.approveUser) {
        toast.success(`Successfully approved user ${approveUserName}!`)
        setApproveConfirmOpen(false)
        fetchPendingUsers()
        router.refresh()
      } else if (res?.errors) {
        toast.error(res.errors.message || 'Failed to approve user.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve user.')
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required.')
      
return
    }

    setIsSubmittingAction(true)

    try {
      const res = await rejectUser(rejectUserId, rejectionReason, '/users')

      if (res?.data?.rejectUser) {
        toast.success(`Successfully rejected user ${rejectUserName}.`)
        setRejectConfirmOpen(false)
        setRejectionReason('')
        fetchPendingUsers()
        router.refresh()
      } else if (res?.errors) {
        toast.error(res.errors.message || 'Failed to reject user.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject user.')
    } finally {
      setIsSubmittingAction(false)
    }
  }

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
      columnHelper.accessor('approval_status', {
        header: 'Approval Status',
        cell: ({ row }) => {
          const status = row?.original?.approval_status || 'approved'
          let color: 'success' | 'warning' | 'error' | 'primary' = 'success'
          let label = 'Approved'

          if (status === 'pending') {
            color = 'warning'
            label = 'Pending'
          } else if (status === 'rejected') {
            color = 'error'
            label = 'Rejected'
          }

          return <Chip variant='tonal' label={label} size='small' color={color} />
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

  const pendingColumns = useMemo(
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
                        setApproveUserId(row?.original?.id)
                        setApproveUserName(row?.original?.name || '')
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
                        setRejectUserId(row?.original?.id)
                        setRejectUserName(row?.original?.name || '')
                        setRejectConfirmOpen(true)
                      }}
                      color='error'
                    >
                      <i className='ri-close-circle-line text-error' />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title={`Awaiting approval from ${awaitingApproverLabel}`}>
                  <span>
                    <IconButton size='small' disabled color='default'>
                      <i className='ri-lock-line text-textDisabled' />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </div>
          )
        },
        enableSorting: false
      })
    ],
    [canApprove, session, getApproverDetail, departmentsData, designationsData]
  )

  const onDataChange = useCallback((data: any) => {
    addOrUpdateItem(setData, data)
  }, [])

  return (
    <>
      {canApprove && (
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{ mb: 4 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab value='all' label='All Users' />
          <Tab value='pending' label='Pending Approvals' />
        </Tabs>
      )}

      {activeTab === 'all' ? (
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
      ) : (
        <Card>
          <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
            <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
              <LocalSearchbar route={'/users'} placeholder='Search Pending' className='max-sm:is-full sm:min-is-[220px]' />
              
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
          </CardContent>
          <DataTable
            data={pendingData}
            columns={pendingColumns}
            totalData={pendingPagination.totalData}
            pageCount={pendingPagination.totalPages}
            perPageCount={perPageCount}
            loading={pendingLoading}
          />
        </Card>
      )}

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

      {/* Approve Confirm Dialog */}
      <Dialog open={approveConfirmOpen} onClose={() => setApproveConfirmOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Approve Account Registration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve the account registration for <strong>{approveUserName}</strong>?
            This will activate their account and enable their login credentials.
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
        <DialogTitle>Reject Account Registration</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3 }}>
            Please specify the reason for rejecting the registration request for <strong>{rejectUserName}</strong>:
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
    </>
  )
}

export default UsersTable
