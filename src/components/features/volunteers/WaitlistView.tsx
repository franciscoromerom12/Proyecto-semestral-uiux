'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import { VolunteerActionSheet } from './VolunteerActionSheet'
import { VolunteerFilters } from './VolunteerFilters'
import { aplicarFiltros, FILTROS_INICIALES } from '@/lib/utils/volunteer-filters'
import type { FiltrosVoluntarios } from '@/lib/utils/volunteer-filters'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
}

export function WaitlistView({ inscripcionId, atributos }: Props) {
  const { voluntarios: volsMap, zonas: zonasMap } = useMockStore()
  const todosVoluntarios = volsMap[inscripcionId] ?? []
  const zonas = zonasMap[inscripcionId] ?? []
  const enEspera = todosVoluntarios.filter(v => v.estado === 'lista_espera')

  const [seleccionado, setSeleccionado] = useState<VoluntarioEntity | null>(null)
  const [search, setSearch] = useState('')
  const [filtros, setFiltros] = useState<FiltrosVoluntarios>(FILTROS_INICIALES)

  const zonaMap = new Map(zonas.map(z => [z.id, z.nombre]))
  const nombreAtributo =
    atributos.find(a => a.rolSistema === 'nombre_completo')?.nombre ?? atributos[0]?.nombre

  const filtrados = useMemo(() => {
    const conFiltros = aplicarFiltros(enEspera, atributos, filtros, zonas)
    if (!search) return conFiltros
    const s = search.toLowerCase()
    return conFiltros.filter(v => Object.values(v.datos).some(val => val.toLowerCase().includes(s)))
  }, [enEspera, atributos, filtros, zonas, search])

  if (enEspera.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No hay voluntarios en lista de espera.</p>
  }

  return (
    <div className="space-y-4">
      <VolunteerFilters filtros={filtros} zonas={zonas} onChange={setFiltros} showZona={false} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar voluntario..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="text-sm text-muted-foreground">{filtrados.length} en lista de espera</div>

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
            {filtrados.map(v => (
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
        atributos={atributos}
        nombreAtributo={nombreAtributo}
        inscripcionId={inscripcionId}
        onClose={() => setSeleccionado(null)}
        onSuccess={() => setSeleccionado(null)}
      />
    </div>
  )
}
