import { pool } from '../config/db.js';

// 1. TIRADA DE GACHA
export const rollGacha = async (req, res) => {
    const userId = req.user.id; 
    const userDiscordId = req.user.discordid; 
    const { keyType } = req.body; 

    try {
        const keyColumn = `Key${keyType}`;
        const [coinsRows] = await pool.query(`SELECT ${keyColumn} FROM coins WHERE id = ?`, [userDiscordId]);
        
        if (coinsRows.length === 0 || coinsRows[0][keyColumn] <= 0) {
            return res.status(400).json({ message: 'No tienes esta llave. Ve a la tienda a comprar una.' });
        }

        // Primera Ruleta: Elegir la Rareza
        const [rarities] = await pool.query('SELECT rareza, probabilidad FROM gacha_keys_config WHERE key_type = ?', [keyType]);
        const totalRarityWeight = rarities.reduce((sum, r) => sum + r.probabilidad, 0);
        let randomRarityNum = Math.random() * totalRarityWeight;
        
        let selectedRarity = rarities[0].rareza;
        for (const r of rarities) {
            if (randomRarityNum < r.probabilidad) {
                selectedRarity = r.rareza;
                break;
            }
            randomRarityNum -= r.probabilidad;
        }

        // Segunda Ruleta: Elegir el Ítem de esa Rareza
        const [items] = await pool.query('SELECT * FROM gacha_items WHERE rareza = ?', [selectedRarity]);
        
        if (items.length === 0) {
            return res.status(500).json({ message: `No hay ítems configurados para la rareza ${selectedRarity}.` });
        }

        const totalItemWeight = items.reduce((sum, item) => sum + (item.peso || 10), 0);
        let randomItemNum = Math.random() * totalItemWeight;
        
        let selectedItem = items[0];
        for (const item of items) {
            if (randomItemNum < (item.peso || 10)) {
                selectedItem = item;
                break;
            }
            randomItemNum -= (item.peso || 10);
        }

        await pool.query(`UPDATE coins SET ${keyColumn} = ${keyColumn} - 1 WHERE id = ?`, [userDiscordId]);

        const [userRows] = await pool.query('SELECT pending_gacha FROM users WHERE id = ?', [userId]);
        let newPending = userRows[0].pending_gacha 
            ? `${userRows[0].pending_gacha}||${selectedItem.comando_mc}` 
            : selectedItem.comando_mc;
        await pool.query('UPDATE users SET pending_gacha = ? WHERE id = ?', [newPending, userId]);

        // 🔥 NUEVO: Extraemos un array simple con las rarezas válidas para esta Key
        const availableRarities = rarities.map(r => r.rareza);

        res.json({
            message: '¡Tirada exitosa!',
            item: {
                name: selectedItem.name,
                rareza: selectedItem.rareza,
                imagen: selectedItem.imagen
            },
            availableRarities: availableRarities // <-- Se lo enviamos al frontend
        });

    } catch (error) {
        console.error("Error en el gacha:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// 2. OBTENER LLAVES DEL USUARIO
export const getMyKeys = async (req, res) => {
    const userDiscordId = req.user.discordid; 
    console.log("🕵️ Buscando llaves para el Discord ID:", userDiscordId); 
    
    try {
        const [rows] = await pool.query('SELECT Key1, Key2, Key3, Key4 FROM coins WHERE id = ?', [userDiscordId]);
        console.log("💰 Resultado de la BD:", rows); 

        if (rows.length === 0) {
            return res.json({ Key1: 0, Key2: 0, Key3: 0, Key4: 0 });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener llaves' });
    }
};

// 3. OBTENER TODOS LOS ITEMS (Admin)
export const getGachaItems = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM gacha_items ORDER BY rareza ASC, peso DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener items' });
    }
};

// 4. AÑADIR O EDITAR UN ITEM (Admin)
export const manageGachaItem = async (req, res) => {
    const { id, name, rareza, peso, imagen, comando_mc } = req.body;
    
    if (!name || !rareza || !peso || !imagen || !comando_mc) {
        return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }

    try {
        if (id) {
            await pool.query(
                'UPDATE gacha_items SET name=?, rareza=?, peso=?, imagen=?, comando_mc=? WHERE id=?',
                [name, rareza, peso, imagen, comando_mc, id]
            );
        } else {
            await pool.query(
                'INSERT INTO gacha_items (name, rareza, peso, imagen, comando_mc) VALUES (?, ?, ?, ?, ?)',
                [name, rareza, peso, imagen, comando_mc]
            );
        }
        res.json({ message: 'Item guardado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar item' });
    }
};

// 5. ELIMINAR UN ITEM (Admin)
export const deleteGachaItem = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM gacha_items WHERE id = ?', [id]);
        res.json({ message: 'Item eliminado del catálogo' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};