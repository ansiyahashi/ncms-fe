import FacilityForm from '../../hierarchy/components/FacilityForm'
import { getFacilityById } from '../../api/facility.action'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditFacilityPage({ params }: PageProps) {
  const { id } = await params

  const response = await getFacilityById(id)

  const facility =
    response?.data?.facility ||
    response?.data?.getFacility ||
    null

  return (
    <FacilityForm
      details={facility}
    />
  )
}
