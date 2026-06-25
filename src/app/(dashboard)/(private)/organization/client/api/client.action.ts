'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatClient(c: any) {
  if (!c) return null

  return {
    id: c._id,
    b_id: c.b_id?._id || c.b_id,
    name: c.name,
    code: c.code || '',
    contact_person: c.contact_person || '',
    email: c.email || '',
    phone: c.phone || '',
    address: c.address || '',
    vat_trn_no: c.vat_trn_no || '',
    trade_licence_no: c.trade_licence_no || '',
    description: c.desc || '',
    status: c.is_active,
    approval_status: c.approval_status || 'approved',
    approval_steps: c.approval_steps || [],
    current_approval_step: c.current_approval_step || 1,
    created_at: c.created_at,
    updated_at: c.updated_at
  }
}

export async function getAllClients(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const approval_status = variables?.approval_status || ''

  let url = `/clients?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  if (approval_status) {
    url += `&approval_status=${encodeURIComponent(approval_status)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((c: any) => formatClient(c))

    return {
      data: {
        clients: {
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
      clients: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch clients' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch clients' }
  }
}

export async function getPendingClients(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''

  let url = `/clients/pending?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((c: any) => formatClient(c))

    return {
      data: {
        clients: {
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
      clients: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch pending clients' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch pending clients' }
  }
}

export async function approveClient(id: string, path?: string) {
  const res = await postServerRequest(`/clients/${id}/approve`, {
    method: 'POST',
    body: {},
    path
  })

  if (res?.data) {
    return {
      data: {
        approveClient: formatClient(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to approve client' }
  }
}

export async function rejectClient(id: string, reason?: string, path?: string) {
  const res = await postServerRequest(`/clients/${id}/reject`, {
    method: 'POST',
    body: { reason },
    path
  })

  if (res?.data) {
    return {
      data: {
        rejectClient: formatClient(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to reject client' }
  }
}

export async function createClient(
  variables: any,
  path?: string
): Promise<{ data?: { createClient?: any }; errors?: any }> {
  const body = {
    b_id: variables?.clientData?.b_id,
    name: variables?.clientData?.name,
    code: variables?.clientData?.code || null,
    contact_person: variables?.clientData?.contact_person || null,
    email: variables?.clientData?.email || null,
    phone: variables?.clientData?.phone || null,
    address: variables?.clientData?.address || null,
    vat_trn_no: variables?.clientData?.vat_trn_no || null,
    trade_licence_no: variables?.clientData?.trade_licence_no || null,
    desc: variables?.clientData?.description || null,
    is_active: variables?.clientData?.status !== undefined ? variables.clientData.status : true
  }

  const res = await postServerRequest('/clients', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        createClient: formatClient(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create client' }
  }
}

export async function updateClient(
  variables: any,
  path?: string
): Promise<{ data?: { updateClient?: any }; errors?: any }> {
  const id = variables?.clientData?.id

  const body = {
    name: variables?.clientData?.name,
    code: variables?.clientData?.code || null,
    contact_person: variables?.clientData?.contact_person || null,
    email: variables?.clientData?.email || null,
    phone: variables?.clientData?.phone || null,
    address: variables?.clientData?.address || null,
    vat_trn_no: variables?.clientData?.vat_trn_no || null,
    trade_licence_no: variables?.clientData?.trade_licence_no || null,
    desc: variables?.clientData?.description || null,
    is_active: variables?.clientData?.status !== undefined ? variables.clientData.status : true
  }

  const res = await postServerRequest(`/clients/${id}`, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        updateClient: formatClient(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update client' }
  }
}

export async function updateClientStatus(
  id: string,
  status: boolean,
  path?: string
): Promise<{ data?: { updateClientStatus?: any }; errors?: any }> {
  const res = await postServerRequest(`/clients/${id}/status`, {
    method: 'PATCH',
    body: { is_active: status },
    path
  })

  if (res?.data) {
    return {
      data: {
        updateClientStatus: formatClient(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update client status' }
  }
}

export async function deleteClient(variables: any, path?: string) {
  const id = variables?.id

  const res = await postServerRequest(`/clients/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteClient: {
          id
        }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete client' }
  }
}
