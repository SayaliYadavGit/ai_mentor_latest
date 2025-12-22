import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper to get current date for log file name
function getLogFileName(type = 'chat') {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `${type}-${date}.jsonl`);
}

/**
 * Log a chat interaction
 */
export function logChatInteraction(data) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'chat_interaction',
      ...data,
    };
    
    const logFile = getLogFileName('chat');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    console.log('✅ Chat logged:', data.query?.substring(0, 50));
  } catch (error) {
    console.error('❌ Error logging chat:', error.message);
  }
}

/**
 * Log user feedback (thumbs up/down)
 */
export function logUserFeedback(data) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'user_feedback',
      ...data,
    };
    
    const logFile = getLogFileName('feedback');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    console.log('✅ Feedback logged:', data.feedback);
  } catch (error) {
    console.error('❌ Error logging feedback:', error.message);
  }
}

/**
 * Log errors and issues
 */
export function logError(data) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      ...data,
    };
    
    const logFile = getLogFileName('errors');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    console.error('❌ Error logged:', data.error);
  } catch (error) {
    console.error('❌ Error logging error:', error.message);
  }
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary() {
  try {
    const chatLog = getLogFileName('chat');
    
    if (!fs.existsSync(chatLog)) {
      return { message: 'No logs found yet' };
    }
    
    const lines = fs.readFileSync(chatLog, 'utf-8').split('\n').filter(Boolean);
    const interactions = lines.map(line => JSON.parse(line));
    
    // Calculate metrics
    const totalQueries = interactions.length;
    const avgResponseTime = interactions.reduce((sum, i) => sum + (i.metadata?.duration || 0), 0) / totalQueries;
    
    const confidenceBreakdown = {
      high: interactions.filter(i => i.confidence === 'high').length,
      medium: interactions.filter(i => i.confidence === 'medium').length,
      low: interactions.filter(i => i.confidence === 'low').length,
      error: interactions.filter(i => i.confidence === 'error').length,
    };
    
    const categoryBreakdown = {};
    interactions.forEach(i => {
      const cat = i.queryCategory || 'unknown';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });
    
    return {
      totalQueries,
      avgResponseTime: Math.round(avgResponseTime),
      confidenceBreakdown,
      categoryBreakdown,
      period: {
        start: interactions[0]?.timestamp,
        end: interactions[interactions.length - 1]?.timestamp,
      }
    };
    
  } catch (error) {
    console.error('Error getting analytics:', error.message);
    return { error: error.message };
  }
}

export default {
  logChatInteraction,
  logUserFeedback,
  logError,
  getAnalyticsSummary,
};