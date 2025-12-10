import React from 'react';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message, isUser }) {
  if (isUser) {
    return (
      <div className="flex items-start gap-3 mb-4 justify-end message-enter">
        {/* User Message Bubble */}
        <div className="flex-1 max-w-[80%] flex justify-end">
          <div className="bg-[#8B0000] text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>

        {/* User Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-sm">
          <span className="text-white font-semibold text-sm">
            {message.userName ? message.userName.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
      </div>
    );
  }

  // AI Message
  return (
    <div className="flex items-start gap-3 mb-4 message-enter">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center shadow-sm">
        <span className="text-white font-semibold text-sm italic">H</span>
      </div>

      {/* AI Message Bubble */}
      <div className="flex-1 max-w-[80%]">
        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-[#f0f0f0]">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                // Style markdown elements
                p: ({ children }) => <p className="text-[#1a1a1a] text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-[#1a1a1a]">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-[#1a1a1a] text-sm">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg font-semibold text-[#1a1a1a] mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold text-[#1a1a1a] mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-[#1a1a1a] mb-1">{children}</h3>,
                a: ({ children, href }) => (
                  <a href={href} className="text-[#8B0000] hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                code: ({ children }) => <code className="bg-[#f5f5f5] px-1 py-0.5 rounded text-xs">{children}</code>,
                pre: ({ children }) => <pre className="bg-[#f5f5f5] p-2 rounded text-xs overflow-x-auto mb-2">{children}</pre>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Confidence Badge */}
          {message.confidence && message.confidence !== 'high' && (
            <div className="mt-2 pt-2 border-t border-[#f0f0f0]">
              <span className={`text-xs px-2 py-1 rounded ${
                message.confidence === 'medium' 
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.confidence === 'medium' ? '⚠️ Medium Confidence' : '⚠️ Low Confidence'}
              </span>
            </div>
          )}

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-[#f0f0f0]">
              <p className="text-xs text-[#999999] mb-1">Sources:</p>
              <div className="flex flex-wrap gap-1">
                {message.sources.slice(0, 3).map((source, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-[#f5f5f5] text-[#666666] rounded">
                    📚 {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <p className="text-xs text-[#999999] mt-1 ml-2">
            {new Date(message.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;