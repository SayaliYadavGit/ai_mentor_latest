import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInterface from './components/ChatInterface';
import { APP_CONFIG } from './config';

function App() {
  const [conversationStarted, setConversationStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [initialMessage, setInitialMessage] = useState(null);
  const [userName] = useState(APP_CONFIG.userName || 'James');

  const handleStartConversation = (option, message) => {
    setSelectedOption(option);
    setInitialMessage(message || null);
    setConversationStarted(true);
  };

  const handleBackToWelcome = () => {
    setConversationStarted(false);
    setSelectedOption(null);
    setInitialMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {!conversationStarted ? (
        <WelcomeScreen 
          onStartConversation={handleStartConversation}
          userName={userName}
        />
      ) : (
        <ChatInterface 
          selectedOption={selectedOption}
          initialMessage={initialMessage}
          onBack={handleBackToWelcome}
          userName={userName}
        />
      )}
    </div>
  );
}

export default App;