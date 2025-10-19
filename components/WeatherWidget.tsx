import React from 'react';
import type { WeatherAdvice, DailyForecast } from '../types';
import { SunIcon, CloudIcon, CloudRainIcon, SparklesIcon } from './IconComponents';
import { Spinner } from './Spinner';

const WeatherIcon: React.FC<{ condition: DailyForecast['condition'], className?: string }> = ({ condition, className }) => {
    switch (condition) {
        case 'Sunny':
            return <SunIcon className={`h-8 w-8 text-amber-500 ${className}`} />;
        case 'Partly Cloudy':
        case 'Cloudy':
            return <CloudIcon className={`h-8 w-8 text-slate-500 ${className}`} />;
        case 'Rain':
        case 'Storm':
            return <CloudRainIcon className={`h-8 w-8 text-blue-500 ${className}`} />;
        default:
            return null;
    }
};

interface WeatherWidgetProps {
    weatherAdvice: WeatherAdvice | null;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weatherAdvice, isLoading, error, onRefresh }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <CloudIcon className="h-6 w-6 text-slate-500"/>
                    <h3 className="text-lg font-bold text-slate-800">Weather &amp; Planning</h3>
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
                 <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500">
                    <Spinner />
                    <p className="mt-2 text-sm">Fetching local forecast and AI advice...</p>
                 </div>
            )}

            {error && !isLoading && (
                 <div className="flex-grow flex flex-col items-center justify-center text-center text-red-600 bg-red-50 rounded-lg p-4">
                    <p className="font-semibold">Could not load weather data.</p>
                    <p className="text-xs mt-1">{error}</p>
                 </div>
            )}

            {weatherAdvice && !isLoading && !error && (
                <div className="flex-grow flex flex-col">
                    {/* 5-Day Forecast */}
                    <div className="grid grid-cols-5 gap-2 text-center mb-4">
                        {weatherAdvice.forecast.map(day => (
                            <div key={day.day} className="bg-slate-50 p-2 rounded-lg">
                                <p className="text-sm font-bold text-slate-800">{day.day}</p>
                                <WeatherIcon condition={day.condition} className="mx-auto my-1"/>
                                <p className="text-xs text-slate-600">{day.tempHigh}°/{day.tempLow}°</p>
                            </div>
                        ))}
                    </div>

                    {/* AI Insights */}
                    <div className="bg-green-50/70 p-4 rounded-lg flex-grow flex flex-col">
                         <div className="flex items-center gap-2 mb-2">
                             <SparklesIcon className="h-5 w-5 text-green-600"/>
                            <h4 className="font-bold text-green-800">AI Agronomist Advice</h4>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">{weatherAdvice.aiSummary}</p>
                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                            {weatherAdvice.aiTips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
