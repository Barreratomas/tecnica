import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './providers/AuthContext';
import Login from './screens/Login';
import PrivateRoute from './providers/PrivateRoute'; 
import Home from './screens/Home';
import IndexEspacios from './screens/Espacios/Index';
import IndexReservas from './screens/Reservas/Index';
import Register from './screens/Register';
function App() {
  return (
    <Router>
      {/* Mueve AuthProvider dentro del Router */}
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
          {/* 🔹 Rutas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/espacio" element={<IndexEspacios />} />
            <Route path="/reserva" element={<IndexReservas />} />

          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
