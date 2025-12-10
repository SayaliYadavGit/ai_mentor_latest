import React from 'react';
import { SAMPLE_QUERIES } from '../config';

function Sidebar({ onSelectQuery, isOpen, onClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] bg-white border-r border-[#e5e5e5]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Common Questions</h2>
          
          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-[#666666] hover:text-[#1a1a1a]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
          {SAMPLE_QUERIES.map((query, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectQuery(query);
                onClose(); // Close sidebar on mobile after selection
              }}
              className="w-full text-left p-3 rounded-lg border border-[#f0f0f0] bg-white hover:bg-[#fafafa] hover:border-[#e5e5e5] transition-all text-sm text-[#1a1a1a] leading-relaxed group"
            >
              <div className="flex items-start gap-2">
                <span className="text-[#8B0000] opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                  💬
                </span>
                <span className="flex-1">{query}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5e5]">
          <div className="bg-[#fafafa] rounded-lg p-3 border border-[#f0f0f0]">
            <p className="text-xs text-[#666666] leading-relaxed">
              <strong className="text-[#1a1a1a] block mb-1">💡 Pro Tip</strong>
              Ask specific questions for better answers. Need help? Contact our support team.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;