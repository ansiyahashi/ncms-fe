'use client'

import { useCheckUserPermission } from '@/hooks/useCheckUserPermission'

interface RoleGuardProps {
  allowedPermissions?: string[]
  children: React.ReactNode
}

export default function RoleGuard({ allowedPermissions = [], children }: RoleGuardProps) {
  const hasAccess = useCheckUserPermission()

  const isAllowed = allowedPermissions.length === 0 || allowedPermissions.some(permission => hasAccess(permission))

  if (!isAllowed) return null

  return <>{children}</>
}
