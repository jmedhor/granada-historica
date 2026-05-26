# NazaRoute

NazaRoute es una aplicación web de rutas turísticas históricas por la ciudad
de Granada. Permite al usuario explorar puntos de interés cultural e histórico
siguiendo rutas diseñadas con rigor académico, con información aportada por la
Universidad de Granada (UGR).

La aplicación combina mapas interactivos, cálculo de rutas reales mediante OSRM,
filtrado dinámico de puntos turísticos, navegación paso a paso y un panel de
administración completo para la gestión de contenidos.

---

## Índice

- [Descripción general](#descripción-general)
- [Funcionalidades principales](#funcionalidades-principales)
- [Panel de administración](#panel-de-administración)
- [Interfaz móvil](#interfaz-móvil)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Configuración de OSRM](#configuración-de-osrm)
- [Backend](#backend)
- [Frontend](#frontend)

---

# Descripción general

NazaRoute ofrece al usuario distintas rutas turísticas peatonales por Granada,
con un fuerte enfoque en el contexto histórico de la ciudad.

Cada punto de interés incluye:

- Información histórica
- Contexto ampliado en modo historiador
- Bibliografía académica
- Navegación paso a paso
- Integración visual sobre mapa interactivo

La aplicación permite además generar rutas dinámicas según:

- Cercanía al usuario
- Tiempo disponible
- Exclusión de lugares de pago
- Tipo de optimización de ruta

Todo el sistema utiliza rutas reales calculadas sobre la red urbana mediante
OSRM y OpenStreetMap.

---

# Funcionalidades principales

## Rutas históricas interactivas

- Visualización de rutas históricas sobre mapa interactivo
- Integración completa con Leaflet
- Segmentos de ruta reales mediante OSRM

## Modos de cálculo de ruta

### Ruta más corta
Optimiza automáticamente el recorrido para minimizar la distancia total
usando el algoritmo A* personalizado.

### Ruta histórica
Respeta el orden histórico/académico definido por la UGR.

---

## Navegación paso a paso

- Visualización progresiva de segmentos
- Flechas direccionales sobre el mapa
- Centrado automático en el siguiente punto
- Panel lateral de navegación (escritorio)
- Barra de controles fija en parte inferior (móvil)

---

## Rutas dinámicas por cercanía

El usuario puede generar rutas automáticas usando:

- Su posición actual en el mapa
- Puntos cercanos dentro de un radio de 350m
- Reordenación automática mediante OSRM

---

## Filtros avanzados

### Evitar lugares de pago
Excluye automáticamente puntos turísticos marcados como de pago.

### Tiempo disponible
El usuario puede indicar cuántas horas tiene disponibles y la aplicación:

- Calcula duración estimada
- Limita automáticamente la cantidad de puntos
- Ajusta la ruta resultante dinámicamente

---

## Sistema de duración estimada

La aplicación calcula:

- Tiempo de trayecto real (OSRM)
- Tiempo estimado de visita por punto (15 min por punto)
- Duración total aproximada de la ruta

---

## Modo historiador

Permite mostrar información histórica extendida dentro de los popups del mapa,
activable directamente desde el popup de cada marcador.

---

## Visualización avanzada de mapa

- Clustering de marcadores agrupados por ruta con colores diferenciados
- Marcadores personalizados por ruta
- Numeración automática de puntos
- Flechas de dirección sobre los segmentos
- Popups enriquecidos
- Centrado dinámico del mapa

---

# Panel de administración

Accesible desde `/admin`. Protegido por PIN de acceso. Existen dos roles
con permisos distintos.

## Roles

### Superadmin
Acceso completo a todas las funciones de gestión:

- Crear, editar y eliminar rutas
- Gestionar puntos de cada ruta (crear, editar, reordenar, quitar, borrar)
- Añadir puntos existentes a rutas
- Editar bibliografía de rutas
- Activar o desactivar rutas y puntos

### Admin Historiador
Acceso limitado a:

- Editar los campos descriptivos de puntos existentes (nombre, descripción, URL, importancia, pago)
- Editar la bibliografía de cada ruta
- No puede modificar coordenadas, estado activo, ni crear o borrar elementos

## Funcionalidades del panel

### Gestión de rutas
Tabla con todas las rutas del sistema. Acciones disponibles según rol:

- Editar nombre, descripción, bibliografía y estado activo
- Acceder al gestor de puntos de cada ruta
- Eliminar ruta (con confirmación)

### Gestor de puntos por ruta
Vista dedicada por ruta con:

- Lista de puntos con drag & drop para reordenar visualmente
- Editar cada punto individualmente
- Añadir un punto existente del sistema a la ruta
- Crear un nuevo punto directamente asociado a la ruta
- Quitar un punto de la ruta sin borrarlo del sistema

### Formulario de punto
Incluye:

- Nombre, descripción, URL, importancia (slider 1-10)
- Coordenadas con mini mapa integrado: clic en el mapa para seleccionar ubicación
- Ruta asociada, acceso de pago, estado activo

### Vista de todos los puntos
Tabla con buscador que muestra todos los puntos del sistema
independientemente de su ruta. Permite editar y borrar.

---

# Interfaz móvil

La aplicación es completamente funcional en dispositivos móviles.
El panel de administración no está adaptado para móvil intencionadamente.

---

# Tecnologías utilizadas

## Frontend

- React
- Vite
- Leaflet / react-leaflet
- leaflet.markercluster / react-leaflet-cluster
- leaflet-polylinedecorator
- @dnd-kit/core + @dnd-kit/sortable (drag & drop en panel admin)
- react-router-dom

---

## Backend

- Python
- FastAPI
- SQLAlchemy
- psycopg2
- python-dotenv

---

## Base de datos

- PostgreSQL
- Supabase

---

## Enrutamiento

- OSRM (Open Source Routing Machine)
- OpenStreetMap
- Algoritmo A* personalizado

---

## Infraestructura

- Docker / Docker Compose

---

## Optimización de rendimiento (caché)

El frontend incluye un sistema de caché en memoria para evitar llamadas
repetidas al backend en datos que cambian con poca frecuencia, como rutas
y puntos turísticos.

- Evita peticiones redundantes a la API
- Reduce carga en el backend (FastAPI)
- Mejora tiempos de respuesta en navegación
- Incluye TTL de 5 minutos (expiración automática)
- Invalida caché automáticamente tras operaciones de administración (CRUD)

La caché se implementa en `src/services/cache.js` y se usa desde la capa
de servicios (`api.js`).

## Estructura del proyecto

```text
nazaroute/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.jsx
│   │   │   ├── MenuRutas.jsx
│   │   │   ├── MenuPuntos.jsx
│   │   │   ├── PanelRuta.jsx
│   │   │   ├── PanelBibliografia.jsx
│   │   │   ├── PanelCercanos.jsx
│   │   │   ├── FlechasRuta.jsx
│   │   │   ├── Popup.jsx
│   │   │   ├── movil/
│   │   │   │   ├── DrawerRutas.jsx
│   │   │   │   ├── DrawerPuntos.jsx
│   │   │   │   ├── DrawerBibliografia.jsx
│   │   │   │   ├── DrawerCercanos.jsx
│   │   │   │   └── DrawerNavegacion.jsx
│   │   │   └── admin/
│   │   │       ├── RutasList.jsx
│   │   │       ├── RutaForm.jsx
│   │   │       ├── PuntosList.jsx
│   │   │       ├── PuntoForm.jsx
│   │   │       ├── PuntosDeRuta.jsx
│   │   │       └── ConfirmModal.jsx
│   │   ├── pages/
│   │   │   └── AdminPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── osrm.js
│   │   │   └── astar.js
│   │   ├── utils/
│   │   │   ├── coloresRuta.js
│   │   │   └── distancia.js
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── header.css
│   │   │   ├── mapa.css
│   │   │   ├── MenuRutas.css
│   │   │   ├── MenuPuntos.css
│   │   │   ├── PanelRuta.css
│   │   │   ├── PanelBibliografia.css
│   │   │   ├── PanelCercanos.css
│   │   │   ├── Popup.css
│   │   │   ├── AdminPage.css
│   │   │   ├── AdminSection.css
│   │   │   ├── AdminButton-other.css
│   │   │   └── ConfirmModal.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── assets/
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── crud.py
│   ├── schemas.py
│   └── models.py
│
├── docker/
│   └── docker-compose.osrm.yml
│
└── osrm/
    ├── input/
    ├── walking/
    ├── prepare-osrm.sh
    └── README.md
```

---

## Requisitos previos

- Node.js >= 18
- Python >= 3.10
- Docker instalado y corriendo

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/nazaroute.git
cd nazaroute
```

### 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Instalar dependencias del backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Configurar y lanzar OSRM

Ver sección [Configuración de OSRM](#configuración-de-osrm).

---

## Configuración de OSRM

NazaRoute utiliza OSRM para calcular rutas reales a pie respetando aceras,
zonas peatonales y restricciones de acceso.

### Descargar el dataset

```bash
mkdir -p ./osrm/input
wget https://download.geofabrik.de/europe/spain/andalusia-latest.osm.pbf \
     -O ./osrm/input/andalusia-latest.osm.pbf
```

### Generar el dataset

```bash
chmod +x ./osrm/prepare-osrm.sh
./osrm/prepare-osrm.sh ./osrm/input/andalusia-latest.osm.pbf
```

El script ejecuta internamente tres pasos:

1. `osrm-extract` — lee el `.osm.pbf` y aplica el perfil `foot.lua`
2. `osrm-partition` — divide la red para el algoritmo MLD
3. `osrm-customize` — aplica los pesos de velocidad finales

### Levantar el servidor

Desde la carpeta `/docker/`:

```bash
docker compose -f docker-compose.osrm.yml up -d
```

Servidor expuesto en:

- `localhost:5001` — perfil a pie (walking)

### Verificar que funciona

```bash
curl "http://localhost:5001/route/v1/foot/-3.5986,37.1773;-3.5900,37.1800?overview=full&geometries=geojson"
```

---

## Backend

El backend expone una API REST. Corre por defecto en `http://localhost:8000`.

| Método | Endpoint               | Descripción                              |
|--------|------------------------|------------------------------------------|
| GET    | `/rutas`               | Lista todas las rutas                    |
| GET    | `/rutas/{id}`          | Detalle de una ruta                      |
| GET    | `/rutas/{id}/puntos`   | Puntos de una ruta                       |
| POST   | `/rutas`               | Crear ruta (superadmin)                  |
| PATCH  | `/rutas/{id}`          | Editar ruta (superadmin)                 |
| DELETE | `/rutas/{id}`          | Eliminar ruta (superadmin)               |
| GET    | `/puntos`              | Lista todos los puntos                   |
| GET    | `/puntos/{id}`         | Detalle de un punto                      |
| POST   | `/puntos`              | Crear punto (superadmin)                 |
| PATCH  | `/puntos/{id}`         | Editar punto (superadmin / historiador)  |
| DELETE | `/puntos/{id}`         | Eliminar punto (superadmin)              |

---

## Frontend

El frontend corre por defecto en `http://localhost:5173`.

Las llamadas a OSRM se realizan desde `src/services/osrm.js` contra
`http://localhost:5001`.

El panel de administración es accesible en `/admin`.

---

## Nota sobre versionado

Los siguientes archivos **no deben subirse** al repositorio:

- Ficheros `.osm.pbf`
- Datasets generados por OSRM (`osrm/walking/`)
- Fichero `.env` con variables de entorno
