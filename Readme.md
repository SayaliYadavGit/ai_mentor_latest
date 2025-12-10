# 🤖 Hantec Markets AI Chatbot

**Full-stack AI-powered chatbot for CFD trading guidance and support**

Built with React, Node.js, LangChain, and OpenAI GPT-4o-mini

---

## 📋 **Table of Contents**

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Project Structure](#project-structure)
6. [Environment Setup](#environment-setup)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Customization](#customization)
10. [Troubleshooting](#troubleshooting)

---

## ✨ **Features**

### **Core Capabilities:**
- ✅ **RAG-powered responses** using ChromaDB vector store
- ✅ **Onboarding guidance** through 9-step user journey
- ✅ **Trading education** for beginners and experienced traders
- ✅ **Platform support** (MT4, MT5, Hantec Social, PAMM)
- ✅ **Compliance-aware** responses with mandatory disclaimers
- ✅ **Confidence scoring** with automatic escalation
- ✅ **Context-aware conversations** with multi-turn support
- ✅ **FAQ sidebar** with clickable sample queries

### **User Experience:**
- 🎯 **3 Entry Points:** Start Live Trading, Learn CFDs, Take a Tour
- 💬 **Modern chat interface** with message bubbles
- ⚡ **Fast responses** (<8 seconds)
- 📱 **Responsive design** (works on mobile, tablet, desktop)
- 🎨 **Professional UI** with Hantec branding

### **Target Users:**
- New users (onboarding assistance)
- Experienced traders (advanced concepts)
- IBs/Affiliates/Partners
- Copy trading strategists (Hantec Social)
- Money managers (PAMM)
- Passive investors

---

## 🛠 **Tech Stack**

### **Frontend:**
- **React 18** - UI framework
- **Vite** - Build tool (fast HMR)
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client

### **Backend:**
- **Node.js** - Runtime
- **Express** - Web framework
- **LangChain** - AI orchestration
- **OpenAI GPT-4o-mini** - Language model
- **ChromaDB** - Vector database
- **OpenAI Embeddings** - text-embedding-3-small

---

## 📋 **Prerequisites**

Before you begin, ensure you have:

- ✅ **Node.js** 18+ installed ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- ✅ **Git** (optional, for version control)

Check your versions:
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

---

## ⚡ **Quick Start**

### **1. Clone/Download Project**
```bash
# If you have the files
cd hantec-ai-chatbot

# Or extract from zip
unzip hantec-ai-chatbot.zip
cd hantec-ai-chatbot
```

### **2. Install Dependencies**

**Install client dependencies:**
```bash
cd client
npm install
```

**Install server dependencies:**
```bash
cd ../server
npm install
```

### **3. Configure Environment Variables**

**Client (.env):**
```bash
cd client
cp .env.example .env
# Edit .env and add:
VITE_API_URL=http://localhost:3001
```

**Server (.env):**
```bash
cd ../server
cp .env.example .env
# Edit .env and add your OpenAI API key:
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3001
```

### **4. Add Your Data Files**

Copy your cleaned RAG files to `server/data/`:
```bash
cd server/data
# Add your knowledge base files here:
# - general.txt
# - platforms.txt
# - products.txt
# - accounts.txt
# - education.txt
# - etc.
```

### **5. Start Both Servers**

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

### **6. Open Browser**
```
http://localhost:5173
```

🎉 **You should see the Hantec AI Chatbot welcome screen!**

---

## 📁 **Project Structure**

```
hantec-ai-chatbot/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx      # Main chat UI
│   │   │   ├── WelcomeScreen.jsx      # 3-card entry screen
│   │   │   ├── MessageBubble.jsx      # Message display
│   │   │   ├── InputForm.jsx          # User input
│   │   │   ├── LoadingState.jsx       # Loading animation
│   │   │   └── Sidebar.jsx            # FAQ queries
│   │   ├── api/
│   │   │   └── client.js              # API calls
│   │   ├── config.js                  # ✏️ CUSTOMIZABLE
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── server/                          # Node.js Backend
│   ├── routes/
│   │   └── chat.js                    # Chat endpoints
│   ├── langchain/
│   │   ├── chains.js                  # ✏️ LangChain logic (CUSTOMIZABLE)
│   │   ├── vectorStore.js             # RAG setup
│   │   └── config.js                  # ✏️ Domain config (CUSTOMIZABLE)
│   ├── data/                          # Your knowledge base
│   │   ├── general.txt
│   │   ├── platforms.txt
│   │   └── ... (your cleaned files)
│   ├── index.js                       # Express server
│   ├── package.json
│   └── .env
│
├── README.md                        # This file
├── CUSTOMIZATION_GUIDE.md           # Detailed customization instructions
└── .gitignore
```

---

## 🔧 **Environment Setup**

### **Client Environment Variables (.env)**

```bash
# API Configuration
VITE_API_URL=http://localhost:3001

# Optional: Enable debug logging
VITE_DEBUG=false
```

### **Server Environment Variables (.env)**

```bash
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-actual-api-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# AI Model Settings (OPTIONAL - defaults provided)
MODEL_NAME=gpt-4o-mini
TEMPERATURE=0.1
MAX_TOKENS=500

# RAG Settings (OPTIONAL - defaults provided)
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.7
```

---

## 🚀 **Running the Application**

### **Development Mode (Recommended)**

**Option 1: Two Terminals**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

**Option 2: Single Command (if using concurrently)**
```bash
# From root directory
npm run dev  # Runs both client and server
```

### **Production Build**

```bash
# Build frontend
cd client
npm run build
# Output: client/dist/

# Start backend (production)
cd ../server
npm start
```

### **Verify It's Working**

1. ✅ Backend logs should show: `✅ Server running on port 3001`
2. ✅ Backend logs should show: `✅ Vector store initialized with X documents`
3. ✅ Frontend should open at: `http://localhost:5173`
4. ✅ You should see the 3-card welcome screen

---

## 🧪 **Testing**

### **Quick Functionality Test**

1. **Click "Start Live Trading" card**
2. **Try these sample queries:**

**Test 1: Simple Question**
```
User: "How do I open an account?"
Expected: Step-by-step guide with links
Response time: <8 seconds
```

**Test 2: RAG Retrieval**
```
User: "What platforms does Hantec offer?"
Expected: List of platforms (MT4, MT5, Social, etc.)
Should include: Links to platform pages
```

**Test 3: Compliance Check**
```
User: "Can I make guaranteed profits trading CFDs?"
Expected: Disclaimer about risks, NO guarantees mentioned
Should include: "⚠️ Trading involves risk" warning
```

**Test 4: Fallback Handling**
```
User: "What's the weather today?"
Expected: "I don't have this knowledge yet. Please contact support."
Should include: Related questions (if available)
```

**Test 5: FAQ Sidebar**
```
Action: Click "How do I deposit money?" in left sidebar
Expected: Query appears in chat, AI responds with deposit methods
```

### **Success Criteria**

✅ All queries return responses in <8 seconds
✅ Responses include proper formatting (bullets, bold, headers)
✅ Risk disclaimers appear on trading-related queries
✅ "I don't know" fallback works for out-of-scope questions
✅ FAQ sidebar queries load correctly
✅ No console errors in browser or terminal

---

## 🎨 **Customization**

### **Quick Customization Points**

All customizable sections are marked with `// ✏️ CUSTOMIZE THIS`

**1. Change App Title/Branding**
```javascript
File: client/src/config.js (Lines 5-10)
// ✏️ CUSTOMIZE THIS
export const APP_CONFIG = {
  title: 'Your Company Name',
  subtitle: 'Your Tagline',
  // ... more settings
}
```

**2. Modify System Prompt**
```javascript
File: server/langchain/config.js (Lines 15-50)
// ✏️ CUSTOMIZE THIS
export const SYSTEM_PROMPT = `
You are a helpful AI assistant...
[Modify personality, tone, rules here]
`;
```

**3. Change FAQ Questions**
```javascript
File: client/src/config.js (Lines 30-45)
// ✏️ CUSTOMIZE THIS
export const SAMPLE_QUERIES = [
  "Your custom question 1?",
  "Your custom question 2?",
  // ... add more
];
```

**4. Adjust RAG Settings**
```javascript
File: server/langchain/config.js (Lines 5-10)
// ✏️ CUSTOMIZE THIS
export const RAG_CONFIG = {
  topK: 5,              // Number of results to retrieve
  similarityThreshold: 0.7,  // Minimum similarity score
};
```

**5. Modify UI Colors**
```javascript
File: client/tailwind.config.js (Lines 10-20)
// ✏️ CUSTOMIZE THIS
colors: {
  primary: '#your-color',
  secondary: '#your-color',
}
```

For detailed customization instructions, see **[CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md)**

---

## 🐛 **Troubleshooting**

### **Common Issues & Fixes**

#### **1. "Port already in use"**

**Error:** `EADDRINUSE: address already in use :::3001`

**Fix:**
```bash
# Option A: Kill process on port 3001
# Mac/Linux:
lsof -ti:3001 | xargs kill -9

# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Option B: Change port in server/.env
PORT=3002
```

---

#### **2. "API Key Error"**

**Error:** `OpenAI API key not found` or `401 Unauthorized`

**Fix:**
```bash
# 1. Check server/.env file exists
ls server/.env

# 2. Verify API key is set correctly
cat server/.env | grep OPENAI_API_KEY

# 3. Ensure no extra spaces
OPENAI_API_KEY=sk-your-key-here  # ✅ Correct
OPENAI_API_KEY = sk-your-key-here  # ❌ Wrong (spaces)

# 4. Restart server after editing .env
cd server
npm run dev
```

---

#### **3. "Documents not loading"**

**Error:** `No documents found in vector store` or `0 documents indexed`

**Fix:**
```bash
# 1. Check data files exist
ls server/data/*.txt

# 2. Verify file format (should be .txt)
# 3. Check file permissions
chmod 644 server/data/*.txt

# 4. Check server logs for errors
# Look for: "✅ Loaded X documents from Y files"

# 5. If still not working, check vectorStore.js
# Verify DATA_PATH points to correct folder
```

---

#### **4. "Frontend not connecting to backend"**

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Fix:**
```bash
# 1. Verify backend is running
curl http://localhost:3001/health
# Should return: {"status":"ok"}

# 2. Check client/.env
VITE_API_URL=http://localhost:3001  # Must match backend PORT

# 3. Check CORS settings (server/index.js)
# Should allow localhost:5173

# 4. Restart both servers
```

---

#### **5. "Slow responses (>8 seconds)"**

**Possible causes:**
- Too many documents in vector store
- OpenAI API rate limits
- Large topK value

**Fix:**
```bash
# 1. Reduce topK in server/langchain/config.js
topK: 3  # Instead of 5

# 2. Increase similarity threshold
similarityThreshold: 0.75  # Instead of 0.7

# 3. Check OpenAI API usage/limits
# Visit: https://platform.openai.com/usage

# 4. Consider caching frequent queries (future enhancement)
```

---

#### **6. "Module not found" errors**

**Error:** `Cannot find module 'langchain'` or similar

**Fix:**
```bash
# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

---

#### **7. "ChromaDB connection failed"**

**Error:** `Failed to initialize vector store`

**Fix:**
```bash
# ChromaDB is embedded (no separate server needed)
# But if you see this error:

# 1. Clear ChromaDB data (reset)
rm -rf server/chroma_data

# 2. Restart server (will recreate)
cd server
npm run dev

# 3. If still failing, check Node.js version
node --version  # Should be 18+
```

---

### **Debug Mode**

Enable detailed logging:

**Client:**
```bash
# client/.env
VITE_DEBUG=true
```

**Server:**
```javascript
// server/index.js (Line 10)
const DEBUG = true; // Set to true for verbose logs
```

---

## 📚 **Additional Resources**

### **Documentation:**
- [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md) - Detailed customization instructions
- [LangChain Docs](https://js.langchain.com/docs/) - LangChain reference
- [OpenAI API Docs](https://platform.openai.com/docs/) - OpenAI reference
- [React Docs](https://react.dev/) - React reference
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Styling reference

### **Support:**
- Check `CUSTOMIZATION_GUIDE.md` for specific modification instructions
- Review console logs for error details
- Verify all environment variables are set correctly

---

## 🎯 **Next Steps**

After successful setup:

1. ✅ **Add your knowledge base** - Copy cleaned .txt files to `server/data/`
2. ✅ **Customize branding** - Update colors, titles in config files
3. ✅ **Modify system prompt** - Adjust AI personality and rules
4. ✅ **Test thoroughly** - Run through all test cases
5. ✅ **Add custom FAQ questions** - Update sidebar queries
6. ✅ **Deploy** - When ready, build for production

---

## 📝 **License**

Proprietary - Hantec Markets

---

## 🙋 **Need Help?**

1. Check **[CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md)** for detailed instructions
2. Review **Troubleshooting** section above
3. Check console logs for specific error messages
4. Verify all prerequisites are installed correctly

---

**Built with ❤️ for Hantec Markets**

**Version:** 1.0.0  
**Last Updated:** December 2024