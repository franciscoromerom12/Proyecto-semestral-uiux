import type { InscripcionEntity } from '@/lib/domain/inscripciones/types'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { ConfigOrdenEntity } from '@/lib/domain/config-orden/types'

// ─── IDs fijos para las inscripciones de demo ────────────────────────────────
export const INS_1 = 'ins-mision-vida-2026'
export const INS_2 = 'ins-verano-solidario'

// ─── Inscripciones ────────────────────────────────────────────────────────────
export const INSCRIPCIONES_INICIALES: InscripcionEntity[] = [
  {
    id: INS_1,
    usuarioId: 'demo-user',
    titulo: 'Misión de Vida 2026',
    descripcion: 'Proceso de asignación de voluntarios para el verano 2026.',
    createdAt: new Date('2025-11-01'),
    updatedAt: null,
  },
  {
    id: INS_2,
    usuarioId: 'demo-user',
    titulo: 'Verano Solidario',
    descripcion: 'Campaña de voluntariado comunitario enero-febrero.',
    createdAt: new Date('2025-12-10'),
    updatedAt: null,
  },
]

// ─── Atributos ────────────────────────────────────────────────────────────────
const mkAtributo = (id: string, inscripcionId: string, nombre: string, tipo: AtributoEntity['tipo'], orden: number, rolSistema: string | null = null, requerido = true): AtributoEntity => ({
  id, inscripcionId, nombre, tipo, orden, rolSistema, requerido, createdAt: new Date('2025-11-01'), updatedAt: null,
})

export const ATRIBUTOS_INICIALES: Record<string, AtributoEntity[]> = {
  [INS_1]: [
    mkAtributo('a1-1', INS_1, 'Nombre Completo', 'texto', 0, 'nombre_completo'),
    mkAtributo('a1-2', INS_1, 'Sexo', 'texto', 1, 'sexo'),
    mkAtributo('a1-3', INS_1, 'Universidad', 'texto', 2, 'universidad'),
    mkAtributo('a1-4', INS_1, 'Edad', 'numero', 3, 'edad'),
    mkAtributo('a1-5', INS_1, 'Carrera', 'texto', 4),
    mkAtributo('a1-6', INS_1, 'Fecha Inscripcion', 'fecha', 5, 'fecha_inscripcion'),
    mkAtributo('a1-7', INS_1, 'Prioridad Zona 1', 'texto', 6, 'prioridad_zona_1'),
    mkAtributo('a1-8', INS_1, 'Prioridad Zona 2', 'texto', 7, 'prioridad_zona_2'),
  ],
  [INS_2]: [
    mkAtributo('a2-1', INS_2, 'Nombre Completo', 'texto', 0, 'nombre_completo'),
    mkAtributo('a2-2', INS_2, 'Sexo', 'texto', 1, 'sexo'),
    mkAtributo('a2-3', INS_2, 'Universidad', 'texto', 2, 'universidad'),
    mkAtributo('a2-4', INS_2, 'Edad', 'numero', 3, 'edad'),
    mkAtributo('a2-5', INS_2, 'Carrera', 'texto', 4),
  ],
}

// ─── Zonas ────────────────────────────────────────────────────────────────────
const mkZona = (id: string, inscripcionId: string, nombre: string, cupoTotal: number): ZonaEntity => ({
  id, inscripcionId, nombre, cupoTotal, createdAt: new Date('2025-11-01'), updatedAt: null,
})

export const ZONAS_INICIALES: Record<string, ZonaEntity[]> = {
  [INS_1]: [
    mkZona('z1-norte', INS_1, 'Zona Norte', 8),
    mkZona('z1-sur', INS_1, 'Zona Sur', 8),
    mkZona('z1-este', INS_1, 'Zona Este', 6),
    mkZona('z1-oeste', INS_1, 'Zona Oeste', 6),
    mkZona('z1-centro', INS_1, 'Zona Centro', 5),
  ],
  [INS_2]: [
    mkZona('z2-a', INS_2, 'Sector A', 10),
    mkZona('z2-b', INS_2, 'Sector B', 10),
  ],
}

// ─── Voluntarios ──────────────────────────────────────────────────────────────
type VData = {
  nombre: string; sexo: string; uni: string; edad: number; carrera: string;
  p1: string; p2: string; fecha: string;
}

const VOLS_RAW: VData[] = [
  { nombre: 'María García López', sexo: 'F', uni: 'PUC', edad: 21, carrera: 'Medicina', p1: 'Zona Norte', p2: 'Zona Sur', fecha: '2025-09-01T08:00:00Z' },
  { nombre: 'Carlos Rodríguez M.', sexo: 'M', uni: 'PUC', edad: 22, carrera: 'Ingeniería Civil', p1: 'Zona Sur', p2: 'Zona Norte', fecha: '2025-09-01T09:15:00Z' },
  { nombre: 'Ana Martínez Silva', sexo: 'F', uni: 'USACH', edad: 20, carrera: 'Trabajo Social', p1: 'Zona Este', p2: 'Zona Centro', fecha: '2025-09-01T10:30:00Z' },
  { nombre: 'Luis Fernández P.', sexo: 'M', uni: 'PUC', edad: 23, carrera: 'Derecho', p1: 'Zona Norte', p2: 'Zona Oeste', fecha: '2025-09-01T11:00:00Z' },
  { nombre: 'Valentina Torres R.', sexo: 'F', uni: 'UDP', edad: 21, carrera: 'Psicología', p1: 'Zona Sur', p2: 'Zona Este', fecha: '2025-09-02T08:00:00Z' },
  { nombre: 'Sebastián Muñoz C.', sexo: 'M', uni: 'USACH', edad: 22, carrera: 'Pedagogía', p1: 'Zona Oeste', p2: 'Zona Norte', fecha: '2025-09-02T09:00:00Z' },
  { nombre: 'Isidora Vargas L.', sexo: 'F', uni: 'PUC', edad: 20, carrera: 'Enfermería', p1: 'Zona Norte', p2: 'Zona Centro', fecha: '2025-09-02T10:00:00Z' },
  { nombre: 'Diego Herrera B.', sexo: 'M', uni: 'UCHILE', edad: 24, carrera: 'Arquitectura', p1: 'Zona Centro', p2: 'Zona Sur', fecha: '2025-09-02T11:00:00Z' },
  { nombre: 'Camila Rojas F.', sexo: 'F', uni: 'PUC', edad: 21, carrera: 'Sociología', p1: 'Zona Sur', p2: 'Zona Norte', fecha: '2025-09-03T08:00:00Z' },
  { nombre: 'Nicolás Pérez A.', sexo: 'M', uni: 'UCHILE', edad: 22, carrera: 'Economía', p1: 'Zona Este', p2: 'Zona Oeste', fecha: '2025-09-03T09:30:00Z' },
  { nombre: 'Daniela Castro M.', sexo: 'F', uni: 'UDP', edad: 20, carrera: 'Comunicaciones', p1: 'Zona Norte', p2: 'Zona Sur', fecha: '2025-09-03T10:15:00Z' },
  { nombre: 'Rodrigo Díaz V.', sexo: 'M', uni: 'PUC', edad: 23, carrera: 'Filosofía', p1: 'Zona Oeste', p2: 'Zona Centro', fecha: '2025-09-03T11:45:00Z' },
  { nombre: 'Sofía Morales A.', sexo: 'F', uni: 'USACH', edad: 21, carrera: 'Química', p1: 'Zona Centro', p2: 'Zona Norte', fecha: '2025-09-04T08:30:00Z' },
  { nombre: 'Matías González C.', sexo: 'M', uni: 'PUC', edad: 22, carrera: 'Biología', p1: 'Zona Sur', p2: 'Zona Este', fecha: '2025-09-04T09:00:00Z' },
  { nombre: 'Catalina López R.', sexo: 'F', uni: 'UAI', edad: 20, carrera: 'Diseño Gráfico', p1: 'Zona Norte', p2: 'Zona Oeste', fecha: '2025-09-04T10:00:00Z' },
  { nombre: 'Felipe Torres D.', sexo: 'M', uni: 'UCHILE', edad: 23, carrera: 'Historia', p1: 'Zona Este', p2: 'Zona Sur', fecha: '2025-09-04T11:00:00Z' },
  { nombre: 'Fernanda Vega M.', sexo: 'F', uni: 'PUC', edad: 21, carrera: 'Letras', p1: 'Zona Sur', p2: 'Zona Centro', fecha: '2025-09-05T08:00:00Z' },
  { nombre: 'Ignacio Soto P.', sexo: 'M', uni: 'UDP', edad: 22, carrera: 'Marketing', p1: 'Zona Oeste', p2: 'Zona Norte', fecha: '2025-09-05T09:15:00Z' },
  { nombre: 'Javiera Ramos C.', sexo: 'F', uni: 'USACH', edad: 20, carrera: 'Matemáticas', p1: 'Zona Centro', p2: 'Zona Este', fecha: '2025-09-05T10:30:00Z' },
  { nombre: 'Andrés Navarro F.', sexo: 'M', uni: 'PUC', edad: 24, carrera: 'Teología', p1: 'Zona Norte', p2: 'Zona Sur', fecha: '2025-09-05T11:00:00Z' },
  { nombre: 'Constanza Silva R.', sexo: 'F', uni: 'UCHILE', edad: 21, carrera: 'Ciencias Políticas', p1: 'Zona Sur', p2: 'Zona Norte', fecha: '2025-09-06T08:30:00Z' },
  { nombre: 'Tomás Fuentes A.', sexo: 'M', uni: 'UAI', edad: 22, carrera: 'Administración', p1: 'Zona Este', p2: 'Zona Centro', fecha: '2025-09-06T09:00:00Z' },
  { nombre: 'Emilia Reyes M.', sexo: 'F', uni: 'PUC', edad: 20, carrera: 'Física', p1: 'Zona Oeste', p2: 'Zona Sur', fecha: '2025-09-06T10:00:00Z' },
  { nombre: 'Pablo Campos V.', sexo: 'M', uni: 'USACH', edad: 23, carrera: 'Geografía', p1: 'Zona Norte', p2: 'Zona Este', fecha: '2025-09-06T11:30:00Z' },
  { nombre: 'Antonia Pizarro C.', sexo: 'F', uni: 'PUC', edad: 21, carrera: 'Nutrición', p1: 'Zona Centro', p2: 'Zona Norte', fecha: '2025-09-07T08:00:00Z' },
  { nombre: 'Javier Espinoza D.', sexo: 'M', uni: 'UCHILE', edad: 22, carrera: 'Ingeniería Comercial', p1: 'Zona Sur', p2: 'Zona Oeste', fecha: '2025-09-07T09:00:00Z' },
  { nombre: 'Paz Molina R.', sexo: 'F', uni: 'UDP', edad: 20, carrera: 'Teatro', p1: 'Zona Norte', p2: 'Zona Centro', fecha: '2025-09-07T10:15:00Z' },
  { nombre: 'Cristóbal Vera P.', sexo: 'M', uni: 'PUC', edad: 25, carrera: 'Odontología', p1: 'Zona Este', p2: 'Zona Norte', fecha: '2025-09-07T11:45:00Z' },
  { nombre: 'Trinidad Araneda L.', sexo: 'F', uni: 'UAI', edad: 21, carrera: 'Publicidad', p1: 'Zona Oeste', p2: 'Zona Sur', fecha: '2025-09-08T08:00:00Z' },
  { nombre: 'Benjamín Contreras M.', sexo: 'M', uni: 'USACH', edad: 22, carrera: 'Estadística', p1: 'Zona Centro', p2: 'Zona Este', fecha: '2025-09-08T09:00:00Z' },
  { nombre: 'Renata Ibáñez F.', sexo: 'F', uni: 'PUC', edad: 20, carrera: 'Música', p1: 'Zona Norte', p2: 'Zona Oeste', fecha: '2025-09-08T10:00:00Z' },
  { nombre: 'Martín Salinas V.', sexo: 'M', uni: 'UCHILE', edad: 23, carrera: 'Kinesiología', p1: 'Zona Sur', p2: 'Zona Norte', fecha: '2025-09-08T11:00:00Z' },
  { nombre: 'Elisa Cáceres R.', sexo: 'F', uni: 'PUC', edad: 21, carrera: 'Fonoaudiología', p1: 'Zona Este', p2: 'Zona Sur', fecha: '2025-09-09T08:30:00Z' },
]

// Zonas asignadas para la primera inscripción (estado: ya ejecutada la asignación automática)
const ZONA_ASIGNACIONES: Record<number, string> = {
  0: 'z1-norte', 1: 'z1-sur', 2: 'z1-este', 3: 'z1-norte', 4: 'z1-sur',
  5: 'z1-oeste', 6: 'z1-norte', 7: 'z1-centro', 8: 'z1-sur', 9: 'z1-este',
  10: 'z1-norte', 11: 'z1-oeste', 12: 'z1-centro', 13: 'z1-sur', 14: 'z1-norte',
  15: 'z1-este', 16: 'z1-sur', 17: 'z1-oeste', 18: 'z1-centro', 19: 'z1-norte',
  20: 'z1-sur', 21: 'z1-este', 22: 'z1-oeste', 23: 'z1-norte', 24: 'z1-centro',
  25: 'z1-sur', 26: 'z1-norte', 27: 'z1-este', 28: 'z1-oeste', 29: 'z1-sur',
  30: 'z1-norte', 31: 'z1-sur', 32: 'z1-este',
}

export function buildVoluntariosIniciales(): Record<string, VoluntarioEntity[]> {
  const now = new Date()
  const vols1: VoluntarioEntity[] = VOLS_RAW.map((v, i) => {
    const zonaId = ZONA_ASIGNACIONES[i] ?? null
    const estado: VoluntarioEntity['estado'] = zonaId ? 'asignado' : (i >= 30 ? 'lista_espera' : 'no_asignado')
    return {
      id: `v1-${String(i).padStart(3, '0')}`,
      inscripcionId: INS_1,
      zonaId,
      estado,
      ordenLlegada: i + 1,
      datos: {
        'Nombre Completo': v.nombre,
        'Sexo': v.sexo,
        'Universidad': v.uni,
        'Edad': String(v.edad),
        'Carrera': v.carrera,
        'Fecha Inscripcion': v.fecha,
        'Prioridad Zona 1': v.p1,
        'Prioridad Zona 2': v.p2,
      },
      createdAt: new Date(v.fecha),
      updatedAt: now,
    }
  })

  // Inscripción 2: voluntarios sin asignar
  const vols2: VoluntarioEntity[] = VOLS_RAW.slice(0, 12).map((v, i) => ({
    id: `v2-${String(i).padStart(3, '0')}`,
    inscripcionId: INS_2,
    zonaId: null,
    estado: 'no_asignado' as const,
    ordenLlegada: i + 1,
    datos: {
      'Nombre Completo': v.nombre,
      'Sexo': v.sexo,
      'Universidad': v.uni,
      'Edad': String(v.edad),
      'Carrera': v.carrera,
    },
    createdAt: new Date(v.fecha),
    updatedAt: null,
  }))

  return { [INS_1]: vols1, [INS_2]: vols2 }
}

export const CONFIG_ORDEN_INICIALES: Record<string, ConfigOrdenEntity | null> = {
  [INS_1]: null,
  [INS_2]: null,
}
