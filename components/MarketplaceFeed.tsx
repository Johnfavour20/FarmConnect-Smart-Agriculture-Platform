import React, { useMemo } from 'react';
// FIX: Import FarmerProfile type
import type { Listing, FarmerProfile } from '../types';
import { MarketplaceIcon, LocationMarkerIcon, ChatBubbleIcon, FilterIcon, FarmerIcon, MegaphoneIcon } from './IconComponents';

interface MarketplaceFeedProps {
    allListings: Listing[];
    filteredListings: Listing[];
    onContactFarmer: (listing: Listing) => void;
    filters: { cropType: string; location: string };
    onFilterChange: React.Dispatch<React.SetStateAction<{ cropType: string; location: string }>>;
    onPostRequest: () => void;
    // FIX: Add missing props for pagination and profile
    visibleCount: number;
    onLoadMore: () => void;
    farmerProfile: FarmerProfile | null;
}

const FilterBar: React.FC<{
    listings: Listing[];
    filters: { cropType: string; location: string };
    onFilterChange: (filters: { cropType: string; location: string }) => void;
}> = ({ listings, filters, onFilterChange }) => {
    
    const cropTypes = useMemo(() => {
        const uniqueTypes = new Set(listings.map(l => l.cropType));
        return ['all', ...Array.from(uniqueTypes).sort()];
    }, [listings]);

    const handleCropTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, cropType: e.target.value });
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, location: e.target.value });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-8 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center text-slate-600 font-semibold w-full sm:w-auto">
                <FilterIcon className="h-5 w-5 mr-2"/>
                <span>Filter by:</span>
            </div>
            <div className="w-full sm:w-1/3">
                <label htmlFor="cropTypeFilter" className="sr-only">Crop Type</label>
                <select 
                    id="cropTypeFilter"
                    value={filters.cropType}
                    onChange={handleCropTypeChange}
                    className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 text-sm"
                >
                    <option value="all">All Crop Types</option>
                    {cropTypes.filter(t => t !== 'all').map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
             <div className="w-full sm:flex-1">
                <label htmlFor="locationFilter" className="sr-only">Location</label>
                <input 
                    type="text"
                    id="locationFilter"
                    placeholder="Search by city or market..."
                    value={filters.location}
                    onChange={handleLocationChange}
                    className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
            </div>
        </div>
    );
};


const ListingCard: React.FC<{ listing: Listing; onContact: () => void }> = ({ listing, onContact }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
            <img src={listing.imageUrl} alt={listing.cropType} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-800">{listing.cropType}</h3>
                
                <div className="flex items-center text-sm text-slate-500 my-2">
                    <FarmerIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                    <span>{listing.farmerName}</span>
                </div>

                <p className="text-green-700 font-bold text-lg">
                    ₦{listing.pricePerKg} <span className="text-sm font-normal text-slate-500">/ kg</span>
                </p>
                <p className="text-sm text-slate-600 mb-3">{listing.quantityKg} kg available</p>
                
                <div className="flex items-center text-sm text-slate-500 mb-4">
                    <LocationMarkerIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                    <span>{listing.location}</span>
                </div>

                <button 
                    className="w-full mt-auto bg-green-600 text-white font-bold py-2.5 px-4 rounded-full text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    onClick={onContact}
                >
                    <ChatBubbleIcon className="h-5 w-5" />
                    Contact Farmer
                </button>
            </div>
        </div>
    );
};

export const MarketplaceFeed: React.FC<MarketplaceFeedProps> = ({ allListings, filteredListings, onContactFarmer, filters, onFilterChange, onPostRequest, visibleCount, onLoadMore, farmerProfile }) => {
    return (
        <div className="animate-fade-in">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-green-800">Browse Fresh Produce</h2>
                <p className="text-slate-600 mt-2">
                    Discover quality produce directly from local farmers.
                </p>
            </div>
            
            {allListings.length > 0 ? (
                <>
                    <FilterBar listings={allListings} filters={filters} onFilterChange={onFilterChange} />
                     <div className="mb-8 bg-blue-50 border border-blue-200 text-center p-4 rounded-xl">
                        <p className="text-sm text-blue-800 font-medium">Can't find what you're looking for?</p>
                        <button 
                            onClick={onPostRequest}
                            className="mt-2 inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-5 rounded-full text-sm shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
                        >
                            <MegaphoneIcon className="h-4 w-4"/>
                            Post a Request
                        </button>
                    </div>
                    {filteredListings.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredListings.slice(0, visibleCount).map(listing => (
                                    <ListingCard 
                                        key={listing.id} 
                                        listing={listing}
                                        onContact={() => onContactFarmer(listing)}
                                    />
                                ))}
                            </div>
                            {filteredListings.length > visibleCount && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={onLoadMore}
                                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        Load More Listings
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                         <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-700">No Listings Found</h3>
                            <p className="text-slate-500 mt-2">
                                Try adjusting your filters or check back later.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-slate-200">
                    <MarketplaceIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">The Marketplace is Empty</h3>
                    <p className="text-slate-500 mt-2">
                        Check back soon for fresh produce listings from our farmers!
                    </p>
                </div>
            )}
        </div>
    );
};
