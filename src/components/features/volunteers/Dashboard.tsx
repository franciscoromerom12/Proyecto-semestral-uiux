'use client'

import { useMemo } from 'react'
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import { construirMapaColumnas, esPUC, esHombre } from '@/lib/domain/asignacion/algorithm'
import { META_PCT_UC, META_PCT_MUJERES } from '@/lib/domain/asignacion/algorithm-meta'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
}

interface StatsGrupo {
  hombres: number
  mujeres: number
  hombresUC: number
  hombresNoUC: number
  mujeresUC: number
  mujeresNoUC: number
}

function calcularStatsGrupo(lista: VoluntarioEntity[], colSexo: string, colUniversidad: string): StatsGrupo {
  let hombres = 0, mujeres = 0, hombresUC = 0, hombresNoUC = 0, mujeresUC = 0, mujeresNoUC = 0
  for (const v of lista) {
    const h = esHombre(v.datos[colSexo] ?? '')
    const p = esPUC(v.datos[colUniversidad] ?? '')
    if (h) hombres++; else mujeres++
    if (h && p) hombresUC++
    else if (h) hombresNoUC++
    else if (p) mujeresUC++
    else mujeresNoUC++
  }
  return { hombres, mujeres, hombresUC, hombresNoUC, mujeresUC, mujeresNoUC }
}

function pct(parte: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((parte / total) * 100)}%`
}

function FilaStat({ label, valor, base }: { label: string; valor: number; base: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold tabular-nums text-card-foreground">{valor}</span>
        <span className="text-xs text-muted-foreground w-9 text-right tabular-nums">{pct(valor, base)}</span>
      </div>
    </div>
  )
}

function TarjetaStats({ titulo, stats, base }: { titulo: string; stats: StatsGrupo; base: number }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="font-semibold text-card-foreground mb-1">{titulo}</h3>
      <p className="text-xs text-muted-foreground mb-4">% sobre el total del grupo</p>
      <div className="space-y-0 divide-y divide-border/50">
        <FilaStat label="Hombres" valor={stats.hombres} base={base} />
        <FilaStat label="Mujeres" valor={stats.mujeres} base={base} />
        <FilaStat label="Hombres UC" valor={stats.hombresUC} base={base} />
        <FilaStat label="Hombres No UC" valor={stats.hombresNoUC} base={base} />
        <FilaStat label="Mujeres UC" valor={stats.mujeresUC} base={base} />
        <FilaStat label="Mujeres No UC" valor={stats.mujeresNoUC} base={base} />
      </div>
    </div>
  )
}

interface StatsZona {
  hombresUC: number
  hombresNoUC: number
  mujeresUC: number
  mujeresNoUC: number
}

function calcularStatsZona(
  voluntarios: VoluntarioEntity[],
  zonaId: string,
  colSexo: string | undefined,
  colUniversidad: string | undefined,
): StatsZona | null {
  if (!colSexo || !colUniversidad) return null
  const asignados = voluntarios.filter(v => v.zonaId === zonaId && v.estado === 'asignado')
  if (asignados.length === 0) return null

  let hombresUC = 0, hombresNoUC = 0, mujeresUC = 0, mujeresNoUC = 0
  for (const v of asignados) {
    const hombre = esHombre(v.datos[colSexo] ?? '')
    const uc = esPUC(v.datos[colUniversidad] ?? '')
    if (hombre && uc) hombresUC++
    else if (hombre) hombresNoUC++
    else if (uc) mujeresUC++
    else mujeresNoUC++
  }
  return { hombresUC, hombresNoUC, mujeresUC, mujeresNoUC }
}

interface VacantesMeta { hUC: number; mUC: number; hNoUC: number; mNoUC: number }

function calcularVacantesMeta(cupoTotal: number, stats: StatsZona): VacantesMeta {
  const targetHUC = Math.round(cupoTotal * (1 - META_PCT_MUJERES) * META_PCT_UC)
  const targetMUC = Math.round(cupoTotal * META_PCT_MUJERES * META_PCT_UC)
  const targetHNoUC = Math.round(cupoTotal * (1 - META_PCT_MUJERES) * (1 - META_PCT_UC))
  const targetMNoUC = Math.round(cupoTotal * META_PCT_MUJERES * (1 - META_PCT_UC))
  return {
    hUC: Math.max(0, targetHUC - stats.hombresUC),
    mUC: Math.max(0, targetMUC - stats.mujeresUC),
    hNoUC: Math.max(0, targetHNoUC - stats.hombresNoUC),
    mNoUC: Math.max(0, targetMNoUC - stats.mujeresNoUC),
  }
}

export function Dashboard({ inscripcionId, atributos }: Props) {
  const { voluntarios: volsMap, zonas: zonasMap } = useMockStore()
  const voluntarios = volsMap[inscripcionId] ?? []
  const zonas = zonasMap[inscripcionId] ?? []

  const mapa = useMemo(() => construirMapaColumnas(atributos), [atributos])
  const colSexo = mapa.sexo
  const colUniversidad = mapa.universidad

  const total = voluntarios.length
  const asignadosLista = useMemo(() => voluntarios.filter(v => v.estado === 'asignado'), [voluntarios])
  const asignados = asignadosLista.length
  const enEspera = voluntarios.filter(v => v.estado === 'lista_espera').length
  const noAsignados = voluntarios.filter(v => v.estado === 'no_asignado').length

  const statsTotal = useMemo(
    () => (colSexo && colUniversidad && total > 0) ? calcularStatsGrupo(voluntarios, colSexo, colUniversidad) : null,
    [voluntarios, colSexo, colUniversidad, total],
  )
  const statsAsignados = useMemo(
    () => (colSexo && colUniversidad && asignados > 0) ? calcularStatsGrupo(asignadosLista, colSexo, colUniversidad) : null,
    [asignadosLista, colSexo, colUniversidad, asignados],
  )

  const stats = [
    { label: 'Total Voluntarios', value: total, icon: Users, color: 'text-primary' },
    { label: 'Asignados', value: asignados, icon: CheckCircle, color: 'text-status-assigned' },
    { label: 'En Espera', value: enEspera, icon: Clock, color: 'text-status-waiting' },
    { label: 'No Asignados', value: noAsignados, icon: AlertCircle, color: 'text-status-unassigned' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <p className={`mt-2 text-3xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {(statsTotal || statsAsignados) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {statsTotal && <TarjetaStats titulo={`Total de Voluntarios (${total})`} stats={statsTotal} base={total} />}
          {statsAsignados && <TarjetaStats titulo={`Asignados (${asignados})`} stats={statsAsignados} base={asignados} />}
        </div>
      )}

      {zonas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonas.map(zona => {
            const asignadosZona = voluntarios.filter(v => v.zonaId === zona.id && v.estado === 'asignado').length
            const ocupacionPct = zona.cupoTotal > 0 ? Math.round((asignadosZona / zona.cupoTotal) * 100) : 0
            const statsZona = calcularStatsZona(voluntarios, zona.id, colSexo, colUniversidad)
            const totalZona = statsZona
              ? statsZona.hombresUC + statsZona.hombresNoUC + statsZona.mujeresUC + statsZona.mujeresNoUC
              : asignadosZona
            const totalUC = statsZona ? statsZona.hombresUC + statsZona.mujeresUC : 0
            const totalNoUC = statsZona ? statsZona.hombresNoUC + statsZona.mujeresNoUC : 0
            const totalHombres = statsZona ? statsZona.hombresUC + statsZona.hombresNoUC : 0
            const totalMujeres = statsZona ? statsZona.mujeresUC + statsZona.mujeresNoUC : 0

            return (
              <div key={zona.id} className="rounded-lg border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-card-foreground">{zona.nombre}</h3>
                <div className="w-full rounded-full h-2 bg-secondary">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min(ocupacionPct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{asignadosZona} / {zona.cupoTotal} cupos</span>
                  <span>{ocupacionPct}%</span>
                </div>

                {statsZona && totalZona > 0 && (
                  <div className="pt-2 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-muted/50 p-2 space-y-0.5">
                        <p className="text-muted-foreground font-medium">UC</p>
                        <p className="font-semibold text-card-foreground">{totalUC} <span className="text-muted-foreground font-normal">({pct(totalUC, totalZona)})</span></p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2 space-y-0.5">
                        <p className="text-muted-foreground font-medium">No UC</p>
                        <p className="font-semibold text-card-foreground">{totalNoUC} <span className="text-muted-foreground font-normal">({pct(totalNoUC, totalZona)})</span></p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2 space-y-0.5">
                        <p className="text-muted-foreground font-medium">Hombres</p>
                        <p className="font-semibold text-card-foreground">{totalHombres} <span className="text-muted-foreground font-normal">({pct(totalHombres, totalZona)})</span></p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2 space-y-0.5">
                        <p className="text-muted-foreground font-medium">Mujeres</p>
                        <p className="font-semibold text-card-foreground">{totalMujeres} <span className="text-muted-foreground font-normal">({pct(totalMujeres, totalZona)})</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5">
                        <span className="text-muted-foreground">H UC</span>
                        <span className="font-semibold">{statsZona.hombresUC} <span className="text-muted-foreground font-normal">({pct(statsZona.hombresUC, totalZona)})</span></span>
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5">
                        <span className="text-muted-foreground">H No UC</span>
                        <span className="font-semibold">{statsZona.hombresNoUC} <span className="text-muted-foreground font-normal">({pct(statsZona.hombresNoUC, totalZona)})</span></span>
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5">
                        <span className="text-muted-foreground">M UC</span>
                        <span className="font-semibold">{statsZona.mujeresUC} <span className="text-muted-foreground font-normal">({pct(statsZona.mujeresUC, totalZona)})</span></span>
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5">
                        <span className="text-muted-foreground">M No UC</span>
                        <span className="font-semibold">{statsZona.mujeresNoUC} <span className="text-muted-foreground font-normal">({pct(statsZona.mujeresNoUC, totalZona)})</span></span>
                      </div>
                    </div>

                    {(() => {
                      const vacantes = calcularVacantesMeta(zona.cupoTotal, statsZona)
                      const totalVacantes = vacantes.hUC + vacantes.mUC + vacantes.hNoUC + vacantes.mNoUC
                      if (totalVacantes === 0) return null
                      return (
                        <div className="pt-2 border-t space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">Vacantes para meta ({totalVacantes})</p>
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            {vacantes.hUC > 0 && (
                              <div className="flex items-center justify-between rounded-md bg-amber-500/10 px-2 py-1.5">
                                <span className="text-muted-foreground">H UC</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">{vacantes.hUC}</span>
                              </div>
                            )}
                            {vacantes.mUC > 0 && (
                              <div className="flex items-center justify-between rounded-md bg-amber-500/10 px-2 py-1.5">
                                <span className="text-muted-foreground">M UC</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">{vacantes.mUC}</span>
                              </div>
                            )}
                            {vacantes.hNoUC > 0 && (
                              <div className="flex items-center justify-between rounded-md bg-amber-500/10 px-2 py-1.5">
                                <span className="text-muted-foreground">H No UC</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">{vacantes.hNoUC}</span>
                              </div>
                            )}
                            {vacantes.mNoUC > 0 && (
                              <div className="flex items-center justify-between rounded-md bg-amber-500/10 px-2 py-1.5">
                                <span className="text-muted-foreground">M No UC</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">{vacantes.mNoUC}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
