import React from 'react';
import type { Transaction, FarmerProfile } from '../types';
import { ArrowUpIcon, ArrowDownIcon, SparklesIcon, CurrencyDollarIcon, LightbulbIcon } from './IconComponents';
import { Spinner } from './Spinner';

interface FinanceTrackerProps {
    transactions: Transaction[];
    farmerProfile: FarmerProfile;
    onAddTransaction: () => void;
    financialAnalysis: string | null;
    isFinancialAnalysisLoading: boolean;
    onFetchFinancialAnalysis: () => void;
    // FIX: Add missing props for pagination
    visibleCount: number;
    onLoadMore: () => void;
}

const StatCard: React.FC<{ title: string; value: string; color: 'green' | 'red' | 'slate' }> = ({ title, value, color }) => {
    const colors = {
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        slate: 'bg-slate-100 text-slate-800'
    };
    return (
        <div className={`p-4 rounded-xl shadow-md border border-slate-200 ${colors[color]}`}>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
};

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isIncome = transaction.type === 'income';
    return (
        <li className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isIncome ? <ArrowUpIcon className="w-5 h-5 text-green-600" /> : <ArrowDownIcon className="w-5 h-5 text-red-600" />}
                </div>
                <div>
                    <p className="font-medium text-sm text-slate-800">{transaction.description}</p>
                    <p className="text-xs text-slate-500">{transaction.category} &bull; {new Date(transaction.date).toLocaleDateString()}</p>
                </div>
            </div>
            <p className={`font-bold text-sm ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                {isIncome ? '+' : '-'}₦{transaction.amount.toLocaleString()}
            </p>
        </li>
    );
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

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({ transactions, farmerProfile, onAddTransaction, financialAnalysis, isFinancialAnalysisLoading, onFetchFinancialAnalysis, visibleCount, onLoadMore }) => {
    const { totalIncome, totalExpenses, netProfit } = React.useMemo(() => {
        let income = 0;
        let expenses = 0;
        transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expenses += t.amount;
        });
        return { totalIncome: income, totalExpenses: expenses, netProfit: income - expenses };
    }, [transactions]);

    const sortedTransactions = [...transactions].sort((a, b) => b.date - a.date);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Income" value={`₦${totalIncome.toLocaleString()}`} color="green" />
                <StatCard title="Total Expenses" value={`₦${totalExpenses.toLocaleString()}`} color="red" />
                <StatCard title="Net Profit" value={`₦${netProfit.toLocaleString()}`} color={netProfit >= 0 ? 'green' : 'red'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
                        <button 
                            onClick={onAddTransaction}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md hover:bg-green-700 transition-colors"
                        >
                            + Add New
                        </button>
                    </div>
                    <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {sortedTransactions.length > 0 ? (
                            sortedTransactions.slice(0, visibleCount).map(t => <TransactionItem key={t.id} transaction={t} />)
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-8">No transactions logged yet.</p>
                        )}
                    </ul>
                    {sortedTransactions.length > visibleCount && (
                        <div className="text-center mt-4">
                            <button
                                onClick={onLoadMore}
                                className="bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-full text-sm hover:bg-slate-300 transition-colors"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
                     <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                            <LightbulbIcon className="h-6 w-6 text-blue-500"/>
                            <h3 className="text-lg font-bold text-slate-800">Profit Pulse</h3>
                        </div>
                        <button 
                            onClick={onFetchFinancialAnalysis} 
                            disabled={isFinancialAnalysisLoading}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                            {isFinancialAnalysisLoading ? 'Analyzing...' : 'Generate Analysis'}
                        </button>
                    </div>
                    <div className="text-sm text-slate-600 space-y-2 prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg min-h-[150px]">
                        {isFinancialAnalysisLoading && <div className="flex items-center gap-2"><Spinner /> Analyzing your finances...</div>}
                        {financialAnalysis && !isFinancialAnalysisLoading && <div dangerouslySetInnerHTML={formatMarkdown(financialAnalysis)} />}
                        {!financialAnalysis && !isFinancialAnalysisLoading && <p>Click "Generate Analysis" to get AI-powered insights on your farm's profitability.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
