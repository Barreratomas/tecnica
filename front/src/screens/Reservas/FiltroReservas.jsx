import { useState } from 'react';
import '../../css/FiltroReservas.css';

const FiltroReservas = ({ onFilter }) => {
  const [filtros, setFiltros] = useState({
    search: '',
    status: '',
    start_date: '',
    end_date: '',
    user_id: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const activeFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== '')
    );
    onFilter(activeFilters);
  };


  const handleClear = () => {
    const nuevosFiltros = {
      search: '',
      status: '',
      start_date: '',
      end_date: '',
      user_id: ''
    };
    setFiltros(nuevosFiltros);
    onFilter(nuevosFiltros);
  };

  
  return (
    <div className="filtro-container">
      <form onSubmit={handleSubmit} className="filtro-form">
        <div className="filtro-group">
          <input
            type="text"
            name="search"
            value={filtros.search}
            onChange={handleChange}
            placeholder="Buscar espacio"
            className="filtro-input"
          />
        </div>

        <div className="filtro-group">
          <select
            name="status"
            value={filtros.status}
            onChange={handleChange}
            className="filtro-select"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        <div className="filtro-group">
          <label>Desde:</label>
          <input
            type="date"
            name="start_date"
            value={filtros.start_date}
            onChange={handleChange}
            className="filtro-input"
          />
        </div>

        <div className="filtro-group">
          <label>Hasta:</label>
          <input
            type="date"
            name="end_date"
            value={filtros.end_date}
            onChange={handleChange}
            className="filtro-input"
          />
        </div>

     

        <div className="filtro-buttons">
          <button type="submit" className="filtro-btn filtro-btn-buscar">
            Filtrar
          </button>
          <button 
            type="button" 
            onClick={handleClear}
            className="filtro-btn filtro-btn-limpiar"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FiltroReservas;