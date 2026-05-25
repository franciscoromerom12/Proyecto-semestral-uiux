'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2, ChevronDown } from 'lucide-react'
import type { ProgresoVoluntario } from './types'

interface Props {
  progreso: ProgresoVoluntario
}

export function VoluntarioProgresoItem({ progreso }: Props) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-muted/30">
      <div className="pt-0.5 shrink-0">
        {progreso.estado === 'procesando' && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {progreso.estado === 'exito' && (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        )}
        {progreso.estado === 'error' && (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{progreso.nombre}</p>
        {progreso.estado === 'error' && progreso.error && (
          <div className="mt-0.5">
            <button
              type="button"
              onClick={() => setExpandido(!expandido)}
              className="flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${expandido ? 'rotate-180' : ''}`} />
              Ver error
            </button>
            {expandido && (
              <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-2 rounded break-all">
                {progreso.error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
