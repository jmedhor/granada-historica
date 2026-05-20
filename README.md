# NazaRoute

NazaRoute es una aplicación web de rutas turísticas históricas por la ciudad
de Granada. Permite al usuario explorar puntos de interés cultural e histórico
siguiendo rutas diseñadas con rigor académico, con información aportada por la
Universidad de Granada (UGR).

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

## Descripción general

NazaRoute ofrece al usuario distintas rutas turísticas peatonales por Granada,
con un fuerte enfoque en el contexto histórico de la ciudad. Cada punto de
interés incluye información histórica detallada, bibliografía académica y
opciones de navegación paso a paso.

En un futuro se contempla la expansión a otros medios de transporte
y otras mejoras varias para mejorar la sensación general de la aplicacion.

---

## Funcionalidades principales

- Visualización de rutas históricas sobre mapa interactivo (Leaflet)
- Dos modos de ruta: **orden histórico** y **ruta más corta** (algoritmo A*)
- Navegación paso a paso por los puntos de interés
- Filtro de lugares de pago y tiempo límite del usuario
- Panel de bibliografía académica por ruta (UGR)
- Detección de puntos de interés cercanos al usuario con posibilidad de ruta por los mismos
- Modo historiador con información extendida en los popups

---

## Tecnologías utilizadas

### Frontend
- React + Vite
- Leaflet / react-leaflet
- react-leaflet-cluster
- leaflet-polylinedecorator

### Backend
- Python (FastAPI)
- Base de datos con Postgre usando Supabase

### Enrutamiento
- OSRM (Open Source Routing Machine)
- Algoritmo A* propio para optimización del orden de visita

### Infraestructura
- Docker + Docker Compose

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
│   │   │   ├── PanelBibliografia.jsx
│   │   │   └── PanelCercanos.jsx
│   │   ├── services/
│   │   │   ├── osrm.js        # Llamadas a la API de OSRM
│   │   │   └── astar.js       # Algoritmo A*
|   |   |
│   │   ├── utils/
│   │   │   ├── coloresRuta.js # Archivo con colores de cada ruta
│   │   │   └── distancia.js   # Cálculo de distancias
│   │   └── App.jsx
│   └── App.css
│
├── backend/                   # API Python (FastAPI)
│   └── main.py
│
├── docker/                    # Configuración Docker
│   └── docker-compose.osrm.yml
│
└── osrm/                      # Datos y scripts de OSRM
    ├── input/                 # ficheros .osm.pbf (no versionados)
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
