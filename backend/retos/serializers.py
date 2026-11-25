from rest_framework import serializers
from .models import Avance, Reto, TareaSemanal

class AvanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avance
        fields = ['id', 'reto', 'fecha', 'descripcion', 'porcentaje', 'creado']
        read_only_fields = ['creado']

class RetoSerializer(serializers.ModelSerializer):
    total_avances = serializers.IntegerField(source='avances.count', read_only=True)
    tareas = serializers.SerializerMethodField()

    class Meta:
        model = Reto
        fields = ['id', 'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'estado', 'total_avances', 'tareas', 'creado', 'actualizado']
        read_only_fields = ['creado', 'actualizado']

    def validate(self, datos):
        inicio = datos.get('fecha_inicio', getattr(self.instance, 'fecha_inicio', None))
        fin = datos.get('fecha_fin', getattr(self.instance, 'fecha_fin', None))
        if inicio and fin and fin < inicio:
            raise serializers.ValidationError({'fecha_fin': 'La fecha de fin no puede ser anterior a la fecha de inicio.'})
        return datos

    def get_tareas(self, reto):
        return TareaSemanalSerializer(reto.tareas.all(), many=True).data


class TareaSemanalSerializer(serializers.ModelSerializer):
    semaforo = serializers.CharField(read_only=True)
    recomendacion = serializers.CharField(read_only=True)
    reto_titulo = serializers.CharField(source='reto.titulo', read_only=True)

    class Meta:
        model = TareaSemanal
        fields = ['id', 'reto', 'reto_titulo', 'semana', 'porcentaje', 'nota', 'cerrada', 'semaforo', 'recomendacion', 'actualizado']
        read_only_fields = ['cerrada', 'semaforo', 'recomendacion', 'actualizado']

    def validate(self, datos):
        if self.instance and self.instance.cerrada:
            raise serializers.ValidationError('La semana ya está cerrada y no puede modificarse.')
        return datos
