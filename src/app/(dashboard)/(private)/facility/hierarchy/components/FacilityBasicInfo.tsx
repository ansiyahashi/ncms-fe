'use client'

import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { FormHelperText, InputLabel, Select, MenuItem, Switch } from '@mui/material'
import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type { FacilityFormValues } from './FacilityForm'

interface FacilityBasicInfoProps {
  control: Control<FacilityFormValues>
  errors: FieldErrors<FacilityFormValues>
  isSuperAdmin?: boolean
  details?: any
  businessesData?: any[]
  facilityTypes?: any[]
  ownerTypes?: any[]
  costCenters?: any[]
  loadingLookups?: boolean
  effectiveBId?: string
}

const FacilityBasicInfo = ({
  control,
  errors,
  isSuperAdmin = false,
  details,
  businessesData = [],
  facilityTypes = [],
  ownerTypes = [],
  costCenters = [],
  loadingLookups = false,
  effectiveBId = ''
}: FacilityBasicInfoProps) => {
  return (
    <>
      {/* General Info Heading */}
      <Grid size={12}>
        <Box className='flex flex-col gap-1'>
          <Typography className='font-bold text-xs uppercase tracking-wider text-primary'>
            General &amp; Essential Info
          </Typography>
          <Divider />
        </Box>
      </Grid>

      {/* Business Selection if Super Admin */}
      {isSuperAdmin && !details?.id && (
        <Grid size={12}>
          <FormControl fullWidth error={Boolean(errors?.b_id)}>
            <InputLabel id='facility-business-select-label'>Business Context</InputLabel>
            <Controller
              name='b_id'
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select
                  labelId='facility-business-select-label'
                  id='facility-business-select'
                  value={value ?? ''}
                  label='Business Context'
                  onChange={onChange}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value='' disabled>
                    Select a Business
                  </MenuItem>
                  {businessesData.map((business: any) => (
                    <MenuItem key={business.id} value={business.id}>
                      {business.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors?.b_id && <FormHelperText>{errors?.b_id?.message as string}</FormHelperText>}
          </FormControl>
        </Grid>
      )}

      {/* Facility Name */}
      <Grid size={6}>
        <FormControl fullWidth>
          <Controller
            name='facility_name'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Facility Name'
                onChange={onChange}
                placeholder='e.g., Dubai HQ Tower'
                error={Boolean(errors?.facility_name)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.facility_name && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.facility_name?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Facade Elevation Type */}
      <Grid size={6}>
        <FormControl fullWidth>
          <Controller
            name='facade_elevation_type'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Facade Elevation Type'
                onChange={onChange}
                placeholder='e.g., Curtain Wall Glass'
                error={Boolean(errors?.facade_elevation_type)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.facade_elevation_type && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {errors?.facade_elevation_type?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Security Contact */}
      <Grid size={6}>
        <FormControl fullWidth>
          <Controller
            name='security_contact'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Security Contact'
                onChange={onChange}
                placeholder='e.g., +971 4 555 1234'
                error={Boolean(errors?.security_contact)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
          {errors?.security_contact && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors?.security_contact?.message as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Address */}
      <Grid size={6}>
        <FormControl fullWidth>
          <Controller
            name='facility_address'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Facility Address'
                onChange={onChange}
                placeholder='e.g., Sheikh Zayed Road, Dubai, UAE'
                error={Boolean(errors?.facility_address)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
        </FormControl>
      </Grid>

      {/* Description */}
      <Grid size={12}>
        <FormControl fullWidth>
          <Controller
            name='facility_description'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value ?? ''}
                label='Facility Description'
                onChange={onChange}
                placeholder='Enter facility details, purpose or notes'
                multiline
                rows={2}
                error={Boolean(errors?.facility_description)}
                slotProps={{ input: { sx: { borderRadius: '8px' } } }}
              />
            )}
          />
        </FormControl>
      </Grid>

      {/* Classification & Accounting Heading */}
      <Grid size={12}>
        <Box className='flex flex-col gap-1 mt-2'>
          <Typography className='font-bold text-xs uppercase tracking-wider text-primary'>
            Classification &amp; Accounting
          </Typography>
          <Divider />
        </Box>
      </Grid>

      {/* Facility Type */}
      <Grid size={6}>
        <FormControl fullWidth error={Boolean(errors?.facility_type_id)}>
          <InputLabel id='facility-type-select-label'>Facility Type</InputLabel>
          <Controller
            name='facility_type_id'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                labelId='facility-type-select-label'
                id='facility-type-select'
                value={value ?? ''}
                label='Facility Type'
                onChange={onChange}
                sx={{ borderRadius: '8px' }}
                disabled={loadingLookups || !effectiveBId}
              >
                <MenuItem value=''>{loadingLookups ? 'Loading...' : <em>None</em>}</MenuItem>
                {facilityTypes.map((type: any) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </Grid>

      {/* Owner Type */}
      <Grid size={6}>
        <FormControl fullWidth error={Boolean(errors?.owner_type_id)}>
          <InputLabel id='facility-owner-select-label'>Owner Type</InputLabel>
          <Controller
            name='owner_type_id'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                labelId='facility-owner-select-label'
                id='facility-owner-select'
                value={value ?? ''}
                label='Owner Type'
                onChange={onChange}
                sx={{ borderRadius: '8px' }}
                disabled={loadingLookups || !effectiveBId}
              >
                <MenuItem value=''>{loadingLookups ? 'Loading...' : <em>None</em>}</MenuItem>
                {ownerTypes.map((type: any) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </Grid>

      {/* Cost Center */}
      <Grid size={6}>
        <FormControl fullWidth error={Boolean(errors?.cost_center_id)}>
          <InputLabel id='facility-costcenter-select-label'>Cost Center</InputLabel>
          <Controller
            name='cost_center_id'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                labelId='facility-costcenter-select-label'
                id='facility-costcenter-select'
                value={value ?? ''}
                label='Cost Center'
                onChange={onChange}
                sx={{ borderRadius: '8px' }}
                disabled={loadingLookups || !effectiveBId}
              >
                <MenuItem value=''>{loadingLookups ? 'Loading...' : <em>None</em>}</MenuItem>
                {costCenters.map((cc: any) => (
                  <MenuItem key={cc.id} value={cc.id}>
                    {cc.name} ({cc.code})
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </Grid>

      {/* Property Owned By */}
      <Grid size={6}>
        <FormControl fullWidth error={Boolean(errors?.property_owned_by)}>
          <InputLabel id='facility-ownedby-select-label'>Property Owned By</InputLabel>
          <Controller
            name='property_owned_by'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                labelId='facility-ownedby-select-label'
                id='facility-ownedby-select'
                value={value ?? ''}
                label='Property Owned By'
                onChange={onChange}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                {businessesData.map((business: any) => (
                  <MenuItem key={business.id} value={business.id}>
                    {business.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </Grid>

      {/* Active Status */}
      <Grid size={12}>
        <Box className='flex items-center justify-between p-4 rounded-xl border border-divider bg-backgroundDefault/50 mt-2'>
          <Box className='flex flex-col gap-0.5'>
            <Typography className='text-sm font-bold text-textPrimary'>Active Facility Status</Typography>
            <Typography className='text-[10px] text-textSecondary'>
              Toggle to make this facility active and available for buildings and service operations.
            </Typography>
          </Box>
          <Controller
            name='status'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch checked={value ?? false} onChange={e => onChange(e.target.checked)} color='primary' />
            )}
          />
        </Box>
      </Grid>
    </>
  )
}

export default FacilityBasicInfo
