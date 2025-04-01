import { useState } from 'react';
import { useEspacioService } from '../../hooks/Espacio';
import '../../css/modal.css'; 

const CrearEspacio = ({ isOpen, onClose, onEspacioCreado }) => {
  const { crearEspacio } = useEspacioService();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    available: true
  });
  const [mensaje, setMensaje] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje('');

    try {
      await crearEspacio({
        ...formData,
        capacity: parseInt(formData.capacity),
        available: formData.available ? 1 : 0
      });
      setMensaje('Espacio creado con éxito');
      onEspacioCreado();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setMensaje('Error al crear el espacio');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Crear Nuevo Espacio</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label className="modal-label">Nombre:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="modal-input"
            />
          </div>
          
          <div className="modal-form-group">
            <label className="modal-label">Descripción:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="modal-textarea"
            />
          </div>
          
          <div className="modal-form-group">
            <label className="modal-label">Capacidad:</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              className="modal-input"
            />
          </div>
          
          <div className="modal-checkbox-group">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              id="available-checkbox"
              className="modal-checkbox"
            />
            <label htmlFor="available-checkbox" className="modal-label">Disponible</label>
          </div>
          
          {mensaje && (
            <div className={`modal-message ${mensaje.includes('éxito') ? 'modal-message-success' : 'modal-message-error'}`}>
              {mensaje}
            </div>
          )}
          
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="modal-btn modal-btn-cancel"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="modal-btn modal-btn-submit"
            >
              {isLoading ? 'Creando...' : 'Crear Espacio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEspacio;