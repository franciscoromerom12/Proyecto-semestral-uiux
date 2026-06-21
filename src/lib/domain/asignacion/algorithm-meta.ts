import type { ZonaEntity } from '@/lib/domain/zonas/types'
import { esHombre, esPUC } from './algorithm'

// Metas de distribución por zona.
// META_PCT_UC es un mínimo deseado: la UC puede superar 75% si quedan cupos.
export const META_PCT_UC = 0.75
export const META_PCT_MUJERES = 0.55

// Las 4 categorías que cruzan género (hombre/mujer) y universidad (UC / no UC).
export type CategoriaVoluntario = 'hombre_puc' | 'hombre_no_puc' | 'mujer_puc' | 'mujer_no_puc'

export interface ConteoCategoria {
  hombrePUC: number
  hombreNoPUC: number
  mujerPUC: number
  mujerNoPUC: number
}

export const CONTEO_VACIO: ConteoCategoria = { hombrePUC: 0, hombreNoPUC: 0, mujerPUC: 0, mujerNoPUC: 0 }

export const CATEGORIA_LABELS: Record<CategoriaVoluntario, string> = {
  hombre_puc: 'Hombre UC',
  hombre_no_puc: 'Hombre no UC',
  mujer_puc: 'Mujer UC',
  mujer_no_puc: 'Mujer no UC',
}

// Etiqueta en plural para mensajes de recomendación ("faltan hombres UC").
const CATEGORIA_LABELS_PLURAL: Record<CategoriaVoluntario, string> = {
  hombre_puc: 'hombres UC',
  hombre_no_puc: 'hombres no UC',
  mujer_puc: 'mujeres UC',
  mujer_no_puc: 'mujeres no UC',
}

export function categoriaDeVoluntario(
  datos: Record<string, string>,
  colSexo?: string,
  colUniversidad?: string,
): CategoriaVoluntario {
  const h = esHombre(colSexo ? (datos[colSexo] ?? '') : '')
  const uc = esPUC(colUniversidad ? (datos[colUniversidad] ?? '') : '')
  if (h && uc) return 'hombre_puc'
  if (h && !uc) return 'hombre_no_puc'
  if (!h && uc) return 'mujer_puc'
  return 'mujer_no_puc'
}

export function campoCategoria(cat: CategoriaVoluntario): keyof ConteoCategoria {
  return cat === 'hombre_puc' ? 'hombrePUC'
    : cat === 'hombre_no_puc' ? 'hombreNoPUC'
    : cat === 'mujer_puc' ? 'mujerPUC'
    : 'mujerNoPUC'
}

function pctMetaCategoria(categoria: CategoriaVoluntario, pctUC: number, pctMujeres: number): number {
  return categoria === 'hombre_puc' ? (1 - pctMujeres) * pctUC
    : categoria === 'mujer_puc' ? pctMujeres * pctUC
    : categoria === 'hombre_no_puc' ? (1 - pctMujeres) * (1 - pctUC)
    : pctMujeres * (1 - pctUC)
}

// Recomienda la zona con cupo libre donde la categoría del voluntario está más
// deficitaria respecto a su meta (desempate: la que tenga más cupo libre).
export function recomendarZonaEquilibrio(
  categoria: CategoriaVoluntario,
  zonas: ZonaEntity[],
  ocupacionPorZona: Record<string, ConteoCategoria>,
  pctUC = META_PCT_UC,
  pctMujeres = META_PCT_MUJERES,
): { zonaId: string; nombre: string } | null {
  const pctCategoria = pctMetaCategoria(categoria, pctUC, pctMujeres)

  let mejor: { zonaId: string; nombre: string; deficit: number; libre: number } | null = null

  for (const zona of zonas) {
    const ocup = ocupacionPorZona[zona.id] ?? CONTEO_VACIO
    const totalOcupados = ocup.hombrePUC + ocup.hombreNoPUC + ocup.mujerPUC + ocup.mujerNoPUC
    const libre = zona.cupoTotal - totalOcupados
    if (libre <= 0) continue

    const actual = ocup[campoCategoria(categoria)]
    const deficit = zona.cupoTotal * pctCategoria - actual

    if (!mejor || deficit > mejor.deficit || (deficit === mejor.deficit && libre > mejor.libre)) {
      mejor = { zonaId: zona.id, nombre: zona.nombre, deficit, libre }
    }
  }

  return mejor ? { zonaId: mejor.zonaId, nombre: mejor.nombre } : null
}

export interface RecomendacionZona {
  zonaId: string
  nombre: string
  motivo: string
  actual: number
  meta: number
  cupoLibre: number
}

// Versión con motivo legible para mostrar al usuario al abrir un voluntario.
export function recomendarZonaConMotivo(
  categoria: CategoriaVoluntario,
  zonas: ZonaEntity[],
  ocupacionPorZona: Record<string, ConteoCategoria>,
  pctUC = META_PCT_UC,
  pctMujeres = META_PCT_MUJERES,
): RecomendacionZona | null {
  const base = recomendarZonaEquilibrio(categoria, zonas, ocupacionPorZona, pctUC, pctMujeres)
  if (!base) return null

  const zona = zonas.find(z => z.id === base.zonaId)
  if (!zona) return null

  const ocup = ocupacionPorZona[zona.id] ?? CONTEO_VACIO
  const actual = ocup[campoCategoria(categoria)]
  const meta = Math.round(zona.cupoTotal * pctMetaCategoria(categoria, pctUC, pctMujeres))
  const totalOcupados = ocup.hombrePUC + ocup.hombreNoPUC + ocup.mujerPUC + ocup.mujerNoPUC
  const cupoLibre = zona.cupoTotal - totalOcupados

  const faltan = Math.max(0, meta - actual)
  const etiqueta = CATEGORIA_LABELS_PLURAL[categoria]
  const motivo = faltan > 0
    ? `Faltan ${etiqueta} aquí: tiene ${actual} de ${meta} esperados.`
    : `Es la zona con cupo donde mejor encaja según el equilibrio de género y UC.`

  return { zonaId: zona.id, nombre: zona.nombre, motivo, actual, meta, cupoLibre }
}

// Ocupación actual (por categoría) de cada zona a partir de los voluntarios asignados.
export function calcularOcupacionPorZona(
  voluntarios: { zonaId: string | null; estado: string; datos: Record<string, string> }[],
  colSexo?: string,
  colUniversidad?: string,
): Record<string, ConteoCategoria> {
  const ocup: Record<string, ConteoCategoria> = {}
  for (const v of voluntarios) {
    if (!v.zonaId) continue
    if (v.estado !== 'asignado' && v.estado !== 'confirmado') continue
    if (!ocup[v.zonaId]) ocup[v.zonaId] = { ...CONTEO_VACIO }
    const cat = categoriaDeVoluntario(v.datos, colSexo, colUniversidad)
    ocup[v.zonaId][campoCategoria(cat)]++
  }
  return ocup
}
