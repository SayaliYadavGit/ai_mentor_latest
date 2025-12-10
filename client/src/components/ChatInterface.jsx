import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import MessageBubble from './MessageBubble';
import InputForm from './Inputform';
import LoadingState from './LoadingState';
import { sendMessage } from '../api/client';
import { WELCOME_CARDS, QUICK_ACTIONS, ERROR_MESSAGES } from '../config';

function ChatInterface({ selectedOption, initialMessage, onBack, userName }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const initialMessageSent = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-send initial message (from welcome screen input)
  useEffect(() => {
    if (initialMessage && !initialMessageSent.current) {
      initialMessageSent.current = true;
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  // Send card/quick action greeting
  useEffect(() => {
    if (selectedOption && !initialMessage && !initialMessageSent.current) {
      let initialQuery = '';
      
      const card = WELCOME_CARDS.find(c => c.id === selectedOption);
      if (card) {
        initialQuery = card.greeting || `I want to ${card.title.toLowerCase()}`;
      }
      
      if (selectedOption.startsWith('quick_action_')) {
        const actionId = selectedOption.replace('quick_action_', '');
        const action = QUICK_ACTIONS.find(a => a.id === actionId);
        if (action) {
          initialQuery = `Tell me about ${action.label.toLowerCase()}`;
        }
      }

      if (initialQuery) {
        initialMessageSent.current = true;
        handleSendMessage(initialQuery);
      }
    }
  }, [selectedOption, initialMessage]);

  const handleSendMessage = async (query) => {
    const userMessage = {
      id: Date.now(),
      content: query,
      isUser: true,
      timestamp: new Date().toISOString(),
      userName: userName,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await sendMessage(query, messages);

      if (result.success) {
        const aiMessage = {
          id: Date.now() + 1,
          content: result.data.response,
          isUser: false,
          timestamp: new Date().toISOString(),
          confidence: result.data.confidence,
          sources: result.data.sources,
          metadata: result.data.metadata,
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          content: result.error || ERROR_MESSAGES.general,
          isUser: false,
          timestamp: new Date().toISOString(),
          confidence: 'error',
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        content: ERROR_MESSAGES.network,
        isUser: false,
        timestamp: new Date().toISOString(),
        confidence: 'error',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSidebarQuery = (query) => {
    handleSendMessage(query);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F5F5F7]">
      <Sidebar 
        onSelectQuery={handleSidebarQuery}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-[#e5e5e5] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#666666] hover:text-[#1a1a1a] -ml-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] shadow-sm">
              <span className="text-white font-semibold text-sm italic">H</span>
            </div>

            <div>
              <h1 className="text-base font-semibold text-[#1a1a1a]">
                Hantec AI Assistant
              </h1>
              <p className="text-xs text-[#666666]">
                Your 24/7 trading mentor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm text-[#666666] hover:text-[#8B0000] hover:bg-[#fafafa] rounded-lg transition-all"
            >
              ← Back
            </button>

            <button
              onClick={() => {
                setMessages([]);
                onBack();
              }}
              className="px-4 py-2 text-sm bg-[#8B0000] text-white rounded-lg hover:bg-[#A00000] transition-all"
            >
              New Chat
            </button>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin"
        >
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl italic">H</span>
                </div>
                <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">
                  How can I help you today?
                </h2>
                <p className="text-[#666666]">
                  Ask me anything about trading, platforms, or account setup
                </p>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isUser={message.isUser}
              />
            ))}

            {isLoading && <LoadingState />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <InputForm 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default ChatInterface;