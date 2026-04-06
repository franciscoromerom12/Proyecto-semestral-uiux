export type VolunteerStatus = "no_asignado" | "asignado" | "espera" | "cancelado";

export interface Volunteer {
  id: string;
  nombre: string;
  correo: string;
  sexo: string;
  universidad: string;
  carrera: string;
  zonaPreferida: string;
  timestamp: string;
  estado: VolunteerStatus;
  zonaAsignadaId: string | null;
}

export interface Zone {
  id: string;
  nombre: string;
  cupoTotal: number;
  minHombres: number;
  minMujeres: number;
  minPUC: number;
}

export interface WaitlistEntry {
  id: string;
  voluntarioId: string;
  zonaId: string;
  prioridad: number;
}

export interface AppState {
  volunteers: Volunteer[];
  zones: Zone[];
  waitlist: WaitlistEntry[];
}
