import React, { useState } from 'react';
import type { FarmerProfile as FarmerProfileType, Post } from '../types';
import { FarmerIcon, LocationMarkerIcon, UsersIcon } from './IconComponents';

// A simplified PostCard for the profile view
const ProfilePostCard: React.FC<{ post: Post }> = ({ post }) => {
    const timeAgo = (timestamp: number): string => {
        const now = Date.now();
        const seconds = Math.floor((now - timestamp) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            {post.imageUrl && (
                <img src={post.imageUrl} alt="Post attachment" className="w-full h-32 object-cover" />
            )}
            <div className="p-4">
                <p className="text-slate-700 text-sm">{post.content}</p>
                <div className="text-xs text-slate-400 mt-2 flex justify-between items-center">
                    <span>{timeAgo(post.createdAt)}</span>
                    <div className="flex gap-4">
                        <span>{post.likes} Likes</span>
                        <span>{post.comments.length} Comments</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface FarmerProfileProps {
    profile: FarmerProfileType | null;
    onSave: (profile: FarmerProfileType) => void;
    userPosts: Post[];
}

export const FarmerProfile: React.FC<FarmerProfileProps> = ({ profile, onSave, userPosts }) => {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        location: profile?.location || '',
        farmLocation: profile?.farmLocation || ''
    });
    const isEditing = !!profile;
    const sortedPosts = [...userPosts].sort((a, b) => b.createdAt - a.createdAt);

    const xpForNextLevel = profile ? profile.level * 100 : 100;
    const xpPercentage = profile ? (profile.xp / xpForNextLevel) * 100 : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim() && formData.location.trim()) {
            onSave({
                ...formData,
                level: profile?.level || 1,
                xp: profile?.xp || 0,
            });
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
                 {isEditing && profile && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-bold text-green-700">Level {profile.level}</p>
                            <p className="text-sm text-slate-500 font-medium">{profile.xp} / {xpForNextLevel} XP</p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${xpPercentage}%` }}></div>
                        </div>
                    </div>
                )}
                <h2 className="text-2xl font-bold text-green-800 mb-1">
                    {isEditing ? 'Edit Your Profile' : 'Welcome to FarmConnect!'}
                </h2>
                <p className="text-slate-600 mb-6">
                    {isEditing ? 'Keep your information up to date.' : 'Let\'s create your profile to get you started.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FarmerIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                className="w-full border-slate-300 rounded-lg p-3 pl-10 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Primary Market / City</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LocationMarkerIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter your primary market or city"
                                required
                                className="w-full border-slate-300 rounded-lg p-3 pl-10 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="farmLocation" className="block text-sm font-medium text-slate-700 mb-1">Farm Location</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LocationMarkerIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                name="farmLocation"
                                id="farmLocation"
                                value={formData.farmLocation}
                                onChange={handleChange}
                                placeholder="Enter your farm's town or area"
                                required
                                className="w-full border-slate-300 rounded-lg p-3 pl-10 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 pl-2">Enter town or area for accurate weather forecasts.</p>
                    </div>
                    <div className="text-right pt-2">
                         <button
                            type="submit"
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                        >
                            {isEditing ? 'Save Changes' : 'Create Profile'}
                        </button>
                    </div>
                </form>
            </div>
            
            {isEditing && (
                 <div>
                    <h3 className="text-xl font-bold text-green-800 mb-4">Your Posts</h3>
                    {sortedPosts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {sortedPosts.map(post => <ProfilePostCard key={post.id} post={post} />)}
                        </div>
                    ) : (
                        <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-slate-200">
                            <UsersIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-slate-700">No posts yet.</h4>
                            <p className="text-slate-500 mt-1 text-sm">
                                Head to the 'Community' tab to share your first update!
                            </p>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};