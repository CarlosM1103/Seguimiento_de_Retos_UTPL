from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Avance, Reto, TareaSemanal
from .serializers import AvanceSerializer, RetoSerializer, TareaSemanalSerializer

class RetoViewSet(viewsets.ModelViewSet):
    queryset = Reto.objects.prefetch_related('tareas', 'avances').all()
    serializer_class = RetoSerializer
    filterset_fields = ['estado']
    search_fields = ['titulo', 'descripcion']
    ordering_fields = ['fecha_inicio', 'titulo', 'estado']

class AvanceViewSet(viewsets.ModelViewSet):
    queryset = Avance.objects.select_related('reto')
    serializer_class = AvanceSerializer
    filterset_fields = ['reto']
    ordering_fields = ['fecha', 'porcentaje']


class TareaSemanalViewSet(viewsets.ModelViewSet):
    queryset = TareaSemanal.objects.select_related('reto').all()
    serializer_class = TareaSemanalSerializer
    filterset_fields = ['reto', 'cerrada']
    ordering_fields = ['semana', 'porcentaje']

    @action(detail=True, methods=['post'])
    def cerrar(self, request, pk=None):
        tarea = self.get_object()
        if tarea.cerrada:
            return Response(
                {'detalle': 'La semana ya está cerrada.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        tarea.cerrada = True
        tarea.save(update_fields=['cerrada', 'actualizado'])
        datos = self.get_serializer(tarea).data
        if tarea.semaforo == TareaSemanal.Semaforo.ROJO:
            datos['aviso'] = 'La semana se cerró en rojo. Revisa la recomendación para recuperar el ritmo en la siguiente semana.'
        else:
            datos['aviso'] = 'Semana cerrada correctamente.'
        return Response(datos)


class AlertaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TareaSemanalSerializer

    def get_queryset(self):
        return TareaSemanal.objects.select_related('reto').filter(porcentaje__lt=60)
