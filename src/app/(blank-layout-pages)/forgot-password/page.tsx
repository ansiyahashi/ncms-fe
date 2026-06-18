// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ForgotPassword from '@views/ForgotPassword'
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request password reset link'
}

const ForgotPasswordPage = async () => {
  // Vars
  const mode = await getServerMode()

  return (
    <GuestOnlyRoute>
      <ForgotPassword mode={mode} />
    </GuestOnlyRoute>
  )
}

export default ForgotPasswordPage
