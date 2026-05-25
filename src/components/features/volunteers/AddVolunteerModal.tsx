'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
  onSuccess: () => void
}

export function AddVolunteerModal({ inscripcionId, atributos, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [datos, setDatos] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const { addVoluntario } = useMockStore()

  function handleChange(nombre: string, value: string) {
    setDatos(prev => ({ ...prev, [nombre]: value }))
  }

  function resetForm() { setDatos({}); setError(null) }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) resetForm()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const requeridos = atributos.filter(a => a.requerido)
    const faltantes = requeridos.filter(a => !datos[a.nombre]?.trim())
    if (faltantes.length > 0) { setError(`Campos requeridos: ${faltantes.map(a => a.nombre).join(', ')}`); return }
    addVoluntario(inscripcionId, datos)
    toast.success('Voluntario agregado correctamente')
    setOpen(false)
    resetForm()
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />Agregar voluntario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Agregar voluntario</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {atributos.map(atributo => (
            <div key={atributo.id} className="space-y-1.5">
              <Label htmlFor={atributo.id}>
                {atributo.nombre}
                {atributo.requerido && <span className="text-destructive ml-1">*</span>}
              </Label>
              {atributo.tipo === 'booleano' ? (
                <Select value={datos[atributo.nombre] ?? ''} onValueChange={val => handleChange(atributo.nombre, val)}>
                  <SelectTrigger id={atributo.id}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={atributo.id}
                  type={atributo.tipo === 'numero' ? 'number' : atributo.tipo === 'fecha' ? 'date' : 'text'}
                  value={datos[atributo.nombre] ?? ''}
                  onChange={e => handleChange(atributo.nombre, e.target.value)}
                  placeholder={atributo.nombre}
                />
              )}
            </div>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
