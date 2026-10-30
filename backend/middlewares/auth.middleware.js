import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No hay token de acceso' });

    const token = authHeader.split(' ')[1]; // Formato: "Bearer <token>"
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto_cambiar_en_produccion');
        req.user = decoded; // Aquí guardamos los datos del usuario (id, username, etc.)
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

export const verifyAdmin = (req, res, next) => {
    // req.user viene del verifyToken y contiene el rol
    if (req.user && req.user.rol === 'administrador') {
        next(); // Es admin, puede pasar
    } else {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
};