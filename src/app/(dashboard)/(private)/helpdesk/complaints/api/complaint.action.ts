'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatComplaint(c: any) {
  if (!c) return null

  return {
    id: c._id,
    b_id: c.b_id,
    raised_by: c.raised_by,
    reporter: c.reporter || '',
    facility_id: c.facility_id,
    facility_name: c.facility_name || '',
    space_id: c.space_id || '',
    title: c.title,
    description: c.description,
    status: c.status,
    history: c.history || [],
    is_active: c.is_active,
    created_at: c.created_at,
    updated_at: c.updated_at
  }
}

export async function getAllComplaints(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const status = variables?.status || ''
  const facility_id = variables?.facility_id || ''

  let url = `/complaints?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  if (status) {
    url += `&status=${encodeURIComponent(status)}`
  }

  if (facility_id) {
    url += `&facility_id=${encodeURIComponent(facility_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((c: any) => formatComplaint(c))

    return {
      data: {
        complaints: {
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
      complaints: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch complaints' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch complaints' }
  }
}

export async function getComplaintById(id: string) {
  const res = await getRequest(`/complaints/${id}`)

  if (res?.data) {
    return {
      data: {
        complaint: formatComplaint(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to fetch complaint details' }
  }
}

export async function createComplaint(variables: any, path?: string) {
  const body = {
    facility_id: variables?.facility_id,
    space_id: variables?.space_id || null,
    title: variables?.title,
    description: variables?.description
  }

  const res = await postServerRequest('/complaints', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        createComplaint: formatComplaint(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create complaint' }
  }
}

export async function updateComplaint(variables: any, path?: string) {
  const id = variables?.id
  const body = {
    title: variables?.title,
    description: variables?.description,
    space_id: variables?.space_id || null
  }

  const res = await postServerRequest(`/complaints/${id}`, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        updateComplaint: formatComplaint(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update complaint' }
  }
}

export async function cancelComplaint(id: string, remarks: string, path?: string) {
  const res = await postServerRequest(`/complaints/${id}/cancel`, {
    method: 'POST',
    body: { remarks },
    path
  })

  if (res?.data) {
    return {
      data: {
        cancelComplaint: formatComplaint(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to cancel complaint' }
  }
}

export async function deleteComplaint(id: string, path?: string) {
  const res = await postServerRequest(`/complaints/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteComplaint: { id }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete complaint' }
  }
}
