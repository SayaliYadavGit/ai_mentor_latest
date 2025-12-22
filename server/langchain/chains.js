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

// ✅ KEEP: Local logging for Render logs (viewable in dashboard)
import { logChatInteraction, logError } from '../utils/logger.js';

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { searchVectorStore, initializeVectorStore } from './vectorStore.js';

// ============================================
// ✅ GOOGLE SHEETS LOGGING FUNCTION (Updated with Similarity Scores)
// ============================================
async function logToGoogleSheets(logData) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    // Only log once on startup to avoid spam
    if (!logToGoogleSheets.warned) {
      console.log('⚠️  Google Sheets webhook not configured (set GOOGLE_SHEETS_WEBHOOK_URL)');
      logToGoogleSheets.warned = true;
    }
    return;
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        query: logData.query,
        response: logData.response,
        confidence: logData.confidence,
        category: logData.queryCategory,
        duration: logData.metadata?.duration || 0,
        similarityScore: logData.metadata?.topScore || null, // ✅ TOP SIMILARITY SCORE
        topScores: logData.metadata?.topScores || [], // ✅ TOP 3 SCORES ARRAY
        sourcesCount: logData.sources?.length || 0
      })
    });
    
    if (!response.ok) {
      console.error('❌ Google Sheets log failed:', response.status, response.statusText);
    } else {
      console.log('✅ Logged to Google Sheets successfully');
    }
  } catch (error) {
    console.error('❌ Google Sheets logging error:', error.message);
  }
}

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

// ============================================
// Detect question type to handle Yes/No properly
// ============================================
function detectQuestionType(question) {
  if (!question) return 'unknown';
  
  const lowerQuestion = question.toLowerCase();
  
  // INTEREST QUESTIONS (Yes/No) - Don't provide info when user says "No"
  const interestPatterns = [
    /would you like to know/i,
    /want to know/i,
    /interested in/i,
    /would you like (to|me to)/i,
    /want (to|me to)/i,
    /shall i/i,
    /should i/i,
    /can i (help|explain|tell)/i,
    /ready to/i,
    /need (help|assistance) with/i,
  ];
  
  if (interestPatterns.some(pattern => pattern.test(lowerQuestion))) {
    return 'interest'; // Yes/No question about user's interest
  }
  
  // KNOWLEDGE/EXPERIENCE QUESTIONS - Provide info when user says "No" (not familiar)
  const knowledgePatterns = [
    /how familiar are you/i,
    /do you (know|understand)/i,
    /have you (used|tried|heard of|considered)/i,
    /are you (familiar|experienced) with/i,
    /what('s| is) your (experience|level)/i,
  ];
  
  if (knowledgePatterns.some(pattern => pattern.test(lowerQuestion))) {
    return 'knowledge'; // Experience/knowledge level question
  }
  
  return 'unknown';
}

// ============================================
// Detect BOTH affirmative AND negative responses
// ============================================
function detectFollowUpResponse(query, lastQuestion) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Detect question type
  const questionType = detectQuestionType(lastQuestion);
  
  // AFFIRMATIVE PATTERNS
  const affirmativePatterns = [
    /^yes$/i, /^yeah$/i, /^yep$/i, /^yup$/i, /^ya$/i, /^yea$/i, /^aye$/i,
    /^sure$/i, /^of course$/i, /^certainly$/i, /^please$/i, /^yes please$/i,
    /^that would be great$/i, /^that'd be great$/i, /^that would be nice$/i,
    /^i'd like that$/i, /^i would like that$/i, /^sounds good$/i, /^sounds great$/i,
    /^perfect$/i, /^ok$/i, /^okay$/i, /^alright$/i, /^all right$/i, /^cool$/i,
    /^fine$/i, /^works for me$/i, /^that works$/i, /^definitely$/i, /^absolutely$/i,
    /^for sure$/i, /^indeed$/i, /^why not$/i, /^let's do it$/i, /^let's go$/i,
    /^i'm in$/i, /^tell me$/i, /^tell me more$/i, /^tell me about it$/i,
    /^show me$/i, /^explain$/i, /^go ahead$/i, /^go on$/i, /^continue$/i,
    /^proceed$/i, /^i'm interested$/i, /^interested$/i, /^i want to know$/i,
    /^i would like to know$/i, /^i'd like to know$/i, /^i'd love to know$/i,
    /^i want to learn$/i, /^i'd like to learn$/i, /^curious$/i, /^i'm curious$/i,
    /^now$/i, /^right now$/i, /^today$/i, /^now please$/i,
    /^familiar$/i, /^very familiar$/i, /^quite familiar$/i, /^not familiar$/i,
    /^not very familiar$/i, /^somewhat familiar$/i, /^a bit$/i, /^a little$/i,
    /^a little bit$/i, /^beginner$/i, /^intermediate$/i, /^advanced$/i,
    /^expert$/i, /^new to this$/i, /^new$/i, /^learning$/i, /^experienced$/i,
    /^novice$/i, /^just starting$/i, /^getting started$/i, /^pro$/i,
    /^professional$/i, /^start$/i, /^begin$/i, /^let's start$/i, /^help me$/i,
    /^assist me$/i, /^guide me$/i,
  ];
  
  // NEGATIVE PATTERNS
  const negativePatterns = [
    /^no$/i, /^nope$/i, /^nah$/i, /^na$/i, /^nay$/i, /^no thanks$/i,
    /^no thank you$/i, /^not interested$/i, /^not really$/i, /^i'm good$/i,
    /^i'm ok$/i, /^i'm okay$/i, /^i'm fine$/i, /^all good$/i, /^not now$/i,
    /^not right now$/i, /^maybe later$/i, /^later$/i, /^some other time$/i,
    /^another time$/i, /^nothing$/i, /^nothing else$/i, /^that's all$/i,
    /^that's it$/i, /^i'm done$/i, /^all set$/i, /^that'll be all$/i,
    /^skip$/i, /^skip it$/i, /^skip that$/i, /^pass$/i, /^move on$/i,
    /^next$/i, /^next topic$/i, /^i don't$/i, /^i don't know$/i,
    /^i don't think so$/i, /^don't know$/i, /^don't think$/i, /^not sure$/i,
    /^i'm not sure$/i, /^unsure$/i, /^haven't$/i, /^not yet$/i, /^never$/i,
    /^i'm not$/i, /^unfamiliar$/i, /^not familiar$/i, /^nvm$/i, /^nevermind$/i,
    /^never mind$/i, /^forget it$/i, /^doesn't matter$/i,
  ];
  
  const isAffirmative = affirmativePatterns.some(pattern => pattern.test(lowerQuery));
  const isNegative = negativePatterns.some(pattern => pattern.test(lowerQuery));
  
  if (isAffirmative) {
    return { 
      isFollowUp: true, 
      responseType: 'affirmative',
      questionType: questionType
    };
  }
  
  if (isNegative) {
    if (questionType === 'interest') {
      return { 
        isFollowUp: true, 
        responseType: 'declined',
        questionType: 'interest'
      };
    } else if (questionType === 'knowledge') {
      return { 
        isFollowUp: true, 
        responseType: 'negative',
        questionType: 'knowledge'
      };
    } else {
      return { 
        isFollowUp: true, 
        responseType: 'declined',
        questionType: 'unknown'
      };
    }
  }
  
  return { 
    isFollowUp: false, 
    responseType: 'neither',
    questionType: 'unknown'
  };
}

// ============================================
// Convert question to query based on response type
// ============================================
function convertQuestionToQuery(question, responseType) {
  if (!question) return null;
  
  let query = question.replace(/\?$/, '').trim();
  
  query = query
    .replace(/^(Would you like to know|Are you interested in|Do you want to know|Want to know|Interested in learning|How familiar are you with|Have you considered)/i, '')
    .trim();
  
  if (responseType === 'negative') {
    query = `how to ${query}`;
  } else if (responseType === 'affirmative') {
    if (query.toLowerCase().includes('familiar') || query.toLowerCase().includes('experience')) {
      query = query.replace(/familiar|experience/gi, 'advanced strategies');
    }
  }
  
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
    // Check for follow-up responses
    // ============================================
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      
      console.log('🔍 Last message role:', lastMessage.role);
      console.log('🔍 Last message preview:', lastMessage.content?.substring(0, 100));
      
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        const lastQuestion = extractLastQuestion(lastMessage.content);
        
        console.log('❓ Extracted question:', lastQuestion);
        
        if (lastQuestion) {
          const followUpDetection = detectFollowUpResponse(query, lastQuestion);
          
          console.log('🤔 Follow-up detection:', followUpDetection);
          
          if (followUpDetection.isFollowUp) {
            
            // CASE 1: User DECLINED
            if (followUpDetection.responseType === 'declined') {
              console.log('❌ User declined the offer - not providing information');
              
              const declinedResponses = [
                "No problem! Is there anything else you'd like to know about Hantec Markets?",
                "Sure, no worries! What else can I help you with?",
                "That's fine! Feel free to ask me anything else about Hantec Markets.",
                "Understood! Is there something else you'd like to explore?",
                "Got it! Let me know if you need help with anything else.",
                "No problem at all! What else are you curious about?",
              ];
              
              const randomResponse = declinedResponses[Math.floor(Math.random() * declinedResponses.length)];
              
              const declinedResponse = {
                response: randomResponse,
                confidence: 'high',
                sources: [],
                metadata: {
                  declined: true,
                  duration: Date.now() - startTime,
                },
              };
              
              // ✅ LOG TO BOTH SYSTEMS
              logChatInteraction({
                query: query,
                response: declinedResponse.response,
                confidence: 'high',
                queryCategory: 'follow-up-declined',
                sources: [],
                metadata: declinedResponse.metadata,
                conversationLength: conversationHistory.length,
              });
              
              await logToGoogleSheets({
                query: query,
                response: declinedResponse.response,
                confidence: 'high',
                queryCategory: 'follow-up-declined',
                sources: [],
                metadata: declinedResponse.metadata,
              });
              
              console.log('✅ Declined response sent');
              return declinedResponse;
            }
            
            // CASE 2: User said YES or indicated knowledge level
            console.log(`✅ ${followUpDetection.responseType.toUpperCase()} response detected!`);
            
            const followUpQuery = convertQuestionToQuery(lastQuestion, followUpDetection.responseType);
            console.log('🔄 Converted to query:', followUpQuery);
            
            if (followUpQuery) {
              query = followUpQuery;
              console.log('🎯 Proceeding with follow-up query:', query);
            }
          }
        }
      }
    }

    // Personality & character check
    const queryCategory = detectQueryCategory(query);
    console.log('🎭 Query category:', queryCategory);
    
    // Handle inappropriate queries
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
      
      logChatInteraction({
        query: query,
        response: response.response,
        confidence: 'blocked',
        queryCategory: 'inappropriate',
        sources: [],
        metadata: response.metadata,
        conversationLength: conversationHistory.length,
      });
      
      await logToGoogleSheets({
        query: query,
        response: response.response,
        confidence: 'blocked',
        queryCategory: 'inappropriate',
        sources: [],
        metadata: response.metadata,
      });
      
      return response;
    }
    
    // Handle testing queries
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
      
      await logToGoogleSheets({
        query: query,
        response: response.response,
        confidence: 'medium',
        queryCategory: 'testing',
        sources: [],
        metadata: response.metadata,
      });
      
      return response;
    }
    
    // Handle silly queries
    if (queryCategory === 'silly') {
      console.log('😄 Silly query detected');
      
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
      
      await logToGoogleSheets({
        query: query,
        response: response.response,
        confidence: 'low',
        queryCategory: 'silly',
        sources: [],
        metadata: response.metadata,
      });
      
      return response;
    }
    
    // Handle greetings
    if (queryCategory === 'greeting') {
      console.log('👋 Greeting detected');
      
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
      
      await logToGoogleSheets({
        query: query,
        response: response.response,
        confidence: 'high',
        queryCategory: 'greeting',
        sources: [],
        metadata: response.metadata,
      });
      
      return response;
    }

    // Handle "about AI" queries
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
      
      await logToGoogleSheets({
        query: query,
        response: response.response,
        confidence: 'high',
        queryCategory: 'about_ai',
        sources: [],
        metadata: response.metadata,
      });
      
      return response;
    }
    
    // Handle unrelated queries
    if (queryCategory === 'unrelated') {
      console.log('🔀 Unrelated query detected');
      
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
      
      await logToGoogleSheets({
        query: query,
        response: response.response,
        confidence: 'low',
        queryCategory: 'unrelated',
        sources: [],
        metadata: response.metadata,
      });
      
      return response;
    }

    // Trading-related - proceed with RAG
    console.log('✅ Trading-related query - proceeding with RAG');
    
    // Initialize vector store
    console.log('📚 Ensuring vector store is initialized...');
    await initializeVectorStore();
    
    // Check for escalation
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
      
      await logToGoogleSheets({
        query: query,
        response: response.response,
        confidence: 'escalation',
        queryCategory: 'escalation',
        sources: [],
        metadata: response.metadata,
      });
      
      return response;
    }
    
    // ============================================
    // ✅ SEARCH VECTOR STORE & EXTRACT SIMILARITY SCORES
    // ============================================
    console.log('📚 Searching knowledge base...');
    const results = await searchVectorStore(query);
    
    // ✅ EXTRACT SIMILARITY SCORES
    const topScore = results.length > 0 ? results[0].score : 0;
    const topScores = results.slice(0, 3).map(r => r.score); // Top 3 scores
    
    console.log('📊 Similarity scores:', {
      topScore: topScore.toFixed(3),
      topThree: topScores.map(s => s.toFixed(3))
    });
    
    // Determine confidence level
    const confidence = getConfidenceLevel(topScore, results.length);
    
    console.log(`📊 Confidence: ${confidence} (max score: ${topScore.toFixed(3)}, docs: ${results.length})`);
    
    // Handle no knowledge case
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
          topScore: 0,
          topScores: [],
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
      
      await logToGoogleSheets({
        query: query,
        response: fallbackResponse,
        confidence: 'low',
        queryCategory: queryCategory,
        sources: [],
        metadata: response.metadata,
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
    
    // Clean the response
    let finalResponse = cleanResponse(aiResponse.trim());
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Total processing time: ${duration}ms`);
    
    // ============================================
    // ✅ LOG TO BOTH SYSTEMS WITH SIMILARITY SCORES
    // ============================================
    const logData = {
      query: query,
      response: finalResponse,
      confidence: confidence,
      queryCategory: queryCategory,
      sources: results.map(r => r.metadata?.source || 'Knowledge Base').slice(0, 3),
      metadata: {
        retrievedDocs: results.length,
        topScore: topScore, // ✅ TOP SIMILARITY SCORE
        topScores: topScores, // ✅ TOP 3 SIMILARITY SCORES
        duration: duration,
      },
      conversationLength: conversationHistory.length,
    };
    
    // Log to local system (Render logs - viewable in dashboard)
    logChatInteraction(logData);
    
    // Log to Google Sheets (persistent storage)
    await logToGoogleSheets(logData);
    
    console.log('✅ Chat logged to both systems');
    
    return {
      response: finalResponse,
      confidence: confidence,
      sources: [], // Empty - don't send to frontend
      metadata: {
        retrievedDocs: results.length,
        topScore: topScore,
        topScores: topScores,
        duration: duration,
      },
    };
    
  } catch (error) {
    console.error('❌ Error processing query:', error.message);
    
    // LOG ERRORS
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