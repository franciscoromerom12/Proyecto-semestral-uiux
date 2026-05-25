'use client'

import { X } from 'lucide-react'
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
import type { FiltroEliminatorio, OperadorFiltro } from './types'
import { OPERADORES_TEXTO, OPERADORES_NUMERO, OPERADORES_BOOLEANO } from './types'

interface Props {
  filtro: FiltroEliminatorio
  atributos: AtributoEntity[]
  onChange: (filtro: FiltroEliminatorio) => void
  onRemove: () => void
}

export function EliminatoryFilterRow({ filtro, atributos, onChange, onRemove }: Props) {
  const atributoSeleccionado = atributos.find(a => a.nombre === filtro.atributo)
  const tipo = atributoSeleccionado?.tipo ?? 'texto'

  const operadores =
    tipo === 'numero' || tipo === 'fecha'
      ? OPERADORES_NUMERO
      : tipo === 'booleano'
        ? OPERADORES_BOOLEANO
        : OPERADORES_TEXTO

  return (
    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/30">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Select
          value={filtro.atributo}
          onValueChange={val =>
            onChange({ ...filtro, atributo: val, operador: 'igual', valor: '' })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Atributo" />
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
          value={filtro.operador}
          onValueChange={val => onChange({ ...filtro, operador: val as OperadorFiltro })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Operador" />
          </SelectTrigger>
          <SelectContent>
            {operadores.map(op => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {tipo === 'booleano' ? (
          <Select
            value={filtro.valor}
            onValueChange={val => onChange({ ...filtro, valor: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Valor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="si">Sí</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="Valor"
            value={filtro.valor}
            onChange={e => onChange({ ...filtro, valor: e.target.value })}
          />
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
