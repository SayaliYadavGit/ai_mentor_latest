import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

// Use Render backend
const API_URL = import.meta.env.VITE_API_URL || 'https://ai-mentor-latest.onrender.com';

// Sample questions for left sidebar
const SAMPLE_QUESTIONS = [
  "How do I open an account?",
  "What documents do I need to sign up?",
  "I uploaded my ID but it was rejected, why?",
  "How do I open an account?",
  "How do I open an account?",
  "How do I open an account?"
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
      const payload = { query: trimmedText };
      
      console.log('📦 Payload:', JSON.stringify(payload));

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

      const aiMessage = {
        id: Date.now() + 1,
        text: data.response || 'No response received',
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
        {/* Logo - Using PrimaryLogo.svg */}
        <div className="sidebar-logo">
          <img src="/PrimaryLogo.svg" alt="Hantec Halo" />
        </div>

        {/* Sample Questions - Using message-text-circle-02.svg */}
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
              {/* AI Avatar - Using chaticon.svg */}
              {message.sender === 'ai' && (
                <div className="message-avatar">
                  <img src="/chaticon.svg" alt="AI" />
                </div>
              )}
              
              <div className="message-content">
                <p>{message.text}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources">
                    <small>Sources: {message.sources.join(', ')}</small>
                  </div>
                )}
              </div>

              {/* NO "Nice" button - removed as requested */}
            </div>
          ))}

          {isLoading && (
            <div className="message message-ai">
              <div className="message-avatar">
                <img src="/chaticon.svg" alt="AI" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="chat-input-container">
          <div className="beta-notice">
            Halo is currently in beta, with knowledge limited to the Hantec Markets website — verify key info
          </div>
          
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about Hantec & more"
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