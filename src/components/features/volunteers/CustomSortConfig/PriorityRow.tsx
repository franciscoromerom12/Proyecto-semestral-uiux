'use client'

import { ChevronUp, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { CriterioOrden } from './types'

interface Props {
  index: number
  total: number
  criterio: CriterioOrden
  atributos: AtributoEntity[]
  onChange: (criterio: CriterioOrden) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function PriorityRow({ index, total, criterio, atributos, onChange, onRemove, onMoveUp, onMoveDown }: Props) {
  const atributoSeleccionado = atributos.find(a => a.nombre === criterio.atributo)
  const tipo = atributoSeleccionado?.tipo ?? 'texto'
  const mostrarValoresPrioritarios = tipo === 'texto' || tipo === 'seleccion'

  return (
    <div className="flex items-start gap-2 p-3 rounded-md border bg-muted/30">
      <div className="flex flex-col gap-0.5 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          disabled={index === 0}
          onClick={onMoveUp}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          disabled={index === total - 1}
          onClick={onMoveDown}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      <span className="text-sm font-medium text-muted-foreground pt-2 w-4 shrink-0">
        {index + 1}
      </span>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Select
          value={criterio.atributo}
          onValueChange={val =>
            onChange({ ...criterio, atributo: val, valoresPrioritarios: [] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar atributo" />
          </SelectTrigger>
          <SelectContent>
            {atributos.map(a => (
              <SelectItem key={a.id} value={a.nombre}>
                {a.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={criterio.orden}
          onValueChange={val => onChange({ ...criterio, orden: val as 'asc' | 'desc' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tipo === 'numero' || tipo === 'fecha' ? (
              <>
                <SelectItem value="asc">Primero los menores</SelectItem>
                <SelectItem value="desc">Primero los mayores</SelectItem>
              </>
            ) : tipo === 'booleano' ? (
              <>
                <SelectItem value="desc">Primero los verdaderos (Sí)</SelectItem>
                <SelectItem value="asc">Primero los falsos (No)</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="asc">A → Z</SelectItem>
                <SelectItem value="desc">Z → A</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        {mostrarValoresPrioritarios && (
          <div className="sm:col-span-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              Valores prioritarios (separados por coma) — van primero independiente del orden A-Z
            </p>
            <Input
              placeholder="Ej: PUC, UC, USACH"
              value={(criterio.valoresPrioritarios ?? []).join(', ')}
              onChange={e => {
                const vals = e.target.value
                  .split(',')
                  .map(v => v.trim())
                  .filter(Boolean)
                onChange({ ...criterio, valoresPrioritarios: vals })
              }}
            />
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
