import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Frontend Vite server
  credentials: true
}));
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);

// Simple healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'up', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
