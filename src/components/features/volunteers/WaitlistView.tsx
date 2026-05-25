'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import { VolunteerActionSheet } from './VolunteerActionSheet'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: { nombre: string }[]
}

export function WaitlistView({ inscripcionId, atributos }: Props) {
  const { voluntarios: volsMap, zonas: zonasMap } = useMockStore()
  const todosVoluntarios = volsMap[inscripcionId] ?? []
  const zonas = zonasMap[inscripcionId] ?? []
  const voluntarios = todosVoluntarios.filter(v => v.estado === 'lista_espera')
  const [seleccionado, setSeleccionado] = useState<VoluntarioEntity | null>(null)
  const [, forceUpdate] = useState(0)

  const zonaMap = new Map(zonas.map(z => [z.id, z.nombre]))
  const nombreAtributo = atributos[0]?.nombre

  if (voluntarios.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No hay voluntarios en lista de espera.</p>
  }

  return (
    <>
      <div className="rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">{nombreAtributo ?? 'Voluntario'}</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Zona Asignada</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {voluntarios.map(v => (
              <tr key={v.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => setSeleccionado(v)}>
                <td className="p-3 font-medium">{nombreAtributo ? (v.datos[nombreAtributo] ?? '—') : v.id}</td>
                <td className="p-3 text-muted-foreground">{v.zonaId ? (zonaMap.get(v.zonaId) ?? v.zonaId) : '—'}</td>
                <td className="p-3">
                  <Badge className="bg-status-waiting-bg text-status-waiting-foreground border-0">En Espera</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <VolunteerActionSheet
        voluntario={seleccionado}
        zonas={zonas}
        voluntarios={todosVoluntarios}
        nombreAtributo={nombreAtributo}
        inscripcionId={inscripcionId}
        onClose={() => setSeleccionado(null)}
        onSuccess={() => { setSeleccionado(null); forceUpdate(n => n + 1) }}
      />
    </>
  )
}
