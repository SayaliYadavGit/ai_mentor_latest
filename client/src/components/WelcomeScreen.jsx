import React from 'react';
import { WELCOME_CARDS, QUICK_ACTIONS } from '../config';

function WelcomeScreen({ onStartConversation, userName }) {
  const handleCardClick = (cardId) => {
    onStartConversation(cardId);
  };

  const handleQuickAction = (actionId) => {
    onStartConversation(`quick_action_${actionId}`);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.userQuery.value.trim();
    if (input) {
      onStartConversation('general', input);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[1200px] mx-auto">
        
        {/* Logo & Greeting */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] mb-6 shadow-lg">
            <span className="text-white font-bold text-2xl italic">H</span>
          </div>

          {/* Greeting */}
          <h1 className="text-[32px] font-semibold text-[#1a1a1a] mb-2 leading-tight">
            Welcome to Hantec one, {userName} 👋
          </h1>
          <p className="text-[#666666] text-base">
            Your AI trading mentor is here to help you every step of the way
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {WELCOME_CARDS.map((card) => {
            const isPrimary = card.type === 'primary';
            
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  card-hover
                  w-full min-h-[150px] rounded-2xl p-6 text-left
                  transition-all duration-200
                  ${isPrimary 
                    ? 'bg-[#8B0000] text-white shadow-md hover:shadow-lg' 
                    : 'bg-white border border-[#f0f0f0] text-[#1a1a1a] shadow-sm hover:shadow-md'
                  }
                `}
              >
                {/* Icon */}
                <div className="text-3xl mb-3">{card.icon}</div>

                {/* Title */}
                <h3 className={`text-base font-semibold mb-2 ${isPrimary ? 'text-white' : 'text-[#1a1a1a]'}`}>
                  {card.title}
                </h3>

                {/* Description or Items */}
                {card.description && (
                  <p className={`text-sm leading-relaxed ${isPrimary ? 'text-white/90' : 'text-[#666666]'}`}>
                    {card.description}
                  </p>
                )}

                {card.items && (
                  <ul className="space-y-2">
                    {card.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#666666]">
                        <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Text */}
                {card.ctaText && (
                  <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${
                    isPrimary ? 'text-white' : 'text-[#8B0000]'
                  }`}>
                    {card.ctaText}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className="bg-white border border-[#e5e5e5] rounded-full px-5 py-3 hover:bg-[#fafafa] transition-all text-sm text-[#1a1a1a] font-medium flex items-center gap-2 shadow-sm hover:shadow"
              style={{ borderLeftColor: action.color, borderLeftWidth: '3px' }}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="max-w-[800px] mx-auto">
          <form onSubmit={handleInputSubmit}>
            <div className="relative">
              <input
                type="text"
                name="userQuery"
                placeholder="Ask me anything..."
                className="w-full h-[60px] bg-white border border-[#e5e5e5] rounded-xl px-5 pr-14 text-[#1a1a1a] placeholder-[#999999] focus:outline-none focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 transition-all shadow-sm"
                maxLength={500}
              />
              
              {/* Microphone Icon */}
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#666666] hover:text-[#8B0000] transition-colors"
                title="Voice input (coming soon)"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Footer Text */}
          <p className="text-xs text-[#999999] text-center mt-4">
            All chats are private & encrypted. Hantec AI may make mistakes — verify key info →
          </p>
        </div>

      </div>
    </div>
  );
}

export default WelcomeScreen;