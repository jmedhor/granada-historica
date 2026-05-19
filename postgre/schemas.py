from pydantic import BaseModel
from typing import List, Optional

class PuntoBase(BaseModel):
    nombre: str
    descripcion: str = ""
    latitud: float
    longitud: float
    pago: bool = False
    url: Optional[str] = None
    importancia: int = 5
    activo: bool = True

class PuntoOut(PuntoBase):
    id: int

    class Config:
        from_attributes = True

class RutaBase(BaseModel):
    nombre: str
    descripcion: str = ""
    bibliografia: Optional[str] = "Información procedente de la facultad de historia por la Universidad de Granada"
    activo: bool = True

class RutaOut(RutaBase):
    id: int
    puntos: List[PuntoOut] = []

    class Config:
        from_attributes = True
