export type VoluntarioEstado = 'no_asignado' | 'asignado' | 'lista_espera';

export interface VoluntarioEntity {
  id: string;
  inscripcionId: string;
  zonaId: string | null;
  estado: VoluntarioEstado;
  ordenLlegada: number | null;
  datos: Record<string, string>;
  esMiembroEquipo?: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
