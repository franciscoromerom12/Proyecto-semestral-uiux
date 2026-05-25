'use client'

import { useState } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  onComplete: () => void
}

export function AutoSortButton({ inscripcionId, onComplete }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const { autoSort } = useMockStore()

  function handleConfirm() {
    setIsRunning(true)
    setTimeout(() => {
      const result = autoSort(inscripcionId)
      toast.success(
        `Ordenamiento completado: ${result.totalAsignados} asignados, ${result.totalListaEspera} en lista de espera, ${result.totalFiltrados} filtrados`,
      )
      setIsRunning(false)
      onComplete()
    }, 800)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isRunning} className="gap-2">
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
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
