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
import { CircularProgress, FormHelperText, FormControlLabel, Checkbox } from '@mui/material'
import { boolean, nonEmpty, object, pipe, string } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { createPermission, updatePermission } from '@/libs/actions/permissions.action'
import { validateError } from '@/api'

const schema = object({
  name: pipe(string(), nonEmpty('This field is required')),
  permission_code: pipe(string(), nonEmpty('This field is required')),
  description: string(),
  status: boolean()
})

const defaultValues = {
  name: '',
  permission_code: '',
  description: '',
  status: true
}

interface PermissionsFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
  onDataChange: (data: any) => void
}

const PermissionsFormDialog = ({ open, setOpen, details, onDataChange }: PermissionsFormDialogProps) => {
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

  const onSubmit = async (params: any) => {
    try {
      const payload = {
        permissionData: {
          ...(details?.id ? { id: details?.id } : {}),
          ...params
        }
      }

      const { data, errors: responseErrors } = details?.id
        ? await updatePermission(payload, '/permission')
        : await createPermission(payload)

      if (data?.updatePermission) {
        toast.success('Successfully updated Permission.')
        handleClose(data?.updatePermission)
      }

      if (data?.createPermission) {
        toast.success('Successfully created Permission.')
        handleClose(data?.createPermission)
      }

      validateError(responseErrors, defaultValues, setError)
    } catch (error: any) {
      toast.error(error?.message || (details?.id ? 'Failed to update Permission.' : 'Failed to create Permission.'))
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
      scroll='body'
      onClose={() => {
        setOpen(false)
        reset(defaultValues)
      }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {details ? 'Update' : 'Add a New'} Permission
        <Typography component='span' className='flex flex-col text-center'>
          Please configure permission details
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
                      value={value ?? ''}
                      label='Name'
                      onChange={onChange}
                      placeholder='Please enter Permission name'
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
                  name='permission_code'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value ?? ''}
                      label='Permission Code'
                      onChange={onChange}
                      placeholder='e.g., user.create'
                      error={Boolean(errors?.permission_code)}
                      disabled={!!details?.id}
                    />
                  )}
                />
                {errors?.permission_code && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors?.permission_code?.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
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
                      placeholder='Please enter description'
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
        <DialogActions>
          <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
            {isSubmitting && <CircularProgress size={20} />}
            {details?.id ? 'Update' : 'Add'} Permission
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

export default PermissionsFormDialog
