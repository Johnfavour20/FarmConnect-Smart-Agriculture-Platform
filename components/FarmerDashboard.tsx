import React, { useState, useEffect, useMemo } from 'react';
import type { Listing, AllChats, Post, FarmerProfile, Comment, WeatherAdvice, Reminder, GrowthPlanTask, GrowthPlanTaskAction, Transaction } from '../types';
import { MarketplaceIcon, ChatBubbleIcon, EditIcon, TrashIcon, ExclamationTriangleIcon, TrendingUpIcon, BellIcon, UsersIcon, InformationCircleIcon, XIcon, CurrencyDollarIcon } from './IconComponents';
import { Spinner } from './Spinner';
import { WeatherWidget } from './WeatherWidget';
import { RemindersWidget } from './RemindersWidget';
import { GrowthPlanWidget } from './GrowthPlanWidget';

// --- Helper Types ---
type ActivityItem = {
    type: 'chat' | 'comment';
    id: string;
    listing?: Listing;
    post?: Post;
    commenterName?: string;
    timestamp: number;
};


// --- Helper Functions ---
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

const formatMarkdown = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
        .replace(/(\r\n|\n|\r)/g, '<br />');

    if (html.includes('<li>')) {
      html = `<ul>${html.replace(/<br \/>/g, '')}</ul>`.replace(/<\/li><br \/><ul>/g, '</li></ul><ul>');
    }
    return { __html: html };
};

// --- Sub-components ---

const DeleteConfirmationModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-fast">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Are you sure?</h3>
            <p className="text-slate-600 text-sm my-2">
                This action cannot be undone. All associated chat history will also be removed.
            </p>
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={onCancel}
                    className="w-full bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-full hover:bg-slate-300 transition-colors"
                >
                    Cancel
                </button>
                 <button
                    onClick={onConfirm}
                    className="w-full bg-red-600 text-white font-bold py-2.5 px-4 rounded-full hover:bg-red-700 transition-colors"
                >
                    Delete Listing
                </button>
            </div>
        </div>
    </div>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-green-800">{value}</p>
            <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
    </div>
);

const MarketPulseCard: React.FC<{
    analysis: string | null;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}> = ({ analysis, isLoading, error, onRefresh }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
                <TrendingUpIcon className="h-6 w-6 text-blue-500"/>
                <h3 className="text-lg font-bold text-slate-800">Market Pulse</h3>
            </div>
            <button 
                onClick={onRefresh} 
                disabled={isLoading}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
                {isLoading ? 'Loading...' : 'Refresh'}
            </button>
        </div>
        <div className="text-sm text-slate-600 space-y-2 prose prose-sm max-w-none">
            {isLoading && <div className="flex items-center gap-2"><Spinner /> Analyzing market data...</div>}
            {error && <p className="text-red-600">{error}</p>}
            {analysis && !isLoading && <div dangerouslySetInnerHTML={formatMarkdown(analysis)} />}
        </div>
    </div>
);

const ActivityFeedCard: React.FC<{ activities: ActivityItem[], onViewChat: (listing: Listing) => void }> = ({ activities, onViewChat }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
            <BellIcon className="h-6 w-6 text-amber-500"/>
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {activities.length > 0 ? activities.map(activity => (
                <div key={activity.id} className="text-sm flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'chat' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                         {activity.type === 'chat' ? <ChatBubbleIcon className="w-5 h-5 text-blue-600" /> : <UsersIcon className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div>
                        {activity.type === 'chat' && activity.listing && (
                            <p>New message on your <strong>{activity.listing.cropType}</strong> listing. 
                                <button onClick={() => onViewChat(activity.listing!)} className="font-bold text-blue-600 ml-1 hover:underline">View</button>
                            </p>
                        )}
                         {activity.type === 'comment' && activity.post && (
                            <p><strong>{activity.commenterName}</strong> commented on your post: "{activity.post.content.substring(0, 30)}...".
                            </p>
                        )}
                        <p className="text-xs text-slate-400">{timeAgo(activity.timestamp)}</p>
                    </div>
                </div>
            )) : (
                <p className="text-sm text-slate-500 text-center py-4">No new activity yet.</p>
            )}
        </div>
    </div>
);

// --- New Mobile-first Listing Card ---
const ListingRowCard: React.FC<{
    listing: Listing;
    hasUnread: boolean;
    onViewChat: (listing: Listing) => void;
    onEdit: (listing: Listing) => void;
    onDelete: (listingId: string) => void;
}> = ({ listing, hasUnread, onViewChat, onEdit, onDelete }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
            <img src={listing.imageUrl} alt={listing.cropType} className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-grow">
                <h4 className="font-bold text-slate-800">{listing.cropType}</h4>
                <p className="text-sm text-green-700 font-semibold">₦{listing.pricePerKg}/kg</p>
                <p className="text-xs text-slate-500">{listing.quantityKg} kg available</p>
            </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 mt-3 pt-3">
            <button onClick={() => onViewChat(listing)} className="font-medium text-blue-600 hover:bg-blue-50 p-2 rounded-full relative" title="View Chats">
                <ChatBubbleIcon className="h-5 w-5"/>
                {hasUnread && 
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                }
            </button>
            <button onClick={() => onEdit(listing)} className="font-medium text-green-600 hover:bg-green-50 p-2 rounded-full" title="Edit Listing"><EditIcon className="h-5 w-5"/></button>
            <button onClick={() => onDelete(listing.id)} className="font-medium text-red-600 hover:bg-red-50 p-2 rounded-full" title="Delete Listing"><TrashIcon className="h-5 w-5"/></button>
        </div>
    </div>
);


// --- Main Dashboard Component ---

interface FarmerDashboardProps {
    listings: Listing[];
    allChats: AllChats;
    allPosts: Post[];
    transactions: Transaction[];
    farmerProfile: FarmerProfile;
    onViewChat: (listing: Listing) => void;
    onEdit: (listing: Listing) => void;
    onDelete: (listingId: string) => void;
    // Market Pulse props
    onFetchMarketAnalysis: () => void;
    marketAnalysis: string | null;
    isMarketAnalysisLoading: boolean;
    marketAnalysisError: string | null;
    // Weather props
    weatherAdvice: WeatherAdvice | null;
    isWeatherLoading: boolean;
    weatherError: string | null;
    onFetchWeather: () => void;
    // Reminders props
    reminders: Reminder[];
    onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
    onToggleReminder: (reminderId: string) => void;
    onGetReminderSuggestion: () => Promise<Omit<Reminder, 'id' | 'isComplete' | 'dueDate'> | null>;
    // Growth Plan props
    growthPlanTasks: GrowthPlanTask[];
    isGrowthPlanLoading: boolean;
    growthPlanError: string | null;
    onFetchGrowthPlan: () => void;
    onCompleteGrowthPlanTask: (taskId: string, xp: number) => void;
    onNavigate: (view: any) => void;
}


export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ 
    listings, 
    allChats, 
    allPosts,
    transactions,
    farmerProfile,
    onViewChat, 
    onEdit, 
    onDelete,
    onFetchMarketAnalysis,
    marketAnalysis,
    isMarketAnalysisLoading,
    marketAnalysisError,
    weatherAdvice,
    isWeatherLoading,
    weatherError,
    onFetchWeather,
    reminders,
    onAddReminder,
    onToggleReminder,
    onGetReminderSuggestion,
    growthPlanTasks,
    isGrowthPlanLoading,
    growthPlanError,
    onFetchGrowthPlan,
    onCompleteGrowthPlanTask,
    onNavigate
}) => {
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);
    const [isAlertsVisible, setIsAlertsVisible] = useState(true);

    useEffect(() => {
        onFetchMarketAnalysis();
        onFetchGrowthPlan();
    }, []); 

    useEffect(() => {
        if (weatherAdvice?.alerts && weatherAdvice.alerts.length > 0) {
            setIsAlertsVisible(true);
        }
    }, [weatherAdvice]);


    const { unreadChatsCount, recentActivities, netProfit } = useMemo(() => {
        let unread = 0;
        const activities: ActivityItem[] = [];

        listings.forEach(listing => {
            const chatHistory = allChats[listing.id] || [];
            if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
                unread++;
                activities.push({
                    type: 'chat',
                    id: `chat-${listing.id}`,
                    listing: listing,
                    timestamp: Date.now() 
                });
            }
        });

        const farmerPosts = allPosts.filter(p => p.farmerName === farmerProfile.name);
        farmerPosts.forEach(post => {
            post.comments.forEach(comment => {
                if (comment.farmerName !== farmerProfile.name) {
                     activities.push({
                        type: 'comment',
                        id: comment.id,
                        post: post,
                        commenterName: comment.farmerName,
                        timestamp: comment.createdAt,
                    });
                }
            });
        });
        
        activities.sort((a, b) => b.timestamp - a.timestamp);

        const { totalIncome, totalExpenses } = transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else acc.totalExpenses += t.amount;
            return acc;
        }, { totalIncome: 0, totalExpenses: 0 });

        return { 
            unreadChatsCount: unread, 
            recentActivities: activities.slice(0, 5),
            netProfit: totalIncome - totalExpenses
        };

    }, [allChats, listings, allPosts, transactions, farmerProfile.name]);
    
    const mostSevereAlertType = useMemo(() => {
        if (!weatherAdvice?.alerts || weatherAdvice.alerts.length === 0) return null;
        return weatherAdvice.alerts.some(a => a.severity === 'warning') ? 'warning' : 'advisory';
    }, [weatherAdvice?.alerts]);

    const alertStyles = {
        warning: {
            container: 'bg-red-50 border-red-500 text-red-800',
            icon: <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600"/>,
            dismissHover: 'hover:bg-red-100'
        },
        advisory: {
            container: 'bg-blue-50 border-blue-500 text-blue-800',
            icon: <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600"/>,
            dismissHover: 'hover:bg-blue-100'
        }
    };

    const currentAlertStyle = mostSevereAlertType ? alertStyles[mostSevereAlertType] : null;


    return (
        <div className="animate-fade-in space-y-6">
            {isAlertsVisible && currentAlertStyle && weatherAdvice?.alerts && (
                <div className={`border-l-4 p-4 rounded-r-lg shadow-md relative ${currentAlertStyle.container}`} role="alert">
                    <button
                        onClick={() => setIsAlertsVisible(false)}
                        className={`absolute top-2 right-2 p-1 rounded-full ${currentAlertStyle.dismissHover}`}
                        aria-label="Dismiss alerts"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                    {weatherAdvice.alerts.map((alert, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                           <div className="flex items-center">
                             {alertStyles[alert.severity].icon}
                             <p className="font-bold">{alert.title}</p>
                           </div>
                           <p className="text-sm ml-7">{alert.message}</p>
                        </div>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Listings" value={listings.length} icon={<MarketplaceIcon className="h-6 w-6 text-green-600"/>} />
                <StatCard title="Unread Messages" value={unreadChatsCount} icon={<ChatBubbleIcon className="h-6 w-6 text-green-600"/>} />
                <StatCard title="Net Profit" value={`₦${netProfit.toLocaleString()}`} icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600"/>} />
                <StatCard title={`Level ${farmerProfile.level}`} value={`${farmerProfile.xp} XP`} icon={<UsersIcon className="h-6 w-6 text-green-600"/>} />
            </div>

            <GrowthPlanWidget
                tasks={growthPlanTasks}
                isLoading={isGrowthPlanLoading}
                error={growthPlanError}
                onRefresh={onFetchGrowthPlan}
                onComplete={onCompleteGrowthPlanTask}
                onNavigate={onNavigate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <WeatherWidget 
                    weatherAdvice={weatherAdvice}
                    isLoading={isWeatherLoading}
                    error={weatherError}
                    onRefresh={onFetchWeather}
                />
                 <RemindersWidget 
                    reminders={reminders}
                    onAddReminder={onAddReminder}
                    onToggleReminder={onToggleReminder}
                    onGetSuggestion={onGetReminderSuggestion}
                />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <MarketPulseCard 
                    analysis={marketAnalysis}
                    isLoading={isMarketAnalysisLoading}
                    error={marketAnalysisError}
                    onRefresh={onFetchMarketAnalysis}
                />
                <ActivityFeedCard activities={recentActivities} onViewChat={onViewChat}/>
            </div>
            
            <div>
                 <h3 className="text-xl font-bold text-green-800 mb-4">Your Active Listings</h3>
                 {listings.length > 0 ? (
                    <div>
                        {/* Mobile View: Cards */}
                        <div className="md:hidden space-y-3">
                            {listings.map(listing => (
                                <ListingRowCard 
                                    key={listing.id}
                                    listing={listing}
                                    hasUnread={(allChats[listing.id] || []).some(c => c.role === 'user')}
                                    onViewChat={onViewChat}
                                    onEdit={onEdit}
                                    onDelete={setListingToDelete}
                                />
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Crop</th>
                                        <th scope="col" className="px-6 py-3">Price</th>
                                        <th scope="col" className="px-6 py-3">Quantity</th>
                                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.map(listing => (
                                        <tr key={listing.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                                <img src={listing.imageUrl} alt={listing.cropType} className="w-10 h-10 rounded-md object-cover"/>
                                                {listing.cropType}
                                            </td>
                                            <td className="px-6 py-4">₦{listing.pricePerKg}/kg</td>
                                            <td className="px-6 py-4">{listing.quantityKg} kg</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => onViewChat(listing)} className="font-medium text-blue-600 hover:underline p-1 relative" title="View Chats">
                                                        <ChatBubbleIcon className="h-5 w-5"/>
                                                        {(allChats[listing.id] || []).some(c => c.role === 'user') && 
                                                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                            </span>
                                                        }
                                                    </button>
                                                    <button onClick={() => onEdit(listing)} className="font-medium text-green-600 hover:underline p-1" title="Edit Listing"><EditIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => setListingToDelete(listing.id)} className="font-medium text-red-600 hover:underline p-1" title="Delete Listing"><TrashIcon className="h-5 w-5"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center bg-white p-8 rounded-xl shadow-md border border-slate-200">
                        <p className="text-slate-500">You have no active listings. Use the AI scanner to add one!</p>
                    </div>
                 )}
            </div>

            {listingToDelete && (
                <DeleteConfirmationModal
                    onConfirm={() => {
                        onDelete(listingToDelete);
                        setListingToDelete(null);
                    }}
                    onCancel={() => setListingToDelete(null)}
                />
            )}
        </div>
    );
};