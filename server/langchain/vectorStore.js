// Vector Store Setup - In-Memory Mode with Proper Caching
import dotenv from 'dotenv';
dotenv.config();

import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Document } from 'langchain/document';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data paths
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../data');

console.log('📂 Data path:', DATA_PATH);

// Verify API key is loaded
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY not found in environment variables. Check your .env file!');
}
console.log('✅ OpenAI API key loaded');

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  modelName: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Text splitter configuration - OPTIMIZED
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1500,    // Increased from 1000 (fewer chunks = faster search)
  chunkOverlap: 150,  // Reduced from 200 (less overlap needed with larger chunks)
});

// ============================================
// CRITICAL: Global vector store cache
// ============================================
let vectorStore = null;
let isInitializing = false;
let initializationPromise = null;

/**
 * Initialize vector store with documents from data folder
 * Uses MemoryVectorStore with proper caching
 * 
 * CACHING STRATEGY:
 * - Only initializes ONCE per server lifetime
 * - Subsequent calls return cached instance immediately
 * - Prevents duplicate initialization if called multiple times
 */
export async function initializeVectorStore() {
  // ============================================
  // CACHE CHECK #1: Already initialized
  // ============================================
  if (vectorStore) {
    console.log('✅ Vector store already initialized, using cache');
    return vectorStore;
  }
  
  // ============================================
  // CACHE CHECK #2: Currently initializing
  // ============================================
  if (isInitializing && initializationPromise) {
    console.log('⏳ Vector store initialization in progress, waiting...');
    return initializationPromise;
  }
  
  // ============================================
  // START INITIALIZATION
  // ============================================
  isInitializing = true;
  
  // Create promise for concurrent requests to wait on
  initializationPromise = (async () => {
    try {
      const startTime = Date.now();
      console.log('📄 Initializing vector store (in-memory mode)...');
      
      // Load documents from data folder
      const loader = new DirectoryLoader(DATA_PATH, {
        '.txt': (path) => new TextLoader(path),
      });
      
      const docs = await loader.load();
      console.log(`📄 Loaded ${docs.length} documents`);
      
      if (docs.length === 0) {
        console.warn('⚠️  No documents found. Add .txt files to', DATA_PATH);
        console.warn('⚠️  Creating vector store with sample Hantec data...');
        
        // Create sample documents for Hantec
        const sampleDocs = [
          new Document({
            pageContent: 'Hantec Markets offers CFD trading on Forex, Metals, Indices, Commodities, Stocks, and Cryptocurrency. We provide leverage up to 500:1 and spreads starting from 0.1 pips.',
            metadata: { source: 'system', type: 'products' }
          }),
          new Document({
            pageContent: 'MetaTrader 5 (MT5) is the next generation trading platform offering enhanced features over MT4. It provides more timeframes, technical indicators, and an economic calendar. Key improvements include 21 timeframes vs 9 in MT4, 38 technical indicators, built-in economic calendar, depth of market (DOM), and more order types.',
            metadata: { source: 'system', type: 'platforms' }
          }),
          new Document({
            pageContent: 'Hantec Social is a social trading platform that allows traders to follow and copy the trades of experienced investors. It facilitates collaborative trading and learning. Features include copy trading functionality, follow top traders, social trading community, and performance tracking.',
            metadata: { source: 'system', type: 'platforms' }
          }),
          new Document({
            pageContent: 'Account types: Hantec Global (most popular, 0% commission), Hantec Pro (ECN account, lower spreads), Hantec Cent (micro lots for beginners). Demo accounts available for practice.',
            metadata: { source: 'system', type: 'accounts' }
          }),
          new Document({
            pageContent: 'Hantec Markets is regulated by FCA (UK), FSC (Mauritius), ASIC (Australia), and VFSC (Vanuatu). Client funds are segregated and protected. We serve over 200,000 clients globally.',
            metadata: { source: 'system', type: 'regulations' }
          }),
          new Document({
            pageContent: 'Deposit methods: Bank transfer, Credit/Debit card, E-wallets. Withdrawal processing from 5 minutes to 24 hours depending on method. Minimum deposit varies by account type (typically $100).',
            metadata: { source: 'system', type: 'funding' }
          }),
        ];
        
        // Create vector store with sample data
        vectorStore = await MemoryVectorStore.fromDocuments(
          sampleDocs,
          embeddings
        );
        
        const duration = Date.now() - startTime;
        console.log('✅ Vector store created with sample Hantec data');
        console.log(`⏱️  Initialization time: ${duration}ms`);
        console.log('💡 Add .txt files to', DATA_PATH, 'to improve chatbot knowledge');
        
        isInitializing = false;
        return vectorStore;
      }
      
      // Split documents into chunks
      const splitDocs = await textSplitter.splitDocuments(docs);
      console.log(`✂️  Split into ${splitDocs.length} chunks`);
      
      // Create vector store with documents
      console.log('🧠 Creating in-memory vector store...');
      vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings
      );
      
      const duration = Date.now() - startTime;
      console.log('✅ Vector store initialized successfully');
      console.log(`📊 Indexed ${splitDocs.length} document chunks`);
      console.log(`⏱️  Total initialization time: ${duration}ms`);
      
      isInitializing = false;
      return vectorStore;
      
    } catch (error) {
      console.error('❌ Error initializing vector store:', error.message);
      console.error('Stack:', error.stack);
      isInitializing = false;
      initializationPromise = null;
      throw error;
    }
  })();
  
  return initializationPromise;
}

/**
 * Search vector store for relevant documents
 * OPTIMIZED: Reduced default k from 5 to 3
 */
export async function searchVectorStore(query, k = 3) {  // Changed from k = 5
  if (!vectorStore) {
    console.log('⚠️  Vector store not initialized, initializing now...');
    await initializeVectorStore();
  }
  
  if (!vectorStore) {
    throw new Error('Vector store initialization failed');
  }
  
  try {
    const searchStart = Date.now();
    
    const results = await vectorStore.similaritySearchWithScore(query, k);
    
    // Filter by similarity threshold (0.0 = no filtering)
    const threshold = parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.0;
    const filteredResults = results.filter(
      ([doc, score]) => score >= threshold
    );
    
    const searchDuration = Date.now() - searchStart;
    
    console.log(`🔍 Search: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    console.log(`📊 Found ${filteredResults.length}/${results.length} relevant documents`);
    console.log(`⏱️  Search time: ${searchDuration}ms`);
    
    if (filteredResults.length > 0) {
      const topScore = filteredResults[0][1].toFixed(3);
      console.log(`✨ Top similarity score: ${topScore}`);
    }
    
    return filteredResults.map(([doc, score]) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score: score,
    }));
    
  } catch (error) {
    console.error('❌ Error searching vector store:', error.message);
    throw error;
  }
}

/**
 * Get vector store instance
 */
export function getVectorStore() {
  if (!vectorStore) {
    throw new Error('Vector store not initialized. Call initializeVectorStore() first.');
  }
  return vectorStore;
}

/**
 * Get vector store statistics
 */
export async function getVectorStoreStats() {
  if (!vectorStore) {
    return {
      initialized: false,
      documentCount: 0,
    };
  }
  
  return {
    initialized: true,
    type: 'memory',
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    mode: 'in-memory',
    cached: true,
  };
}

/**
 * Check if vector store is ready
 */
export function isVectorStoreReady() {
  return vectorStore !== null;
}

/**
 * Force reset vector store (for testing/debugging)
 */
export function resetVectorStore() {
  console.log('🔄 Resetting vector store cache...');
  vectorStore = null;
  isInitializing = false;
  initializationPromise = null;
  console.log('✅ Vector store cache cleared');
}

// ============================================
// AUTO-INITIALIZATION ON MODULE LOAD
// ============================================
console.log('🔄 Auto-initializing vector store on module load...');
initializeVectorStore()
  .then(() => {
    console.log('✅ Vector store ready and waiting for queries');
  })
  .catch((error) => {
    console.error('❌ Auto-initialization failed:', error.message);
    console.warn('⚠️  Vector store will initialize on first query instead');
  });