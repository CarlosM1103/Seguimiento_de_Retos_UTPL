export type EstadoReto = 'pendiente' | 'en_progreso' | 'completado';

export interface Reto {
  id: number;
  titulo: string;
  descripcion: string;
  estado: EstadoReto;
  fecha_limite: string | null;
  creado: string;
  actualizado: string;
}

export type NuevoReto = Pick<Reto, 'titulo' | 'descripcion' | 'estado' | 'fecha_limite'>;
