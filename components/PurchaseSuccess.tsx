import React from 'react';
import type { Listing } from '../types';
import { CheckCircleIcon, ShoppingBagIcon } from './IconComponents';

interface PurchaseSuccessProps {
    details: {
        listing: Omit<Listing, 'id' | 'imageUrl'>;
        quantity: number;
    };
    onDone: () => void;
}

export const PurchaseSuccess: React.FC<PurchaseSuccessProps> = ({ details, onDone }) => {
    const { listing, quantity } = details;
    const totalPrice = (listing.pricePerKg * quantity).toLocaleString();

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Purchase Confirmed!</h2>
            <p className="text-slate-600 mb-8">The farmer has been notified. They will contact you shortly to arrange pickup or delivery.</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left max-w-lg mx-auto mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <ShoppingBagIcon className="h-6 w-6 mr-3 text-green-600" />
                    Your Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Item:</span>
                        <span className="font-medium text-slate-800">{listing.cropType} from {listing.farmerName}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-600">Quantity:</span>
                        <span className="font-medium text-slate-800">{quantity} kg</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-600">Price per kg:</span>
                        <span className="font-medium text-slate-800">₦{listing.pricePerKg.toLocaleString()}</span>
                    </div>
                     <hr className="my-2 border-slate-200" />
                     <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-slate-800">Total Price:</span>
                        <span className="font-bold text-green-700">₦{totalPrice}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onDone}
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
            >
                Back to Marketplace
            </button>
        </div>
    );
};