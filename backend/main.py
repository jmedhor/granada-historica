from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import crud
import schemas
from database import engine, get_db

import os
from pydantic import BaseModel
from jose import jwt, JWTError
from fastapi import Header
from auth import verificar_password, crear_token

class LoginRequest(BaseModel):
    password: str

# Crea las tablas en Supabase si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Rutas Históricas Granada")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://192.168.1.137:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_change_me")
ALGORITHM = "HS256"


def get_current_role(authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("rol")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


# ---------------------------------------------------
# ENDPOINT LOGIN
# ---------------------------------------------------

@app.post("/auth/login")
def login(datos: LoginRequest):

    hash_super = os.getenv("HASH_SUPERADMIN")
    hash_hist = os.getenv("HASH_HISTORIADOR")

    if verificar_password(datos.password, hash_super):
        return {
            "token": crear_token("superadmin"),
            "rol": "superadmin"
        }

    if verificar_password(datos.password, hash_hist):
        return {
            "token": crear_token("historiador"),
            "rol": "historiador"
        }

    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

# ---------------------------------------------------
# RAIZ
# ---------------------------------------------------

@app.get("/")
def inicio():
    return {"mensaje": "API de rutas históricas funcionando 🚀"}

# ---------------------------------------------------
# RUTAS - LECTURA
# ---------------------------------------------------

@app.get("/rutas", response_model=List[schemas.RutaOut])
def obtener_rutas(db: Session = Depends(get_db)):
    return crud.get_rutas(db)

@app.get("/rutas/{ruta_id}", response_model=schemas.RutaOut)
def obtener_ruta(ruta_id: int, db: Session = Depends(get_db)):
    ruta = crud.get_ruta(db, ruta_id)
    if not ruta:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return ruta

@app.get("/rutas/{ruta_id}/puntos", response_model=List[schemas.PuntoOut])
def obtener_puntos(ruta_id: int, db: Session = Depends(get_db)):
    puntos = crud.get_puntos_de_ruta(db, ruta_id)
    if puntos is None:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return puntos

# ---------------------------------------------------
# RUTAS - ESCRITURA (SUPERADMIN)
# ---------------------------------------------------

@app.post("/rutas", response_model=schemas.RutaOut, status_code=201)
def crear_ruta(
    datos: schemas.RutaCreate,
    db: Session = Depends(get_db),
    rol: str = Depends(get_current_role)
):
    if rol != "superadmin":
        raise HTTPException(status_code=403, detail="No autorizado")

    return crud.create_ruta(db, datos)


@app.patch("/rutas/{ruta_id}", response_model=schemas.RutaOut)
def actualizar_ruta(
    ruta_id: int,
    datos: schemas.RutaUpdate,
    db: Session = Depends(get_db),
    rol: str = Depends(get_current_role)
):
    if rol != "superadmin":
        raise HTTPException(status_code=403, detail="No autorizado")

    ruta = crud.update_ruta(db, ruta_id, datos)
    if not ruta:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")

    return ruta


@app.delete("/rutas/{ruta_id}", status_code=204)
def eliminar_ruta(
    ruta_id: int,
    db: Session = Depends(get_db),
    rol: str = Depends(get_current_role)
):
    if rol != "superadmin":
        raise HTTPException(status_code=403, detail="No autorizado")

    eliminada = crud.delete_ruta(db, ruta_id)
    if not eliminada:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")


# ---------------------------------------------------
# PUNTOS - LECTURA
# ---------------------------------------------------

@app.get("/puntos")
def obtener_todos_puntos(db: Session = Depends(get_db)):
    return crud.get_todos_puntos(db)

@app.get("/puntos/{punto_id}", response_model=schemas.PuntoOut)
def obtener_punto(punto_id: int, db: Session = Depends(get_db)):
    punto = crud.get_punto(db, punto_id)
    if not punto:
        raise HTTPException(status_code=404, detail="Punto no encontrado")
    return punto

# ---------------------------------------------------
# PUNTOS - ESCRITURA (SUPERADMIN)
# ---------------------------------------------------

@app.post("/puntos", response_model=schemas.PuntoOut, status_code=201)
def crear_punto(
    datos: schemas.PuntoCreate,
    db: Session = Depends(get_db),
    rol: str = Depends(get_current_role)
):
    if rol != "superadmin":
        raise HTTPException(status_code=403, detail="No autorizado")

    return crud.create_punto(db, datos)


@app.patch("/puntos/{punto_id}", response_model=schemas.PuntoOut)
def actualizar_punto(
    punto_id: int,
    datos: schemas.PuntoUpdate,
    db: Session = Depends(get_db),
    rol: str = Depends(get_current_role)
):
    if rol not in ["superadmin", "historiador"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    punto = crud.update_punto(db, punto_id, datos)
    if not punto:
        raise HTTPException(status_code=404, detail="Punto no encontrado")

    return punto

@app.delete("/puntos/{punto_id}", status_code=204)
def eliminar_punto(
    punto_id: int,
    db: Session = Depends(get_db),
    rol: str = Depends(get_current_role)
):
    if rol != "superadmin":
        raise HTTPException(status_code=403, detail="No autorizado")

    eliminado = crud.delete_punto(db, punto_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Punto no encontrado")
