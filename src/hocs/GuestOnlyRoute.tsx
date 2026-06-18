// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Config Imports
import { authOptions } from '@/libs/auth'

interface GuestOnlyRouteProps {
  children: React.ReactNode
}

const GuestOnlyRoute = async ({ children }: GuestOnlyRouteProps) => {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/home')
  }

  return <>{children}</>
}

export default GuestOnlyRoute
