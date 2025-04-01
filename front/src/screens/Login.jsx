import { useState } from 'react';
import { useAuth } from '../providers/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../css/login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      const targetPath = location.state?.from?.pathname || '/';
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error('Error en el inicio de sesión', error);
      setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {location.state?.registrationSuccess && (
        <div className="success-message">
          ¡Registro exitoso! Por favor inicia sesión.
        </div>
      )}
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          disabled={isLoading}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          disabled={isLoading}
        />
        {error && <div className="error-message">{error}</div>}
        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <div className="register-link">
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </div>
    </div>
  );
};

export default Login;