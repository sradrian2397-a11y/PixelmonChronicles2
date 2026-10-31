import { Router } from 'express';
import { rollGacha, getMyKeys, getGachaItems, manageGachaItem, deleteGachaItem } from '../controllers/gacha.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken); // Obligatorio estar logueado

router.get('/keys', getMyKeys);
router.post('/roll', rollGacha);

// Rutas de Admin
router.get('/manage', verifyAdmin, getGachaItems);
router.post('/manage', verifyAdmin, manageGachaItem);
router.delete('/manage/:id', verifyAdmin, deleteGachaItem);

export default router;