import React from 'react';
import { isInIframe, openInNewTab } from '../utils/iframe';
import './WelcomeScreen.css';

const WelcomeScreen = ({ userName, onStartConversation }) => {
  const embedded = isInIframe();

  const handleButtonClick = (option) => {
    if (embedded) {
      console.log('🔗 Opening in new tab (embedded mode)');
      openInNewTab(`/?option=${option}`);
      return;
    }
    
    console.log('✅ Starting conversation (standalone mode)');
    onStartConversation(option);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const query = input.value.trim();
    
    if (!query) return;
    
    if (embedded) {
      console.log('🔗 Opening in new tab with query');
      openInNewTab(`/?query=${encodeURIComponent(query)}`);
    } else {
      console.log('✅ Starting conversation with query');
      onStartConversation('general', query);
    }
  };

  return (
    <div className="welcome-container-dark">
      {/* Top Section with Icon and Beta Badge */}
      <div className="top-section">
        {/* TryBeta SVG Icon */}
        <div className="icon-container">
          <img 
            src="/TryBeta.svg" 
            alt="Halo" 
            className="app-icon" 
          />
        </div>

        {/* Beta Button - SINGLE ONE ONLY */}
       
      </div>

      {/* Main Header */}
      <div className="main-header">
        <h1 className="greeting-dark">
          Hi 👋 I'm <span className="brand-halo">Halo</span>
        </h1>
        <h2 className="tagline-dark">
          Your Go-to companion for all<br />Hantec questions
        </h2>
        <p className="capabilities-dark">
          Accounts • Platforms • Markets • Payments
        </p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons-dark">
        {/* About Hantec Button */}
        <button 
          className="action-btn-dark"
          onClick={() => handleButtonClick('about_hantec')}
        >
          <img 
            src="/info.svg" 
            alt="Info" 
            className="btn-icon-svg" 
          />
          About Hantec
        </button>
        
        {/* What is MT5 Button */}
        <button 
          className="action-btn-dark"
          onClick={() => handleButtonClick('what_is_mt5')}
        >
          <img 
            src="/Laptop.svg" 
            alt="Laptop" 
            className="btn-icon-svg" 
          />
          What is MT5?
        </button>
      </div>

      {/* Search Bar */}
      <form className="search-form-dark" onSubmit={handleSubmit}>
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input-dark"
            placeholder="Ask about Hantec & more"
          />
          <button type="submit" className="submit-btn-dark" aria-label="Submit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 5V19M12 5L19 12M12 5L5 12" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default WelcomeScreen;