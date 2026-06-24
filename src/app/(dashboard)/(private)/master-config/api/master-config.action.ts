'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

// Mappers to standardize output to frontend expected fields
function formatCostCenter(item: any) {
  if (!item) return null

  return {
    id: item._id,
    name: item.name,
    code: item.code,
    status: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

function formatUserType(item: any) {
  if (!item) return null

  return {
    id: item._id,
    key: item.key,
    name: item.name,
    description: item.desc || '',
    status: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

function formatOwnerType(item: any) {
  if (!item) return null

  return {
    id: item._id,
    name: item.name,
    status: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

function formatFacilityType(item: any) {
  if (!item) return null

  return {
    id: item._id,
    key: item.key,
    name: item.name,
    description: item.desc || '',
    status: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

function formatAssetStatus(item: any) {
  if (!item) return null

  return {
    id: item._id,
    b_id: item.b_id?._id || item.b_id,
    key: item.key,
    name: item.name,
    description: item.desc || '',
    status: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

// ----------------------------------------------------
// COST CENTERS ACTIONS
// ----------------------------------------------------
export async function getAllCostCenters(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''

  let url = `/cost-centers?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatCostCenter(item))

    return {
      data: {
        costCenters: {
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
      costCenters: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch Cost Centers' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch Cost Centers' }
  }
}

export async function createCostCenter(variables: any, path?: string) {
  const body = {
    b_id: variables?.configData?.b_id,
    name: variables?.configData?.name,
    code: variables?.configData?.code,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  const res = await postServerRequest('/cost-centers', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return { data: { createCostCenter: formatCostCenter(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to create Cost Center' } }
}

export async function updateCostCenter(variables: any, path?: string) {
  const id = variables?.configData?.id
  const b_id = variables?.configData?.b_id

  const body = {
    name: variables?.configData?.name,
    code: variables?.configData?.code,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  let url = `/cost-centers/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return { data: { updateCostCenter: formatCostCenter(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to update Cost Center' } }
}

export async function deleteCostCenter(variables: any, path?: string) {
  const id = variables?.id
  const b_id = variables?.b_id

  let url = `/cost-centers/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return { data: { deleteCostCenter: { id } } }
  }

  return { errors: res?.errors || { message: 'Failed to delete Cost Center' } }
}

// ----------------------------------------------------
// USER TYPES ACTIONS
// ----------------------------------------------------
export async function getAllUserTypes(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''

  let url = `/user-types?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatUserType(item))

    return {
      data: {
        userTypes: {
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
      userTypes: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch User Types' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch User Types' }
  }
}

export async function createUserType(variables: any, path?: string) {
  const body = {
    b_id: variables?.configData?.b_id,
    key: variables?.configData?.key,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  const res = await postServerRequest('/user-types', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return { data: { createUserType: formatUserType(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to create User Type' } }
}

export async function updateUserType(variables: any, path?: string) {
  const id = variables?.configData?.id
  const b_id = variables?.configData?.b_id

  const body = {
    key: variables?.configData?.key,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  let url = `/user-types/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return { data: { updateUserType: formatUserType(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to update User Type' } }
}

export async function deleteUserType(variables: any, path?: string) {
  const id = variables?.id
  const b_id = variables?.b_id

  let url = `/user-types/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return { data: { deleteUserType: { id } } }
  }

  return { errors: res?.errors || { message: 'Failed to delete User Type' } }
}

// ----------------------------------------------------
// OWNER TYPES ACTIONS
// ----------------------------------------------------
export async function getAllOwnerTypes(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''

  let url = `/owner-types?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatOwnerType(item))

    return {
      data: {
        ownerTypes: {
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
      ownerTypes: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch Owner Types' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch Owner Types' }
  }
}

export async function createOwnerType(variables: any, path?: string) {
  const body = {
    b_id: variables?.configData?.b_id,
    name: variables?.configData?.name,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  const res = await postServerRequest('/owner-types', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return { data: { createOwnerType: formatOwnerType(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to create Owner Type' } }
}

export async function updateOwnerType(variables: any, path?: string) {
  const id = variables?.configData?.id
  const b_id = variables?.configData?.b_id

  const body = {
    name: variables?.configData?.name,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  let url = `/owner-types/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return { data: { updateOwnerType: formatOwnerType(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to update Owner Type' } }
}

export async function deleteOwnerType(variables: any, path?: string) {
  const id = variables?.id
  const b_id = variables?.b_id

  let url = `/owner-types/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return { data: { deleteOwnerType: { id } } }
  }

  return { errors: res?.errors || { message: 'Failed to delete Owner Type' } }
}

// ----------------------------------------------------
// FACILITY TYPES ACTIONS
// ----------------------------------------------------
export async function getAllFacilityTypes(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''

  let url = `/facility-types?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatFacilityType(item))

    return {
      data: {
        facilityTypes: {
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
      facilityTypes: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch Facility Types' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch Facility Types' }
  }
}

export async function createFacilityType(variables: any, path?: string) {
  const body = {
    b_id: variables?.configData?.b_id,
    key: variables?.configData?.key,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  const res = await postServerRequest('/facility-types', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return { data: { createFacilityType: formatFacilityType(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to create Facility Type' } }
}

export async function updateFacilityType(variables: any, path?: string) {
  const id = variables?.configData?.id
  const b_id = variables?.configData?.b_id

  const body = {
    key: variables?.configData?.key,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  let url = `/facility-types/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return { data: { updateFacilityType: formatFacilityType(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to update Facility Type' } }
}

export async function deleteFacilityType(variables: any, path?: string) {
  const id = variables?.id
  const b_id = variables?.b_id

  let url = `/facility-types/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return { data: { deleteFacilityType: { id } } }
  }

  return { errors: res?.errors || { message: 'Failed to delete Facility Type' } }
}

// ----------------------------------------------------
// ASSET STATUSES ACTIONS (Requires b_id)
// ----------------------------------------------------
export async function getAllAssetStatuses(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''

  let url = `/asset-statuses?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatAssetStatus(item))

    return {
      data: {
        assetStatuses: {
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
      assetStatuses: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch Asset Statuses' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch Asset Statuses' }
  }
}

export async function createAssetStatus(variables: any, path?: string) {
  const body = {
    b_id: variables?.configData?.b_id,
    key: variables?.configData?.key,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  const res = await postServerRequest('/asset-statuses', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return { data: { createAssetStatus: formatAssetStatus(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to create Asset Status' } }
}

export async function updateAssetStatus(variables: any, path?: string) {
  const id = variables?.configData?.id

  const body = {
    key: variables?.configData?.key,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  const res = await postServerRequest(`/asset-statuses/${id}`, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return { data: { updateAssetStatus: formatAssetStatus(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to update Asset Status' } }
}

export async function deleteAssetStatus(variables: any, path?: string) {
  const id = variables?.id
  const b_id = variables?.b_id

  let url = `/asset-statuses/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return { data: { deleteAssetStatus: { id } } }
  }

  return { errors: res?.errors || { message: 'Failed to delete Asset Status' } }
}

// ----------------------------------------------------
// DEPARTMENTS ACTIONS
// ----------------------------------------------------
function formatDepartment(item: any) {
  if (!item) return null

  return {
    id: item._id,
    b_id: item.b_id?._id || item.b_id,
    client_id: item.client_id?._id || item.client_id || null,
    name: item.name,
    description: item.desc || '',
    status: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

export async function getAllDepartments(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const client_id = variables?.client_id || ''

  let url = `/departments?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  if (client_id) {
    url += `&client_id=${encodeURIComponent(client_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatDepartment(item))

    return {
      data: {
        departments: {
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
      departments: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch Departments' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch Departments' }
  }
}

export async function createDepartment(variables: any, path?: string) {
  const body = {
    b_id: variables?.configData?.b_id,
    client_id: variables?.configData?.client_id || null,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  const res = await postServerRequest('/departments', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return { data: { createDepartment: formatDepartment(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to create Department' } }
}

export async function updateDepartment(variables: any, path?: string) {
  const id = variables?.configData?.id
  const b_id = variables?.configData?.b_id

  const body = {
    client_id: variables?.configData?.client_id || null,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  let url = `/departments/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return { data: { updateDepartment: formatDepartment(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to update Department' } }
}

export async function deleteDepartment(variables: any, path?: string) {
  const id = variables?.id
  const b_id = variables?.b_id

  let url = `/departments/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return { data: { deleteDepartment: { id } } }
  }

  return { errors: res?.errors || { message: 'Failed to delete Department' } }
}

// ----------------------------------------------------
// DESIGNATIONS ACTIONS
// ----------------------------------------------------
function formatDesignation(item: any) {
  if (!item) return null

  return {
    id: item._id,
    b_id: item.b_id?._id || item.b_id,
    dep_id: item.dep_id?._id || item.dep_id || null,
    name: item.name,
    description: item.desc || '',
    status: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

export async function getAllDesignations(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const dep_id = variables?.dep_id || ''

  let url = `/designations?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  if (dep_id) {
    url += `&dep_id=${encodeURIComponent(dep_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatDesignation(item))

    return {
      data: {
        designations: {
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
      designations: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch Designations' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch Designations' }
  }
}

export async function createDesignation(variables: any, path?: string) {
  const body = {
    b_id: variables?.configData?.b_id,
    dep_id: variables?.configData?.dep_id || null,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  const res = await postServerRequest('/designations', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return { data: { createDesignation: formatDesignation(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to create Designation' } }
}

export async function updateDesignation(variables: any, path?: string) {
  const id = variables?.configData?.id
  const b_id = variables?.configData?.b_id

  const body = {
    dep_id: variables?.configData?.dep_id || null,
    name: variables?.configData?.name,
    desc: variables?.configData?.description,
    is_active: variables?.configData?.status !== undefined ? variables.configData.status : true
  }

  let url = `/designations/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return { data: { updateDesignation: formatDesignation(res.data) } }
  }

  return { errors: res?.errors || { message: 'Failed to update Designation' } }
}

export async function deleteDesignation(variables: any, path?: string) {
  const id = variables?.id
  const b_id = variables?.b_id

  let url = `/designations/${id}`

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await postServerRequest(url, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return { data: { deleteDesignation: { id } } }
  }

  return { errors: res?.errors || { message: 'Failed to delete Designation' } }
}
