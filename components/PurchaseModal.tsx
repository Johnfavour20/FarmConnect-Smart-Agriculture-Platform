import React, { useState, useMemo } from 'react';
import type { Listing } from '../types';
import { ShoppingBagIcon } from './IconComponents';

interface PurchaseModalProps {
    listing: Listing;
    onClose: () => void;
    onConfirm: (listingId: string, quantity: number) => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ listing, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState<number>(1);
    const [error, setError] = useState<string>('');

    const totalPrice = useMemo(() => {
        return (quantity * listing.pricePerKg).toLocaleString();
    }, [quantity, listing.pricePerKg]);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.valueAsNumber;
        if(isNaN(value) || value <= 0) {
            setQuantity(0);
            setError('Quantity must be greater than 0.');
        } else if (value > listing.quantityKg) {
            setQuantity(listing.quantityKg);
            setError(`Only ${listing.quantityKg} kg available.`);
        } else {
            setQuantity(value);
            setError('');
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity > 0 && quantity <= listing.quantityKg) {
            onConfirm(listing.id, quantity);
        } else {
             setError('Please enter a valid quantity.');
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-3">
                    <ShoppingBagIcon className="h-7 w-7 text-green-600"/>
                    Confirm Your Purchase
                </h2>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4 items-center mb-6">
                     <img 
                        src={listing.imageUrl} 
                        alt={listing.cropType} 
                        className="w-16 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
                    />
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{listing.cropType}</h3>
                        <p className="text-slate-600 text-sm">{listing.quantityKg} kg available</p>
                        <p className="text-green-700 font-bold text-sm">
                            ₦{listing.pricePerKg.toLocaleString()} / kg
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Quantity to Purchase (kg)</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                            max={listing.quantityKg}
                            min="1"
                            step="0.1" // Allow fractional kgs
                            required
                            className="w-full border-slate-300 rounded-lg p-3 text-lg focus:ring-green-500 focus:border-green-500"
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-green-800">Total Price</p>
                        <p className="text-3xl font-bold text-green-800">₦{totalPrice}</p>
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
                            disabled={!!error || quantity <= 0}
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            Confirm Purchase
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
