
import React, { useState, useRef, useMemo } from 'react';
import type { Post, Comment, FarmerProfile, PollOption } from '../types';
import { FarmerIcon, ImageIcon, UsersIcon, ChatBubbleIcon, SendIcon, PollIcon, LightbulbIcon, TagIcon, XIcon } from './IconComponents';

// --- Helper Functions ---
const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 2) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};


// --- Sub-components ---

type CreatePostFormProps = {
    onCreatePost: (postData: Omit<Post, 'id' | 'createdAt' | 'imageUrl' | 'likes' | 'comments' | 'farmerName'> & { imageFile: File | null }) => void;
    farmerProfile: FarmerProfile;
};

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onCreatePost, farmerProfile }) => {
    const [postType, setPostType] = useState<'text' | 'poll'>('text');
    // Common state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [tags, setTags] = useState('');
    // Text post state
    const [content, setContent] = useState('');
    // Poll state
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };
    
    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            const newOptions = [...pollOptions];
            newOptions.splice(index, 1);
            setPollOptions(newOptions);
        }
    };

    const resetForm = () => {
        setContent('');
        setPollQuestion('');
        setPollOptions(['', '']);
        setTags('');
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        
        if (postType === 'text' && content.trim()) {
            onCreatePost({ content, tags: tagArray, imageFile });
        } else if (postType === 'poll' && pollQuestion.trim() && pollOptions.every(opt => opt.trim())) {
             const finalPollOptions: PollOption[] = pollOptions.map(opt => ({ text: opt, votes: [] }));
             onCreatePost({ 
                content: '', // Or maybe the question here? Let's leave it separate.
                isPoll: true, 
                pollQuestion, 
                pollOptions: finalPollOptions, 
                tags: tagArray,
                imageFile
             });
        }
        resetForm();
    };
    
    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="flex items-start gap-3">
                     <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <FarmerIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-grow">
                        {postType === 'text' ? (
                             <textarea
                                id="postContent"
                                rows={3}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={`What's on your mind, ${farmerProfile.name}?`}
                                required
                                className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            />
                        ) : (
                            <div className="space-y-2">
                                <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Ask a question..." required className="w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 text-sm font-semibold" />
                                {pollOptions.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" value={option} onChange={e => handlePollOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} required className="flex-grow w-full border-slate-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 text-sm" />
                                        {pollOptions.length > 2 && <button type="button" onClick={() => removePollOption(index)} className="text-red-500 hover:bg-red-100 rounded-full p-1">&times;</button>}
                                    </div>
                                ))}
                                {pollOptions.length < 4 && <button type="button" onClick={addPollOption} className="text-xs text-green-600 font-semibold hover:underline">+ Add option</button>}
                            </div>
                        )}
                        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Add tags, comma separated (e.g., maize, pests)" className="w-full border-slate-300 rounded-lg p-2 mt-2 focus:ring-green-500 focus:border-green-500 text-xs" />
                    </div>
                </div>
                
                {imagePreview && (
                    <div className="relative w-32 h-32 ml-12">
                        <img src={imagePreview} alt="Preview" className="rounded-lg object-cover w-full h-full" />
                         <button 
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold"
                            // FIX: Changed aria-label to be a string to fix type error and restored button content.
                            aria-label="Remove image"
                        >
                           &times;
                        </button>
                    </div>
                )}
                 <div className="flex items-center justify-between mt-2 ml-12">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-slate-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors" aria-label="Add image">
                            <ImageIcon className="h-6 w-6"/>
                        </button>
                        <button type="button" onClick={() => setPostType(postType === 'text' ? 'poll' : 'text')} className={`text-slate-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors ${postType === 'poll' ? 'text-green-600' : ''}`} aria-label="Create poll">
                            <PollIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-full text-sm hover:bg-green-700 transition-colors disabled:bg-slate-400" disabled={!content.trim() && !pollQuestion.trim()}>
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

const PollDisplay: React.FC<{ post: Post, onVote: (optionIndex: number) => void, farmerProfile: FarmerProfile }> = ({ post, onVote, farmerProfile }) => {
    const totalVotes = post.pollOptions?.reduce((sum, opt) => sum + opt.votes.length, 0) || 0;
    const userVoteIndex = post.pollOptions?.findIndex(opt => opt.votes.includes(farmerProfile.name));

    return (
        <div className="space-y-2 mt-3">
            <h4 className="font-semibold text-slate-800">{post.pollQuestion}</h4>
            {post.pollOptions?.map((option, index) => {
                const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                const hasVoted = userVoteIndex !== -1;
                const isUserChoice = userVoteIndex === index;

                return (
                    <div key={index} className="relative">
                        <button 
                            onClick={() => onVote(index)}
                            disabled={hasVoted}
                            className="w-full text-left p-2 rounded-lg border border-slate-300 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                        >
                           <div className="absolute top-0 left-0 h-full bg-green-100 rounded-lg" style={{ width: `${hasVoted ? percentage : 0}%`, transition: 'width 0.3s ease-in-out' }}></div>
                           <div className="relative z-10 flex justify-between items-center">
                               <span>{isUserChoice ? '✓ ' : ''}{option.text}</span>
                               {hasVoted && <span className="text-xs font-bold">{Math.round(percentage)}%</span>}
                           </div>
                        </button>
                    </div>
                )
            })}
            <p className="text-xs text-slate-500">{totalVotes} vote{totalVotes !== 1 && 's'}</p>
        </div>
    );
};

const CommentSection: React.FC<{ post: Post, onAddComment: (commentData: Omit<Comment, 'id' | 'createdAt' | 'farmerName'>) => void }> = ({ post, onAddComment }) => {
    const [comment, setComment] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim()) {
            onAddComment({ content: comment });
            setComment('');
        }
    };
    return (
        <div className="border-t border-slate-200 mt-3 pt-3 space-y-3">
            {post.comments.map(c => (
                <div key={c.id} className="flex items-start gap-2 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><FarmerIcon className="w-5 h-5 text-slate-500" /></div>
                    <div className="bg-slate-100 rounded-lg p-2 flex-grow">
                        <p className="font-semibold text-slate-800">{c.farmerName}</p>
                        <p className="text-slate-600">{c.content}</p>
                    </div>
                </div>
            ))}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="flex-1 w-full text-sm border-slate-300 rounded-full py-1.5 px-3 focus:ring-green-500 focus:border-green-500" />
                <button type="submit" className="text-green-600 p-1.5 rounded-full hover:bg-green-100" aria-label="Post comment"><SendIcon className="h-5 w-5" /></button>
            </form>
        </div>
    );
};

const PostCard: React.FC<{ post: Post, onReaction: () => void, onAddComment: (commentData: Omit<Comment, 'id' | 'createdAt' | 'farmerName'>) => void, onPollVote: (optionIndex: number) => void, farmerProfile: FarmerProfile }> = ({ post, onReaction, onAddComment, onPollVote, farmerProfile }) => {
    const [showComments, setShowComments] = useState(false);
    return (
         <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FarmerIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <p className="font-bold text-slate-800">{post.farmerName}</p>
                    <p className="text-xs text-slate-500">{timeAgo(post.createdAt)}</p>
                </div>
            </div>
            <p className="my-3 text-slate-700 text-sm">{post.content}</p>
            {post.isPoll && <PollDisplay post={post} onVote={onPollVote} farmerProfile={farmerProfile} />}
            {post.imageUrl && <img src={post.imageUrl} alt="Post content" className="mt-3 rounded-lg w-full max-h-80 object-cover" />}
            {post.tags && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {post.tags.map(tag => <span key={tag} className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">#{tag}</span>)}
                </div>
            )}
            <div className="flex items-center justify-between text-sm text-slate-500 mt-4">
                <div>{post.likes} Likes</div>
                <div onClick={() => setShowComments(!showComments)} className="cursor-pointer">{post.comments.length} Comments</div>
            </div>
            <div className="border-t border-slate-200 mt-2 pt-1 flex justify-around">
                <button onClick={onReaction} className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LightbulbIcon className="h-5 w-5" /> Like
                </button>
                 <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <ChatBubbleIcon className="h-5 w-5" /> Comment
                </button>
            </div>
            {showComments && <CommentSection post={post} onAddComment={(commentData) => onAddComment(commentData)} />}
        </div>
    );
};


interface CommunityFeedProps {
    posts: Post[];
    filteredPosts: Post[];
    onCreatePost: (postData: Omit<Post, 'id' | 'createdAt' | 'imageUrl' | 'likes' | 'comments' | 'farmerName'> & { imageFile: File | null }) => void;
    onPostReaction: (postId: string) => void;
    onAddComment: (postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'farmerName'>) => void;
    onPollVote: (postId: string, optionIndex: number) => void;
    farmerProfile: FarmerProfile;
    activeTag: string | null;
    onTagSelect: (tag: string | null) => void;
}

// FIX: Added export to fix import error in App.tsx
export const CommunityFeed: React.FC<CommunityFeedProps> = ({ posts, filteredPosts, onCreatePost, onPostReaction, onAddComment, onPollVote, farmerProfile, activeTag, onTagSelect }) => {
    
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        posts.forEach(post => post.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [posts]);
    
    return (
        <div className="animate-fade-in space-y-6">
            <CreatePostForm onCreatePost={onCreatePost} farmerProfile={farmerProfile} />

             <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="h-5 w-5 text-slate-500" />
                    <h3 className="font-semibold text-slate-700 text-sm">Popular Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                     <button onClick={() => onTagSelect(null)} className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${!activeTag ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                        All Posts
                    </button>
                    {allTags.map(tag => (
                        <button key={tag} onClick={() => onTagSelect(tag)} className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${activeTag === tag ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post}
                            onReaction={() => onPostReaction(post.id)}
                            onAddComment={(commentData) => onAddComment(post.id, commentData)}
                            onPollVote={(optionIndex) => onPollVote(post.id, optionIndex)}
                            farmerProfile={farmerProfile}
                        />
                    ))
                ) : (
                    <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-slate-200">
                        <UsersIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700">No Posts Found</h3>
                        <p className="text-slate-500 mt-2">
                            {activeTag ? `No posts with the tag #${activeTag} yet.` : "Be the first to share something with the community!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
