import React, { useState } from 'react';
import type { BuyerRequest } from '../types';
import { MegaphoneIcon } from './IconComponents';

interface PostRequestModalProps {
    onClose: () => void;
    onPostRequest: (requestData: Omit<BuyerRequest, 'id' | 'createdAt' | 'responses' | 'buyerName'>, name: string) => void;
    currentBuyerName: string;
}

export const PostRequestModal: React.FC<PostRequestModalProps> = ({ onClose, onPostRequest, currentBuyerName }) => {
    const [name, setName] = useState(currentBuyerName);
    const [formData, setFormData] = useState({
        cropType: '',
        quantityKg: '',
        location: '',
        details: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && formData.cropType.trim() && formData.quantityKg) {
            onPostRequest({
                cropType: formData.cropType,
                quantityKg: parseFloat(formData.quantityKg),
                location: formData.location,
                details: formData.details
            }, name);
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
                    <MegaphoneIcon className="h-7 w-7 text-green-600"/>
                    Post a Produce Request
                </h2>
                <p className="text-slate-500 mb-6 text-sm">Let farmers know what you're looking for. They'll be able to see this request and make offers.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="buyerName" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                        <input
                            type="text"
                            id="buyerName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name or business name"
                            required
                            className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="cropType" className="block text-sm font-medium text-slate-700 mb-1">Crop Type</label>
                            <input
                                type="text"
                                name="cropType"
                                id="cropType"
                                value={formData.cropType}
                                onChange={handleChange}
                                placeholder="e.g., Roma Tomatoes"
                                required
                                className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="quantityKg" className="block text-sm font-medium text-slate-700 mb-1">Quantity (kg)</label>
                            <input
                                type="number"
                                name="quantityKg"
                                id="quantityKg"
                                value={formData.quantityKg}
                                onChange={handleChange}
                                placeholder="e.g., 100"
                                required
                                min="1"
                                className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Your Location</label>
                        <input
                            type="text"
                            name="location"
                            id="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Surulere, Lagos"
                            required
                            className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="details" className="block text-sm font-medium text-slate-700 mb-1">Additional Details (Optional)</label>
                        <textarea
                            name="details"
                            id="details"
                            rows={3}
                            value={formData.details}
                            onChange={handleChange}
                            placeholder="e.g., Must be organic, looking for long-term supplier, urgent delivery needed."
                            className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                        />
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
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Post Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};