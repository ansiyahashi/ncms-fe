import CredentialProvider from 'next-auth/providers/credentials'

import type { NextAuthOptions } from 'next-auth'

import { login } from './actions/auth.action'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        console.log('credentials => ', JSON.stringify(credentials, null, 2))
        const { email, password } = credentials as { email: string; password: string }

        try {
          const res = await login(email, password)

          if (res?.data?.loginUser) {
            const user = res?.data?.loginUser

            // Get primary role (first role) for compatibility
            const primaryRole = user?.roles?.length > 0 ? user.roles[0] : null

            return {
              ...user,
              role: primaryRole,
              role_id: primaryRole?.id
            }
          }

          if (res?.errors) {
            return {
              id: 'error',
              error: JSON.stringify(res?.errors)
            } as any
          }

          return {
            id: 'error',
            error: JSON.stringify({ message: 'Login failed. Please check your credentials.' })
          } as any
        } catch (error: any) {
          return {
            id: 'error',
            error: JSON.stringify({ message: error?.message || 'Login failed' })
          } as any
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (user && 'error' in (user as any)) {
        throw new Error((user as any).error as string)
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url

      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        const rolePermissions =
          (user as any)?.role?.role_permissions?.map((perm: any) => perm?.permission?.permission_code) || []

        token.accessToken = (user as any)?.access_token || ''
        token.token = (user as any)?.access_token || ''
        token.id = (user as any).id || ''
        token.name = (user as any)?.name || ''
        token.email = (user as any)?.email || ''
        token.role_id = (user as any).role_id || ''
        token.image = (user as any).image || null
        token.is_admin = Boolean((user as any)?.is_admin)
        token.is_super_admin = Boolean((user as any)?.is_super_admin)
        token.rolePermissions = rolePermissions
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.token = token.token
        session.user.name = token.name
        session.user.email = token.email
        session.user.role_id = token.role_id
        session.user.image = token.image
        session.user.is_admin = token.is_admin
        session.user.is_super_admin = token.is_super_admin
        session.user.rolePermissions = token.rolePermissions

        session.accessToken = token.accessToken
      }

      return session
    }
  },
  debug: process.env.NODE_ENV === 'development'
}
