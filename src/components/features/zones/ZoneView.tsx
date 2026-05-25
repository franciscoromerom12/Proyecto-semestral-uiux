'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import { VolunteerActionSheet } from '@/components/features/volunteers/VolunteerActionSheet'
import { ExportButton } from '@/components/features/volunteers/ExportButton'
import { useMockStore } from '@/components/providers/MockStoreProvider'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
}

export function ZoneView({ inscripcionId, atributos }: Props) {
  const { voluntarios: volsMap, zonas: zonasMap } = useMockStore()
  const voluntarios = volsMap[inscripcionId] ?? []
  const zonas = zonasMap[inscripcionId] ?? []
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [seleccionado, setSeleccionado] = useState<VoluntarioEntity | null>(null)

  const nombreAtributo =
    atributos.find(a => a.rolSistema === 'nombre_completo')?.nombre ??
    atributos[0]?.nombre

  function toggleZona(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const enEspera = voluntarios.filter(v => v.estado === 'lista_espera')

  if (zonas.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No hay zonas configuradas.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <ExportButton inscripcionId={inscripcionId} />
      </div>

      {zonas.map(zona => {
        const asignados = voluntarios.filter(v => v.zonaId === zona.id && v.estado === 'asignado')
        const isOpen = openIds.has(zona.id)

        return (
          <Collapsible key={zona.id} open={isOpen} onOpenChange={() => toggleZona(zona.id)}>
            <div className="rounded-lg border bg-card overflow-hidden">
              <CollapsibleTrigger className="w-full text-left">
                <div className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                  <span className="flex-1 font-semibold text-base">{zona.nombre}</span>
                  <Badge variant="outline">{asignados.length} / {zona.cupoTotal}</Badge>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                {asignados.length > 0 ? (
                  <table className="w-full text-sm border-t">
                    <thead className="bg-muted/20">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">
                          {nombreAtributo ?? 'Voluntario'}
                        </th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignados.map(v => (
                        <tr
                          key={v.id}
                          className="border-t hover:bg-muted/50 cursor-pointer"
                          onClick={() => setSeleccionado(v)}
                        >
                          <td className="p-3">
                            {nombreAtributo ? (v.datos[nombreAtributo] ?? '—') : v.id}
                          </td>
                          <td className="p-3">
                            <Badge className="bg-status-assigned-bg text-status-assigned-foreground border-0">
                              Asignado
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-5 text-sm text-muted-foreground border-t">Sin voluntarios asignados</p>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}

      {enEspera.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden mt-6">
          <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="font-semibold text-base">Lista de espera</h3>
            <Badge variant="outline">{enEspera.length}</Badge>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">
                  {nombreAtributo ?? 'Voluntario'}
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {enEspera.map(v => (
                <tr
                  key={v.id}
                  className="border-t hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSeleccionado(v)}
                >
                  <td className="p-3">
                    {nombreAtributo ? (v.datos[nombreAtributo] ?? '—') : v.id}
                  </td>
                  <td className="p-3">
                    <Badge className="bg-status-waiting-bg text-status-waiting-foreground border-0">
                      En Espera
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VolunteerActionSheet
        inscripcionId={inscripcionId}
        voluntario={seleccionado}
        zonas={zonas}
        voluntarios={voluntarios}
        nombreAtributo={nombreAtributo}
        onClose={() => setSeleccionado(null)}
        onSuccess={() => setSeleccionado(null)}
      />
    </div>
  )
}
