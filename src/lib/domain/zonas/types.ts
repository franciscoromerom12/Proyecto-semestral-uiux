export interface ZonaEntity {
  id: string;
  inscripcionId: string;
  nombre: string;
  cupoTotal: number;
  createdAt: Date;
  updatedAt: Date | null;
}
