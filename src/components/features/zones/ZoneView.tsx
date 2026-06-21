'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Star, Plus, Pencil, MoreVertical, Trash2, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import { VolunteerActionSheet } from '@/components/features/volunteers/VolunteerActionSheet'
import { ExportButton } from '@/components/features/volunteers/ExportButton'
import { useMockStore } from '@/components/providers/MockStoreProvider'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
}

interface FormState { nombre: string; cupoTotal: string }
const emptyForm: FormState = { nombre: '', cupoTotal: '' }

// Color semántico del cupo según qué tan llena está la zona (Cap 2: color con significado)
function cupoBadgeClass(asignados: number, cupo: number): string {
  if (cupo > 0 && asignados >= cupo) {
    return 'bg-status-unassigned-bg text-status-unassigned-foreground border-0' // lleno → no recibe más
  }
  if (cupo > 0 && asignados / cupo >= 0.8) {
    return 'bg-status-waiting-bg text-status-waiting-foreground border-0' // casi lleno
  }
  return '' // disponible → outline neutro
}

export function ZoneView({ inscripcionId, atributos }: Props) {
  const { voluntarios: volsMap, zonas: zonasMap, addZona, updateZona, deleteZona } = useMockStore()
  const voluntarios = volsMap[inscripcionId] ?? []
  const zonas = zonasMap[inscripcionId] ?? []

  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [seleccionado, setSeleccionado] = useState<VoluntarioEntity | null>(null)

  // Crear zona (progressive disclosure: oculto hasta que se necesita)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState<FormState>(emptyForm)

  // Edición inline por zona
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)

  // Confirmación de borrado
  const [zonaAEliminar, setZonaAEliminar] = useState<ZonaEntity | null>(null)

  const nombreAtributo =
    atributos.find(a => a.rolSistema === 'nombre_completo')?.nombre ??
    atributos[0]?.nombre

  function toggleZona(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function validar(form: FormState): number | null {
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return null }
    const cupoTotal = Number(form.cupoTotal)
    if (!cupoTotal || cupoTotal < 1) { toast.error('El cupo debe ser mayor a 0'); return null }
    return cupoTotal
  }

  function handleCreate() {
    const cupoTotal = validar(newForm)
    if (cupoTotal === null) return
    addZona(inscripcionId, newForm.nombre.trim(), cupoTotal)
    setNewForm(emptyForm)
    setShowNewForm(false)
    toast.success('Zona creada')
  }

  function startEdit(zona: ZonaEntity) {
    setEditingId(zona.id)
    setEditForm({ nombre: zona.nombre, cupoTotal: String(zona.cupoTotal) })
  }

  function handleSaveEdit() {
    if (!editingId) return
    const cupoTotal = validar(editForm)
    if (cupoTotal === null) return
    updateZona(editingId, inscripcionId, editForm.nombre.trim(), cupoTotal)
    setEditingId(null)
    toast.success('Zona actualizada')
  }

  function handleConfirmDelete() {
    if (!zonaAEliminar) return
    deleteZona(zonaAEliminar.id, inscripcionId)
    setZonaAEliminar(null)
    toast.success('Zona eliminada')
  }

  const enEspera = voluntarios.filter(v => v.estado === 'lista_espera')
  const totalCupo = zonas.reduce((acc, z) => acc + z.cupoTotal, 0)
  const totalAsignados = voluntarios.filter(v => v.estado === 'asignado').length

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        {/* Header con resumen + acción primaria (Cap 4: jerarquía de acciones) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Zonas</h2>
            <p className="text-sm text-muted-foreground">
              {zonas.length} {zonas.length === 1 ? 'zona' : 'zonas'} · {totalAsignados}/{totalCupo} cupos asignados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton inscripcionId={inscripcionId} />
            <Button onClick={() => setShowNewForm(v => !v)}>
              <Plus className="mr-1 h-4 w-4" />Nueva Zona
            </Button>
          </div>
        </div>

        {/* Form de creación (progressive disclosure, Cap 6) */}
        {showNewForm && (
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="font-semibold text-card-foreground">Nueva Zona</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-nombre">Nombre</Label>
                <Input id="new-nombre" value={newForm.nombre} placeholder="Ej: Zona Norte"
                  onChange={e => setNewForm(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-cupo">Cupo Total</Label>
                <Input id="new-cupo" type="number" min={1} value={newForm.cupoTotal} placeholder="0"
                  onChange={e => setNewForm(f => ({ ...f, cupoTotal: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}><Check className="mr-1 h-4 w-4" />Crear Zona</Button>
              <Button variant="outline" onClick={() => { setShowNewForm(false); setNewForm(emptyForm) }}>
                <X className="mr-1 h-4 w-4" />Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {zonas.length === 0 && !showNewForm && (
          <div className="rounded-lg border border-dashed bg-card text-center py-12 px-4">
            <p className="text-muted-foreground mb-4">Aún no hay zonas creadas.</p>
            <Button onClick={() => setShowNewForm(true)}><Plus className="mr-1 h-4 w-4" />Crea tu primera zona</Button>
          </div>
        )}

        {/* Cards de zona (todo lo de la zona junto, Cap 4: proximidad) */}
        {zonas.map(zona => {
          const asignados = voluntarios
            .filter(v => v.zonaId === zona.id && v.estado === 'asignado')
            .sort((a, b) => Number(b.esMiembroEquipo ?? false) - Number(a.esMiembroEquipo ?? false))
          const isOpen = openIds.has(zona.id)
          const isEditing = editingId === zona.id

          return (
            <Collapsible key={zona.id} open={isOpen} onOpenChange={() => !isEditing && toggleZona(zona.id)}>
              <div className="rounded-lg border bg-card overflow-hidden">
                {isEditing ? (
                  /* Edición inline en la misma card (Cap 4: acción junto al dato) */
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`edit-nombre-${zona.id}`}>Nombre</Label>
                        <Input id={`edit-nombre-${zona.id}`} value={editForm.nombre}
                          onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`edit-cupo-${zona.id}`}>Cupo Total</Label>
                        <Input id={`edit-cupo-${zona.id}`} type="number" min={1} value={editForm.cupoTotal}
                          onChange={e => setEditForm(f => ({ ...f, cupoTotal: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}><Check className="mr-1 h-4 w-4" />Guardar</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="mr-1 h-4 w-4" />Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-3">
                    <CollapsibleTrigger className="flex flex-1 items-center gap-3 text-left hover:opacity-80 transition-opacity">
                      {isOpen
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      }
                      <span className="flex-1 font-semibold text-base">{zona.nombre}</span>
                      <Badge variant="outline" className={cn(cupoBadgeClass(asignados.length, zona.cupoTotal))}>
                        {asignados.length} / {zona.cupoTotal}
                      </Badge>
                    </CollapsibleTrigger>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Editar ${zona.nombre}`}
                          onClick={() => startEdit(zona)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar zona</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Más acciones de ${zona.nombre}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:text-destructive"
                          onClick={() => setZonaAEliminar(zona)}>
                          <Trash2 className="mr-2 h-4 w-4" />Eliminar zona
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                <CollapsibleContent>
                  {asignados.length > 0 ? (
                    <ul className="border-t divide-y">
                      {asignados.map(v => (
                        <li key={v.id}
                          className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted/50 cursor-pointer"
                          onClick={() => setSeleccionado(v)}>
                          <span className="flex-1">
                            {nombreAtributo ? (v.datos[nombreAtributo] ?? '—') : v.id}
                          </span>
                          {v.esMiembroEquipo && (
                            <Badge className="bg-primary/15 text-primary border-0 gap-1 text-xs">
                              <Star className="h-3 w-3 fill-primary" />Equipo
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-4 text-sm text-muted-foreground border-t">Sin voluntarios asignados</p>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )
        })}

        {/* Lista de espera */}
        {enEspera.length > 0 && (
          <div className="rounded-lg border bg-card overflow-hidden mt-6">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-base">Lista de espera</h3>
              <Badge variant="outline">{enEspera.length}</Badge>
            </div>
            <ul className="divide-y">
              {enEspera.map(v => (
                <li key={v.id}
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSeleccionado(v)}>
                  <span className="flex-1">
                    {nombreAtributo ? (v.datos[nombreAtributo] ?? '—') : v.id}
                  </span>
                  <Badge className="bg-status-waiting-bg text-status-waiting-foreground border-0">En Espera</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        <VolunteerActionSheet
          inscripcionId={inscripcionId}
          voluntario={seleccionado}
          zonas={zonas}
          voluntarios={voluntarios}
          atributos={atributos}
          nombreAtributo={nombreAtributo}
          onClose={() => setSeleccionado(null)}
          onSuccess={() => setSeleccionado(null)}
        />

        {/* Confirmación de borrado (Cap 6: modal justificado para acción irreversible) */}
        <AlertDialog open={zonaAEliminar !== null} onOpenChange={open => !open && setZonaAEliminar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar la zona «{zonaAEliminar?.nombre}»?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Los voluntarios asignados a esta zona quedarán sin zona.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleConfirmDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
