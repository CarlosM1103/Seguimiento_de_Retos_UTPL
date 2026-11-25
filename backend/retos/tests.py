from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Avance, Reto


class RetoApiTests(APITestCase):
    def test_crear_y_listar_reto(self):
        url = reverse('reto-list')
        datos = {'titulo': 'Leer 10 libros', 'fecha_inicio': '2026-11-18'}
        respuesta = self.client.post(url, datos, format='json')
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reto.objects.count(), 1)
        respuesta = self.client.get(url)
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data['count'], 1)

    def test_rechaza_fecha_fin_anterior_a_inicio(self):
        datos = {'titulo': 'Fechas', 'fecha_inicio': '2026-11-18', 'fecha_fin': '2026-11-01'}
        respuesta = self.client.post(reverse('reto-list'), datos, format='json')
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('fecha_fin', respuesta.data)

    def test_rechaza_porcentaje_mayor_a_100(self):
        reto = Reto.objects.create(titulo='Correr', fecha_inicio=date(2026, 11, 18))
        datos = {'reto': reto.id, 'fecha': '2026-11-18', 'descripcion': 'Prueba', 'porcentaje': 150}
        respuesta = self.client.post(reverse('avance-list'), datos, format='json')
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('porcentaje', respuesta.data)

    def test_crear_reto_genera_semanas_7_a_15(self):
        reto = Reto.objects.create(titulo='Aprender Angular', fecha_inicio=date(2026, 11, 18))
        semanas = list(reto.tareas.values_list('semana', flat=True))
        self.assertEqual(semanas, list(range(7, 16)))

    def test_semana_cerrada_rechaza_cambios_y_avisa_si_esta_en_rojo(self):
        reto = Reto.objects.create(titulo='Practicar inglés', fecha_inicio=date(2026, 11, 18))
        tarea = reto.tareas.get(semana=7)
        tarea.porcentaje = 45
        tarea.save()

        cierre = self.client.post(reverse('tareasemanal-cerrar', args=[tarea.id]), format='json')
        self.assertEqual(cierre.status_code, status.HTTP_200_OK)
        self.assertEqual(cierre.data['semaforo'], 'ROJO')
        self.assertIn('rojo', cierre.data['aviso'].lower())

        cambio = self.client.patch(
            reverse('tareasemanal-detail', args=[tarea.id]),
            {'porcentaje': 80},
            format='json',
        )
        self.assertEqual(cambio.status_code, status.HTTP_400_BAD_REQUEST)
