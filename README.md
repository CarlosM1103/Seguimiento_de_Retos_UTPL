# Seguimiento de Retos

Proyecto individual del parcial B1 de Ingeniería Web, UTPL. La aplicación permite registrar el progreso semanal de un reto desde la web y Android. Usa Django REST Framework, MySQL, Angular, Ionic y Capacitor.

## Qué hace la aplicación

- Crea retos con título, descripción, fecha de inicio y fecha final.
- Prepara automáticamente las semanas 7 a 15 para cada reto.
- Permite registrar un porcentaje y una nota corta por semana.
- Muestra un semáforo: verde desde 80 %, amarillo desde 60 % y rojo por debajo de 60 %.
- Permite cerrar una semana. Cuando una semana está cerrada ya no se puede modificar.
- Muestra una lista de alertas con las semanas que siguen en rojo.

## Funcionalidad propia

La funcionalidad adicional se llama **Panel de seguimiento y recomendaciones**. En la parte superior aparecen el total de retos, las semanas verdes, amarillas y rojas, además del promedio general. Cada semana también presenta una recomendación según el porcentaje registrado. Por ejemplo, si una semana está en amarillo, la app indica cuántos puntos faltan para llegar a verde. Si está en rojo, explica cuánto falta para salir de esa situación.

Las recomendaciones ayudan a decidir cuánto avanzar antes de la siguiente revisión. El panel se actualiza al guardar una semana y funciona en la web y Android.

## Ejecutar el proyecto

Desde la raíz del repositorio, prepara Django. Necesitas una base MySQL creada y un usuario con acceso. Copia `backend/.env.example` como `backend/.env` y completa los valores de tu equipo.

```powershell
Set-Location backend
py -3.12 -m venv .venv
. .\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

En otra terminal inicia la web:

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd start -- --host 0.0.0.0 --port 8100
```

Abre `http://127.0.0.1:8100/` o `http://localhost:8100/`.

## Ejecutar Android

Con el emulador iniciado y Django activo:

```powershell
Set-Location frontend
npm.cmd run build
npx.cmd cap sync android
Set-Location .\android
.\gradlew.bat installDebug
```

La versión Android usa `http://10.0.2.2:8000/api` para conectarse al backend del equipo. La APK se genera en:

```text
frontend\android\app\build\outputs\apk\debug\app-debug.apk
```

## Pruebas

Backend:

```powershell
Set-Location backend
. .\.venv\Scripts\Activate.ps1
python manage.py check --database default
python manage.py test retos -v 2
```

Frontend:

```powershell
Set-Location frontend
npm.cmd run build
npm.cmd test -- --watch=false
```

Las pruebas incluyen la creación de las semanas 7 a 15 y el rechazo de cambios en una semana cerrada.

Consulta las [evidencias de la entrega](documentacion/entrega-b1.md) para ver el panel en la web y el emulador.
