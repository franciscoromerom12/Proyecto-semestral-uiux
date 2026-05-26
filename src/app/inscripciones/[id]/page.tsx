import { InscripcionDashboard } from '@/components/features/inscripciones/InscripcionDashboard'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InscripcionPage({ params }: Props) {
  const { id } = await params
  return <InscripcionDashboard inscripcionId={id} />
}
