'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import { format } from 'date-fns'

import LocalSearchbar from '@components/common/LocalSearchbar'
import { deleteWorkflow, updateWorkflow } from '../api/approval.action'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import DataTable from '@components/data-table/DataTable'
import { PERMISSIONS } from '@/libs/paths'
import RoleGuard from '@components/RoleGuard'
import { validateError } from '@/api'
import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'
import { getLookupRoles, getLookupUsers } from '@/libs/actions/lookup.action'

const columnHelper = createColumnHelper<any>()

interface ApprovalsTableProps {
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
}

const entityTypeLabels: Record<string, string> = {
  user: 'User',
  material_request: 'Material Request',
  purchase_request: 'Purchase Request',
  work_order: 'Work Order',
  client: 'Client',
  asset_transfer: 'Asset Transfer'
}

const ApprovalsTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = []
}: ApprovalsTableProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin || false
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)
  const [roles, setRoles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const currentBId = searchParams.get('b_id') || ''
  const currentEntityType = searchParams.get('entity_type') || ''

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Fetch roles and users lookup to resolve names in the steps rendering
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [rolesRes, usersRes] = await Promise.all([
          getLookupRoles(currentBId ? { b_id: currentBId } : {}),
          getLookupUsers(currentBId ? { b_id: currentBId } : {})
        ])

        if (rolesRes?.data?.roles?.data) {
          setRoles(rolesRes.data.roles.data)
        }

        if (usersRes?.data?.users?.data) {
          setUsers(usersRes.data.users.data)
        }
      } catch (error) {
        console.error('Failed to load lookups for approvals mapping:', error)
      }
    }

    fetchLookups()
  }, [currentBId])

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

  const handleEntityTypeChange = useCallback((entityType: string) => {
    let newUrl = ''

    if (entityType) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'entity_type',
        value: entityType,
        keysToRemove: ['page']
      })
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['entity_type', 'page']
      })
    }

    router.push(newUrl, { scroll: false })
  }, [searchParams, router])

  const onDeleteWorkflow = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this approval workflow?')) return

    try {
      const { data: responseData, errors } = await deleteWorkflow({ id }, pathname)

      if (responseData?.deleteWorkflow) {
        toast.success('Approval workflow deleted successfully!')
        setData(prev => prev.filter(w => w?.id !== responseData?.deleteWorkflow?.id))
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete the approval workflow.')
    }
  }, [pathname])

  const handleStatusChange = useCallback(async (workflow: any) => {
    const updatedStatus = !workflow?.status

    try {
      const { data: responseData, errors } = await updateWorkflow(
        {
          workflowData: {
            id: workflow?.id,
            name: workflow.name,
            entity_type: workflow.entity_type,
            description: workflow.description,
            status: updatedStatus
          },
          steps: workflow.steps
        },
        pathname
      )

      if (responseData?.updateWorkflow) {
        toast.success(`Status successfully updated for ${workflow?.name || 'N/A'}`)
        addOrUpdateItem(setData, { ...workflow, status: updatedStatus }, 'id')
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || `Failed to update status for ${workflow?.name || 'N/A'}`)
    }
  }, [pathname])

  const onEditItem = useCallback(
    (item: any) => {
      router.push(`/organization/approvals/${item.id}/edit`)
    },
    [router]
  )

  const getApproverName = useCallback((step: any) => {
    if (step.approver_type === 'manager') return 'Manager'

    if (step.approver_type === 'role') {
      const role = roles.find((r: any) => r.id === step.approver_id)

      return role ? `Role: ${role.name}` : `Role: ${step.approver_id}`
    }

    if (step.approver_type === 'user') {
      const user = users.find((u: any) => u.id === step.approver_id)

      return user ? `User: ${user.name}` : `User: ${step.approver_id}`
    }

    return 'Unknown'
  }, [roles, users])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Workflow Details',
        cell: ({ row }) => (
          <div className='flex flex-col gap-0.5 max-w-[250px]'>
            <Typography color='text.primary' className='font-semibold text-[13px]'>
              {row?.original?.name}
            </Typography>
            {row?.original?.description && (
              <Typography variant='caption' color='text.secondary' className='truncate text-[11px]'>
                {row?.original?.description}
              </Typography>
            )}
          </div>
        )
      }),

      columnHelper.accessor('entity_type', {
        header: 'Entity Type',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            size='small'
            label={entityTypeLabels[row?.original?.entity_type] || row?.original?.entity_type}
            color='primary'
          />
        )
      }),

      columnHelper.accessor('steps', {
        header: 'Approval Steps / Sequence',
        cell: ({ row }) => {
          const steps = row?.original?.steps || []

          if (steps.length === 0) {
            return (
              <Typography variant='caption' className='text-xs italic text-textDisabled'>
                No steps configured
              </Typography>
            )
          }

          return (
            <div className='flex items-center gap-1.5 flex-wrap'>
              {steps.map((step: any, idx: number) => {
                const approverLabel = getApproverName(step)
                const stepLabel = step.label ? ` (${step.label})` : ''

                return (
                  <div key={idx} className='flex items-center gap-1.5'>
                    <Chip
                      variant='outlined'
                      size='small'
                      label={`${idx + 1}. ${approverLabel}${stepLabel}`}
                      sx={{ fontSize: '11px', height: '24px' }}
                    />
                    {idx < steps.length - 1 && (
                      <i className='ri-arrow-right-line text-textDisabled text-xs' />
                    )}
                  </div>
                )
              })}
            </div>
          )
        },
        enableSorting: false
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

          return <Typography className='text-xs'>{formattedDate}</Typography>
        }
      }),

      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <RoleGuard allowedPermissions={[PERMISSIONS.APPROVAL_DELETE]}>
              <IconButton size='small' onClick={() => onDeleteWorkflow(row?.original?.id)} color='error'>
                <i className='ri-delete-bin-7-line text-textSecondary text-lg' />
              </IconButton>
            </RoleGuard>

            <RoleGuard allowedPermissions={[PERMISSIONS.APPROVAL_EDIT]}>
              <IconButton size='small' onClick={() => onEditItem(row?.original)}>
                <i className='ri-edit-box-line text-textSecondary text-lg' />
              </IconButton>
            </RoleGuard>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteWorkflow, handleStatusChange, onEditItem, getApproverName]
  )

  return (
    <Card>
      <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
        <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
          <LocalSearchbar route={'/organization/approvals'} placeholder='Search approvals' className='max-sm:is-full sm:min-is-[220px]' />

          <FormControl size='small' className='max-sm:is-full' sx={{ minWidth: 160 }}>
            <InputLabel id='entity-type-filter-label'>Entity Type</InputLabel>
            <Select
              labelId='entity-type-filter-label'
              id='entity-type-filter'
              value={currentEntityType}
              label='Entity Type'
              onChange={e => handleEntityTypeChange(e.target.value as string)}
            >
              <MenuItem value=''>All Entities</MenuItem>
              {Object.entries(entityTypeLabels).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

        <RoleGuard allowedPermissions={[PERMISSIONS.APPROVAL_CREATE]}>
          <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
            <Button
              variant='contained'
              color='primary'
              className='max-sm:is-full'
              startIcon={<i className='ri-add-line' />}
              onClick={() => {
                const url = currentBId
                  ? `/organization/approvals/add?b_id=${encodeURIComponent(currentBId)}`
                  : '/organization/approvals/add'

                router.push(url)
              }}
            >
              Add Workflow
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
  )
}

export default ApprovalsTable
