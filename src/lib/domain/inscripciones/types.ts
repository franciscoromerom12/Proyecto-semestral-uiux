export interface InscripcionEntity {
  id: string;
  usuarioId: string;
  titulo: string;
  descripcion: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
