import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRoutes from './routes/chat.js';
import { initializeVectorStore } from './langchain/vectorStore.js';

// Load environment variables
dotenv.config();

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express app
const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://ai-mentor-latest.vercel.app',            // Your Vercel URL
  'https://ai-mentor-latest-git-main-sayaliyadavgit.vercel.app', // Vercel Git preview
  /^https:\/\/ai-mentor-latest-.*\.vercel\.app$/,   // All Vercel preview URLs
  process.env.FRONTEND_URL,                       
  // Add your Vercel URL after deployment
  // 'https://your-app.vercel.app',
  // 'https://your-app-*.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // Handle wildcard patterns
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hantec-ai-backend',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/chat', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Hantec AI Mentor API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      chatHealth: '/api/chat/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: ['/', '/health', '/api/chat']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  
  // Don't leak error details in production
  const message = NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    error: 'Server Error',
    message: message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production
  if (NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Start server
async function startServer() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 HANTEC MARKETS AI CHATBOT SERVER');
    console.log('='.repeat(60));
    
    console.log('\n📋 Configuration:');
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Node Version: ${process.version}`);
    console.log(`   OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
    
    // Initialize knowledge base
    console.log('\n📚 Initializing knowledge base...');
    await initializeVectorStore();
    console.log('✅ Knowledge base ready\n');
    
    // Start listening
    const server = app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🟢 SERVER RUNNING');
      console.log('='.repeat(60));
      console.log(`\n📍 Local: http://localhost:${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
      console.log(`📍 API: http://localhost:${PORT}/api/chat`);
      console.log('\n💡 Press Ctrl+C to stop\n');
    });
    
    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('💡 Try a different port or kill the process using this port');
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Start the server
startServer();