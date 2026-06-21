import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import { construirMapaColumnas, esPUC, esHombre } from '@/lib/domain/asignacion/algorithm'

export type CategoriaFiltro =
  | 'todos'
  | 'hombres'
  | 'mujeres'
  | 'uc'
  | 'no_uc'
  | 'hombres_uc'
  | 'mujeres_uc'

export const CATEGORIA_FILTRO_LABELS: Record<CategoriaFiltro, string> = {
  todos: 'Todos',
  hombres: 'Hombres',
  mujeres: 'Mujeres',
  uc: 'UC',
  no_uc: 'No UC',
  hombres_uc: 'Hombres UC',
  mujeres_uc: 'Mujeres UC',
}

export interface FiltrosVoluntarios {
  pucPrimero: boolean
  ordenInscripcion: boolean
  zonaId: string | null
  categoria: CategoriaFiltro
}

export const FILTROS_INICIALES: FiltrosVoluntarios = {
  pucPrimero: false,
  ordenInscripcion: false,
  zonaId: null,
  categoria: 'todos',
}

function cumpleCategoria(
  v: VoluntarioEntity,
  categoria: CategoriaFiltro,
  colSexo: string | undefined,
  colUniversidad: string | undefined,
): boolean {
  if (categoria === 'todos') return true
  const h = esHombre(colSexo ? (v.datos[colSexo] ?? '') : '')
  const uc = esPUC(colUniversidad ? (v.datos[colUniversidad] ?? '') : '')
  switch (categoria) {
    case 'hombres': return h
    case 'mujeres': return !h
    case 'uc': return uc
    case 'no_uc': return !uc
    case 'hombres_uc': return h && uc
    case 'mujeres_uc': return !h && uc
    default: return true
  }
}

export function aplicarFiltros(
  voluntarios: VoluntarioEntity[],
  atributos: AtributoEntity[],
  filtros: FiltrosVoluntarios,
  zonas: ZonaEntity[],
): VoluntarioEntity[] {
  const mapa = construirMapaColumnas(atributos)
  let resultado = [...voluntarios]

  if (filtros.categoria !== 'todos') {
    resultado = resultado.filter(v => cumpleCategoria(v, filtros.categoria, mapa.sexo, mapa.universidad))
  }

  if (filtros.zonaId !== null) {
    const zona = zonas.find(z => z.id === filtros.zonaId)
    if (zona) {
      const columnaZona = mapa.prioridad_zona_1
      resultado = resultado.filter(v => {
        if (!columnaZona) return false
        const preferencia = v.datos[columnaZona] ?? ''
        return preferencia.toLowerCase().trim() === zona.nombre.toLowerCase().trim()
      })
    }
  }

  if (filtros.pucPrimero) {
    const columnaUniversidad = mapa.universidad
    resultado = resultado.sort((a, b) => {
      const uA = columnaUniversidad ? (a.datos[columnaUniversidad] ?? '') : ''
      const uB = columnaUniversidad ? (b.datos[columnaUniversidad] ?? '') : ''
      const aPUC = esPUC(uA) ? 0 : 1
      const bPUC = esPUC(uB) ? 0 : 1
      if (aPUC !== bPUC) return aPUC - bPUC
      return (a.ordenLlegada ?? 0) - (b.ordenLlegada ?? 0)
    })
    return resultado
  }

  if (filtros.ordenInscripcion) {
    resultado = resultado.sort((a, b) => (a.ordenLlegada ?? 0) - (b.ordenLlegada ?? 0))
  }

  return resultado
}
