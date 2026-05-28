from sqlalchemy.orm import Session
from models import Ruta, Punto, ruta_punto
from schemas import RutaCreate, RutaUpdate, PuntoCreate, PuntoUpdate

# ---------------------------------------------------
# RUTAS - LECTURA
# ---------------------------------------------------

def get_rutas(db: Session):
    return db.query(Ruta).all()

def get_ruta(db: Session, ruta_id: int):
    return db.query(Ruta).filter(Ruta.id == ruta_id).first()

def get_puntos_de_ruta(db: Session, ruta_id: int):
    ruta = get_ruta(db, ruta_id)
    if not ruta:
        return None

    resultado = []

    for punto in ruta.puntos:
        resultado.append({
            "id": punto.id,
            "nombre": punto.nombre,
            "descripcion": punto.descripcion,
            "latitud": punto.latitud,
            "longitud": punto.longitud,
            "ruta_id": ruta.id,
            "ruta_nombre": ruta.nombre,
            "pago": punto.pago,
            "url": punto.url,
            "importancia": punto.importancia,
            "activo": punto.activo,
            "imagen":              punto.imagen,
            "descripcion_extensa": punto.descripcion_extensa,
            "importe":             punto.importe,
            "horarios":            punto.horarios,
            "tiempo_visita":       punto.tiempo_visita,
            "info_accesible":      punto.info_accesible,
        })

    return resultado

def get_todos_puntos(db: Session):
    """
    Devuelve todos los puntos con info de su ruta.
    Incluye puntos sin ruta asignada (ruta_id = None).
    """
    todos = db.query(Punto).all()
    resultado = []

    for punto in todos:
        # Obtener la ruta asociada si existe
        ruta = punto.rutas[0] if punto.rutas else None

        resultado.append({
            "id":          punto.id,
            "nombre":      punto.nombre,
            "descripcion": punto.descripcion,
            "latitud":     punto.latitud,
            "longitud":    punto.longitud,
            "ruta_id":     ruta.id if ruta else None,
            "ruta_nombre": ruta.nombre if ruta else None,
            "ruta_activa": ruta.activo if ruta else False,
            "pago":        punto.pago,
            "url":         punto.url,
            "importancia": punto.importancia,
            "activo":      punto.activo,
            "imagen":              punto.imagen,
            "descripcion_extensa": punto.descripcion_extensa,
            "importe":             punto.importe,
            "horarios":            punto.horarios,
            "tiempo_visita":       punto.tiempo_visita,
            "info_accesible":      punto.info_accesible,
        })

    return resultado

# ---------------------------------------------------
# RUTAS - ESCRITURA (SUPERADMIN)
# ---------------------------------------------------

def create_ruta(db: Session, datos: RutaCreate):
    """
    Crea una nueva ruta en la base de datos.
    """
    nueva_ruta = Ruta(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        bibliografia=datos.bibliografia,
        activo=datos.activo,
    )
    db.add(nueva_ruta)
    db.commit()
    db.refresh(nueva_ruta)
    return nueva_ruta

def update_ruta(db: Session, ruta_id: int, datos: RutaUpdate):
    """
    Actualiza los campos de una ruta existente.
    Solo modifica los campos que vengan en el payload.
    """
    ruta = get_ruta(db, ruta_id)
    if not ruta:
        return None

    # Actualiza solo los campos enviados
    campos = datos.model_dump(exclude_unset=True)
    for campo, valor in campos.items():
        setattr(ruta, campo, valor)

    db.commit()
    db.refresh(ruta)
    return ruta

def delete_ruta(db: Session, ruta_id: int):
    """
    Elimina una ruta y sus relaciones en ruta_punto.
    Los puntos huerfanos NO se eliminan automaticamente
    para no perder datos; deben borrarse explicitamente.
    """
    ruta = get_ruta(db, ruta_id)
    if not ruta:
        return False

    db.delete(ruta)
    db.commit()
    return True

# ---------------------------------------------------
# PUNTOS - LECTURA
# ---------------------------------------------------

def get_punto(db: Session, punto_id: int):
    return db.query(Punto).filter(Punto.id == punto_id).first()

# ---------------------------------------------------
# PUNTOS - ESCRITURA (SUPERADMIN)
# ---------------------------------------------------

def create_punto(db: Session, datos: PuntoCreate):
    """
    Crea un nuevo punto y lo asocia a la ruta indicada
    mediante la tabla intermedia ruta_punto.
    """
    nuevo_punto = Punto(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        latitud=datos.latitud,
        longitud=datos.longitud,
        pago=datos.pago,
        url=datos.url,
        importancia=datos.importancia,
        activo=datos.activo,
        imagen=datos.imagen,
        descripcion_extensa=datos.descripcion_extensa,
        importe=datos.importe,
        horarios=datos.horarios,
        tiempo_visita=datos.tiempo_visita,
        info_accesible=datos.info_accesible,
    )
    db.add(nuevo_punto)
    db.flush()  # Necesario para obtener el id antes del commit

    # Asociar a la ruta si se indica
    if datos.ruta_id:
        ruta = get_ruta(db, datos.ruta_id)
        if ruta:
            ruta.puntos.append(nuevo_punto)

    db.commit()
    db.refresh(nuevo_punto)
    return nuevo_punto

def update_punto(db: Session, punto_id: int, datos: PuntoUpdate):
    punto = get_punto(db, punto_id)
    if not punto:
        return None

    campos = datos.model_dump(exclude_unset=True)

    # Extraer ruta_id ANTES de iterar campos
    # "ruta_id" in campos indica que el cliente lo mandó explícitamente
    ruta_id_enviada = "ruta_id" in campos
    nueva_ruta_id = campos.pop("ruta_id", None)

    for campo, valor in campos.items():
        setattr(punto, campo, valor)

    # Si el cliente mandó ruta_id (aunque sea null), actualizar relacion
    if ruta_id_enviada:
        punto.rutas.clear()
        if nueva_ruta_id is not None:
            nueva_ruta = get_ruta(db, nueva_ruta_id)
            if nueva_ruta:
                nueva_ruta.puntos.append(punto)

    db.commit()
    db.refresh(punto)
    return punto

def delete_punto(db: Session, punto_id: int):
    """
    Elimina un punto y sus relaciones en ruta_punto.
    """
    punto = get_punto(db, punto_id)
    if not punto:
        return False

    db.delete(punto)
    db.commit()
    return True
