'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props { inscripcionId: string }
interface FormState { nombre: string; cupoTotal: string }
const emptyForm: FormState = { nombre: '', cupoTotal: '' }

export function ZoneManager({ inscripcionId }: Props) {
  const { zonas: zonasMap, addZona, updateZona, deleteZona } = useMockStore()
  const zonas = zonasMap[inscripcionId] ?? []
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const resetForm = () => { setForm(emptyForm); setEditing(null) }

  function handleAdd() {
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return }
    const cupoTotal = Number(form.cupoTotal)
    if (!cupoTotal || cupoTotal < 1) { toast.error('El cupo debe ser mayor a 0'); return }
    addZona(inscripcionId, form.nombre.trim(), cupoTotal)
    resetForm()
    toast.success('Zona creada')
  }

  function handleSaveEdit() {
    if (!editing) return
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return }
    const cupoTotal = Number(form.cupoTotal)
    if (!cupoTotal || cupoTotal < 1) { toast.error('El cupo debe ser mayor a 0'); return }
    updateZona(editing, inscripcionId, form.nombre.trim(), cupoTotal)
    resetForm()
    toast.success('Zona actualizada')
  }

  function handleDelete(id: string) {
    deleteZona(id, inscripcionId)
    toast.success('Zona eliminada')
  }

  function startEdit(zona: ZonaEntity) {
    setEditing(zona.id)
    setForm({ nombre: zona.nombre, cupoTotal: String(zona.cupoTotal) })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-card-foreground">{editing ? 'Editar Zona' : 'Nueva Zona'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Zona Norte" />
          </div>
          <div>
            <Label>Cupo Total</Label>
            <Input type="number" min={1} value={form.cupoTotal} onChange={e => setForm(f => ({ ...f, cupoTotal: e.target.value }))} placeholder="0" />
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleSaveEdit}><Check className="mr-1 h-4 w-4" />Guardar</Button>
              <Button variant="outline" onClick={resetForm}><X className="mr-1 h-4 w-4" />Cancelar</Button>
            </>
          ) : (
            <Button onClick={handleAdd}><Plus className="mr-1 h-4 w-4" />Agregar Zona</Button>
          )}
        </div>
      </div>

      {zonas.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Nombre</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Cupo Total</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map(zona => (
                <tr key={zona.id} className="border-t">
                  <td className="p-3 font-medium">{zona.nombre}</td>
                  <td className="p-3 text-center">{zona.cupoTotal}</td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(zona)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(zona.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {zonas.length === 0 && (
        <p className="text-muted-foreground text-center py-6">No hay zonas creadas. Agrega la primera zona arriba.</p>
      )}
    </div>
  )
}
