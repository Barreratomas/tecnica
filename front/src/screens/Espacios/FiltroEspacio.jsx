import { useState } from 'react';
import '../../css/Filtro.css';

const FiltroEspacios = ({ onFiltrar }) => {
  const [filtro, setFiltro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFiltrar(filtro); 
  };

  const handleClear = () => {
    setFiltro('');
    onFiltrar('');
  };

  return (
    <div className="filtro-container">
      <form onSubmit={handleSubmit} className="filtro-form">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nombre o descripción"
          className="filtro-input"
        />
        <button type="submit" className="filtro-btn filtro-btn-buscar">
          Buscar
        </button>
        <button 
          type="button" 
          onClick={handleClear}
          className="filtro-btn filtro-btn-limpiar"
        >
          Limpiar
        </button>
      </form>
    </div>
  );
};

export default FiltroEspacios;