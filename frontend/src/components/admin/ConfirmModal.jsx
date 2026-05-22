// ---------------------------------------------------
// MODAL DE CONFIRMACION
// Se usa antes de borrar rutas o puntos
// Props:
//   mensaje   - texto a mostrar
//   onConfirm - callback al confirmar
//   onCancel  - callback al cancelar
// ---------------------------------------------------

function ConfirmModal({ mensaje, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <p className="modal-mensaje">{mensaje}</p>

        <div className="modal-acciones">

          <button
            className="btn-modal-cancelar"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            className="btn-modal-confirmar"
            onClick={onConfirm}
          >
            Confirmar
          </button>

        </div>

      </div>
    </div>
  )
}

export default ConfirmModal
