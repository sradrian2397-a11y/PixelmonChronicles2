import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configuración de CORS permitiendo tu puerto de React (5173 / 3000)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Ruta de prueba base para verificar el estado de la API
app.get('/api/status', (req, res) => {
  res.json({ status: "online", message: "🚀 Ecosistema Pixelmon Chronicles 2 listo y conectado" });
});

io.on('connection', (socket) => {
  console.log('⚡ Cliente conectado por Socket al nuevo backend:', socket.id);
});

const PORT = process.env.PORT || 3020;
server.listen(PORT, () => {
  console.log(`🚀 Backend running securely on port ${PORT}`);
});
