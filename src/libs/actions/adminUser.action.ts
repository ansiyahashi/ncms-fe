'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatUser(user: any) {
  if (!user) return null

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role_id: user.role_id?._id || user.role_id,
    role: user.role_id
      ? {
          id: user.role_id._id || user.role_id,
          name: user.role_id.name || ''
        }
      : null,
    status: user.is_active,
    approval_status: user.approval_status || 'approved',
    user_type_id: user.user_type_id?._id || user.user_type_id,
    dep_id: user.dep_id?._id || user.dep_id,
    des_id: user.des_id?._id || user.des_id,
    is_admin: user.is_admin || false,
    branches: user.branches || [],
    locations: user.locations || []
  }
}

export async function getAllAdminUsers(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1

  const res = await getRequest(`/users?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`)

  if (res?.data) {
    const mapped = Array.isArray(res.data) ? res.data.map((u: any) => formatUser(u)) : []

    return {
      data: {
        users: {
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
      users: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch users' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch users' }
  }
}

export async function createAdmin(
  variables: any,
  path?: string
): Promise<{ data?: { createAdmin?: any; updateAdmin?: any }; errors?: any }> {
  const payload = {
    name: variables?.adminData?.name,
    email: variables?.adminData?.email,
    role_id: variables?.adminData?.role_id,
    password: variables?.adminData?.password,
    is_admin: true,
    auto_approve: true
  }

  const res = await postServerRequest('/users', {
    method: 'POST',
    body: payload,
    path
  })

  if (res?.data) {
    return {
      data: {
        createAdmin: formatUser(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create user' }
  }
}

export async function updateAdmin(
  variables: any,
  path?: string
): Promise<{ data?: { createAdmin?: any; updateAdmin?: any }; errors?: any }> {
  const id = variables?.adminData?.id

  const payload = {
    name: variables?.adminData?.name,
    email: variables?.adminData?.email,
    role_id: variables?.adminData?.role_id
  }

  const res = await postServerRequest(`/users/${id}`, {
    method: 'PUT',
    body: payload,
    path
  })

  if (res?.data) {
    return {
      data: {
        updateAdmin: formatUser(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update user' }
  }
}

export async function deleteAdminUser(variables: any, path?: string) {
  const id = variables?.id

  const res = await postServerRequest(`/users/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteAdminUser: {
          id
        }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete user' }
  }
}

export async function updateAdminPassword(id: string, password: string, path?: string) {
  const res = await postServerRequest(`/users/${id}/password`, {
    method: 'PUT',
    body: { password },
    path
  })

  if (res?.data) {
    return {
      data: {
        updateAdminPassword: formatUser(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update password' }
  }
}
