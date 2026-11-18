import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NuevoReto, Reto } from './reto.model';

@Injectable({ providedIn: 'root' })
export class RetosService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8000/api/retos/';

  listar(): Observable<Reto[]> {
    return this.http.get<Reto[]>(this.url);
  }

  crear(reto: NuevoReto): Observable<Reto> {
    return this.http.post<Reto>(this.url, reto);
  }

  actualizar(id: number, cambios: Partial<NuevoReto>): Observable<Reto> {
    return this.http.patch<Reto>(`${this.url}${id}/`, cambios);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }
}
