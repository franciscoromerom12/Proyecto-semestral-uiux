export type RolSistema =
  | 'nombre_completo'
  | 'sexo'
  | 'universidad'
  | 'edad'
  | 'fecha_inscripcion'
  | 'dias_disponibles'
  | 'prioridad_zona_1'
  | 'prioridad_zona_1_obligatorio'
  | 'prioridad_zona_2'
  | 'prioridad_zona_2_obligatorio'
  | 'amigo_1'
  | 'amigo_1_obligatorio'
  | 'amigo_2'
  | 'amigo_2_obligatorio'
  | 'amigo_3'
  | 'amigo_3_obligatorio'

export const ROLES_REQUERIDOS: RolSistema[] = [
  'sexo',
  'universidad',
  'edad',
  'fecha_inscripcion',
]

// Mapeo rolSistema → nombre real de la columna en datos{}
export type MapaColumnas = Partial<Record<RolSistema, string>>

export interface VoluntarioExpandido {
  id: string
  nombreCompleto: string
  sexo: string
  universidad: string
  edad: number
  fechaInscripcion: Date
  diasDisponibles: number
  prioridad1: string
  prioridad1Obligatorio: boolean
  prioridad2: string
  prioridad2Obligatorio: boolean
  amigos: Array<{ nombre: string; obligatorio: boolean }>
  // estado mutable durante el algoritmo
  estado: 'pendiente' | 'aceptado' | 'lista_espera' | 'filtrado'
  razonFiltrado?: string
  zonaId: string | null
}

export interface CuposZona {
  zonaId: string
  nombre: string
  cupoTotal: number
  cupos: {
    hombrePUC: number
    hombreNoPUC: number
    mujerPUC: number
    mujerNoPUC: number
  }
  asignados: {
    hombrePUC: number
    hombreNoPUC: number
    mujerPUC: number
    mujerNoPUC: number
  }
}

export interface ResultadoAsignacion {
  asignados: Array<{ voluntarioId: string; zonaId: string }>
  listaEspera: Array<{ voluntarioId: string }>
  filtrados: Array<{ voluntarioId: string; razon: string }>
  cuposFinales: CuposZona[]
  resumen: {
    totalVoluntarios: number
    totalAceptados: number
    totalAsignados: number
    totalListaEspera: number
    totalFiltrados: number
  }
}
