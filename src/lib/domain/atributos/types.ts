export type AtributoTipo = 'texto' | 'numero' | 'booleano' | 'fecha' | 'seleccion';

export interface AtributoEntity {
  id: string;
  inscripcionId: string;
  nombre: string;
  tipo: AtributoTipo;
  requerido: boolean;
  orden: number;
  rolSistema: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
