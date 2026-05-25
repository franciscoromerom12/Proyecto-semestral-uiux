'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import type { InscripcionEntity } from '@/lib/domain/inscripciones/types'
import type { AtributoEntity, AtributoTipo } from '@/lib/domain/atributos/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { ConfigOrdenEntity, CriterioOrden, FiltroEliminatorio } from '@/lib/domain/config-orden/types'
import type { ConfigAutomatizacionEntity, PasoAutomatizacion } from '@/lib/domain/automatizacion/types'
import {
  INSCRIPCIONES_INICIALES,
  ATRIBUTOS_INICIALES,
  ZONAS_INICIALES,
  buildVoluntariosIniciales,
  CONFIG_ORDEN_INICIALES,
} from '@/lib/mock-data'
import {
  ejecutarAsignacionAutomatica,
  ejecutarAsignacionPersonalizada,
} from '@/lib/domain/asignacion/algorithm'

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

interface MockStore {
  // Data
  inscripciones: InscripcionEntity[]
  atributos: Record<string, AtributoEntity[]>
  zonas: Record<string, ZonaEntity[]>
  voluntarios: Record<string, VoluntarioEntity[]>
  configOrden: Record<string, ConfigOrdenEntity | null>
  configAutomatizacion: Record<string, ConfigAutomatizacionEntity | null>

  // Inscripciones
  createInscripcion: (titulo: string, atributosInput: { nombre: string; tipo: AtributoTipo; requerido: boolean }[]) => InscripcionEntity
  deleteInscripcion: (id: string) => void

  // Zonas
  addZona: (inscripcionId: string, nombre: string, cupoTotal: number) => ZonaEntity
  updateZona: (id: string, inscripcionId: string, nombre: string, cupoTotal: number) => void
  deleteZona: (id: string, inscripcionId: string) => void

  // Voluntarios
  importarVoluntarios: (inscripcionId: string, rows: Record<string, string>[]) => number
  addVoluntario: (inscripcionId: string, datos: Record<string, string>) => void
  updateVoluntarioZona: (voluntarioId: string, inscripcionId: string, zonaId: string) => void
  moverAListaEspera: (voluntarioId: string, inscripcionId: string) => void
  autoSort: (inscripcionId: string) => { totalAsignados: number; totalListaEspera: number; totalFiltrados: number }

  // Config orden
  saveConfigOrden: (inscripcionId: string, prioridades: CriterioOrden[], filtros: FiltroEliminatorio[]) => void

  // Config automatizacion
  saveConfigAutomatizacion: (inscripcionId: string, pasosInicio: PasoAutomatizacion[], pasosPorVoluntario: PasoAutomatizacion[]) => void
}

const MockStoreContext = createContext<MockStore | null>(null)

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [inscripciones, setInscripciones] = useState<InscripcionEntity[]>(INSCRIPCIONES_INICIALES)
  const [atributos, setAtributos] = useState<Record<string, AtributoEntity[]>>(ATRIBUTOS_INICIALES)
  const [zonas, setZonas] = useState<Record<string, ZonaEntity[]>>(ZONAS_INICIALES)
  const [voluntarios, setVoluntarios] = useState<Record<string, VoluntarioEntity[]>>(buildVoluntariosIniciales)
  const [configOrden, setConfigOrden] = useState<Record<string, ConfigOrdenEntity | null>>(CONFIG_ORDEN_INICIALES)
  const [configAutomatizacion, setConfigAutomatizacion] = useState<Record<string, ConfigAutomatizacionEntity | null>>({})

  const createInscripcion = useCallback((titulo: string, atributosInput: { nombre: string; tipo: AtributoTipo; requerido: boolean }[]) => {
    const id = uid()
    const now = new Date()
    const ins: InscripcionEntity = { id, usuarioId: 'demo-user', titulo, descripcion: null, createdAt: now, updatedAt: null }
    const attrs: AtributoEntity[] = atributosInput.map((a, i) => ({
      id: uid(), inscripcionId: id, nombre: a.nombre, tipo: a.tipo, requerido: a.requerido,
      orden: i, rolSistema: null, createdAt: now, updatedAt: null,
    }))
    setInscripciones(prev => [...prev, ins])
    setAtributos(prev => ({ ...prev, [id]: attrs }))
    setZonas(prev => ({ ...prev, [id]: [] }))
    setVoluntarios(prev => ({ ...prev, [id]: [] }))
    setConfigOrden(prev => ({ ...prev, [id]: null }))
    return ins
  }, [])

  const deleteInscripcion = useCallback((id: string) => {
    setInscripciones(prev => prev.filter(i => i.id !== id))
    setAtributos(prev => { const n = { ...prev }; delete n[id]; return n })
    setZonas(prev => { const n = { ...prev }; delete n[id]; return n })
    setVoluntarios(prev => { const n = { ...prev }; delete n[id]; return n })
    setConfigOrden(prev => { const n = { ...prev }; delete n[id]; return n })
  }, [])

  const addZona = useCallback((inscripcionId: string, nombre: string, cupoTotal: number) => {
    const zona: ZonaEntity = { id: uid(), inscripcionId, nombre, cupoTotal, createdAt: new Date(), updatedAt: null }
    setZonas(prev => ({ ...prev, [inscripcionId]: [...(prev[inscripcionId] ?? []), zona] }))
    return zona
  }, [])

  const updateZona = useCallback((id: string, inscripcionId: string, nombre: string, cupoTotal: number) => {
    setZonas(prev => ({
      ...prev,
      [inscripcionId]: (prev[inscripcionId] ?? []).map(z => z.id === id ? { ...z, nombre, cupoTotal, updatedAt: new Date() } : z),
    }))
  }, [])

  const deleteZona = useCallback((id: string, inscripcionId: string) => {
    setZonas(prev => ({ ...prev, [inscripcionId]: (prev[inscripcionId] ?? []).filter(z => z.id !== id) }))
    setVoluntarios(prev => ({
      ...prev,
      [inscripcionId]: (prev[inscripcionId] ?? []).map(v =>
        v.zonaId === id ? { ...v, zonaId: null, estado: 'no_asignado' as const } : v
      ),
    }))
  }, [])

  const importarVoluntarios = useCallback((inscripcionId: string, rows: Record<string, string>[]) => {
    const existentes = voluntarios[inscripcionId] ?? []
    const base = existentes.length
    const nuevos: VoluntarioEntity[] = rows.map((datos, i) => ({
      id: uid(),
      inscripcionId,
      zonaId: null,
      estado: 'no_asignado' as const,
      ordenLlegada: base + i + 1,
      datos,
      createdAt: new Date(),
      updatedAt: null,
    }))
    setVoluntarios(prev => ({ ...prev, [inscripcionId]: [...(prev[inscripcionId] ?? []), ...nuevos] }))
    return nuevos.length
  }, [voluntarios])

  const addVoluntario = useCallback((inscripcionId: string, datos: Record<string, string>) => {
    const existentes = voluntarios[inscripcionId] ?? []
    const nuevo: VoluntarioEntity = {
      id: uid(), inscripcionId, zonaId: null, estado: 'no_asignado',
      ordenLlegada: existentes.length + 1, datos, createdAt: new Date(), updatedAt: null,
    }
    setVoluntarios(prev => ({ ...prev, [inscripcionId]: [...(prev[inscripcionId] ?? []), nuevo] }))
  }, [voluntarios])

  const updateVoluntarioZona = useCallback((voluntarioId: string, inscripcionId: string, zonaId: string) => {
    setVoluntarios(prev => ({
      ...prev,
      [inscripcionId]: (prev[inscripcionId] ?? []).map(v =>
        v.id === voluntarioId ? { ...v, zonaId, estado: 'asignado' as const, updatedAt: new Date() } : v
      ),
    }))
  }, [])

  const moverAListaEspera = useCallback((voluntarioId: string, inscripcionId: string) => {
    setVoluntarios(prev => ({
      ...prev,
      [inscripcionId]: (prev[inscripcionId] ?? []).map(v =>
        v.id === voluntarioId ? { ...v, zonaId: null, estado: 'lista_espera' as const, updatedAt: new Date() } : v
      ),
    }))
  }, [])

  const autoSort = useCallback((inscripcionId: string) => {
    const vols = voluntarios[inscripcionId] ?? []
    const zs = zonas[inscripcionId] ?? []
    const attrs = atributos[inscripcionId] ?? []
    const config = configOrden[inscripcionId]

    const resultado = config && (config.prioridades.length > 0 || config.filtrosEliminatorios.length > 0)
      ? ejecutarAsignacionPersonalizada(vols, zs, attrs, config)
      : ejecutarAsignacionAutomatica(vols, zs, attrs)

    const asignadosMap = new Map(resultado.asignados.map(a => [a.voluntarioId, a.zonaId]))
    const enEsperaSet = new Set(resultado.listaEspera.map(e => e.voluntarioId))
    const filtradosSet = new Set(resultado.filtrados.map(f => f.voluntarioId))

    setVoluntarios(prev => ({
      ...prev,
      [inscripcionId]: (prev[inscripcionId] ?? []).map(v => {
        if (asignadosMap.has(v.id)) return { ...v, zonaId: asignadosMap.get(v.id)!, estado: 'asignado' as const }
        if (enEsperaSet.has(v.id) || filtradosSet.has(v.id)) return { ...v, zonaId: null, estado: 'lista_espera' as const }
        return v
      }),
    }))

    return {
      totalAsignados: resultado.resumen.totalAsignados,
      totalListaEspera: resultado.resumen.totalListaEspera,
      totalFiltrados: resultado.resumen.totalFiltrados,
    }
  }, [voluntarios, zonas, atributos, configOrden])

  const saveConfigOrden = useCallback((inscripcionId: string, prioridades: CriterioOrden[], filtros: FiltroEliminatorio[]) => {
    const existing = configOrden[inscripcionId]
    const entry: ConfigOrdenEntity = {
      id: existing?.id ?? uid(),
      inscripcionId,
      prioridades,
      filtrosEliminatorios: filtros,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    }
    setConfigOrden(prev => ({ ...prev, [inscripcionId]: entry }))
  }, [configOrden])

  const saveConfigAutomatizacion = useCallback((inscripcionId: string, pasosInicio: PasoAutomatizacion[], pasosPorVoluntario: PasoAutomatizacion[]) => {
    const existing = configAutomatizacion[inscripcionId]
    const entry: ConfigAutomatizacionEntity = {
      id: existing?.id ?? uid(),
      inscripcionId,
      pasosInicio,
      pasosPorVoluntario,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    }
    setConfigAutomatizacion(prev => ({ ...prev, [inscripcionId]: entry }))
  }, [configAutomatizacion])

  return (
    <MockStoreContext.Provider value={{
      inscripciones, atributos, zonas, voluntarios, configOrden, configAutomatizacion,
      createInscripcion, deleteInscripcion,
      addZona, updateZona, deleteZona,
      importarVoluntarios, addVoluntario, updateVoluntarioZona, moverAListaEspera, autoSort,
      saveConfigOrden, saveConfigAutomatizacion,
    }}>
      <TooltipProvider>
        {children}
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </MockStoreContext.Provider>
  )
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext)
  if (!ctx) throw new Error('useMockStore must be used within MockStoreProvider')
  return ctx
}
