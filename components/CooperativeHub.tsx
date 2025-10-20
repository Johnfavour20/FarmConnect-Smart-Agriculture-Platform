import React, { useMemo } from 'react';
import type { BuyerRequest, FarmerProfile } from '../types';
import { UserGroupIcon, TruckIcon, SparklesIcon } from './IconComponents';
import { Spinner } from './Spinner';

const formatMarkdown = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/(\r\n|\n|\r)/g, '<br />')
        .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');

    if (html.includes('<li>')) {
      html = `<ul>${html.replace(/<br \/>/g, '')}</ul>`.replace(/<\/li><br \/><ul>/g, '</li></ul><ul>');
    }
    return { __html: html };
};

const CooperativeRequestCard: React.FC<{
    request: BuyerRequest;
    onJoin: () => void;
    onPlanLogistics: () => void;
    isPlanning: boolean;
}> = ({ request, onJoin, onPlanLogistics, isPlanning }) => {
    
    const pledgedAmount = useMemo(() => {
        return request.pledges?.reduce((sum, p) => sum + p.quantityKg, 0) || 0;
    }, [request.pledges]);

    const percentage = Math.min((pledgedAmount / request.quantityKg) * 100, 100);
    const isFulfilled = pledgedAmount >= request.quantityKg;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200 space-y-4">
            <div>
                <h3 className="text-xl font-bold text-slate-800">{request.quantityKg}kg of {request.cropType}</h3>
                <p className="text-sm text-slate-500">For: {request.buyerName} in {request.location}</p>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-semibold text-slate-700">Pledged: {pledgedAmount.toLocaleString()} / {request.quantityKg.toLocaleString()} kg</span>
                    <span className="font-bold text-green-700">{Math.round(percentage)}% Complete</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                    <div className="bg-green-600 h-4 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>

            {request.pledges && request.pledges.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Contributors:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {request.pledges.map(p => (
                             <div key={p.farmerName} className="flex justify-between items-center bg-slate-50 p-2 rounded-md text-sm">
                                <span>{p.farmerName} ({p.farmerLocation})</span>
                                <span className="font-bold">{p.quantityKg} kg</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {request.logisticsPlan ? (
                 <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg">
                    <h3 className="font-bold mb-2 flex items-center gap-2"><TruckIcon className="h-5 w-5"/> AI Logistics Plan</h3>
                    <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={formatMarkdown(request.logisticsPlan)} />
                </div>
            ) : (
                <div className="flex justify-end gap-2 pt-2">
                    {!isFulfilled ? (
                        <button onClick={onJoin} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-full text-sm shadow-md hover:bg-blue-700">
                            Join & Pledge
                        </button>
                    ) : (
                        <button onClick={onPlanLogistics} disabled={isPlanning} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2.5 px-5 rounded-full text-sm shadow-md hover:bg-green-700 disabled:bg-slate-400">
                            {isPlanning ? <><Spinner/> Planning...</> : <><SparklesIcon className="h-4 w-4"/> Plan Logistics with AI</>}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


interface CooperativeHubProps {
    requests: BuyerRequest[];
    onJoinCooperative: (request: BuyerRequest) => void;
    onPlanLogistics: (requestId: string) => void;
    isPlanningLogistics: boolean;
    farmerProfile: FarmerProfile;
}

export const CooperativeHub: React.FC<CooperativeHubProps> = ({ requests, onJoinCooperative, onPlanLogistics, isPlanningLogistics, farmerProfile }) => {
    const cooperativeRequests = useMemo(() => {
        return requests.filter(r => r.isCooperative).sort((a,b) => b.createdAt - a.createdAt);
    }, [requests]);

    return (
        <div className="animate-fade-in space-y-6">
            {cooperativeRequests.length > 0 ? (
                <div className="space-y-4">
                    {cooperativeRequests.map(req => (
                        <CooperativeRequestCard 
                            key={req.id}
                            request={req}
                            onJoin={() => onJoinCooperative(req)}
                            onPlanLogistics={() => onPlanLogistics(req.id)}
                            isPlanning={isPlanningLogistics}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-slate-200">
                    <UserGroupIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No Active Cooperatives</h3>
                    <p className="text-slate-500 mt-2">
                        You can start a new cooperative from the 'Buyer Requests' board.
                    </p>
                </div>
            )}
        </div>
    );
};
