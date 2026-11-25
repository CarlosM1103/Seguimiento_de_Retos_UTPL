from rest_framework.routers import DefaultRouter
from .views import AlertaViewSet, AvanceViewSet, RetoViewSet, TareaSemanalViewSet

router = DefaultRouter()
router.register('retos', RetoViewSet)
router.register('avances', AvanceViewSet)
router.register('tareas', TareaSemanalViewSet)
router.register('alertas', AlertaViewSet, basename='alerta')
urlpatterns = router.urls
