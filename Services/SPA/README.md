# CV Extractor SPA (React+Vite) — Tabla y modal de “Datos extraídos”

## Quickstart
1) `cp .env.example .env` y ajustá `VITE_API_BASE_URL`.
2) `npm i`
3) `npm run dev`

### ¿Qué cambia?
- En “Listado de archivos” ahora ves **tabla** (Nombre, Fecha, Estado, Acciones).
- Botón **Ver datos** abre un **modal** con los **datos extraídos** (o el objeto crudo si no se detecta campo específico).
- Botón **Descargar** usa `/download/{file_id}` si el ID está disponible.

> La API de `/file/all` no define schema → el normalizador intenta detectar: `id/_id/file_id`, `filename/name`, `creation_date/...`, `status`, y datos extraídos en `extracted/entities/result/data/...`.