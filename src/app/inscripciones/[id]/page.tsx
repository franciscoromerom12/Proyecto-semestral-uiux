'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { useMockStore } from '@/components/providers/MockStoreProvider'
import { InscripcionDashboard } from '@/components/features/inscripciones/InscripcionDashboard'

interface Props {
  params: Promise<{ id: string }>
}

export default function InscripcionPage({ params }: Props) {
  const { id } = use(params)
  const { inscripciones, atributos } = useMockStore()

  const inscripcion = inscripciones.find(i => i.id === id)
  if (!inscripcion) notFound()

  const attrs = atributos[id] ?? []

  return <InscripcionDashboard inscripcion={inscripcion} atributos={attrs} />
}
