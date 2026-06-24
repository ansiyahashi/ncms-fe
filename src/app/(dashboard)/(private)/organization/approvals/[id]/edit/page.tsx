import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getAllBusinesses } from '@/app/(dashboard)/(private)/organization/business/api/business.action'
import { getLookupRoles, getLookupUsers } from '@/libs/actions/lookup.action'
import { getSingleWorkflow } from '../../api/approval.action'
import ApprovalForm from '../../components/ApprovalForm'

interface ApprovalEditPageProps {
  params: Promise<{ id: string }>
}

export default async function ApprovalEditPage({ params }: ApprovalEditPageProps) {
  const resolvedParams = await params
  const id = resolvedParams.id

  const workflowRes = await getSingleWorkflow(id)

  if (workflowRes?.errors) {
    throw new Error(workflowRes.errors.message || 'Failed to fetch approval workflow details')
  }

  const workflow = workflowRes?.data || null
  const b_id = workflow?.b_id || ''

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
      workflow={workflow}
      roles={roles}
      users={users}
      businesses={businesses}
      b_id={b_id}
    />
  )
}
