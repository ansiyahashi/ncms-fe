import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import type { PageProps } from '@/types/pageTypes'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import { getLookupRoles, getLookupUsers } from '@/libs/actions/lookup.action'
import ApprovalForm from '../components/ApprovalForm'

export default async function ApprovalAddPage({ searchParams }: PageProps) {
  const params = await (searchParams || Promise.resolve({ b_id: '' }))
  const b_id = params.b_id || ''

  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user?.is_super_admin || false

  const [rolesRes, usersRes, businessesRes] = await Promise.all([
    getLookupRoles(b_id ? { b_id } : {}),
    getLookupUsers(b_id ? { b_id } : {}),
    isSuperAdmin ? getAllBusinesses({ size: 1000 }) : Promise.resolve(null)
  ])

  const roles = rolesRes?.data?.roles?.data || []
  const users = usersRes?.data?.users?.data || []
  const businesses = businessesRes?.data?.businesses?.data || []

  return (
    <ApprovalForm
      roles={roles}
      users={users}
      businesses={businesses}
      b_id={b_id}
    />
  )
}
