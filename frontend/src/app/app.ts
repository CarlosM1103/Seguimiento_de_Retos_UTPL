import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton } from '@ionic/angular';
import { RetosService } from './retos.service';
import { EstadoReto, Reto } from './reto.model';

@Component({
  imports: [FormsModule, IonButton],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly service = inject(RetosService);
  readonly retos = signal<Reto[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly estados: { valor: EstadoReto; etiqueta: string }[] = [
    { valor: 'pendiente', etiqueta: 'Pendiente' },
    { valor: 'en_progreso', etiqueta: 'En progreso' },
    { valor: 'completado', etiqueta: 'Completado' },
  ];
  formulario = { titulo: '', descripcion: '', fecha_limite: '', estado: 'pendiente' as EstadoReto };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.listar().subscribe({
      next: (retos) => { this.retos.set(retos); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo conectar con el API. Comprueba que Django esté activo en el puerto 8000.'); this.cargando.set(false); },
    });
  }

  crear(): void {
    const titulo = this.formulario.titulo.trim();
    if (!titulo || this.guardando()) return;
    this.guardando.set(true);
    this.error.set('');
    this.service.crear({
      titulo,
      descripcion: this.formulario.descripcion.trim(),
      estado: this.formulario.estado,
      fecha_limite: this.formulario.fecha_limite || null,
    }).subscribe({
      next: (reto) => {
        this.retos.update((actuales) => [reto, ...actuales]);
        this.formulario = { titulo: '', descripcion: '', fecha_limite: '', estado: 'pendiente' };
        this.guardando.set(false);
      },
      error: () => { this.error.set('No se pudo guardar el reto. Revisa la conexión con Django y MySQL.'); this.guardando.set(false); },
    });
  }

  cambiarEstado(reto: Reto, event: Event): void {
    const estado = (event.target as HTMLSelectElement).value as EstadoReto;
    this.service.actualizar(reto.id, { estado }).subscribe({
      next: (actualizado) => this.retos.update((lista) => lista.map((item) => item.id === actualizado.id ? actualizado : item)),
      error: () => this.error.set('No se pudo actualizar el estado.'),
    });
  }

  eliminar(reto: Reto): void {
    if (!window.confirm(`¿Eliminar el reto “${reto.titulo}”?`)) return;
    this.service.eliminar(reto.id).subscribe({
      next: () => this.retos.update((lista) => lista.filter((item) => item.id !== reto.id)),
      error: () => this.error.set('No se pudo eliminar el reto.'),
    });
  }
}
