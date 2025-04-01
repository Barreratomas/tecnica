import { useState, useEffect, useRef } from 'react';
import { useEspacioService } from '../../hooks/Espacio';
import '../../css/modal.css'; 

const ActualizarEspacio = ({ isOpen, onClose, espacioId, onEspacioActualizado }) => {
  const { actualizarEspacio, getEspacioById } = useEspacioService();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    available: true
  });
  const [mensaje, setMensaje] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const prevEspacioIdRef = useRef();

  useEffect(() => {
    if (isOpen && espacioId && espacioId !== prevEspacioIdRef.current) {
      const cargarEspacio = async () => {
        try {
          const espacio = await getEspacioById(espacioId);
          setFormData({
            name: espacio.space.name,
            description: espacio.space.description,
            capacity: espacio.space.capacity.toString(),
            available: espacio.space.available === 1
          });
          setHasLoadedInitialData(true);
          prevEspacioIdRef.current = espacioId;
        } catch (error) {
          console.error('Error al cargar el espacio:', error);
        }
      };
      cargarEspacio();
    }

    if (!isOpen) {
      setHasLoadedInitialData(false);
      prevEspacioIdRef.current = undefined;
    }
  }, [isOpen, espacioId, getEspacioById,hasLoadedInitialData]);

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
      await actualizarEspacio(espacioId, {
        ...formData,
        capacity: parseInt(formData.capacity),
        available: formData.available ? 1 : 0
      });
      setMensaje('Espacio actualizado con éxito');
      onEspacioActualizado();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setMensaje('Error al actualizar el espacio');
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
          <h2 className="modal-title">Actualizar Espacio</h2>
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
              className="modal-btn modal-btn-update"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Espacio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActualizarEspacio;