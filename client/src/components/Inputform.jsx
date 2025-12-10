import React, { useState } from 'react';

function InputForm({ onSendMessage, disabled }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-[#e5e5e5] bg-white px-6 py-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-center">
          {/* Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={disabled}
            className="flex-1 h-[60px] bg-white border border-[#e5e5e5] rounded-xl px-5 pr-24 text-[#1a1a1a] placeholder-[#999999] focus:outline-none focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={500}
          />

          {/* Right Icons Container */}
          <div className="absolute right-3 flex items-center gap-2">
            {/* Microphone Icon (placeholder) */}
            <button
              type="button"
              className="p-2 text-[#666666] hover:text-[#8B0000] transition-colors disabled:opacity-50"
              disabled={disabled}
              title="Voice input (coming soon)"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
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

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || disabled}
              className="p-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#A00000] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8B0000]"
              title="Send message"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Character Count */}
        {inputValue.length > 400 && (
          <p className="text-xs text-[#999999] mt-2 text-right">
            {inputValue.length}/500 characters
          </p>
        )}
      </form>

      {/* Footer Text */}
      <div className="max-w-4xl mx-auto mt-3">
        <p className="text-xs text-[#999999] text-center">
          All chats are private & encrypted. Hantec AI may make mistakes — verify key info →
        </p>
      </div>
    </div>
  );
}

export default InputForm;