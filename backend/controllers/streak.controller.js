import { pool } from '../config/db.js';
import { checkAndUpdateStreak } from '../utils/streakHelper.js';

export const manageReward = async (req, res) => {
    const { day, reward_text, reward_data } = req.body;

    // Validar que los datos existan y el JSON sea válido
    if (!day || !reward_text || !reward_data) {
        return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }
    
    try {
        JSON.parse(reward_data); // Lanza error si no es un JSON válido
    } catch (e) {
        return res.status(400).json({ message: 'El formato de datos del bot no es un JSON válido.' });
    }

    try {
        // Usamos ? en las consultas para evitar Inyección SQL (ya lo estabas haciendo bien)
        await pool.query(
            `INSERT INTO streak_rewards (day, reward_text, reward_data) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE reward_text = ?, reward_data = ?`,
            [day, reward_text, reward_data, reward_text, reward_data]
        );
        res.json({ message: 'Día guardado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error guardando recompensa' });
    }
};

export const deleteReward = async (req, res) => {
    const { day } = req.params;
    try {
        await pool.query('DELETE FROM streak_rewards WHERE day = ?', [day]);
        res.json({ message: 'Día eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando' });
    }
};

export const getStreak = async (req, res) => {
    const userId = req.user.id; 
    
    try {
        await checkAndUpdateStreak(userId);

        const [userRows] = await pool.query('SELECT current_streak, claimed_rewards FROM users WHERE id = ?', [userId]);
        const user = userRows[0];
        
        // 🔥 AÑADIMOS ORDER BY day ASC 🔥
        const [rewardsRows] = await pool.query('SELECT day, reward_text, reward_data FROM streak_rewards ORDER BY day ASC');
        
        const claimedRewards = user.claimed_rewards 
            ? String(user.claimed_rewards).split(',').map(Number).filter(n => !isNaN(n)) 
            : [];
        
        res.json({
            currentStreak: user.current_streak || 0,
            claimedRewards: claimedRewards,
            rewardsConfig: rewardsRows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const claimStreak = async (req, res) => {
    const userId = req.user.id;
    const { dayToClaim } = req.body;
    
    try {
        const [rows] = await pool.query('SELECT current_streak, claimed_rewards, pending_claims FROM users WHERE id = ?', [userId]);
        const user = rows[0];
        
        const claimedRewards = user.claimed_rewards 
            ? String(user.claimed_rewards).split(',').map(Number).filter(n => !isNaN(n)) 
            : [];
        
        if (dayToClaim > user.current_streak) {
            return res.status(400).json({ message: 'Aún no has desbloqueado este día.' });
        }
        
        if (claimedRewards.includes(dayToClaim)) {
            return res.status(400).json({ message: 'Ya has reclamado este día.' });
        }
        
        // Guardar en historial y en pendientes
        claimedRewards.push(dayToClaim);
        const newClaimedString = claimedRewards.sort((a,b) => a - b).join(',');
        
        // Lo añadimos a pending_claims para que el bot de Python lo lea (ej: "1,3")
        let newPending = user.pending_claims ? `${user.pending_claims},${dayToClaim}` : String(dayToClaim);
        
        await pool.query(
            'UPDATE users SET claimed_rewards = ?, pending_claims = ? WHERE id = ?', 
            [newClaimedString, newPending, userId]
        );
            
        res.json({ 
            message: 'Recompensa reclamada',
            claimedRewards: claimedRewards
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};