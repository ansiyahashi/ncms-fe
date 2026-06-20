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
import {
  CircularProgress,
  FormHelperText,
  FormControlLabel,
  Checkbox,
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
  updateAssetStatus
} from '../api/master-config.action'

const schema = object({
  name: pipe(string(), nonEmpty('Name is required')),
  code: optional(string()),
  key: optional(string()),
  description: optional(string()),
  b_id: optional(string()),
  status: boolean()
})

const defaultValues = {
  name: '',
  code: '',
  key: '',
  description: '',
  b_id: '',
  status: true
}

interface ConfigFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  type: 'cost-centers' | 'user-types' | 'owner-types' | 'facility-types' | 'asset-statuses'
  details?: any
  onDataChange: (data: any) => void
  businessesData?: any[]
  isSuperAdmin?: boolean
}

const configActions: Record<string, { create: any; update: any }> = {
  'cost-centers': { create: createCostCenter, update: updateCostCenter },
  'user-types': { create: createUserType, update: updateUserType },
  'owner-types': { create: createOwnerType, update: updateOwnerType },
  'facility-types': { create: createFacilityType, update: updateFacilityType },
  'asset-statuses': { create: createAssetStatus, update: updateAssetStatus }
}

const ConfigFormDialog = ({
  open,
  setOpen,
  type,
  details,
  onDataChange,
  businessesData = [],
  isSuperAdmin = false
}: ConfigFormDialogProps) => {
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
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {details ? 'Update' : 'Add a New'} {getTypeName()}
        <Typography component='span' className='flex flex-col text-center'>
          Configure the {getTypeName().toLowerCase()} details below
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pbs-1 sm:pbe-6 sm:pli-16'>
          <IconButton onClick={() => setOpen(false)} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
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
                    />
                  )}
                />
                {errors?.name && <FormHelperText sx={{ color: 'error.main' }}>{errors?.name?.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Description field for User Type, Facility Type, Asset Status */}
            {['user-types', 'facility-types', 'asset-statuses'].includes(type) && (
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
                      />
                    )}
                  />
                  {errors?.description && (
                    <FormHelperText sx={{ color: 'error.main' }}>{errors?.description?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {/* Active Status Checkbox */}
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Controller
                    name='status'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Checkbox checked={value ?? false} onChange={e => onChange(e.target.checked)} />
                    )}
                  />
                }
                label='Active'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='sm:pli-16 sm:pbe-16'>
          <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
            {isSubmitting && <CircularProgress size={20} className='me-2' />}
            {details?.id ? 'Update' : 'Add'} {getTypeName()}
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              setOpen(false)
              reset(defaultValues)
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ConfigFormDialog
