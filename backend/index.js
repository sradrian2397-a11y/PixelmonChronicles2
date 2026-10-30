import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import streakRoutes from './routes/streak.routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Configuración unificada de CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

const io = new Server(server, { cors: corsOptions });
app.use(cors(corsOptions)); // Usar la misma config aquí
app.use(express.json());

// Ruta de prueba base para verificar el estado de la API
app.get('/api/status', (req, res) => {
  res.json({ status: "online", message: "🚀 Ecosistema Pixelmon Chronicles 2 listo y conectado" });
});

app.use('/api/auth', authRoutes);
app.use('/api/streak', streakRoutes);

io.on('connection', (socket) => {
  console.log('⚡ Cliente conectado por Socket al nuevo backend:', socket.id);
});

const PORT = process.env.PORT || 3020;
server.listen(PORT, () => {
  console.log(`🚀 Backend running securely on port ${PORT}`);
});
