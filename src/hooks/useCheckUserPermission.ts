import { useMemo } from 'react'

import { useSession } from 'next-auth/react'

export const useCheckUserPermission = () => {
  const { data: session } = useSession()

  const isSuperAdmin = (session?.user as any)?.is_super_admin
  const isAdmin = (session?.user as any)?.is_admin
  const roleId = (session?.user as any)?.role_id

  const permissions = useMemo(() => {
    return (session?.user as any)?.rolePermissions || []
  }, [session])

  const hasPermission = useMemo(() => {
    const isBusinessAdmin = isAdmin && (!roleId || permissions.length === 0)

    if (isSuperAdmin || isBusinessAdmin) {
      return () => true
    }

    return (code: string) => {
      if (!code) return false

      return permissions.includes(code)
    }
  }, [isSuperAdmin, isAdmin, roleId, permissions])

  return hasPermission
}
