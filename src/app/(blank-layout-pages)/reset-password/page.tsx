// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ResetPassword from '@views/ResetPassword'
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your account password'
}

const ResetPasswordPage = async () => {
  // Vars
  const mode = await getServerMode()

  return (
    <GuestOnlyRoute>
      <ResetPassword mode={mode} />
    </GuestOnlyRoute>
  )
}

export default ResetPasswordPage
