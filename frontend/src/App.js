import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css';
import AdminStreak from './pages/AdminStreak.jsx';
import AdminGacha from './pages/AdminGacha';

function Footer() {
  return <footer style={{ padding: '10px', background: '#282c34', color: 'white', marginTop: '20px' }}>Pie de Página de Pixelmon (Temporal)</footer>;
}

// Hook de Autenticación REAL (Lee desde el localStorage)
function useAuth() {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  let user = null;
  try {
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (e) {
    console.error("Error al parsear el usuario", e);
  }

  return {
    isAuthenticated: !!token, // Es true si el token existe
    user: user,
    loading: false
  };
}

function AppLayout() {
  const location = useLocation();
  const hideNavAndFooter = location.pathname === '/login' || location.pathname === '/register';
  const { isAuthenticated, user, loading } = useAuth();
  const hasLogged = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !hasLogged.current) {
      hasLogged.current = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Usuario autenticado:', isAuthenticated);
        if (user) {
          console.log('👤 Datos del usuario:', {
            id: user.id,
            username: user.username,
            // Algunos campos pueden variar dependiendo de lo que devuelva tu backend
            email: user.email || 'No email',
            rol: user.rol || 'No rol',
          });
        } else {
          console.log('👤 No hay datos de usuario disponibles.');
        }
      }
    }
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return <div className="App layout-ct"><p>Cargando...</p></div>;
  }

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <main className='main-ct'>
        <Routes>
          {/* Ruta PÚBLICA */}
          <Route path="/login" element={<Login />} />

          {/* Ruta PROTEGIDA (Home) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/streak" 
            element={
              <ProtectedRoute>
                <AdminStreak />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/gacha" 
            element={
              <ProtectedRoute>
                <AdminGacha />
              </ProtectedRoute>} 
          />

          
        </Routes>
      </main>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}

// Componente principal que envuelve AppLayout con el Router
function App() {
  return (
    <div className="App layout-ct">
      <Router>
        <AppLayout />
      </Router>
    </div>
  );
}

export default App;