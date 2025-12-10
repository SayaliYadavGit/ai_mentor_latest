// LangChain Chains - Main AI Logic with RAG
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
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
} from './config.js';
import { searchVectorStore } from './vectorStore.js';

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

// Create prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
{systemPrompt}

Context from knowledge base:
{context}

User query: {query}

Please provide a helpful response following all guidelines above.
`);

// Create chain
const chain = RunnableSequence.from([
  promptTemplate,
  model,
  new StringOutputParser(),
]);

/**
 * Process user query with RAG and confidence scoring
 */
export async function processQuery(query, conversationHistory = []) {
  try {
    console.log('🔍 Processing query:', query.substring(0, 100) + '...');
    const startTime = Date.now();
    
    // Validate query
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }
    
    // Check for escalation triggers
    if (requiresEscalation(query)) {
      console.log('🚨 Escalation triggered');
      return {
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
      
      // Suggest related questions
      const relatedQuestions = DEFAULT_RELATED_QUESTIONS
        .slice(0, 3)
        .map(q => `- ${q}`)
        .join('\n');
      
      const fallbackResponse = RESPONSE_TEMPLATES.noKnowledge(
        APP_CONFIG.supportEmail,
        relatedQuestions
      );
      
      return {
        response: fallbackResponse,
        confidence: 'low',
        sources: [],
        relatedQuestions: DEFAULT_RELATED_QUESTIONS.slice(0, 3),
        metadata: {
          retrievedDocs: 0,
          duration: Date.now() - startTime,
        },
      };
    }
    
    // Prepare context from retrieved documents
    const context = results
      .map((result, idx) => {
        const source = result.metadata?.source || 'Knowledge Base';
        return `[Document ${idx + 1}] (Score: ${result.score.toFixed(3)}, Source: ${source})\n${result.content}`;
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
    
    // Post-process response
    let finalResponse = aiResponse.trim();
    
    // Add risk disclaimer if needed
    if (requiresRiskDisclaimer(query)) {
      console.log('⚠️  Adding risk disclaimer');
      finalResponse += `\n\n${COMPLIANCE_RULES.riskDisclaimer}`;
    }
    
    // Format sources
    const sources = formatSources(results.map(r => ({
      metadata: r.metadata,
    })));
    
    // Add caveat for medium confidence
    if (confidence === 'medium') {
      console.log('⚠️  Medium confidence - adding caveat');
      finalResponse = RESPONSE_TEMPLATES.mediumConfidence(
        finalResponse,
        sources,
        APP_CONFIG.supportEmail
      );
    }
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Total processing time: ${duration}ms`);
    
    return {
      response: finalResponse,
      confidence: confidence,
      sources: results.map(r => r.metadata?.source || 'Knowledge Base').slice(0, 3),
      metadata: {
        retrievedDocs: results.length,
        topScore: maxScore,
        duration: duration,
        disclaimerAdded: requiresRiskDisclaimer(query),
      },
    };
    
  } catch (error) {
    console.error('❌ Error processing query:', error.message);
    
    // Return error response
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