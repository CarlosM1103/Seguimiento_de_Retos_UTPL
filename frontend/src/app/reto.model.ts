export type EstadoReto = 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO';
export type Semaforo = 'VERDE' | 'AMARILLO' | 'ROJO';

export interface TareaSemanal {
  id: number;
  reto: number;
  reto_titulo: string;
  semana: number;
  porcentaje: number;
  nota: string;
  cerrada: boolean;
  semaforo: Semaforo;
  recomendacion: string;
  actualizado: string;
}

export interface Reto {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: EstadoReto;
  total_avances: number;
  tareas: TareaSemanal[];
  creado: string;
  actualizado: string;
}

export interface NuevoReto {
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: EstadoReto;
}

export interface CierreTarea extends TareaSemanal {
  aviso: string;
}

export interface PaginaApi<T> {
  count: number;
  results: T[];
}
