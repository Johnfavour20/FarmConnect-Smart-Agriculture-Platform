
import React from 'react';
import type { Tutorial } from '../types';
import { XIcon, PlayIcon, QuestionMarkCircleIcon } from './IconComponents';

interface VideoPlayerModalProps {
    tutorial: Tutorial;
    onClose: () => void;
    onAskExpert: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ tutorial, onClose, onAskExpert }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-lg font-bold text-green-800 truncate pr-8">{tutorial.title}</h2>
                    <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 absolute top-3 right-3">
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative mb-4">
                        <img src={tutorial.thumbnailUrl} alt={tutorial.title} className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
                            <PlayIcon className="h-16 w-16 text-white/80 mb-4"/>
                            <p className="font-semibold">Video Playback is Simulated</p>
                            <p className="text-sm text-slate-300">This is a placeholder for the tutorial video.</p>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                         <p>{tutorial.description}</p>
                    </div>
                </div>
                
                <footer className="p-4 bg-slate-50/70 border-t border-slate-200 flex-shrink-0 rounded-b-2xl">
                    <div className="flex items-center justify-center gap-4">
                        <p className="text-sm font-medium text-slate-700">Have questions about this topic?</p>
                        <button 
                            onClick={onAskExpert}
                            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-green-700 transition-all transform hover:scale-105"
                        >
                            <QuestionMarkCircleIcon className="h-5 w-5"/>
                            Ask an Expert
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
