import React, { useState } from 'react';
import type { Transaction, TransactionType, ExpenseCategory, IncomeCategory, TransactionCategory } from '../types';

interface TransactionModalProps {
    onClose: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Seeds', 'Fertilizer', 'Pesticides', 'Labor', 'Equipment', 'Transport', 'Other'];
const INCOME_CATEGORIES: IncomeCategory[] = ['Marketplace Sale', 'Local Sale', 'Other'];

export const TransactionModal: React.FC<TransactionModalProps> = ({ onClose, onAddTransaction }) => {
    const [type, setType] = useState<TransactionType>('expense');
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // a YYYY-MM-DD string
        description: '',
        amount: '',
        category: ''
    });

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        setFormData(prev => ({ ...prev, category: '' })); // Reset category on type change
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(formData.description && formData.amount && formData.date && formData.category) {
            onAddTransaction({
                type,
                date: new Date(formData.date).getTime(),
                description: formData.description,
                amount: parseFloat(formData.amount),
                category: formData.category as TransactionCategory
            });
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-green-800 mb-4">Add Transaction</h2>
                
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 rounded-full mb-6">
                    <button 
                        onClick={() => handleTypeChange('expense')}
                        className={`py-2 rounded-full font-bold text-sm transition-colors ${type === 'expense' ? 'bg-red-500 text-white shadow' : 'text-slate-600 hover:bg-slate-300'}`}
                    >
                        Expense
                    </button>
                    <button 
                        onClick={() => handleTypeChange('income')}
                        className={`py-2 rounded-full font-bold text-sm transition-colors ${type === 'income' ? 'bg-green-600 text-white shadow' : 'text-slate-600 hover:bg-slate-300'}`}
                    >
                        Income
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} required placeholder="e.g., Bag of NPK fertilizer" className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required placeholder="e.g., 15000" min="0" className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
                        </div>
                    </div>

                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} required className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500">
                            <option value="" disabled>Select a category</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                     <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-slate-600 font-medium py-2 px-6 rounded-full hover:bg-slate-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                            Save Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
