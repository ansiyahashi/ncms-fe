'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Switch,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  InputAdornment
} from '@mui/material'
import { array, boolean, nonEmpty, object, pipe, string } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { createRole, updateRole, deleteRole } from '../api/role.action'
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

const formatFallbackLabel = (str: string) => {
  const parts = str.split('.')
  const action = parts[1] || str
  return action.charAt(0).toUpperCase() + action.slice(1).replace(/[-_]/g, ' ')
}

interface PermissionModuleCardProps {
  module: any
  selected: string[]
  onToggle: (id: string) => void
  onToggleAll: (module: any, shouldGrant: boolean) => void
}

const PermissionModuleCard = ({ module, selected, onToggle, onToggleAll }: PermissionModuleCardProps) => {
  const allSelected = module.permissions.every((p: any) => selected.includes(p.id))

  return (
    <Card
      variant='outlined'
      className='!h-full flex flex-col !rounded-xl hover:!border-primary !transition-colors !shadow-none'
    >
      <Box className='p-4 flex items-center justify-between border-b'>
        <Typography variant='subtitle2' className='!font-bold truncate mr-2' color='text.primary'>
          {module.label}
        </Typography>
        <Button
          size='small'
          variant='text'
          onClick={() => onToggleAll(module, !allSelected)}
          className={`!text-[10px] !py-0.5 !px-2 !min-w-0 !font-bold ${allSelected ? '!text-error' : '!text-primary'}`}
        >
          {allSelected ? 'Ungrant All' : 'Grant All'}
        </Button>
      </Box>
      <CardContent className='!p-3 flex-grow overflow-y-auto max-h-[300px] custom-scrollbar'>
        <Grid container spacing={1}>
          {module.permissions.map((perm: any) => {
            const isSelected = selected.includes(perm.id)

            return (
              <Grid size={12} key={perm.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size='small'
                      checked={isSelected}
                      onChange={() => onToggle(perm.id)}
                      sx={{ '&.Mui-checked': { color: 'success.main' } }}
                    />
                  }
                  label={
                    <Typography
                      variant='body2'
                      className={`!text-[13px] ${isSelected ? '!font-medium' : ''}`}
                      color={isSelected ? 'text.primary' : 'text.secondary'}
                    >
                      {formatFallbackLabel(perm.permission_code || perm.name)}
                    </Typography>
                  }
                  className='!m-0 !w-full'
                />
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}

interface RolesFormProps {
  role?: any
  permissions?: any[]
}

const RolesForm = ({ role, permissions = [] }: RolesFormProps) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApp, setSelectedApp] = useState('all')

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: valibotResolver(schema)
  })

  const roleName = watch('name')

  useEffect(() => {
    if (role) {
      reset({
        name: role.name || '',
        description: role.description || '',
        status: role.status !== undefined ? role.status : true,
        permission_ids: role.role_permissions?.map((perm: any) => perm?.permission_id) || []
      })
    } else {
      reset(defaultValues)
    }
  }, [role, reset])

  const formatResourceName = (name: string) => {
    return name
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const groupedPermissions = useMemo(() => {
    const groups: Record<
      string,
      {
        id: string
        app: string
        label: string
        permissions: any[]
      }
    > = {}

    permissions.forEach(perm => {
      const permCode = perm.permission_code || perm.name || ''
      const parts = permCode.split('.')
      const resource = parts[0] || 'general'

      if (!groups[resource]) {
        groups[resource] = {
          id: resource,
          app: resource,
          label: formatResourceName(resource),
          permissions: []
        }
      }

      groups[resource].permissions.push(perm)
    })

    return Object.values(groups)
  }, [permissions])

  const apps = useMemo(() => ['all', ...new Set(groupedPermissions.map(m => m.app))], [groupedPermissions])

  const filteredModules = useMemo(() => {
    return groupedPermissions.filter(m => {
      const matchesApp = selectedApp === 'all' || m.app === selectedApp
      const matchesSearch =
        !searchTerm.trim() ||
        m.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.permissions.some((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesApp && matchesSearch
    })
  }, [groupedPermissions, searchTerm, selectedApp])

  const onSubmit = async (params: any) => {
    try {
      const rolePermissions =
        params?.permission_ids?.map((permissionId: string) => ({
          permission_id: permissionId
        })) || []

      const payload = {
        roleData: { ...params },
        rolePermissions
      }

      delete payload.roleData.permission_ids

      if (role?.id) payload.roleData.id = role?.id

      const { data, errors: responseErrors } = role?.id ? await updateRole(payload) : await createRole(payload)

      if (data?.updateRole) {
        toast.success('Successfully updated Role.')
        router.push('/roles')
      }

      if (data?.createRole) {
        toast.success('Successfully created Role.')
        router.push('/roles')
      }

      validateError(responseErrors, defaultValues, setError)
    } catch (error: any) {
      toast.error(error?.message || (role?.id ? 'Failed to update Role.' : 'Failed to create Role.'))
    }
  }

  const handleDelete = async () => {
    if (!role?.id || !window.confirm('Are you sure you want to delete this role?')) return
    try {
      const { data, errors: responseErrors } = await deleteRole({ deleteRoleId: role.id }, '/roles')
      if (data?.deleteRole) {
        toast.success('Role deleted successfully')
        router.push('/roles')
      }
      validateError(responseErrors)
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete role')
    }
  }

  return (
    <Box className='p-6 min-h-screen'>
      {/* Header */}
      <Box className='flex flex-wrap items-center justify-between gap-4 mb-6 pt-2'>
        <Box>
          <Breadcrumbs separator={<i className='ri-arrow-right-s-line text-lg' />} className='!mb-1'>
            <Typography variant='body2' className='font-medium text-textSecondary cursor-pointer' onClick={() => router.push('/roles')}>
              Roles
            </Typography>
            <Typography variant='body2' className='font-medium text-textSecondary'>
              Permission Sets
            </Typography>
            <Typography variant='body2' className='!text-primary font-bold uppercase tracking-wider'>
              {role?.id ? `Edit ${roleName || 'Role'}` : 'New Role'}
            </Typography>
          </Breadcrumbs>
        </Box>
        <Box className='flex items-center gap-2'>
          {role?.id && (
            <Button
              variant='outlined'
              color='error'
              size='small'
              startIcon={<i className='ri-delete-bin-line' />}
              onClick={handleDelete}
              className='!rounded-lg !px-4'
            >
              Delete
            </Button>
          )}
          <Button variant='outlined' color='secondary' size='small' onClick={() => reset()} className='!rounded-lg !px-4'>
            Reset
          </Button>
        </Box>
      </Box>

      {/* Main Form Fields Card */}
      <Card variant='outlined' className='!mb-4 !rounded-2xl !overflow-visible !shadow-none'>
        <CardContent className='!p-6'>
          <Grid container spacing={4} alignItems='center'>
            <Grid size={{ xs: 12, md: 5 }}>
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
                      className='!rounded-xl'
                      slotProps={{ input: { className: '!rounded-xl' } }}
                    />
                  )}
                />
                {errors?.name && <FormHelperText sx={{ color: 'error.main' }}>{errors?.name?.message}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box className='flex items-center gap-3 border rounded-xl px-3 py-1.5'>
                <Typography variant='body2' className='!font-medium' color='text.secondary'>
                  Status
                </Typography>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Box className='flex items-center gap-2'>
                      <Switch {...field} checked={field.value} color='primary' />
                      <Typography
                        variant='caption'
                        className={`!font-bold ${field.value ? '!text-success' : ''}`}
                        color={field.value ? 'success.main' : 'text.disabled'}
                      >
                        {field.value ? 'ACTIVE' : 'INACTIVE'}
                      </Typography>
                    </Box>
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className='flex justify-end gap-2'>
                <Button variant='outlined' onClick={() => router.push('/roles')} className='!rounded-xl !px-6 !py-3'>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <i className='ri-save-line' />}
                  className='!rounded-xl !px-10 !py-3 !font-bold !bg-primary'
                >
                  Save Changes
                </Button>
              </Box>
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
                      placeholder='Role description'
                      error={Boolean(errors?.description)}
                      className='!rounded-xl'
                      slotProps={{ input: { className: '!rounded-xl' } }}
                    />
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Permissions Section */}
      <Controller
        name='permission_ids'
        control={control}
        rules={{ required: true }}
        render={({ field: { value = [], onChange } }) => {
          const handleToggleItem = (id: string) => {
            if (value.includes(id)) {
              onChange(value.filter((i: string) => i !== id))
            } else {
              onChange([...value, id])
            }
          }

          const handleToggleAllItems = (module: any, shouldGrant: boolean) => {
            const ids = module.permissions.map((p: any) => p.id)
            const otherIds = value.filter((id: string) => !ids.includes(id))
            if (shouldGrant) {
              onChange([...otherIds, ...ids])
            } else {
              onChange(otherIds)
            }
          }

          const handleGrantAllItems = () => {
            const allIds = permissions.map(p => p.id)
            onChange(allIds)
            toast.info('All permissions granted')
          }

          const handleDeselectAllItems = () => {
            onChange([])
            toast.info('All permissions cleared')
          }

          return (
            <Box>
              <Box
                className='mb-6 flex flex-wrap gap-4 items-center p-3 rounded-2xl border'
                sx={{ backgroundColor: 'background.paper' }}
              >
                <TextField
                  placeholder='Search permissions module or action...'
                  size='medium'
                  className='flex-grow min-w-[300px]'
                  onChange={e => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-2-line text-xl' style={{ color: 'var(--mui-palette-text-secondary)' }} />
                        </InputAdornment>
                      ),
                      className: '!rounded-xl border-none'
                    }
                  }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                />
                <Divider orientation='vertical' flexItem className='hidden md:block' />
                <FormControl size='medium' className='min-w-[200px]'>
                  <Select
                    value={selectedApp}
                    onChange={e => setSelectedApp(e.target.value)}
                    className='!rounded-xl'
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                  >
                    {apps.map(app => (
                      <MenuItem key={app} value={app} className='!capitalize'>
                        {app === 'all' ? 'All Modules' : formatResourceName(app)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Divider orientation='vertical' flexItem className='hidden md:block' />
                <Box className='flex gap-2 ml-auto'>
                  <Button
                    size='small'
                    variant='outlined'
                    color='primary'
                    onClick={handleGrantAllItems}
                    startIcon={<i className='ri-checkbox-multiple-line' />}
                    className='!rounded-lg !px-4'
                  >
                    Grant all
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    color='secondary'
                    onClick={handleDeselectAllItems}
                    startIcon={<i className='ri-close-circle-line' />}
                    className='!rounded-lg !px-4'
                  >
                    Clear all
                  </Button>
                </Box>
              </Box>

              <Box className='flex items-center justify-between mb-4'>
                <Typography variant='overline' className='!block !font-bold !tracking-widest' color='text.disabled'>
                  AVAILABLE PERMISSIONS ({filteredModules.length} MODULES)
                </Typography>
                <Typography variant='overline' className='!block !font-bold !tracking-widest' color='primary'>
                  {value.length} PERMISSIONS SELECTED
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {filteredModules.map(m => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.id}>
                    <PermissionModuleCard
                      module={m}
                      selected={value}
                      onToggle={handleToggleItem}
                      onToggleAll={handleToggleAllItems}
                    />
                  </Grid>
                ))}
              </Grid>

              {filteredModules.length === 0 && (
                <Box
                  className='flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed'
                  sx={{ backgroundColor: 'background.paper' }}
                >
                  <i className='ri-search-eye-line text-6xl mb-4' style={{ color: 'var(--mui-palette-text-disabled)' }} />
                  <Typography variant='h6' color='text.disabled'>
                    No permission modules found
                  </Typography>
                  <Typography variant='body2' color='text.disabled'>
                    Try adjusting your search or module filter
                  </Typography>
                </Box>
              )}
            </Box>
          )
        }}
      />
      {errors?.permission_ids && (
        <FormHelperText sx={{ color: 'error.main', mt: 1 }}>{errors?.permission_ids?.message}</FormHelperText>
      )}
    </Box>
  )
}

export default RolesForm
