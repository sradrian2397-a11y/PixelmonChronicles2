import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

    // Cargar usuario del localStorage al iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error al parsear usuario:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Función de login
    const login = (userData) => {
        const expiresAt = Date.now() + SESSION_DURATION;

        const authData = {
            user: userData,
            expiresAt: expiresAt
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(authData));
    };

    // Función de logout
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    // Verificar si el usuario tiene un rol específico
    const hasRole = (role) => {
        return user?.rol === role;
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};