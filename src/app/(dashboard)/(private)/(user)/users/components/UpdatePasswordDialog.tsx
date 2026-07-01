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
import { nonEmpty, object, pipe, string, minLength, forward, partialCheck, regex } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { updateUserPassword } from '../api/user.action'
import { validateError } from '@/api'

const schema = pipe(
  object({
    password: pipe(
      string(),
      nonEmpty('Please enter password'),
      minLength(8, 'Password must be at least 8 characters long'),
      regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      )
    ),
    confirm_password: pipe(string(), nonEmpty('Please confirm your password'))
  }),
  forward(
    partialCheck(
      [['password'], ['confirm_password']],
      (input: any) => input.password === input.confirm_password,
      'The two passwords do not match.'
    ),
    ['confirm_password']
  ) as any
)

const defaultValues = {
  password: '',
  confirm_password: ''
}

interface UpdatePasswordDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  userId: string
  userName?: string
}

const UpdatePasswordDialog = ({ open, setOpen, userId, userName }: UpdatePasswordDialogProps) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

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
      const { data, errors: responseErrors } = await updateUserPassword(userId, params.password, '/users')

      if (data?.updateUserPassword) {
        toast.success('Successfully updated password.')
        handleClose()
      }

      validateError(responseErrors, defaultValues, setError)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update password.')
    }
  }

  const handleClose = () => {
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
      maxWidth='xs'
      fullWidth
      scroll='body'
      onClose={() => {
        setOpen(false)
        reset(defaultValues)
      }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Reset Password
        {userName && (
          <Typography component='span' className='flex flex-col text-center text-textSecondary'>
            For user: {userName}
          </Typography>
        )}
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
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      fullWidth
                      value={value}
                      label='New Password'
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
                      label='Confirm New Password'
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
            {isSubmitting && <CircularProgress size={20} />}
            Reset Password
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

export default UpdatePasswordDialog
