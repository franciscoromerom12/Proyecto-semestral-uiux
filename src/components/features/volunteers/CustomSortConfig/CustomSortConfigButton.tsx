'use client'

import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import { CustomSortConfigForm } from './CustomSortConfigForm'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
}

export function CustomSortConfigButton({ inscripcionId, atributos }: Props) {
  const [open, setOpen] = useState(false)
  const { configOrden } = useMockStore()
  const config = configOrden[inscripcionId] ?? null
  const tieneConfigActiva = config !== null && (config.prioridades.length > 0 || config.filtrosEliminatorios.length > 0)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Settings2 className="h-4 w-4" />
          Personalizar orden
          {tieneConfigActiva && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Personalizar orden automático</SheetTitle>
          <SheetDescription>
            Define criterios de prioridad y filtros eliminatorios. Al ejecutar &ldquo;Ordenar automáticamente&rdquo; se aplicará esta configuración.
          </SheetDescription>
        </SheetHeader>
        <CustomSortConfigForm
          inscripcionId={inscripcionId}
          atributos={atributos}
          configInicial={config}
          onGuardado={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
