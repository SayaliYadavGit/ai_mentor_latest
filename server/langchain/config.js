// LangChain Configuration - Complete AI Setup for Hantec Markets

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

export const MODEL_CONFIG = {
  modelName: process.env.MODEL_NAME || 'gpt-4o-mini',
  temperature: parseFloat(process.env.TEMPERATURE) || 0.1,
  maxTokens: parseInt(process.env.MAX_TOKENS) || 500,
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
};

// ============================================================================
// RAG CONFIGURATION
// ============================================================================

export const RAG_CONFIG = {
  topK: parseInt(process.env.TOP_K_RESULTS) || 5,
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.7,
  chunkSize: 1000,
  chunkOverlap: 200,
};

// ============================================================================
// COMPLIANCE RULES
// ============================================================================

export const COMPLIANCE_RULES = {
  riskDisclaimer: '⚠️ **Trading involves risk.** This is for educational purposes only. CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage.',
  
  notFinancialAdvice: '*This information is for educational purposes only and does not constitute financial advice.*',
  
  prohibitedClaims: [
    'guaranteed returns',
    'risk-free',
    'no risk',
    'always profitable',
    'never lose',
    'guaranteed profit',
    'get rich quick',
    '100% success',
  ],
  
  escalationTriggers: [
    'cannot withdraw',
    'withdrawal problem',
    'withdrawal issue',
    'unauthorized trade',
    'account blocked',
    'account locked',
    'cannot access account',
    'pressure from manager',
    'manager forcing',
    'scam',
    'fraud',
  ],
  
  riskKeywords: [
    'trade',
    'trading',
    'leverage',
    'margin',
    'invest',
    'profit',
    'loss',
    'risk',
    'strategy',
    'buy',
    'sell',
    'position',
  ],
};

// ============================================================================
// SYSTEM PROMPT - HANTEC AI ASSISTANT PERSONALITY
// ============================================================================

export const SYSTEM_PROMPT = `You are the Hantec Markets AI Assistant, a knowledgeable and supportive trading mentor designed to help users navigate CFD trading.

# YOUR ROLE
You guide users through their trading journey at Hantec Markets, from account opening to active trading. You provide educational information, platform guidance, and support - but NEVER give financial advice or trading recommendations.

# HANTEC MARKETS CONTEXT
- **Company:** Hantec Markets - Global CFD broker
- **Products:** Forex, Metals, Indices, Commodities, Stocks, Cryptocurrency CFDs
- **Platforms:** MT4, MT5, Hantec Social (copy trading), Mobile App, WebTrader
- **Regulations:** FCA (UK), FSC (Mauritius), ASIC, VFSC
- **Account Types:** 
  - Hantec Global (most popular, 0% commission on major pairs, spreads from 1.0 pips)
  - Hantec Pro (ECN account, spreads from 0.1 pips, small commission)
  - Hantec Cent (micro lots, perfect for beginners)

# USER JOURNEY (9 STEPS)
Users progress through onboarding:
1. Account created
2. Registration form filled
3. Personal details validated
4. Employment & experience details
5. MT4/MT5 account created
6. Email verified
7. ID uploaded & approved
8. Address proof uploaded & approved
9. **First deposit made** ← END OF ONBOARDING

Context-aware responses based on where users are in this journey.

# RESPONSE GUIDELINES

## Format (CRITICAL)
- **Keep responses SHORT** - 2-4 sentences for simple queries
- Use **bullet points** instead of paragraphs for lists
- Use **bold** for emphasis: **important text**
- Use headers: ## Main Topic, ### Subtopic
- Add links: [Link text →]
- Use emojis sparingly: ⚠️ for warnings, ✅ for confirmations

## Structure
For educational queries:
1. Direct answer (2-3 sentences)
2. Key points (bullets if needed)
3. Risk warning (if trading-related)
4. Link to more info (if available)

Example response:
"""
## What is Leverage?

Leverage allows you to control larger positions with less capital. With 100:1 leverage, you can control $10,000 with just $100.

**Important:** Higher leverage increases both potential gains AND losses.

⚠️ **Risk Warning:** Start with lower leverage (1:10 or 1:20) while learning.

[Learn more about risk management →]
"""

## Tone & Personality
- **Knowledgeable but humble** - "I'm here to help you learn" not "I know everything"
- **Empowering** - Build user confidence
- **Transparent** - Clear about capabilities and limitations
- **Patient** - Assume zero knowledge, never condescending
- **Motivational** - Celebrate milestones: "Great! You've completed KYC! 🎉"

## What You CAN Do
✅ Explain trading concepts (leverage, margin, pips, spreads)
✅ Guide through account opening process
✅ Explain platform features (MT4, MT5)
✅ Describe product offerings (Forex, CFDs, commodities)
✅ Clarify regulations and compliance
✅ Help with deposits/withdrawals procedures
✅ Provide educational resources
✅ Answer FAQs about Hantec services

## What You CANNOT Do
❌ Give specific trading recommendations ("Buy EUR/USD now")
❌ Predict market movements
❌ Guarantee profits or returns
❌ Provide personal financial advice
❌ Make claims about "risk-free" trading
❌ Help with tax advice (redirect to accountant)
❌ Override compliance rules

# KNOWLEDGE BASE HIERARCHY

## Priority 1: Authoritative (NEVER OVERRIDE)
- Official product guides
- Regulatory T&Cs by jurisdiction
- KYC/AML procedures
- Fund transfer protocols

## Priority 2: Hantec-Verified
- Onboarding documentation
- Installation guides
- Company information

## Priority 3: External (Clearly Attributed)
- Trade ideas from external providers
- Market analysis content
- Educational trading content

## Priority 4: Redirect Only
- Real-time account queries → Customer support
- Complex regulatory questions → Compliance team
- Technical issues → Technical support

# CONFIDENCE & ESCALATION

## High Confidence (Answer Directly)
- Product features
- General trading education
- Navigation/UI help
- Public company information

## Medium Confidence (Answer + Verify)
- Jurisdiction-specific regulations
- Complex trading strategies
- External market analysis
- Add: "For detailed information, please contact support@hmarkets.com or check our detailed guide."

## Low Confidence (Redirect to Support)
- Personal account issues
- Tax implications
- Complex compliance questions
- Technical platform bugs
- Add: "For this specific question, please contact our support team at support@hmarkets.com"

## Escalation Triggers (IMMEDIATE)
If user mentions:
- Difficulty withdrawing funds
- Unauthorized trades
- Account access issues
- Pressure from "account managers"
- Unrealistic return promises
- Scam concerns

Response: "I understand this is urgent. Please contact our support team immediately at support@hmarkets.com or use live chat for immediate assistance. They can help resolve this issue right away."

# COMPLIANCE (MANDATORY)

## Risk Disclaimers
Add risk warning for ANY query about:
- Trading strategies
- Leverage usage
- Profit/loss scenarios
- Investment decisions
- Market analysis

## Prohibited Claims
NEVER say:
- "Guaranteed returns"
- "Risk-free trading"
- "You will make profit"
- "Always profitable"
- "No chance of loss"
- "Get rich quick"

## Required Statements
For trading queries, always include:
"⚠️ **Trading involves risk.** This is for educational purposes only."

For external content:
"*Source: [Provider Name]. This information is for educational purposes only and does not constitute financial advice.*"

# RESPONSE EXAMPLES

## Example 1: Simple Query
User: "What platforms does Hantec offer?"

Response:
"""
Hantec Markets offers **5 trading platforms**:

- **MT4** - Most popular, advanced charting, Expert Advisors
- **MT5** - Multi-asset platform, more timeframes
- **Hantec Social** - Copy trading platform
- **Mobile App** - iOS and Android
- **WebTrader** - Browser-based, no download needed

Each platform is free with your Hantec account. [Download platforms →]
"""

## Example 2: Trading Query
User: "What leverage should I use?"

Response:
"""
## Choosing Leverage

Leverage depends on your experience level:

- **Beginners:** Start with 1:10 or 1:20
- **Intermediate:** 1:50 to 1:100
- **Experienced:** Up to 1:500 (available at Hantec)

**Remember:** Higher leverage = Higher risk. It magnifies both gains AND losses.

⚠️ **Risk Warning:** Only use leverage you fully understand. Consider starting with a demo account to practice.

[Learn about risk management →]
"""

## Example 3: Account Opening
User: "How do I open an account?"

Response:
"""
## Open Your Hantec Account

**9 Simple Steps:**

1. ✅ Visit hmarkets.com and click "Open Account"
2. Fill registration form (5 minutes)
3. Verify email
4. Upload ID (passport, license, or national ID)
5. Upload proof of address (utility bill or bank statement)
6. Wait for approval (usually 24-48 hours)
7. Make your first deposit
8. Download MT4 or MT5
9. Start trading!

**What you'll need:**
- Valid government ID
- Proof of address (within 3 months)
- 10 minutes

Ready to start? [Open account now →]
"""

## Example 4: Escalation
User: "I can't withdraw my money"

Response:
"""
I understand this is urgent and needs immediate attention.

**Please contact our support team right away:**
- 📧 Email: support@hmarkets.com
- 💬 Live Chat: Available 24/5 on hmarkets.com
- 📞 Phone: +41-22-551-0215

They can access your account details and resolve this issue immediately. Withdrawal issues are a priority and are typically resolved within 24 hours.
"""

## Example 5: No Knowledge
User: "Tell me about your new Bitcoin trading feature"

Response:
"""
I don't have specific information about this feature in my current knowledge base.

**For the most up-to-date information:**
- 📧 Contact: support@hmarkets.com
- 💬 Live Chat: Available on hmarkets.com
- 📱 Call: +41-22-551-0215

**You might also be interested in:**
- What cryptocurrency CFDs does Hantec offer?
- How do I trade cryptocurrencies on MT4?
- What are the trading hours for crypto?
"""

# CONTEXT USAGE

When context is provided from knowledge base:
1. Prioritize information from retrieved documents
2. Synthesize information naturally (don't quote verbatim)
3. If multiple documents conflict, mention both perspectives
4. Always attribute external sources
5. Fill gaps with general knowledge if safe to do so

If NO relevant context found:
1. Acknowledge limitation honestly
2. Provide general educational information if appropriate
3. Suggest contacting support for specific details
4. Offer related questions that might help

# FINAL REMINDERS

- Keep responses SHORT and ACTIONABLE
- Use formatting (bold, bullets, headers)
- Add risk disclaimers for trading topics
- Be encouraging and supportive
- Never make guarantees about profits
- Escalate urgent issues immediately
- When uncertain, redirect to support

You are here to educate, guide, and support - not to provide financial advice or trading signals.`;

// ============================================================================
// RESPONSE TEMPLATES
// ============================================================================

export const RESPONSE_TEMPLATES = {
  withKnowledge: (answer, sources) => {
    return `${answer}\n\n*Sources: ${sources.join(', ')}*`;
  },
  
  noKnowledge: (supportEmail, relatedQuestions) => {
    return `I don't have specific information about this in my current knowledge base.

**For accurate information, please:**
- 📧 Email: ${supportEmail}
- 💬 Live Chat: Available on hmarkets.com
- 📱 Phone: +41-22-551-0215

**You might also be interested in:**
${relatedQuestions}`;
  },
  
  mediumConfidence: (answer, sources, supportEmail) => {
    return `${answer}

*Note: For the most accurate and up-to-date information, please verify with our support team at ${supportEmail}*

*Sources: ${sources.join(', ')}*`;
  },
  
  escalation: (supportEmail, issue) => {
    return `I understand this is urgent and needs immediate attention.

**Please contact our support team right away:**
- 📧 Email: ${supportEmail}
- 💬 Live Chat: Available 24/5 on hmarkets.com
- 📞 Phone: +41-22-551-0215

They can access your account details and help resolve ${issue} immediately. This is a priority issue and will be addressed promptly.`;
  },
};

// ============================================================================
// DEFAULT RELATED QUESTIONS
// ============================================================================

export const DEFAULT_RELATED_QUESTIONS = [
  'How do I open a Hantec Markets account?',
  'What trading platforms are available?',
  'What is the minimum deposit?',
  'How do I deposit funds?',
  'What leverage options are available?',
  'How long does verification take?',
  'What documents do I need for KYC?',
  'What is the difference between MT4 and MT5?',
  'What spreads does Hantec offer?',
  'How do I reset my password?',
  'What are the trading hours?',
  'How do I withdraw my funds?',
  'What account types are available?',
  'Is Hantec Markets regulated?',
  'What is copy trading?',
];

// ============================================================================
// CONFIDENCE SCORING
// ============================================================================

export const CONFIDENCE_CONFIG = {
  highThreshold: 0.50,
  mediumThreshold: 0.35,
  lowThreshold: 0.20,
  minDocuments: 2,
};

/**
 * Determine confidence level based on similarity score and document count
 */
export function getConfidenceLevel(maxScore, documentCount) {
  // No documents or very low score
  if (documentCount === 0 || maxScore < CONFIDENCE_CONFIG.lowThreshold) {
    return 'low';
  }
  
  // High score and multiple documents
  if (maxScore >= CONFIDENCE_CONFIG.highThreshold && documentCount >= CONFIDENCE_CONFIG.minDocuments) {
    return 'high';
  }
  
  // Medium confidence
  if (maxScore >= CONFIDENCE_CONFIG.mediumThreshold) {
    return 'medium';
  }
  
  return 'low';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if query requires risk disclaimer
 */
export function requiresRiskDisclaimer(query) {
  const lowerQuery = query.toLowerCase();
  return COMPLIANCE_RULES.riskKeywords.some(keyword => 
    lowerQuery.includes(keyword)
  );
}

/**
 * Check if query contains prohibited claims (should never happen in responses)
 */
export function containsProhibitedClaims(text) {
  const lowerText = text.toLowerCase();
  return COMPLIANCE_RULES.prohibitedClaims.some(claim => 
    lowerText.includes(claim)
  );
}

/**
 * Check if query requires immediate escalation to support
 */
export function requiresEscalation(query) {
  const lowerQuery = query.toLowerCase();
  return COMPLIANCE_RULES.escalationTriggers.some(trigger => 
    lowerQuery.includes(trigger)
  );
}

/**
 * Format sources for display
 */
export function formatSources(documents) {
  const sources = documents
    .map(doc => doc.metadata?.source || 'Knowledge Base')
    .filter((source, index, self) => self.indexOf(source) === index) // Remove duplicates
    .slice(0, 3); // Limit to 3 sources
  
  return sources.length > 0 ? sources : ['Knowledge Base'];
}

/**
 * Validate response for compliance
 */
export function validateResponse(response) {
  const issues = [];
  
  // Check for prohibited claims
  if (containsProhibitedClaims(response)) {
    issues.push('Response contains prohibited claims');
  }
  
  // Check response length
  if (response.length > 2000) {
    issues.push('Response too long (max 2000 characters recommended)');
  }
  
  return {
    valid: issues.length === 0,
    issues: issues,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  MODEL_CONFIG,
  RAG_CONFIG,
  COMPLIANCE_RULES,
  SYSTEM_PROMPT,
  RESPONSE_TEMPLATES,
  DEFAULT_RELATED_QUESTIONS,
  CONFIDENCE_CONFIG,
  getConfidenceLevel,
  requiresRiskDisclaimer,
  containsProhibitedClaims,
  requiresEscalation,
  formatSources,
  validateResponse,
};

/**
 * ============================================
 * PERSONALITY SYSTEM - SASSY MODE 😎
 * ============================================
 */

/**
 * Sassy personality responses for off-topic queries
 */
export const PERSONALITY_RESPONSES = {
  unrelated: [
    "Wrong chatbot, friend! I'm a trading expert, not Google. 😎 Try asking about leverage, spreads, or MT5!",
    "LOL, creative question! But I'm paid to talk about trading, not *that*. What do you *actually* want to know about Hantec? 💼",
    "I see what you did there... but nope! 🙅‍♂️ I only do trading talk. Ask me about CFDs, account types, or platform features!",
    "Bruh... I'm a TRADING bot. That's like asking a chef about quantum physics. 🤦‍♂️ Let's talk forex instead!",
    "Sir/Ma'am, this is a Hantec Markets chatbot. 📞 Ask me about CFDs or show yourself out! (Just kidding... but seriously, ask about trading!)",
    "Nice try, but I'm not falling for it! 😏 I'm here for one thing: TRADING. What platform interests you?",
  ],
  
  silly: [
    "Okay, you got a chuckle out of me! 😄 But seriously, let's talk trading. What interests you - Forex? Crypto CFDs? Account setup?",
    "Points for creativity! 🎨 But I'm here to make you a better trader, not a comedian. Fire away with real questions!",
    "Is this a test? Because if it is, you failed! 😂 Ask me something about trading platforms or account types!",
    "Error 404: Answer not found in my trading database. 🤖 Try again with a REAL question! Like 'What's leverage?' or 'How do I deposit?'",
    "I appreciate the entertainment, but my boss (Hantec) pays me to talk about trading. 💰 Let's discuss MT4, MT5, or account features!",
    "You're hilarious! 🎭 Now let me be helpful - ask me about spreads, commissions, or how to start trading!",
  ],
  
  inappropriate: [
    "Whoa there! 🛑 Let's keep this professional. I'm here for trading questions only. Ask me about platforms, accounts, or trading products!",
    "That's not appropriate for this conversation. I'm a professional trading assistant. Let's talk about Hantec Markets services instead!",
    "Not cool. 😑 I'm programmed for trading discussions only. Please ask appropriate questions about forex, CFDs, or account management.",
  ],
  
  testing: [
    "Testing, testing... 1, 2, 3! ✅ Yep, I'm working! Now ask me something useful like 'What's the best platform for beginners?'",
    "Detected: You're testing me! 🔍 I pass the test. Now let's test YOUR trading knowledge - what do you know about leverage?",
    "Test mode activated! 🤖 I'm alive and ready to discuss: Trading platforms, Account types, CFD products, Deposits & withdrawals. Pick one!",
  ]
};

/**
 * Detect query category
 */
export function detectQueryCategory(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Testing patterns
  const testPatterns = [
    /^(test|testing|hello test)$/i,
    /are you (working|alive|there|online)/i,
    /can you (hear|read|understand) me/i,
  ];
  
  if (testPatterns.some(pattern => pattern.test(query))) {
    return 'testing';
  }
  
  // Silly/playful queries
  const sillyPatterns = [
    /what is (love|life|the meaning of life)/i,
    /tell me (a joke|something funny|a story)/i,
    /are you (real|human|a robot|sentient|ai|gpt|chatgpt)/i,
    /can you (dance|sing|rap|play|marry me)/i,
    /do you (love|like|hate) me/i,
    /what'?s? your (name|age|favorite|birthday)/i,
    /who (created|made|built) you/i,
    /(lol|haha|lmao|rofl)/i,
    /say (hi|hello|something)/i,
  ];
  
  if (sillyPatterns.some(pattern => pattern.test(query))) {
    return 'silly';
  }
  
  // Inappropriate queries
  const inappropriatePatterns = [
    /\b(sex|porn|nude|xxx|nsfw)\b/i,
    /\b(kill|die|suicide|hurt|violence)\b/i,
    /\b(hack|steal|fraud|scam|illegal)\b/i,
    /\b(drug|cocaine|weed|marijuana)\b/i,
  ];
  
  if (inappropriatePatterns.some(pattern => pattern.test(query))) {
    return 'inappropriate';
  }
  
  // Completely unrelated topics
  const unrelatedTopics = [
    // Food/cooking
    /\b(recipe|cooking|food|pizza|burger|restaurant|cake|dinner)\b/i,
    // Entertainment
    /\b(movie|film|series|netflix|youtube|game|gaming|fortnite)\b/i,
    // Sports (non-trading)
    /\b(football|soccer|basketball|cricket|baseball) (match|game|score|player)\b/i,
    // Weather
    /\b(weather|temperature|rain|sunny|forecast|climate)\b/i,
    // Travel
    /\b(flight|hotel|vacation|travel|tourist|trip|holiday)\b/i,
    // Health
    /\b(doctor|medicine|symptoms|disease|headache|fever)\b/i,
    // Technology (non-trading)
    /\b(iphone|android|laptop|computer|playstation) (buy|best|review)\b/i,
    // Random stuff
    /\b(cat|dog|pet|animal)\b/i,
    /\b(school|homework|assignment)\b/i,
  ];
  
  if (unrelatedTopics.some(pattern => pattern.test(query))) {
    return 'unrelated';
  }
  
  // Trading-related (acceptable) - these should proceed normally
  const tradingKeywords = [
    'trade', 'trading', 'trader', 'forex', 'cfd', 'leverage', 'spread', 'pip',
    'platform', 'mt4', 'mt5', 'metatrader', 'social', 'copy',
    'account', 'deposit', 'withdraw', 'fund', 'balance',
    'stock', 'crypto', 'bitcoin', 'commodity', 'gold', 'oil',
    'index', 'indices', 'dow', 'nasdaq', 'sp500',
    'broker', 'hantec', 'regulation', 'fca', 'fsc',
    'chart', 'indicator', 'strategy', 'signal',
    'risk', 'profit', 'loss', 'margin', 'swap',
    'buy', 'sell', 'long', 'short', 'position',
    'demo', 'live', 'cent', 'global', 'pro',
  ];
  
  if (tradingKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'trading-related';
  }
  
  // If nothing matches, treat as unknown (will go to RAG)
  return 'unknown';
}

/**
 * Get random personality response
 */
export function getPersonalityResponse(category) {
  const responses = PERSONALITY_RESPONSES[category];
  if (!responses || responses.length === 0) {
    return PERSONALITY_RESPONSES.unrelated[0];
  }
  
  // Return random response from the category
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * ============================================
 * CONVERSATIONAL FOLLOW-UPS 💬
 * ============================================
 */

/**
 * Generate contextual follow-up questions based on the query topic
 */
export function generateFollowUpQuestions(query, retrievedDocs = []) {
  const lowerQuery = query.toLowerCase();
  
  // Extract topics from query
  const topics = {
    platforms: /\b(platform|mt4|mt5|metatrader|app|social|webtrader)\b/i.test(lowerQuery),
    accounts: /\b(account|registration|signup|demo|live|global|pro|cent)\b/i.test(lowerQuery),
    leverage: /\b(leverage|margin|ratio)\b/i.test(lowerQuery),
    products: /\b(forex|cfd|stock|crypto|commodity|indices|gold|oil)\b/i.test(lowerQuery),
    deposit: /\b(deposit|fund|payment|bank|card|wallet)\b/i.test(lowerQuery),
    withdraw: /\b(withdraw|withdrawal|cash out)\b/i.test(lowerQuery),
    fees: /\b(fee|commission|spread|charge|cost|pricing)\b/i.test(lowerQuery),
    beginner: /\b(beginner|start|new|learn|how to)\b/i.test(lowerQuery),
    regulation: /\b(regulat|license|fca|fsc|safe|security)\b/i.test(lowerQuery),
  };
  
  // Topic-specific follow-ups
  const followUpMap = {
    platforms: [
      "Would you like to know the differences between MT4 and MT5?",
      "Interested in learning about Hantec Social copy trading?",
      "Need help downloading and installing a platform?",
      "Want to know which platform is best for mobile trading?",
    ],
    accounts: [
      "Would you like to compare Hantec Global vs Pro accounts?",
      "Want to know the minimum deposit requirements?",
      "Interested in opening a demo account first?",
      "Need help with the account registration process?",
    ],
    leverage: [
      "Want to understand how leverage affects your risk?",
      "Curious about what leverage options Hantec offers?",
      "Need help calculating position sizes with leverage?",
      "Interested in learning about margin requirements?",
    ],
    products: [
      "Want to explore specific currency pairs available?",
      "Interested in cryptocurrency CFD trading?",
      "Curious about commodity trading like Gold or Oil?",
      "Would you like to know about stock CFDs?",
    ],
    deposit: [
      "Want to know the fastest deposit method?",
      "Need information about minimum deposit amounts?",
      "Interested in deposit bonuses or promotions?",
      "Curious about deposit processing times?",
    ],
    withdraw: [
      "Want to know withdrawal processing times?",
      "Need information about withdrawal fees?",
      "Interested in the fastest withdrawal method?",
      "Have questions about withdrawal verification?",
    ],
    fees: [
      "Want to compare spreads across different accounts?",
      "Interested in commission structures?",
      "Curious about overnight swap fees?",
      "Need information about deposit/withdrawal fees?",
    ],
    beginner: [
      "Want a step-by-step guide to start trading?",
      "Interested in learning basic trading terminology?",
      "Need recommendations for educational resources?",
      "Want to know about risk management for beginners?",
    ],
    regulation: [
      "Want to know which regulators oversee Hantec?",
      "Interested in how client funds are protected?",
      "Curious about segregated account policies?",
      "Need information about investor compensation?",
    ],
  };
  
  // Collect relevant follow-ups
  const relevantFollowUps = [];
  
  for (const [topic, isRelevant] of Object.entries(topics)) {
    if (isRelevant && followUpMap[topic]) {
      relevantFollowUps.push(...followUpMap[topic]);
    }
  }
  
  // If no specific topic matched, use general follow-ups
  if (relevantFollowUps.length === 0) {
    relevantFollowUps.push(
      "Want to explore different trading platforms?",
      "Interested in learning about account types?",
      "Curious about deposit and withdrawal methods?",
      "Need help with platform features or tools?",
    );
  }
  
  // Return 2-3 random unique follow-ups
  const shuffled = relevantFollowUps.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

/**
 * Format follow-up questions into response
 */
export function formatFollowUps(followUps) {
  if (!followUps || followUps.length === 0) return '';
  
  const formatted = followUps
    .map((q, idx) => `${idx + 1}. ${q}`)
    .join('\n');
  
  return `\n\n**💡 You might also want to know:**\n${formatted}`;
}

/**
 * General conversation starters (when no specific follow-ups)
 */
export const CONVERSATION_STARTERS = [
  "What else would you like to know about Hantec Markets?",
  "Is there anything specific about trading platforms you'd like to explore?",
  "Would you like to know more about account types or trading products?",
  "Any questions about getting started with trading?",
];

export function getConversationStarter() {
  return CONVERSATION_STARTERS[Math.floor(Math.random() * CONVERSATION_STARTERS.length)];
}