import React from 'react';
import type { Listing } from '../types';
import { CheckCircleIcon, MarketplaceIcon, TagIcon } from './IconComponents';

interface ListingSuccessProps {
    listing: Listing;
    onReset: () => void;
}

export const ListingSuccess: React.FC<ListingSuccessProps> = ({ listing, onReset }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Listing Published Successfully!</h2>
            <p className="text-slate-600 mb-8">Your produce is now visible to buyers on the FarmConnect marketplace.</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left max-w-lg mx-auto mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <MarketplaceIcon className="h-6 w-6 mr-3 text-green-600" />
                    Your Listing Summary
                </h3>
                <div className="flex gap-4">
                    <img src={listing.imageUrl} alt={listing.cropType} className="w-24 h-24 object-cover rounded-lg shadow-sm" />
                    <div className="space-y-2 text-sm">
                        <p><strong>Crop:</strong> {listing.cropType}</p>
                        <p><strong>Quantity:</strong> {listing.quantityKg} kg</p>
                        <p><strong>Price:</strong> ₦{listing.pricePerKg} per kg</p>
                        <p><strong>Location:</strong> {listing.location}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={onReset}
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
            >
                Diagnose Another Crop
            </button>
        </div>
    );
};
