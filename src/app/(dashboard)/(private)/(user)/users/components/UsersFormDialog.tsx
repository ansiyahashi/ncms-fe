'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { useSession } from 'next-auth/react'
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
import { CircularProgress, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, Switch } from '@mui/material'
import { nonEmpty, object, pipe, string, minLength, email, forward, partialCheck, boolean, optional } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { createUser, updateUser } from '../api/user.action'
import { validateError } from '@/api'

const getSchema = (isEdit = false, isSuperAdmin = false) => {
  const baseSchema: any = {
    name: pipe(string(), nonEmpty('Please enter name')),
    email: pipe(string(), email('Please enter a valid email address')),
    role_id: pipe(string(), nonEmpty('Please select role')),
    dep_id: optional(string()),
    des_id: optional(string()),
    is_admin: boolean()
  }

  if (isSuperAdmin) {
    baseSchema.b_id = pipe(string(), nonEmpty('Please select business'))
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
  dep_id: '',
  des_id: '',
  password: '',
  confirm_password: '',
  is_admin: false,
  b_id: ''
}

interface UsersFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
  onDataChange: (data: any) => void
  roles?: any[]
  businesses?: any[]
  departments?: any[]
  designations?: any[]
  currentBId?: string
}

const UsersFormDialog = ({
  open,
  setOpen,
  details,
  onDataChange,
  roles = [],
  businesses = [],
  departments = [],
  designations = [],
  currentBId = ''
}: UsersFormDialogProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isFirstRender, setIsFirstRender] = useState(true)

  const isEdit = !!details?.id

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      ...defaultValues,
      b_id: currentBId || ''
    },
    mode: 'onChange',
    resolver: valibotResolver(getSchema(isEdit, isSuperAdmin) as any)
  })

  useEffect(() => {
    if (details) {
      reset({
        name: details.name || '',
        email: details.email || '',
        role_id: details.role_id || '',
        dep_id: details.dep_id || '',
        des_id: details.des_id || '',
        password: '',
        confirm_password: '',
        is_admin: details.is_admin || false,
        b_id: details.b_id || ''
      })
    } else {
      reset({
        ...defaultValues,
        b_id: currentBId || ''
      })
    }
  }, [details, reset, open, currentBId])

  const selectedBId = watch('b_id')

  // Reset role_id if selected business changes
  useEffect(() => {
    if (!isEdit && open) {
      setValue('role_id', '')
      setValue('dep_id', '')
      setValue('des_id', '')
    }
  }, [selectedBId, setValue, isEdit, open])

  const filteredRoles = useMemo(() => {
    if (selectedBId) {
      return roles.filter(role => role.b_id === selectedBId)
    }
    if (isSuperAdmin && !selectedBId) {
      return []
    }
    return roles
  }, [roles, selectedBId, isSuperAdmin])

  const filteredDepartments = useMemo(() => {
    if (selectedBId) {
      return departments.filter(dep => dep.b_id === selectedBId)
    }
    if (isSuperAdmin && !selectedBId) {
      return []
    }
    return departments
  }, [departments, selectedBId, isSuperAdmin])

  const selectedDepId = watch('dep_id')

  useEffect(() => {
    if (open) {
      setIsFirstRender(true)
    }
  }, [open])

  useEffect(() => {
    if (!isFirstRender) {
      setValue('des_id', '')
    } else {
      setIsFirstRender(false)
    }
  }, [selectedDepId, setValue])

  const filteredDesignations = useMemo(() => {
    let list = designations
    if (selectedBId) {
      list = list.filter(des => des.b_id === selectedBId)
    } else if (isSuperAdmin && !selectedBId) {
      return []
    }

    if (selectedDepId) {
      list = list.filter(des => des.dep_id === selectedDepId)
    } else {
      list = list.filter(des => !des.dep_id)
    }
    return list
  }, [designations, selectedBId, selectedDepId, isSuperAdmin])

  const onSubmit = async (params: any) => {
    try {
      const payload = {
        userData: {
          ...(details?.id ? { id: details?.id } : {}),
          ...params
        }
      }

      if (details?.id) {
        delete payload.userData.password
        delete payload.userData.confirm_password
      }

      const { data, errors } = details?.id
        ? await updateUser({ userData: payload.userData }, '/users')
        : await createUser(payload)

      if (data?.updateUser) {
        toast.success('Successfully updated User.')
        handleClose(data?.updateUser)
      }

      if (data?.createUser) {
        toast.success('Successfully created User.')
        handleClose(data?.createUser)
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
          {details?.id ? 'Update' : 'New'} User Account
        </span>
        <Typography variant='body2' className='text-textSecondary'>
          {details?.id
            ? 'Modify operational and security credentials for this user account'
            : 'Configure credentials for this new user account'}
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

            {/* Name */}
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

            {/* Email */}
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

            {/* Business Context (Super Admin) */}
            {isSuperAdmin && (
              <Grid size={12}>
                <FormControl fullWidth error={Boolean(errors?.b_id)}>
                  <InputLabel>Business</InputLabel>
                  <Controller
                    name='b_id'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        value={value}
                        onChange={onChange}
                        label='Business'
                        disabled={isEdit}
                        sx={{ borderRadius: '8px' }}
                      >
                        {businesses?.map(business => (
                          <MenuItem key={business?.id} value={business?.id}>
                            {business?.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors?.b_id && <FormHelperText>{errors?.b_id?.message}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

            {/* Role selection */}
            <Grid size={12}>
              <FormControl fullWidth error={Boolean(errors?.role_id)}>
                <InputLabel>Role</InputLabel>
                <Controller
                  name='role_id'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      value={value}
                      onChange={onChange}
                      label='Role'
                      sx={{ borderRadius: '8px' }}
                    >
                      {filteredRoles?.map(role => (
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

            {/* Department selection */}
            <Grid size={12}>
              <FormControl fullWidth error={Boolean(errors?.dep_id)}>
                <InputLabel>Department</InputLabel>
                <Controller
                  name='dep_id'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      value={value ?? ''}
                      onChange={onChange}
                      label='Department'
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value=''>
                        <em>None</em>
                      </MenuItem>
                      {filteredDepartments?.map(dep => (
                        <MenuItem key={dep?.id} value={dep?.id}>
                          {dep?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors?.dep_id && <FormHelperText>{errors?.dep_id?.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Designation selection */}
            <Grid size={12}>
              <FormControl fullWidth error={Boolean(errors?.des_id)}>
                <InputLabel>Designation</InputLabel>
                <Controller
                  name='des_id'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      value={value ?? ''}
                      onChange={onChange}
                      label='Designation'
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value=''>
                        <em>None</em>
                      </MenuItem>
                      {filteredDesignations?.map(des => (
                        <MenuItem key={des?.id} value={des?.id}>
                          {des?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors?.des_id && <FormHelperText>{errors?.des_id?.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Switch Toggle is_admin Row */}
            <Grid size={12}>
              <Box className='flex items-center justify-between p-4 rounded-xl border border-divider bg-backgroundDefault/50'>
                <Box className='flex flex-col gap-0.5'>
                  <Typography className='text-sm font-bold text-textPrimary'>Administrator Account</Typography>
                  <Typography className='text-[10px] text-textSecondary'>
                    Grant full administrator permissions to configure workflows and settings.
                  </Typography>
                </Box>
                <Controller
                  name='is_admin'
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

            {/* Password fields (new user only) */}
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
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions className='px-6 pb-8 sm:px-16 flex gap-3 justify-end'>
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
            {details?.id ? 'Update' : 'Add'} User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UsersFormDialog
