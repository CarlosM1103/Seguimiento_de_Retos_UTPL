from django.contrib import admin
from .models import Avance, Reto, TareaSemanal

class AvanceInline(admin.TabularInline):
    model = Avance
    extra = 0


class TareaSemanalInline(admin.TabularInline):
    model = TareaSemanal
    extra = 0
    readonly_fields = ('semaforo', 'recomendacion', 'actualizado')

@admin.register(Reto)
class RetoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'estado', 'fecha_inicio', 'fecha_fin')
    list_filter = ('estado',)
    search_fields = ('titulo', 'descripcion')
    inlines = [AvanceInline, TareaSemanalInline]

@admin.register(Avance)
class AvanceAdmin(admin.ModelAdmin):
    list_display = ('reto', 'fecha', 'porcentaje')
    list_filter = ('reto',)


@admin.register(TareaSemanal)
class TareaSemanalAdmin(admin.ModelAdmin):
    list_display = ('reto', 'semana', 'porcentaje', 'semaforo', 'cerrada')
    list_filter = ('cerrada', 'reto')
    ordering = ('reto', 'semana')
