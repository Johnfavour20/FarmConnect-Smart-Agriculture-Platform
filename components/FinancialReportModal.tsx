import React from 'react';
import type { FinancialReportData, Transaction } from '../types';
import { Spinner } from './Spinner';
import { FarmerIcon, PrinterIcon, XIcon, CurrencyDollarIcon, TrendingUpIcon } from './IconComponents';

interface FinancialReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportData: FinancialReportData | null;
    isLoading: boolean;
}

const StatItem: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-slate-200">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{typeof value === 'number' ? `₦${value.toLocaleString()}` : value}</span>
    </div>
);

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <div className="flex justify-between items-center py-2 text-sm">
        <div>
            <p className="font-medium text-slate-700">{transaction.description}</p>
            <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
        </div>
        <p className="font-semibold text-green-700">+₦{transaction.amount.toLocaleString()}</p>
    </div>
);

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({ isOpen, onClose, reportData, isLoading }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0 print:hidden">
                    <h2 className="text-lg font-bold text-green-800">Financial Snapshot Report</h2>
                    <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>
                 
                <div id="report-content" className="flex-grow overflow-y-auto p-6">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600">
                            <Spinner />
                            <p className="mt-4">Generating Your Financial Report...</p>
                        </div>
                    )}
                    {!isLoading && reportData && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-slate-900">Financial Snapshot</h1>
                                <p className="text-slate-600">Prepared for: {reportData.farmer.name}</p>
                                <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <StatItem label="Total Recorded Income" value={reportData.totalIncome} />
                                <StatItem label="Total Recorded Expenses" value={reportData.totalExpenses} />
                                <StatItem label="Net Profit" value={reportData.netProfit} />
                                <StatItem label="Avg. Monthly Income" value={Math.round(reportData.avgMonthlyIncome)} />
                                <StatItem label="Number of Sales" value={reportData.salesTransactions} />
                                <StatItem label="Location" value={reportData.farmer.location} />
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg">
                                <h3 className="font-bold mb-2 flex items-center gap-2"><TrendingUpIcon className="h-5 w-5"/> AI Advisor's Summary</h3>
                                <p className="text-sm">{reportData.aiSummary}</p>
                            </div>

                             <div>
                                <h3 className="font-bold text-slate-800 mb-2">Largest Income Transactions</h3>
                                <div className="border border-slate-200 rounded-lg p-3 divide-y divide-slate-100">
                                    {reportData.largestIncomeTransactions.length > 0 ? (
                                        reportData.largestIncomeTransactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-4">No income transactions recorded.</p>
                                    )}
                                </div>
                            </div>
                            
                             <div className="text-center text-xs text-slate-400 pt-4">
                                This report is generated based on data logged by the user in the FarmConnect application.
                            </div>
                        </div>
                    )}
                </div>

                 <footer className="p-4 bg-slate-50/70 border-t border-slate-200 flex-shrink-0 rounded-b-2xl flex justify-end items-center gap-4 print:hidden">
                    <button onClick={onClose} className="text-slate-600 font-medium py-2 px-6 rounded-full hover:bg-slate-100 transition-colors">
                        Close
                    </button>
                     <button 
                        onClick={handlePrint}
                        disabled={isLoading || !reportData}
                        className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-slate-400"
                    >
                        <PrinterIcon className="h-5 w-5"/>
                        Print Report
                    </button>
                </footer>
            </div>
             <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #report-content, #report-content * {
                            visibility: visible;
                        }
                        #report-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                    }
                `}
            </style>
        </div>
    );
};