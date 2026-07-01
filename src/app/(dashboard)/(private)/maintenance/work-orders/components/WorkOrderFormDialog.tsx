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
import { FormHelperText, InputLabel, Select, MenuItem, List, ListItem, ListItemSecondaryAction, IconButton, ListItemText, Divider, Box } from '@mui/material'
import { object, pipe, string, nonEmpty, optional, array } from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { validateError } from '@/api'
import { getLookupUnits } from '@/libs/actions/lookup.action'
import { createWorkOrder } from '../api/workOrder.action'

const schema = object({
  facility_id: pipe(string(), nonEmpty('Facility is required')),
  space_id: optional(string()),
  title: pipe(string(), nonEmpty('Work Order Title is required')),
  description: pipe(string(), nonEmpty('Work Order Description is required')),
  priority: pipe(string(), nonEmpty('Priority is required')),
  type: pipe(string(), nonEmpty('Work Order Type is required')),
  sr_id: optional(string())
})

const defaultValues = {
  facility_id: '',
  space_id: '',
  title: '',
  description: '',
  priority: 'medium',
  type: 'corrective',
  sr_id: ''
}

interface WorkOrderFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  prefillSR?: any
  onDataChange: (data: any) => void
  facilitiesData?: any[]
  currentBId?: string
}

const WorkOrderFormDialog = ({
  open,
  setOpen,
  prefillSR,
  onDataChange,
  facilitiesData = [],
  currentBId = ''
}: WorkOrderFormDialogProps) => {
  const [units, setUnits] = useState<any[]>([])
  const [checklist, setChecklist] = useState<string[]>([])
  const [newTaskInput, setNewTaskInput] = useState('')

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
    if (prefillSR) {
      reset({
        facility_id: prefillSR.facility_id || '',
        space_id: prefillSR.space_id || '',
        title: prefillSR.title || '',
        description: prefillSR.description || '',
        priority: prefillSR.priority || 'medium',
        type: 'corrective',
        sr_id: prefillSR.id || ''
      })
      // Add standard checklist tasks based on SR priority
      setChecklist([
        'Inspect reported issue site',
        'Troubleshoot and fix root cause',
        'Verify functionality & clean workspace'
      ])
    } else {
      reset(defaultValues)
      setChecklist([])
    }
  }, [prefillSR, reset, open])

  const handleAddTask = () => {
    if (newTaskInput.trim()) {
      setChecklist(prev => [...prev, newTaskInput.trim()])
      setNewTaskInput('')
    }
  }

  const handleRemoveTask = (idx: number) => {
    setChecklist(prev => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (params: any) => {
    try {
      const payload = {
        ...params,
        checklist: checklist.map(t => ({ task: t }))
      }

      const response = await createWorkOrder(payload)
      const returnedData = (response.data as any)?.createWorkOrder
      const responseErrors = response.errors

      if (returnedData) {
        toast.success(`Successfully created Work Order.`)
        handleClose(returnedData)
      }

      if (responseErrors) {
        validateError(responseErrors, defaultValues, setError)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save Work Order.')
    }
  }

  const handleClose = (data?: any) => {
    data && onDataChange(data)
    reset(defaultValues)
    setChecklist([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={() => handleClose()} maxWidth='md' fullWidth>
      <DialogTitle>{prefillSR ? 'Convert Service Request to Work Order' : 'Create Work Order'}</DialogTitle>
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
                    <Select {...field} label='Facility' disabled={!!prefillSR}>
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
              <FormControl fullWidth error={!!errors.type} size='small'>
                <InputLabel>Work Order Type</InputLabel>
                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label='Work Order Type'>
                      <MenuItem value='corrective'>Corrective</MenuItem>
                      <MenuItem value='preventive'>Preventive</MenuItem>
                      <MenuItem value='emergency'>Emergency</MenuItem>
                    </Select>
                  )}
                />
                {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
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
                    label='Work Order Title'
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
                    label='Work Order Description'
                    fullWidth
                    size='small'
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Divider className='my-2' />
              <Typography variant='subtitle2' className='font-semibold mb-2'>
                Checklist Tasks & Steps
              </Typography>
              <Box className='flex gap-2 mb-3'>
                <TextField
                  placeholder='Add a new task (e.g. Inspect compressor)'
                  fullWidth
                  size='small'
                  value={newTaskInput}
                  onChange={e => setNewTaskInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTask()
                    }
                  }}
                />
                <Button variant='outlined' onClick={handleAddTask}>
                  Add
                </Button>
              </Box>

              <List className='bg-actionHover rounded'>
                {checklist.map((task, idx) => (
                  <ListItem key={idx} divider={idx < checklist.length - 1}>
                    <ListItemText primary={`${idx + 1}. ${task}`} />
                    <ListItemSecondaryAction>
                      <IconButton edge='end' size='small' color='error' onClick={() => handleRemoveTask(idx)}>
                        <i className='ri-delete-bin-line' />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {checklist.length === 0 && (
                  <ListItem>
                    <ListItemText primary='No checklist tasks added. Add tasks above.' className='text-center opacity-60' />
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()} color='secondary'>
            Close
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            Create Work Order
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default WorkOrderFormDialog
