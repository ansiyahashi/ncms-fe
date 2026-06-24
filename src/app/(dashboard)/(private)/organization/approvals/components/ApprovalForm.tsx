'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Switch,
  CircularProgress,
  FormHelperText,
  IconButton,
  Tooltip
} from '@mui/material'
import { array, boolean, nonEmpty, object, pipe, string, optional } from 'valibot'
import { Controller, useForm, useFieldArray } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { createWorkflow, updateWorkflow } from '../api/approval.action'
import { getLookupRoles, getLookupUsers } from '@/libs/actions/lookup.action'
import { validateError } from '@/api'

const stepSchema = object({
  label: optional(string()),
  approver_type: pipe(string(), nonEmpty('Approver type is required')),
  approver_id: optional(string())
})

const getSchema = (isSuperAdmin = false) => {
  const baseSchema: any = {
    name: pipe(string(), nonEmpty('Workflow name is required')),
    entity_type: pipe(string(), nonEmpty('Entity type is required')),
    description: optional(string()),
    status: boolean(),
    steps: pipe(array(stepSchema), nonEmpty('At least one approval step is required'))
  }

  if (isSuperAdmin) {
    baseSchema.b_id = pipe(string(), nonEmpty('Business is required'))
  }

  return object(baseSchema)
}

const defaultValues = {
  name: '',
  entity_type: '',
  description: '',
  status: true,
  b_id: '',
  steps: [
    {
      label: '',
      approver_type: 'manager',
      approver_id: ''
    }
  ]
}

const entityTypes = [
  { value: 'user', label: 'User' },
  { value: 'material_request', label: 'Material Request' },
  { value: 'purchase_request', label: 'Purchase Request' },
  { value: 'work_order', label: 'Work Order' },
  { value: 'client', label: 'Client' },
  { value: 'asset_transfer', label: 'Asset Transfer' }
]

interface ApprovalFormProps {
  workflow?: any
  roles?: any[]
  users?: any[]
  businesses?: any[]
  b_id?: string
}

const ApprovalForm = ({ workflow, roles = [], users = [], businesses = [], b_id = '' }: ApprovalFormProps) => {
  const router = useRouter()
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [rolesList, setRolesList] = useState<any[]>(roles)
  const [usersList, setUsersList] = useState<any[]>(users)

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      ...defaultValues,
      b_id: b_id || workflow?.b_id || ''
    },
    mode: 'onChange',
    resolver: valibotResolver(getSchema(isSuperAdmin))
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps'
  })

  // Watch step fields to dynamically update or clear approver_ids when approver_type changes
  const watchedSteps = watch('steps')
  const selectedBId = watch('b_id')

  useEffect(() => {
    setRolesList(roles)
  }, [roles])

  useEffect(() => {
    setUsersList(users)
  }, [users])

  useEffect(() => {
    if (isSuperAdmin) {
      if (selectedBId) {
        const loadLookups = async () => {
          const [rolesRes, usersRes] = await Promise.all([
            getLookupRoles({ b_id: selectedBId }),
            getLookupUsers({ b_id: selectedBId })
          ])

          setRolesList(rolesRes?.data?.roles?.data || [])
          setUsersList(usersRes?.data?.users?.data || [])
        }

        loadLookups()
      } else {
        setRolesList([])
        setUsersList([])
      }
    }
  }, [selectedBId, isSuperAdmin])

  useEffect(() => {
    if (workflow) {
      reset({
        name: workflow.name || '',
        entity_type: workflow.entity_type || '',
        description: workflow.description || '',
        status: workflow.status !== undefined ? workflow.status : true,
        b_id: workflow.b_id || '',
        steps: workflow.steps?.map((step: any) => ({
          label: step.label || '',
          approver_type: step.approver_type || 'manager',
          approver_id: step.approver_id || ''
        })) || [
          {
            label: '',
            approver_type: 'manager',
            approver_id: ''
          }
        ]
      })
    } else {
      reset({
        ...defaultValues,
        b_id: b_id || ''
      })
    }
  }, [workflow, reset, b_id])

  const onSubmit = async (params: any) => {
    // Custom validate steps: if type is user or role, they must have an ID
    let hasStepError = false

    params.steps.forEach((step: any, index: number) => {
      if (step.approver_type !== 'manager' && !step.approver_id) {
        setError(`steps.${index}.approver_id` as any, {
          type: 'manual',
          message: `Approver selection is required when type is ${step.approver_type}`
        })
        hasStepError = true
      }
    })

    if (hasStepError) {
      toast.error('Please configure all approval steps correctly.')

      return
    }

    try {
      const payload = {
        workflowData: {
          ...(workflow?.id ? { id: workflow.id } : {}),
          b_id: params.b_id || workflow?.b_id || b_id || '',
          name: params.name,
          entity_type: params.entity_type,
          description: params.description,
          status: params.status
        },
        steps: params.steps
      }

      const { data, errors: responseErrors } = workflow?.id
        ? await updateWorkflow(payload, '/organization/approvals')
        : await createWorkflow(payload, '/organization/approvals')

      if (data) {
        toast.success(`Workflow successfully ${workflow?.id ? 'updated' : 'created'}!`)
        router.push('/organization/approvals')
      }

      if (responseErrors) {
        validateError(responseErrors)
      }
    } catch (error: any) {
      toast.error(error?.message || `Failed to save approval workflow.`)
    }
  }

  return (
    <Box className='flex flex-col gap-6 w-full'>
      {/* Header and Breadcrumbs */}
      <Box className='flex flex-col gap-1.5'>
        <Breadcrumbs aria-label='breadcrumb' className='text-xs'>
          <Link underline='hover' color='inherit' href='/home'>
            Home
          </Link>
          <Typography color='text.secondary' className='text-xs'>
            Organization Setup
          </Typography>
          <Link underline='hover' color='inherit' href='/organization/approvals'>
            Approval Workflows
          </Link>
          <Typography color='text.primary' className='text-xs font-medium'>
            {workflow ? 'Edit Workflow' : 'Add Workflow'}
          </Typography>
        </Breadcrumbs>
        <Typography variant='h4' className='font-bold tracking-tight text-textPrimary'>
          {workflow ? 'Edit Approval Workflow' : 'Create Approval Workflow'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={6}>
          {/* General Configuration Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant='outlined' className='border border-divider rounded-xl shadow-none bg-backgroundPaper'>
              <CardContent className='p-6 flex flex-col gap-5'>
                <Typography variant='h6' className='font-bold text-textPrimary'>
                  General Details
                </Typography>
                <Divider />

                {isSuperAdmin && (
                  <FormControl fullWidth size='small' error={!!errors.b_id}>
                    <InputLabel id='business-label'>Business</InputLabel>
                    <Controller
                      name='b_id'
                      control={control}
                      render={({ field }) => (
                        <Select {...field} labelId='business-label' label='Business' disabled={!!workflow}>
                          <MenuItem value=''>-- Choose Business --</MenuItem>
                          {businesses.map((business: any) => (
                            <MenuItem key={business.id} value={business.id}>
                              {business.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.b_id?.message && <FormHelperText>{String(errors.b_id.message)}</FormHelperText>}
                  </FormControl>
                )}

                <FormControl fullWidth>
                  <Controller
                    name='name'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label='Workflow Name'
                        placeholder='e.g. Material Request Approval'
                        size='small'
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </FormControl>

                <FormControl fullWidth size='small' error={!!errors.entity_type}>
                  <InputLabel id='entity-type-label'>Entity Type</InputLabel>
                  <Controller
                    name='entity_type'
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId='entity-type-label' label='Entity Type'>
                        {entityTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.entity_type?.message && <FormHelperText>{String(errors.entity_type.message)}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth>
                  <Controller
                    name='description'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label='Description'
                        placeholder='Specify the scope and triggers for this workflow...'
                        multiline
                        rows={3}
                        size='small'
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </FormControl>

                <Box className='flex items-center justify-between mt-2'>
                  <Typography variant='body2' className='text-textSecondary font-medium'>
                    Status (Active / Inactive)
                  </Typography>
                  <Controller
                    name='status'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        inputProps={{ 'aria-label': 'workflow-status-switch' }}
                      />
                    )}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Steps Sequence Card */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant='outlined' className='border border-divider rounded-xl shadow-none bg-backgroundPaper'>
              <CardContent className='p-6 flex flex-col gap-5'>
                <Box className='flex items-center justify-between'>
                  <Typography variant='h6' className='font-bold text-textPrimary'>
                    Approval Sequence Steps
                  </Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<i className='ri-add-line' />}
                    onClick={() =>
                      append({
                        label: '',
                        approver_type: 'manager',
                        approver_id: ''
                      })
                    }
                  >
                    Add Stage
                  </Button>
                </Box>
                <Divider />

                {errors.steps && !Array.isArray(errors.steps) && errors.steps.message && (
                  <FormHelperText error className='text-center font-semibold'>
                    {String(errors.steps.message)}
                  </FormHelperText>
                )}

                <Box className='flex flex-col gap-4 mt-2'>
                  {fields.map((item, index) => {
                    const stepType = watchedSteps?.[index]?.approver_type || 'manager'
                    const stepError = errors.steps?.[index] as any

                    return (
                      <Card
                        key={item.id}
                        variant='outlined'
                        className='border border-divider rounded-lg shadow-none bg-actionHover p-4 relative'
                      >
                        <Box className='flex items-center justify-between mb-4'>
                          <Typography variant='subtitle2' className='font-bold text-textPrimary'>
                            Stage {index + 1} Configuration
                          </Typography>

                          <Box className='flex items-center gap-1'>
                            <Tooltip title='Move Up'>
                              <span>
                                <IconButton size='small' disabled={index === 0} onClick={() => move(index, index - 1)}>
                                  <i className='ri-arrow-up-line text-textSecondary' />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title='Move Down'>
                              <span>
                                <IconButton
                                  size='small'
                                  disabled={index === fields.length - 1}
                                  onClick={() => move(index, index + 1)}
                                >
                                  <i className='ri-arrow-down-line text-textSecondary' />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title='Delete Stage'>
                              <span>
                                <IconButton
                                  size='small'
                                  color='error'
                                  disabled={fields.length === 1}
                                  onClick={() => remove(index)}
                                >
                                  <i className='ri-delete-bin-line' />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </Box>

                        <Grid container spacing={4}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                              <Controller
                                name={`steps.${index}.label`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label='Stage Label'
                                    placeholder='e.g. Line Manager'
                                    size='small'
                                    error={!!stepError?.label}
                                    helperText={stepError?.label?.message}
                                  />
                                )}
                              />
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth size='small' error={!!stepError?.approver_type}>
                              <InputLabel id={`approver-type-label-${index}`}>Approver Type</InputLabel>
                              <Controller
                                name={`steps.${index}.approver_type`}
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    labelId={`approver-type-label-${index}`}
                                    label='Approver Type'
                                    onChange={e => {
                                      field.onChange(e.target.value)

                                      // Reset approver_id when type changes
                                      control._fields[`steps.${index}.approver_id` as any]?._f &&
                                        control.register(`steps.${index}.approver_id` as any).onChange({
                                          target: { value: '' }
                                        })
                                    }}
                                  >
                                    <MenuItem value='manager'>Manager (Direct Supervisor)</MenuItem>
                                    <MenuItem value='role'>Role</MenuItem>
                                    <MenuItem value='user'>Specific User</MenuItem>
                                  </Select>
                                )}
                              />
                              {stepError?.approver_type?.message && (
                                <FormHelperText>{String(stepError.approver_type.message)}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 4 }}>
                            {stepType === 'manager' ? (
                              <TextField
                                disabled
                                fullWidth
                                size='small'
                                label='Approver User / Role'
                                value='Assigned dynamically (Manager)'
                                slotProps={{
                                  input: {
                                    sx: { fontStyle: 'italic', fontSize: '12px' }
                                  }
                                }}
                              />
                            ) : (
                              <FormControl fullWidth size='small' error={!!stepError?.approver_id}>
                                <InputLabel id={`approver-id-label-${index}`}>
                                  Select {stepType === 'role' ? 'Role' : 'User'}
                                </InputLabel>
                                <Controller
                                  name={`steps.${index}.approver_id`}
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      labelId={`approver-id-label-${index}`}
                                      label={`Select ${stepType === 'role' ? 'Role' : 'User'}`}
                                    >
                                      <MenuItem value=''>-- Choose Option --</MenuItem>
                                      {stepType === 'role'
                                        ? rolesList.map((role: any) => (
                                            <MenuItem key={role.id} value={role.id}>
                                              {role.name}
                                            </MenuItem>
                                          ))
                                        : usersList.map((user: any) => (
                                            <MenuItem key={user.id} value={user.id}>
                                              {user.name} ({user.email || 'No email'})
                                            </MenuItem>
                                          ))}
                                    </Select>
                                  )}
                                />
                                {stepError?.approver_id?.message && (
                                  <FormHelperText>{String(stepError.approver_id.message)}</FormHelperText>
                                )}
                              </FormControl>
                            )}
                          </Grid>
                        </Grid>
                      </Card>
                    )
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Actions Footer */}
          <Grid size={12}>
            <Box className='flex items-center gap-3 justify-end'>
              <Button variant='outlined' onClick={() => router.push('/organization/approvals')} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
              >
                {workflow ? 'Update Workflow' : 'Save Workflow'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default ApprovalForm
