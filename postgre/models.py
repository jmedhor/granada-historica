from sqlalchemy import Column, Integer, String, Float, Table, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
# Tabla intermedia ruta <-> punto
ruta_punto = Table(
    "ruta_punto",
    Base.metadata,
    Column("ruta_id", Integer, ForeignKey("rutas.id")),
    Column("punto_id", Integer, ForeignKey("puntos.id")),
)

class Punto(Base):
    __tablename__ = "puntos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, default="")
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)

    pago = Column(Boolean, default=False)
    url = Column(String, nullable=True)
    importancia = Column(Integer, default=5)


    rutas = relationship("Ruta", secondary=ruta_punto, back_populates="puntos")


class Ruta(Base):
    __tablename__ = "rutas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, default="")

    bibliografia = Column(
        String,
        default="Información procedente de la facultad de historia por la Universidad de Granada"
    )

    puntos = relationship("Punto", secondary=ruta_punto, back_populates="rutas")
