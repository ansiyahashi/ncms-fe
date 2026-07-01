'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatServiceRequest(sr: any) {
  if (!sr) return null

  return {
    id: sr._id,
    b_id: sr.b_id,
    complaint_id: sr.complaint_id || '',
    facility_id: sr.facility_id,
    facility_name: sr.facility_name || '',
    space_id: sr.space_id || '',
    asset_id: sr.asset_id || '',
    title: sr.title,
    description: sr.description,
    priority: sr.priority,
    status: sr.status,
    assigned_dep_id: sr.assigned_dep_id || '',
    assigned_tech_id: sr.assigned_tech_id || '',
    technician_name: sr.technician_name || '',
    raised_by: sr.raised_by,
    reporter: sr.reporter || '',
    escalation_level: sr.escalation_level || 0,
    escalation_history: sr.escalation_history || [],
    is_active: sr.is_active,
    created_at: sr.created_at,
    updated_at: sr.updated_at
  }
}

export async function getAllServiceRequests(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const status = variables?.status || ''
  const priority = variables?.priority || ''
  const facility_id = variables?.facility_id || ''

  let url = `/service-requests?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  if (status) {
    url += `&status=${encodeURIComponent(status)}`
  }

  if (priority) {
    url += `&priority=${encodeURIComponent(priority)}`
  }

  if (facility_id) {
    url += `&facility_id=${encodeURIComponent(facility_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((sr: any) => formatServiceRequest(sr))

    return {
      data: {
        serviceRequests: {
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
      serviceRequests: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch service requests' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch service requests' }
  }
}

export async function getServiceRequestById(id: string) {
  const res = await getRequest(`/service-requests/${id}`)

  if (res?.data) {
    return {
      data: {
        serviceRequest: formatServiceRequest(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to fetch service request details' }
  }
}

export async function createServiceRequest(variables: any, path?: string) {
  const body = {
    complaint_id: variables?.complaint_id || null,
    facility_id: variables?.facility_id,
    space_id: variables?.space_id || null,
    asset_id: variables?.asset_id || null,
    title: variables?.title,
    description: variables?.description,
    priority: variables?.priority || 'medium'
  }

  const res = await postServerRequest('/service-requests', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        createServiceRequest: formatServiceRequest(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create service request' }
  }
}

export async function assignServiceRequest(id: string, variables: any, path?: string) {
  const body = {
    assigned_dep_id: variables?.assigned_dep_id || null,
    assigned_tech_id: variables?.assigned_tech_id || null
  }

  const res = await postServerRequest(`/service-requests/${id}/assign`, {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        assignServiceRequest: formatServiceRequest(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to assign service request' }
  }
}

export async function escalateServiceRequest(id: string, remarks: string, path?: string) {
  const res = await postServerRequest(`/service-requests/${id}/escalate`, {
    method: 'POST',
    body: { remarks },
    path
  })

  if (res?.data) {
    return {
      data: {
        escalateServiceRequest: formatServiceRequest(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to escalate service request' }
  }
}

export async function deleteServiceRequest(id: string, path?: string) {
  const res = await postServerRequest(`/service-requests/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteServiceRequest: { id }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete service request' }
  }
}
