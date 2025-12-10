import React from 'react';

function LoadingState() {
  return (
    <div className="flex items-start gap-3 mb-4 message-enter">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center shadow-sm">
        <span className="text-white font-semibold text-sm italic">H</span>
      </div>

      {/* Loading Message Bubble */}
      <div className="flex-1 max-w-[80%]">
        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <span className="text-[#666666] text-sm">Thinking</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#8B0000] rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-[#8B0000] rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-[#8B0000] rounded-full loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingState;