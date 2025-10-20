import React, { useState } from 'react';
import { WalletIcon } from './IconComponents';

interface PayoutModalProps {
    balance: number;
    onClose: () => void;
    onConfirm: (amount: number, method: 'Bank Transfer' | 'Mobile Money', destination: string) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({ balance, onClose, onConfirm }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [method, setMethod] = useState<'Bank Transfer' | 'Mobile Money'>('Bank Transfer');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState('');

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.valueAsNumber;
        if (isNaN(value) || value <= 0) {
            setAmount('');
            setError('Amount must be greater than 0.');
        } else if (value > balance) {
            setAmount(value);
            setError(`Amount cannot exceed your balance of ₦${balance.toLocaleString()}`);
        } else {
            setAmount(value);
            setError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount && !error && destination.trim()) {
            onConfirm(amount, method, destination.trim());
            onClose();
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
                    <WalletIcon className="h-7 w-7 text-green-600"/>
                    Withdraw Funds
                </h2>
                <p className="text-slate-500 mb-6 text-sm">
                    Available Balance: <span className="font-bold text-green-700">₦{balance.toLocaleString()}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="payoutAmount" className="block text-sm font-medium text-slate-700 mb-1">Amount to Withdraw (₦)</label>
                        <input
                            type="number"
                            id="payoutAmount"
                            value={amount}
                            onChange={handleAmountChange}
                            max={balance}
                            min="1"
                            required
                            placeholder="e.g., 10000"
                            className="w-full border-slate-300 rounded-lg p-3 text-lg focus:ring-green-500 focus:border-green-500"
                        />
                         {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payout Method</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 rounded-full">
                            <button type="button" onClick={() => setMethod('Bank Transfer')} className={`py-2 rounded-full font-bold text-sm transition-colors ${method === 'Bank Transfer' ? 'bg-green-600 text-white shadow' : 'text-slate-600 hover:bg-slate-300'}`}>Bank Transfer</button>
                            <button type="button" onClick={() => setMethod('Mobile Money')} className={`py-2 rounded-full font-bold text-sm transition-colors ${method === 'Mobile Money' ? 'bg-green-600 text-white shadow' : 'text-slate-600 hover:bg-slate-300'}`}>Mobile Money</button>
                        </div>
                    </div>

                     <div>
                        <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-1">
                            {method === 'Bank Transfer' ? 'Bank Account Number' : 'Mobile Money Number'}
                        </label>
                        <input
                            type="text"
                            id="destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            required
                            placeholder={method === 'Bank Transfer' ? 'e.g., 0123456789' : 'e.g., 08012345678'}
                            className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-slate-600 font-medium py-2 px-6 rounded-full hover:bg-slate-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!!error || !amount || !destination} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400">
                            Confirm Withdrawal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
