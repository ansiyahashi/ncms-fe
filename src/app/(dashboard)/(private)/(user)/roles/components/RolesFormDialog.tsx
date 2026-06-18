import { useState, useMemo, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import {
  CircularProgress,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Tooltip,
  Chip
} from '@mui/material'
import { array, boolean, nonEmpty, object, pipe, string } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { createRole, updateRole } from '@/libs/actions/role.action'
import { validateError } from '@/api'

const schema = object({
  name: pipe(string(), nonEmpty('This field is required')),
  description: string(),
  status: boolean(),
  permission_ids: pipe(array(string()), nonEmpty('Please select at least one permission'))
})

const defaultValues = {
  name: '',
  description: '',
  status: true,
  permission_ids: [] as string[]
}

interface RolesFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
  onDataChange: (data: any) => void
  permissions?: any[]
}

const RolesFormDialog = ({ open, setOpen, details, onDataChange, permissions = [] }: RolesFormDialogProps) => {
  // Search query for filtering matrix
  const [searchQuery, setSearchQuery] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: valibotResolver(schema)
  })

  useEffect(() => {
    if (details) {
      reset({
        ...details,
        permission_ids: details.role_permissions?.map((perm: any) => perm?.permission_id)
      })
    } else {
      reset(defaultValues)
    }
  }, [details, reset, open])

  const onSubmit = async (params: any) => {
    try {
      // Transform permission_ids array into role_permissions array format
      const rolePermissions =
        params?.permission_ids?.map((permissionId: string) => ({
          permission_id: permissionId
        })) || []

      const payload = {
        roleData: { ...params },
        rolePermissions
      }

      // Remove permission_ids from roleData as it's not part of the role schema
      delete payload.roleData.permission_ids

      if (details?.id) payload.roleData.id = details?.id

      const { data, errors: responseErrors } = details?.id ? await updateRole(payload) : await createRole(payload)

      if (data?.updateRole) {
        toast.success('Successfully updated Role.')
        handleClose(data?.updateRole)
      }

      if (data?.createRole) {
        toast.success('Successfully created Role.')
        handleClose(data?.createRole)
      }

      validateError(responseErrors, defaultValues, setError)
    } catch (error: any) {
      toast.error(error?.message || (details?.id ? 'Failed to update Role.' : 'Failed to create Role.'))
    }
  }

  const handleClose = (data?: any) => {
    data && onDataChange(data)
    reset(defaultValues)
    setSearchQuery('')
    setOpen(false)
  }

  // Format resource name for display (e.g., 'asset_categories' -> 'Asset Categories')
  const formatResourceName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Group and filter permissions
  const groupedPermissions = useMemo(() => {
    const groups: Record<
      string,
      {
        resource: string
        view?: any
        create?: any
        update?: any
        delete?: any
        specials: any[]
        allPerms: any[]
      }
    > = {}

    permissions.forEach(perm => {
      const parts = perm.name.split('.')
      const resource = parts[0]
      const action = parts[1]

      if (!groups[resource]) {
        groups[resource] = { resource, specials: [], allPerms: [] }
      }

      groups[resource].allPerms.push(perm)

      if (action === 'view') groups[resource].view = perm
      else if (action === 'create') groups[resource].create = perm
      else if (action === 'update') groups[resource].update = perm
      else if (action === 'delete') groups[resource].delete = perm
      else groups[resource].specials.push(perm)
    })

    // Filter based on search query
    return Object.values(groups).filter(
      group =>
        group.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatResourceName(group.resource).toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [permissions, searchQuery])

  return (
    <Dialog
      open={open}
      maxWidth='md'
      fullWidth
      scroll='body'
      onClose={() => {
        setOpen(false)
        reset()
        setSearchQuery('')
      }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-4 sm:pli-16'>
        {details ? 'Update' : 'Add a New'} Role
        <Typography component='span' className='text-center text-textSecondary'>
          Define role details and select granular system permissions.
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pbs-1 sm:pbe-6 sm:pli-16'>
          <IconButton
            onClick={() => {
              setOpen(false)
              reset()
              setSearchQuery('')
            }}
            className='absolute block-start-4 inline-end-4'
          >
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={5}>
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Role Name'
                      onChange={onChange}
                      placeholder='e.g., Technician, Manager'
                      error={Boolean(errors?.name)}
                    />
                  )}
                />
                {errors?.name && <FormHelperText sx={{ color: 'error.main' }}>{errors?.name?.message}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={6} className='flex items-center'>
              <FormControlLabel
                control={
                  <Controller
                    name='status'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Checkbox checked={value} onChange={e => onChange(e.target.checked)} />
                    )}
                  />
                }
                label='Role Status (Active)'
              />
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='description'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Description'
                      onChange={onChange}
                      placeholder='Brief explanation of role access scope'
                      multiline
                      rows={2}
                      error={Boolean(errors?.description)}
                    />
                  )}
                />
                {errors?.description && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors?.description?.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={12}>
              <div className='flex justify-between items-center mbe-3 flex-wrap gap-2'>
                <Typography variant='h5' className='font-semibold'>
                  Permissions Matrix
                </Typography>
                <TextField
                  size='small'
                  placeholder='Filter modules...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-line text-textSecondary' />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              <Controller
                name='permission_ids'
                control={control}
                rules={{ required: true }}
                render={({ field: { value = [], onChange } }) => {
                  const handleCheckboxChange = (permId: string, checked: boolean) => {
                    if (checked) {
                      onChange([...value, permId])
                    } else {
                      onChange(value.filter((id: string) => id !== permId))
                    }
                  }

                  const handleSelectAllRow = (rowPerms: any[], checked: boolean) => {
                    const rowIds = rowPerms.map(p => p.id).filter(Boolean)
                    if (checked) {
                      const merged = Array.from(new Set([...value, ...rowIds]))

                      onChange(merged)
                    } else {
                      onChange(value.filter((id: string) => !rowIds.includes(id)))
                    }
                  }

                  const handleSelectAllGlobal = (checked: boolean) => {
                    if (checked) {
                      onChange(permissions.map(p => p.id))
                    } else {
                      onChange([])
                    }
                  }

                  const allPermissionsSelected = permissions.length > 0 && value.length === permissions.length
                  const somePermissionsSelected = value.length > 0 && value.length < permissions.length

                  return (
                    <TableContainer component={Paper} variant='outlined' className='max-bs-[400px] overflow-auto'>
                      <Table size='small' stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell className='font-bold bg-backgroundPaper'>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={allPermissionsSelected}
                                    indeterminate={somePermissionsSelected}
                                    onChange={e => handleSelectAllGlobal(e.target.checked)}
                                  />
                                }
                                label='Module Name'
                                slotProps={{ typography: { className: 'font-bold' } }}
                              />
                            </TableCell>
                            <TableCell align='center' className='font-bold bg-backgroundPaper'>
                              View
                            </TableCell>
                            <TableCell align='center' className='font-bold bg-backgroundPaper'>
                              Create
                            </TableCell>
                            <TableCell align='center' className='font-bold bg-backgroundPaper'>
                              Edit
                            </TableCell>
                            <TableCell align='center' className='font-bold bg-backgroundPaper'>
                              Delete
                            </TableCell>
                            <TableCell className='font-bold bg-backgroundPaper'>Special Action / Granular</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupedPermissions.map(group => {
                            const rowIds = group.allPerms.map(p => p.id)
                            const isRowAllSelected = rowIds.every(id => value.includes(id))
                            const isRowSomeSelected = rowIds.some(id => value.includes(id)) && !isRowAllSelected

                            return (
                              <TableRow key={group.resource} hover>
                                <TableCell>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        size='small'
                                        checked={isRowAllSelected}
                                        indeterminate={isRowSomeSelected}
                                        onChange={e => handleSelectAllRow(group.allPerms, e.target.checked)}
                                      />
                                    }
                                    label={formatResourceName(group.resource)}
                                  />
                                </TableCell>
                                <TableCell align='center'>
                                  {group.view && (
                                    <Checkbox
                                      size='small'
                                      checked={value.includes(group.view.id)}
                                      onChange={e => handleCheckboxChange(group.view.id, e.target.checked)}
                                    />
                                  )}
                                </TableCell>
                                <TableCell align='center'>
                                  {group.create && (
                                    <Checkbox
                                      size='small'
                                      checked={value.includes(group.create.id)}
                                      onChange={e => handleCheckboxChange(group.create.id, e.target.checked)}
                                    />
                                  )}
                                </TableCell>
                                <TableCell align='center'>
                                  {group.update && (
                                    <Checkbox
                                      size='small'
                                      checked={value.includes(group.update.id)}
                                      onChange={e => handleCheckboxChange(group.update.id, e.target.checked)}
                                    />
                                  )}
                                </TableCell>
                                <TableCell align='center'>
                                  {group.delete && (
                                    <Checkbox
                                      size='small'
                                      checked={value.includes(group.delete.id)}
                                      onChange={e => handleCheckboxChange(group.delete.id, e.target.checked)}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className='flex flex-wrap gap-1'>
                                    {group.specials.map(spec => (
                                      <Tooltip key={spec.id} title={spec.description || ''}>
                                        <Chip
                                          label={spec.name.split('.')[1]}
                                          size='small'
                                          variant={value.includes(spec.id) ? 'filled' : 'outlined'}
                                          color={value.includes(spec.id) ? 'primary' : 'default'}
                                          onClick={() => handleCheckboxChange(spec.id, !value.includes(spec.id))}
                                          className='cursor-pointer font-medium'
                                        />
                                      </Tooltip>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
                }}
              />
              {errors?.permission_ids && (
                <FormHelperText sx={{ color: 'error.main', mt: 1 }}>{errors?.permission_ids?.message}</FormHelperText>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='sm:pli-16 sm:pbe-12'>
          <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
            {isSubmitting && <CircularProgress size={20} className='mie-2' />}
            {details?.id ? 'Update' : 'Add'} Role
          </Button>
          <Button
            variant='outlined'
            onClick={() => {
              setOpen(false)
              reset(defaultValues)
              setSearchQuery('')
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RolesFormDialog

