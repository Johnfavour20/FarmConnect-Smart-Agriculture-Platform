// components/FarmerChatView.tsx
import React from 'react';
import type { Listing, ChatMessage } from '../types';
import { ChatInterface } from './ChatInterface';
import { LocationMarkerIcon, ArrowLeftIcon, FarmerIcon } from './IconComponents';

interface FarmerChatViewProps {
  listing: Listing;
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void;
}

export const FarmerChatView: React.FC<FarmerChatViewProps> = ({
  listing,
  chatHistory,
  isChatLoading,
  onSendMessage,
  onBack,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-green-700 font-medium transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 mb-6">
        <p className="text-sm text-slate-500 mb-2">Conversation about your listing:</p>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
            <img 
                src={listing.imageUrl} 
                alt={listing.cropType} 
                className="w-20 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
            />
            <div className="flex-grow text-left">
                <h3 className="text-xl font-bold text-slate-800">{listing.cropType}</h3>
                <div className="flex items-center text-sm text-slate-500 my-1">
                    <FarmerIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                    <span>Listed by: {listing.farmerName}</span>
                </div>
                <p className="text-green-700 font-bold">
                    ₦{listing.pricePerKg.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ kg</span>
                </p>
                 <p className="text-sm text-slate-600">{listing.quantityKg} kg available</p>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                    <LocationMarkerIcon className="h-4 w-4 mr-1 text-slate-400" />
                    <span>{listing.location}</span>
                </div>
            </div>
        </div>
      </div>

      <ChatInterface
        chatHistory={chatHistory}
        isChatLoading={isChatLoading}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};