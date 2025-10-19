import React, { useState, useMemo } from 'react';
import type { BuyerRequest, Listing } from '../types';
import { SendIcon } from './IconComponents';

interface FarmerResponseModalProps {
    request: BuyerRequest;
    farmerListings: Listing[];
    onClose: () => void;
    onSendOffer: (listingId: string) => void;
}

const ListingSelectItem: React.FC<{ listing: Listing, isSelected: boolean, onSelect: () => void }> = ({ listing, isSelected, onSelect }) => {
    return (
        <div 
            onClick={onSelect}
            className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}
        >
            <img src={listing.imageUrl} alt={listing.cropType} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
            <div className="flex-grow">
                <p className="font-semibold text-sm text-slate-800">{listing.cropType}</p>
                <p className="text-xs text-slate-600">
                    {listing.quantityKg} kg available at ₦{listing.pricePerKg}/kg
                </p>
            </div>
             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-green-600 bg-green-600' : 'border-slate-400'}`}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
        </div>
    );
};

export const FarmerResponseModal: React.FC<FarmerResponseModalProps> = ({ request, farmerListings, onClose, onSendOffer }) => {
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

    const relevantListings = useMemo(() => {
        return farmerListings.filter(l => l.cropType.toLowerCase() === request.cropType.toLowerCase());
    }, [farmerListings, request.cropType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedListingId) {
            onSendOffer(selectedListingId);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                 <h2 className="text-2xl font-bold text-green-800 mb-2 flex items-center gap-3">
                    Respond to Request
                </h2>
                <p className="text-slate-500 mb-6 text-sm">Select one of your active listings to send as an offer to the buyer.</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-slate-700">Buyer's Request:</p>
                    <p className="text-lg font-bold text-slate-800">{request.quantityKg}kg of {request.cropType}</p>
                    <p className="text-xs text-slate-500">from {request.buyerName} in {request.location}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-1">Your Relevant Listings:</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {relevantListings.length > 0 ? (
                            relevantListings.map(listing => (
                                <ListingSelectItem 
                                    key={listing.id}
                                    listing={listing}
                                    isSelected={selectedListingId === listing.id}
                                    onSelect={() => setSelectedListingId(listing.id)}
                                />
                            ))
                        ) : (
                            <div className="text-center p-4 bg-slate-100 rounded-lg">
                                <p className="text-sm text-slate-600">You have no active listings for "{request.cropType}".</p>
                                <p className="text-xs text-slate-500 mt-1">You can add a new listing from your dashboard.</p>
                            </div>
                        )}
                    </div>
                     <div className="flex justify-end items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-600 font-medium py-2 px-6 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedListingId}
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Send Offer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};