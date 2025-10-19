import React from 'react';
import type { GrowthPlanTask, GrowthPlanTaskAction } from '../types';
import { TrophyIcon, BookOpenIcon, UsersIcon, EditIcon, CameraIcon, QuestionMarkCircleIcon, CheckCircleIcon } from './IconComponents';
import { Spinner } from './Spinner';

const TaskIcon: React.FC<{ action: GrowthPlanTaskAction, className?: string }> = ({ action, className }) => {
    switch(action) {
        case 'VIEW_TUTORIAL':
            return <BookOpenIcon className={className} />;
        case 'CREATE_POST':
            return <UsersIcon className={className} />;
        case 'EDIT_LISTING':
            return <EditIcon className={className} />;
        case 'INSPECT_CROP':
            return <CameraIcon className={className} />;
        case 'LEARN_MORE':
        default:
            return <QuestionMarkCircleIcon className={className} />;
    }
};

const TaskItem: React.FC<{
    task: GrowthPlanTask;
    onComplete: (taskId: string, xp: number) => void;
    onNavigate: (view: any, targetId?: string) => void;
}> = ({ task, onComplete, onNavigate }) => {
    
    const handleActionClick = () => {
        let view: any = 'dashboard';
        switch(task.action) {
            case 'VIEW_TUTORIAL': view = 'learningHub'; break;
            case 'CREATE_POST': view = 'community'; break;
            case 'INSPECT_CROP': view = 'scanner'; break;
            case 'LEARN_MORE': view = 'agronomist'; break;
            default: view = 'dashboard';
        }
        onNavigate(view, task.targetId);
    };

    return (
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-4 transition-shadow hover:shadow-md">
            <div className="bg-green-100 p-2 rounded-full mt-1">
                <TaskIcon action={task.action} className="h-5 w-5 text-green-700" />
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">{task.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">+{task.xp} XP</span>
                    <div>
                        <button 
                            onClick={handleActionClick}
                            className="text-xs font-semibold text-green-600 px-3 py-1 rounded-md hover:bg-green-50"
                        >
                            Start Task
                        </button>
                         <button 
                            onClick={() => onComplete(task.id, task.xp)}
                            className="text-xs font-semibold text-white bg-green-600 px-3 py-1 rounded-md hover:bg-green-700 ml-2"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface GrowthPlanWidgetProps {
    tasks: GrowthPlanTask[];
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
    onComplete: (taskId: string, xp: number) => void;
    onNavigate: (view: any, targetId?: string) => void;
}

export const GrowthPlanWidget: React.FC<GrowthPlanWidgetProps> = ({ tasks, isLoading, error, onRefresh, onComplete, onNavigate }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <TrophyIcon className="h-6 w-6 text-green-600"/>
                    <h3 className="text-lg font-bold text-slate-800">Your Growth Plan</h3>
                </div>
                <button 
                    onClick={onRefresh} 
                    disabled={isLoading}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                    {isLoading ? 'Loading...' : 'Refresh'}
                </button>
            </div>
             
             {isLoading && (
                 <div className="flex flex-col items-center justify-center text-center text-slate-500 py-8">
                    <Spinner />
                    <p className="mt-2 text-sm">Generating your personalized tasks...</p>
                 </div>
            )}

            {error && !isLoading && (
                 <div className="text-center text-red-600 bg-red-50 rounded-lg p-4">
                    <p className="font-semibold">Could not load your Growth Plan.</p>
                    <p className="text-xs mt-1">{error}</p>
                 </div>
            )}
            
            {!isLoading && !error && (
                tasks.length > 0 ? (
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <TaskItem key={task.id} task={task} onComplete={onComplete} onNavigate={onNavigate} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center bg-slate-50 p-8 rounded-lg">
                        <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-slate-800">All tasks completed!</h4>
                        <p className="text-sm text-slate-500">Great job! Check back later for new recommendations.</p>
                    </div>
                )
            )}
        </div>
    );
};