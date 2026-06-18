'use client'

import React, { useEffect } from 'react'

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
import { CircularProgress, FormHelperText, InputAdornment, InputLabel, MenuItem, Select } from '@mui/material'
import { nonEmpty, object, pipe, string, minLength, email, forward, partialCheck } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { createAdmin, updateAdmin } from '@/libs/actions/adminUser.action'
import { validateError } from '@/api'

const getSchema = (isEdit = false) => {
  const baseSchema: any = {
    name: pipe(string(), nonEmpty('Please enter name')),
    email: pipe(string(), email('Please enter a valid email address')),
    role_id: pipe(string(), nonEmpty('Please select role'))
  }

  if (!isEdit) {
    baseSchema.password = pipe(
      string(),
      nonEmpty('Please enter password'),
      minLength(6, 'Password must be at least 6 characters long')
    )

    baseSchema.confirm_password = pipe(string(), nonEmpty('Please confirm your password'))

    return pipe(
      object(baseSchema),
      forward(
        partialCheck(
          [['password'], ['confirm_password']],
          (input: any) => input.password === input.confirm_password,
          'The two passwords do not match.'
        ),
        ['confirm_password']
      ) as any
    )
  }

  return object(baseSchema)
}

const defaultValues = {
  name: '',
  email: '',
  role_id: '',
  password: '',
  confirm_password: ''
}

interface AdminUsersFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
  onDataChange: (data: any) => void
  roles?: any[]
  adminUsers?: any[]
}

const AdminUsersFormDialog = ({ open, setOpen, details, onDataChange, roles = [] }: AdminUsersFormDialogProps) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

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
    resolver: valibotResolver(getSchema(isEdit) as any)
  })

  useEffect(() => {
    if (details) {
      reset({
        name: details.name || '',
        email: details.email || '',
        role_id: details.role_id || '',
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
        adminData: {
          ...(details?.id ? { id: details?.id } : {}),
          ...params
        }
      }

      if (details?.id) {
        delete payload.adminData.password
        delete payload.adminData.confirm_password
      }

      const { data, errors } = details?.id
        ? await updateAdmin({ adminData: payload.adminData }, '/admin-users')
        : await createAdmin(payload)

      if (data?.updateAdmin) {
        toast.success('Successfully updated User.')
        handleClose(data?.updateAdmin)
      }

      if (data?.createAdmin) {
        toast.success('Successfully created User.')
        handleClose(data?.createAdmin)
      }

      validateError(errors, defaultValues, setError)
    } catch (error: any) {
      toast.error(error?.message || (details?.id ? 'Failed to update User.' : 'Failed to create User.'))
    }
  }

  const handleClose = (data?: any) => {
    data && onDataChange(data)
    reset(defaultValues)
    setOpen(false)
  }

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev)
  }

  return (
    <Dialog
      open={open}
      maxWidth='sm'
      scroll='body'
      onClose={() => {
        setOpen(false)
        reset(defaultValues)
      }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {details ? 'Update' : 'Add a New'} User
        <Typography component='span' className='flex flex-col text-center'>
          Please configure user details
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pbs-1 sm:pbe-6 sm:pli-16'>
          <IconButton onClick={() => setOpen(false)} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={5}>
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Name'
                      onChange={onChange}
                      placeholder='Please enter user name'
                      error={Boolean(errors?.name)}
                    />
                  )}
                />
                {errors?.name && <FormHelperText sx={{ color: 'error.main' }}>{errors?.name?.message}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value}
                      label='Email'
                      onChange={onChange}
                      placeholder='Please enter email address'
                      error={Boolean(errors?.email)}
                      disabled={isEdit}
                    />
                  )}
                />
                {errors?.email && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors?.email?.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth error={Boolean(errors?.role_id)}>
                <InputLabel>Role</InputLabel>
                <Controller
                  name='role_id'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select value={value} onChange={onChange} label='Role'>
                      {roles?.map(role => (
                        <MenuItem key={role?.id} value={role?.id}>
                          {role?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors?.role_id && <FormHelperText>{errors?.role_id?.message}</FormHelperText>}
              </FormControl>
            </Grid>
            {!details?.id && (
              <>
                <Grid size={12}>
                  <FormControl fullWidth>
                    <Controller
                      name='password'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          fullWidth
                          value={value}
                          label='Password'
                          onChange={onChange}
                          id='password'
                          type={showPassword ? 'text' : 'password'}
                          error={Boolean(errors?.password)}
                          slotProps={{
                            input: {
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
                <Grid size={12}>
                  <FormControl fullWidth>
                    <Controller
                      name='confirm_password'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          fullWidth
                          label='Confirm Password'
                          onChange={onChange}
                          id='confirm_password'
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={value}
                          error={Boolean(errors?.confirm_password)}
                          slotProps={{
                            input: {
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
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
            {isSubmitting && <CircularProgress size={20} />}
            {details?.id ? 'Update' : 'Add'} User
          </Button>
          <Button
            variant='outlined'
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

export default AdminUsersFormDialog
