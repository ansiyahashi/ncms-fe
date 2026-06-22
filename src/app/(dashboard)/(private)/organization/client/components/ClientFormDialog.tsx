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
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider
} from '@mui/material'
import { boolean, object, pipe, string, optional, nonEmpty } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { validateError } from '@/api'
import { createClient, updateClient } from '../api/client.action'

const schema = object({
  name: pipe(string(), nonEmpty('Client Name is required')),
  code: optional(string()),
  contact_person: optional(string()),
  email: optional(string()),
  phone: optional(string()),
  address: optional(string()),
  vat_trn_no: optional(string()),
  trade_licence_no: optional(string()),
  description: optional(string()),
  b_id: optional(string()),
  status: boolean()
})

const defaultValues = {
  name: '',
  code: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  vat_trn_no: '',
  trade_licence_no: '',
  description: '',
  b_id: '',
  status: true
}

interface ClientFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
  onDataChange: (data: any) => void
  businessesData?: any[]
  currentBId?: string
  isSuperAdmin?: boolean
}

const ClientFormDialog = ({
  open,
  setOpen,
  details,
  onDataChange,
  businessesData = [],
  currentBId = '',
  isSuperAdmin = false
}: ClientFormDialogProps) => {

  const isEdit = !!details?.id

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      ...defaultValues,
      b_id: currentBId || ''
    },
    mode: 'onChange',
    resolver: valibotResolver(schema)
  })

  useEffect(() => {
    if (details) {
      reset({
        ...defaultValues,
        ...details,
        b_id: details.b_id || currentBId || '',
        status: details.status ?? defaultValues.status
      })
    } else {
      reset({
        ...defaultValues,
        b_id: currentBId || ''
      })
    }
  }, [details, reset, open, currentBId])

  const onSubmit = async (params: any) => {
    if (isSuperAdmin && !details?.id && !params.b_id) {
      setError('b_id', { message: 'Business is required' })

      return
    }

    try {
      const payload = {
        clientData: {
          ...(details?.id ? { id: details?.id } : {}),
          ...params
        }
      }

      const response = details?.id
        ? await updateClient(payload, '/organization/client')
        : await createClient(payload)

      const returnedData = details?.id ? (response.data as any)?.updateClient : (response.data as any)?.createClient
      const responseErrors = response.errors

      if (returnedData) {
        toast.success(`Successfully ${details?.id ? 'updated' : 'created'} Client.`)
        handleClose(returnedData)
      }

      if (responseErrors) {
        validateError(responseErrors, defaultValues, setError)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save client.')
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
      maxWidth='md'
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
          {details?.id ? 'Update' : 'New'} Client Profile
        </span>
        <Typography variant='body2' className='text-textSecondary'>
          {details?.id
            ? 'Modify the profiles, contact details, and tax properties of this client'
            : 'Register a new client profile in the organization database'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pt-2 pb-6 px-6 sm:px-16 flex flex-col gap-6'>
          <IconButton
            onClick={() => setOpen(false)}
            className='absolute top-4 right-4 hover:bg-actionHover rounded-full transition-colors'
          >
            <i className='ri-close-line text-textSecondary text-xl' />
          </IconButton>

          <Grid container spacing={5}>

            {/* General Info Heading */}
            <Grid size={12}>
              <Box className='flex flex-col gap-1'>
                <Typography className='font-bold text-xs uppercase tracking-wider text-primary'>
                  General Information
                </Typography>
                <Divider />
              </Box>
            </Grid>

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

            {/* Name */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='name'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Client Name'
                      onChange={onChange}
                      placeholder='Enter client or company name'
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

            {/* Code */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='code'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Client Code'
                      onChange={onChange}
                      placeholder='e.g., CLI-202'
                      error={Boolean(errors?.code)}
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
                {errors?.code && <FormHelperText sx={{ color: 'error.main' }}>{errors?.code?.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Description */}
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
                      placeholder='Enter client profile summary or notes'
                      multiline
                      rows={2}
                      error={Boolean(errors?.description)}
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Contact Info Heading */}
            <Grid size={12}>
              <Box className='flex flex-col gap-1 mt-2'>
                <Typography className='font-bold text-xs uppercase tracking-wider text-primary'>
                  Contact Information
                </Typography>
                <Divider />
              </Box>
            </Grid>

            {/* Contact Person */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='contact_person'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Contact Person'
                      onChange={onChange}
                      placeholder='Enter primary contact name'
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Phone */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='phone'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Phone Number'
                      onChange={onChange}
                      placeholder='e.g., +971 50 123 4567'
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Email */}
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='email'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Email Address'
                      type='email'
                      onChange={onChange}
                      placeholder='e.g., client@company.com'
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Address */}
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='address'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Office Address'
                      onChange={onChange}
                      placeholder='Enter physical address details'
                      multiline
                      rows={2}
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Legal / Tax Heading */}
            <Grid size={12}>
              <Box className='flex flex-col gap-1 mt-2'>
                <Typography className='font-bold text-xs uppercase tracking-wider text-primary'>
                  Legal & Tax details
                </Typography>
                <Divider />
              </Box>
            </Grid>

            {/* VAT TRN No */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='vat_trn_no'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='VAT TRN Number'
                      onChange={onChange}
                      placeholder='e.g., 100234567800003'
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Trade Licence No */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='trade_licence_no'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Trade Licence Number'
                      onChange={onChange}
                      placeholder='e.g., 654321/DXB'
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Active Switch */}
            <Grid size={12}>
              <Box className='flex items-center justify-between p-4 rounded-xl border border-divider bg-backgroundDefault/50 mt-2'>
                <Box className='flex flex-col gap-0.5'>
                  <Typography className='text-sm font-bold text-textPrimary'>Active Profile Status</Typography>
                  <Typography className='text-[10px] text-textSecondary'>
                    Toggle to make this client account active across services and billing.
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
            {details?.id ? 'Update' : 'Add'} Client
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ClientFormDialog
