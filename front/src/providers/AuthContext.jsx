import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const navigate = useNavigate(); 


  

  const [axiosInstance] = useState(() => {
    const instance = axios.create({
      baseURL: 'http://127.0.0.1:8000/api', 
    });

    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    instance.interceptors.response.use(
      (response) => {
        if (response.data && response.data.user.role !== localStorage.getItem('role')) {
          const newRole = response.data.user.role;
          localStorage.setItem('role', newRole);
          setUserRole(newRole);
          window.location.reload();
        }
        return response;
      },
      (error) => {
        if (error.response && error.response.status === 403) {
          navigate('/');
        }
        return Promise.reject(error);
      }
    );

    return instance;
  });

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      const newToken = response.data.user.token;
      const role = response.data.user.role;
      const userName = response.data.user.username;
  
      localStorage.setItem('token', newToken);
      localStorage.setItem('role', role);
      localStorage.setItem('userName', userName);
      
      setToken(newToken);
      setUserRole(role);
      
      return true; 
    } catch (error) {
      console.error('Error en login:', error);
      throw error; 
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUserRole(null);
  };

  const register = async (username, email, password) => {
    try {
      const response = await axiosInstance.post('/register', { 
        username, 
        email, 
        password 
      });
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      token, 
      isAuthenticated: !!token, 
      login, 
      register,
      logout, 
      axiosInstance, 
      userRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);