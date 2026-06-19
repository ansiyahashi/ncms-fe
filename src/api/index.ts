import { getSession, signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth'

import { toast } from 'react-toastify'

import { authOptions } from '@/libs/auth'

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
}

export interface ApiResponse<T = any> {
  status?: number
  data?: T
  pagination?: any
  errors?: any
}

export async function getRequest<T = any>(url: string): Promise<ApiResponse<T>> {
  const session = await getServerSession(authOptions)
  const token = session?.user?.token ?? ''

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${getApiUrl()}${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'GET',
      headers: requestHeaders,
      cache: 'no-store'
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      return {
        status: res.status,
        errors: body
      }
    }

    return {
      status: res.status,
      data: body.data || body,
      pagination: body.pagination || undefined
    }
  } catch (error: any) {
    return {
      errors: {
        message: error?.message || 'Network error occurred.'
      }
    }
  }
}

export async function postRequest<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
  const session = await getServerSession(authOptions)
  const token = session?.user?.token ?? ''

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${getApiUrl()}${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body)
    })

    const resBody = await res.json().catch(() => ({}))

    if (!res.ok) {
      return {
        status: res.status,
        errors: resBody
      }
    }

    return {
      status: res.status,
      data: resBody.data || resBody,
      pagination: resBody.pagination || undefined
    }
  } catch (error: any) {
    return {
      errors: {
        message: error?.message || 'Network error occurred.'
      }
    }
  }
}

export async function getClientRequest<T = any>(url: string, options: any = {}): Promise<ApiResponse<T>> {
  try {
    const session = await getSession()
    const token = session?.user?.token ?? ''

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${getApiUrl()}${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'GET',
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })

    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
      if (response.status === 401) {
        signOut()
      }

      return {
        status: response.status,
        errors: body
      }
    }

    return {
      status: response.status,
      data: body.data || body,
      pagination: body.pagination || undefined
    }
  } catch (error: any) {
    return {
      errors: {
        message: error?.message || 'Network error occurred.'
      }
    }
  }
}

export async function postClientRequest<T = any>(url: string, body: any, options: any = {}): Promise<ApiResponse<T>> {
  try {
    const session = await getSession()
    const token = session?.user?.token ?? ''

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${getApiUrl()}${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'POST',
      ...options,
      headers: {
        ...headers,
        ...options.headers
      },
      body: isFormData ? body : JSON.stringify(body)
    })

    const resBody = await response.json().catch(() => ({}))

    if (!response.ok) {
      if (response.status === 401) {
        signOut()
      }

      return {
        status: response.status,
        errors: resBody
      }
    }

    return {
      status: response.status,
      data: resBody.data || resBody,
      pagination: resBody.pagination || undefined
    }
  } catch (error: any) {
    return {
      errors: {
        message: error?.message || 'Network error occurred.'
      }
    }
  }
}

export const validateError = (
  errors: any = {},
  defaultValues: any = {},
  setError?: (name: any, error: { message: string }) => void
) => {
  if (errors?.status === 401 || errors?.errorCode === 'UNAUTHENTICATED') {
    signOut()
  }

  let hasFieldError = false
  const fieldErrors = errors?.validationErrors || errors

  if (setError && fieldErrors && Object.keys(fieldErrors).length > 0) {
    Object.keys(defaultValues).forEach(key => {
      if (fieldErrors[key]) {
        const message = fieldErrors[key]?.message ?? fieldErrors[key]

        setError(key as any, { message })
        hasFieldError = true
      }
    })
  }

  if (!hasFieldError && errors?.message) {
    toast.error(errors.message || 'Api error. Please try again later.')
  }
}
