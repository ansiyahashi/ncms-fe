'use server'

import { getRequest } from '@/api'

function formatLookup(item: any) {
  if (!item) return null

  return {
    id: item._id,
    name: item.name || item.facility_name || '',
    code: item.code || item.building_code || item.unit_code || '',
    b_id: item.b_id?._id || item.b_id || '',
    dep_id: item.dep_id?._id || item.dep_id || '',
    client_id: item.client_id?._id || item.client_id || '',
    building_id: item.building_id?._id || item.building_id || '',
    floor_number: item.floor_number ?? '',
    key: item.key || ''
  }
}

async function getLookupData(endpoint: string, b_id?: string) {
  let url = endpoint

  if (b_id) {
    url += `?b_id=${encodeURIComponent(b_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((item: any) => formatLookup(item)).filter(Boolean)

    return {
      data: mapped,
      errors: undefined
    }
  }

  return {
    data: [],
    errors: res?.errors || { message: `Failed to fetch lookup data from ${endpoint}` }
  }
}

export async function getLookupRoles(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/roles', variables?.b_id)

  
return {
    data: {
      roles: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupDepartments(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/departments', variables?.b_id)

  
return {
    data: {
      departments: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupDesignations(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/designations', variables?.b_id)

  
return {
    data: {
      designations: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupLocations(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/locations', variables?.b_id)

  
return {
    data: {
      locations: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupUsers(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/users', variables?.b_id)

  
return {
    data: {
      users: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupUserTypes(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/user-types', variables?.b_id)

  
return {
    data: {
      userTypes: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupFacilityTypes(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/facility-types', variables?.b_id)

  
return {
    data: {
      facilityTypes: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupFacilities(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/facilities', variables?.b_id)

  
return {
    data: {
      facilities: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupBuildings(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/buildings', variables?.b_id)

  
return {
    data: {
      buildings: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupFloors(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/floors', variables?.b_id)

  
return {
    data: {
      floors: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupZones(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/zones', variables?.b_id)

  
return {
    data: {
      zones: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupUnits(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/units', variables?.b_id)

  
return {
    data: {
      units: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupOwnerTypes(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/owner-types', variables?.b_id)

  
return {
    data: {
      ownerTypes: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupCostCenters(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/cost-centers', variables?.b_id)

  
return {
    data: {
      costCenters: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupAssetCategories(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/asset-categories', variables?.b_id)

  
return {
    data: {
      assetCategories: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupAssetStatuses(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/asset-statuses', variables?.b_id)

  
return {
    data: {
      assetStatuses: {
        data: res.data
      }
    },
    errors: res.errors
  }
}

export async function getLookupClients(variables?: { b_id?: string }) {
  const res = await getLookupData('/lookups/clients', variables?.b_id)

  
return {
    data: {
      clients: {
        data: res.data
      }
    },
    errors: res.errors
  }
}
