'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { ConfigAutomatizacionEntity } from '@/lib/domain/automatizacion/types'
import { ConfigAutomatizacionForm } from './ConfigAutomatizacionForm'
import { EjecucionPanel } from './EjecucionPanel'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
  voluntarios: VoluntarioEntity[]
  config: ConfigAutomatizacionEntity | null
  onConfigCambio: (config: ConfigAutomatizacionEntity | null) => void
}

export function AutomatizacionSheet({ inscripcionId, atributos, voluntarios, config, onConfigCambio }: Props) {
  const tieneConfig = config !== null && config.pasosPorVoluntario.length > 0
  const voluntariosAsignados = voluntarios.filter(v => v.estado === 'asignado')

  return (
    <Tabs defaultValue="configurar">
      <TabsList className="mb-6">
        <TabsTrigger value="configurar">Configurar</TabsTrigger>
        <TabsTrigger value="ejecutar" disabled={!tieneConfig}>
          Ejecutar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="configurar">
        <ConfigAutomatizacionForm
          inscripcionId={inscripcionId}
          atributos={atributos}
          configInicial={config}
          onGuardado={onConfigCambio}
        />
      </TabsContent>

      <TabsContent value="ejecutar">
        {tieneConfig && (
          <EjecucionPanel
            inscripcionId={inscripcionId}
            config={config}
            voluntariosAsignados={voluntariosAsignados}
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
