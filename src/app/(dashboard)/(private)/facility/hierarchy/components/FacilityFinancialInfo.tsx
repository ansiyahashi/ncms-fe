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

interface FacilityFinancialInfoProps {
  control: Control<FacilityFormValues>
  errors: FieldErrors<FacilityFormValues>
}

const FacilityFinancialInfo = ({ control, errors }: FacilityFinancialInfoProps) => {
  return (
    <>
      <Grid size={12}>
        <Box className='flex flex-col gap-1 mt-2'>
          <Typography className='font-bold text-xs uppercase tracking-wider text-primary'>
            Financials &amp; Lifecycles
          </Typography>
          <Divider />
        </Box>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='construction_costs'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Construction Cost ($)'
                onChange={onChange}
                placeholder='e.g., 12000000'
                error={Boolean(errors?.construction_costs)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.construction_costs && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.construction_costs?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='consultant_costs'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Consultant Cost ($)'
                onChange={onChange}
                placeholder='e.g., 1500000'
                error={Boolean(errors?.consultant_costs)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.consultant_costs && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.consultant_costs?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='asset_value'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Asset Value ($)'
                onChange={onChange}
                placeholder='e.g., 20000000'
                error={Boolean(errors?.asset_value)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.asset_value && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.asset_value?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='residual_asset_value'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Residual Value ($)'
                onChange={onChange}
                placeholder='e.g., 2000000'
                error={Boolean(errors?.residual_asset_value)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.residual_asset_value && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.residual_asset_value?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='depreciated_asset_value'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Depreciated Value ($)'
                onChange={onChange}
                placeholder='e.g., 18000000'
                error={Boolean(errors?.depreciated_asset_value)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.depreciated_asset_value && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.depreciated_asset_value?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={4}>
        <FormControl fullWidth>
          <Controller
            name='maintenance_cost'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Annual Maint. Cost ($)'
                onChange={onChange}
                placeholder='e.g., 120000'
                error={Boolean(errors?.maintenance_cost)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.maintenance_cost && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.maintenance_cost?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={6}>
        <FormControl fullWidth>
          <Controller
            name='year_of_construction'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Year of Construction'
                onChange={onChange}
                placeholder='e.g., 2020'
                error={Boolean(errors?.year_of_construction)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.year_of_construction && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.year_of_construction?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid size={6}>
        <FormControl fullWidth>
          <Controller
            name='building_life_cycle_years'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Life Cycle (Years)'
                onChange={onChange}
                placeholder='e.g., 50'
                error={Boolean(errors?.building_life_cycle_years)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.building_life_cycle_years && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.building_life_cycle_years?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
    </>
  )
}

export default FacilityFinancialInfo
