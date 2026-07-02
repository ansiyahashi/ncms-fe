'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { CircularProgress } from '@mui/material'
import { boolean, object, pipe, string, nonEmpty, optional, regex } from 'valibot'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'react-toastify'

import { validateError } from '@/api'
import { getLookupFacilityTypes, getLookupOwnerTypes, getLookupCostCenters } from '@/libs/actions/lookup.action'
import { createFacility, updateFacility } from '../../api/facility.action'
import FacilityBasicInfo from './FacilityBasicInfo'
import FacilityBuildingInfo from './FacilityBuildingInfo'
import FacilityFinancialInfo from './FacilityFinancialInfo'
import FacilityLocationInfo from './FacilityLocationInfo'

const schema = object({
  facility_name: pipe(string(), nonEmpty('Facility name is required')),
  facade_elevation_type: pipe(string(), nonEmpty('Facade elevation type is required')),
  security_contact: pipe(
    string(),
    nonEmpty('Security contact is required'),
    regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid security contact number')
  ),
  number_of_staircases: pipe(
    string(),
    nonEmpty('Number of staircases is required'),
    regex(/^[0-9]+$/, 'Must be a non-negative integer')
  ),
  number_of_elevators: pipe(
    string(),
    nonEmpty('Number of elevators is required'),
    regex(/^[0-9]+$/, 'Must be a non-negative integer')
  ),
  number_of_escalators: pipe(
    string(),
    nonEmpty('Number of escalators is required'),
    regex(/^[0-9]+$/, 'Must be a non-negative integer')
  ),
  facility_description: optional(string()),
  number_of_floors: optional(pipe(string(), regex(/^[0-9]*$/, 'Must be a non-negative integer'))),
  construction_costs: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  consultant_costs: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  asset_value: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  year_of_construction: optional(
    pipe(string(), regex(/^(18\d\d|19\d\d|20\d\d|2100)?$/, 'Must be between 1800 and 2100'))
  ),
  building_life_cycle_years: optional(pipe(string(), regex(/^[0-9]*$/, 'Must be a non-negative integer'))),
  residual_asset_value: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  depreciated_asset_value: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  maintenance_cost: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  number_of_parking_floors: optional(pipe(string(), regex(/^[0-9]*$/, 'Must be a non-negative integer'))),
  number_of_parkings: optional(pipe(string(), regex(/^[0-9]*$/, 'Must be a non-negative integer'))),
  total_built_up_area: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  gross_floor_area: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  gross_leasable_area: optional(pipe(string(), regex(/^\d*\.?\d*$/, 'Must be a valid positive number'))),
  sitemap_path: optional(string()),
  zone: optional(string()),
  sector: optional(string()),
  plot_number: optional(string()),
  facility_address: optional(string()),
  property_owned_by: optional(string()),
  owner_type_id: optional(string()),
  facility_type_id: optional(string()),
  cost_center_id: optional(string()),
  latitude: optional(pipe(string(), regex(/^-?\d*\.?\d*$/, 'Must be a valid number'))),
  longitude: optional(pipe(string(), regex(/^-?\d*\.?\d*$/, 'Must be a valid number'))),
  b_id: optional(string()),
  status: boolean()
})

export type FacilityFormValues = {
  facility_name: string
  facade_elevation_type: string
  security_contact: string
  number_of_staircases: string
  number_of_elevators: string
  number_of_escalators: string
  facility_description: string
  number_of_floors: string
  construction_costs: string
  consultant_costs: string
  asset_value: string
  year_of_construction: string
  building_life_cycle_years: string
  residual_asset_value: string
  depreciated_asset_value: string
  maintenance_cost: string
  number_of_parking_floors: string
  number_of_parkings: string
  total_built_up_area: string
  gross_floor_area: string
  gross_leasable_area: string
  sitemap_path: string
  zone: string
  sector: string
  plot_number: string
  facility_address: string
  property_owned_by: string
  owner_type_id: string
  facility_type_id: string
  cost_center_id: string
  latitude: string
  longitude: string
  b_id: string
  status: boolean
}

const defaultValues = {
  facility_name: '',
  facade_elevation_type: '',
  security_contact: '',
  number_of_staircases: '0',
  number_of_elevators: '0',
  number_of_escalators: '0',
  facility_description: '',
  number_of_floors: '',
  construction_costs: '',
  consultant_costs: '',
  asset_value: '',
  year_of_construction: '',
  building_life_cycle_years: '',
  residual_asset_value: '',
  depreciated_asset_value: '',
  maintenance_cost: '',
  number_of_parking_floors: '',
  number_of_parkings: '',
  total_built_up_area: '',
  gross_floor_area: '',
  gross_leasable_area: '',
  sitemap_path: '',
  zone: '',
  sector: '',
  plot_number: '',
  facility_address: '',
  property_owned_by: '',
  owner_type_id: '',
  facility_type_id: '',
  cost_center_id: '',
  latitude: '',
  longitude: '',
  b_id: '',
  status: true
}

interface FacilityFormProps {
  details?: any
  businessesData?: any[]
  currentBId?: string
  isSuperAdmin?: boolean
}

const FacilityForm = ({ details, businessesData = [], currentBId = '', isSuperAdmin = false }: FacilityFormProps) => {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FacilityFormValues>({
    defaultValues: {
      ...defaultValues,
      b_id: currentBId || ''
    },
    resolver: valibotResolver(schema),
    mode: 'onChange'
  })

  const watchedBId = watch('b_id')
  const effectiveBId = details?.b_id || watchedBId || currentBId

  const [facilityTypes, setFacilityTypes] = useState<any[]>([])
  const [ownerTypes, setOwnerTypes] = useState<any[]>([])
  const [costCenters, setCostCenters] = useState<any[]>([])
  const [loadingLookups, setLoadingLookups] = useState(false)

  useEffect(() => {
    let active = true

    const fetchLookups = async () => {
      if (!effectiveBId) {
        setFacilityTypes([])
        setOwnerTypes([])
        setCostCenters([])

        return
      }

      setLoadingLookups(true)

      try {
        const [ftRes, otRes, ccRes] = await Promise.all([
          getLookupFacilityTypes({ b_id: effectiveBId }),
          getLookupOwnerTypes({ b_id: effectiveBId }),
          getLookupCostCenters({ b_id: effectiveBId })
        ])

        if (active) {
          setFacilityTypes(ftRes?.data?.facilityTypes?.data || [])
          setOwnerTypes(otRes?.data?.ownerTypes?.data || [])
          setCostCenters(ccRes?.data?.costCenters?.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch lookups for facility form dialog:', err)
      } finally {
        if (active) {
          setLoadingLookups(false)
        }
      }
    }

    fetchLookups()

    return () => {
      active = false
    }
  }, [effectiveBId])

  // Reset dependent fields when b_id changes for a new record
  useEffect(() => {
    if (!details?.id) {
      setValue('facility_type_id', '')
      setValue('owner_type_id', '')
      setValue('cost_center_id', '')
      setValue('property_owned_by', '')
    }
  }, [watchedBId, details, setValue])

  // Populate form when editing an existing record
  useEffect(() => {
    if (details) {
      reset({
        ...defaultValues,
        ...details,
        number_of_staircases: String(details.number_of_staircases ?? '0'),
        number_of_elevators: String(details.number_of_elevators ?? '0'),
        number_of_escalators: String(details.number_of_escalators ?? '0'),
        number_of_floors: details.number_of_floors != null ? String(details.number_of_floors) : '',
        construction_costs: details.construction_costs != null ? String(details.construction_costs) : '',
        consultant_costs: details.consultant_costs != null ? String(details.consultant_costs) : '',
        asset_value: details.asset_value != null ? String(details.asset_value) : '',
        year_of_construction: details.year_of_construction != null ? String(details.year_of_construction) : '',
        building_life_cycle_years:
          details.building_life_cycle_years != null ? String(details.building_life_cycle_years) : '',
        residual_asset_value: details.residual_asset_value != null ? String(details.residual_asset_value) : '',
        depreciated_asset_value: details.depreciated_asset_value != null ? String(details.depreciated_asset_value) : '',
        maintenance_cost: details.maintenance_cost != null ? String(details.maintenance_cost) : '',
        number_of_parking_floors:
          details.number_of_parking_floors != null ? String(details.number_of_parking_floors) : '',
        number_of_parkings: details.number_of_parkings != null ? String(details.number_of_parkings) : '',
        total_built_up_area: details.total_built_up_area != null ? String(details.total_built_up_area) : '',
        gross_floor_area: details.gross_floor_area != null ? String(details.gross_floor_area) : '',
        gross_leasable_area: details.gross_leasable_area != null ? String(details.gross_leasable_area) : '',
        latitude: details.latitude != null ? String(details.latitude) : '',
        longitude: details.longitude != null ? String(details.longitude) : '',
        b_id: details.b_id || currentBId || '',
        status: details.status ?? defaultValues.status
      })
    } else {
      reset({
        ...defaultValues,
        b_id: currentBId || ''
      })
    }
  }, [details, reset, currentBId])

  const onSubmit = async (params: any) => {
    if (isSuperAdmin && !details?.id && !params.b_id) {
      setError('b_id', { message: 'Business is required' })

      return
    }

    try {
      const payload = {
        facilityData: {
          ...(details?.id ? { id: details?.id } : {}),
          ...params
        }
      }

      const response = details?.id
        ? await updateFacility(payload, '/facility/hierarchy')
        : await createFacility(payload)

      const returnedData = details?.id ? (response.data as any)?.updateFacility : (response.data as any)?.createFacility
      const responseErrors = response.errors

      if (returnedData) {
        toast.success(`Successfully ${details?.id ? 'updated' : 'created'} Facility.`)
        handleClose()
      }

      if (responseErrors) {
        validateError(responseErrors, defaultValues, setError)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save facility.')
    }
  }

  const handleClose = () => {
    reset(defaultValues)
    router.push('/facility/hierarchy')
  }

  return (
    <Card>
      <CardHeader
        title={details?.id ? 'Update Facility' : 'New Facility'}
        subheader={details?.id ? 'Modify facility details' : 'Register a new facility'}
      />

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <FacilityBasicInfo
              control={control}
              errors={errors}
              isSuperAdmin={isSuperAdmin}
              details={details}
              businessesData={businessesData}
              facilityTypes={facilityTypes}
              ownerTypes={ownerTypes}
              costCenters={costCenters}
              loadingLookups={loadingLookups}
              effectiveBId={effectiveBId}
            />

            <FacilityBuildingInfo control={control} errors={errors} />

            <FacilityFinancialInfo control={control} errors={errors} />

            <FacilityLocationInfo control={control} errors={errors} />
          </Grid>

          <Box mt={6} display='flex' justifyContent='flex-end' gap={2}>
            <Button variant='outlined' onClick={() => router.back()}>
              Cancel
            </Button>

            <Button type='submit' variant='contained' disabled={isSubmitting}>
              {isSubmitting && <CircularProgress size={20} sx={{ mr: 1 }} />}

              {details?.id ? 'Update Facility' : 'Create Facility'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}

export default FacilityForm
