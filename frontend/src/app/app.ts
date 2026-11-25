import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IonButton } from '@ionic/angular';
import { RetosService } from './retos.service';
import { EstadoReto, Reto, Semaforo, TareaSemanal } from './reto.model';

@Component({
  imports: [FormsModule, IonButton],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly service = inject(RetosService);
  readonly retos = signal<Reto[]>([]);
  readonly alertas = signal<TareaSemanal[]>([]);
  readonly seleccionado = signal<Reto | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly tareaEnProceso = signal<number | null>(null);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly textoBusqueda = signal('');
  readonly tareas = computed(() => this.retos().flatMap((reto) => reto.tareas));
  readonly resumen = computed(() => {
    const tareas = this.tareas();
    const contar = (estado: Semaforo) => tareas.filter((tarea) => tarea.semaforo === estado).length;
    const promedio = tareas.length
      ? Math.round(tareas.reduce((total, tarea) => total + tarea.porcentaje, 0) / tareas.length)
      : 0;
    return { total: this.retos().length, verde: contar('VERDE'), amarillo: contar('AMARILLO'), rojo: contar('ROJO'), promedio };
  });

  formulario = {
    titulo: '', descripcion: '', fecha_inicio: this.fechaActual(), fecha_fin: '', estado: 'PENDIENTE' as EstadoReto,
  };

  ngOnInit(): void { this.cargar(); }

  cargar(busqueda = this.textoBusqueda()): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.listarRetos(busqueda).subscribe({
      next: (retos) => {
        this.retos.set(retos);
        const actual = this.seleccionado();
        this.seleccionado.set(actual ? retos.find((reto) => reto.id === actual.id) ?? retos[0] ?? null : retos[0] ?? null);
        this.cargando.set(false);
      },
      error: (respuesta) => { this.error.set(this.mensajeError(respuesta)); this.cargando.set(false); },
    });
    this.actualizarAlertas();
  }

  buscar(event: Event): void {
    const texto = (event.target as HTMLInputElement).value.trim();
    this.textoBusqueda.set(texto);
    this.cargar(texto);
  }

  crear(): void {
    if (this.guardando() || !this.formulario.titulo.trim() || !this.formulario.fecha_inicio) return;
    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');
    this.service.crearReto({
      titulo: this.formulario.titulo.trim(),
      descripcion: this.formulario.descripcion.trim(),
      fecha_inicio: this.formulario.fecha_inicio,
      fecha_fin: this.formulario.fecha_fin || null,
      estado: this.formulario.estado,
    }).subscribe({
      next: (reto) => {
        this.retos.update((actuales) => [reto, ...actuales]);
        this.seleccionado.set(reto);
        this.formulario = { titulo: '', descripcion: '', fecha_inicio: this.fechaActual(), fecha_fin: '', estado: 'PENDIENTE' };
        this.guardando.set(false);
        this.mensaje.set('Reto creado con sus semanas de seguimiento del 7 al 15.');
        this.actualizarAlertas();
      },
      error: (respuesta) => { this.error.set(this.mensajeError(respuesta)); this.guardando.set(false); },
    });
  }

  seleccionar(reto: Reto): void { this.seleccionado.set(reto); this.mensaje.set(''); }

  abrirAlerta(alerta: TareaSemanal): void {
    const reto = this.retos().find((item) => item.id === alerta.reto);
    if (reto) this.seleccionar(reto);
  }

  guardarTarea(tarea: TareaSemanal): void {
    if (tarea.cerrada || this.tareaEnProceso()) return;
    this.tareaEnProceso.set(tarea.id);
    this.error.set('');
    this.service.actualizarTarea(tarea).subscribe({
      next: (actualizada) => {
        this.reemplazarTarea(actualizada);
        this.tareaEnProceso.set(null);
        this.mensaje.set(`Semana ${actualizada.semana} actualizada.`);
        this.actualizarAlertas();
      },
      error: (respuesta) => { this.error.set(this.mensajeError(respuesta)); this.tareaEnProceso.set(null); },
    });
  }

  cerrarSemana(tarea: TareaSemanal): void {
    if (tarea.cerrada || this.tareaEnProceso()) return;
    this.tareaEnProceso.set(tarea.id);
    this.error.set('');
    this.service.cerrarTarea(tarea.id).subscribe({
      next: (cerrada) => {
        this.reemplazarTarea(cerrada);
        this.tareaEnProceso.set(null);
        this.mensaje.set(cerrada.aviso);
        this.actualizarAlertas();
      },
      error: (respuesta) => { this.error.set(this.mensajeError(respuesta)); this.tareaEnProceso.set(null); },
    });
  }

  etiquetaEstado(estado: EstadoReto): string {
    return { PENDIENTE: 'Pendiente', EN_CURSO: 'En curso', COMPLETADO: 'Completado' }[estado];
  }

  promedioReto(reto: Reto): number {
    return reto.tareas.length ? Math.round(reto.tareas.reduce((total, tarea) => total + tarea.porcentaje, 0) / reto.tareas.length) : 0;
  }

  private reemplazarTarea(actualizada: TareaSemanal): void {
    this.retos.update((retos) => retos.map((reto) => reto.id !== actualizada.reto ? reto : {
      ...reto, tareas: reto.tareas.map((tarea) => tarea.id === actualizada.id ? actualizada : tarea),
    }));
    const retoActual = this.seleccionado();
    if (retoActual?.id === actualizada.reto) {
      this.seleccionado.set({ ...retoActual, tareas: retoActual.tareas.map((tarea) => tarea.id === actualizada.id ? actualizada : tarea) });
    }
  }

  private actualizarAlertas(): void {
    this.service.listarAlertas().subscribe({ next: (alertas) => this.alertas.set(alertas) });
  }

  private fechaActual(): string { return new Date().toISOString().slice(0, 10); }

  private mensajeError(respuesta: unknown): string {
    if (respuesta instanceof HttpErrorResponse) {
      const datos = respuesta.error;
      if (typeof datos === 'string') return datos;
      if (datos?.detalle) return datos.detalle;
      if (datos?.non_field_errors?.[0]) return datos.non_field_errors[0];
      if (datos && typeof datos === 'object') {
        const primerCampo = Object.keys(datos)[0];
        if (primerCampo) {
          const detalle = datos[primerCampo];
          return Array.isArray(detalle) ? detalle[0] : String(detalle);
        }
      }
    }
    return 'No se pudo completar la acción. Comprueba que Django esté activo en el puerto 8000.';
  }
}
