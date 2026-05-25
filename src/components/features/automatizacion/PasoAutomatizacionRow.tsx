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
import type { PasoAutomatizacion, TipoPaso, FuenteValor } from '@/lib/domain/automatizacion/types'

const TIPO_LABELS: Record<TipoPaso, string> = {
  navegar:     'Navegar a URL',
  click:       'Hacer click',
  rellenar:    'Rellenar campo',
  seleccionar: 'Seleccionar opción',
  esperar:     'Esperar',
}

const FUENTE_LABELS: Record<FuenteValor, string> = {
  columna:               'Columna del voluntario',
  zona_asignada:         'Zona asignada',
  credencial_usuario:    'Usuario (credencial)',
  credencial_contrasena: 'Contraseña (credencial)',
  fijo:                  'Valor fijo',
}

interface Props {
  index: number
  total: number
  paso: PasoAutomatizacion
  atributos: AtributoEntity[]
  onChange: (paso: PasoAutomatizacion) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function pasoVacio(tipo: TipoPaso): PasoAutomatizacion {
  switch (tipo) {
    case 'navegar':     return { tipo, url: '' }
    case 'click':       return { tipo, selector: '' }
    case 'rellenar':    return { tipo, selector: '', fuente: 'columna', columna: '' }
    case 'seleccionar': return { tipo, selector: '', fuente: 'columna', columna: '' }
    case 'esperar':     return { tipo, ms: 1000 }
  }
}

export function PasoAutomatizacionRow({
  index, total, paso, atributos, onChange, onRemove, onMoveUp, onMoveDown,
}: Props) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-md border bg-muted/30">
      <div className="flex flex-col gap-0.5 pt-1 shrink-0">
        <Button
          type="button" variant="ghost" size="icon" className="h-5 w-5"
          disabled={index === 0} onClick={onMoveUp}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          type="button" variant="ghost" size="icon" className="h-5 w-5"
          disabled={index === total - 1} onClick={onMoveDown}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      <span className="text-sm font-medium text-muted-foreground pt-2 w-4 shrink-0">
        {index + 1}
      </span>

      <div className="flex-1 space-y-2">
        <Select
          value={paso.tipo}
          onValueChange={t => onChange(pasoVacio(t as TipoPaso))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TIPO_LABELS) as TipoPaso[]).map(t => (
              <SelectItem key={t} value={t}>{TIPO_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {paso.tipo === 'navegar' && (
          <Input
            placeholder="https://ejemplo.cl/pagina"
            value={paso.url}
            onChange={e => onChange({ ...paso, url: e.target.value })}
          />
        )}

        {paso.tipo === 'click' && (
          <div className="space-y-2">
            <Input
              placeholder="Selector CSS, ej: #btn-guardar o .boton-enviar"
              value={paso.selector}
              onChange={e => onChange({ ...paso, selector: e.target.value })}
            />
            <Input
              placeholder="Descripción del botón (opcional)"
              value={paso.descripcion ?? ''}
              onChange={e => onChange({ ...paso, descripcion: e.target.value })}
            />
          </div>
        )}

        {(paso.tipo === 'rellenar' || paso.tipo === 'seleccionar') && (
          <div className="space-y-2">
            <Input
              placeholder="Selector CSS, ej: #campo-nombre o input[name='zona']"
              value={paso.selector}
              onChange={e => onChange({ ...paso, selector: e.target.value })}
            />
            <Select
              value={paso.fuente}
              onValueChange={f =>
                onChange({ ...paso, fuente: f as FuenteValor, columna: '', valorFijo: '' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="¿Qué valor ingresar?" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FUENTE_LABELS) as FuenteValor[]).map(f => (
                  <SelectItem key={f} value={f}>{FUENTE_LABELS[f]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {paso.fuente === 'columna' && (
              <Select
                value={paso.columna ?? ''}
                onValueChange={c => onChange({ ...paso, columna: c })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegir columna del voluntario..." />
                </SelectTrigger>
                <SelectContent>
                  {atributos.map(a => (
                    <SelectItem key={a.id} value={a.nombre}>{a.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {paso.fuente === 'fijo' && (
              <Input
                placeholder="Valor fijo a ingresar"
                value={paso.valorFijo ?? ''}
                onChange={e => onChange({ ...paso, valorFijo: e.target.value })}
              />
            )}
          </div>
        )}

        {paso.tipo === 'esperar' && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={100}
              max={30000}
              value={paso.ms}
              onChange={e => onChange({ ...paso, ms: parseInt(e.target.value) || 1000 })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">milisegundos</span>
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
