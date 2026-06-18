import React from 'react'
import { getAllPermissions } from '@/libs/actions/permissions.action'
import RolesForm from '../components/RolesForm'

export default async function RoleAddPage() {
  const permissionRes = await getAllPermissions({ size: 1000 })
  const permissions = permissionRes?.data?.permissions?.data || []

  return <RolesForm permissions={permissions} />
}
