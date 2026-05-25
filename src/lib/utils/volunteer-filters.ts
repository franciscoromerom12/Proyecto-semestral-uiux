import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import { construirMapaColumnas } from '@/lib/domain/asignacion/algorithm'
import { esPUC } from '@/lib/domain/asignacion/algorithm'

export interface FiltrosVoluntarios {
  pucPrimero: boolean
  ordenInscripcion: boolean
  zonaId: string | null
}

export const FILTROS_INICIALES: FiltrosVoluntarios = {
  pucPrimero: false,
  ordenInscripcion: false,
  zonaId: null,
}

export function aplicarFiltros(
  voluntarios: VoluntarioEntity[],
  atributos: AtributoEntity[],
  filtros: FiltrosVoluntarios,
  zonas: ZonaEntity[],
): VoluntarioEntity[] {
  const mapa = construirMapaColumnas(atributos)
  let resultado = [...voluntarios]

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
