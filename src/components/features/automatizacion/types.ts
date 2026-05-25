export interface ProgresoVoluntario {
  voluntarioId: string
  nombre: string
  estado: 'procesando' | 'exito' | 'error'
  error?: string
}
