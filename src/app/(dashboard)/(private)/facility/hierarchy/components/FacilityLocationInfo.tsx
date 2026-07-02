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

interface FacilityLocationInfoProps {
  control: Control<FacilityFormValues>
  errors: FieldErrors<FacilityFormValues>
}

const FacilityLocationInfo = ({ control, errors }: FacilityLocationInfoProps) => {
  return (
    <>
      <Grid size={12}>
        <Box className='flex flex-col gap-1 mt-2'>
          <Typography className='font-bold text-xs uppercase tracking-wider text-primary'>
            Location, GIS &amp; Sitemap
          </Typography>
          <Divider />
        </Box>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='latitude'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Latitude'
                onChange={onChange}
                placeholder='e.g., 25.2048'
                error={Boolean(errors?.latitude)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.latitude && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.latitude?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='longitude'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Longitude'
                onChange={onChange}
                placeholder='e.g., 55.2708'
                error={Boolean(errors?.longitude)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.longitude && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.longitude?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='sitemap_path'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Sitemap Path'
                onChange={onChange}
                placeholder='e.g., /sitemaps/hq.dwg'
                error={Boolean(errors?.sitemap_path)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='zone'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Zone'
                onChange={onChange}
                placeholder='e.g., Zone 1'
                error={Boolean(errors?.zone)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='sector'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Sector'
                onChange={onChange}
                placeholder='e.g., Sector 3'
                error={Boolean(errors?.sector)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='plot_number'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Plot Number'
                onChange={onChange}
                placeholder='e.g., Plot 12A'
                error={Boolean(errors?.plot_number)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
        </FormControl>
      </Grid>
    </>
  )
}

export default FacilityLocationInfo
