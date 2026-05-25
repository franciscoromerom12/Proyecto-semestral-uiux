export type TipoPaso = 'navegar' | 'click' | 'rellenar' | 'seleccionar' | 'esperar'

export type FuenteValor =
  | 'columna'
  | 'zona_asignada'
  | 'credencial_usuario'
  | 'credencial_contrasena'
  | 'fijo'

export interface PasoNavegar { tipo: 'navegar'; url: string }
export interface PasoClick { tipo: 'click'; selector: string; descripcion?: string }
export interface PasoRellenar { tipo: 'rellenar'; selector: string; fuente: FuenteValor; columna?: string; valorFijo?: string }
export interface PasoSeleccionar { tipo: 'seleccionar'; selector: string; fuente: FuenteValor; columna?: string; valorFijo?: string }
export interface PasoEsperar { tipo: 'esperar'; ms: number }

export type PasoAutomatizacion =
  | PasoNavegar
  | PasoClick
  | PasoRellenar
  | PasoSeleccionar
  | PasoEsperar

export interface ConfigAutomatizacionEntity {
  id: string
  inscripcionId: string
  pasosInicio: PasoAutomatizacion[]
  pasosPorVoluntario: PasoAutomatizacion[]
  createdAt: Date
  updatedAt: Date | null
}

export interface VoluntarioConZona {
  id: string
  nombreDisplay: string
  datos: Record<string, string>
  zonaNombre: string
}

export type EventoProgreso =
  | { tipo: 'inicio_voluntario'; voluntarioId: string; nombre: string; numero: number; total: number }
  | { tipo: 'fin_voluntario'; voluntarioId: string; nombre: string; exito: boolean; error?: string }
  | { tipo: 'fin_total'; totalExito: number; totalError: number }
  | { tipo: 'error_fatal'; mensaje: string }
