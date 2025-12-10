// ✏️ CUSTOMIZE THIS FILE - Client Configuration
// This file contains all easily customizable settings for the chatbot

// ============================================================================
// APP BRANDING
// ============================================================================
// ✏️ CUSTOMIZE THIS - App Branding
export const APP_CONFIG = {
  title: 'Hantec Markets AI Assistant',
  subtitle: 'Your 24/7 Trading Mentor',
  companyName: 'Hantec Markets',
  supportEmail: 'support@hmarkets.com',
  supportUrl: 'https://hmarkets.com/support',
  version: '1.0.0',
};

// ============================================================================
// API CONFIGURATION
// ============================================================================
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
};

// ============================================================================
// FAQ SIDEBAR QUESTIONS
// ============================================================================
// ✏️ CUSTOMIZE THIS - Sample Questions in Sidebar
export const SAMPLE_QUERIES = [
  // Onboarding
  "How do I open an account?",
  "What documents do I need to sign up?",
  "I uploaded my ID but it was rejected, why?",
  
  // Deposits & Withdrawals
  "How do I deposit money?",
  "What payment methods are accepted?",
  "How long does withdrawal take?",
  
  // Platform
  "How do I download MT4?",
  "What's the difference between MT4 and MT5?",
  
  // Trading
  "What is leverage?",
  "How do I place my first trade?",
];

// ============================================================================
// WELCOME SCREEN CARDS
// ============================================================================
// ✏️ CUSTOMIZE THIS - Welcome Screen Cards (From Figma UI)
export const WELCOME_CARDS = [
  {
    id: 'start-trading',
    type: 'primary',
    title: 'Start Live Trading',
    description: 'Tell me your goal and account preferences — I\'ll set up your account to start trading',
    icon: '🚀',
    greeting: `Hi! I'm your trading mentor. Let's start live trading together.

I can help you:
- Complete your account setup
- Learn about our platforms (MT4, MT5, Hantec Social)
- Make your first deposit
- Place your first trade

What would you like to do first?`,
    bgColor: '#8B0000',
    textColor: '#FFFFFF',
    enabled: true,
  },
  {
    id: 'learn-cfds',
    type: 'secondary',
    title: 'Learn CFDs',
    icon: '💬',
    items: [
      '📚 Master the fundamentals',
      '📊 Try simple examples',
      '📈 Level up your skills'
    ],
    ctaText: 'Learn CFDs',
    greeting: `Welcome to CFD Trading Education! 📚

I'm here to teach you everything about CFD trading:
- What are CFDs and how they work
- Trading strategies and risk management
- Technical analysis and indicators
- Market fundamentals
- Best practices for successful trading

What would you like to learn about first?`,
    bgColor: '#FFFFFF',
    textColor: '#1A1A1A',
    enabled: true,
  },
  {
    id: 'take-tour',
    type: 'secondary',
    title: 'Take a Quick Tour',
    description: 'A quick walkthrough of your dashboard, features and charts',
    icon: '💬',
    ctaText: 'Take a Quick Tour',
    greeting: `Let me show you around! 🗺️

I can give you a tour of:
- Our trading platforms (MT4, MT5, Mobile App)
- Account types and features
- Available trading instruments
- Tools and resources
- Support channels

Where would you like to start?`,
    bgColor: '#FFFFFF',
    textColor: '#1A1A1A',
    enabled: true,
  },
];

// ✏️ CUSTOMIZE THIS - Quick Action Buttons (Below Cards)
export const QUICK_ACTIONS = [
  { id: 'demo', label: 'What is Demo Trading', icon: '📈', color: '#3B82F6' },
  { id: 'analyze', label: 'What are CFDs', icon: '🎯', color: '#EF4444' },
];

// ============================================================================
// UI SETTINGS
// ============================================================================
// ✏️ CUSTOMIZE THIS - UI Behavior
export const UI_CONFIG = {
  // Chat settings
  maxMessagesDisplayed: 100,
  messageAnimationDelay: 100, // milliseconds
  autoScrollToBottom: true,
  
  // Loading states
  typingIndicatorDelay: 500, // milliseconds
  minLoadingDuration: 1000, // minimum time to show loading
  
  // Input
  maxInputLength: 500,
  placeholder: 'Ask me anything about trading...',
  
  // Sidebar
  sidebarDefaultOpen: true,
  sidebarWidth: '280px',
};

// ============================================================================
// THEME COLORS (can also customize in tailwind.config.js)
// ============================================================================
export const THEME = {
  primary: '#8B0000',
  primaryLight: '#B22222',
  primaryDark: '#5C0000',
  secondary: '#667eea',
  secondaryLight: '#764ba2',
  background: '#fafafa',
  backgroundDark: '#1a202c',
  text: '#1a202c',
  textLight: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// ============================================================================
// MESSAGE DISPLAY SETTINGS
// ============================================================================
export const MESSAGE_CONFIG = {
  showTimestamp: true,
  timestampFormat: 'short', // 'short', 'long', or 'relative'
  showAvatar: true,
  
  // AI message styling
  aiMessageBackground: '#f8f9fa',
  aiMessageTextColor: '#1a202c',
  
  // User message styling
  userMessageBackground: '#8B0000',
  userMessageTextColor: '#ffffff',
  
  // Code blocks
  enableCodeHighlight: true,
  codeTheme: 'github',
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================
// ✏️ CUSTOMIZE THIS - Enable/Disable Features
export const FEATURES = {
  showMetricsBadge: true,
  enableVoiceInput: false, // Future feature
  enableFileUpload: false, // Future feature
  enableConversationExport: false, // Future feature
  enableFeedback: true,
  enableRelatedQuestions: true,
  showSourceAttribution: true,
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export const ERROR_MESSAGES = {
  networkError: 'Unable to connect to the server. Please check your connection and try again.',
  timeout: 'The request took too long. Please try again with a shorter question.',
  serverError: 'Something went wrong on our end. Please try again in a moment.',
  invalidInput: 'Please enter a valid question.',
  rateLimitExceeded: 'Too many requests. Please wait a moment before trying again.',
  generic: 'An unexpected error occurred. Please try again.',
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================
export const SUCCESS_MESSAGES = {
  messageSent: 'Message sent!',
  feedbackSubmitted: 'Thank you for your feedback!',
};

// ============================================================================
// ACCESSIBILITY
// ============================================================================
export const A11Y_CONFIG = {
  announceMessages: true,
  highContrastMode: false,
  reducedMotion: false,
  keyboardShortcutsEnabled: true,
};

export default {
  APP_CONFIG,
  API_CONFIG,
  SAMPLE_QUERIES,
  WELCOME_CARDS,
  UI_CONFIG,
  THEME,
  MESSAGE_CONFIG,
  FEATURES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  A11Y_CONFIG,
};