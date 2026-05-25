'use client'

import { useRef } from 'react'
import { Trash2, Plus, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AtributoTipo } from '@/lib/domain/atributos/types'
import { extractHeadersFromFile } from '@/lib/utils/file-parser'

export interface AtributoRow {
  nombre: string
  tipo: AtributoTipo
  requerido: boolean
}

interface Props {
  value: AtributoRow[]
  onChange: (rows: AtributoRow[]) => void
}

const TIPOS: { value: AtributoTipo; label: string }[] = [
  { value: 'texto', label: 'Texto' },
  { value: 'numero', label: 'Número' },
  { value: 'booleano', label: 'Booleano' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'seleccion', label: 'Selección' },
]

export function AtributosBuilder({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update(index: number, patch: Partial<AtributoRow>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }
  function remove(index: number) { onChange(value.filter((_, i) => i !== index)) }
  function add() { onChange([...value, { nombre: '', tipo: 'texto', requerido: true }]) }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const headers = await extractHeadersFromFile(file)
    onChange(headers.map((h) => ({ nombre: h, tipo: 'texto' as AtributoTipo, requerido: true })))
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">Agrega al menos un atributo para continuar.</p>
      )}
      {value.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input placeholder="Nombre del atributo" value={row.nombre} onChange={(e) => update(i, { nombre: e.target.value })} className="flex-1" />
          <Select value={row.tipo} onValueChange={(v) => update(i, { tipo: v as AtributoTipo })}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <Checkbox id={`req-${i}`} checked={row.requerido} onCheckedChange={(checked) => update(i, { requerido: !!checked })} />
            <label htmlFor={`req-${i}`} className="text-xs text-muted-foreground select-none">Req.</label>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2 mt-1">
        <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Plus className="h-4 w-4" />Agregar atributo
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
          <FileSpreadsheet className="h-4 w-4" />Generar desde Excel
        </Button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  )
}
