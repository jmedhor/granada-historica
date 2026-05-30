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
- [Configuración de HTTPS local (mkcert)](#configuración-de-https-local-mkcert)
- [Configuración de OSRM](#configuración-de-osrm)
- [Configuración de Nginx con Docker](#configuración-de-nginx-con-docker)
- [Configuracion de autenticacion](#configuracion-de-autenticacion)
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

- Cercanía al usuario (posición GPS real)
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

## Localización GPS

La aplicación obtiene la posición real del usuario mediante la API de
geolocalización del navegador (`navigator.geolocation`).

- La posición se actualiza automáticamente cada 5 segundos
- Se usa `getCurrentPosition` en un intervalo para mayor control
- La posición actualizada dispara automáticamente el recálculo de rutas
  dinámicas y el filtrado de puntos cercanos
- **Requiere origen seguro (HTTPS)** — ver sección
  [Configuración de HTTPS local](#configuración-de-https-local-mkcert)

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

- Su posición GPS actual
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
- Tiempo estimado de visita por punto (configurable por punto, 15 min por defecto)
- Duración total aproximada de la ruta

---

## Modo historiador

Permite mostrar información histórica extendida dentro de los popups del mapa,
activable directamente desde el popup de cada marcador.

---

## Visualización avanzada de mapa

- Clustering de marcadores agrupados por ruta con colores diferenciados
- Marcadores SVG dinámicos coloreados según el color asignado a cada ruta
- Numeración automática de puntos
- Flechas de dirección sobre los segmentos
- Popups enriquecidos con imagen, horarios, accesibilidad y enlace a restaurantes cercanos
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
- Asignar color a cada ruta (selector visual con rueda de color)

### Admin Historiador
Acceso limitado a:

- Editar los campos descriptivos de puntos existentes (nombre, descripción, URL, importancia, pago)
- Editar la bibliografía de cada ruta
- No puede modificar coordenadas, estado activo, ni crear o borrar elementos

## Funcionalidades del panel

### Gestión de rutas
Tabla con todas las rutas del sistema. Acciones disponibles según rol:

- Editar nombre, descripción, bibliografía, color y estado activo
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

- Nombre, descripción breve y descripción extensa
- URL, imagen, horarios, tiempo medio de visita, accesibilidad
- Importe de pago (visible solo si el punto es de pago)
- Importancia (slider 1-10)
- Coordenadas con mini mapa integrado
- Ruta asociada, acceso de pago, estado activo

### Vista de todos los puntos
Tabla con buscador que muestra todos los puntos del sistema
independientemente de su ruta. Permite editar y borrar.

---

# Interfaz móvil

La aplicación es completamente funcional en dispositivos móviles.
El panel de administración no está adaptado para móvil intencionadamente.

---

## Autenticación y seguridad

El sistema de administración está protegido mediante autenticación basada en JWT.

### Funcionamiento

- El login se realiza contra `/auth/login` enviando una contraseña.
- El backend valida la contraseña mediante hashes bcrypt almacenados en variables de entorno (`.env`).
- Si las credenciales son correctas, se genera un token JWT con el rol del usuario (`superadmin` o `historiador`).
- Este token se guarda en el frontend (sessionStorage) y se envía automáticamente en las peticiones protegidas.

### Roles

- **superadmin** → acceso completo (crear, editar y eliminar rutas y puntos)
- **historiador** → acceso limitado a edición de contenido descriptivo

### Protección de endpoints

Las rutas de escritura del backend están protegidas mediante JWT:

- Sin token → acceso denegado (401)
- Token inválido → acceso denegado (401)
- Rol insuficiente → acceso prohibido (403)

Para configurar la autenticación ver sección [Configuración de Autenticación](#configuracion-de-autenticacion).

---

# Tecnologías utilizadas

## Frontend

- React
- Vite
- Leaflet / react-leaflet
- leaflet.markercluster / react-leaflet-cluster
- leaflet-polylinedecorator
- react-router-dom

## Backend

- Python
- FastAPI
- SQLAlchemy
- psycopg2
- python-dotenv

## Base de datos

- PostgreSQL
- Supabase

## Enrutamiento

- OSRM (Open Source Routing Machine)
- OpenStreetMap
- Algoritmo A* personalizado

## Infraestructura

- Docker / Docker Compose
- Nginx (proxy inverso SSL para OSRM)
- mkcert (certificados SSL locales de confianza)

## Optimización de rendimiento (caché)

El frontend incluye un sistema de caché en memoria para evitar llamadas
repetidas al backend en datos que cambian con poca frecuencia.

- Evita peticiones redundantes a la API
- Reduce carga en el backend (FastAPI)
- Mejora tiempos de respuesta en navegación
- Incluye TTL de 5 minutos (expiración automática)
- Invalida caché automáticamente tras operaciones de administración (CRUD)

La caché se implementa en `src/services/cache.js` y se usa desde la capa
de servicios (`api.js`).

---

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
│   │   │   ├── PopupInformacion.jsx
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
│   │   │   ├── astar.js
│   │   │   └── cache.js
│   │   ├── utils/
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
│   ├── 192.168.1.X.pem          ← certificado SSL local (no subir al repo)
│   ├── 192.168.1.X-key.pem      ← clave privada SSL local (no subir al repo)
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── crud.py
│   ├── schemas.py
│   ├── models.py
│   ├── auth.py
│   ├── 192.168.1.X.pem          ← certificado SSL local (no subir al repo)
│   ├── 192.168.1.X-key.pem      ← clave privada SSL local (no subir al repo)
│   └── .env                     ← variables de entorno (no subir al repo)
│
├── docker/
│   ├── docker-compose.osrm.yml
│   └── nginx.conf
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
- mkcert (para HTTPS local)

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
npm run dev -- --host
```

### 3. Instalar dependencias del backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --ssl-keyfile ./192.168.1.X-key.pem --ssl-certfile ./192.168.1.X.pem --host 0.0.0.0 --port 8000
```

### 4. Configurar HTTPS local

Ver sección [Configuración de HTTPS local (mkcert)](#configuración-de-https-local-mkcert).

### 5. Configurar y lanzar OSRM con Nginx

Ver secciones [Configuración de OSRM](#configuración-de-osrm) y
[Configuración de Nginx con Docker](#configuración-de-nginx-con-docker).

---

## Configuración de HTTPS local (mkcert)

La geolocalización GPS del navegador **solo funciona en orígenes seguros**
(HTTPS o localhost). Para desarrollo en red local con una IP tipo
`192.168.x.x` es necesario generar certificados SSL de confianza con mkcert.

### Instalar mkcert

**Linux:**
```bash
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-*
sudo mv mkcert-* /usr/local/bin/mkcert
```

### Instalar la CA raíz en el sistema

Este paso hace que el navegador confíe en los certificados generados:

```bash
mkcert -install
```

### Generar el certificado para tu IP local

Sustituye `192.168.1.X` por tu IP real:

```bash
mkcert 192.168.1.X
```

Esto genera dos archivos en el directorio actual:

- `192.168.1.X.pem` — certificado público
- `192.168.1.X-key.pem` — clave privada

Copia estos archivos tanto a la carpeta `frontend/` como a `backend/`.

> **Importante:** añade ambos archivos al `.gitignore`. No deben subirse al repositorio.

### Configurar Vite para usar HTTPS

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    https: {
      cert: fs.readFileSync('./192.168.1.X.pem'),
      key:  fs.readFileSync('./192.168.1.X-key.pem'),
    }
  }
})
```

El frontend quedará accesible en `https://192.168.1.X:5173`.

### Configurar el backend FastAPI para usar HTTPS

Lanza uvicorn con los certificados:

```bash
uvicorn main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --ssl-certfile ./192.168.1.X.pem \
  --ssl-keyfile  ./192.168.1.X-key.pem
```

El backend quedará accesible en `https://192.168.1.X:8000`.

### Actualizar las URLs en el frontend

```js
// api.js
const BASE_URL = "https://192.168.1.X:8000"
```

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

Ver sección [Configuración de Nginx con Docker](#configuración-de-nginx-con-docker)
para lanzar OSRM junto con el proxy HTTPS.

### Verificar que funciona

```bash
curl "http://localhost:5001/route/v1/foot/-3.5986,37.1773;-3.5900,37.1800?overview=full&geometries=geojson"
```

---

## Configuración de Nginx con Docker

OSRM no soporta SSL de forma nativa. Para que el frontend (que corre en HTTPS)
pueda comunicarse con OSRM sin errores de contenido mixto, se usa un proxy
inverso Nginx que termina el SSL y reenvía las peticiones al contenedor OSRM
en HTTP internamente.

### Estructura del docker-compose

```yaml
# docker/docker-compose.osrm.yml

services:

  osrm-walking:
    image: osrm/osrm-backend:latest
    container_name: nazaroute-osrm-walking
    command: osrm-routed --algorithm mld /data/granada-foot.osrm
    volumes:
      - ../osrm/walking:/data:ro
    ports:
      - "5001:5000"

  nginx:
    image: nginx:alpine
    container_name: nazaroute-nginx
    ports:
      - "5443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /ruta/absoluta/a/192.168.1.X.pem:/etc/ssl/cert.pem:ro
      - /ruta/absoluta/a/192.168.1.X-key.pem:/etc/ssl/key.pem:ro
    depends_on:
      - osrm-walking
```

Sustituye `/ruta/absoluta/a/` por la ruta real donde tienes los `.pem`.
Para obtenerla:

```bash
find ~ -name "192.168.1.X.pem" 2>/dev/null
```

### Configuración de Nginx

```nginx
# docker/nginx.conf

events {}

http {
  server {
    listen 443 ssl;

    ssl_certificate     /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    location / {
      proxy_pass http://osrm-walking:5000;
      proxy_set_header Host $host;
    }
  }
}
```

### Lanzar los contenedores

```bash
cd docker
docker compose -f docker-compose.osrm.yml up -d
```

### Verificar que Nginx sirve OSRM por HTTPS

```bash
curl "https://192.168.1.X:5443/route/v1/foot/-3.5986,37.1773;-3.5900,37.1800?overview=full&geometries=geojson"
```

### Actualizar la URL de OSRM en el frontend

```js
// osrm.js
const OSRM_URL = "https://192.168.1.X:5443"
```

---

## Configuración de autenticación

Para que el sistema funcione, es necesario definir las siguientes variables en el archivo `.env` del backend:

```env
SECRET_KEY=clave_larga_aleatoria_segura
HASH_SUPERADMIN=$2b$12$...
HASH_HISTORIADOR=$2b$12$...
```

### Cómo generar nuevas contraseñas

**1. Instalar dependencias (si no están instaladas)**

```bash
pip install passlib[bcrypt]
```

**2. Crear un script temporal de generación (test.py)**

```python
from passlib.context import CryptContext

ctx = CryptContext(schemes=["bcrypt"])

print(ctx.hash("tu_password_superadmin"))
print(ctx.hash("tu_password_historiador"))
```

**3. Ejecutarlo**

```bash
python3 test.py
```

**4. Guardar resultados**

El script devolverá algo como:

```
$2b$12$N1Qp...hash_superadmin...
$2b$12$K9xZ...hash_historiador...
```

Copia esos valores y pégalos en el `.env`.

---

## Backend

El backend expone una API REST. Corre por defecto en `https://192.168.1.X:8000`
(o `http://localhost:8000` en desarrollo sin certificados).

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

El frontend corre por defecto en `https://192.168.1.X:5173`.

Las llamadas a OSRM se realizan desde `src/services/osrm.js` contra
`https://192.168.1.X:5443` (Nginx proxy).

El panel de administración es accesible en `/admin`.

---

## Nota sobre versionado

Los siguientes archivos **no deben subirse** al repositorio:

- Ficheros `.osm.pbf`
- Datasets generados por OSRM (`osrm/walking/`)
- Fichero `.env` con variables de entorno
- Certificados SSL (`*.pem`, `*-key.pem`)
