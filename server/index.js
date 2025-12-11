import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleChat } from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required');
  process.exit(1);
}

// CORS Configuration - ONLY THIS SECTION UPDATED
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ai-mentor-latest.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// NEW: Pattern matching for Vercel preview deployments
const allowedPatterns = [
  /^https:\/\/ai-mentor-latest.*\.vercel\.app$/,
  /^https:\/\/.*-sayalis-projects-.*\.vercel\.app$/,
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 Request from:', origin);
    
    if (!origin) {
      return callback(null, true);
    }
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Exact match:', origin);
      return callback(null, true);
    }
    
    // NEW: Check pattern matches
    const matchesPattern = allowedPatterns.some(pattern => pattern.test(origin));
    if (matchesPattern) {
      console.log('✅ Pattern match:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint
app.post('/api/chat', handleChat);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});