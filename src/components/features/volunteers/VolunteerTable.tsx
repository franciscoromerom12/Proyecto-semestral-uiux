'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { VoluntarioEstado } from '@/lib/domain/voluntarios/types'
import { AutoSortButton } from './AutoSortButton'
import { CustomSortConfigButton } from './CustomSortConfig'
import { AddVolunteerModal } from './AddVolunteerModal'
import { VolunteerFilters } from './VolunteerFilters'
import { VolunteerActionSheet } from './VolunteerActionSheet'
import { aplicarFiltros, FILTROS_INICIALES } from '@/lib/utils/volunteer-filters'
import type { FiltrosVoluntarios } from '@/lib/utils/volunteer-filters'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TruncatedCell } from '@/components/ui/TruncatedCell'
import { useMockStore } from '@/components/providers/MockStoreProvider'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'

const STATUS_STYLES: Record<VoluntarioEstado, string> = {
  asignado: 'bg-status-assigned-bg text-status-assigned-foreground border-0',
  lista_espera: 'bg-status-waiting-bg text-status-waiting-foreground border-0',
  no_asignado: 'bg-status-unassigned-bg text-status-unassigned-foreground border-0',
}
const STATUS_LABELS: Record<VoluntarioEstado, string> = {
  asignado: 'Asignado',
  lista_espera: 'En Espera',
  no_asignado: 'No Asignado',
}

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
}

export function VolunteerTable({ inscripcionId, atributos }: Props) {
  const { voluntarios: volsMap, zonas: zonasMap } = useMockStore()
  const volunteers = volsMap[inscripcionId] ?? []
  const zonas = zonasMap[inscripcionId] ?? []

  const [search, setSearch] = useState('')
  const [filtros, setFiltros] = useState<FiltrosVoluntarios>(FILTROS_INICIALES)
  const [seleccionado, setSeleccionado] = useState<VoluntarioEntity | null>(null)
  const [, forceUpdate] = useState(0)

  const nombreAtributo = atributos.find(a => a.rolSistema === 'nombre_completo')?.nombre ?? atributos[0]?.nombre

  const filtered = useMemo(() => {
    const conFiltros = aplicarFiltros(volunteers, atributos, filtros, zonas)
    if (!search) return conFiltros
    const s = search.toLowerCase()
    return conFiltros.filter(v => Object.values(v.datos).some(val => val.toLowerCase().includes(s)))
  }, [volunteers, atributos, filtros, zonas, search])

  if (volunteers.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No hay voluntarios. Importa un archivo Excel desde la pestaña Importar.</p>
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <VolunteerFilters filtros={filtros} zonas={zonas} onChange={setFiltros} />

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <AddVolunteerModal inscripcionId={inscripcionId} atributos={atributos} onSuccess={() => forceUpdate(n => n + 1)} />
          <CustomSortConfigButton inscripcionId={inscripcionId} atributos={atributos} />
          <AutoSortButton inscripcionId={inscripcionId} onComplete={() => forceUpdate(n => n + 1)} />
        </div>

        <div className="text-sm text-muted-foreground">{filtered.length} voluntarios</div>

        <div className="rounded-lg border overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {atributos.map(a => (
                  <th key={a.id} className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">{a.nombre}</th>
                ))}
                <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => setSeleccionado(v)}>
                  {atributos.map(a => (
                    <td key={a.id} className="p-3 max-w-[200px]">
                      <TruncatedCell value={v.datos[a.nombre] ?? '—'} />
                    </td>
                  ))}
                  <td className="p-3">
                    <Badge className={STATUS_STYLES[v.estado]}>{STATUS_LABELS[v.estado]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <VolunteerActionSheet
        voluntario={seleccionado}
        zonas={zonas}
        voluntarios={volunteers}
        nombreAtributo={nombreAtributo}
        inscripcionId={inscripcionId}
        onClose={() => setSeleccionado(null)}
        onSuccess={() => { setSeleccionado(null); forceUpdate(n => n + 1) }}
      />
    </TooltipProvider>
  )
}
