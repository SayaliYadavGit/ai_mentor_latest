import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleChat } from './routes/chat.js';  // ADD THIS BACK

// REMOVED: import { handleChat } from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required');
  process.exit(1);
}

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ai-mentor-latest.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Pattern matching for Vercel preview deployments
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
    
    // Check pattern matches
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

// Chat endpoint - INLINE IMPLEMENTATION (no import needed)
app.post('/api/chat', async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query is required' 
      });
    }

    console.log('💬 Processing query:', query);
    
    // Temporary response until we hook up RAG
    res.json({
      success: true,
      data: {
        answer: `You asked: "${query}". Backend is working! RAG integration coming next.`,
        sources: [],
        confidence: 'high'
      }
    });
    
  } catch (error) {
    console.error('❌ Error in /api/chat:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred processing your request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🟢 SERVER RUNNING');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 API: http://localhost:${PORT}/api/chat`);
  console.log('═══════════════════════════════════════════════════════════');
});