'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { CalendarDays, Plus, FolderOpen, Trash2, ArrowLeft } from 'lucide-react'
import { CreateInscripcionModal } from './CreateInscripcionModal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useMockStore } from '@/components/providers/MockStoreProvider'

export function InscripcionesPanel() {
  const { inscripciones, deleteInscripcion } = useMockStore()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function handleDelete(id: string) {
    deleteInscripcion(id)
    setConfirmDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Mis Inscripciones</h1>
            <p className="text-sm text-muted-foreground">Procesos de asignación de voluntarios</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => setModalOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nueva inscripción
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {inscripciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
            <div className="space-y-1">
              <p className="text-lg font-medium text-foreground">No tienes inscripciones aún</p>
              <p className="text-sm text-muted-foreground">Crea tu primer proceso de asignación de voluntarios.</p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="gap-1.5 mt-2">
              <Plus className="h-4 w-4" />Crear tu primera inscripción
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inscripciones.map((ins) => (
              <Card key={ins.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{ins.titulo}</CardTitle>
                  {ins.descripcion && <CardDescription>{ins.descripcion}</CardDescription>}
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(ins.createdAt).toLocaleDateString('es-CL')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => setConfirmDeleteId(ins.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/inscripciones/${ins.id}`)}>
                      Abrir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CreateInscripcionModal open={modalOpen} onOpenChange={setModalOpen} />

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar inscripción?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción es irreversible. Se eliminarán permanentemente la inscripción y todos sus datos asociados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
