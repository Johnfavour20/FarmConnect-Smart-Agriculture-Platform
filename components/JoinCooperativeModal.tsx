import React, { useState, useMemo } from 'react';
import type { BuyerRequest } from '../types';
import { UserGroupIcon } from './IconComponents';

interface JoinCooperativeModalProps {
    request: BuyerRequest;
    onClose: () => void;
    onConfirm: (requestId: string, quantity: number) => void;
}

export const JoinCooperativeModal: React.FC<JoinCooperativeModalProps> = ({ request, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState<number | ''>('');
    const [error, setError] = useState<string>('');
    
    const pledgedAmount = useMemo(() => {
        return request.pledges?.reduce((sum, p) => sum + p.quantityKg, 0) || 0;
    }, [request.pledges]);

    const remainingAmount = request.quantityKg - pledgedAmount;

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.valueAsNumber;
        if (isNaN(value) || value <= 0) {
            setQuantity('');
            setError('Quantity must be greater than 0.');
        } else if (value > remainingAmount) {
            setQuantity(value);
            setError(`You cannot pledge more than the remaining ${remainingAmount}kg.`);
        } else {
            setQuantity(value);
            setError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity && !error) {
            onConfirm(request.id, quantity);
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
                    <UserGroupIcon className="h-7 w-7 text-green-600"/>
                    Join Cooperative
                </h2>
                <p className="text-slate-500 mb-6 text-sm">Contribute your produce to help fulfill this order with other farmers.</p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-slate-700">Order for {request.cropType}:</p>
                    <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold text-slate-800">{request.quantityKg}kg</span>
                        <span className="text-sm text-amber-700 font-semibold">{remainingAmount.toLocaleString()}kg remaining</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">How much will you pledge? (kg)</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                            max={remainingAmount}
                            min="1"
                            step="0.1"
                            required
                            placeholder={`Max ${remainingAmount} kg`}
                            className="w-full border-slate-300 rounded-lg p-3 text-lg focus:ring-green-500 focus:border-green-500"
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-slate-600 font-medium py-2 px-6 rounded-full hover:bg-slate-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!!error || !quantity} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-slate-400">
                            Pledge Produce
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};