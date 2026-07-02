'use client'

import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { FormHelperText } from '@mui/material'
import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type { FacilityFormValues } from './FacilityForm'

interface FacilityBuildingInfoProps {
  control: Control<FacilityFormValues>
  errors: FieldErrors<FacilityFormValues>
}

const FacilityBuildingInfo = ({ control, errors }: FacilityBuildingInfoProps) => {
  return (
    <>
      {/* Structural Details Heading */}
      <Grid size={12}>
        <Box className='flex flex-col gap-1 mt-2'>
          <Typography className='font-bold text-xs uppercase tracking-wider text-primary'>
            Structural Details
          </Typography>
          <Divider />
        </Box>
      </Grid>

      {/* Staircases */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='number_of_staircases'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? '0'}
                label='Staircases'
                onChange={onChange}
                error={Boolean(errors?.number_of_staircases)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.number_of_staircases && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.number_of_staircases?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Elevators */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='number_of_elevators'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? '0'}
                label='Elevators'
                onChange={onChange}
                error={Boolean(errors?.number_of_elevators)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.number_of_elevators && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.number_of_elevators?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Escalators */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='number_of_escalators'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? '0'}
                label='Escalators'
                onChange={onChange}
                error={Boolean(errors?.number_of_escalators)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.number_of_escalators && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.number_of_escalators?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Total Floors */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='number_of_floors'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Total Floors'
                onChange={onChange}
                placeholder='e.g., 25'
                error={Boolean(errors?.number_of_floors)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.number_of_floors && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.number_of_floors?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Parking Floors */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='number_of_parking_floors'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Parking Floors'
                onChange={onChange}
                placeholder='e.g., 3'
                error={Boolean(errors?.number_of_parking_floors)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.number_of_parking_floors && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.number_of_parking_floors?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Parking Spaces */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='number_of_parkings'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Parking Spaces'
                onChange={onChange}
                placeholder='e.g., 350'
                error={Boolean(errors?.number_of_parkings)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.number_of_parkings && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.number_of_parkings?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Total Built-Up Area */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='total_built_up_area'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Total Built-Up Area (sqm)'
                onChange={onChange}
                placeholder='e.g., 15000'
                error={Boolean(errors?.total_built_up_area)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.total_built_up_area && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.total_built_up_area?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Gross Floor Area */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='gross_floor_area'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Gross Floor Area (sqm)'
                onChange={onChange}
                placeholder='e.g., 14000'
                error={Boolean(errors?.gross_floor_area)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.gross_floor_area && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.gross_floor_area?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Gross Leasable Area */}
      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='gross_leasable_area'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Gross Leasable Area (sqm)'
                onChange={onChange}
                placeholder='e.g., 12000'
                error={Boolean(errors?.gross_leasable_area)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.gross_leasable_area && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.gross_leasable_area?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
    </>
  )
}

export default FacilityBuildingInfo
