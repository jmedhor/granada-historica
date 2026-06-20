from pydantic import BaseModel
from typing import List, Optional

# ---------------------------------------------------
# PUNTO - SCHEMAS
# ---------------------------------------------------

class PuntoBase(BaseModel):
    nombre: str
    descripcion: str = ""
    latitud: float
    longitud: float
    pago: bool = False
    url: Optional[str] = None
    importancia: int = 5
    activo: bool = True
    imagen:              Optional[str]   = None
    descripcion_extensa: Optional[str]   = None
    importe:             float           = 0.0
    horarios:            Optional[str]   = None
    tiempo_visita:       Optional[int]   = None
    info_accesible:      Optional[str]   = None

# ---------------------------------------------------
# RUTA ASOCIADA - SCHEMA AUXILIAR
# Representa una ruta tal como aparece colgada de un punto
# ---------------------------------------------------

class RutaAsociada(BaseModel):
    id: int
    nombre: str
    color: str
    activo: bool

    class Config:
        from_attributes = True


class PuntoOut(PuntoBase):
    id: int
    rutas: List[RutaAsociada] = []

    class Config:
        from_attributes = True

class PuntoCreate(PuntoBase):
    """
    Schema para crear un punto nuevo.
    ruta_id es opcional; si se indica, el punto
    se asocia a esa ruta en ruta_punto.
    """
    ruta_ids: Optional[List[int]] = None

class PuntoUpdate(BaseModel):
    """
    Schema para actualizar un punto.
    Todos los campos son opcionales (PATCH semantics).
    """
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    pago: Optional[bool] = None
    url: Optional[str] = None
    importancia: Optional[int] = None
    activo: Optional[bool] = None
    imagen:              Optional[str]   = None
    descripcion_extensa: Optional[str]   = None
    importe:             Optional[float] = None
    horarios:            Optional[str]   = None
    tiempo_visita:       Optional[int]   = None
    info_accesible:      Optional[str]  = None
    ruta_ids: Optional[List[int]] = None

    class Config:
        from_attributes = True

# ---------------------------------------------------
# RUTA - SCHEMAS
# ---------------------------------------------------

class RutaBase(BaseModel):
    nombre: str
    descripcion: str = ""
    bibliografia: Optional[str] = "Información procedente de la facultad de historia por la Universidad de Granada"
    activo: bool = True
    color: str = "#000000"

class RutaOut(RutaBase):
    id: int
    puntos: List[PuntoOut] = []

    class Config:
        from_attributes = True

class RutaCreate(RutaBase):
    """
    Schema para crear una ruta nueva.
    """
    pass

class RutaUpdate(BaseModel):
    """
    Schema para actualizar una ruta.
    Todos los campos son opcionales (PATCH semantics).
    """
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    bibliografia: Optional[str] = None
    activo: Optional[bool] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True


