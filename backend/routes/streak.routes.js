import { Router } from 'express';
import { getStreak, claimStreak, manageReward, deleteReward } from '../controllers/streak.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';


const router = Router();

// Todas estas rutas requieren estar logueado
router.use(verifyToken); 

router.get('/', getStreak);
router.post('/claim', claimStreak);

router.post('/manage', verifyAdmin, manageReward);
router.delete('/manage/:day', verifyAdmin, deleteReward);

export default router;