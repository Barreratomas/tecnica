import { Link } from "react-router-dom";
import "../css/menu.css"; 
import { useAuth } from "../providers/AuthContext";


const Menu = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav>
      <div className="nav-left">
        <Link to="/" className={({ isActive }) => isActive ? "active" : ""}>Inicio</Link>
        <Link to="/espacio" className={({ isActive }) => isActive ? "active" : ""}>Espacios</Link>
        <Link to="/reserva" className={({ isActive }) => isActive ? "active" : ""}>Reservas</Link>
      </div>
      
      {isAuthenticated && (
        <div className="nav-right">
          <button onClick={logout} className="logout-button">Cerrar sesión</button>
        </div>
      )}
    </nav>
  );
};

export default Menu;