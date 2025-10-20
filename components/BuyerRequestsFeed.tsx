import React from 'react';
import type { BuyerRequest, FarmerProfile } from '../types';
import { ClipboardListIcon, LocationMarkerIcon, UserCircleIcon, UserGroupIcon } from './IconComponents';

const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 2) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const RequestCard: React.FC<{ request: BuyerRequest, onRespond: () => void; onFormCooperative: () => void; farmerProfile: FarmerProfile }> = ({ request, onRespond, onFormCooperative, farmerProfile }) => {
    const hasResponded = request.responses.some(r => r.farmerName === farmerProfile.name);
    
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-5 flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-800">{request.cropType}</h3>
                    <span className="text-xs text-slate-500 flex-shrink-0">{timeAgo(request.createdAt)}</span>
                </div>
                <p className="text-green-700 font-bold text-lg">
                    {request.quantityKg} kg <span className="text-sm font-normal text-slate-500">needed</span>
                </p>
                <div className="flex items-center text-sm text-slate-500 my-2 gap-4">
                     <span className="flex items-center gap-1.5">
                        <UserCircleIcon className="h-4 w-4 text-slate-400" />
                        {request.buyerName}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <LocationMarkerIcon className="h-4 w-4 text-slate-400" />
                        {request.location}
                    </span>
                </div>
                 {request.details && <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md mt-2">"{request.details}"</p>}
            </div>
             <div className="flex-shrink-0 flex sm:flex-col items-center justify-between sm:justify-start gap-2">
                 <div className="flex sm:flex-col gap-2 w-full">
                    <button 
                        onClick={onRespond}
                        disabled={hasResponded}
                        className="w-full bg-green-600 text-white font-bold py-2.5 px-6 rounded-full text-center hover:bg-green-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed text-sm"
                    >
                        {hasResponded ? 'Offer Sent' : 'Make Offer'}
                    </button>
                    <button
                        onClick={onFormCooperative}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-full text-center hover:bg-blue-700 transition-colors text-sm"
                        >
                        <UserGroupIcon className="h-4 w-4" />
                        Form Cooperative
                    </button>
                </div>
                 <span className="text-xs text-slate-500 mt-1">{request.responses.length} offer(s) so far</span>
            </div>
        </div>
    );
}

interface BuyerRequestsFeedProps {
    requests: BuyerRequest[];
    onRespond: (request: BuyerRequest) => void;
    onFormCooperative: (request: BuyerRequest) => void;
    farmerProfile: FarmerProfile;
}

export const BuyerRequestsFeed: React.FC<BuyerRequestsFeedProps> = ({ requests, onRespond, onFormCooperative, farmerProfile }) => {
    return (
        <div className="animate-fade-in space-y-6">
            {requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map(req => (
                        <RequestCard 
                            key={req.id} 
                            request={req}
                            onRespond={() => onRespond(req)}
                            onFormCooperative={() => onFormCooperative(req)}
                            farmerProfile={farmerProfile}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-slate-200">
                    <ClipboardListIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No Buyer Requests Yet</h3>
                    <p className="text-slate-500 mt-2">
                        Check back soon to find new sales opportunities from buyers.
                    </p>
                </div>
            )}
        </div>
    );
};