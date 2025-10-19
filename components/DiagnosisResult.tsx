import React, { useState, useEffect } from 'react';
import type { Diagnosis, ChatMessage, Reminder } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, SparklesIcon, ChatBubbleIcon, MarketplaceIcon, CalendarIcon } from './IconComponents';
import { ChatInterface } from './ChatInterface';

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
  imageFile: File | null;
  onReset: () => void;
  onListProduce: () => void;
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
  // Chat props
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5">
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="text-lg font-bold text-slate-800 ml-3">{title}</h3>
        </div>
        <div className="text-slate-600 space-y-2">{children}</div>
    </div>
);


export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, imageFile, onReset, onListProduce, onAddReminder, chatHistory, isChatLoading, onSendMessage }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(imageFile);
        }
    }, [imageFile]);

    const isHealthy = diagnosis.diseaseName.toLowerCase() === 'healthy';

    const handleCreateReminder = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        onAddReminder({
            title: `Apply treatment for ${diagnosis.diseaseName} on ${diagnosis.cropType}`,
            notes: `Follow treatment plan: ${diagnosis.recommendedTreatment.substring(0, 100)}...`,
            dueDate: tomorrow.getTime(),
            isComplete: false,
            relatedCrop: diagnosis.cropType,
        });
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {imagePreview && (
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <img src={imagePreview} alt="Diagnosed crop" className="rounded-2xl shadow-lg w-full object-cover" />
                    </div>
                )}
                <div className="flex-grow bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h2 className="text-2xl font-bold text-green-800 mb-4">Diagnosis Report</h2>
                    <p className="font-medium text-slate-600 mb-2">Crop Type: <span className="font-bold text-slate-800">{diagnosis.cropType}</span></p>
                    <div className={`flex items-start p-4 rounded-lg mb-4 ${isHealthy ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {isHealthy ? <CheckCircleIcon className="h-8 w-8 mr-3 flex-shrink-0" /> : <ExclamationTriangleIcon className="h-8 w-8 mr-3 flex-shrink-0" />}
                        <div>
                            <p className="font-semibold text-lg">{diagnosis.diseaseName}</p>
                            <div className="flex items-center text-sm flex-wrap">
                                <p>Confidence: {diagnosis.confidenceScore}</p>
                                {!isHealthy && <p className="ml-0 sm:ml-4 mt-1 sm:mt-0">Severity: {diagnosis.severity}</p>}
                            </div>
                        </div>
                    </div>
                     <p className="text-slate-600 text-sm">This is an AI-generated diagnosis. For critical issues, please consult a local agricultural extension agent.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ResultCard title={isHealthy ? "General Care Tips" : "Recommended Treatment"} icon={<InformationCircleIcon className="h-6 w-6 text-blue-500" />}>
                    <p className="whitespace-pre-wrap">{diagnosis.recommendedTreatment}</p>
                 </ResultCard>

                 <ResultCard title="Preventive Tips" icon={<SparklesIcon className="h-6 w-6 text-purple-500" />}>
                    <ul className="list-disc list-inside space-y-1">
                        {diagnosis.preventiveTips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                        ))}
                    </ul>
                 </ResultCard>
            </div>

            <div className="pt-4">
                <div className="flex items-center mb-4">
                    <ChatBubbleIcon className="h-6 w-6 text-green-700" />
                    <h3 className="text-xl font-bold text-green-800 ml-3">Ask a Follow-up Question</h3>
                </div>
                <ChatInterface 
                    chatHistory={chatHistory}
                    isChatLoading={isChatLoading}
                    onSendMessage={onSendMessage}
                />
            </div>

             <div className="text-center pt-4 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
                {!isHealthy && (
                     <button
                        onClick={handleCreateReminder}
                        className="w-full sm:w-auto flex items-center justify-center bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-amber-700 transition-all duration-300 transform hover:scale-105"
                        >
                        <CalendarIcon className="h-6 w-6 mr-2" />
                        Create Treatment Reminder
                    </button>
                )}
                {isHealthy && (
                     <button
                        onClick={onListProduce}
                        className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                        >
                        <MarketplaceIcon className="h-6 w-6 mr-2" />
                        List Produce on Marketplace
                    </button>
                )}
                <button
                  onClick={onReset}
                  className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                >
                  Diagnose Another Crop
                </button>
            </div>
        </div>
    );
};