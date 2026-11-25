from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Reto(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        EN_CURSO = 'EN_CURSO', 'En curso'
        COMPLETADO = 'COMPLETADO', 'Completado'

    titulo = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=12, choices=Estado.choices, default=Estado.PENDIENTE)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_inicio', 'titulo']
        verbose_name = 'reto'
        verbose_name_plural = 'retos'

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        es_nuevo = self._state.adding
        super().save(*args, **kwargs)
        if es_nuevo:
            TareaSemanal.objects.bulk_create(
                [TareaSemanal(reto=self, semana=semana) for semana in range(7, 16)]
            )


class Avance(models.Model):
    reto = models.ForeignKey(Reto, on_delete=models.CASCADE, related_name='avances')
    fecha = models.DateField()
    descripcion = models.CharField(max_length=255)
    porcentaje = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha', '-id']
        verbose_name = 'avance'
        verbose_name_plural = 'avances'

    def __str__(self):
        return f'{self.reto} - {self.fecha} ({self.porcentaje} %)'


class TareaSemanal(models.Model):
    class Semaforo(models.TextChoices):
        VERDE = 'VERDE', 'Verde'
        AMARILLO = 'AMARILLO', 'Amarillo'
        ROJO = 'ROJO', 'Rojo'

    reto = models.ForeignKey(Reto, on_delete=models.CASCADE, related_name='tareas')
    semana = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(7), MaxValueValidator(15)]
    )
    porcentaje = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    nota = models.CharField(max_length=255, blank=True)
    cerrada = models.BooleanField(default=False)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['semana']
        constraints = [
            models.UniqueConstraint(fields=['reto', 'semana'], name='tarea_unica_por_semana')
        ]
        verbose_name = 'tarea semanal'
        verbose_name_plural = 'tareas semanales'

    @property
    def semaforo(self):
        if self.porcentaje >= 80:
            return self.Semaforo.VERDE
        if self.porcentaje >= 60:
            return self.Semaforo.AMARILLO
        return self.Semaforo.ROJO

    @property
    def recomendacion(self):
        if self.semaforo == self.Semaforo.VERDE:
            return 'Vas bien. Mantén el ritmo que llevas esta semana.'
        if self.semaforo == self.Semaforo.AMARILLO:
            faltan = 80 - self.porcentaje
            return f'Te faltan {faltan} puntos para llegar a verde. Divide ese avance en los días restantes.'
        faltan = 60 - self.porcentaje
        return f'La semana necesita atención. Registra al menos {faltan} puntos más para salir de rojo.'

    def __str__(self):
        return f'{self.reto} - semana {self.semana}'
