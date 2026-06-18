'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { LoadingButton } from '@mui/lab'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, nonEmpty, pipe, forward, partialCheck } from 'valibot'
import classnames from 'classnames'
import { toast } from 'react-toastify'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

import { resetPassword } from '@/libs/api/auth/auth.action'
import { validateError } from '@/libs/api'

const schema = pipe(
  object({
    password: pipe(
      string(),
      nonEmpty('Please enter password'),
      minLength(6, 'Password must be at least 6 characters long')
    ),
    confirmPassword: pipe(string(), nonEmpty('Please confirm your password'))
  }),
  forward(
    partialCheck(
      [['password'], ['confirmPassword']],
      (input: any) => input.password === input.confirmPassword,
      'The two passwords do not match.'
    ),
    ['confirmPassword']
  ) as any
)

const defaultValues = {
  password: '',
  confirmPassword: ''
}

const ResetPassword = ({ mode }: { mode: Mode }) => {
  // States
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-reset-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-reset-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-reset-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-reset-password-light-border.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: defaultValues
  })

  const onSubmit = async (data: any) => {
    const token = searchParams.get('token')

    if (!token) {
      toast.error('Reset token is missing in URL. Please request a new link.')
      
return
    }

    try {
      const res = await resetPassword({ token, password: data.password })

      if (res?.data?.resetPassword) {
        toast.success(res?.data?.resetPassword?.message || 'Password reset successfully!')
        router.push('/login')
      }

      validateError(res?.errors, defaultValues, setError)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset password. Please try again.')
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[673px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' alt='auth-background' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]' href='/'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Reset Password 🛠️</Typography>
            <Typography className='mbs-1'>Please enter your new password to regain access to your account</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  label='New Password'
                  type={showPassword ? 'text' : 'password'}
                  error={Boolean(errors?.password)}
                  helperText={errors?.password?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={() => setShowPassword(!showPassword)}>
                            <i className={showPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />

            <Controller
              name='confirmPassword'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Confirm New Password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={Boolean(errors?.confirmPassword)}
                  helperText={errors?.confirmPassword?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <i className={showConfirmPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />

            <LoadingButton loading={isSubmitting} fullWidth variant='contained' type='submit'>
              Reset Password
            </LoadingButton>
            <Typography className='text-center mbs-2'>
              <Link href='/login' className='flex justify-center items-center gap-1.5'>
                <i className='ri-arrow-left-s-line' />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
