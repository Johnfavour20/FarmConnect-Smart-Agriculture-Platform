import React, { useState, useMemo } from 'react';
import type { Wallet, Transaction, Payout } from '../types';
import { WalletIcon, CheckCircleIcon, ExclamationTriangleIcon } from './IconComponents';
import { PayoutModal } from './PayoutModal';

const TransactionRow: React.FC<{ item: Transaction | Payout }> = ({ item }) => {
    const isPayout = 'method' in item; // Type guard for Payout
    
    const date = isPayout ? item.requestedAt : item.date;
    const description = isPayout ? `Withdrawal to ${item.destination}` : item.description;
    const amount = item.amount;
    const type = isPayout ? 'expense' : (item as Transaction).type;

    // FIX: The `title` prop is not a valid attribute for these SVG components.
    // Wrapped icons in a `span` with a `title` attribute to provide tooltip text for status.
    const statusIcon = isPayout ? {
        'Pending': <span title="Pending"><ExclamationTriangleIcon className="h-4 w-4 text-amber-500"/></span>,
        'Completed': <span title="Completed"><CheckCircleIcon className="h-4 w-4 text-green-500"/></span>,
        'Failed': <span title="Failed"><ExclamationTriangleIcon className="h-4 w-4 text-red-500"/></span>
    }[item.status] : null;

    return (
        <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
                 {statusIcon}
                <div>
                    <p className="font-semibold text-slate-800">{description}</p>
                    <p className="text-xs text-slate-500">{new Date(date).toLocaleString()}</p>
                </div>
            </div>
            <p className={`font-bold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {type === 'income' ? '+' : '-'}₦{amount.toLocaleString()}
            </p>
        </div>
    );
};

interface WalletViewProps {
    wallet: Wallet;
    onWithdraw: (amount: number, method: 'Bank Transfer' | 'Mobile Money', destination: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ wallet, onWithdraw }) => {
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

    const sortedTransactions = useMemo(() => {
        return [...wallet.transactions].sort((a, b) => {
            const dateA = 'requestedAt' in a ? a.requestedAt : a.date;
            const dateB = 'requestedAt' in b ? b.requestedAt : b.date;
            return dateB - dateA;
        });
    }, [wallet.transactions]);
    
    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-2xl shadow-2xl text-center">
                <p className="text-sm opacity-80">Available Balance</p>
                <p className="text-5xl font-bold tracking-tight mt-1">₦{wallet.balance.toLocaleString()}</p>
                 <button 
                    onClick={() => setIsPayoutModalOpen(true)}
                    className="mt-6 bg-white text-green-700 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105"
                >
                    Withdraw Funds
                </button>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <WalletIcon className="h-6 w-6 text-green-600"/>
                    <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                    {sortedTransactions.length > 0 ? (
                        sortedTransactions.map(item => <TransactionRow key={item.id} item={item} />)
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-8">No transactions yet.</p>
                    )}
                </div>
            </div>

            {isPayoutModalOpen && (
                <PayoutModal
                    balance={wallet.balance}
                    onClose={() => setIsPayoutModalOpen(false)}
                    onConfirm={onWithdraw}
                />
            )}
        </div>
    );
};