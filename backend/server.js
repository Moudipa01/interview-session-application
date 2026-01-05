import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler } from './utils/errors.js';

// Routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import matchRoutes from './routes/match.js';
import sessionRoutes from './routes/sessions.js';
import noteRoutes from './routes/notes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
    process.env.VERCEL_FRONTEND_URL || "https://your-frontend-name.vercel.app"
  ].filter(Boolean), // Remove undefined values
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/match', matchRoutes);
// Note: More specific routes (notes) should come before generic routes (sessions/:id)
app.use('/api/sessions', noteRoutes); // Notes: POST/GET /api/sessions/:sessionId/notes
app.use('/api/sessions', sessionRoutes); // Sessions: GET /api/sessions/:id, etc.

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Please either:`);
    console.error(`   1. Stop the process using port ${PORT}`);
    console.error(`   2. Change the PORT in your .env file\n`);
    console.error(`   To find and kill the process:`);
    console.error(`   lsof -ti:${PORT} | xargs kill -9\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

