import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import WelcomeScreen from './components/WelcomeScreen';
import './App.css';

function App() {
  const [conversationStarted, setConversationStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [initialQuery, setInitialQuery] = useState('');

  // Auto-start conversation from URL parameters (iframe mode)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const option = urlParams.get('option');
    const query = urlParams.get('query');
    
    if ((option || query) && !conversationStarted) {
      console.log('🎯 Auto-starting from URL:', { option, query });
      setConversationStarted(true);
      
      if (option) {
        setSelectedOption(option);
        // Set initial query based on option
        const optionQueries = {
          'about_hantec': 'Tell me about Hantec Markets',
          'what_is_mt5': 'What is MT5?',
          'start_trading': 'I want to start live trading',
          'learn_cfds': 'I want to learn about CFDs',
          'take_tour': 'Give me a quick tour of the platform',
          'demo_trading': 'What is demo trading?',
          'what_are_cfds': 'What are CFDs?'
        };
        setInitialQuery(optionQueries[option] || '');
      }
      
      if (query) {
        setInitialQuery(decodeURIComponent(query));
      }
    }
  }, [conversationStarted]);

  const handleStartConversation = (option, query = '') => {
    console.log('🎬 Starting conversation:', { option, query });
    
    setSelectedOption(option);
    setConversationStarted(true);
    
    // Set initial query based on option if no custom query provided
    if (!query) {
      const optionQueries = {
        'about_hantec': 'Tell me about Hantec Markets',
        'what_is_mt5': 'What is MT5?',
        'start_trading': 'I want to start live trading',
        'learn_cfds': 'I want to learn about CFDs',
        'take_tour': 'Give me a quick tour of the platform',
        'demo_trading': 'What is demo trading?',
        'what_are_cfds': 'What are CFDs?',
        'general': ''
      };
      query = optionQueries[option] || '';
    }
    
    setInitialQuery(query);
  };

  return (
    <div className="App">
      {!conversationStarted ? (
        <WelcomeScreen 
          userName="James"
          onStartConversation={handleStartConversation}
        />
      ) : (
        <ChatInterface 
          selectedOption={selectedOption}
          initialQuery={initialQuery}
          userName="James"
        />
      )}
    </div>
  );
}

export default App;