import { useState } from 'react';
import { useReservaService } from '../../hooks/Reserva';

const CrearReserva = ({ espacioId, espacioName, closeModal }) => {
  const { crearReserva } = useReservaService();
  const [fechaDesde, setFechaDesde] = useState('');
  const [horaDesde, setHoraDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [horaHasta, setHoraHasta] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inicio = new Date(`${fechaDesde}T${horaDesde}`);
    const fin = new Date(`${fechaHasta}T${horaHasta}`);
    
    if (inicio >= fin) {
      setMensaje('La fecha/hora de inicio debe ser anterior a la de fin');
      return;
    }

    try {
      await crearReserva(espacioId, fechaDesde, horaDesde, fechaHasta, horaHasta);
      setMensaje('Reserva creada con éxito');
      setFechaDesde('');
      setHoraDesde('');
      setFechaHasta('');
      setHoraHasta('');
      setTimeout(() => closeModal(), 2000);
    } catch (error) {
      setMensaje('Error al crear la reserva');
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Crear Reserva para {espacioName}</h2>
          <button className="modal-close-btn" onClick={closeModal}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="hidden" value={espacioId} required />
          <div className="modal-form-group">
            <label className="modal-label">Espacio:</label>
            <p>{espacioName}</p>
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Desde:</label>
            <input type="date" className="modal-input" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} required />
            <input type="time" className="modal-input" value={horaDesde} onChange={(e) => setHoraDesde(e.target.value)} required />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Hasta:</label>
            <input type="date" className="modal-input" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} required />
            <input type="time" className="modal-input" value={horaHasta} onChange={(e) => setHoraHasta(e.target.value)} required />
          </div>
          {mensaje && <p className={`modal-message ${mensaje.includes('éxito') ? 'modal-message-success' : 'modal-message-error'}`}>{mensaje}</p>}
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="modal-btn modal-btn-submit">Reservar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearReserva;
