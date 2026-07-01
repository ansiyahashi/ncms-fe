'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatWorkOrder(wo: any) {
  if (!wo) return null

  return {
    id: wo._id,
    b_id: wo.b_id,
    wo_number: wo.wo_number,
    sr_id: wo.sr_id || '',
    type: wo.type,
    facility_id: wo.facility_id,
    facility_name: wo.facility_name || '',
    space_id: wo.space_id || '',
    asset_id: wo.asset_id || '',
    title: wo.title,
    description: wo.description,
    priority: wo.priority,
    status: wo.status,
    technician_id: wo.technician_id || '',
    technician_name: wo.technician_name || '',
    assigned_at: wo.assigned_at || null,
    checklist: wo.checklist || [],
    labour_cost: wo.labour_cost || 0,
    sla_duration_hours: wo.sla_duration_hours || 24,
    sla_due_time: wo.sla_due_time,
    completed_at: wo.completed_at || null,
    closed_at: wo.closed_at || null,
    closure_remarks: wo.closure_remarks || '',
    feedback_rating: wo.feedback_rating || null,
    feedback_remarks: wo.feedback_remarks || '',
    history: wo.history || [],
    is_active: wo.is_active,
    created_at: wo.created_at,
    updated_at: wo.updated_at
  }
}

export async function getAllWorkOrders(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const status = variables?.status || ''
  const priority = variables?.priority || ''
  const type = variables?.type || ''
  const facility_id = variables?.facility_id || ''
  const technician_id = variables?.technician_id || ''

  let url = `/work-orders?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  if (status) {
    url += `&status=${encodeURIComponent(status)}`
  }

  if (priority) {
    url += `&priority=${encodeURIComponent(priority)}`
  }

  if (type) {
    url += `&type=${encodeURIComponent(type)}`
  }

  if (facility_id) {
    url += `&facility_id=${encodeURIComponent(facility_id)}`
  }

  if (technician_id) {
    url += `&technician_id=${encodeURIComponent(technician_id)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((wo: any) => formatWorkOrder(wo))

    return {
      data: {
        workOrders: {
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
      workOrders: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch work orders' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch work orders' }
  }
}

export async function getWorkOrderById(id: string) {
  const res = await getRequest(`/work-orders/${id}`)

  if (res?.data) {
    return {
      data: {
        workOrder: formatWorkOrder(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to fetch work order details' }
  }
}

export async function createWorkOrder(variables: any, path?: string) {
  const body = {
    sr_id: variables?.sr_id || null,
    type: variables?.type,
    facility_id: variables?.facility_id,
    space_id: variables?.space_id || null,
    asset_id: variables?.asset_id || null,
    title: variables?.title,
    description: variables?.description,
    priority: variables?.priority,
    checklist: variables?.checklist || []
  }

  const res = await postServerRequest('/work-orders', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        createWorkOrder: formatWorkOrder(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create work order' }
  }
}

export async function assignWorkOrder(id: string, variables: any, path?: string) {
  const body = {
    technician_id: variables?.technician_id,
    remarks: variables?.remarks || ''
  }

  const res = await postServerRequest(`/work-orders/${id}/assign`, {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        assignWorkOrder: formatWorkOrder(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to assign work order' }
  }
}

export async function updateWorkOrderWorkflow(id: string, variables: any, path?: string) {
  const body = {
    action: variables?.action, // accept, reject, start, pause, complete
    checklist: variables?.checklist || undefined,
    labour_cost: variables?.labour_cost !== undefined ? variables.labour_cost : undefined,
    remarks: variables?.remarks || ''
  }

  const res = await postServerRequest(`/work-orders/${id}/workflow`, {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        updateWorkOrderWorkflow: formatWorkOrder(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update work order workflow' }
  }
}

export async function reviewWorkOrder(id: string, variables: any, path?: string) {
  const body = {
    action: variables?.action, // approve, reject, return
    remarks: variables?.remarks || ''
  }

  const res = await postServerRequest(`/work-orders/${id}/review`, {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        reviewWorkOrder: formatWorkOrder(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to review work order' }
  }
}

export async function closeWorkOrder(id: string, variables: any, path?: string) {
  const body = {
    feedback_rating: variables?.feedback_rating || null,
    feedback_remarks: variables?.feedback_remarks || '',
    closure_remarks: variables?.closure_remarks || ''
  }

  const res = await postServerRequest(`/work-orders/${id}/close`, {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        closeWorkOrder: formatWorkOrder(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to close work order' }
  }
}

export async function deleteWorkOrder(id: string, path?: string) {
  const res = await postServerRequest(`/work-orders/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteWorkOrder: { id }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete work order' }
  }
}
