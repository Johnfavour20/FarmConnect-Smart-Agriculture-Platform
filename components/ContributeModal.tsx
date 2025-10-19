import React, { useState } from 'react';
import type { SavingsGoal } from '../types';
import { PlusCircleIcon } from './IconComponents';

interface ContributeModalProps {
    goal: SavingsGoal;
    onClose: () => void;
    onContribute: (goalId: string, amount: number) => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({ goal, onClose, onContribute }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const maxContribution = goal.targetAmount - goal.currentAmount;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value);
        if (parseFloat(value) > maxContribution) {
            setError(`Max contribution is ₦${maxContribution.toLocaleString()}`);
        } else {
            setError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contributionAmount = parseFloat(amount);
        if (!error && contributionAmount > 0) {
            onContribute(goal.id, contributionAmount);
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
                <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-3">
                    <PlusCircleIcon className="h-7 w-7 text-green-600"/>
                    Contribute to Goal
                </h2>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-slate-700">Goal: {goal.name}</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 my-2">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 text-right">₦{goal.currentAmount.toLocaleString()} / ₦{goal.targetAmount.toLocaleString()}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="contributionAmount" className="block text-sm font-medium text-slate-700 mb-1">Amount to Add (₦)</label>
                        <input type="number" id="contributionAmount" value={amount} onChange={handleChange} required placeholder="e.g., 5000" min="1" max={maxContribution} className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                     <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-slate-600 font-medium py-2 px-6 rounded-full hover:bg-slate-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!!error || !amount} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400">
                            Add Funds
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};