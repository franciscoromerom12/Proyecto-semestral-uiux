'use client'

import { useState } from 'react'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { ConfigAutomatizacionEntity } from '@/lib/domain/automatizacion/types'
import { AutomatizacionSheet } from './AutomatizacionSheet'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
  voluntarios: VoluntarioEntity[]
}

export function AutomatizacionButton({ inscripcionId, atributos, voluntarios }: Props) {
  const [open, setOpen] = useState(false)
  const { configAutomatizacion } = useMockStore()
  const config = configAutomatizacion[inscripcionId] ?? null
  const [localConfig, setLocalConfig] = useState<ConfigAutomatizacionEntity | null>(config)

  const tieneConfigActiva = localConfig !== null && localConfig.pasosPorVoluntario.length > 0

  function handleConfigCambio(nuevaConfig: ConfigAutomatizacionEntity | null) {
    setLocalConfig(nuevaConfig)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Bot className="h-4 w-4" />
          Automatizar
          {tieneConfigActiva && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Automatizar inscripción</SheetTitle>
          <SheetDescription>
            Define los pasos que el sistema ejecutará automáticamente para registrar cada voluntario asignado en el sitio externo.
          </SheetDescription>
        </SheetHeader>

        <AutomatizacionSheet
          inscripcionId={inscripcionId}
          atributos={atributos}
          voluntarios={voluntarios}
          config={localConfig}
          onConfigCambio={handleConfigCambio}
        />
      </SheetContent>
    </Sheet>
  )
}
