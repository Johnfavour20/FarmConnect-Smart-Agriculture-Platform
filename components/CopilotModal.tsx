import React, { useState, useRef, useEffect } from 'react';
import type { CopilotChatMessage, Diagnosis } from '../types';
import { SendIcon, LeafIcon, ImageIcon, XIcon, SparklesIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, TrendingUpIcon } from './IconComponents';
import { ChatLoader } from './ChatLoader';


const formatMarkdown = (text: string) => {
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

// --- Rich Content Cards ---
const DiagnosisCard: React.FC<{ diagnosis: Diagnosis }> = ({ diagnosis }) => {
    const isHealthy = diagnosis.diseaseName.toLowerCase() === 'healthy';
    return (
        <div className="bg-white rounded-lg p-4 mt-2 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-2">Diagnosis Report</h4>
             <div className={`flex items-start p-3 rounded-lg mb-2 text-sm ${isHealthy ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                {isHealthy ? <CheckCircleIcon className="h-6 w-6 mr-2 flex-shrink-0" /> : <ExclamationTriangleIcon className="h-6 w-6 mr-2 flex-shrink-0" />}
                <div>
                    <p className="font-semibold">{diagnosis.diseaseName}</p>
                    <p>Confidence: {diagnosis.confidenceScore} | Severity: {diagnosis.severity}</p>
                </div>
            </div>
            <div className="text-xs space-y-2">
                <p><strong>Treatment:</strong> {diagnosis.recommendedTreatment}</p>
            </div>
        </div>
    );
};

const MarketPulseCard: React.FC<{ analysis: string }> = ({ analysis }) => (
     <div className="bg-white rounded-lg p-4 mt-2 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
            <TrendingUpIcon className="h-5 w-5 text-blue-500"/>
            <h4 className="font-bold text-slate-800">Market Pulse</h4>
        </div>
        <div className="text-xs prose prose-sm max-w-none" dangerouslySetInnerHTML={formatMarkdown(analysis)} />
    </div>
);

const PriceSuggestionCard: React.FC<{ suggestion: string }> = ({ suggestion }) => (
    <div className="bg-white rounded-lg p-4 mt-2 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="h-5 w-5 text-purple-500"/>
            <h4 className="font-bold text-slate-800">Price Suggestion</h4>
        </div>
        <p className="text-xs">{suggestion}</p>
    </div>
);


const CopilotMessage: React.FC<{ msg: CopilotChatMessage }> = ({ msg }) => {
    const renderContent = () => {
        if (typeof msg.content === 'string') {
             return <div className="prose prose-sm" dangerouslySetInnerHTML={formatMarkdown(msg.content)} />;
        }
        // Type guard for Diagnosis
        if ('diseaseName' in msg.content) {
            return <DiagnosisCard diagnosis={msg.content} />
        }
        // Type guard for structured content
        if (typeof msg.content === 'object' && msg.content !== null && 'type' in msg.content) {
            switch(msg.content.type) {
                case 'marketAnalysis':
                    return <MarketPulseCard analysis={msg.content.analysis} />
                case 'priceSuggestion':
                    return <PriceSuggestionCard suggestion={msg.content.suggestion} />
            }
        }
        return null;
    };
    
    if (msg.role === 'system') {
        return (
            <div className="flex items-center gap-3 p-3 text-sm text-slate-600 bg-slate-100 rounded-lg">
                <InformationCircleIcon className="h-6 w-6 text-slate-500 flex-shrink-0" />
                <p>{msg.content as string}</p>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                </div>
            )}
            <div 
                className={`max-w-sm p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                        ? 'bg-green-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}
            >
                {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="User upload" className="rounded-lg mb-2 max-h-48" />
                )}
                {renderContent()}
            </div>
        </div>
    );
};

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: CopilotChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (prompt: string, image: File | null) => void;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({ isOpen, onClose, chatHistory, isChatLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto' };
  }, [isOpen]);

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
      onSendMessage(input.trim(), imageFile);
      setInput('');
      removeImage();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
      onSendMessage(prompt, null);
  };
  
  if(!isOpen) return null;

  const suggestionChips = ["Diagnose my crop", "What's the market price for tomatoes in Lagos?", "Analyze market trends"];

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex flex-col items-center justify-center animate-fade-in-fast p-0 sm:p-4">
        <div className="bg-slate-50 rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:max-w-2xl sm:h-[90vh] flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-800">AI Co-pilot</h2>
                </div>
                <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
                    <XIcon className="h-6 w-6" />
                </button>
            </header>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((msg, index) => <CopilotMessage key={index} msg={msg} />)}
                {isChatLoading && (
                    <div className="flex items-end gap-2 justify-start">
                         <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="max-w-xs p-3 rounded-2xl bg-slate-100 rounded-bl-none">
                           <ChatLoader />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-white rounded-b-none sm:rounded-b-2xl">
                 {chatHistory.length <= 1 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {suggestionChips.map(prompt => (
                            <button key={prompt} onClick={() => handleSuggestionClick(prompt)} className="flex-shrink-0 text-xs bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-full hover:bg-slate-300 transition-colors">
                                {prompt}
                            </button>
                        ))}
                    </div>
                 )}
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
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
                        placeholder="Ask about market prices, crop health, etc..."
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
    </div>
  );
};