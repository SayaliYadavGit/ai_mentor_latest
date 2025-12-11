import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleChatRequest } from './langchain/chains.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// CORS Configuration - FIXED FOR VERCEL PREVIEW DEPLOYMENTS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ai-mentor-latest.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

const allowedPatterns = [
  /^https:\/\/ai-mentor-latest.*\.vercel\.app$/,           // All Vercel deployments
  /^https:\/\/.*-sayalis-projects-.*\.vercel\.app$/,       // All your projects
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 Request from:', origin);
    
    if (!origin) {
      console.log('✅ No origin (allowed)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Exact match:', origin);
      return callback(null, true);
    }
    
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

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query is required' 
      });
    }

    console.log('💬 Query:', query);
    
    const result = await handleChatRequest(query, conversationHistory);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred processing your request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🟢 SERVER RUNNING');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📍 Local:  http://localhost:' + PORT);
  console.log('📍 Health: http://localhost:' + PORT + '/health');
  console.log('📍 API:    http://localhost:' + PORT + '/api/chat');
  console.log('');
  console.log('💡 Press Ctrl+C to stop');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
});

export default app;