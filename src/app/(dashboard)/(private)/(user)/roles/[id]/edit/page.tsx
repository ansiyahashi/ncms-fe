import React from 'react'

import { getAllPermissions } from '@/libs/actions/permissions.action'
import { getSingleRole } from '../../api/role.action'
import RolesForm from '../../components/RolesForm'

interface RoleEditPageProps {
  params: Promise<{ id: string }>
}

export default async function RoleEditPage({ params }: RoleEditPageProps) {
  const resolvedParams = await params
  const id = resolvedParams.id

  const [permissionRes, roleRes] = await Promise.all([
    getAllPermissions({ size: 1000 }),
    getSingleRole(id)
  ])

  const permissions = permissionRes?.data?.permissions?.data || []
  const role = roleRes?.data || null

  if (roleRes?.errors) {
    throw new Error(roleRes.errors.message || 'Failed to fetch role details')
  }

  return <RolesForm permissions={permissions} role={role} />
}
