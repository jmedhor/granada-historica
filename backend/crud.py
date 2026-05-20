from sqlalchemy.orm import Session
from models import Ruta, Punto

def get_rutas(db: Session):
    return db.query(Ruta).all()

def get_ruta(db: Session, ruta_id: int):
    return db.query(Ruta).filter(Ruta.id == ruta_id).first()

def get_puntos_de_ruta(db: Session, ruta_id: int):
    ruta = get_ruta(db, ruta_id)
    if ruta:
        return ruta.puntos
    return None

def get_todos_puntos(db: Session):
    """
    Devuelve todos los puntos con info de su ruta.
    Útil para mostrar todos los markers en el mapa.
    """
    resultado = []
    rutas = get_rutas(db)
    for ruta in rutas:
        for punto in ruta.puntos:
            resultado.append({
                "id": punto.id,
                "nombre": punto.nombre,
                "descripcion": punto.descripcion,
                "latitud": punto.latitud,
                "longitud": punto.longitud,
                "ruta_id": ruta.id,
                "ruta_nombre": ruta.nombre,
                "ruta_activa": ruta.activo,
                "pago": punto.pago,
                "url": punto.url,
                "importancia": punto.importancia,
                "activo": punto.activo,
            })
    return resultado
