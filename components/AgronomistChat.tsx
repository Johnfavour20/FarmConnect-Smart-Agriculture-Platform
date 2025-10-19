import React, { useState, useRef, useEffect } from 'react';
import type { AgronomistChatMessage } from '../types';
import { SendIcon, LeafIcon, ImageIcon, QuestionMarkCircleIcon } from './IconComponents';
import { ChatLoader } from './ChatLoader';

// A simple markdown to HTML converter
const formatMessage = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(\r\n|\n|\r)/g, '<br />');

    if (html.includes('<li>')) {
      html = `<ul>${html.replace(/<br \/>/g, '')}</ul>`.replace(/<\/li><br \/><ul>/g, '</li></ul><ul>');
    }

    return { __html: html };
};

interface AgronomistChatProps {
  chatHistory: AgronomistChatMessage[];
  isChatLoading: boolean;
  onAsk: (prompt: string, image: File | null) => void;
}

export const AgronomistChat: React.FC<AgronomistChatProps> = ({ chatHistory, isChatLoading, onAsk }) => {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
      setImageFile(null);
      setImagePreview(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || imageFile) && !isChatLoading) {
      onAsk(input.trim(), imageFile);
      setInput('');
      removeImage();
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
                <div className="text-center text-slate-500 p-8 flex flex-col items-center">
                    <QuestionMarkCircleIcon className="h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="font-semibold text-lg text-slate-700">Ask the AI Agronomist</h3>
                    <p className="text-sm">Have a question about a plant, soil, or farming technique? <br/> Ask with text or upload a photo.</p>
                </div>
            )}
            {chatHistory.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                         <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <LeafIcon className="w-5 h-5 text-green-600" />
                        </div>
                    )}
                    <div 
                        className={`max-w-md lg:max-w-lg p-3 rounded-2xl text-sm ${
                            msg.role === 'user' 
                                ? 'bg-green-600 text-white rounded-br-none' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}
                    >
                        {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="User upload" className="rounded-lg mb-2 max-h-48" />
                        )}
                        <div className="prose prose-sm" dangerouslySetInnerHTML={formatMessage(msg.text)} />
                    </div>
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
        <div className="p-3 border-t border-slate-200 bg-white rounded-b-2xl">
            {imagePreview && (
                 <div className="relative w-20 h-20 mb-2 p-1 border bg-slate-100 rounded-md">
                    <img src={imagePreview} alt="Preview" className="rounded object-cover w-full h-full" />
                     <button 
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold"
                        aria-label="Remove image"
                    >
                        &times;
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                 <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    aria-label="Add image"
                >
                    <ImageIcon className="h-6 w-6" />
                </button>
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question for the AI Agronomist..."
                    className="flex-1 w-full bg-slate-100 border-transparent focus:border-green-500 focus:ring-green-500 rounded-full py-2.5 px-4 text-sm"
                    disabled={isChatLoading}
                />
                <button 
                    type="submit" 
                    disabled={(!input.trim() && !imageFile) || isChatLoading}
                    className="bg-green-600 text-white rounded-full p-2.5 hover:bg-green-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    aria-label="Send message"
                >
                    <SendIcon className="h-5 w-5" />
                </button>
            </form>
        </div>
    </div>
  );
};