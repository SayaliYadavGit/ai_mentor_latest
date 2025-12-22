import {
  SYSTEM_PROMPT,
  MODEL_CONFIG,
  COMPLIANCE_RULES,
  RESPONSE_TEMPLATES,
  DEFAULT_RELATED_QUESTIONS,
  requiresRiskDisclaimer,
  requiresEscalation,
  getConfidenceLevel,
  formatSources,
  detectQueryCategory,
  getPersonalityResponse,
} from './config.js';

import { logChatInteraction, logError } from '../utils/logger.js';

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { searchVectorStore, initializeVectorStore } from './vectorStore.js';

const APP_CONFIG = {
  supportEmail: process.env.SUPPORT_EMAIL || 'support@hmarkets.com',
  companyName: 'Hantec Markets',
};

// Initialize ChatOpenAI model
const model = new ChatOpenAI({
  modelName: MODEL_CONFIG.modelName,
  temperature: MODEL_CONFIG.temperature,
  maxTokens: MODEL_CONFIG.maxTokens,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Create prompt template with CLEAN instructions
const promptTemplate = PromptTemplate.fromTemplate(`
{systemPrompt}

CRITICAL RULES:
1. NEVER include risk warnings or disclaimers
2. NEVER include "You might also want to know" sections
3. NEVER suggest follow-up questions in numbered lists (1. 2. 3.)
4. Be direct, helpful, and informative
5. Use natural language WITHOUT ** markdown bold
6. Keep responses concise (2-3 paragraphs)
7. ALWAYS end with ONE natural follow-up question related to the topic

Context from knowledge base:
{context}

User query: {query}

Provide a clean, helpful response. End with a relevant follow-up question.
`);

// Create chain
const chain = RunnableSequence.from([
  promptTemplate,
  model,
  new StringOutputParser(),
]);

// Clean response function - removes unwanted elements
function cleanResponse(text) {
  if (!text) return '';

  let cleaned = text;

  // Remove risk warnings
  cleaned = cleaned
    .replace(/⚠️\s*\*\*Risk Warning:?\*\*[^\n]*\n?/gi, '')
    .replace(/⚠️\s*Risk Warning:?[^\n]*\n?/gi, '')
    .replace(/\*\*Risk Warning:?\*\*[^\n]*\n?/gi, '')
    .replace(/Risk Warning:?.*?\n/gi, '')
    .replace(/⚠️\s*\*\*Important:?\*\*[^\n]*risk[^\n]*\n?/gi, '')
    .replace(/\*\*Important:?\*\*[^\n]*risk[^\n]*\n?/gi, '');

  // Remove "You might also want to know" sections
  cleaned = cleaned.replace(/💡\s*You might also want to know:?[\s\S]*?(?=\n\n|$)/gi, '');
  cleaned = cleaned.replace(/\*\*You might also want to know:?\*\*[\s\S]*?(?=\n\n|$)/gi, '');
  cleaned = cleaned.replace(/You might also want to know:?[\s\S]*?(?=\n\n|$)/gi, '');

  // Remove numbered lists that look like suggestions
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    // Remove lines that look like suggestions
    if (/^\d+\.\s+(Would you like|Interested in|Need help|Want to|Are you)/i.test(trimmed)) {
      return false;
    }
    return true;
  });
  cleaned = filteredLines.join('\n');

  // Remove ** markdown
  cleaned = cleaned.replace(/\*\*/g, '');

  // Remove "Sources:" lines
  cleaned = cleaned.replace(/^Sources?:.*$/gim, '');

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

// Extract the last question from a response
function extractLastQuestion(text) {
  if (!text) return null;
  
  // Split by newlines and find the last question mark
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for the last line that ends with a question mark
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].endsWith('?')) {
      return lines[i];
    }
  }
  
  return null;
}

// Detect if user is responding affirmatively to a follow-up question
function isAffirmativeResponse(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Affirmative patterns - EXPANDED
  const affirmativePatterns = [
    /^yes$/,
    /^yeah$/,
    /^yep$/,
    /^sure$/,
    /^ok$/,
    /^okay$/,
    /^alright$/,
    /^tell me$/,
    /^tell me more$/,
    /^tell me about it$/,
    /^i would like to know$/,
    /^i want to know$/,
    /^please$/,
    /^go ahead$/,
    /^continue$/,
    /^sounds good$/,
    /^that would be great$/,
    /^i'm interested$/,
    /^interested$/,
    /^definitely$/,
    /^absolutely$/,
    // ============================================
    // EXPERIENCE LEVEL RESPONSES ✅
    // ============================================
    /^familiar$/,
    /^very familiar$/,
    /^quite familiar$/,
    /^not familiar$/,
    /^not very familiar$/,
    /^somewhat familiar$/,
    /^a bit$/,
    /^a little$/,
    /^a little bit$/,
    /^beginner$/,
    /^intermediate$/,
    /^advanced$/,
    /^expert$/,
    /^new to this$/,
    /^new$/,
    /^learning$/,
    /^experienced$/,
    /^novice$/,
    /^just starting$/,
    /^getting started$/,
  ];
  
  return affirmativePatterns.some(pattern => pattern.test(lowerQuery));
}

// Convert a follow-up question into a searchable query
function convertQuestionToQuery(question) {
  if (!question) return null;
  
  // Remove question mark
  let query = question.replace(/\?$/, '').trim();
  
  // Remove common question starters
  query = query
    .replace(/^(Would you like to know|Are you interested in|Do you want to know|Want to know|Interested in learning|How familiar are you with)/i, '')
    .trim();
  
  return query;
}

/**
 * Process user query with RAG and confidence scoring
 */
export async function processQuery(query, conversationHistory = []) {
  try {
    console.log('🔍 Processing query:', query.substring(0, 100) + '...');
    console.log('📜 Conversation history length:', conversationHistory.length);
    const startTime = Date.now();
    
    // Validate query
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    // ============================================
    // CHECK FOR FOLLOW-UP AFFIRMATION 🎯
    // ============================================
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      
      console.log('🔍 Last message role:', lastMessage.role);
      console.log('🔍 Last message preview:', lastMessage.content?.substring(0, 100));
      
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        const lastQuestion = extractLastQuestion(lastMessage.content);
        
        console.log('❓ Extracted question:', lastQuestion);
        console.log('🤔 Is affirmative?:', isAffirmativeResponse(query));
        
        if (lastQuestion && isAffirmativeResponse(query)) {
          console.log('✅ Affirmative response detected to:', lastQuestion);
          
          // Convert the question into a query and search for it
          const followUpQuery = convertQuestionToQuery(lastQuestion);
          console.log('🔄 Converting to query:', followUpQuery);
          
          if (followUpQuery) {
            // Re-run the search with the follow-up question as the query
            query = followUpQuery;
            console.log('🎯 Proceeding with follow-up query:', query);
          }
        }
      }
    }

    // Personality & character check
    const queryCategory = detectQueryCategory(query);
    console.log('🎭 Query category:', queryCategory);
    
    // Handle inappropriate queries immediately
    if (queryCategory === 'inappropriate') {
      console.log('🚫 Inappropriate query blocked');
      
      const response = {
        response: getPersonalityResponse('inappropriate'),
        confidence: 'blocked',
        sources: [],
        metadata: {
          blocked: true,
          reason: 'inappropriate',
          duration: Date.now() - startTime,
        },
      };
      
      // Log inappropriate query
      logChatInteraction({
        query: query,
        response: response.response,
        confidence: 'blocked',
        queryCategory: 'inappropriate',
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      return response;
    }
    
    // Handle testing queries with sass
    if (queryCategory === 'testing') {
      console.log('🧪 Testing query detected');
      
      const response = {
        response: getPersonalityResponse('testing'),
        confidence: 'medium',
        sources: [],
        metadata: {
          testing: true,
          duration: Date.now() - startTime,
        },
      };
      
      logChatInteraction({
        query: query,
        response: response.response,
        confidence: 'medium',
        queryCategory: 'testing',
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      return response;
    }
    
    // Handle silly queries with humor
    if (queryCategory === 'silly') {
      console.log('😄 Silly query detected - responding with personality');
      
      const response = {
        response: getPersonalityResponse('silly'),
        confidence: 'low',
        sources: [],
        metadata: {
          silly: true,
          duration: Date.now() - startTime,
        },
      };
      
      logChatInteraction({
        query: query,
        response: response.response,
        confidence: 'low',
        queryCategory: 'silly',
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      return response;
    }
    
    if (queryCategory === 'greeting') {
      console.log('👋 Greeting detected - responding warmly');
      
      const response = {
        response: getPersonalityResponse('greeting'),
        confidence: 'high',
        sources: [],
        metadata: {
          greeting: true,
          duration: Date.now() - startTime,
        },
      };
      
      logChatInteraction({
        query: query,
        response: response.response,
        confidence: 'high',
        queryCategory: 'greeting',
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      return response;
    }

    if (queryCategory === 'about_ai') {
      console.log('🤖 About AI query detected');
      
      const response = {
        response: getPersonalityResponse('about_ai'),
        confidence: 'high',
        sources: [],
        metadata: {
          about_ai: true,
          duration: Date.now() - startTime,
        },
      };
      
      logChatInteraction({
        query: query,
        response: response.response,
        confidence: 'high',
        queryCategory: 'about_ai',
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      return response;
    }
    
    // Handle completely unrelated queries
    if (queryCategory === 'unrelated') {
      console.log('🔀 Unrelated query detected - redirecting with sass');
      
      const response = {
        response: getPersonalityResponse('unrelated'),
        confidence: 'low',
        sources: [],
        metadata: {
          unrelated: true,
          duration: Date.now() - startTime,
        },
      };
      
      logChatInteraction({
        query: query,
        response: response.response,
        confidence: 'low',
        queryCategory: 'unrelated',
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      return response;
    }

    // If trading-related or unknown, continue with normal RAG processing
    console.log('✅ Trading-related query - proceeding with RAG');
    
    // Initialize vector store if needed
    console.log('📚 Ensuring vector store is initialized...');
    await initializeVectorStore();
    
    // Check for escalation triggers
    if (requiresEscalation(query)) {
      console.log('🚨 Escalation triggered');
      
      const response = {
        response: RESPONSE_TEMPLATES.escalation(
          APP_CONFIG.supportEmail,
          'this issue'
        ),
        confidence: 'escalation',
        sources: [],
        metadata: {
          escalated: true,
          duration: Date.now() - startTime,
        },
      };
      
      logChatInteraction({
        query: query,
        response: response.response,
        confidence: 'escalation',
        queryCategory: 'escalation',
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      return response;
    }
    
    // Search vector store
    console.log('📚 Searching knowledge base...');
    const results = await searchVectorStore(query);
    
    // Determine confidence level
    const maxScore = results.length > 0 ? results[0].score : 0;
    const confidence = getConfidenceLevel(maxScore, results.length);
    
    console.log(`📊 Confidence: ${confidence} (max score: ${maxScore.toFixed(3)}, docs: ${results.length})`);
    
    // Handle no knowledge case (LOW confidence)
    if (confidence === 'low' || results.length === 0) {
      console.log('📭 No relevant knowledge found - using fallback');
      
      const fallbackResponse = `I don't have specific information about that in my knowledge base. For the most accurate details, please contact our support team at ${APP_CONFIG.supportEmail}.

What else would you like to know about Hantec Markets?`;
      
      const response = {
        response: fallbackResponse,
        confidence: 'low',
        sources: [],
        metadata: {
          retrievedDocs: 0,
          duration: Date.now() - startTime,
        },
      };
      
      logChatInteraction({
        query: query,
        response: fallbackResponse,
        confidence: 'low',
        queryCategory: queryCategory,
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      return response;
    }
    
    // Prepare context from retrieved documents
    const context = results
      .map((result, idx) => {
        const source = result.metadata?.source || 'Knowledge Base';
        return `[Document ${idx + 1}]\n${result.content}`;
      })
      .join('\n\n---\n\n');
    
    console.log(`📄 Using ${results.length} documents for context`);
    
    // Generate response using LangChain
    console.log('🤖 Generating AI response...');
    const aiResponse = await chain.invoke({
      systemPrompt: SYSTEM_PROMPT,
      context: context,
      query: query,
    });
    
    console.log('✅ AI response generated');
    
    // Clean the response (removes risk warnings, suggestions, sources)
    let finalResponse = cleanResponse(aiResponse.trim());
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Total processing time: ${duration}ms`);
    
    // ============================================
    // LOG THE INTERACTION 📊
    // ============================================
    logChatInteraction({
      query: query,
      response: finalResponse,
      confidence: confidence,
      queryCategory: queryCategory,
      sources: results.map(r => r.metadata?.source || 'Knowledge Base').slice(0, 3),
      metadata: {
        retrievedDocs: results.length,
        topScore: maxScore,
        duration: duration,
      },
      conversationLength: conversationHistory.length,
    });
    
    return {
      response: finalResponse,
      confidence: confidence,
      sources: [], // Empty - don't send sources to frontend
      metadata: {
        retrievedDocs: results.length,
        topScore: maxScore,
        duration: duration,
      },
    };
    
  } catch (error) {
    console.error('❌ Error processing query:', error.message);
    
    // LOG ERRORS TOO
    logError({
      query: query,
      error: error.message,
      stack: error.stack,
    });
    
    return {
      response: `I encountered an error processing your request. Please try again or contact support at ${APP_CONFIG.supportEmail}`,
      confidence: 'error',
      sources: [],
      metadata: {
        error: error.message,
      },
    };
  }
}

/**
 * Generate related questions based on query context
 */
export async function generateRelatedQuestions(query) {
  try {
    const results = await searchVectorStore(query, 10);
    
    if (results.length === 0) {
      return DEFAULT_RELATED_QUESTIONS.slice(0, 3);
    }
    
    // For now, return defaults
    // TODO: Use LLM to generate contextual questions from retrieved docs
    return DEFAULT_RELATED_QUESTIONS.slice(0, 3);
    
  } catch (error) {
    console.error('Error generating related questions:', error.message);
    return DEFAULT_RELATED_QUESTIONS.slice(0, 3);
  }
}

/**
 * Simple health check for the chain
 */
export async function healthCheck() {
  try {
    const testQuery = "Hello";
    const response = await model.invoke(testQuery);
    return {
      status: 'ok',
      modelName: MODEL_CONFIG.modelName,
      message: 'Chain is operational',
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}