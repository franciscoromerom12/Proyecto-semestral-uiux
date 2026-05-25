'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { ConfigOrdenEntity } from '@/lib/domain/config-orden/types'
import { PriorityRow } from './PriorityRow'
import { EliminatoryFilterRow } from './EliminatoryFilterRow'
import type { CriterioOrden, FiltroEliminatorio } from './types'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
  configInicial: ConfigOrdenEntity | null
  onGuardado: () => void
}

export function CustomSortConfigForm({ inscripcionId, atributos, configInicial, onGuardado }: Props) {
  const [prioridades, setPrioridades] = useState<CriterioOrden[]>(configInicial?.prioridades ?? [])
  const [filtros, setFiltros] = useState<FiltroEliminatorio[]>(configInicial?.filtrosEliminatorios ?? [])
  const { saveConfigOrden } = useMockStore()

  function agregarPrioridad() {
    const primerAtributo = atributos[0]?.nombre ?? ''
    setPrioridades(prev => [...prev, { atributo: primerAtributo, orden: 'asc', valoresPrioritarios: [] }])
  }

  function agregarFiltro() {
    const primerAtributo = atributos[0]?.nombre ?? ''
    setFiltros(prev => [...prev, { atributo: primerAtributo, operador: 'igual', valor: '' }])
  }

  function moverPrioridad(index: number, direccion: 'up' | 'down') {
    setPrioridades(prev => {
      const siguiente = [...prev]
      const destino = direccion === 'up' ? index - 1 : index + 1
      ;[siguiente[index], siguiente[destino]] = [siguiente[destino], siguiente[index]]
      return siguiente
    })
  }

  function handleGuardar() {
    const filtrosValidos = filtros.filter(f => f.atributo && f.valor.trim())
    const prioridadesValidas = prioridades.filter(p => p.atributo)
    saveConfigOrden(inscripcionId, prioridadesValidas, filtrosValidos)
    toast.success('Configuración guardada. Se aplicará en el próximo ordenamiento.')
    onGuardado()
  }

  function handleEliminarConfig() {
    saveConfigOrden(inscripcionId, [], [])
    setPrioridades([])
    setFiltros([])
    toast.success('Configuración eliminada. Se usará el orden predeterminado.')
    onGuardado()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Criterios de ordenamiento</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Define en qué orden se priorizan los voluntarios. El criterio 1 tiene mayor peso.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={agregarPrioridad} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />Agregar
          </Button>
        </div>
        {prioridades.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">Sin criterios personalizados. Se usará el orden predeterminado (PUC primero, luego fecha).</p>
        ) : (
          <div className="space-y-2">
            {prioridades.map((criterio, i) => (
              <PriorityRow key={i} index={i} total={prioridades.length} criterio={criterio} atributos={atributos}
                onChange={updated => setPrioridades(prev => prev.map((c, idx) => (idx === i ? updated : c)))}
                onRemove={() => setPrioridades(prev => prev.filter((_, idx) => idx !== i))}
                onMoveUp={() => moverPrioridad(i, 'up')}
                onMoveDown={() => moverPrioridad(i, 'down')}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Filtros eliminatorios</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Voluntarios que cumplan estas condiciones irán automáticamente a lista de espera.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={agregarFiltro} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />Agregar
          </Button>
        </div>
        {filtros.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">Sin filtros eliminatorios.</p>
        ) : (
          <div className="space-y-2">
            {filtros.map((filtro, i) => (
              <EliminatoryFilterRow key={i} filtro={filtro} atributos={atributos}
                onChange={updated => setFiltros(prev => prev.map((f, idx) => (idx === i ? updated : f)))}
                onRemove={() => setFiltros(prev => prev.filter((_, idx) => idx !== i))}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-3">
        {configInicial && (configInicial.prioridades.length > 0 || configInicial.filtrosEliminatorios.length > 0) && (
          <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleEliminarConfig}>
            Volver al orden predeterminado
          </Button>
        )}
        <Button type="button" onClick={handleGuardar} className="ml-auto gap-2">
          Guardar configuración
        </Button>
      </div>
    </div>
  )
}
