#!/usr/bin/env bash

# ==============================================================
# NazaRoute — Script de preprocesado de datos OSRM
# ==============================================================
#
# Proyecto:     NazaRoute
# Descripcion:  Prepara el dataset de OSRM para el perfil
#               a pie (foot) usando datos de OpenStreetMap.
#
# Uso:
#   chmod +x prepare-osrm.sh
#   ./prepare-osrm.sh ./osrm/input/andalucia.osm.pbf
#
# Requisitos:
#   - Docker instalado y corriendo
#   - Archivo .osm.pbf descargado desde Geofabrik
#
# El script genera los archivos necesarios en osrm/walking/
# para que el servidor OSRM pueda calcular rutas a pie.
# ==============================================================

set -euo pipefail

# --------------------------------------------------------------
# VALIDACION DE ARGUMENTOS
# --------------------------------------------------------------

if [[ $# -lt 1 ]]; then
  echo "Uso: ./prepare-osrm.sh <ruta-al-archivo.osm.pbf>"
  echo "Ejemplo: ./prepare-osrm.sh ./osrm/input/andalucia.osm.pbf"
  exit 1
fi

# --------------------------------------------------------------
# VARIABLES PRINCIPALES
# --------------------------------------------------------------

PBF_PATH="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
OSRM_DIR="${REPO_ROOT}/osrm"

# --------------------------------------------------------------
# VALIDACION DEL ARCHIVO PBF
# --------------------------------------------------------------

if [[ ! -f "${PBF_PATH}" ]]; then
  echo "[ERROR] No se encuentra el fichero PBF: ${PBF_PATH}"
  exit 1
fi

# --------------------------------------------------------------
# CREACION DE ESTRUCTURA DE CARPETAS
# --------------------------------------------------------------

echo "[NazaRoute] Creando estructura de carpetas..."
mkdir -p "${OSRM_DIR}/input" "${OSRM_DIR}/walking"

# --------------------------------------------------------------
# COPIA DEL ARCHIVO PBF AL DIRECTORIO DE TRABAJO
# --------------------------------------------------------------

INPUT_BASENAME="$(basename "${PBF_PATH}")"
INPUT_TARGET="${OSRM_DIR}/input/${INPUT_BASENAME}"

if [[ "$(realpath "${PBF_PATH}")" != "$(realpath -m "${INPUT_TARGET}")" ]]; then
  echo "[NazaRoute] Copiando archivo PBF a osrm/input/..."
  cp "${PBF_PATH}" "${INPUT_TARGET}"
fi

# --------------------------------------------------------------
# FUNCION: Ejecuta un comando dentro del contenedor OSRM
# --------------------------------------------------------------

run_osrm() {
  local command="$1"
  echo ">> ${command}"
  docker run --rm -t \
    -v "${OSRM_DIR}:/workspace" \
    osrm/osrm-backend \
    bash -lc "${command}"
}

# --------------------------------------------------------------
# FUNCION: Preprocesa un perfil de movilidad
#
# Argumentos:
#   $1 - Nombre del perfil (ej: walking)
#   $2 - Archivo Lua del perfil (ej: foot.lua)
#   $3 - Nombre base del archivo de salida (ej: granada-foot)
#
# Pasos:
#   1. osrm-extract  -> lee el .osm.pbf y aplica el perfil Lua
#   2. osrm-partition -> divide la red para el algoritmo MLD
#   3. osrm-customize -> aplica los pesos de velocidad finales
# --------------------------------------------------------------

prepare_profile() {
  local profile_name="$1"
  local lua_profile="$2"
  local output_stem="$3"

  local workspace_input="/workspace/input/${INPUT_BASENAME}"
  local workspace_dir="/workspace/${profile_name}"
  local output_base="${workspace_dir}/${output_stem}"

  echo
  echo "[NazaRoute] Preparando perfil '${profile_name}'..."

  run_osrm "mkdir -p ${workspace_dir}"
  run_osrm "cp ${workspace_input} ${output_base}.osm.pbf"
  run_osrm "osrm-extract -p /opt/${lua_profile} ${output_base}.osm.pbf"
  run_osrm "osrm-partition ${output_base}.osrm"
  run_osrm "osrm-customize ${output_base}.osrm"

  echo "[NazaRoute] Perfil '${profile_name}' generado correctamente."
}

# --------------------------------------------------------------
# PREPROCESADO — PERFIL A PIE
# --------------------------------------------------------------

prepare_profile "walking" "foot.lua" "granada-foot"

# --------------------------------------------------------------
# FIN
# --------------------------------------------------------------

echo
echo "[NazaRoute] Dataset OSRM generado correctamente."
echo "[NazaRoute] Ya puedes lanzar el servidor con:"
echo "  docker compose -f docker-compose.osrm.yml up -d"
