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
    b_id: user.b_id?._id || user.b_id,
    branches: user.branches || [],
    locations: user.locations || [],
    approval_steps: user.approval_steps || [],
    current_approval_step: user.current_approval_step || 1
  }
}

export async function getAllUsers(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''
  const role_id = variables?.role_id || ''

  let url = `/users?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`

  if (b_id) url += `&b_id=${encodeURIComponent(b_id)}`
  if (role_id) url += `&role_id=${encodeURIComponent(role_id)}`

  const res = await getRequest(url)

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

export async function createUser(
  variables: any,
  path?: string
): Promise<{ data?: { createUser?: any; updateUser?: any }; errors?: any }> {
  const payload: any = {
    name: variables?.userData?.name,
    email: variables?.userData?.email,
    role_id: variables?.userData?.role_id,
    password: variables?.userData?.password,
    is_admin: variables?.userData?.is_admin || false,
    auto_approve: false
  }

  if (variables?.userData?.b_id) {
    payload.b_id = variables?.userData?.b_id
  }

  if (variables?.userData?.dep_id !== undefined) {
    payload.dep_id = variables?.userData?.dep_id || null
  }

  if (variables?.userData?.des_id !== undefined) {
    payload.des_id = variables?.userData?.des_id || null
  }

  const res = await postServerRequest('/users', {
    method: 'POST',
    body: payload,
    path
  })

  if (res?.data) {
    return {
      data: {
        createUser: formatUser(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create user' }
  }
}

export async function updateUser(
  variables: any,
  path?: string
): Promise<{ data?: { createUser?: any; updateUser?: any }; errors?: any }> {
  const id = variables?.userData?.id

  const payload: any = {}

  if (variables?.userData?.name !== undefined) payload.name = variables?.userData?.name
  if (variables?.userData?.email !== undefined) payload.email = variables?.userData?.email
  if (variables?.userData?.role_id !== undefined) payload.role_id = variables?.userData?.role_id
  if (variables?.userData?.is_admin !== undefined) payload.is_admin = variables?.userData?.is_admin
  if (variables?.userData?.status !== undefined) payload.is_active = variables?.userData?.status
  if (variables?.userData?.b_id !== undefined) payload.b_id = variables?.userData?.b_id
  if (variables?.userData?.dep_id !== undefined) payload.dep_id = variables?.userData?.dep_id || null
  if (variables?.userData?.des_id !== undefined) payload.des_id = variables?.userData?.des_id || null

  const res = await postServerRequest(`/users/${id}`, {
    method: 'PUT',
    body: payload,
    path
  })

  if (res?.data) {
    return {
      data: {
        updateUser: formatUser(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update user' }
  }
}

export async function deleteUser(variables: any, path?: string) {
  const id = variables?.id

  const res = await postServerRequest(`/users/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteUser: {
          id
        }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete user' }
  }
}

export async function updateUserPassword(id: string, password: string, path?: string) {
  const res = await postServerRequest(`/users/${id}/password`, {
    method: 'PUT',
    body: { password },
    path
  })

  if (res?.data) {
    return {
      data: {
        updateUserPassword: formatUser(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update password' }
  }
}

export async function getPendingUsers(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1
  const b_id = variables?.b_id || ''

  let url = `/users/pending?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`

  if (b_id) url += `&b_id=${encodeURIComponent(b_id)}`

  const res = await getRequest(url)

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
        errors: res?.errors || { message: 'Failed to fetch pending users' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch pending users' }
  }
}

export async function approveUser(id: string, path?: string) {
  const res = await postServerRequest(`/users/${id}/approve`, {
    method: 'POST',
    body: {},
    path
  })

  if (res?.data) {
    return {
      data: {
        approveUser: formatUser(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to approve user' }
  }
}

export async function rejectUser(id: string, reason?: string, path?: string) {
  const res = await postServerRequest(`/users/${id}/reject`, {
    method: 'POST',
    body: { reason },
    path
  })

  if (res?.data) {
    return {
      data: {
        rejectUser: formatUser(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to reject user' }
  }
}
