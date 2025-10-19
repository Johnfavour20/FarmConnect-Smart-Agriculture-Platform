
import React from 'react';

export const ChatLoader: React.FC = () => (
  <div className="flex items-center space-x-2">
    <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
    <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse [animation-delay:0.4s]"></div>
  </div>
);
