import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { map, Observable } from 'rxjs';
import { CierreTarea, NuevoReto, PaginaApi, Reto, TareaSemanal } from './reto.model';

@Injectable({ providedIn: 'root' })
export class RetosService {
  private readonly http = inject(HttpClient);
  private readonly api = Capacitor.isNativePlatform()
    ? 'http://10.0.2.2:8000/api'
    : 'http://127.0.0.1:8000/api';

  listarRetos(busqueda = ''): Observable<Reto[]> {
    const consulta = busqueda ? `?search=${encodeURIComponent(busqueda)}` : '';
    return this.http.get<PaginaApi<Reto> | Reto[]>(`${this.api}/retos/${consulta}`).pipe(
      map((respuesta) => Array.isArray(respuesta) ? respuesta : respuesta.results),
    );
  }

  crearReto(reto: NuevoReto): Observable<Reto> {
    return this.http.post<Reto>(`${this.api}/retos/`, reto);
  }

  actualizarReto(id: number, cambios: Partial<NuevoReto>): Observable<Reto> {
    return this.http.patch<Reto>(`${this.api}/retos/${id}/`, cambios);
  }

  actualizarTarea(tarea: TareaSemanal): Observable<TareaSemanal> {
    return this.http.patch<TareaSemanal>(`${this.api}/tareas/${tarea.id}/`, {
      porcentaje: tarea.porcentaje,
      nota: tarea.nota,
    });
  }

  cerrarTarea(id: number): Observable<CierreTarea> {
    return this.http.post<CierreTarea>(`${this.api}/tareas/${id}/cerrar/`, {});
  }

  listarAlertas(): Observable<TareaSemanal[]> {
    return this.http.get<PaginaApi<TareaSemanal> | TareaSemanal[]>(`${this.api}/alertas/`).pipe(
      map((respuesta) => Array.isArray(respuesta) ? respuesta : respuesta.results),
    );
  }
}
