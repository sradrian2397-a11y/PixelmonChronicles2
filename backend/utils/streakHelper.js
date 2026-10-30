import { pool } from '../config/db.js';

export const getYYYYMMDD = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Función que comprueba si es un día nuevo y actualiza la racha
export const checkAndUpdateStreak = async (userId) => {
    const [rows] = await pool.query('SELECT current_streak, last_login_date FROM users WHERE id = ?', [userId]);
    const user = rows[0];
    
    if (!user) return null;

    const todayStr = getYYYYMMDD(new Date());
    const lastLoginStr = user.last_login_date ? getYYYYMMDD(user.last_login_date) : null;

    // Si la fecha de hoy es distinta a la de su último login...
    if (todayStr !== lastLoginStr) {
        const newStreak = (user.current_streak || 0) + 1;
        await pool.query(
            'UPDATE users SET current_streak = ?, last_login_date = ? WHERE id = ?',
            [newStreak, todayStr, userId]
        );
        console.log(`📈 Racha actualizada al día ${newStreak} para el usuario ${userId}`);
        return newStreak;
    }
    
    // Si ya se logueó hoy, devuelve su racha actual sin hacer nada
    return user.current_streak; 
};