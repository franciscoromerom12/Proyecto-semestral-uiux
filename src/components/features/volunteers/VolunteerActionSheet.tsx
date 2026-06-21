'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, Loader2, Lightbulb, Star, ArrowRight } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import { construirMapaColumnas } from '@/lib/domain/asignacion/algorithm'
import {
  categoriaDeVoluntario,
  calcularOcupacionPorZona,
  recomendarZonaConMotivo,
  CATEGORIA_LABELS,
} from '@/lib/domain/asignacion/algorithm-meta'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  voluntario: VoluntarioEntity | null
  zonas: ZonaEntity[]
  voluntarios: VoluntarioEntity[]
  atributos?: AtributoEntity[]
  nombreAtributo: string | undefined
  inscripcionId: string
  onClose: () => void
  onSuccess: () => void
}

type Vista = 'acciones' | 'selector_zona'

export function VolunteerActionSheet({ voluntario, zonas, voluntarios, atributos = [], nombreAtributo, inscripcionId, onClose, onSuccess }: Props) {
  const [vista, setVista] = useState<Vista>('acciones')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { updateVoluntarioZona, moverAListaEspera, toggleMiembroEquipo } = useMockStore()

  const open = voluntario !== null

  const mapa = useMemo(() => construirMapaColumnas(atributos), [atributos])

  // Recomendación de zona según escasez de la categoría del voluntario.
  const recomendacion = useMemo(() => {
    if (!voluntario || !mapa.sexo || !mapa.universidad || zonas.length === 0) return null
    const categoria = categoriaDeVoluntario(voluntario.datos, mapa.sexo, mapa.universidad)
    const ocupacion = calcularOcupacionPorZona(voluntarios, mapa.sexo, mapa.universidad)
    const rec = recomendarZonaConMotivo(categoria, zonas, ocupacion)
    if (!rec) return null
    return { ...rec, categoria }
  }, [voluntario, voluntarios, zonas, mapa.sexo, mapa.universidad])

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) { setVista('acciones'); onClose() }
  }

  function contarAsignadosEnZona(zonaId: string) {
    return voluntarios.filter(v => v.zonaId === zonaId && v.estado === 'asignado').length
  }

  function handleMoverAListaEspera() {
    if (!voluntario) return
    setLoading(true)
    setTimeout(() => {
      moverAListaEspera(voluntario.id, inscripcionId)
      toast({ title: 'Listo', description: 'Voluntario movido a lista de espera' })
      setVista('acciones')
      setLoading(false)
      onSuccess()
    }, 300)
  }

  function handleAsignarAZona(zonaId: string) {
    if (!voluntario) return
    setLoading(true)
    setTimeout(() => {
      updateVoluntarioZona(voluntario.id, inscripcionId, zonaId)
      toast({ title: 'Asignado', description: 'Voluntario asignado correctamente' })
      setVista('acciones')
      setLoading(false)
      onSuccess()
    }, 300)
  }

  function handleToggleEquipo() {
    if (!voluntario) return
    const eraEquipo = voluntario.esMiembroEquipo
    toggleMiembroEquipo(voluntario.id, inscripcionId)
    toast({
      title: eraEquipo ? 'Quitado del equipo' : 'Miembro de equipo',
      description: eraEquipo
        ? 'El voluntario ya no es miembro de equipo.'
        : 'Ahora aparece primero en su zona con la etiqueta Equipo.',
    })
    onSuccess()
  }

  const nombreVoluntario = voluntario && nombreAtributo
    ? (voluntario.datos[nombreAtributo] ?? '—')
    : (voluntario?.id ?? '—')

  const zonaActualNombre = voluntario?.zonaId
    ? (zonas.find(z => z.id === voluntario.zonaId)?.nombre ?? '—')
    : null

  const recEsZonaActual = recomendacion && voluntario?.zonaId === recomendacion.zonaId

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          {vista === 'selector_zona' && (
            <Button variant="ghost" size="sm" className="w-fit -ml-2 mb-1 text-muted-foreground" onClick={() => setVista('acciones')}>
              <ChevronLeft className="h-4 w-4 mr-1" />Volver
            </Button>
          )}
          <SheetTitle className="text-base font-semibold truncate">{nombreVoluntario}</SheetTitle>
          {voluntario && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <EstadoBadge estado={voluntario.estado} />
              {voluntario.esMiembroEquipo && (
                <Badge className="bg-primary/15 text-primary border-0 gap-1">
                  <Star className="h-3 w-3 fill-primary" />Equipo
                </Badge>
              )}
              {zonaActualNombre && <span className="text-sm text-muted-foreground">· {zonaActualNombre}</span>}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {vista === 'acciones' && voluntario && (
            <div className="flex flex-col gap-3">
              {recomendacion && !recEsZonaActual && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1.5">
                    <Lightbulb className="h-4 w-4" />
                    Recomendación
                  </div>
                  <p className="text-sm text-card-foreground">
                    Enviar a <span className="font-semibold">{recomendacion.nombre}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{recomendacion.motivo}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{CATEGORIA_LABELS[recomendacion.categoria]}</Badge>
                    <Badge variant="outline" className="text-xs">{recomendacion.cupoLibre} cupos libres</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    disabled={loading}
                    onClick={() => handleAsignarAZona(recomendacion.zonaId)}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                    Asignar a {recomendacion.nombre}
                  </Button>
                </div>
              )}

              <Button variant="outline" className="w-full justify-start" disabled={loading} onClick={() => setVista('selector_zona')}>
                Asignar a otra zona
              </Button>

              <Button variant="outline" className="w-full justify-start" disabled={loading} onClick={handleToggleEquipo}>
                <Star className={`h-4 w-4 mr-2 ${voluntario.esMiembroEquipo ? 'fill-primary text-primary' : ''}`} />
                {voluntario.esMiembroEquipo ? 'Quitar de equipo' : 'Hacer miembro de equipo'}
              </Button>

              {voluntario.estado !== 'lista_espera' && (
                <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50" disabled={loading} onClick={handleMoverAListaEspera}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Mover a lista de espera
                </Button>
              )}
            </div>
          )}

          {vista === 'selector_zona' && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground mb-2">Selecciona la zona de destino. Las zonas llenas no están disponibles.</p>
              {zonas.map(zona => {
                const ocupados = contarAsignadosEnZona(zona.id)
                const llena = ocupados >= zona.cupoTotal
                const esActual = voluntario?.zonaId === zona.id
                const esRecomendada = recomendacion?.zonaId === zona.id
                return (
                  <button
                    key={zona.id}
                    disabled={llena || loading || esActual}
                    onClick={() => handleAsignarAZona(zona.id)}
                    className={['w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm text-left transition-colors', llena || esActual ? 'opacity-50 cursor-not-allowed bg-muted' : 'hover:bg-muted/50 cursor-pointer', esRecomendada && !llena && !esActual ? 'border-primary/50 bg-primary/5' : ''].join(' ')}
                  >
                    <span className="font-medium flex items-center gap-2">
                      {zona.nombre}
                      {esActual && <span className="text-xs text-muted-foreground">(actual)</span>}
                      {esRecomendada && !esActual && <Badge className="bg-primary/15 text-primary border-0 text-xs gap-1"><Lightbulb className="h-3 w-3" />Sugerida</Badge>}
                    </span>
                    <Badge variant={llena ? 'destructive' : 'outline'}>{ocupados} / {zona.cupoTotal}</Badge>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    asignado: 'bg-status-assigned-bg text-status-assigned-foreground border-0',
    lista_espera: 'bg-status-waiting-bg text-status-waiting-foreground border-0',
    no_asignado: 'bg-status-unassigned-bg text-status-unassigned-foreground border-0',
  }
  const labels: Record<string, string> = { asignado: 'Asignado', lista_espera: 'En Espera', no_asignado: 'No Asignado' }
  return <Badge className={styles[estado] ?? ''}>{labels[estado] ?? estado}</Badge>
}
