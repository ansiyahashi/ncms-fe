'use client'

import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { CircularProgress, FormHelperText, Switch, Divider, InputAdornment, FormControl } from '@mui/material'
import { boolean, nonEmpty, object, pipe, string, email, custom, minLength, forward, partialCheck } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { createBusiness, updateBusiness } from '../api/business.action'
import { validateError } from '@/api'

const getSchema = (isEdit: boolean) => {
  const baseSchema: any = {
    name: pipe(string(), nonEmpty('Business name is required')),
    email: pipe(string(), nonEmpty('Business email is required'), email('Please enter a valid email address')),
    plan: pipe(string(), nonEmpty('Subscription plan is required')),
    contact: string(),
    phone: pipe(
      string(),
      custom(
        (value: any) =>
          value === '' || /^[6-9]\d{9}$/.test(value),
        'Enter a valid 10-digit mobile number'
      )
    ),
    address: string(),
    business_type: string(),
    industry: string(),
    country: string(),
    common_name: string(),
    status: boolean()
  }

  if (!isEdit) {
    baseSchema.user_name = pipe(string(), nonEmpty('User name is required'))
    baseSchema.user_email = pipe(
      string(),
      nonEmpty('Admin email is required'),
      email('Please enter a valid email address')
    )
    baseSchema.password = pipe(
      string(),
      nonEmpty('Please enter password'),
      minLength(8, 'Password must be at least 8 characters long'),
      custom(
        (value: any) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(value),
        'Password must contain at least one lowercase, one uppercase, one number, and one special character'
      )
    )
    baseSchema.confirm_password = pipe(string(), nonEmpty('Please confirm your password'))

    const objSchema = object(baseSchema) as any

    const checkFn = partialCheck(
      [['password'], ['confirm_password']],
      (input: any) => input.password === input.confirm_password,
      'The two passwords do not match.'
    ) as any

    const forwardFn = forward(checkFn, ['confirm_password'] as any) as any

    return pipe(objSchema, forwardFn) as any
  }

  return object(baseSchema) as any
}

const defaultValues = {
  name: '',
  email: '',
  plan: 'free',
  contact: '',
  phone: '',
  address: '',
  business_type: 'retail',
  industry: '',
  country: '',
  common_name: '',
  status: true,
  user_name: '',
  user_email: '',
  password: '',
  confirm_password: ''
}

interface BusinessFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
  onDataChange: (data: any) => void
}

const BusinessFormDialog = ({ open, setOpen, details, onDataChange }: BusinessFormDialogProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleTogglePassword = () => setShowPassword(prev => !prev)
  const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev)

  const isEdit = !!details?.id

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: valibotResolver(getSchema(isEdit))
  })

  useEffect(() => {
    if (details) {
      reset({
        name: details.name || '',
        email: details.email || '',
        plan: details.plan || 'free',
        contact: details.contact || '',
        phone: details.phone || '',
        address: details.address || '',
        business_type: details.business_type || 'retail',
        industry: details.industry || '',
        country: details.country || '',
        common_name: details.common_name || '',
        status: details.status !== undefined ? details.status : true,
        user_name: '',
        user_email: '',
        password: '',
        confirm_password: ''
      })
    } else {
      reset(defaultValues)
    }
  }, [details, reset, open])



  const onSubmit = async (params: any) => {
    try {
      const payload = {
        businessData: {
          ...(details?.id ? { id: details?.id } : {}),
          ...params
        }
      }

      const { data, errors: responseErrors } = details?.id
        ? await updateBusiness(payload)
        : await createBusiness(payload)

      if (data?.updateBusiness) {
        toast.success('Successfully updated Business.')
        handleClose(data?.updateBusiness)
      }

      if (data?.createBusiness) {
        toast.success('Successfully created Business.')
        handleClose(data?.createBusiness)
      }

      validateError(responseErrors, defaultValues, setError)
    } catch (error: any) {
      toast.error(error?.message || (details?.id ? 'Failed to update Business.' : 'Failed to create Business.'))
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
      fullWidth
      maxWidth={false}
      scroll='body'
      onClose={() => {
        setOpen(false)
        reset(defaultValues)
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '8px',
          width: '100%',
          maxWidth: '680px'
        }
      }}
    >
      <DialogTitle variant='h4' className='flex gap-1 flex-col text-center pt-8 pb-4 px-6 sm:px-8'>
        <span className='font-bold text-textPrimary'>
          {details ? 'Update' : 'New'} Business Workspace
        </span>
        <Typography variant='body2' className='text-textSecondary'>
          Configure primary organization profile, administrative credentials, and subscription levels
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pt-2 pb-6 px-6 sm:px-8 flex flex-col gap-5'>
          <IconButton
            onClick={() => setOpen(false)}
            className='absolute top-4 right-4 hover:bg-actionHover rounded-full transition-colors'
          >
            <i className='ri-close-line text-textSecondary text-xl' />
          </IconButton>

          <Grid container spacing={4}>
            {/* Business Name */}
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Business Name'
                      onChange={onChange}
                      placeholder='Please enter business name'
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

            {/* Business Email */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Business Email'
                      onChange={onChange}
                      placeholder='Please enter business email'
                      error={Boolean(errors?.email)}
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
                {errors?.email && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors?.email?.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>



            {/* Contact Person */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='contact'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Contact Person'
                      onChange={onChange}
                      placeholder='Contact Person Name'
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
                      value={value}
                      label='Phone Number'
                      onChange={onChange}
                      placeholder='Business Phone Number'
                      error={Boolean(errors?.phone)}
                      slotProps={{
                        input: {
                          sx: { borderRadius: '8px' }
                        }
                      }}
                    />
                  )}
                />
                {errors?.phone && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors?.phone?.message as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Business Type */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='business_type'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Business Type'
                      onChange={onChange}
                      placeholder='e.g., Retail, Manufacturing'
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

            {/* Industry */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='industry'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Industry'
                      onChange={onChange}
                      placeholder='e.g., Healthcare, Real Estate'
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

            {/* Brand name */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='common_name'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Common/Brand Name'
                      onChange={onChange}
                      placeholder='e.g., Gateco Stores'
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

            {/* Country */}
            <Grid size={6}>
              <FormControl fullWidth>
                <Controller
                  name='country'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Country'
                      onChange={onChange}
                      placeholder='Country Location'
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

            {/* Physical Address */}
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='address'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Physical Address'
                      onChange={onChange}
                      placeholder='Business Address'
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

            {/* Switch Toggle status Row */}
            <Grid size={12}>
              <Box className='flex items-center justify-between p-4 rounded-xl border border-divider bg-backgroundDefault/50'>
                <Box className='flex flex-col gap-0.5'>
                  <Typography className='text-sm font-bold text-textPrimary'>Workspace Status</Typography>
                  <Typography className='text-[10px] text-textSecondary'>
                    Toggle to make this organization active and allow access to all operations.
                  </Typography>
                </Box>
                <Controller
                  name='status'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      checked={value}
                      onChange={e => onChange(e.target.checked)}
                      color='primary'
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Credentials creation details when adding new business */}
        {!details?.id && (
          <>
            <Divider className='my-4' />
            <DialogTitle variant='h4' className='text-center pt-0 pb-2 px-6 sm:px-8'>
              <span className='font-bold text-textPrimary text-lg'>Admin Account Setup</span>
              <Typography variant='body2' className='text-textSecondary'>
                Specify administrative credentials to manage this new business workspace
              </Typography>
            </DialogTitle>

            <DialogContent className='pt-2 pb-6 px-6 sm:px-8 flex flex-col gap-5'>
              <Grid container spacing={4}>
                {/* User name */}
                <Grid size={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='user_name'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          value={value}
                          label='Admin User Name'
                          onChange={onChange}
                          placeholder='Enter user name'
                          error={Boolean(errors?.user_name)}
                          slotProps={{
                            input: {
                              sx: { borderRadius: '8px' }
                            }
                          }}
                        />
                      )}
                    />
                    {errors?.user_name && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.user_name.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* User email */}
                <Grid size={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='user_email'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          value={value}
                          label='Admin Email'
                          onChange={onChange}
                          placeholder='Enter email'
                          error={Boolean(errors?.user_email)}
                          slotProps={{
                            input: {
                              sx: { borderRadius: '8px' }
                            }
                          }}
                        />
                      )}
                    />
                    {errors?.user_email && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.user_email.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Password */}
                <Grid size={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='password'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          fullWidth
                          value={value}
                          label='Password'
                          onChange={onChange}
                          type={showPassword ? 'text' : 'password'}
                          error={Boolean(errors?.password)}
                          slotProps={{
                            input: {
                              sx: { borderRadius: '8px' },
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButton
                                    edge='end'
                                    onClick={handleTogglePassword}
                                    onMouseDown={e => e.preventDefault()}
                                    aria-label='toggle password visibility'
                                  >
                                    <i className={showPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }
                          }}
                        />
                      )}
                    />
                    {errors?.password && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors?.password?.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Confirm password */}
                <Grid size={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='confirm_password'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          fullWidth
                          label='Confirm Password'
                          onChange={onChange}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={value}
                          error={Boolean(errors?.confirm_password)}
                          slotProps={{
                            input: {
                              sx: { borderRadius: '8px' },
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButton
                                    edge='end'
                                    onClick={handleToggleConfirmPassword}
                                    onMouseDown={e => e.preventDefault()}
                                    aria-label='toggle password visibility'
                                  >
                                    <i className={showConfirmPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }
                          }}
                        />
                      )}
                    />
                    {errors?.confirm_password && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors?.confirm_password?.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}

        <DialogActions className='px-6 pb-8 sm:px-8 flex gap-3 justify-end'>
          <Button
            variant='outlined'
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
            {details?.id ? 'Update' : 'Add'} Business
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default BusinessFormDialog
