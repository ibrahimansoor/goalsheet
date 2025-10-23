import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import dailyPerformanceRoutes from './routes/dailyPerformance.js';
import weeklyGoalsRoutes from './routes/weeklyGoals.js';
import six996GoalsRoutes from './routes/six996Goals.js';
import coachingRoutes from './routes/coaching.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/daily-performance', dailyPerformanceRoutes);
app.use('/api/weekly-goals', weeklyGoalsRoutes);
app.use('/api/six996-goals', six996GoalsRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/users', usersRoutes);

// Serve static files from dist folder
app.use(express.static(join(__dirname, '../dist')));

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, '../dist/index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Goal Sheet App Server Running      ║
╠═══════════════════════════════════════╣
║   Port: ${PORT}                      ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
║   Time: ${new Date().toLocaleTimeString()}               ║
╚═══════════════════════════════════════╝
  `);
});

export default app;
