'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatWorkflow(w: any) {
  if (!w) return null

  return {
    id: w._id,
    b_id: w.b_id?._id || w.b_id,
    name: w.name,
    entity_type: w.entity_type,
    description: w.description || '',
    steps: w.steps || [],
    status: w.is_active,
    created_at: w.created_at,
    updated_at: w.updated_at
  }
}

export async function getAllWorkflows(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const entity_type = variables?.entity_type || ''

  let url = `/approvals/workflows?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}&paginate=true`

  if (b_id) {
    url += `&b_id=${encodeURIComponent(b_id)}`
  }

  if (entity_type) {
    url += `&entity_type=${encodeURIComponent(entity_type)}`
  }

  const res = await getRequest(url)

  if (res?.data) {
    const rawData = Array.isArray(res.data) ? res.data : (res.data as any)?.data || []
    const mapped = rawData.map((w: any) => formatWorkflow(w))

    return {
      data: {
        workflows: {
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
      workflows: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch workflows' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch workflows' }
  }
}

export async function getSingleWorkflow(id: string) {
  const res = await getRequest(`/approvals/workflows/${id}`)

  if (res?.data) {
    return {
      data: formatWorkflow(res.data)
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to fetch workflow' }
  }
}

export async function createWorkflow(
  variables: any,
  path?: string
): Promise<{ data?: { createWorkflow?: any }; errors?: any }> {
  const body = {
    b_id: variables?.workflowData?.b_id,
    name: variables?.workflowData?.name,
    entity_type: variables?.workflowData?.entity_type,
    description: variables?.workflowData?.description || '',
    is_active: variables?.workflowData?.status !== undefined ? variables.workflowData.status : true,
    steps:
      variables?.steps?.map((step: any, idx: number) => ({
        sort_order: idx + 1,
        approver_type: step.approver_type,
        approver_id: step.approver_type === 'manager' ? null : step.approver_id || null,
        label: step.label || ''
      })) || []
  }

  const res = await postServerRequest('/approvals/workflows', {
    method: 'POST',
    body,
    path
  })

  console.log('ressssss', res)

  if (res?.data) {
    return {
      data: {
        createWorkflow: formatWorkflow(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create workflow' }
  }
}

export async function updateWorkflow(
  variables: any,
  path?: string
): Promise<{ data?: { updateWorkflow?: any }; errors?: any }> {
  const id = variables?.workflowData?.id

  const body = {
    b_id: variables?.workflowData?.b_id,
    name: variables?.workflowData?.name,
    entity_type: variables?.workflowData?.entity_type,
    description: variables?.workflowData?.description || '',
    is_active: variables?.workflowData?.status !== undefined ? variables.workflowData.status : true,
    steps:
      variables?.steps?.map((step: any, idx: number) => ({
        sort_order: idx + 1,
        approver_type: step.approver_type,
        approver_id: step.approver_type === 'manager' ? null : step.approver_id || null,
        label: step.label || ''
      })) || []
  }

  const res = await postServerRequest(`/approvals/workflows/${id}`, {
    method: 'PUT',
    body,
    path
  })

  console.log('ressssss', res)

  if (res?.data) {
    return {
      data: {
        updateWorkflow: formatWorkflow(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update workflow' }
  }
}

export async function deleteWorkflow(variables: any, path?: string) {
  const id = variables?.id

  const res = await postServerRequest(`/approvals/workflows/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteWorkflow: {
          id
        }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete workflow' }
  }
}
