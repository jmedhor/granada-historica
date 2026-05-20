from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import crud
import schemas
from database import engine, get_db

# Crea las tablas en Supabase si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Rutas Históricas Granada")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensaje": "API de rutas históricas funcionando 🚀"}

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

@app.get("/puntos")
def obtener_todos_puntos(db: Session = Depends(get_db)):
    return crud.get_todos_puntos(db)
