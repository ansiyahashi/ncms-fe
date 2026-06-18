import { useMemo } from 'react'

import { useSession } from 'next-auth/react'

export const useCheckUserPermission = () => {
  const { data: session } = useSession()

  const isSuperAdmin = session?.user?.is_super_admin
  const isAdmin = session?.user?.is_admin

  const permissions = useMemo(() => {
    return session?.user?.rolePermissions || []
  }, [session])

  const hasPermission = useMemo(() => {
    if (isSuperAdmin || isAdmin) {
      return () => true
    }

    return (code: string) => {
      if (!code) return false

      return permissions.includes(code)
    }
  }, [isSuperAdmin, isAdmin, permissions])

  return hasPermission
}
