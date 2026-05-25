'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { ConfigAutomatizacionEntity, PasoAutomatizacion } from '@/lib/domain/automatizacion/types'
import { PasoAutomatizacionRow } from './PasoAutomatizacionRow'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
  configInicial: ConfigAutomatizacionEntity | null
  onGuardado: (config: ConfigAutomatizacionEntity) => void
}

export function ConfigAutomatizacionForm({ inscripcionId, atributos, configInicial, onGuardado }: Props) {
  const [pasosInicio, setPasosInicio] = useState<PasoAutomatizacion[]>(
    configInicial?.pasosInicio ?? [],
  )
  const [pasosPorVoluntario, setPasosPorVoluntario] = useState<PasoAutomatizacion[]>(
    configInicial?.pasosPorVoluntario ?? [],
  )
  const { saveConfigAutomatizacion } = useMockStore()

  function handleGuardar() {
    saveConfigAutomatizacion(inscripcionId, pasosInicio, pasosPorVoluntario)
    const config: ConfigAutomatizacionEntity = {
      id: configInicial?.id ?? 'new',
      inscripcionId,
      pasosInicio,
      pasosPorVoluntario,
      createdAt: configInicial?.createdAt ?? new Date(),
      updatedAt: new Date(),
    }
    toast.success('Configuración guardada.')
    onGuardado(config)
  }

  return (
    <div className="space-y-8">
      <PasosSection
        titulo="Pasos de inicio"
        descripcion="Se ejecutan una sola vez al comenzar. Úsalos para hacer login en el sitio externo antes de procesar voluntarios."
        pasos={pasosInicio}
        atributos={atributos}
        onChange={setPasosInicio}
      />

      <Separator />

      <PasosSection
        titulo="Pasos por voluntario"
        descripcion="Se repiten para cada voluntario asignado. Define aquí qué debe hacer el sistema en el sitio externo por cada uno."
        pasos={pasosPorVoluntario}
        atributos={atributos}
        onChange={setPasosPorVoluntario}
      />

      <div className="flex justify-end">
        <Button onClick={handleGuardar} className="gap-2">
          Guardar configuración
        </Button>
      </div>
    </div>
  )
}

interface PasosSectionProps {
  titulo: string
  descripcion: string
  pasos: PasoAutomatizacion[]
  atributos: AtributoEntity[]
  onChange: (pasos: PasoAutomatizacion[]) => void
}

function PasosSection({ titulo, descripcion, pasos, atributos, onChange }: PasosSectionProps) {
  function agregar() {
    onChange([...pasos, { tipo: 'navegar', url: '' }])
  }

  function actualizar(i: number, paso: PasoAutomatizacion) {
    onChange(pasos.map((p, idx) => (idx === i ? paso : p)))
  }

  function eliminar(i: number) {
    onChange(pasos.filter((_, idx) => idx !== i))
  }

  function mover(i: number, dir: 'up' | 'down') {
    const next = [...pasos]
    const dest = dir === 'up' ? i - 1 : i + 1
    ;[next[i], next[dest]] = [next[dest], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">{titulo}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{descripcion}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={agregar} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Agregar paso
        </Button>
      </div>

      {pasos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
          Sin pasos configurados.
        </p>
      ) : (
        <div className="space-y-2">
          {pasos.map((paso, i) => (
            <PasoAutomatizacionRow
              key={i}
              index={i}
              total={pasos.length}
              paso={paso}
              atributos={atributos}
              onChange={p => actualizar(i, p)}
              onRemove={() => eliminar(i)}
              onMoveUp={() => mover(i, 'up')}
              onMoveDown={() => mover(i, 'down')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
