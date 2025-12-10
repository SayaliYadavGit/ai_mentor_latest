// Chat API Routes
import express from 'express';
import { processQuery } from '../langchain/chains.js';

const router = express.Router();

/**
 * POST /api/chat
 * Main chat endpoint - processes user queries with RAG
 */
router.post('/', async (req, res) => {
  try {
    const { query, conversationHistory } = req.body;
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string',
        code: 'INVALID_QUERY',
      });
    }
    
    if (query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query cannot be empty',
        code: 'EMPTY_QUERY',
      });
    }
    
    if (query.length > 500) {
      return res.status(400).json({
        error: 'Query is too long (max 500 characters)',
        code: 'QUERY_TOO_LONG',
      });
    }
    
    console.log('\n📨 New chat request');
    console.log('   Query:', query.substring(0, 80) + (query.length > 80 ? '...' : ''));
    
    // Process query
    const startTime = Date.now();
    const result = await processQuery(query, conversationHistory || []);
    const duration = Date.now() - startTime;
    
    console.log(`   ⏱️  Response time: ${duration}ms`);
    console.log(`   📊 Confidence: ${result.confidence}`);
    console.log(`   📚 Sources: ${result.sources?.length || 0}\n`);
    
    // Send response
    res.json({
      response: result.response,
      confidence: result.confidence,
      sources: result.sources || [],
      metadata: {
        ...result.metadata,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('❌ Error in chat endpoint:', error);
    
    // Determine error type and status code
    let statusCode = 500;
    let errorMessage = 'An error occurred processing your request';
    let errorCode = 'INTERNAL_ERROR';
    
    if (error.message.includes('API key')) {
      statusCode = 500;
      errorMessage = 'AI service configuration error';
      errorCode = 'API_KEY_ERROR';
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Request timed out';
      errorCode = 'TIMEOUT';
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
      errorMessage = 'Too many requests';
      errorCode = 'RATE_LIMIT';
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      code: errorCode,
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/chat/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chat-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * GET /api/chat/stats
 * Get basic statistics (optional)
 */
router.get('/stats', (req, res) => {
  // This could be expanded to track real metrics
  res.json({
    status: 'ok',
    service: 'chat-api',
    model: process.env.MODEL_NAME || 'gpt-4o-mini',
    temperature: parseFloat(process.env.TEMPERATURE) || 0.1,
    maxTokens: parseInt(process.env.MAX_TOKENS) || 500,
  });
});

export default router;