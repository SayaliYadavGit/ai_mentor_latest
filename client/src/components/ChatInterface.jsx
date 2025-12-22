import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

// Use Render backend
const API_URL = import.meta.env.VITE_API_URL || 'https://ai-mentor-latest.onrender.com';

// NEW sample questions
const SAMPLE_QUESTIONS = [
  "How do I download MT4?",
  "Can I use Expert Advisors on MT4?",
  "What's the minimum deposit required in Hantec Markets?",
  "What's the difference between MT4 and MT5?",
  "How does Hantec Social work?",
  "What are the fees for copy trading?",
  "What account types does Hantec offer?",
  "What currency pairs can I trade?",
  "Are there expiry dates for CFDs?"
];

const ChatInterface = ({ selectedOption, initialQuery, userName }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const hasAutoSent = useRef(false);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send initial query
  useEffect(() => {
    console.log('🔍 Initial query:', initialQuery);
    
    if (initialQuery && !hasAutoSent.current) {
      console.log('📤 Auto-sending:', initialQuery);
      hasAutoSent.current = true;
      
      const userMessage = {
        id: Date.now(),
        text: initialQuery,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages([userMessage]);
      
      setTimeout(() => {
        sendToBackend(initialQuery);
      }, 100);
    }
  }, [initialQuery]);

  // Clean response text - REMOVE ** and [...] lines
  const cleanResponseText = (text) => {
    if (!text) return '';
    
    // Remove ** markdown bold
    let cleaned = text.replace(/\*\*/g, '');
    
    // Remove lines that contain [...] (suggestions line)
    cleaned = cleaned.split('\n')
      .filter(line => !line.trim().match(/^\[.*\]$/))
      .join('\n');
    
    return cleaned.trim();
  };

  // Send to backend
  const sendToBackend = async (text) => {
    if (!text || !text.trim()) {
      console.log('⚠️ Empty text, skipping');
      return;
    }

    const trimmedText = text.trim();
    console.log('📤 Sending to:', API_URL);
    console.log('📤 Query:', trimmedText);

    setIsLoading(true);

    try {
      // ============================================
      // BUILD CONVERSATION HISTORY 💬
      // ============================================
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      console.log('📜 Conversation history:', conversationHistory.length, 'messages');
      
      const payload = { 
        query: trimmedText,
        conversationHistory: conversationHistory  // ✅ NOW INCLUDED!
      };
      
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📨 Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Response:', data);

      // Clean the response text
      const cleanedText = cleanResponseText(data.response || 'No response received');

      const aiMessage = {
        id: Date.now() + 1,
        text: cleanedText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        sources: data.sources || [],
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('❌ Error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message}. Please try again.`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    console.log('📝 User input:', inputValue);

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    sendToBackend(inputValue);
    
    setInputValue('');
  };

  // Handle sample question click
  const handleSampleQuestionClick = (question) => {
    console.log('📝 Sample question:', question);

    const userMessage = {
      id: Date.now(),
      text: question,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendToBackend(question);
  };

  return (
    <div className="chat-interface-container">
      {/* LEFT SIDEBAR */}
      <div className="chat-sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/PrimaryLogo.svg" alt="Hantec Halo" />
        </div>

        {/* Sample Questions */}
        <div className="sidebar-questions">
          {SAMPLE_QUESTIONS.map((question, index) => (
            <button
              key={index}
              className="sample-question-btn"
              onClick={() => handleSampleQuestionClick(question)}
              disabled={isLoading}
            >
              <img src="/message-text-circle-02.svg" alt="" className="question-icon" />
              <span>{question}</span>
            </button>
          ))}
        </div>

        {/* Pro Tip */}
        <div className="pro-tip">
          <div className="pro-tip-icon">💡</div>
          <div className="pro-tip-content">
            <strong>Pro Tip</strong>
            <p>Ask Hantec related specific questions for better answers</p>
          </div>
        </div>

        {/* Beta Badge */}
        <div className="beta-badge">
          <img src="/BetaBadge.svg" alt="Beta - Improving with feedback" />
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="chat-main">
        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 && !isLoading && (
            <div className="empty-state">
              <p>👋 Hi {userName}! How can I help you today?</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-ai'}`}
            >
              {/* AI Avatar */}
              {message.sender === 'ai' && (
                <div className="message-avatar">
                  <img src="/chaticon.svg" alt="AI" />
                </div>
              )}
              
              <div className="message-content">
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {/* Loading State - "Thinking..." */}
          {isLoading && (
            <div className="message message-ai">
              <div className="message-avatar">
                <img src="/chaticon.svg" alt="AI" />
              </div>
              <div className="message-content loading-message">
                <div className="loading-text">
                  <span className="thinking-text">Thinking</span>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form - DISCLAIMER MOVED ABOVE INPUT */}
        <div className="chat-input-container">
          {/* Disclaimer above input */}
          <div className="beta-notice">
            Halo is currently in beta, with knowledge limited to the Hantec Markets website — verify key info
          </div>
          
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="chat-input"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className="chat-send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 5V19M12 5L19 12M12 5L5 12" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;