import React from 'react';
// FIX: Import FarmerProfile type
import type { Listing, ChatMessage, FarmerProfile } from '../types';
import { ChatInterface } from './ChatInterface';
import { LocationMarkerIcon, ArrowLeftIcon, ShoppingBagIcon, FarmerIcon } from './IconComponents';

interface BuyerChatViewProps {
  listing: Listing;
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void;
  onMakeOffer: () => void;
  // FIX: Add farmerProfile prop to match usage in App.tsx
  farmerProfile: FarmerProfile | null;
}

export const BuyerChatView: React.FC<BuyerChatViewProps> = ({
  listing,
  chatHistory,
  isChatLoading,
  onSendMessage,
  onBack,
  onMakeOffer,
  farmerProfile,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-green-700 font-medium transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Marketplace
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 mb-6">
        <p className="text-sm text-slate-500 mb-2">You are inquiring about:</p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <img 
                src={listing.imageUrl} 
                alt={listing.cropType} 
                className="w-20 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
            />
            <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-800">{listing.cropType}</h3>
                <div className="flex items-center justify-center sm:justify-start text-sm text-slate-500 my-1">
                    <FarmerIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                    <span>{listing.farmerName}</span>
                </div>
                <p className="text-green-700 font-bold">
                    ₦{listing.pricePerKg.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ kg</span>
                </p>
                <div className="flex items-center justify-center sm:justify-start text-sm text-slate-500 mt-1">
                    <LocationMarkerIcon className="h-4 w-4 mr-1 text-slate-400" />
                    <span>{listing.location}</span>
                </div>
            </div>
             <button
                onClick={onMakeOffer}
                className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full text-md shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Make an Offer
            </button>
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
