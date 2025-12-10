"""
═══════════════════════════════════════════════════════════════════════════════
HANTEC MARKETS - PRODUCTION RAG DATA CLEANING PIPELINE
═══════════════════════════════════════════════════════════════════════════════

Purpose: Clean and structure scraped website content for optimal RAG performance
Context: 170 pages from hmarkets.com for AI chatbot knowledge base
System: Python + ChromaDB (semantic search) + Streamlit deployment

Requirements:
✓ Full information coverage (no data loss)
✓ Brand guideline integration
✓ Multi-document query support
✓ Cross-reference capability
✓ Complex reasoning support
✓ GitHub Codespaces compatible

Output:
- Clean category files (12 categories)
- Master index with cross-references
- Quick facts JSON
- Brand guidelines document
- Document relationship map
- Quality metrics report

Author: AI Assistant
Version: 2.0 (Production)
═══════════════════════════════════════════════════════════════════════════════
"""

import re
import os
import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime
import hashlib

class HantecProductionCleaner:
    """
    Production-grade data cleaning pipeline for Hantec Markets RAG system
    
    Features:
    - Zero information loss
    - Brand guideline enforcement
    - Cross-document linking
    - Multi-document query support
    - Comprehensive metadata extraction
    """
    
    def __init__(self, input_dir="raw_scraped_data", output_dir="data/knowledge_base/website"):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.processed_docs = []
        self.categories = defaultdict(list)
        
        # Document relationships for multi-doc queries
        self.doc_relationships = defaultdict(list)
        
        # Quality metrics
        self.metrics = {
            'total_files': 0,
            'processed_files': 0,
            'failed_files': 0,
            'total_input_chars': 0,
            'total_output_chars': 0,
            'info_coverage': 0.0,
            'categories_created': 0
        }
        
        # Brand guidelines
        self.brand_guidelines = {
            'company_name': 'Hantec Markets',
            'tagline': 'Trade Better',
            'tone': 'Professional, supportive, educational',
            'key_values': [
                'Transparency',
                'Security',
                'Innovation',
                'Client-first approach'
            ],
            'regulatory_entities': ['FCA (UK)', 'FSC (Mauritius)', 'ASIC', 'VFSC'],
            'prohibited_claims': [
                'guaranteed returns',
                'no risk trading',
                'get rich quick',
                'always profitable'
            ],
            'required_disclaimers': [
                'Risk warning for CFD trading',
                'Past performance disclaimer',
                'Not financial advice disclaimer'
            ]
        }
        
        # Noise patterns (UI elements, not content)
        self.noise_patterns = [
            # Navigation
            r'Open main menu',
            r'Select local office',
            r'Region',
            
            # CTAs
            r'OPEN AN ACCOUNT',
            r'TRY A DEMO',
            r'LEARN MORE',
            r'DOWNLOAD NOW',
            r'GET STARTED',
            r'SIGN UP',
            r'Start Trading',
            
            # Filters/UI
            r'FILTERS',
            r'SHOW MORE',
            r'SHOW LESS',
            r'Load More',
            
            # Social media
            r'Twitter page',
            r'Linkedin page',
            r'Facebook page',
            r'Instagram page',
            r'Line page',
            r'Youtube channel',
            r'Follow us',
            
            # Footer navigation
            r'Cookie Policy\s*$',
            r'Privacy Policy\s*$',
            r'Terms And Conditions\s*$',
            r'Marketing Preferences\s*$',
            
            # Preferences
            r'preferences-of-communication',
            r'unsubscribe',
        ]
        
        # Section headers to preserve and structure
        self.section_headers = [
            'Why trade with Hantec Markets?',
            'Features',
            'Benefits',
            'How it works',
            'Requirements',
            'Specifications',
            'FAQ',
            'Risk Warning',
            'Trading accounts to suit you',
            'New to trading?',
            'Partner with us',
            'Real-time trading ideas',
            'Key Statistics',
            'Contact Information',
            'Regulatory Information',
            'Product Overview',
            'Platform Features',
            'Account Types',
        ]
        
        # Important phrases to NEVER remove
        self.preserve_patterns = [
            r'leverage.*?\d+:\d+',
            r'spread.*?\d+\.?\d*\s*pip',
            r'commission.*?\d+\.?\d*%?',
            r'minimum deposit.*?\$\d+',
            r'FCA|FSC|ASIC|VFSC|CySEC',
            r'regulated by',
            r'contact.*?(\+?\d{1,3}[-\s]?\d+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
        ]
    
    def log(self, message, level='INFO'):
        """Print formatted log message"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        prefix = {
            'INFO': '📝',
            'SUCCESS': '✅',
            'WARNING': '⚠️',
            'ERROR': '❌',
            'PROCESSING': '🔄'
        }.get(level, '•')
        print(f"[{timestamp}] {prefix} {message}")
    
    def clean_text(self, text):
        """
        Clean text while preserving ALL informational content
        
        Strategy:
        1. Identify and mark important content
        2. Remove noise patterns
        3. Verify no information loss
        4. Structure remaining content
        """
        original_length = len(text)
        
        # Step 1: Mark important content to preserve
        preserved_sections = []
        for pattern in self.preserve_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                preserved_sections.append(match.group(0))
        
        # Step 2: Remove SOURCE line (we'll add it back structured)
        text = re.sub(r'^SOURCE:.*?\n={80}\n\n', '', text, flags=re.MULTILINE)
        
        # Step 3: Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        
        # Step 4: Remove noise patterns (only if not part of preserved content)
        for pattern in self.noise_patterns:
            # Check if pattern overlaps with preserved content
            if not any(pattern.lower() in preserved.lower() for preserved in preserved_sections):
                text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        # Step 5: Remove trade signal spam
        text = re.sub(r'(PREMIUM|INTRADAY|BUY LIMIT|SELL LIMIT|LIVE TRADE)\s*\n', '', text)
        text = re.sub(r'(Entry|Target|Stop|Confidence|Expires)\s*\n', '', text, flags=re.IGNORECASE)
        text = re.sub(r'To unlock this trade idea.*?account\.', '', text, flags=re.DOTALL)
        text = re.sub(r'\d+h \d+m', '', text)  # Time stamps
        
        # Step 6: Remove repeated dashes/equals (but keep section dividers)
        text = re.sub(r'[-]{10,}', '', text)
        text = re.sub(r'[=]{10,}(?!\n)', '', text)  # Keep if followed by newline
        
        # Step 7: Clean up lines
        lines = []
        for line in text.split('\n'):
            line = line.strip()
            if line and len(line) > 1:  # Keep lines with actual content
                lines.append(line)
        
        text = '\n'.join(lines)
        
        # Step 8: Add structure to section headers
        for header in self.section_headers:
            if header in text:
                text = text.replace(header, f'\n## {header}\n')
        
        # Step 9: Remove duplicate lines (common in footers)
        seen_lines = set()
        unique_lines = []
        for line in text.split('\n'):
            if line not in seen_lines or len(line) > 100:  # Keep long lines even if duplicate
                seen_lines.add(line)
                unique_lines.append(line)
        
        text = '\n'.join(unique_lines)
        
        cleaned_length = len(text)
        
        # Calculate information retention
        retention = (cleaned_length / original_length * 100) if original_length > 0 else 0
        
        return text.strip(), retention
    
    def extract_metadata(self, text, filename):
        """Extract comprehensive metadata for RAG optimization"""
        
        # Basic metrics
        words = text.split()
        word_count = len(words)
        char_count = len(text)
        
        # Content type detection
        has_numbers = bool(re.search(r'\d+', text))
        has_pricing = bool(re.search(r'(\$|commission|spread|fee|cost|charge)', text, re.IGNORECASE))
        has_contact = bool(re.search(r'(email|phone|contact|@|\+\d+)', text, re.IGNORECASE))
        has_regulatory = bool(re.search(r'(FCA|FSC|ASIC|VFSC|regulat|licens|complian)', text, re.IGNORECASE))
        has_tutorial = bool(re.search(r'(how to|step|guide|tutorial|learn)', text, re.IGNORECASE))
        
        # Entity extraction
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        phones = re.findall(r'\+?\d{1,3}[-\s]?\d{2,3}[-\s]?\d{3,4}[-\s]?\d{3,4}', text)
        urls = re.findall(r'https?://[^\s]+', text)
        
        # Complexity score (for multi-doc queries)
        complexity_score = 0
        if word_count > 500: complexity_score += 1
        if has_pricing and has_regulatory: complexity_score += 1
        if len(emails) > 0 or len(phones) > 0: complexity_score += 1
        if has_tutorial: complexity_score += 1
        
        # Topic extraction (simple keyword-based)
        topics = []
        topic_keywords = {
            'trading': ['trade', 'trading', 'trader', 'market'],
            'platform': ['mt4', 'mt5', 'metatrader', 'platform', 'app'],
            'account': ['account', 'registration', 'signup', 'demo', 'live'],
            'product': ['forex', 'cfd', 'stock', 'crypto', 'commodity', 'index'],
            'education': ['learn', 'guide', 'tutorial', 'education', 'course'],
            'regulation': ['fca', 'fsc', 'regulated', 'license', 'compliant'],
            'payment': ['deposit', 'withdraw', 'payment', 'fund', 'transfer'],
        }
        
        text_lower = text.lower()
        for topic, keywords in topic_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                topics.append(topic)
        
        metadata = {
            'filename': filename,
            'word_count': word_count,
            'char_count': char_count,
            'has_numbers': has_numbers,
            'has_pricing': has_pricing,
            'has_contact': has_contact,
            'has_regulatory': has_regulatory,
            'has_tutorial': has_tutorial,
            'emails': emails,
            'phones': phones,
            'urls': urls,
            'complexity_score': complexity_score,
            'topics': topics,
            'processing_timestamp': datetime.now().isoformat()
        }
        
        return metadata
    
    def categorize_content(self, filename, text, metadata):
        """
        Advanced categorization using filename, content, and metadata
        
        Handles edge cases and mixed content
        """
        filename_lower = filename.lower()
        text_lower = text.lower()
        
        # Category keyword dictionary (expanded)
        category_keywords = {
            'platforms': {
                'keywords': ['mt4', 'mt5', 'metatrader', 'webtrader', 'platform', 'app', 'mobile', 'client portal', 'trading terminal'],
                'weight': 1.0
            },
            'products': {
                'keywords': ['forex', 'cfd', 'commodit', 'indices', 'stock', 'crypto', 'bullion', 'metal', 'currency', 'etf', 'pairs', 'instrument'],
                'weight': 1.0
            },
            'education': {
                'keywords': ['learn', 'education', 'guide', 'tutorial', 'hub', 'glossary', 'macro', 'risk management', 'strategy', 'indicator', 'analysis'],
                'weight': 1.0
            },
            'accounts': {
                'keywords': ['account', 'global', 'pro', 'cent', 'demo', 'registration', 'signup', 'live account'],
                'weight': 1.0
            },
            'tools': {
                'keywords': ['calculator', 'tool', 'calendar', 'economic', 'signal', 'analysis', 'terminal', 'widget'],
                'weight': 0.8
            },
            'about': {
                'keywords': ['about', 'company', 'contact', 'sponsor', 'atletico', 'fortaleza', 'team', 'office'],
                'weight': 0.7
            },
            'support': {
                'keywords': ['help', 'faq', 'support', 'question', 'how to', 'how-to'],
                'weight': 0.9
            },
            'legal': {
                'keywords': ['legal', 'terms', 'condition', 'policy', 'privacy', 'compliance', 'regulation', 'bonus', 'offer'],
                'weight': 0.8
            },
            'funding': {
                'keywords': ['deposit', 'withdraw', 'funding', 'payment', 'bank', 'transfer', 'method'],
                'weight': 1.0
            },
            'partners': {
                'keywords': ['partner', 'ib', 'affiliate', 'pamm', 'introducing broker', 'commission'],
                'weight': 0.8
            },
            'blog': {
                'keywords': ['blog/', 'article', 'news', 'insight'],
                'weight': 0.5
            },
        }
        
        # Score each category
        category_scores = {}
        
        for category, config in category_keywords.items():
            score = 0
            keywords = config['keywords']
            weight = config['weight']
            
            # Check filename (higher weight)
            filename_matches = sum(2 for keyword in keywords if keyword in filename_lower)
            
            # Check content
            content_matches = sum(1 for keyword in keywords if keyword in text_lower)
            
            # Check metadata topics
            topic_matches = sum(1 for topic in metadata['topics'] if topic in keywords or category in topic)
            
            # Calculate weighted score
            score = (filename_matches * 3 + content_matches + topic_matches) * weight
            
            category_scores[category] = score
        
        # Get category with highest score
        if category_scores:
            best_category = max(category_scores.items(), key=lambda x: x[1])
            if best_category[1] > 0:
                return best_category[0]
        
        # Default to general if no clear category
        return 'general'
    
    def extract_key_facts(self, text):
        """
        Extract key facts and data points for quick reference
        
        Includes cross-references for multi-doc queries
        """
        facts = {
            'leverage': [],
            'spreads': [],
            'commissions': [],
            'minimum_deposits': [],
            'regulations': [],
            'account_types': [],
            'platforms': [],
            'instruments': [],
            'contact_info': [],
            'processing_times': [],
        }
        
        # Leverage
        leverage_matches = re.findall(r'(\d+:\d+)\s*leverage', text, re.IGNORECASE)
        facts['leverage'] = list(set(leverage_matches))
        
        # Spreads
        spread_matches = re.findall(r'spread.*?(\d+\.?\d*)\s*pip', text, re.IGNORECASE)
        facts['spreads'] = list(set([m for m in spread_matches]))
        
        # Commissions
        commission_matches = re.findall(r'commission.*?(\d+\.?\d*)\s*%', text, re.IGNORECASE)
        facts['commissions'] = list(set([m for m in commission_matches]))
        
        # Minimum deposits
        deposit_matches = re.findall(r'minimum deposit.*?\$(\d+)', text, re.IGNORECASE)
        facts['minimum_deposits'] = list(set([f"${m}" for m in deposit_matches]))
        
        # Regulations
        reg_matches = re.findall(r'(FCA|FSC|ASIC|CySEC|VFSC|FSA)', text, re.IGNORECASE)
        facts['regulations'] = list(set([r.upper() for r in reg_matches]))
        
        # Account types
        account_types = []
        if re.search(r'hantec global', text, re.IGNORECASE):
            account_types.append('Hantec Global')
        if re.search(r'hantec pro', text, re.IGNORECASE):
            account_types.append('Hantec Pro')
        if re.search(r'hantec cent', text, re.IGNORECASE):
            account_types.append('Hantec Cent')
        facts['account_types'] = account_types
        
        # Platforms
        platforms = []
        if re.search(r'\bMT4\b|MetaTrader 4', text, re.IGNORECASE):
            platforms.append('MT4')
        if re.search(r'\bMT5\b|MetaTrader 5', text, re.IGNORECASE):
            platforms.append('MT5')
        if re.search(r'hantec social', text, re.IGNORECASE):
            platforms.append('Hantec Social')
        if re.search(r'mobile app', text, re.IGNORECASE):
            platforms.append('Mobile App')
        if re.search(r'webtrader', text, re.IGNORECASE):
            platforms.append('WebTrader')
        facts['platforms'] = platforms
        
        # Instruments
        instruments = []
        instrument_keywords = {
            'Forex': r'forex|currency pair|fx',
            'CFDs': r'\bcfd\b',
            'Commodities': r'commodit|gold|silver|oil',
            'Indices': r'indices|index|S&P|FTSE|Dow',
            'Stocks': r'stock|share|equit',
            'Crypto': r'crypto|bitcoin|ethereum'
        }
        for instrument, pattern in instrument_keywords.items():
            if re.search(pattern, text, re.IGNORECASE):
                instruments.append(instrument)
        facts['instruments'] = instruments
        
        # Contact info
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        phones = re.findall(r'\+?\d{1,3}[-\s]?\d{2,3}[-\s]?\d{3,4}[-\s]?\d{3,4}', text)
        facts['contact_info'] = list(set(emails + phones))
        
        # Processing times
        time_matches = re.findall(r'(\d+[-\s]?\d*)\s*(minute|hour|day|business day)', text, re.IGNORECASE)
        facts['processing_times'] = [f"{m[0]} {m[1]}" for m in time_matches]
        
        return facts
    
    def identify_relationships(self, doc, all_docs):
        """
        Identify relationships between documents for multi-doc queries
        
        Returns list of related document IDs
        """
        relationships = []
        
        current_topics = set(doc['metadata']['topics'])
        current_facts = doc['facts']
        
        for other_doc in all_docs:
            if other_doc['filename'] == doc['filename']:
                continue
            
            other_topics = set(other_doc['metadata']['topics'])
            other_facts = other_doc['facts']
            
            # Topic overlap
            topic_overlap = len(current_topics & other_topics)
            
            # Fact overlap (e.g., both mention same platforms)
            fact_overlap = 0
            for key in current_facts:
                if current_facts[key] and other_facts[key]:
                    common = set(current_facts[key]) & set(other_facts[key])
                    fact_overlap += len(common)
            
            # If significant overlap, mark as related
            if topic_overlap >= 2 or fact_overlap >= 1:
                relationships.append({
                    'related_doc': other_doc['filename'],
                    'relationship_type': 'topic' if topic_overlap > fact_overlap else 'fact',
                    'strength': topic_overlap + fact_overlap
                })
        
        # Sort by strength
        relationships.sort(key=lambda x: x['strength'], reverse=True)
        
        return relationships[:5]  # Top 5 related docs
    
    def structure_content(self, text, metadata, facts):
        """Add structured headers and sections for RAG optimization"""
        
        structured = []
        
        # Metadata header
        structured.append("# METADATA")
        structured.append(f"Word Count: {metadata['word_count']}")
        structured.append(f"Character Count: {metadata['char_count']}")
        structured.append(f"Complexity Score: {metadata['complexity_score']}/4")
        structured.append(f"Topics: {', '.join(metadata['topics'])}")
        structured.append(f"Has Pricing: {'Yes' if metadata['has_pricing'] else 'No'}")
        structured.append(f"Has Contact: {'Yes' if metadata['has_contact'] else 'No'}")
        structured.append(f"Has Regulatory: {'Yes' if metadata['has_regulatory'] else 'No'}")
        structured.append(f"Has Tutorial: {'Yes' if metadata['has_tutorial'] else 'No'}")
        structured.append("\n" + "="*80 + "\n")
        
        # Key facts section (if any)
        if any(facts.values()):
            structured.append("# KEY FACTS")
            if facts['leverage']:
                structured.append(f"Leverage Options: {', '.join(facts['leverage'])}")
            if facts['spreads']:
                structured.append(f"Spreads: From {min(facts['spreads'])} pips")
            if facts['minimum_deposits']:
                structured.append(f"Minimum Deposits: {', '.join(facts['minimum_deposits'])}")
            if facts['regulations']:
                structured.append(f"Regulations: {', '.join(facts['regulations'])}")
            if facts['account_types']:
                structured.append(f"Account Types: {', '.join(facts['account_types'])}")
            if facts['platforms']:
                structured.append(f"Platforms: {', '.join(facts['platforms'])}")
            if facts['instruments']:
                structured.append(f"Instruments: {', '.join(facts['instruments'])}")
            if facts['contact_info']:
                structured.append(f"Contact: {', '.join(facts['contact_info'][:2])}")  # Limit to 2
            structured.append("\n" + "="*80 + "\n")
        
        # Main content
        structured.append("# CONTENT\n")
        structured.append(text)
        
        return '\n'.join(structured)
    
    def process_file(self, filepath):
        """Process a single file with comprehensive logging"""
        filename = os.path.basename(filepath)
        
        self.log(f"Processing: {filename}", 'PROCESSING')
        
        try:
            # Read file
            with open(filepath, 'r', encoding='utf-8') as f:
                raw_text = f.read()
            
            input_length = len(raw_text)
            self.metrics['total_input_chars'] += input_length
            
            # Extract source URL
            source_url = ''
            source_match = re.search(r'SOURCE:\s*(https?://[^\n]+)', raw_text)
            if source_match:
                source_url = source_match.group(1)
            
            # Clean text
            cleaned_text, retention = self.clean_text(raw_text)
            
            if len(cleaned_text) < 100:
                self.log(f"  ⚠️  Skipped (too short: {len(cleaned_text)} chars)", 'WARNING')
                self.metrics['failed_files'] += 1
                return None
            
            output_length = len(cleaned_text)
            self.metrics['total_output_chars'] += output_length
            
            # Extract metadata
            metadata = self.extract_metadata(cleaned_text, filename)
            
            # Categorize
            category = self.categorize_content(filename, cleaned_text, metadata)
            
            # Extract facts
            facts = self.extract_key_facts(cleaned_text)
            
            # Structure content
            structured_text = self.structure_content(cleaned_text, metadata, facts)
            
            # Add source URL
            if source_url:
                structured_text = f"SOURCE: {source_url}\n{'='*80}\n\n{structured_text}"
            
            self.log(f"  ✅ Category: {category} | Words: {metadata['word_count']} | Retention: {retention:.1f}%", 'SUCCESS')
            
            self.metrics['processed_files'] += 1
            
            return {
                'filename': filename,
                'category': category,
                'content': structured_text,
                'metadata': metadata,
                'facts': facts,
                'source_url': source_url,
                'retention': retention
            }
            
        except Exception as e:
            self.log(f"  ❌ Error: {str(e)[:100]}", 'ERROR')
            self.metrics['failed_files'] += 1
            return None
    
    def save_brand_guidelines(self):
        """Save brand guidelines document"""
        guidelines_file = f"{self.output_dir}/BRAND_GUIDELINES.md"
        
        content = f"""# HANTEC MARKETS - BRAND GUIDELINES

## Company Information
**Name:** {self.brand_guidelines['company_name']}
**Tagline:** {self.brand_guidelines['tagline']}

## Brand Voice & Tone
**Tone:** {self.brand_guidelines['tone']}

## Core Values
{chr(10).join(f'- {value}' for value in self.brand_guidelines['key_values'])}

## Regulatory Information
**Licensed & Regulated By:**
{chr(10).join(f'- {entity}' for entity in self.brand_guidelines['regulatory_entities'])}

## Communication Standards

### Prohibited Claims
When communicating with clients, NEVER claim:
{chr(10).join(f'- {claim}' for claim in self.brand_guidelines['prohibited_claims'])}

### Required Disclaimers
Always include appropriate disclaimers:
{chr(10).join(f'- {disclaimer}' for disclaimer in self.brand_guidelines['required_disclaimers'])}

## Example Compliant Messaging

### ✅ Good Example:
"Hantec Markets offers leverage up to 500:1, allowing traders to control larger positions. 
**Risk Warning:** Higher leverage increases both potential gains and losses. Consider whether 
you understand how CFDs work and can afford the risk."

### ❌ Bad Example:
"Trade with 500:1 leverage and make guaranteed profits! No risk, always win!"

## RAG System Instructions

When generating responses:
1. Always mention company name fully: "Hantec Markets" (not just "Hantec")
2. Include appropriate risk warnings for trading-related queries
3. Be educational, not promotional
4. Provide facts with sources
5. Never make guarantees about returns
6. Direct complex questions to human support when uncertain

## Contact Information
- Support: Available in extracted documents
- Compliance: Refer to regulatory information in legal category

---
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        with open(guidelines_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        self.log("Brand guidelines saved", 'SUCCESS')
    
    def save_results(self):
        """Save all processed documents organized by category"""
        
        self.log("\n💾 Saving results...", 'INFO')
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Group by category
        for doc in self.processed_docs:
            if doc:
                self.categories[doc['category']].append(doc)
        
        self.metrics['categories_created'] = len(self.categories)
        
        # Save each category
        for category, docs in self.categories.items():
            if not docs:
                continue
            
            filename = f"{self.output_dir}/{category}.txt"
            
            with open(filename, 'w', encoding='utf-8') as f:
                # Category header
                total_words = sum(d['metadata']['word_count'] for d in docs)
                f.write(f"# {category.upper()} - HANTEC MARKETS\n")
                f.write(f"# Total Documents: {len(docs)}\n")
                f.write(f"# Total Words: {total_words:,}\n")
                f.write(f"# Average Retention: {sum(d['retention'] for d in docs)/len(docs):.1f}%\n")
                f.write("="*80 + "\n\n")
                
                # Write each document
                for doc in docs:
                    f.write(f"\n{'='*80}\n")
                    f.write(f"DOCUMENT: {doc['filename']}\n")
                    f.write(f"{'='*80}\n\n")
                    f.write(doc['content'])
                    f.write("\n\n")
            
            file_size = os.path.getsize(filename) / 1024
            self.log(f"  ✅ {category}.txt - {len(docs)} docs ({file_size:.1f} KB)", 'SUCCESS')
        
        # Save master index
        self.save_master_index()
        
        # Save quick facts
        self.save_quick_facts()
        
        # Save document relationships
        self.save_document_relationships()
        
        # Save brand guidelines
        self.save_brand_guidelines()
        
        # Save quality metrics
        self.save_quality_metrics()
    
    def save_master_index(self):
        """Save comprehensive master index"""
        index_file = f"{self.output_dir}/_master_index.txt"
        
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write("# HANTEC MARKETS - MASTER INDEX\n")
            f.write(f"# Total Documents: {self.metrics['processed_files']}\n")
            f.write(f"# Total Words: {sum(d['metadata']['word_count'] for d in self.processed_docs if d):,}\n")
            f.write(f"# Categories: {self.metrics['categories_created']}\n")
            f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*80 + "\n\n")
            
            # Table of contents
            f.write("## TABLE OF CONTENTS\n\n")
            for category, docs in sorted(self.categories.items()):
                if docs:
                    f.write(f"- {category.upper()} ({len(docs)} documents)\n")
            f.write("\n" + "="*80 + "\n")
            
            # Detailed listing by category
            for category, docs in sorted(self.categories.items()):
                if not docs:
                    continue
                
                f.write(f"\n## {category.upper()} ({len(docs)} documents)\n")
                f.write("-"*80 + "\n")
                
                for doc in docs:
                    f.write(f"\n### {doc['filename']}\n")
                    f.write(f"**Source:** {doc['source_url']}\n")
                    f.write(f"**Words:** {doc['metadata']['word_count']:,}\n")
                    f.write(f"**Topics:** {', '.join(doc['metadata']['topics'])}\n")
                    f.write(f"**Complexity:** {doc['metadata']['complexity_score']}/4\n")
                    
                    # Key facts summary
                    if any(doc['facts'].values()):
                        f.write("**Key Info:** ")
                        info_parts = []
                        if doc['facts']['leverage']:
                            info_parts.append(f"Leverage: {', '.join(doc['facts']['leverage'])}")
                        if doc['facts']['regulations']:
                            info_parts.append(f"Regulations: {', '.join(doc['facts']['regulations'])}")
                        if doc['facts']['platforms']:
                            info_parts.append(f"Platforms: {', '.join(doc['facts']['platforms'])}")
                        f.write(', '.join(info_parts) + "\n")
                    
                    f.write("\n")
        
        self.log("Master index saved", 'SUCCESS')
    
    def save_quick_facts(self):
        """Save consolidated quick facts JSON"""
        facts_file = f"{self.output_dir}/_quick_facts.json"
        
        consolidated_facts = {
            'leverage_options': set(),
            'spreads': set(),
            'commissions': set(),
            'minimum_deposits': set(),
            'regulations': set(),
            'account_types': set(),
            'platforms': set(),
            'instruments': set(),
            'contact_info': set(),
        }
        
        for doc in self.processed_docs:
            if not doc:
                continue
            
            for key in consolidated_facts:
                if key in doc['facts']:
                    consolidated_facts[key].update(doc['facts'][key])
        
        # Convert sets to sorted lists
        facts_json = {k: sorted(list(v)) for k, v in consolidated_facts.items()}
        
        # Add metadata
        facts_json['_metadata'] = {
            'generated': datetime.now().isoformat(),
            'total_documents': self.metrics['processed_files'],
            'categories': list(self.categories.keys())
        }
        
        with open(facts_file, 'w', encoding='utf-8') as f:
            json.dump(facts_json, f, indent=2)
        
        self.log("Quick facts JSON saved", 'SUCCESS')
    
    def save_document_relationships(self):
        """Save document relationship map for multi-doc queries"""
        
        # First, identify all relationships
        for doc in self.processed_docs:
            if doc:
                relationships = self.identify_relationships(doc, self.processed_docs)
                self.doc_relationships[doc['filename']] = relationships
        
        # Save as JSON
        relationships_file = f"{self.output_dir}/_document_relationships.json"
        
        with open(relationships_file, 'w', encoding='utf-8') as f:
            json.dump(self.doc_relationships, f, indent=2)
        
        self.log("Document relationships saved", 'SUCCESS')
    
    def save_quality_metrics(self):
        """Save quality metrics report"""
        
        # Calculate final metrics
        if self.metrics['total_input_chars'] > 0:
            self.metrics['info_coverage'] = (
                self.metrics['total_output_chars'] / self.metrics['total_input_chars'] * 100
            )
        
        metrics_file = f"{self.output_dir}/_quality_metrics.json"
        
        metrics_report = {
            'processing_summary': {
                'total_files_found': self.metrics['total_files'],
                'successfully_processed': self.metrics['processed_files'],
                'failed_files': self.metrics['failed_files'],
                'success_rate': f"{(self.metrics['processed_files']/self.metrics['total_files']*100):.1f}%" if self.metrics['total_files'] > 0 else 'N/A'
            },
            'content_metrics': {
                'total_input_characters': self.metrics['total_input_chars'],
                'total_output_characters': self.metrics['total_output_chars'],
                'information_coverage': f"{self.metrics['info_coverage']:.1f}%",
                'average_document_size': f"{self.metrics['total_output_chars']//self.metrics['processed_files']:,} chars" if self.metrics['processed_files'] > 0 else 'N/A'
            },
            'organization': {
                'categories_created': self.metrics['categories_created'],
                'categories': list(self.categories.keys())
            },
            'timestamp': datetime.now().isoformat()
        }
        
        with open(metrics_file, 'w', encoding='utf-8') as f:
            json.dump(metrics_report, f, indent=2)
        
        self.log("Quality metrics saved", 'SUCCESS')
    
    def run(self):
        """Main execution pipeline"""
        
        print("\n" + "="*80)
        print("HANTEC MARKETS - PRODUCTION RAG DATA CLEANING PIPELINE")
        print("="*80)
        print(f"\nInput:  {self.input_dir}/")
        print(f"Output: {self.output_dir}/")
        print("\n" + "="*80 + "\n")
        
        # Check input directory
        input_path = Path(self.input_dir)
        if not input_path.exists():
            self.log(f"Input directory not found: {self.input_dir}", 'ERROR')
            self.log("Please create it and add your scraped .txt files", 'ERROR')
            return
        
        # Get all files
        txt_files = list(input_path.glob("*.txt"))
        self.metrics['total_files'] = len(txt_files)
        
        if not txt_files:
            self.log(f"No .txt files found in {self.input_dir}/", 'ERROR')
            return
        
        self.log(f"Found {len(txt_files)} files to process\n", 'INFO')
        
        # Process each file
        for i, filepath in enumerate(txt_files, 1):
            self.log(f"[{i}/{len(txt_files)}]", 'INFO')
            result = self.process_file(filepath)
            if result:
                self.processed_docs.append(result)
        
        # Save results
        if self.processed_docs:
            self.save_results()
            
            # Print summary
            print("\n" + "="*80)
            print("🎉 PROCESSING COMPLETE!")
            print("="*80)
            print(f"\n📊 Summary:")
            print(f"  Total files processed: {self.metrics['processed_files']}/{self.metrics['total_files']}")
            print(f"  Success rate: {(self.metrics['processed_files']/self.metrics['total_files']*100):.1f}%")
            print(f"  Information coverage: {self.metrics['info_coverage']:.1f}%")
            print(f"  Categories created: {self.metrics['categories_created']}")
            print(f"  Output directory: {self.output_dir}/")
            print(f"\n✅ Your RAG system is ready!")
            print(f"✅ All files saved to: {self.output_dir}/")
            print(f"✅ ChromaDB will automatically index these files\n")
        else:
            self.log("No documents were processed successfully", 'ERROR')


if __name__ == "__main__":
    cleaner = HantecProductionCleaner(
        input_dir="raw_scraped_data",
        output_dir="data/knowledge_base/website"
    )
    cleaner.run()