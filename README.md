# NazaRoute


NazaRoute es una aplicación web de rutas turísticas históricas por la ciudad
de Granada. Permite al usuario explorar puntos de interés cultural e histórico
siguiendo rutas diseñadas con rigor académico, con información aportada por la
Universidad de Granada (UGR).

La aplicación combina mapas interactivos, cálculo de rutas reales mediante OSRM,
filtrado dinámico de puntos turísticos y navegación paso a paso para ofrecer una
experiencia inmersiva y adaptable al tiempo y preferencias del usuario.

---

## Índice

- [Descripción general](#descripción-general)
- [Funcionalidades principales](#funcionalidades-principales)
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

La aplicación permite dos estrategias distintas:

### Ruta más corta
Optimiza automáticamente el recorrido para minimizar la distancia total.

### Ruta histórica
Respeta el orden histórico/académico definido por la UGR.

---

## Navegación paso a paso

- Visualización progresiva de segmentos
- Flechas direccionales sobre el mapa
- Centrado automático en el siguiente punto
- Panel lateral de navegación

---

## Rutas dinámicas por cercanía

El usuario puede generar rutas automáticas usando:

- Su posición actual en el mapa
- Puntos cercanos dentro de un radio configurable
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
- Tiempo estimado de visita por punto
- Duración total aproximada de la ruta

---

## Paneles interactivos

### Panel de puntos
Lista ordenada de puntos turísticos.

### Panel de bibliografía
Bibliografía académica asociada a cada ruta.

### Panel de cercanos
Visualización rápida de puntos próximos al usuario.

---

## Modo historiador

Permite mostrar información histórica extendida dentro de los popups del mapa.

---

## Visualización avanzada de mapa

- Clustering de marcadores
- Marcadores personalizados por ruta
- Numeración automática de puntos
- Flechas de dirección
- Popups enriquecidos
- Centrado dinámico del mapa

---

# Tecnologías utilizadas

## Frontend

- React
- Vite
- Leaflet
- react-leaflet
- leaflet.markercluster
- react-leaflet-cluster
- leaflet-polylinedecorator

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

- Docker
- Docker Compose

---

## Estructura del proyecto

```text
nazaroute/
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes principales
│   │   │   ├── Map.jsx        # Mapa interactivo principal
│   │   │   ├── MenuRutas.jsx  # Lista de rutas disponibles
│   │   │   ├── MenuPuntos.jsx # Lista de puntos de la ruta
│   │   │   ├── PanelRuta.jsx  # Navegación paso a paso
│   │   │   ├── PanelBibliografia.jsx # Menu bibliografia
│   │   │   ├── Popup.jsx # Marcadores para cada punto
│   │   │   └── PanelCercanos.jsx # Menu para puntos cercanos al usuario
│   │   │   └── FlechasRuta.jsx # Decoración para caminos de rutas
|   |   |
│   │   ├── services/
│   │   │   ├── osrm.js        # Llamadas a la API de OSRM
│   │   │   └── astar.js       # Algoritmo A*
|   |   |
│   │   ├── utils/
│   │   │   ├── coloresRuta.js # Archivo con colores de cada ruta
│   │   │   └── distancia.js   # Cálculo de distancias
|   |   |
│   │   ├── App.jsx # Lógica principal de la aplicación
│   |   ├── App.css # Estilos para la aplicacion
│   |   ├── index.css # Estilos para la base de la aplicación
│   |   └── main.jsx # Archivo raíz de la aplicación
|   |
|   ├──assets/ # Imagenes varias para la aplicación
|   |
│   └── package.json # Dependencias para instalación
│
├── backend/                   # API Python (FastAPI) junto a B.D Postgre
│   ├── main.py # Archivo principal de FastAPI
│   ├── database.py # Funcion para obtener la base de datos
│   ├── crud.py # Metodos para obtener la informacion de la BD
│   ├── schemas.py # Definicion de los schemas para las clases de objetos
│   └── models.py # Definicion de modelos para las clases de objetos

│
├── docker/                    # Configuración Docker
│   └── docker-compose.osrm.yml
│
└── osrm/                      # Datos y scripts de OSRM
    ├── input/                 # (CREAR MANUALMENTE - Ver sección 4) ficheros .osm.pbf (no versionados)
    ├── walking/               # dataset OSRM para pie (no versionado)
    ├── prepare-osrm.sh        # script de preprocesado
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

- `localhost:5001` → perfil a pie (walking)

### Verificar que funciona

```bash
curl "http://localhost:5001/route/v1/foot/-3.5986,37.1773;-3.5900,37.1800?overview=full&geometries=geojson"
```

---

## Backend

El backend expone una API REST con los siguientes endpoints principales:

| Método | Endpoint  | Descripción                        |
|--------|-----------|------------------------------------|
| GET    | `/rutas`  | Lista todas las rutas disponibles  |
| GET    | `/puntos` | Lista todos los puntos de interés  |

Corre por defecto en `http://localhost:8000`.

---

## Frontend

El frontend corre por defecto en `http://localhost:5173`.

Las llamadas a OSRM se realizan desde `src/services/osrm.js` contra
`http://localhost:5001`.

---

## Nota sobre versionado

Los siguientes archivos **no deben subirse** al repositorio y están
incluidos en el `.gitignore`:

- Ficheros `.osm.pbf`
- Datasets generados por OSRM (`osrm/walking/`)
