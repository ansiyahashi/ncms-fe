'use client'

import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
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
import { createServiceRequest } from '../api/serviceRequest.action'

const schema = object({
  facility_id: pipe(string(), nonEmpty('Facility is required')),
  space_id: optional(string()),
  title: pipe(string(), nonEmpty('Service Request Title is required')),
  description: pipe(string(), nonEmpty('Service Request Description is required')),
  priority: pipe(string(), nonEmpty('Priority is required')),
  complaint_id: optional(string())
})

const defaultValues = {
  facility_id: '',
  space_id: '',
  title: '',
  description: '',
  priority: 'medium',
  complaint_id: ''
}

interface ServiceRequestFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  prefillComplaint?: any
  onDataChange: (data: any) => void
  facilitiesData?: any[]
  currentBId?: string
}

const ServiceRequestFormDialog = ({
  open,
  setOpen,
  prefillComplaint,
  onDataChange,
  facilitiesData = [],
  currentBId = ''
}: ServiceRequestFormDialogProps) => {
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
    if (prefillComplaint) {
      reset({
        facility_id: prefillComplaint.facility_id || '',
        space_id: prefillComplaint.space_id || '',
        title: prefillComplaint.title || '',
        description: prefillComplaint.description || '',
        priority: 'medium',
        complaint_id: prefillComplaint.id || ''
      })
    } else {
      reset(defaultValues)
    }
  }, [prefillComplaint, reset, open])

  const onSubmit = async (params: any) => {
    try {
      const response = await createServiceRequest(params)
      const returnedData = (response.data as any)?.createServiceRequest
      const responseErrors = response.errors

      if (returnedData) {
        toast.success(`Successfully created Service Request.`)
        handleClose(returnedData)
      }

      if (responseErrors) {
        validateError(responseErrors, defaultValues, setError)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save Service Request.')
    }
  }

  const handleClose = (data?: any) => {
    data && onDataChange(data)
    reset(defaultValues)
    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={() => handleClose()} maxWidth='md' fullWidth>
      <DialogTitle>{prefillComplaint ? 'Convert Complaint to Service Request' : 'Create Service Request'}</DialogTitle>
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
                    <Select {...field} label='Facility' disabled={!!prefillComplaint}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.priority} size='small'>
                <InputLabel>Priority</InputLabel>
                <Controller
                  name='priority'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label='Priority'>
                      <MenuItem value='low'>Low</MenuItem>
                      <MenuItem value='medium'>Medium</MenuItem>
                      <MenuItem value='high'>High</MenuItem>
                      <MenuItem value='emergency'>Emergency</MenuItem>
                    </Select>
                  )}
                />
                {errors.priority && <FormHelperText>{errors.priority.message}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={12}>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Request Title'
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
                    label='Request Description'
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
            Create Service Request
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ServiceRequestFormDialog
