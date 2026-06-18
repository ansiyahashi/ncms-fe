import type { DefaultSession } from 'next-auth'
import type { JWT as DefaultJWT } from 'next-auth/jwt'

type CustomUser = {
  id: string
  token: string
  name: string
  email: string
  role_id: string
  image?: string | null
  is_admin: boolean
  is_super_admin: boolean
  rolePermissions: string[]
}

declare module 'next-auth' {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: CustomUser & DefaultSession['user']
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  // eslint-disable-next-line no-unused-vars
  interface JWT extends DefaultJWT {
    token: string
    id: string
    name: string
    email: string
    role_id: string
    image?: string | null
    is_admin: boolean
    is_super_admin: boolean
    rolePermissions: string[]
    accessToken: string
  }
}
