'use client'

import { useState, useMemo } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { ConfigAutomatizacionEntity } from '@/lib/domain/automatizacion/types'
import { VoluntarioProgresoItem } from './VoluntarioProgresoItem'
import type { ProgresoVoluntario } from './types'

interface Props {
  inscripcionId: string
  config: ConfigAutomatizacionEntity
  voluntariosAsignados: VoluntarioEntity[]
}

export function EjecucionPanel({ config, voluntariosAsignados }: Props) {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [ejecutando, setEjecutando] = useState(false)
  const [progreso, setProgreso] = useState<ProgresoVoluntario[]>([])
  const [resumenFinal, setResumenFinal] = useState<{ totalExito: number; totalError: number } | null>(null)

  const necesitaCredenciales = useMemo(() => {
    const todos = [...config.pasosInicio, ...config.pasosPorVoluntario]
    return todos.some(
      p => 'fuente' in p && (p.fuente === 'credencial_usuario' || p.fuente === 'credencial_contrasena'),
    )
  }, [config])

  async function iniciarEjecucion() {
    if (necesitaCredenciales && (!usuario || !contrasena)) {
      toast.error('Ingresa usuario y contraseña para continuar')
      return
    }

    setEjecutando(true)
    setProgreso([])
    setResumenFinal(null)

    // Simulate processing each volunteer one by one
    const nombreAtributo = 'Nombre Completo'
    const procesados: ProgresoVoluntario[] = []

    for (const v of voluntariosAsignados) {
      const nombre = (v.datos[nombreAtributo] as string) ?? v.datos[Object.keys(v.datos)[0]] as string ?? v.id

      setProgreso(prev => [...prev, { voluntarioId: v.id, nombre, estado: 'procesando' }])
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300))

      const exito = Math.random() > 0.1
      const item: ProgresoVoluntario = {
        voluntarioId: v.id,
        nombre,
        estado: exito ? 'exito' : 'error',
        error: exito ? undefined : 'Timeout al hacer click en el selector #btn-guardar',
      }
      procesados.push(item)
      setProgreso(prev => prev.map(p => p.voluntarioId === v.id ? item : p))
    }

    const totalExito = procesados.filter(p => p.estado === 'exito').length
    const totalError = procesados.filter(p => p.estado === 'error').length
    setResumenFinal({ totalExito, totalError })
    setEjecutando(false)

    if (totalError === 0) {
      toast.success(`Automatización completada: ${totalExito} voluntarios procesados.`)
    } else {
      toast.error(`Completado con errores: ${totalExito} exitosos, ${totalError} con error.`)
    }
  }

  return (
    <div className="space-y-6">
      {necesitaCredenciales && (
        <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
          <div>
            <p className="text-sm font-medium">Credenciales del sitio externo</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No se guardan — solo se usan durante la ejecución.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="auto-usuario" className="text-xs">Usuario</Label>
              <Input
                id="auto-usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                disabled={ejecutando}
                placeholder="tu@email.cl"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="auto-contrasena" className="text-xs">Contraseña</Label>
              <Input
                id="auto-contrasena"
                type="password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                disabled={ejecutando}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {voluntariosAsignados.length} voluntarios asignados serán procesados
        </p>
        <Button onClick={iniciarEjecucion} disabled={ejecutando || voluntariosAsignados.length === 0} className="gap-2">
          {ejecutando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {ejecutando ? 'Ejecutando...' : 'Iniciar automatización'}
        </Button>
      </div>

      {progreso.length > 0 && (
        <>
          <Separator />
          <div className="space-y-1">
            {resumenFinal && (
              <div className="flex gap-4 text-sm mb-3 px-2">
                <span className="text-green-600 font-medium">{resumenFinal.totalExito} exitosos</span>
                {resumenFinal.totalError > 0 && (
                  <span className="text-destructive font-medium">{resumenFinal.totalError} con error</span>
                )}
              </div>
            )}
            {progreso.map(p => (
              <VoluntarioProgresoItem key={p.voluntarioId} progreso={p} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
