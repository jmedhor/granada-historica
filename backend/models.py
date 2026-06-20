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
    activo = Column(Boolean, default=True)

    imagen             = Column(String,  nullable=True)
    descripcion_extensa = Column(String, nullable=True)
    importe            = Column(Float,   default=0.0)
    horarios           = Column(String,  nullable=True)
    tiempo_visita      = Column(Integer, nullable=True)   # minutos
    info_accesible     = Column(String, nullable=True)


    rutas = relationship("Ruta", secondary=ruta_punto, back_populates="puntos")

    @property
    def rutas_info(self):
        return [
            {"id": r.id, "nombre": r.nombre, "color": r.color, "activo": r.activo}
            for r in self.rutas
        ]

class Ruta(Base):
    __tablename__ = "rutas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, default="")

    bibliografia = Column(
        String,
        default="Información procedente de la facultad de historia por la Universidad de Granada"
    )
    activo = Column(Boolean, default=True)

    color = Column(String(7), default="#000000")

    puntos = relationship("Punto", secondary=ruta_punto, back_populates="rutas")
