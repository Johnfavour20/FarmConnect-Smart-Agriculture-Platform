
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon } from './IconComponents';
import { ChatLoader } from './ChatLoader';
import { LeafIcon } from './IconComponents';

// A simple markdown to HTML converter
const formatMessage = (text: string) => {
    // Bold, Italic, and lists
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(\r\n|\n|\r)/g, '<br />');

    // Wrap list items in <ul>
    if (html.includes('<li>')) {
      html = `<ul>${html.replace(/<br \/>/g, '')}</ul>`.replace(/<\/li><br \/><ul>/g, '</li></ul><ul>');
    }


    return { __html: html };
};


export const ChatInterface: React.FC<{
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (message: string) => void;
}> = ({ chatHistory, isChatLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isChatLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-md border border-slate-200 p-1">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                         <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <LeafIcon className="w-5 h-5 text-green-600" />
                        </div>
                    )}
                    <div 
                        className={`max-w-md lg:max-w-lg p-3 rounded-2xl text-sm prose prose-sm ${
                            msg.role === 'user' 
                                ? 'bg-green-600 text-white rounded-br-none' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}
                        dangerouslySetInnerHTML={formatMessage(msg.content)}
                    />
                </div>
            ))}
            {isChatLoading && (
                <div className="flex items-end gap-2 justify-start">
                     <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <LeafIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="max-w-xs p-3 rounded-2xl bg-slate-100 rounded-bl-none">
                       <ChatLoader />
                    </div>
                </div>
            )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 flex items-center gap-3">
            <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 w-full bg-slate-100 border-transparent focus:border-green-500 focus:ring-green-500 rounded-full py-2 px-4 text-sm"
                disabled={isChatLoading}
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isChatLoading}
                className="bg-green-600 text-white rounded-full p-2.5 hover:bg-green-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                aria-label="Send message"
            >
                <SendIcon className="h-5 w-5" />
            </button>
        </form>
    </div>
  );
};