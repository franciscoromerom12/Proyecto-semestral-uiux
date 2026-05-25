'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AtributosBuilder, type AtributoRow } from './AtributosBuilder'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateInscripcionModal({ open, onOpenChange }: Props) {
  const router = useRouter()
  const { createInscripcion } = useMockStore()
  const [titulo, setTitulo] = useState('')
  const [atributos, setAtributos] = useState<AtributoRow[]>([])
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!titulo.trim()) { setError('El nombre de la inscripción es requerido.'); return }
    if (atributos.length === 0) { setError('Agrega al menos un atributo.'); return }
    if (atributos.some((a) => !a.nombre.trim())) { setError('Todos los atributos deben tener un nombre.'); return }

    const ins = createInscripcion(titulo.trim(), atributos)
    onOpenChange(false)
    router.push(`/inscripciones/${ins.id}`)
  }

  function handleOpenChange(next: boolean) {
    if (!next) { setTitulo(''); setAtributos([]); setError(null) }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nueva inscripción</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Nombre</Label>
            <Input id="titulo" placeholder="Ej: Misión de Vida 2026" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Atributos de voluntarios</Label>
            <AtributosBuilder value={atributos} onChange={setAtributos} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Crear inscripción</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
