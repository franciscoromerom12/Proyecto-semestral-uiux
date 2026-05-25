export type OrdenDireccion = 'asc' | 'desc'

export type OperadorFiltro =
  | 'igual'
  | 'diferente'
  | 'mayor'
  | 'menor'
  | 'mayor_igual'
  | 'menor_igual'
  | 'contiene'

export interface CriterioOrden {
  atributo: string
  orden: OrdenDireccion
  valoresPrioritarios?: string[]
}

export interface FiltroEliminatorio {
  atributo: string
  operador: OperadorFiltro
  valor: string
}

export interface ConfigOrdenEntity {
  id: string
  inscripcionId: string
  prioridades: CriterioOrden[]
  filtrosEliminatorios: FiltroEliminatorio[]
  createdAt: Date
  updatedAt: Date | null
}
