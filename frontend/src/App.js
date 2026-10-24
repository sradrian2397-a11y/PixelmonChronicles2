import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar.jsx';
import Home from './pages/Home.jsx';
import './App.css';

function Footer() {
  return <footer style={{ padding: '10px', background: '#282c34', color: 'white', marginTop: '20px' }}>Pie de Página de Pixelmon (Temporal)</footer>;
}

// 2. Función simulada del Hook de Autenticación (Hasta que migremos el sistema de login)
function useAuth() {
  return {
    isAuthenticated: false,
    user: null,
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
            nombre: user.name_first || user.firstname,
            apellido: user.name_last || user.lastname,
            username: user.username,
            email: user.email,
            rol: user.root_admin === 1 ? 'admin' : user.rol,
          });
        } else {
          console.log('👤 No hay datos de usuario disponibles.');
        }
      }
    }
  }, [loading, isAuthenticated, user]); // <- Añadido user a las dependencias para evitar advertencias

  if (loading) {
    return <div className="App layout-ct"><p>Cargando...</p></div>;
  }

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <main className='main-ct'>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}

// 3. Componente principal que envuelve AppLayout con el Router (Requisito obligatorio de react-router-dom)
function App() {
  return (
    <div className="App layout-ct">
      <Router>
        <AppLayout />
      </Router>
    </div>
  );
}

// 4. Exportación por defecto obligatoria para que index.js pueda arrancar la web
export default App;
