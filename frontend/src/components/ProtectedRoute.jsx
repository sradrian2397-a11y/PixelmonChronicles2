import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    // Buscamos el token en el localStorage
    const token = localStorage.getItem('token');
    
    // Si no hay token, lo mandamos de vuelta al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si hay token, lo dejamos pasar a la página que quería ver
    return children;
}