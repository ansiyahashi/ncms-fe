import { NextResponse } from 'next/server'

import { withAuth } from 'next-auth/middleware'

import { ROUTE_PERMISSIONS } from './libs/paths'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token

    const pathname = req.nextUrl.pathname

    // If no token and trying to access protected routes, allow NextAuth to handle redirect
    if (!token) {
      return NextResponse.next()
    }

    // Find matching route permission
    const path = ROUTE_PERMISSIONS.find(p => {
      const newPath = p.path

      if (newPath.includes('[id]')) {
        const regex = new RegExp(`^${newPath.replace('[id]', '[^/]+')}$`)

        return regex.test(pathname)
      }

      return newPath === pathname
    })

    // If route doesn't require permission check, allow access
    if (!path) {
      return NextResponse.next()
    }

    // If path has empty permission, allow access (e.g., /home)
    if (!path.permission) {
      return NextResponse.next()
    }

    // Check the user is a super admin
    if ((token as any)?.is_super_admin || (token as any)?.is_admin) {
      return NextResponse.next()
    }

    // Check user has required permission
    const userPermission = (token as any)?.rolePermissions
    const hasPermission = userPermission?.includes(path?.permission)

    if (!hasPermission) {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname === '/login') {
          return true
        }

        // For other routes, require token
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/((?!api|login|access-denied|home|about|forgot-password|reset-password|privacy-policy|_next/static|_next/image|favicon.ico|images/.*).*)'
  ]
}
