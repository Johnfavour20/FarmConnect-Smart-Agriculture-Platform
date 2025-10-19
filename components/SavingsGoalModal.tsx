import React, { useState } from 'react';
import { TrophyIcon } from './IconComponents';

interface SavingsGoalModalProps {
    onClose: () => void;
    onAddGoal: (name: string, targetAmount: number) => void;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({ onClose, onAddGoal }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && parseFloat(targetAmount) > 0) {
            onAddGoal(name, parseFloat(targetAmount));
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
                    <TrophyIcon className="h-7 w-7 text-green-600"/>
                    Create a Savings Goal
                </h2>
                <p className="text-slate-500 mb-6 text-sm">Set a target to save for big purchases like seeds, equipment, or land.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="goalName" className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                        <input type="text" id="goalName" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Fertilizer for Next Season" className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                     <div>
                        <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-700 mb-1">Target Amount (₦)</label>
                        <input type="number" id="targetAmount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required placeholder="e.g., 50000" min="1" className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                     <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-slate-600 font-medium py-2 px-6 rounded-full hover:bg-slate-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                            Start Saving
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};