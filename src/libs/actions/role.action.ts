'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatRole(role: any) {
  if (!role) return null

  return {
    id: role._id,
    name: role.name,
    description: role.description,
    status: role.is_active,
    created_at: role.created_at,
    role_permissions:
      role.role_permissions ||
      role.permissions?.map((p: any) => ({
        permission_id: p.permission_id,
        permission: {
          id: p.permission_id,
          name: p.permission_name
        }
      })) ||
      []
  }
}

export async function getAllRoles(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1

  const res = await getRequest(`/roles?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`)

  if (res?.data) {
    const mapped = Array.isArray(res.data) ? res.data.map((r: any) => formatRole(r)) : []

    return {
      data: {
        roles: {
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
      roles: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch roles' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch roles' }
  }
}

export async function createRole(
  variables: any,
  path?: string
): Promise<{ data?: { createRole?: any; updateRole?: any }; errors?: any }> {
  const body = {
    name: variables?.roleData?.name,
    description: variables?.roleData?.description,
    is_active: variables?.roleData?.status,
    permission_ids: variables?.rolePermissions?.map((rp: any) => rp.permission_id) || []
  }

  const res = await postServerRequest('/roles', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        createRole: formatRole(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create role' }
  }
}

export async function updateRole(
  variables: any,
  path?: string
): Promise<{ data?: { createRole?: any; updateRole?: any }; errors?: any }> {
  const id = variables?.roleData?.id

  const body: any = {
    is_active: variables?.roleData?.status
  }

  if (variables?.roleData?.name !== undefined) {
    body.name = variables?.roleData?.name
  }

  if (variables?.roleData?.description !== undefined) {
    body.description = variables?.roleData?.description
  }

  if (variables?.rolePermissions !== undefined) {
    body.permission_ids = variables?.rolePermissions?.map((rp: any) => rp.permission_id) || []
  }

  const res = await postServerRequest(`/roles/${id}`, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        updateRole: formatRole(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update role' }
  }
}

export async function deleteRole(variables: any, path?: string) {
  const id = variables?.deleteRoleId

  const res = await postServerRequest(`/roles/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteRole: {
          id
        }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete role' }
  }
}

export async function getSingleRole(id: string) {
  const res = await getRequest(`/roles/${id}`)

  if (res?.data) {
    return {
      data: formatRole(res.data)
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to fetch role' }
  }
}
