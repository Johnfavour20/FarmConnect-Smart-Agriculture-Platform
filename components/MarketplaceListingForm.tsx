import React, { useState, useEffect } from 'react';
import type { Diagnosis, Listing, FarmerProfile } from '../types';
import { SparklesIcon } from './IconComponents';
import { Spinner } from './Spinner';

interface MarketplaceListingFormProps {
    diagnosis: Diagnosis;
    imageFile: File;
    onPublish: (listingData: Omit<Listing, 'id' | 'imageUrl' | 'farmerName'>) => void;
    onCancel: () => void;
    farmerProfile: FarmerProfile;
    // AI Price Suggestion props
    onGetPriceSuggestion: (cropType: string, location: string) => void;
    priceSuggestion: string | null;
    isPriceSuggestionLoading: boolean;
    priceSuggestionError: string | null;
    onClearPriceSuggestion: () => void;
}

const PriceSuggestionResult: React.FC<{ 
    isLoading: boolean;
    suggestion: string | null;
    error: string | null;
}> = ({ isLoading, suggestion, error }) => {
    if(isLoading) {
        return <div className="text-xs text-slate-500 flex items-center gap-2 mt-2"><Spinner/> Getting suggestion...</div>;
    }
    if (error) {
        return <p className="text-xs text-red-600 mt-2">{error}</p>;
    }
    if (suggestion) {
        return (
            <div className="text-xs text-green-700 bg-green-50 p-2 rounded-md mt-2 flex items-start gap-2">
                <SparklesIcon className="h-4 w-4 flex-shrink-0 mt-0.5"/>
                <p>{suggestion}</p>
            </div>
        )
    }
    return null;
}

export const MarketplaceListingForm: React.FC<MarketplaceListingFormProps> = ({ 
    diagnosis, 
    imageFile, 
    onPublish, 
    onCancel, 
    farmerProfile,
    onGetPriceSuggestion,
    priceSuggestion,
    isPriceSuggestionLoading,
    priceSuggestionError,
    onClearPriceSuggestion
}) => {
    const [imagePreview, setImagePreview] = useState<string>('');
    const [formData, setFormData] = useState({
        quantityKg: '',
        pricePerKg: '',
        location: farmerProfile.location || '',
        description: ''
    });

    useEffect(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(imageFile);
    }, [imageFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'location') {
            onClearPriceSuggestion();
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGetSuggestionClick = () => {
        onGetPriceSuggestion(diagnosis.cropType, formData.location);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPublish({
            cropType: diagnosis.cropType,
            quantityKg: parseFloat(formData.quantityKg) || 0,
            pricePerKg: parseFloat(formData.pricePerKg) || 0,
            location: formData.location,
            description: formData.description
        });
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Create Marketplace Listing</h2>
            <p className="text-slate-600 mb-6">Your crop is healthy! Let's get it listed for sale.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                         <img src={imagePreview} alt="Crop to list" className="rounded-xl w-full h-auto object-contain shadow-md" />
                    </div>
                    <div className="flex-grow space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="cropType" className="block text-sm font-medium text-slate-700 mb-1">Crop Type</label>
                                <input
                                    type="text"
                                    id="cropType"
                                    value={diagnosis.cropType}
                                    disabled
                                    className="w-full bg-slate-100 border-slate-300 rounded-lg p-2 text-slate-600 cursor-not-allowed"
                                />
                            </div>
                             <div>
                                <label htmlFor="farmerName" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    name="farmerName"
                                    id="farmerName"
                                    value={farmerProfile.name}
                                    disabled
                                    className="w-full bg-slate-100 border-slate-300 rounded-lg p-2 text-slate-600 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="quantityKg" className="block text-sm font-medium text-slate-700 mb-1">Quantity (kg)</label>
                                <input
                                    type="number"
                                    name="quantityKg"
                                    id="quantityKg"
                                    value={formData.quantityKg}
                                    onChange={handleChange}
                                    placeholder="Enter quantity in kilograms (e.g., 50)"
                                    required
                                    min="0"
                                    step="any"
                                    className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="pricePerKg" className="block text-sm font-medium text-slate-700">Price per kg (₦)</label>
                                    <button 
                                        type="button"
                                        onClick={handleGetSuggestionClick}
                                        disabled={isPriceSuggestionLoading || !formData.location}
                                        className="text-xs font-semibold text-green-600 hover:text-green-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <SparklesIcon className="h-3.5 w-3.5"/>
                                        Get Suggestion
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    name="pricePerKg"
                                    id="pricePerKg"
                                    value={formData.pricePerKg}
                                    onChange={handleChange}
                                    placeholder="Enter price per kg in Naira (e.g., 200)"
                                    required
                                    min="0"
                                    step="any"
                                    className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <PriceSuggestionResult isLoading={isPriceSuggestionLoading} suggestion={priceSuggestion} error={priceSuggestionError} />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter market or city (e.g., Ikeja, Lagos)"
                                required
                                className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                     <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="E.g., Freshly harvested, organic, ready for pickup."
                        className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                 <div className="flex justify-end items-center gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-slate-600 font-medium py-2 px-6 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Publish Listing
                    </button>
                </div>
            </form>
        </div>
    );
};