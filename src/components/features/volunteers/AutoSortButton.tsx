'use client'

import { Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  onComplete: () => void
}

export function AutoSortButton({ inscripcionId, onComplete }: Props) {
  const { autoSort } = useMockStore()

  function handleConfirm() {
    const result = autoSort(inscripcionId)
    toast.success(
      `Ordenamiento completado: ${result.totalAsignados} asignados, ${result.totalListaEspera} en lista de espera, ${result.totalFiltrados} filtrados`,
    )
    onComplete()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Ordenar automáticamente
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Ejecutar ordenamiento automático?</AlertDialogTitle>
          <AlertDialogDescription>
            El algoritmo asignará todos los voluntarios a zonas según sus preferencias, género, universidad y orden de llegada.
            <br /><br />
            <strong>Esta acción reemplazará cualquier asignación manual previa.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Ejecutar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
