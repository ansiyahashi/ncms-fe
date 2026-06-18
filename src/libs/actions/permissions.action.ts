'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatPermission(p: any) {
  if (!p) return null

  return {
    id: p._id,
    name: p.desc || p.name,
    permission_code: p.name,
    description: p.desc || '',
    status: p.is_active,
    created_at: p.created_at,
    updated_at: p.updated_at
  }
}

export async function getAllPermissions(variables?: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 1000
  const page = variables?.page || 1

  const res = await getRequest(`/permissions?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`)

  if (res?.data) {
    const mapped = Array.isArray(res.data) ? res.data.map((p: any) => formatPermission(p)) : []

    return {
      data: {
        permissions: {
          data: mapped,
          totalData: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 0,
          currentPage: (res.pagination?.page || 1) - 1
        }
      }
    }
  }

  return {
    data: {
      permissions: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch permissions' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch permissions' }
  }
}

export async function createPermission(
  variables: any,
  path?: string
): Promise<{ data?: { createPermission?: any; updatePermission?: any }; errors?: any }> {
  const payload = {
    name: variables?.permissionData?.permission_code,
    desc: variables?.permissionData?.name,
    is_active: variables?.permissionData?.status
  }

  const res = await postServerRequest('/permissions', {
    method: 'POST',
    body: payload,
    path
  })

  if (res?.data) {
    return {
      data: {
        createPermission: formatPermission(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create permission' }
  }
}

export async function updatePermission(
  variables: any,
  path?: string
): Promise<{ data?: { createPermission?: any; updatePermission?: any }; errors?: any }> {
  const id = variables?.permissionData?.id

  const payload = {
    name: variables?.permissionData?.permission_code,
    desc: variables?.permissionData?.name,
    is_active: variables?.permissionData?.status
  }

  const res = await postServerRequest(`/permissions/${id}`, {
    method: 'PUT',
    body: payload,
    path
  })

  if (res?.data) {
    return {
      data: {
        updatePermission: formatPermission(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update permission' }
  }
}

export async function deletePermission(variables: any, path?: string) {
  const id = variables?.deletePermissionId

  const res = await postServerRequest(`/permissions/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deletePermission: {
          id
        }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete permission' }
  }
}
