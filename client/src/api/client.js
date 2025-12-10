// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

console.log('🔗 API Base URL:', API_BASE_URL);

/**
 * Send a message to the AI chatbot
 * @param {string} query - User's message
 * @param {Array} conversationHistory - Previous messages (optional)
 * @returns {Promise<Object>} Response data or error
 */
export async function sendMessage(query, conversationHistory = []) {
  try {
    console.log('📤 Sending message to API:', query);
    
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query, 
        conversationHistory 
      }),
    });

    console.log('📥 API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response received:', {
      confidence: data.confidence,
      sourcesCount: data.sources?.length || 0
    });
    
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    
    // Enhanced error messages for users
    let userMessage = 'Failed to connect to the AI service.';
    
    if (error.message.includes('fetch')) {
      userMessage = 'Unable to reach the server. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
      userMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('429')) {
      userMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.message.includes('500')) {
      userMessage = 'Server error. Our team has been notified.';
    }
    
    return { 
      success: false, 
      error: userMessage,
      details: error.message 
    };
  }
}

/**
 * Check API health status
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Get chat statistics (optional feature)
 * @returns {Promise<Object>} Chat stats
 */
export async function getChatStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stats`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Stats request failed: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Stats error:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Export API base URL for other uses
export { API_BASE_URL };