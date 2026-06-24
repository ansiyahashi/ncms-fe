'use client'

import { useEffect } from 'react'

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
import Box from '@mui/material/Box'
import {
  CircularProgress,
  FormHelperText,
  Switch,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { boolean, object, pipe, string, optional, nonEmpty } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { validateError } from '@/api'
import {
  createCostCenter,
  updateCostCenter,
  createUserType,
  updateUserType,
  createOwnerType,
  updateOwnerType,
  createFacilityType,
  updateFacilityType,
  createAssetStatus,
  updateAssetStatus,
  createDepartment,
  updateDepartment,
  createDesignation,
  updateDesignation
} from '../api/master-config.action'

const schema = object({
  name: pipe(string(), nonEmpty('Name is required')),
  code: optional(string()),
  key: optional(string()),
  description: optional(string()),
  b_id: optional(string()),
  dep_id: optional(string()),
  client_id: optional(string()),
  status: boolean()
})

const defaultValues = {
  name: '',
  code: '',
  key: '',
  description: '',
  b_id: '',
  dep_id: '',
  client_id: '',
  status: true
}

interface ConfigFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  type: 'cost-centers' | 'user-types' | 'owner-types' | 'facility-types' | 'asset-statuses' | 'departments' | 'designations'
  details?: any
  onDataChange: (data: any) => void
  businessesData?: any[]
  departmentsData?: any[]
  clientsData?: any[]
  isSuperAdmin?: boolean
}

const configActions: Record<string, { create: any; update: any }> = {
  'cost-centers': { create: createCostCenter, update: updateCostCenter },
  'user-types': { create: createUserType, update: updateUserType },
  'owner-types': { create: createOwnerType, update: updateOwnerType },
  'facility-types': { create: createFacilityType, update: updateFacilityType },
  'asset-statuses': { create: createAssetStatus, update: updateAssetStatus },
  'departments': { create: createDepartment, update: updateDepartment },
  'designations': { create: createDesignation, update: updateDesignation }
}

const ConfigFormDialog = ({
  open,
  setOpen,
  type,
  details,
  onDataChange,
  businessesData = [],
  departmentsData = [],
  clientsData = [],
  isSuperAdmin = false
}: ConfigFormDialogProps) => {


  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: valibotResolver(schema)
  })

  const watchedBId = watch('b_id')
  const effectiveBId = details?.b_id || watchedBId

  const filteredClients = clientsData.filter((c: any) => {
    if (!isSuperAdmin) return true
    
return String(c.b_id) === String(effectiveBId)
  })

  useEffect(() => {
    if (!details?.id && open) {
      setValue('client_id', '')
    }
  }, [watchedBId, details, open, setValue])

  useEffect(() => {
    if (details) {
      reset({
        ...defaultValues,
        ...details,
        status: details.status ?? defaultValues.status
      })
    } else {
      reset(defaultValues)
    }
  }, [details, reset, open])

  const getTypeName = () => {
    switch (type) {
      case 'cost-centers':
        return 'Cost Center'
      case 'user-types':
        return 'User Type'
      case 'owner-types':
        return 'Owner Type'
      case 'facility-types':
        return 'Facility Type'
      case 'asset-statuses':
        return 'Asset Status'
      case 'departments':
        return 'Department'
      case 'designations':
        return 'Designation'
      default:
        return 'Configuration'
    }
  }



  const onSubmit = async (params: any) => {
    // Custom check for required fields based on config type
    if (type === 'cost-centers' && !params.code) {
      setError('code', { message: 'Code is required for Cost Center' })

      return
    }

    if (['user-types', 'facility-types', 'asset-statuses'].includes(type) && !params.key) {
      setError('key', { message: 'Key is required' })

      return
    }

    if (isSuperAdmin && !details?.id && !params.b_id) {
      setError('b_id', { message: 'Business is required' })

      return
    }

    try {
      const payload = {
        configData: {
          ...(details?.id ? { id: details?.id } : {}),
          ...params
        }
      }

      const action = configActions[type]

      const { data, errors: responseErrors } = details?.id
        ? await action.update(payload, '/master-config')
        : await action.create(payload)

      const resultKey = details?.id
        ? `update${getTypeName().replace(' ', '')}`
        : `create${getTypeName().replace(' ', '')}`

      const returnedData = data?.[resultKey]

      if (returnedData) {
        toast.success(`Successfully ${details?.id ? 'updated' : 'created'} ${getTypeName()}.`)
        handleClose(returnedData)
      }

      if (responseErrors) {
        validateError(responseErrors, defaultValues, setError)
      }
    } catch (error: any) {
      toast.error(error?.message || `Failed to save ${getTypeName()}.`)
    }
  }

  const handleClose = (data?: any) => {
    data && onDataChange(data)
    reset(defaultValues)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      maxWidth='sm'
      fullWidth
      scroll='body'
      onClose={() => {
        setOpen(false)
        reset(defaultValues)
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '8px'
        }
      }}
    >
      <DialogTitle variant='h4' className='flex gap-1 flex-col text-center pt-8 pb-4 px-6 sm:px-16'>
        <span className='font-bold text-textPrimary'>
          {details?.id ? 'Update' : 'New'} {getTypeName()}
        </span>
        <Typography variant='body2' className='text-textSecondary'>
          {details?.id
            ? `Modify the details of your ${getTypeName().toLowerCase()} below`
            : `Enter the details of your new ${getTypeName().toLowerCase()} below`}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pt-2 pb-6 px-6 sm:px-16 flex flex-col gap-5'>
          <IconButton
            onClick={() => setOpen(false)}
            className='absolute top-4 right-4 hover:bg-actionHover rounded-full transition-colors'
          >
            <i className='ri-close-line text-textSecondary text-xl' />
          </IconButton>

          <Grid container spacing={5}>

            {/* Business Selection if Super Admin */}
            {isSuperAdmin && !details?.id && (
              <Grid size={12}>
                <FormControl fullWidth error={Boolean(errors?.b_id)}>
                  <InputLabel id='form-business-select-label'>Business</InputLabel>
                  <Controller
                    name='b_id'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        labelId='form-business-select-label'
                        id='form-business-select'
                        value={value ?? ''}
                        label='Business'
                        onChange={onChange}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value='' disabled>
                          Select a Business
                        </MenuItem>
                        {businessesData.map((business: any) => (
                          <MenuItem key={business.id} value={business.id}>
                            {business.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors?.b_id && <FormHelperText>{errors?.b_id?.message}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

            {/* Client Selection for Department */}
            {type === 'departments' && (
              <Grid size={12}>
                <FormControl fullWidth error={Boolean(errors?.client_id)}>
                  <InputLabel id='form-client-select-label'>Client</InputLabel>
                  <Controller
                    name='client_id'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        labelId='form-client-select-label'
                        id='form-client-select'
                        value={value ?? ''}
                        label='Client'
                        onChange={onChange}
                        sx={{ borderRadius: '8px' }}
                        disabled={isSuperAdmin && !effectiveBId}
                      >
                        <MenuItem value=''>
                          <em>None (Direct Business Department)</em>
                        </MenuItem>
                        {filteredClients.map((client: any) => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors?.client_id && <FormHelperText>{errors?.client_id?.message}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

            {/* Department Selection for Designation */}
            {type === 'designations' && (
              <Grid size={12}>
                <FormControl fullWidth error={Boolean(errors?.dep_id)}>
                  <InputLabel id='form-department-select-label'>Department</InputLabel>
                  <Controller
                    name='dep_id'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        labelId='form-department-select-label'
                        id='form-department-select'
                        value={value ?? ''}
                        label='Department'
                        onChange={onChange}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>
                          <em>None</em>
                        </MenuItem>
                        {departmentsData.map((dept: any) => (
                          <MenuItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors?.dep_id && <FormHelperText>{errors?.dep_id?.message}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

            {/* Code field for Cost Center */}
            {type === 'cost-centers' && (
              <Grid size={12}>
                <FormControl fullWidth>
                  <Controller
                    name='code'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value ?? ''}
                        label='Code'
                        onChange={onChange}
                        placeholder='e.g., CC-101'
                        error={Boolean(errors?.code)}
                        slotProps={{
                          input: {
                            sx: { borderRadius: '8px' }
                          }
                        }}
                      />
                    )}
                  />
                  {errors?.code && (
                    <FormHelperText sx={{ color: 'error.main' }}>{errors?.code?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {/* Key field for User Type, Facility Type, Asset Status */}
            {['user-types', 'facility-types', 'asset-statuses'].includes(type) && (
              <Grid size={12}>
                <FormControl fullWidth>
                  <Controller
                    name='key'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value ?? ''}
                        label='Key'
                        onChange={onChange}
                        placeholder='e.g., active_status'
                        error={Boolean(errors?.key)}
                        disabled={!!details?.id && type === 'asset-statuses'} // Key is read-only for asset status updates in backend
                        slotProps={{
                          input: {
                            sx: { borderRadius: '8px' }
                          }
                        }}
                      />
                    )}
                  />
                  {errors?.key && <FormHelperText sx={{ color: 'error.main' }}>{errors?.key?.message}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

            {/* Name field */}
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='name'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Name'
                      onChange={onChange}
                      placeholder={`Enter ${getTypeName().toLowerCase()} name`}
                      error={Boolean(errors?.name)}
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
                {errors?.name && <FormHelperText sx={{ color: 'error.main' }}>{errors?.name?.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Description field for User Type, Facility Type, Asset Status, Department, Designation */}
            {['user-types', 'facility-types', 'asset-statuses', 'departments', 'designations'].includes(type) && (
              <Grid size={12}>
                <FormControl fullWidth>
                  <Controller
                    name='description'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value ?? ''}
                        label='Description'
                        onChange={onChange}
                        placeholder='Enter description details'
                        multiline
                        rows={3}
                        error={Boolean(errors?.description)}
                        slotProps={{
                          input: {
                            sx: { borderRadius: '8px' }
                          }
                        }}
                      />
                    )}
                  />
                  {errors?.description && (
                    <FormHelperText sx={{ color: 'error.main' }}>{errors?.description?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {/* Premium Active Status Toggle Row */}
            <Grid size={12}>
              <Box className='flex items-center justify-between p-4 rounded-xl border border-divider bg-backgroundDefault/50'>
                <Box className='flex flex-col gap-0.5'>
                  <Typography className='text-sm font-bold text-textPrimary'>Active Status</Typography>
                  <Typography className='text-[10px] text-textSecondary'>
                    Toggle to make this configuration active across the system.
                  </Typography>
                </Box>
                <Controller
                  name='status'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      checked={value ?? false}
                      onChange={e => onChange(e.target.checked)}
                      color='primary'
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className='px-6 pb-8 sm:px-16 flex gap-3 justify-end'>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              setOpen(false)
              reset(defaultValues)
            }}
            sx={{ borderRadius: '8px', px: 6 }}
            className='hover:bg-actionHover transition-all'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disabled={isSubmitting}
            sx={{ borderRadius: '8px', px: 6 }}
            className='hover:opacity-90 transition-all font-semibold'
          >
            {isSubmitting && <CircularProgress size={20} className='me-2' />}
            {details?.id ? 'Update' : 'Add'} {getTypeName()}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ConfigFormDialog

