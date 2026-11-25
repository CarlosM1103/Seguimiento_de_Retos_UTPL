# Seguimiento de Retos

Aplicación para organizar retos personales y registrar su progreso semanal. El proyecto usa Django REST Framework, MySQL, Angular, Ionic y Capacitor para funcionar en la web y en Android.

## Qué hace la aplicación

- Crea retos con título, descripción, fecha de inicio y fecha final.
- Prepara automáticamente las semanas 7 a 15 para cada reto.
- Permite registrar un porcentaje y una nota corta por semana.
- Muestra un semáforo: verde desde 80 %, amarillo desde 60 % y rojo por debajo de 60 %.
- Permite cerrar una semana. Cuando una semana está cerrada ya no se puede modificar.
- Muestra una lista de alertas con las semanas que siguen en rojo.

## Funcionalidad propia

La funcionalidad adicional se llama **Panel de seguimiento y recomendaciones**. En la parte superior aparecen el total de retos, las semanas verdes, amarillas y rojas, además del promedio general. Cada semana también presenta una recomendación según el porcentaje registrado. Por ejemplo, si una semana está en amarillo, la app indica cuántos puntos faltan para llegar a verde. Si está en rojo, explica cuánto falta para salir de esa situación.

Elegí esta función porque no solo presenta datos: ayuda a tomar una decisión sobre el siguiente avance. Está conectada al backend, se actualiza al guardar una semana y funciona igual en la web y en la app Android.

## Ejecutar el proyecto

Abre la carpeta `C:\Users\CDML\proyectos\SeguimientoRetos` en Visual Studio Code.

En una terminal inicia Django:

```powershell
Set-Location "$env:USERPROFILE\proyectos\SeguimientoRetos\backend"
. .\.venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

En otra terminal inicia la web:

```powershell
Set-Location "$env:USERPROFILE\proyectos\SeguimientoRetos\frontend"
npm.cmd start -- --host 0.0.0.0 --port 8100
```

Abre `http://127.0.0.1:8100/` o `http://localhost:8100/`.

## Ejecutar Android

Con el emulador iniciado y Django activo:

```powershell
Set-Location "$env:USERPROFILE\proyectos\SeguimientoRetos\frontend"
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
Set-Location "$env:USERPROFILE\proyectos\SeguimientoRetos\backend"
python manage.py check --database default
python manage.py test retos -v 2
```

Frontend:

```powershell
Set-Location "$env:USERPROFILE\proyectos\SeguimientoRetos\frontend"
npm.cmd run build
npm.cmd test -- --watch=false
```

Las pruebas incluyen la creación de las semanas 7 a 15 y el rechazo de cambios en una semana cerrada.
