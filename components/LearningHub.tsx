
import React from 'react';
import type { Tutorial, TutorialCategory } from '../types';
import { PlayIcon } from './IconComponents';

const TutorialCard: React.FC<{ tutorial: Tutorial, onSelect: () => void }> = ({ tutorial, onSelect }) => {
    return (
        <div 
            className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
            onClick={onSelect}
        >
            <div className="relative">
                <img src={tutorial.thumbnailUrl} alt={tutorial.title} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-12 w-12 text-white/80" />
                </div>
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {tutorial.duration}
                </span>
            </div>
            <div className="p-3">
                <h4 className="font-bold text-sm text-slate-800 truncate">{tutorial.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tutorial.description}</p>
            </div>
        </div>
    );
};

interface LearningHubProps {
    categories: TutorialCategory[];
    onSelectTutorial: (tutorial: Tutorial) => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({ categories, onSelectTutorial }) => {
    return (
        <div className="animate-fade-in space-y-8">
            {categories.map(category => (
                <div key={category.title}>
                    <h3 className="text-xl font-bold text-green-800 mb-4">{category.title}</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mb-4">
                        {category.tutorials.map(tutorial => (
                            <TutorialCard 
                                key={tutorial.id} 
                                tutorial={tutorial}
                                onSelect={() => onSelectTutorial(tutorial)}
                            />
                        ))}
                         <div className="flex-shrink-0 w-px"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
