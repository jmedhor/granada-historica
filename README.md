# NazaRoute

Nazaroute es una aplicación de rutas turísticas en el ámbito de granada con un gran enfoque en el contexto histórico de la ciudad.


# OSRM en NazaRoute

NazaRoute utiliza OSRM para calcular rutas reales a pie por las calles
de Granada, respetando aceras, zonas peatonales y restricciones de acceso.

El proyecto está configurado únicamente para el perfil a pie (`foot`),
ya que NazaRoute es una aplicación de rutas turísticas peatonales.
En un futuro se considera la posibilidad de expander las rutas para
considerar distintos medios de transporte.

---

## Estructura esperada

```text
osrm/
├── input/           # ficheros .osm.pbf locales, no versionados
├── walking/         # dataset OSRM para el perfil a pie
├── prepare-osrm.sh  # script de preprocesado (Linux)
└── README.md
```

Archivo principal esperado:

- `walking/granada-foot.osrm`

---

## Requisitos

- Docker instalado y corriendo
- Archivo `.osm.pbf` de Andalucía descargado desde Geofabrik

---

## Descarga del dataset

Se recomienda el extracto de Andalucía para reducir tiempos de preprocesado:

```bash
mkdir -p ./osrm/input
wget https://download.geofabrik.de/europe/spain/andalusia-latest.osm.pbf \
     -O ./osrm/input/andalusia-latest.osm.pbf
```

---

## Generación del dataset

```bash
chmod +x ./osrm/prepare-osrm.sh
./osrm/prepare-osrm.sh ./osrm/input/andalusia-latest.osm.pbf
```

El script ejecuta internamente tres pasos sobre el perfil a pie:

1. `osrm-extract` — lee el `.osm.pbf` y aplica el perfil `foot.lua`
2. `osrm-partition` — divide la red para el algoritmo MLD
3. `osrm-customize` — aplica los pesos de velocidad finales

---

## Levantar el servidor

Una vez generado el dataset lanzamos desde la carpeta /docker/:

```bash
docker compose -f docker-compose.osrm.yml up -d
```

El servidor queda expuesto en:

- `localhost:5001` → perfil a pie (walking)

---

## Verificar que funciona

```bash
curl "http://localhost:5001/route/v1/foot/-3.5986,37.1773;-3.5900,37.1800?overview=full&geometries=geojson"
```

---

## Nota sobre versionado

Los ficheros `.osm.pbf` y los datasets generados (`.osrm`) no deben subirse al
repositorio. El `.gitignore` del proyecto ya está configurado para ignorarlos.
