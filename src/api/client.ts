import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import { ApiResponse } from '.'

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
}

export async function postServerRequest<T = any>(
  url: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
    cache?: RequestCache
    path?: string
    tags?: string[]
  } = {}
): Promise<ApiResponse<T>> {
  const session = await getServerSession(authOptions)
  let token = session?.user?.token ?? ''

  if (token) {
    token = `Bearer ${token}`
  }

  if (session?.user?.is_super_admin && typeof window === 'undefined') {
    try {
      const { cookies } = require('next/headers')
      const cookieStore = await cookies()
      const selectedBId = cookieStore.get('selectedBusinessId')?.value
      if (selectedBId) {
        const separator = url.includes('?') ? '&' : '?'
        url = `${url}${separator}bId=${selectedBId}`
      }
    } catch (e) {
      // Ignore
    }
  }

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: token } : {}),
    ...options.headers
  }

  try {
    const res = await fetch(`${getApiUrl()}${url.startsWith('/') ? url : `/${url}`}`, {
      method: options.method || 'POST',
      headers: requestHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: options.cache || 'no-store',
      ...(options.tags && { next: { tags: options.tags } })
    })

    const body = await res.json().catch(() => ({}))

    options.path && revalidatePath(options.path)

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
        message: error?.message || 'Server network error occurred.'
      }
    }
  }
}
