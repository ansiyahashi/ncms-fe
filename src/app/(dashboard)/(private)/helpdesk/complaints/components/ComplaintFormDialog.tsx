'use client'

import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import { FormHelperText, InputLabel, Select, MenuItem } from '@mui/material'
import { object, pipe, string, nonEmpty, optional } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { validateError } from '@/api'
import { getLookupUnits } from '@/libs/actions/lookup.action'
import { createComplaint, updateComplaint } from '../api/complaint.action'

const schema = object({
  facility_id: pipe(string(), nonEmpty('Facility is required')),
  space_id: optional(string()),
  title: pipe(string(), nonEmpty('Complaint Title is required')),
  description: pipe(string(), nonEmpty('Complaint Description is required'))
})

const defaultValues = {
  facility_id: '',
  space_id: '',
  title: '',
  description: ''
}

interface ComplaintFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
  onDataChange: (data: any) => void
  facilitiesData?: any[]
  currentBId?: string
}

const ComplaintFormDialog = ({
  open,
  setOpen,
  details,
  onDataChange,
  facilitiesData = [],
  currentBId = ''
}: ComplaintFormDialogProps) => {
  const [units, setUnits] = useState<any[]>([])

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: valibotResolver(schema)
  })

  const selectedFacilityId = watch('facility_id')

  useEffect(() => {
    if (selectedFacilityId) {
      getLookupUnits({ b_id: currentBId })
        .then(res => {
          if (res?.data?.units?.data) {
            setUnits(res.data.units.data)
          }
        })
        .catch(() => {})
    } else {
      setUnits([])
    }
  }, [selectedFacilityId, currentBId])

  useEffect(() => {
    if (details) {
      reset({
        facility_id: details.facility_id || '',
        space_id: details.space_id || '',
        title: details.title || '',
        description: details.description || ''
      })
    } else {
      reset(defaultValues)
    }
  }, [details, reset, open])

  const onSubmit = async (params: any) => {
    try {
      const payload = {
        ...(details?.id ? { id: details.id } : {}),
        ...params
      }

      const response = details?.id
        ? await updateComplaint(payload, '/helpdesk/complaints')
        : await createComplaint(payload)

      const returnedData = details?.id
        ? (response.data as any)?.updateComplaint
        : (response.data as any)?.createComplaint
      const responseErrors = response.errors

      if (returnedData) {
        toast.success(`Successfully ${details?.id ? 'updated' : 'raised'} Complaint.`)
        handleClose(returnedData)
      }

      if (responseErrors) {
        validateError(responseErrors, defaultValues, setError)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save complaint.')
    }
  }

  const handleClose = (data?: any) => {
    data && onDataChange(data)
    reset(defaultValues)
    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={() => handleClose()} maxWidth='md' fullWidth>
      <DialogTitle>{details?.id ? 'Edit Complaint' : 'Raise New Complaint'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pt-1'>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.facility_id} size='small'>
                <InputLabel>Facility</InputLabel>
                <Controller
                  name='facility_id'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label='Facility' disabled={!!details?.id}>
                      {facilitiesData.map((f: any) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.facility_id && <FormHelperText>{errors.facility_id.message}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.space_id} size='small'>
                <InputLabel>Space / Unit (Optional)</InputLabel>
                <Controller
                  name='space_id'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label='Space / Unit (Optional)'>
                      <MenuItem value=''>None</MenuItem>
                      {units.map((u: any) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.name} {u.code ? `(${u.code})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.space_id && <FormHelperText>{errors.space_id.message}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={12}>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Complaint Title'
                    fullWidth
                    size='small'
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Detailed Description'
                    fullWidth
                    size='small'
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()} color='secondary'>
            Close
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {details?.id ? 'Update Complaint' : 'Raise Complaint'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ComplaintFormDialog
