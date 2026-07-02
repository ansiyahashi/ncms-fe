'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatFacility(item: any) {
  if (!item) return null

  return {
    id: item._id,
    b_id: item.b_id?._id || item.b_id || '',
    property_owned_by: item.property_owned_by?._id || item.property_owned_by || '',
    facility_name: item.facility_name || '',
    owner_type_id: item.owner_type_id?._id || item.owner_type_id || '',
    facility_type_id: item.facility_type_id?._id || item.facility_type_id || '',
    facility_description: item.facility_description || '',
    number_of_floors: item.number_of_floors ?? 0,
    facade_elevation_type: item.facade_elevation_type || '',
    security_contact: item.security_contact || '',
    number_of_staircases: item.number_of_staircases ?? 0,
    number_of_elevators: item.number_of_elevators ?? 0,
    number_of_escalators: item.number_of_escalators ?? 0,
    construction_costs: item.construction_costs ?? 0,
    consultant_costs: item.consultant_costs ?? 0,
    asset_value: item.asset_value ?? 0,
    year_of_construction: item.year_of_construction ?? '',
    building_life_cycle_years: item.building_life_cycle_years ?? '',
    residual_asset_value: item.residual_asset_value ?? 0,
    depreciated_asset_value: item.depreciated_asset_value ?? 0,
    maintenance_cost: item.maintenance_cost ?? 0,
    number_of_parking_floors: item.number_of_parking_floors ?? 0,
    number_of_parkings: item.number_of_parkings ?? 0,
    total_built_up_area: item.total_built_up_area ?? 0,
    gross_floor_area: item.gross_floor_area ?? 0,
    gross_leasable_area: item.gross_leasable_area ?? 0,
    sitemap_path: item.sitemap_path || '',
    zone: item.zone || '',
    sector: item.sector || '',
    plot_number: item.plot_number || '',
    cost_center_id: item.cost_center_id?._id || item.cost_center_id || '',
    latitude: item.latitude ?? '',
    longitude: item.longitude ?? '',
    facility_address: item.facility_address || '',
    status: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

export async function getAllFacilities(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const facility_type_id = variables?.facility_type_id || ''
  const owner_type_id = variables?.owner_type_id || ''
  const cost_center_id = variables?.cost_center_id || ''

  let url = `/facilities?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  if (facility_type_id) {
    url += `&facility_type_id=${encodeURIComponent(facility_type_id)}`
  }

  if (owner_type_id) {
    url += `&owner_type_id=${encodeURIComponent(owner_type_id)}`
  }

  if (cost_center_id) {
    url += `&cost_center_id=${encodeURIComponent(cost_center_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatFacility(item))

    return {
      data: {
        facilities: {
          data: mapped,
          totalData: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 0,
          currentPage: (res.pagination?.page || 1) - 1,
          errors: undefined
        }
      }
    }
  }

  return {
    data: {
      facilities: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch Facilities' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch Facilities' }
  }
}

export async function getFacilityById(variables: { id: string; b_id?: string; include_related?: boolean }) {
  const { id, b_id, include_related = false } = variables

  let url = `/facilities/${id}`

  const params = new URLSearchParams()

  if (b_id) {
    params.append('b_id', b_id)
  }

  if (include_related) {
    params.append('include_related', 'true')
  }

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    return {
      data: {
        facility: formatFacility(res.data)
      }
    }
  }

  return {
    errors: res?.errors || {
      message: 'Failed to fetch Facility'
    }
  }
}

export async function createFacility(variables: any, path?: string) {
  const body = {
    b_id: variables?.facilityData?.b_id,
    facility_name: variables?.facilityData?.facility_name,
    facility_description: variables?.facilityData?.facility_description || undefined,
    facade_elevation_type: variables?.facilityData?.facade_elevation_type,
    security_contact: variables?.facilityData?.security_contact,
    number_of_staircases: Number(variables?.facilityData?.number_of_staircases ?? 0),
    number_of_elevators: Number(variables?.facilityData?.number_of_elevators ?? 0),
    number_of_escalators: Number(variables?.facilityData?.number_of_escalators ?? 0),
    number_of_floors: variables?.facilityData?.number_of_floors
      ? Number(variables.facilityData.number_of_floors)
      : undefined,
    construction_costs: variables?.facilityData?.construction_costs
      ? Number(variables.facilityData.construction_costs)
      : undefined,
    consultant_costs: variables?.facilityData?.consultant_costs
      ? Number(variables.facilityData.consultant_costs)
      : undefined,
    asset_value: variables?.facilityData?.asset_value ? Number(variables.facilityData.asset_value) : undefined,
    year_of_construction: variables?.facilityData?.year_of_construction
      ? Number(variables.facilityData.year_of_construction)
      : undefined,
    building_life_cycle_years: variables?.facilityData?.building_life_cycle_years
      ? Number(variables.facilityData.building_life_cycle_years)
      : undefined,
    residual_asset_value: variables?.facilityData?.residual_asset_value
      ? Number(variables.facilityData.residual_asset_value)
      : undefined,
    depreciated_asset_value: variables?.facilityData?.depreciated_asset_value
      ? Number(variables.facilityData.depreciated_asset_value)
      : undefined,
    maintenance_cost: variables?.facilityData?.maintenance_cost
      ? Number(variables.facilityData.maintenance_cost)
      : undefined,
    number_of_parking_floors: variables?.facilityData?.number_of_parking_floors
      ? Number(variables.facilityData.number_of_parking_floors)
      : undefined,
    number_of_parkings: variables?.facilityData?.number_of_parkings
      ? Number(variables.facilityData.number_of_parkings)
      : undefined,
    total_built_up_area: variables?.facilityData?.total_built_up_area
      ? Number(variables.facilityData.total_built_up_area)
      : undefined,
    gross_floor_area: variables?.facilityData?.gross_floor_area
      ? Number(variables.facilityData.gross_floor_area)
      : undefined,
    gross_leasable_area: variables?.facilityData?.gross_leasable_area
      ? Number(variables.facilityData.gross_leasable_area)
      : undefined,
    sitemap_path: variables?.facilityData?.sitemap_path || undefined,
    zone: variables?.facilityData?.zone || undefined,
    sector: variables?.facilityData?.sector || undefined,
    plot_number: variables?.facilityData?.plot_number || undefined,
    facility_address: variables?.facilityData?.facility_address || undefined,
    property_owned_by: variables?.facilityData?.property_owned_by || undefined,
    owner_type_id: variables?.facilityData?.owner_type_id || undefined,
    facility_type_id: variables?.facilityData?.facility_type_id || undefined,
    cost_center_id: variables?.facilityData?.cost_center_id || undefined,
    latitude: variables?.facilityData?.latitude ? Number(variables.facilityData.latitude) : undefined,
    longitude: variables?.facilityData?.longitude ? Number(variables.facilityData.longitude) : undefined,
    is_active: variables?.facilityData?.status !== undefined ? variables.facilityData.status : true
  }

  const res = await postServerRequest('/facilities', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return { data: { createFacility: formatFacility(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to create Facility' } }
}

export async function updateFacility(variables: any, path?: string) {
  const id = variables?.facilityData?.id
  const b_id = variables?.facilityData?.b_id

  const body = {
    facility_name: variables?.facilityData?.facility_name,
    facility_description: variables?.facilityData?.facility_description || undefined,
    facade_elevation_type: variables?.facilityData?.facade_elevation_type,
    security_contact: variables?.facilityData?.security_contact,
    number_of_staircases: Number(variables?.facilityData?.number_of_staircases ?? 0),
    number_of_elevators: Number(variables?.facilityData?.number_of_elevators ?? 0),
    number_of_escalators: Number(variables?.facilityData?.number_of_escalators ?? 0),
    number_of_floors: variables?.facilityData?.number_of_floors
      ? Number(variables.facilityData.number_of_floors)
      : null,
    construction_costs: variables?.facilityData?.construction_costs
      ? Number(variables.facilityData.construction_costs)
      : null,
    consultant_costs: variables?.facilityData?.consultant_costs
      ? Number(variables.facilityData.consultant_costs)
      : null,
    asset_value: variables?.facilityData?.asset_value ? Number(variables.facilityData.asset_value) : null,
    year_of_construction: variables?.facilityData?.year_of_construction
      ? Number(variables.facilityData.year_of_construction)
      : null,
    building_life_cycle_years: variables?.facilityData?.building_life_cycle_years
      ? Number(variables.facilityData.building_life_cycle_years)
      : null,
    residual_asset_value: variables?.facilityData?.residual_asset_value
      ? Number(variables.facilityData.residual_asset_value)
      : null,
    depreciated_asset_value: variables?.facilityData?.depreciated_asset_value
      ? Number(variables.facilityData.depreciated_asset_value)
      : null,
    maintenance_cost: variables?.facilityData?.maintenance_cost
      ? Number(variables.facilityData.maintenance_cost)
      : null,
    number_of_parking_floors: variables?.facilityData?.number_of_parking_floors
      ? Number(variables.facilityData.number_of_parking_floors)
      : null,
    number_of_parkings: variables?.facilityData?.number_of_parkings
      ? Number(variables.facilityData.number_of_parkings)
      : null,
    total_built_up_area: variables?.facilityData?.total_built_up_area
      ? Number(variables.facilityData.total_built_up_area)
      : null,
    gross_floor_area: variables?.facilityData?.gross_floor_area
      ? Number(variables.facilityData.gross_floor_area)
      : null,
    gross_leasable_area: variables?.facilityData?.gross_leasable_area
      ? Number(variables.facilityData.gross_leasable_area)
      : null,
    sitemap_path: variables?.facilityData?.sitemap_path || null,
    zone: variables?.facilityData?.zone || null,
    sector: variables?.facilityData?.sector || null,
    plot_number: variables?.facilityData?.plot_number || null,
    facility_address: variables?.facilityData?.facility_address || null,
    property_owned_by: variables?.facilityData?.property_owned_by || null,
    owner_type_id: variables?.facilityData?.owner_type_id || null,
    facility_type_id: variables?.facilityData?.facility_type_id || null,
    cost_center_id: variables?.facilityData?.cost_center_id || null,
    latitude: variables?.facilityData?.latitude ? Number(variables.facilityData.latitude) : null,
    longitude: variables?.facilityData?.longitude ? Number(variables.facilityData.longitude) : null,
    is_active: variables?.facilityData?.status !== undefined ? variables.facilityData.status : true
  }

  let url = `/facilities/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return { data: { updateFacility: formatFacility(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to update Facility' } }
}

export async function deleteFacility(variables: any, path?: string) {
  const id = variables?.id
  const b_id = variables?.b_id

  let url = `/facilities/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return { data: { deleteFacility: { id } } }
  }

  return { errors: res?.errors || { message: 'Failed to delete Facility' } }
}
