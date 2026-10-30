import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js'; 
import { checkAndUpdateStreak } from '../utils/streakHelper.js'; // <-- IMPORTAMOS

export const login = async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, username, passwd, rol, minecraftuser, minecraftuuid, discordid FROM users WHERE username = ?', 
            [usuario]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        const user = rows[0];
        let dbPassword = user.passwd.toString();
        let isValid = false;

        if (dbPassword.startsWith('$2y$') || dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$')) {
            let bcryptHash = dbPassword;
            if (dbPassword.startsWith('$2y$')) bcryptHash = dbPassword.replace('$2y$', '$2a$');
            isValid = await bcrypt.compare(password, bcryptHash);
        } else if (dbPassword.length === 64) {
            const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
            isValid = (sha256Hash === dbPassword);
        }

        if (!isValid) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        // 🔥 COMPROBAR DÍA AL LOGUEAR 🔥
        await checkAndUpdateStreak(user.id); 

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                rol: user.rol,
                discordid: user.discordid,
                minecraftuser: user.minecraftuser
            },
            process.env.JWT_SECRET || 'secreto_por_defecto_cambiar_en_produccion',
            { expiresIn: '7d' }
        );

        res.json({ 
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                rol: user.rol,
                discordid: user.discordid,
                minecraftuser: user.minecraftuser,
                minecraftuuid: user.minecraftuuid
            }
        });

    } catch (error) {
        console.error("🔥 Error en login:", error);
        res.status(500).json({ message: 'Error de conexión con el servidor.' });
    }
};