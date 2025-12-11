import { ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let vectorStore = null;

async function initializeVectorStore() {
  if (vectorStore) return vectorStore;
  
  console.log('📚 Initializing knowledge base...');
  
  try {
    const knowledgeBasePath = path.join(__dirname, '..', '..', 'data', 'knowledge_base');
    
    if (!fs.existsSync(knowledgeBasePath)) {
      console.warn('⚠️  Knowledge base not found, creating empty store');
      vectorStore = await MemoryVectorStore.fromTexts(
        ['Hantec Markets is a CFD broker offering trading services.'],
        [{ source: 'default' }],
        new OpenAIEmbeddings()
      );
      return vectorStore;
    }

    const documents = [];
    const files = fs.readdirSync(knowledgeBasePath).filter(f => f.endsWith('.txt'));
    
    console.log(`📄 Loading ${files.length} files...`);
    
    for (const file of files) {
      const loader = new TextLoader(path.join(knowledgeBasePath, file));
      const docs = await loader.load();
      documents.push(...docs);
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(documents);
    
    vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings()
    );
    
    console.log(`✅ Knowledge base ready: ${splitDocs.length} chunks`);
    return vectorStore;
    
  } catch (error) {
    console.error('❌ Error initializing vector store:', error);
    vectorStore = await MemoryVectorStore.fromTexts(
      ['Hantec Markets is a CFD broker. Please contact support for more information.'],
      [{ source: 'fallback' }],
      new OpenAIEmbeddings()
    );
    return vectorStore;
  }
}

initializeVectorStore().catch(console.error);

export async function handleChat(req, res) {
  try {
    const { query, conversationHistory = [] } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    console.log('💬 Query:', query);
    
    if (!vectorStore) {
      await initializeVectorStore();
    }

    const results = await vectorStore.similaritySearchWithScore(query, 5);
    
    console.log(`📚 Found ${results.length} relevant documents`);
    
    if (results.length === 0 || results[0][1] < 0.3) {
      return res.json({
        answer: "I don't have specific information about that in my knowledge base. Please contact our support team for assistance.",
        sources: [],
        confidence: 'low',
        sourcesCount: 0
      });
    }

    const context = results
      .map(([doc, score]) => doc.pageContent)
      .join('\n\n');

    const model = new ChatOpenAI({
      modelName: process.env.MODEL_NAME || 'gpt-4o-mini',
      temperature: parseFloat(process.env.TEMPERATURE) || 0.1,
      maxTokens: parseInt(process.env.MAX_TOKENS) || 500,
    });

    const messages = [
      {
        role: 'system',
        content: `You are a helpful trading assistant for Hantec Markets. Use the following context to answer questions. Be concise and helpful.

Context:
${context}

Important:
- Only answer based on the provided context
- If you're not sure, say so
- Always include risk warnings for trading-related questions
- Be professional and supportive`
      },
      ...conversationHistory.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: query
      }
    ];

    const response = await model.invoke(messages);
    
    const topScore = results[0][1];
    let confidence = 'low';
    if (topScore >= 0.5) confidence = 'high';
    else if (topScore >= 0.35) confidence = 'medium';

    console.log(`✅ Response generated (confidence: ${confidence})`);

    // FIXED: Return flat object, not nested in "data"
    res.json({
      answer: response.content,
      sources: results.slice(0, 3).map(([doc, score]) => ({
        content: doc.pageContent.substring(0, 200) + '...',
        score: score.toFixed(3)
      })),
      confidence: confidence,
      sourcesCount: results.length
    });
    
  } catch (error) {
    console.error('❌ Error in handleChat:', error);
    res.status(500).json({
      error: 'An error occurred processing your request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}