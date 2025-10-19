import React, { useState, useMemo } from 'react';
import type { Reminder } from '../types';
import { CalendarIcon, SparklesIcon, PlusCircleIcon, CheckCircleIcon } from './IconComponents';
import { Spinner } from './Spinner';

interface RemindersWidgetProps {
    reminders: Reminder[];
    onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
    onToggleReminder: (reminderId: string) => void;
    onGetSuggestion: () => Promise<Omit<Reminder, 'id' | 'isComplete' | 'dueDate'> | null>;
}

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const ReminderItem: React.FC<{ reminder: Reminder; onToggle: () => void; }> = ({ reminder, onToggle }) => {
    const isOverdue = !reminder.isComplete && new Date(reminder.dueDate) < new Date();
    return (
        <div className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${reminder.isComplete ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
            <button onClick={onToggle} className="mt-1 flex-shrink-0">
                {reminder.isComplete ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                    <div className="h-5 w-5 border-2 border-slate-400 rounded-full" />
                )}
            </button>
            <div>
                <p className={`text-sm font-medium ${reminder.isComplete ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {reminder.title}
                </p>
                <div className="flex items-center gap-2">
                    <p className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                        {formatDate(reminder.dueDate)}
                    </p>
                    {reminder.notes && (
                         <p className="text-xs text-slate-400 truncate" title={reminder.notes}>
                            - {reminder.notes}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({ reminders, onAddReminder, onToggleReminder, onGetSuggestion }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [suggestion, setSuggestion] = useState<Omit<Reminder, 'id' | 'isComplete' | 'dueDate'> | null>(null);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);

    const sortedReminders = useMemo(() => {
        return [...reminders].sort((a, b) => {
            if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
            return a.dueDate - b.dueDate;
        });
    }, [reminders]);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && date) {
            onAddReminder({
                title,
                dueDate: new Date(date).getTime(),
                isComplete: false
            });
            setTitle('');
            setDate('');
            setIsFormVisible(false);
        }
    };
    
    const handleGetSuggestion = async () => {
        setIsSuggestionLoading(true);
        setSuggestion(null);
        const result = await onGetSuggestion();
        if (result) {
            setSuggestion(result);
        }
        setIsSuggestionLoading(false);
    };

    const handleAcceptSuggestion = () => {
        if (suggestion) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            onAddReminder({
                title: suggestion.title,
                notes: suggestion.notes,
                dueDate: tomorrow.getTime(),
                isComplete: false
            });
            setSuggestion(null);
        }
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-bold text-slate-800">Smart Reminders</h3>
                </div>
                <button onClick={() => setIsFormVisible(!isFormVisible)} className="p-1 text-slate-500 hover:text-green-600">
                    <PlusCircleIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-4">
                {sortedReminders.length > 0 ? (
                    sortedReminders.map(r => <ReminderItem key={r.id} reminder={r} onToggle={() => onToggleReminder(r.id)} />)
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No reminders yet. Add one to get started!</p>
                )}
            </div>
            
            {isFormVisible && (
                <form onSubmit={handleAddSubmit} className="space-y-2 p-2 bg-slate-50 rounded-lg mb-4 animate-fade-in-fast">
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task title..."
                        required
                        className="w-full text-sm border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full text-sm border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                         <button type="button" onClick={() => setIsFormVisible(false)} className="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-200">Cancel</button>
                         <button type="submit" className="text-xs font-semibold text-white bg-green-600 px-3 py-1.5 rounded-md hover:bg-green-700">Add</button>
                    </div>
                </form>
            )}

             <div className="border-t border-slate-200 pt-3">
                {isSuggestionLoading ? (
                    <div className="text-sm text-slate-500 flex items-center justify-center gap-2"><Spinner/> Generating AI suggestion...</div>
                ) : suggestion ? (
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                        <p className="font-semibold text-blue-800">{suggestion.title}</p>
                        <p className="text-xs text-blue-700 mb-2">{suggestion.notes}</p>
                        <div className="flex justify-end gap-2">
                             <button onClick={() => setSuggestion(null)} className="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-200">Dismiss</button>
                             <button onClick={handleAcceptSuggestion} className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-700">Accept</button>
                        </div>
                    </div>
                ) : (
                     <button 
                        onClick={handleGetSuggestion}
                        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 py-2.5 px-4 rounded-full transition-colors"
                    >
                        <SparklesIcon className="h-5 w-5"/>
                        Get Suggestion
                    </button>
                )}
             </div>
        </div>
    );
};
