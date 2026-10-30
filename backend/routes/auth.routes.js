import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const router = Router();

// Ruta POST: http://localhost:3020/api/auth/login
router.post('/login', login);

export default router;