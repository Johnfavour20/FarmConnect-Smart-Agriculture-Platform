import React from 'react';
// FIX: Import FarmerProfile type
import type { FarmerProfile } from '../types';
import { DashboardIcon, UsersIcon, CameraIcon, UserCircleIcon, QuestionMarkCircleIcon, BookOpenIcon, ClipboardListIcon, CurrencyDollarIcon, UserGroupIcon, WalletIcon } from './IconComponents';

type FarmerViewMode = 'dashboard' | 'community' | 'scanner' | 'diagnosis' | 'listingForm' | 'chat' | 'editListing' | 'profile' | 'agronomist' | 'learningHub' | 'buyerRequestsFeed' | 'finance' | 'cooperativeHub' | 'wallet';

interface FarmerNavProps {
    activeView: FarmerViewMode;
    onNavigate: (view: 'dashboard' | 'community' | 'scanner' | 'profile' | 'agronomist' | 'learningHub' | 'buyerRequestsFeed' | 'finance' | 'cooperativeHub' | 'wallet') => void;
    // FIX: Add profile prop to match usage in App.tsx
    profile: FarmerProfile;
}

const NavButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
            isActive
                ? 'bg-green-100 text-green-700'
                : 'text-slate-500 hover:bg-slate-100'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {icon}
        <span className="text-center">{label}</span>
    </button>
);

const viewTitles: { [key in FarmerViewMode]?: string } = {
    dashboard: 'My Dashboard',
    community: 'Community Feed',
    scanner: 'AI Crop Scanner',
    profile: 'My Profile',
    agronomist: 'Ask an Agronomist',
    diagnosis: 'Diagnosis Report',
    listingForm: 'Create Listing',
    editListing: 'Edit Listing',
    chat: 'Conversation',
    learningHub: 'Learning Hub',
    buyerRequestsFeed: 'Buyer Requests',
    finance: 'Farm Finance Tracker',
    cooperativeHub: 'Cooperative Hub',
    wallet: "My Wallet"
};

export const FarmerNav: React.FC<FarmerNavProps> = ({ activeView, onNavigate, profile }) => {
    const mainViews: FarmerViewMode[] = ['dashboard', 'community', 'agronomist', 'scanner', 'learningHub', 'profile', 'buyerRequestsFeed', 'finance', 'cooperativeHub', 'wallet'];
    const mainActiveView = mainViews.includes(activeView) ? activeView : 'dashboard';

    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4 text-center">
                {viewTitles[activeView] || 'FarmConnect'}
            </h2>

            <div className="flex flex-wrap items-stretch justify-around gap-1 sm:gap-1 bg-slate-100/70 p-1 rounded-xl">
                 <NavButton
                    label="Dashboard"
                    icon={<DashboardIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'dashboard'}
                    onClick={() => onNavigate('dashboard')}
                 />
                 <NavButton
                    label="Requests"
                    icon={<ClipboardListIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'buyerRequestsFeed'}
                    onClick={() => onNavigate('buyerRequestsFeed')}
                 />
                 <NavButton
                    label="Cooperatives"
                    icon={<UserGroupIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'cooperativeHub'}
                    onClick={() => onNavigate('cooperativeHub')}
                 />
                 <NavButton
                    label="Finance"
                    icon={<CurrencyDollarIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'finance'}
                    onClick={() => onNavigate('finance')}
                 />
                 <NavButton
                    label="Wallet"
                    icon={<WalletIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'wallet'}
                    onClick={() => onNavigate('wallet')}
                 />
                 <NavButton
                    label="Community"
                    icon={<UsersIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'community'}
                    onClick={() => onNavigate('community')}
                 />
                 <NavButton
                    label="Learn"
                    icon={<BookOpenIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'learningHub'}
                    onClick={() => onNavigate('learningHub')}
                 />
                 <NavButton
                    label="Ask"
                    icon={<QuestionMarkCircleIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'agronomist'}
                    onClick={() => onNavigate('agronomist')}
                 />
                 <NavButton
                    label="Scanner"
                    icon={<CameraIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'scanner'}
                    onClick={() => onNavigate('scanner')}
                 />
                 <NavButton
                    label="Profile"
                    icon={<UserCircleIcon className="h-5 w-5" />}
                    isActive={mainActiveView === 'profile'}
                    onClick={() => onNavigate('profile')}
                 />
            </div>
        </div>
    );
};