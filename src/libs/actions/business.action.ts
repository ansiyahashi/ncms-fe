'use server'

import { getRequest } from '@/api'
import { postServerRequest } from '@/api/client'

function formatBusiness(b: any) {
  if (!b) return null

  return {
    id: b._id,
    name: b.name,
    code: b.code || '',
    plan: b.plan || 'free',
    contact: b.contact || '',
    email: b.email,
    phone: b.phone || '',
    address: b.address || '',
    business_type: b.business_type || 'retail',
    industry: b.industry || '',
    country: b.country || '',
    logo: b.logo || null,
    common_name: b.common_name || '',
    status: b.is_active,
    created_at: b.created_at,
    updated_at: b.updated_at
  }
}

export async function getAllBusinesses(variables: any) {
  const search = variables?.search || ''
  const limit = variables?.size || 10
  const page = variables?.page || 1

  const res = await getRequest(`/businesses?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`)

  if (res?.data) {
    const mapped = Array.isArray(res.data) ? res.data.map((b: any) => formatBusiness(b)) : []

    return {
      data: {
        businesses: {
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
      businesses: {
        data: [],
        totalData: 0,
        totalPages: 0,
        currentPage: 0,
        errors: res?.errors || { message: 'Failed to fetch businesses' }
      }
    },
    errors: res?.errors || { message: 'Failed to fetch businesses' }
  }
}

export async function getBusinessById(id: string) {
  const res = await getRequest(`/businesses/${id}`)

  if (res?.data) {
    return {
      data: formatBusiness(res.data)
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to fetch business details' }
  }
}

export async function createBusiness(
  variables: any,
  path?: string
): Promise<{ data?: { createBusiness?: any; updateBusiness?: any }; errors?: any }> {
  const body = {
    name: variables?.businessData?.name,
    plan: variables?.businessData?.plan,
    contact: variables?.businessData?.contact,
    email: variables?.businessData?.email,
    phone: variables?.businessData?.phone,
    address: variables?.businessData?.address,
    business_type: variables?.businessData?.business_type,
    industry: variables?.businessData?.industry,
    country: variables?.businessData?.country,
    logo: variables?.businessData?.logo,
    common_name: variables?.businessData?.common_name,
    is_active: variables?.businessData?.status !== undefined ? variables.businessData.status : true,
    user_name: variables?.businessData?.user_name,
    user_email: variables?.businessData?.user_email,
    password: variables?.businessData?.password
  }

  const res = await postServerRequest('/businesses', {
    method: 'POST',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        createBusiness: formatBusiness(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to create business' }
  }
}

export async function updateBusiness(
  variables: any,
  path?: string
): Promise<{ data?: { createBusiness?: any; updateBusiness?: any }; errors?: any }> {
  const id = variables?.businessData?.id

  const body = {
    name: variables?.businessData?.name,
    plan: variables?.businessData?.plan,
    contact: variables?.businessData?.contact,
    email: variables?.businessData?.email,
    phone: variables?.businessData?.phone,
    address: variables?.businessData?.address,
    business_type: variables?.businessData?.business_type,
    industry: variables?.businessData?.industry,
    country: variables?.businessData?.country,
    logo: variables?.businessData?.logo,
    common_name: variables?.businessData?.common_name,
    is_active: variables?.businessData?.status !== undefined ? variables.businessData.status : true
  }

  const res = await postServerRequest(`/businesses/${id}`, {
    method: 'PUT',
    body,
    path
  })

  if (res?.data) {
    return {
      data: {
        updateBusiness: formatBusiness(res.data)
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to update business' }
  }
}

export async function deleteBusiness(variables: any, path?: string) {
  const id = variables?.id

  const res = await postServerRequest(`/businesses/${id}`, {
    method: 'DELETE',
    path
  })

  if (res?.status === 200 || res?.data) {
    return {
      data: {
        deleteBusiness: {
          id
        }
      }
    }
  }

  return {
    errors: res?.errors || { message: 'Failed to delete business' }
  }
}
