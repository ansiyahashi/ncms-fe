'use server'

import { getRequest, postRequest } from '@/api'
import { postServerRequest } from '@/api/client'

export async function login(email: string, password: string) {
  const res = await postRequest('/auth/login', { email, password })

  if (res?.data) {
    const { token, user } = res.data as any

    const rolePermissions = user.permissions?.permissionName?.map((permCode: string) => ({
      permission_id: user.roleId,
      permission: {
        id: user.roleId,
        permission_code: permCode,
        name: permCode
      }
    })) || []

    const loginUser = {
      id: user._id,
      access_token: token,
      email: user.email,
      name: user.name,
      is_admin: user.isAdmin,
      is_super_admin: user.isSuperAdmin,
      status: user.status,
      roles: [
        {
          id: user.roleId,
          name: user.roleName,
          role_permissions: rolePermissions
        }
      ]
    }

    return {
      data: {
        loginUser
      }
    }
  }

  const errMessage = res?.errors?.message || 'Login failed. Please check your credentials.'

  return {
    errors: {
      message: errMessage,
      ...res?.errors
    }
  }
}

export async function logoutUser() {
  const res = await postServerRequest('/auth/logout', {
    method: 'POST'
  })

  if (res?.data) {
    return {
      data: {
        logout: true
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Logout failed on server' }
  }
}

export async function changePassword(variables: any) {
  const body = {
    currentPassword: variables?.currentPassword,
    newPassword: variables?.newPassword
  }

  const res = await postServerRequest('/auth/password', {
    method: 'PUT',
    body
  })

  if (res?.data) {
    return {
      data: {
        changePassword: res.data
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to change password' }
  }
}

export async function forgotPassword(variables: any) {
  const res = await postRequest('/auth/forgot-password', { email: variables?.email })

  if (res?.data) {
    return {
      data: {
        forgotPassword: res.data
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to request password reset' }
  }
}

export async function resetPassword(variables: any) {
  const res = await postRequest('/auth/reset-password', {
    token: variables?.token,
    password: variables?.password
  })

  if (res?.data) {
    return {
      data: {
        resetPassword: res.data
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to reset password' }
  }
}
