import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Transaction, SavingsGoal, FinancialAnalysis } from '../types';
import { CurrencyDollarIcon, TrendingUpIcon, TrophyIcon, PlusCircleIcon, ChevronLeftIcon, ChevronRightIcon } from './IconComponents';
import { Spinner } from './Spinner';
import { TransactionModal } from './TransactionModal';
import { SavingsGoalModal } from './SavingsGoalModal';
import { ContributeModal } from './ContributeModal';


const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg">
        <div>
            <p className="font-semibold text-slate-800">{transaction.description}</p>
            <p className="text-xs text-slate-500">{transaction.category} &middot; {new Date(transaction.date).toLocaleDateString()}</p>
        </div>
        <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {transaction.type === 'income' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
        </p>
    </div>
);

const GoalItem: React.FC<{ goal: SavingsGoal; onContribute: () => void; }> = ({ goal, onContribute }) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-slate-800">{goal.name}</h4>
                    <p className="text-sm text-green-700 font-semibold">₦{goal.currentAmount.toLocaleString()} / <span className="text-slate-500 font-normal">₦{goal.targetAmount.toLocaleString()}</span></p>
                </div>
                <button onClick={onContribute} className="text-xs font-semibold text-white bg-green-600 px-3 py-1.5 rounded-full hover:bg-green-700">Contribute</button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


interface FinanceTrackerProps {
    transactions: Transaction[];
    savingsGoals: SavingsGoal[];
    financialAnalysis: FinancialAnalysis | null;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    onAddGoal: (name: string, targetAmount: number) => void;
    onContributeToGoal: (goalId: string, amount: number) => void;
    onFetchAnalysis: (periodTransactions: Transaction[], period: { month: string, year: number }) => void;
    isAnalysisLoading: boolean;
    onGenerateReport: () => void;
}

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({
    transactions,
    savingsGoals,
    financialAnalysis,
    onAddTransaction,
    onAddGoal,
    onContributeToGoal,
    onFetchAnalysis,
    isAnalysisLoading,
    onGenerateReport
}) => {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const { monthName, year } = useMemo(() => ({
        monthName: currentDate.toLocaleString('default', { month: 'long' }),
        year: currentDate.getFullYear(),
    }), [currentDate]);

    const monthlyTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === currentDate.getFullYear() && tDate.getMonth() === currentDate.getMonth();
        });
    }, [transactions, currentDate]);

    const { totalIncome, totalExpenses, netProfit } = useMemo(() => {
        return monthlyTransactions.reduce((acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else acc.totalExpenses += t.amount;
            acc.netProfit = acc.totalIncome - acc.totalExpenses;
            return acc;
        }, { totalIncome: 0, totalExpenses: 0, netProfit: 0 });
    }, [monthlyTransactions]);

    const sortedTransactions = useMemo(() => {
        return [...monthlyTransactions].sort((a, b) => b.date - a.date);
    }, [monthlyTransactions]);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetchAnalysis = useCallback(onFetchAnalysis, []);

    useEffect(() => {
        debouncedFetchAnalysis(monthlyTransactions, { month: monthName, year });
    }, [monthlyTransactions, monthName, year, debouncedFetchAnalysis]);

    const handleAddTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
        onAddTransaction(transaction);
        setIsTransactionModalOpen(false);
    }, [onAddTransaction]);
    
    const handleAddGoal = useCallback((name: string, targetAmount: number) => {
        onAddGoal(name, targetAmount);
        setIsGoalModalOpen(false);
    }, [onAddGoal]);

    const handleContribute = useCallback((goalId: string, amount: number) => {
        onContributeToGoal(goalId, amount);
        setGoalToContribute(null);
    }, [onContributeToGoal]);


    return (
        <div className="animate-fade-in space-y-6">
             <div className="flex justify-center items-center gap-4 bg-white p-2 rounded-full shadow-md max-w-sm mx-auto">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Previous month"><ChevronLeftIcon className="h-5 w-5 text-slate-600"/></button>
                <div className="text-center w-32">
                    <p className="font-bold text-lg text-slate-800">{monthName}</p>
                    <p className="text-xs text-slate-500 -mt-1">{year}</p>
                </div>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Next month"><ChevronRightIcon className="h-5 w-5 text-slate-600"/></button>
                <button onClick={handleToday} className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">Today</button>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Monthly Income" value={`₦${totalIncome.toLocaleString()}`} color="text-green-600" />
                <StatCard title="Monthly Expenses" value={`₦${totalExpenses.toLocaleString()}`} color="text-red-600" />
                <StatCard title="Monthly Net Profit" value={`₦${netProfit.toLocaleString()}`} color={netProfit >= 0 ? "text-green-800" : "text-red-800"} />
             </div>

             <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <TrendingUpIcon className="h-6 w-6 text-blue-500"/>
                        <h3 className="text-lg font-bold text-slate-800">Profit Pulse</h3>
                    </div>
                </div>
                <div className="text-sm text-slate-600 min-h-[40px]">
                    {isAnalysisLoading && <div className="flex items-center gap-2"><Spinner/> Generating insights for {monthName}...</div>}
                    {!isAnalysisLoading && financialAnalysis && (
                        <p>{financialAnalysis.aiSummary}</p>
                    )}
                </div>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                 <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-600"/>
                            <h3 className="text-lg font-bold text-slate-800">Monthly Transactions</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={onGenerateReport} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100">
                                Generate Report
                            </button>
                            <button onClick={() => setIsTransactionModalOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 px-3 py-1.5 rounded-full hover:bg-green-700">
                                <PlusCircleIcon className="h-4 w-4"/> Add New
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
                        {sortedTransactions.length > 0 ? (
                            sortedTransactions.map(t => <TransactionItem key={t.id} transaction={t} />)
                        ) : (
                             <p className="text-sm text-slate-500 text-center py-8">No transactions recorded for {monthName}.</p>
                        )}
                    </div>
                 </div>

                 <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <TrophyIcon className="h-6 w-6 text-amber-500"/>
                            <h3 className="text-lg font-bold text-slate-800">Savings Goals</h3>
                        </div>
                        <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-600 px-3 py-1.5 rounded-full hover:bg-amber-700">
                            <PlusCircleIcon className="h-4 w-4"/> New Goal
                        </button>
                    </div>
                     <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {savingsGoals.length > 0 ? (
                            savingsGoals.map(g => <GoalItem key={g.id} goal={g} onContribute={() => setGoalToContribute(g)} />)
                        ) : (
                             <p className="text-sm text-slate-500 text-center py-8">Set a savings goal to get started!</p>
                        )}
                    </div>
                 </div>
            </div>

            {isTransactionModalOpen && <TransactionModal onClose={() => setIsTransactionModalOpen(false)} onAddTransaction={handleAddTransaction} />}
            {isGoalModalOpen && <SavingsGoalModal onClose={() => setIsGoalModalOpen(false)} onAddGoal={handleAddGoal} />}
            {goalToContribute && <ContributeModal goal={goalToContribute} onClose={() => setGoalToContribute(null)} onContribute={handleContribute} />}
        </div>
    );
};