'use client'

import React from 'react'

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
import { CircularProgress, FormHelperText, InputAdornment } from '@mui/material'
import { nonEmpty, object, pipe, string, minLength, forward, partialCheck } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { changePassword } from '@/libs/actions/auth.action'
import { validateError } from '@/api'

const schema = pipe(
  object({
    currentPassword: pipe(string(), nonEmpty('Current password is required')),
    newPassword: pipe(
      string(),
      nonEmpty('New password is required'),
      minLength(6, 'Password must be at least 6 characters long')
    ),
    confirmPassword: pipe(string(), nonEmpty('Please confirm your new password'))
  }),
  forward(
    partialCheck(
      [['newPassword'], ['confirmPassword']],
      (input: any) => input.newPassword === input.confirmPassword,
      'The two passwords do not match.'
    ),
    ['confirmPassword']
  ) as any
)

const defaultValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

interface ChangePasswordDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const ChangePasswordDialog = ({ open, setOpen }: ChangePasswordDialogProps) => {
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)

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

  const onSubmit = async (params: any) => {
    try {
      const { data, errors: responseErrors } = await changePassword(params)

      if (data?.changePassword) {
        toast.success('Password changed successfully!')
        handleClose()
      }

      validateError(responseErrors, defaultValues, setError)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change password.')
    }
  }

  const handleClose = () => {
    reset(defaultValues)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      maxWidth='xs'
      fullWidth
      scroll='body'
      onClose={() => {
        setOpen(false)
        reset(defaultValues)
      }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Change Password
        <Typography component='span' className='flex flex-col text-center text-textSecondary'>
          Update your account password
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
                  name='currentPassword'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      fullWidth
                      value={value}
                      label='Current Password'
                      onChange={onChange}
                      type={showCurrent ? 'text' : 'password'}
                      error={Boolean(errors?.currentPassword)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton edge='end' onClick={() => setShowCurrent(!showCurrent)}>
                                <i className={showCurrent ? 'ri-eye-line' : 'ri-eye-off-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  )}
                />
                {errors?.currentPassword && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors?.currentPassword?.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='newPassword'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      fullWidth
                      value={value}
                      label='New Password'
                      onChange={onChange}
                      type={showNew ? 'text' : 'password'}
                      error={Boolean(errors?.newPassword)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton edge='end' onClick={() => setShowNew(!showNew)}>
                                <i className={showNew ? 'ri-eye-line' : 'ri-eye-off-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  )}
                />
                {errors?.newPassword && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors?.newPassword?.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='confirmPassword'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      fullWidth
                      value={value}
                      label='Confirm New Password'
                      onChange={onChange}
                      type={showConfirm ? 'text' : 'password'}
                      error={Boolean(errors?.confirmPassword)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton edge='end' onClick={() => setShowConfirm(!showConfirm)}>
                                <i className={showConfirm ? 'ri-eye-line' : 'ri-eye-off-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  )}
                />
                {errors?.confirmPassword && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors?.confirmPassword?.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
            {isSubmitting && <CircularProgress size={20} />}
            Change Password
          </Button>
          <Button variant='outlined' onClick={() => { setOpen(false); reset(defaultValues); }}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ChangePasswordDialog
