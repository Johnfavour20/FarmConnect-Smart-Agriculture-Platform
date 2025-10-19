
import React, { useState, useEffect, useMemo } from 'react';
import type { Chat } from '@google/genai';
import { Header } from './components/Header';
import { CropScanner } from './components/CropScanner';
import { DiagnosisResult } from './components/DiagnosisResult';
import { MarketplaceListingForm } from './components/MarketplaceListingForm';
import { EditListingForm } from './components/EditListingForm';
import { MarketplaceFeed } from './components/MarketplaceFeed';
import { BuyerChatView } from './components/BuyerChatView';
import { FarmerDashboard } from './components/FarmerDashboard';
import { FarmerChatView } from './components/FarmerChatView';
import { PurchaseModal } from './components/PurchaseModal';
import { PurchaseSuccess } from './components/PurchaseSuccess';
import { FarmerNav } from './components/FarmerNav';
import { CommunityFeed } from './components/CommunityFeed';
import { FarmerProfile } from './components/FarmerProfile';
import { AgronomistChat } from './components/AgronomistChat';
import { CopilotModal } from './components/CopilotModal';
import { LearningHub } from './components/LearningHub';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PostRequestModal } from './components/PostRequestModal';
import { BuyerRequestsFeed } from './components/BuyerRequestsFeed';
import { FarmerResponseModal } from './components/FarmerResponseModal';
import { FinanceTracker } from './components/FinanceTracker';
import { TransactionModal } from './components/TransactionModal';
import { SavingsGoalModal } from './components/SavingsGoalModal';
import { ContributeModal } from './components/ContributeModal';
import { diagnoseCrop, initializeChatSession, initializeBuyerChatSession, initializeFarmerChatSession, getPriceSuggestion, askAgronomist, getMarketAnalysis, routeUserQuery, getFarmingAdviceForWeather, getWeatherForecastForLocation, getReminderSuggestion, getGrowthPlan, getFinancialAnalysis } from './services/geminiService';
import { generateMockListings, generateMockTutorials, generateMockPosts } from './services/mockData';
import type { Diagnosis, ChatMessage, Listing, UserRole, AllChats, Post, Comment, FarmerProfile as FarmerProfileType, AgronomistChatMessage, CopilotChatMessage, DailyForecast, WeatherAdvice, Tutorial, TutorialCategory, Reminder, PollOption, GrowthPlanTask, GrowthPlanTaskAction, BuyerRequest, FarmerResponse, Transaction, SavingsGoal } from './types';
import { FarmerIcon, BuyerIcon, SparklesIcon } from './components/IconComponents';


type FarmerViewMode = 'dashboard' | 'community' | 'scanner' | 'diagnosis' | 'listingForm' | 'chat' | 'editListing' | 'profile' | 'agronomist' | 'learningHub' | 'buyerRequestsFeed' | 'finance';
type BuyerViewMode = 'feed' | 'chat' | 'purchaseSuccess';

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const ITEMS_PER_PAGE = {
    marketplace: 9,
    community: 5,
    finance: 10
};


const App: React.FC = () => {
  // Global State
  const [userRole, setUserRole] = useState<UserRole>('farmer');
  
  // Persistent State
  const [allListings, setAllListings] = useState<Listing[]>(() => {
    try {
      const savedListings = localStorage.getItem('farmconnect_listings');
      return savedListings ? JSON.parse(savedListings) : generateMockListings(30);
    } catch (error) {
      console.error("Failed to parse listings from localStorage", error);
      return generateMockListings(30);
    }
  });

  const [allChats, setAllChats] = useState<AllChats>(() => {
    try {
        const savedChats = localStorage.getItem('farmconnect_chats');
        return savedChats ? JSON.parse(savedChats) : {};
    } catch (error) {
        console.error("Failed to parse chats from localStorage", error);
        return {};
    }
  });

   const [allPosts, setAllPosts] = useState<Post[]>(() => {
    try {
        const savedPosts = localStorage.getItem('farmconnect_posts');
        return savedPosts ? JSON.parse(savedPosts) : generateMockPosts(15);
    } catch (error) {
        console.error("Failed to parse posts from localStorage", error);
        return generateMockPosts(15);
    }
  });

   const [farmerProfile, setFarmerProfile] = useState<FarmerProfileType | null>(() => {
    try {
      const savedProfile = localStorage.getItem('farmconnect_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        // Add level/xp if they don't exist for backward compatibility
        return {
          ...parsed,
          level: parsed.level || 1,
          xp: parsed.xp || 0,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to parse profile from localStorage", error);
      return null;
    }
  });

  const [allReminders, setAllReminders] = useState<Reminder[]>(() => {
    try {
      const savedReminders = localStorage.getItem('farmconnect_reminders');
      return savedReminders ? JSON.parse(savedReminders) : [];
    } catch (error) {
      console.error("Failed to parse reminders from localStorage", error);
      return [];
    }
  });

  const [allBuyerRequests, setAllBuyerRequests] = useState<BuyerRequest[]>(() => {
    try {
      const savedRequests = localStorage.getItem('farmconnect_buyer_requests');
      return savedRequests ? JSON.parse(savedRequests) : [];
    } catch (error) {
      console.error("Failed to parse buyer requests from localStorage", error);
      return [];
    }
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('farmconnect_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse transactions from localStorage", error);
      return [];
    }
  });

  const [allSavingsGoals, setAllSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
        const saved = localStorage.getItem('farmconnect_savings_goals');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Failed to parse savings goals from localStorage", error);
        return [];
    }
  });

  const [buyerName, setBuyerName] = useState<string>(() => {
    return localStorage.getItem('farmconnect_buyer_name') || '';
  });


  // Farmer Flow State
  const [farmerView, setFarmerView] = useState<FarmerViewMode>('dashboard');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [farmerFollowUpChat, setFarmerFollowUpChat] = useState<Chat | null>(null);
  const [farmerFollowUpHistory, setFarmerFollowUpHistory] = useState<ChatMessage[]>([]);
  const [isFarmerFollowUpLoading, setIsFarmerFollowUpLoading] = useState<boolean>(false);
  const [listingToEdit, setListingToEdit] = useState<Listing | null>(null);
  
  // Agronomist Chat State
  const [agronomistChatHistory, setAgronomistChatHistory] = useState<AgronomistChatMessage[]>([]);
  const [isAgronomistChatLoading, setIsAgronomistChatLoading] = useState<boolean>(false);

  // Price Suggestion State
  const [priceSuggestion, setPriceSuggestion] = useState<string | null>(null);
  const [isPriceSuggestionLoading, setIsPriceSuggestionLoading] = useState<boolean>(false);
  const [priceSuggestionError, setPriceSuggestionError] = useState<string | null>(null);

  // Market Pulse State
  const [marketAnalysis, setMarketAnalysis] = useState<string | null>(null);
  const [isMarketAnalysisLoading, setIsMarketAnalysisLoading] = useState<boolean>(false);
  const [marketAnalysisError, setMarketAnalysisError] = useState<string | null>(null);

  // Finance Tracker State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [financialAnalysis, setFinancialAnalysis] = useState<string | null>(null);
  const [isFinancialAnalysisLoading, setIsFinancialAnalysisLoading] = useState<boolean>(false);
  const [isSavingsGoalModalOpen, setIsSavingsGoalModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null);


  // Weather State
  const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Growth Plan State
  const [growthPlanTasks, setGrowthPlanTasks] = useState<GrowthPlanTask[]>([]);
  const [isGrowthPlanLoading, setIsGrowthPlanLoading] = useState<boolean>(false);
  const [growthPlanError, setGrowthPlanError] = useState<string | null>(null);

  // Co-pilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotChatHistory, setCopilotChatHistory] = useState<CopilotChatMessage[]>([]);
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

  // Learning Hub State
  const [learningHubContent, setLearningHubContent] = useState<TutorialCategory[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // Community Feed State
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);


  // Buyer Flow State
  const [buyerView, setBuyerView] = useState<BuyerViewMode>('feed');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);
  const [isPostRequestModalOpen, setIsPostRequestModalOpen] = useState<boolean>(false);
  const [purchaseSuccessDetails, setPurchaseSuccessDetails] = useState<{listing: Omit<Listing, 'id' | 'imageUrl'>, quantity: number} | null>(null);
  const [filters, setFilters] = useState<{ cropType: string; location: string }>({ cropType: 'all', location: '' });

  // Farmer Response State
  const [requestToRespond, setRequestToRespond] = useState<BuyerRequest | null>(null);


  // Unified Chat State
  const [activeChatSession, setActiveChatSession] = useState<Chat | null>(null);
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  // Scalability/Pagination State
  const [visibleCounts, setVisibleCounts] = useState({
      marketplace: ITEMS_PER_PAGE.marketplace,
      community: ITEMS_PER_PAGE.community,
      finance: ITEMS_PER_PAGE.finance,
  });


  // Persist listings to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_listings', JSON.stringify(allListings));
  }, [allListings]);

  // Persist chats to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_chats', JSON.stringify(allChats));
  }, [allChats]);

  // Persist posts to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_posts', JSON.stringify(allPosts));
  }, [allPosts]);
  
  // Persist profile to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_profile', JSON.stringify(farmerProfile));
  }, [farmerProfile]);

  // Persist reminders to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_reminders', JSON.stringify(allReminders));
  }, [allReminders]);

  // Persist buyer requests to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_buyer_requests', JSON.stringify(allBuyerRequests));
  }, [allBuyerRequests]);

  // Persist transactions to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_transactions', JSON.stringify(allTransactions));
  }, [allTransactions]);

  // Persist savings goals to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_savings_goals', JSON.stringify(allSavingsGoals));
  }, [allSavingsGoals]);

  // Persist buyer name to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_buyer_name', buyerName);
  }, [buyerName]);

  
  // Effect to set initial farmer view
  useEffect(() => {
     if(userRole === 'farmer' && farmerProfile) {
        setFarmerView('dashboard');
     }
  }, [userRole, farmerProfile]);

  // Set initial Copilot message
   useEffect(() => {
    if (farmerProfile && copilotChatHistory.length === 0) {
      setCopilotChatHistory([
        {
          role: 'system',
          content: `Hi ${farmerProfile.name}! I'm your AI Co-pilot. How can I help you today? You can ask me to analyze a crop image, get a price suggestion, or check market trends.`,
        },
      ]);
    }
  }, [farmerProfile]);

  // Fetch weather when farmer profile (specifically farm location) is available or changes.
  useEffect(() => {
    if (userRole === 'farmer' && farmerProfile) {
      handleFetchWeatherAndAdvice();
    }
  }, [userRole, farmerProfile?.farmLocation]);

  // Load Learning Hub content on mount
  useEffect(() => {
    setLearningHubContent(generateMockTutorials());
  }, []);
  
  // Handle deep linking to posts
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post_id');
        const view = params.get('view');

        if (userRole === 'farmer' && view === 'community' && postId) {
            const postExists = allPosts.some(p => p.id === postId);
            if (postExists) {
                setFarmerView('community');
                // Ensure the post is visible before trying to scroll
                setVisibleCounts(prev => ({ ...prev, community: allPosts.length }));

                setTimeout(() => {
                    const postElement = document.getElementById(`post-${postId}`);
                    if (postElement) {
                        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        postElement.classList.add('highlight-post');
                        setTimeout(() => {
                            postElement.classList.remove('highlight-post');
                        }, 3000);
                    }
                }, 200); // Delay to allow rendering
            }

            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('post_id');
            url.searchParams.delete('view');
            window.history.replaceState({}, '', url.toString());
        }
    }, [userRole, allPosts]);


  const handleDiagnose = async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }
    setIsDiagnosing(true);
    setError(null);
    setDiagnosis(null);
    try {
      const result = await diagnoseCrop(imageFile);
      setDiagnosis(result);
      setFarmerView('diagnosis');

      const chatSession = initializeChatSession(result);
      setFarmerFollowUpChat(chatSession);
      const initialModelResponse = `I have reviewed your diagnosis for **${result.cropType} - ${result.diseaseName}**. I'm here to help with any follow-up questions you have about treatment, prevention, or anything else. What's on your mind?`;
      setFarmerFollowUpHistory([{ role: 'model', content: initialModelResponse }]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  const handleFarmerFollowUpSendMessage = async (message: string) => {
    if (!farmerFollowUpChat) return;
    setIsFarmerFollowUpLoading(true);
    setFarmerFollowUpHistory(prev => [...prev, { role: 'user', content: message }]);
    try {
      const response = await farmerFollowUpChat.sendMessage({ message });
      setFarmerFollowUpHistory(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (err) {
      console.error("Error sending chat message:", err);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setFarmerFollowUpHistory(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsFarmerFollowUpLoading(false);
    }
  };

  const handleAskAgronomist = async (prompt: string, image: File | null) => {
    setIsAgronomistChatLoading(true);
    const userMessage: AgronomistChatMessage = {
        role: 'user',
        text: prompt,
        imageUrl: image ? URL.createObjectURL(image) : undefined
    };
    setAgronomistChatHistory(prev => [...prev, userMessage]);

    try {
        const responseText = await askAgronomist(prompt, image);
        const modelMessage: AgronomistChatMessage = { role: 'model', text: responseText };
        setAgronomistChatHistory(prev => [...prev, modelMessage]);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        const modelMessage: AgronomistChatMessage = { role: 'model', text: `Sorry, I ran into an error: ${errorMessage}` };
        setAgronomistChatHistory(prev => [...prev, modelMessage]);
    } finally {
        setIsAgronomistChatLoading(false);
    }
  };

  const handleGetPriceSuggestion = async (cropType: string, location: string) => {
    if(!cropType || !location) {
        setPriceSuggestionError("Please enter a location to get a suggestion.");
        return;
    }
    setIsPriceSuggestionLoading(true);
    setPriceSuggestion(null);
    setPriceSuggestionError(null);
    try {
      const suggestion = await getPriceSuggestion(cropType, location);
      setPriceSuggestion(suggestion);
    } catch (err) {
      setPriceSuggestionError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsPriceSuggestionLoading(false);
    }
  };

  const handleFetchMarketAnalysis = async () => {
    setIsMarketAnalysisLoading(true);
    setMarketAnalysis(null);
    setMarketAnalysisError(null);
    try {
        const analysis = await getMarketAnalysis(allListings);
        setMarketAnalysis(analysis);
    } catch (err) {
        setMarketAnalysisError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsMarketAnalysisLoading(false);
    }
  };

  const handleFetchFinancialAnalysis = async () => {
    if (!farmerProfile) return;
    setIsFinancialAnalysisLoading(true);
    setFinancialAnalysis(null);
    try {
        const analysis = await getFinancialAnalysis(allTransactions, farmerProfile);
        setFinancialAnalysis(analysis);
    } catch (err) {
        setFinancialAnalysis(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsFinancialAnalysisLoading(false);
    }
  };

  const handleFetchWeatherAndAdvice = async () => {
    if (!farmerProfile) return;

    if (!farmerProfile.farmLocation || farmerProfile.farmLocation.trim() === '') {
        setWeatherError("Set your farm's location in your profile to get a forecast.");
        setWeatherAdvice(null);
        setIsWeatherLoading(false);
        return;
    }

    setIsWeatherLoading(true);
    setWeatherError(null);

    try {
        const forecastData = await getWeatherForecastForLocation(farmerProfile.farmLocation);
        const advice = await getFarmingAdviceForWeather(forecastData, farmerProfile);
        
        setWeatherAdvice({
            forecast: forecastData,
            ...advice
        });

    } catch(err) {
        setWeatherError(err instanceof Error ? err.message : 'An unknown error occurred getting weather data.');
    } finally {
        setIsWeatherLoading(false);
    }
  };

  const handleFetchGrowthPlan = async () => {
    if (!farmerProfile) return;
    setIsGrowthPlanLoading(true);
    setGrowthPlanError(null);
    try {
      const farmerListings = allListings.filter(l => l.farmerName === farmerProfile.name);
      const farmerPosts = allPosts.filter(p => p.farmerName === farmerProfile.name);
      const tasks = await getGrowthPlan(farmerProfile, farmerListings, farmerPosts, learningHubContent);
      setGrowthPlanTasks(tasks);
    } catch (err) {
      setGrowthPlanError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGrowthPlanLoading(false);
    }
  };

  const handleCompleteGrowthPlanTask = (taskId: string, xpGained: number) => {
    if (!farmerProfile) return;

    let newXp = farmerProfile.xp + xpGained;
    let newLevel = farmerProfile.level;
    let xpForNextLevel = newLevel * 100;

    while (newXp >= xpForNextLevel) {
        newLevel += 1;
        newXp -= xpForNextLevel;
        xpForNextLevel = newLevel * 100;
        // In a real app, you might trigger a "Level Up!" notification here
    }

    setFarmerProfile(prev => prev ? { ...prev, level: newLevel, xp: newXp } : null);
    setGrowthPlanTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleGrowthPlanAction = (action: GrowthPlanTaskAction, targetId?: string) => {
    switch(action) {
      case 'VIEW_TUTORIAL':
        if(targetId) {
          const tutorial = learningHubContent.flatMap(c => c.tutorials).find(t => t.id === targetId);
          if (tutorial) handleSelectTutorial(tutorial);
          else setFarmerView('learningHub');
        } else {
          setFarmerView('learningHub');
        }
        break;
      case 'CREATE_POST':
        setFarmerView('community');
        break;
      case 'EDIT_LISTING':
        if (targetId) {
            const listing = allListings.find(l => l.id === targetId);
            if (listing) handleEditListing(listing);
            else setFarmerView('dashboard');
        } else {
            setFarmerView('dashboard');
        }
        break;
      case 'INSPECT_CROP':
        setFarmerView('scanner');
        break;
      case 'LEARN_MORE':
        setFarmerView('agronomist');
        break;
      default:
        setFarmerView('dashboard');
    }
  };

  const handleCopilotSendMessage = async (prompt: string, image: File | null) => {
    setIsCopilotLoading(true);
    const userMessage: CopilotChatMessage = {
      role: 'user',
      content: prompt,
      imageUrl: image ? URL.createObjectURL(image) : undefined,
    };
    setCopilotChatHistory(prev => [...prev, userMessage]);

    try {
      const result = await routeUserQuery(prompt, image, allListings);
      const modelMessage: CopilotChatMessage = { role: 'model', content: result };
      setCopilotChatHistory(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      const modelMessage: CopilotChatMessage = { role: 'model', content: `Sorry, I ran into an error: ${errorMessage}` };
      setCopilotChatHistory(prev => [...prev, modelMessage]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const clearPriceSuggestion = () => {
    setPriceSuggestion(null);
    setPriceSuggestionError(null);
  };
  
  const handlePublishListing = async (listingData: Omit<Listing, 'id' | 'imageUrl' | 'farmerName'>) => {
    if (imageFile && farmerProfile) {
        const imageUrl = await fileToDataUrl(imageFile);
        const newListing: Listing = {
            id: Date.now().toString(),
            ...listingData,
            farmerName: farmerProfile.name,
            imageUrl: imageUrl
        };
        setAllListings(prev => [newListing, ...prev]);
        setFarmerView('dashboard');
        clearPriceSuggestion();
    }
  };

  const handleEditListing = (listing: Listing) => {
    setListingToEdit(listing);
    setFarmerView('editListing');
  };
  
  const handleUpdateListing = (updatedListing: Listing) => {
    setAllListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
    setListingToEdit(null);
    setFarmerView('dashboard');
    clearPriceSuggestion();
  };

  const handleDeleteListing = (listingId: string) => {
    setAllListings(prev => prev.filter(l => l.id !== listingId));
    setAllChats(prev => {
        const newChats = {...prev};
        delete newChats[listingId];
        return newChats;
    });
  };

   const handleCreatePost = async (postData: Omit<Post, 'id' | 'createdAt' | 'imageUrl' | 'likes' | 'comments' | 'farmerName'> & { imageFile: File | null }) => {
    if (!farmerProfile) return;
    
    let imageUrl: string | undefined = undefined;
    if (postData.imageFile) {
        imageUrl = await fileToDataUrl(postData.imageFile);
    }

    const newPost: Post = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        farmerName: farmerProfile.name,
        likes: 0,
        comments: [],
        imageUrl,
        ...postData,
    };
    setAllPosts(prev => [newPost, ...prev]);
  };

  const handlePostReaction = (postId: string) => {
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };
  
  const handleAddComment = (postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'farmerName'>) => {
    if (!farmerProfile) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      farmerName: farmerProfile.name,
      ...commentData
    };
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
  };
  
  const handlePollVote = (postId: string, optionIndex: number) => {
    if (!farmerProfile) return;
    setAllPosts(prev => prev.map(p => {
        if (p.id === postId && p.isPoll && p.pollOptions) {
            // FIX: This logic was flawed. It removed votes from all other options on any vote.
            // Correct logic: remove previous vote if it exists, then add new vote.
            const newOptions = p.pollOptions.map((opt, index) => {
                // Remove this user's vote if it exists on any option
                const votes = opt.votes.filter(voter => voter !== farmerProfile.name);
                return { ...opt, votes };
            });
            
            // Add the new vote to the selected option if they haven't voted for it already
            if (!newOptions[optionIndex].votes.includes(farmerProfile.name)) {
                 newOptions[optionIndex].votes.push(farmerProfile.name);
            }
           
            return { ...p, pollOptions: newOptions };
        }
        return p;
    }));
};

  const handleSaveProfile = async (profileData: Omit<FarmerProfileType, 'level'|'xp'|'profilePictureUrl'>, imageFile: File | null) => {
    let profilePictureUrl = farmerProfile?.profilePictureUrl;
    if (imageFile) {
        profilePictureUrl = await fileToDataUrl(imageFile);
    }
    
    setFarmerProfile(prev => ({
        ...prev,
        ...profileData,
        profilePictureUrl,
        level: prev?.level || 1,
        xp: prev?.xp || 0
    }));
    setFarmerView('dashboard');
  };

  const handleResetScanner = () => {
    setFarmerView('scanner');
    setImageFile(null);
    setDiagnosis(null);
    setError(null);
    setIsDiagnosing(false);
    setFarmerFollowUpChat(null);
    setFarmerFollowUpHistory([]);
    setIsFarmerFollowUpLoading(false);
  };

  // Reminder Actions
  const handleAddReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      ...reminderData,
    };
    setAllReminders(prev => [newReminder, ...prev]);
  };

  const handleToggleReminder = (reminderId: string) => {
    setAllReminders(prev =>
      prev.map(r => (r.id === reminderId ? { ...r, isComplete: !r.isComplete } : r))
    );
  };
  
  const handleGetReminderSuggestion = async () => {
    if (!farmerProfile || !weatherAdvice) {
        console.warn("Cannot get suggestion without profile and weather data.");
        return null;
    }
    try {
        const farmerPosts = allPosts.filter(p => p.farmerName === farmerProfile.name);
        const suggestion = await getReminderSuggestion(farmerProfile, allListings, weatherAdvice.forecast, allTransactions, farmerPosts);
        return suggestion;
    } catch(err) {
        console.error("Error getting reminder suggestion:", err);
        return null;
    }
  };
  
  // Buyer Request Actions
  const handlePostBuyerRequest = (requestData: Omit<BuyerRequest, 'id' | 'createdAt' | 'responses' | 'buyerName'>, name: string) => {
    if (buyerName !== name) {
        setBuyerName(name);
    }
    const newRequest: BuyerRequest = {
        id: `req_${Date.now()}`,
        buyerName: name,
        createdAt: Date.now(),
        responses: [],
        ...requestData
    };
    setAllBuyerRequests(prev => [newRequest, ...prev].sort((a,b) => b.createdAt - a.createdAt));
    setIsPostRequestModalOpen(false);
  };

  const handleRespondToRequest = (listingId: string) => {
    if (!requestToRespond || !farmerProfile) return;
    
    const newResponse: FarmerResponse = {
        farmerName: farmerProfile.name,
        listingId: listingId,
        createdAt: Date.now()
    };

    setAllBuyerRequests(prev => prev.map(req => 
        req.id === requestToRespond.id
            ? { ...req, responses: [...req.responses, newResponse] }
            : req
    ));

    setRequestToRespond(null); // Close the modal
  };

  // Transaction Actions
  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        ...transactionData,
    };
    setAllTransactions(prev => [newTransaction, ...prev]);
    setIsTransactionModalOpen(false);
  };

  // Savings Goal Actions
  const handleAddSavingsGoal = (name: string, targetAmount: number) => {
    const newGoal: SavingsGoal = {
        id: `goal_${Date.now()}`,
        name,
        targetAmount,
        currentAmount: 0,
        createdAt: Date.now()
    };
    setAllSavingsGoals(prev => [newGoal, ...prev]);
    setIsSavingsGoalModalOpen(false);
  };

  const handleOpenContributeModal = (goal: SavingsGoal) => {
      setGoalToContribute(goal);
      setIsContributeModalOpen(true);
  };

  const handleContributeToGoal = (goalId: string, amount: number) => {
      // Add to savings goal
      setAllSavingsGoals(prev => prev.map(g => 
          g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      ));

      // Create corresponding transaction
      const goal = allSavingsGoals.find(g => g.id === goalId);
      if (goal) {
          handleAddTransaction({
              type: 'expense',
              date: Date.now(),
              description: `Contribution to "${goal.name}" goal`,
              amount: amount,
              category: 'Savings Contribution'
          });
      }
      setIsContributeModalOpen(false);
      setGoalToContribute(null);
  };

  // Unified Chat Actions
  const handleSendMessage = async (message: string) => {
    if (!activeChatSession || !activeListing) return;
    setIsChatLoading(true);

    const listingId = activeListing.id;
    const newHistory = [...(allChats[listingId] || []), { role: 'user', content: message } as ChatMessage];
    setAllChats(prev => ({...prev, [listingId]: newHistory }));

    try {
        const response = await activeChatSession.sendMessage({ message });
        const modelResponse = { role: 'model', content: response.text } as ChatMessage;
        setAllChats(prev => ({...prev, [listingId]: [...newHistory, modelResponse] }));
    } catch (err) {
        console.error("Error sending buyer chat message:", err);
        const errorMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." } as ChatMessage;
        setAllChats(prev => ({...prev, [listingId]: [...newHistory, errorMessage] }));
    } finally {
        setIsChatLoading(false);
    }
  };
  
  // Buyer starts a chat
  const handleContactFarmer = (listing: Listing) => {
    setActiveListing(listing);
    const { chatSession, initialMessage } = initializeBuyerChatSession(listing);
    setActiveChatSession(chatSession);
    
    if(!allChats[listing.id]){
        setAllChats(prev => ({...prev, [listing.id]: [{ role: 'model', content: initialMessage }]}));
    }
    
    setBuyerView('chat');
  };

  // Farmer views a chat
  const handleViewChat = (listing: Listing) => {
    setActiveListing(listing);
    const chatSession = initializeFarmerChatSession(listing, allChats[listing.id] || []);
    setActiveChatSession(chatSession);
    setFarmerView('chat');
  };


  const handleConfirmPurchase = (listingId: string, quantity: number) => {
    const listingToUpdate = allListings.find(l => l.id === listingId);
    if(!listingToUpdate) return;
    
    // Auto-log income transaction
    const incomeAmount = quantity * listingToUpdate.pricePerKg;
    handleAddTransaction({
        type: 'income',
        date: Date.now(),
        description: `Sale of ${quantity}kg ${listingToUpdate.cropType}`,
        amount: incomeAmount,
        category: 'Marketplace Sale'
    });

    // Update listing quantity
    setAllListings(prev => {
        const updatedListings = prev.map(l => {
            if (l.id === listingId) {
                return { ...l, quantityKg: l.quantityKg - quantity };
            }
            return l;
        });
        return updatedListings.filter(l => l.quantityKg > 0);
    });

    setPurchaseSuccessDetails({ 
        listing: {
            cropType: listingToUpdate.cropType,
            pricePerKg: listingToUpdate.pricePerKg,
            quantityKg: listingToUpdate.quantityKg,
            location: listingToUpdate.location,
            description: listingToUpdate.description,
            farmerName: listingToUpdate.farmerName,
        }, 
        quantity: quantity 
    });
    setIsPurchaseModalOpen(false);
    setBuyerView('purchaseSuccess');
  };

  // Learning Hub Actions
  const handleSelectTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setIsVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTutorial(null);
  };

  const handleAskAboutTutorial = () => {
    handleCloseVideoModal();
    setFarmerView('agronomist');
  };

  const handleBackToMarketplace = () => {
    setBuyerView('feed');
    setActiveListing(null);
    setActiveChatSession(null);
    setPurchaseSuccessDetails(null);
  };
  
  const handleBackToDashboard = () => {
      setFarmerView('dashboard');
      setActiveListing(null);
      setActiveChatSession(null);
      clearPriceSuggestion();
  };
  
  const handleLoadMore = (view: 'marketplace' | 'community' | 'finance') => {
        setVisibleCounts(prev => ({
            ...prev,
            [view]: prev[view] + ITEMS_PER_PAGE[view],
        }));
  };
  
  const filteredListings = useMemo(() => {
    return allListings.filter(listing => {
        const cropMatch = filters.cropType === 'all' || listing.cropType === filters.cropType;
        const locationMatch = !filters.location || listing.location.toLowerCase().includes(filters.location.toLowerCase());
        return cropMatch && locationMatch;
    });
  }, [allListings, filters]);

  const farmerPosts = useMemo(() => {
    if (!farmerProfile) return [];
    return allPosts.filter(post => post.farmerName === farmerProfile.name);
  }, [allPosts, farmerProfile]);

  const filteredCommunityPosts = useMemo(() => {
    if (!activeTagFilter) {
        return allPosts;
    }
    return allPosts.filter(post => post.tags && post.tags.includes(activeTagFilter));
  }, [allPosts, activeTagFilter]);

  const renderFarmerContent = () => {
    if (!farmerProfile) {
        return <FarmerProfile profile={null} onSave={handleSaveProfile} userPosts={[]} />;
    }
    
    switch (farmerView) {
      case 'scanner':
        return (
          <CropScanner 
            onImageSelect={setImageFile} 
            onDiagnose={handleDiagnose}
            isLoading={isDiagnosing}
            error={error}
            imageFile={imageFile}
          />
        );
      case 'diagnosis':
        if (diagnosis) {
          return (
            <DiagnosisResult 
              diagnosis={diagnosis} 
              imageFile={imageFile}
              onReset={handleResetScanner}
              onListProduce={() => setFarmerView('listingForm')}
              onAddReminder={handleAddReminder}
              chatHistory={farmerFollowUpHistory}
              isChatLoading={isFarmerFollowUpLoading}
              onSendMessage={handleFarmerFollowUpSendMessage}
            />
          );
        }
        return null;
       case 'listingForm':
         if(diagnosis && imageFile){
            return(
                <MarketplaceListingForm 
                    diagnosis={diagnosis}
                    imageFile={imageFile}
                    onPublish={handlePublishListing}
                    onCancel={() => setFarmerView('diagnosis')}
                    farmerProfile={farmerProfile}
                    onGetPriceSuggestion={handleGetPriceSuggestion}
                    priceSuggestion={priceSuggestion}
                    isPriceSuggestionLoading={isPriceSuggestionLoading}
                    priceSuggestionError={priceSuggestionError}
                    onClearPriceSuggestion={clearPriceSuggestion}
                />
            )
         }
         return null;
       case 'dashboard':
          return <FarmerDashboard 
                    listings={allListings.filter(l => l.farmerName === farmerProfile.name)} 
                    allChats={allChats} 
                    allPosts={allPosts}
                    transactions={allTransactions}
                    farmerProfile={farmerProfile}
                    onViewChat={handleViewChat} 
                    onEdit={handleEditListing}
                    onDelete={handleDeleteListing}
                    onFetchMarketAnalysis={handleFetchMarketAnalysis}
                    marketAnalysis={marketAnalysis}
                    isMarketAnalysisLoading={isMarketAnalysisLoading}
                    marketAnalysisError={marketAnalysisError}
                    weatherAdvice={weatherAdvice}
                    isWeatherLoading={isWeatherLoading}
                    weatherError={weatherError}
                    onFetchWeather={handleFetchWeatherAndAdvice}
                    reminders={allReminders}
                    onAddReminder={handleAddReminder}
                    onToggleReminder={handleToggleReminder}
                    onGetReminderSuggestion={handleGetReminderSuggestion}
                    growthPlanTasks={growthPlanTasks}
                    isGrowthPlanLoading={isGrowthPlanLoading}
                    growthPlanError={growthPlanError}
                    onFetchGrowthPlan={handleFetchGrowthPlan}
                    onCompleteGrowthPlanTask={handleCompleteGrowthPlanTask}
                    onNavigate={(view) => handleGrowthPlanAction(view as GrowthPlanTaskAction)}
                />;
       case 'community':
            return <CommunityFeed 
                posts={allPosts}
                filteredPosts={filteredCommunityPosts} 
                onCreatePost={handleCreatePost}
                onPostReaction={handlePostReaction}
                onAddComment={handleAddComment}
                onPollVote={handlePollVote}
                farmerProfile={farmerProfile}
                activeTag={activeTagFilter}
                onTagSelect={setActiveTagFilter}
                visibleCount={visibleCounts.community}
                onLoadMore={() => handleLoadMore('community')}
            />;
       case 'buyerRequestsFeed':
            return <BuyerRequestsFeed
                requests={allBuyerRequests}
                onRespond={setRequestToRespond}
                farmerProfile={farmerProfile}
            />;
       case 'finance':
            return <FinanceTracker
                transactions={allTransactions}
                savingsGoals={allSavingsGoals}
                farmerProfile={farmerProfile}
                onAddTransaction={() => setIsTransactionModalOpen(true)}
                onAddGoal={() => setIsSavingsGoalModalOpen(true)}
                onContributeToGoal={handleOpenContributeModal}
                financialAnalysis={financialAnalysis}
                isFinancialAnalysisLoading={isFinancialAnalysisLoading}
                onFetchFinancialAnalysis={handleFetchFinancialAnalysis}
                visibleCount={visibleCounts.finance}
                onLoadMore={() => handleLoadMore('finance')}
            />;
      case 'agronomist':
            return <AgronomistChat
                chatHistory={agronomistChatHistory}
                isChatLoading={isAgronomistChatLoading}
                onAsk={handleAskAgronomist}
            />;
       case 'profile':
            return <FarmerProfile
                profile={farmerProfile}
                onSave={handleSaveProfile}
                userPosts={farmerPosts}
            />;
       case 'learningHub':
            return <LearningHub 
                categories={learningHubContent}
                onSelectTutorial={handleSelectTutorial}
            />;
       case 'editListing':
          if(listingToEdit) {
            return <EditListingForm 
                listing={listingToEdit}
                onUpdate={handleUpdateListing}
                onCancel={handleBackToDashboard}
                onGetPriceSuggestion={handleGetPriceSuggestion}
                priceSuggestion={priceSuggestion}
                isPriceSuggestionLoading={isPriceSuggestionLoading}
                priceSuggestionError={priceSuggestionError}
                onClearPriceSuggestion={clearPriceSuggestion}
            />
          }
          return null;
       case 'chat':
          if(activeListing) {
            return <FarmerChatView 
                listing={activeListing}
                chatHistory={allChats[activeListing.id] || []}
                isChatLoading={isChatLoading}
                onSendMessage={handleSendMessage}
                onBack={handleBackToDashboard}
                farmerProfile={farmerProfile}
            />
          }
          return null;
      default:
        return null;
    }
  }

  const renderBuyerContent = () => {
    switch (buyerView) {
      case 'feed':
        return <MarketplaceFeed 
            allListings={allListings}
            filteredListings={filteredListings} 
            onContactFarmer={handleContactFarmer} 
            filters={filters}
            onFilterChange={setFilters}
            onPostRequest={() => setIsPostRequestModalOpen(true)}
            visibleCount={visibleCounts.marketplace}
            onLoadMore={() => handleLoadMore('marketplace')}
            farmerProfile={farmerProfile}
        />;
      case 'chat':
        if (activeListing) {
          return (
            <>
              <BuyerChatView
                listing={activeListing}
                chatHistory={allChats[activeListing.id] || []}
                isChatLoading={isChatLoading}
                onSendMessage={handleSendMessage}
                onBack={handleBackToMarketplace}
                onMakeOffer={() => setIsPurchaseModalOpen(true)}
                farmerProfile={farmerProfile}
              />
              {isPurchaseModalOpen && (
                 <PurchaseModal
                    listing={activeListing}
                    onClose={() => setIsPurchaseModalOpen(false)}
                    onConfirm={handleConfirmPurchase}
                 />
              )}
            </>
          );
        }
        return null;
       case 'purchaseSuccess':
        if(purchaseSuccessDetails){
            return <PurchaseSuccess details={purchaseSuccessDetails} onDone={handleBackToMarketplace} />
        }
        return null;
      default:
        return null;
    }
  };


  const RoleButton: React.FC<{
    role: UserRole, 
    label: string, 
    icon: React.ReactNode, 
    isActive: boolean, 
    onClick: () => void 
  }> = ({ role, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full text-md font-bold transition-all duration-300 ${
        isActive
          ? 'bg-green-600 text-white shadow-lg'
          : 'bg-white text-slate-600 hover:bg-green-100'
      }`}
      aria-pressed={isActive}
    >
      {icon}
      {label}
    </button>
  );

  const showCopilotButton = userRole === 'farmer' && farmerProfile && ['dashboard', 'community', 'scanner', 'profile', 'learningHub', 'buyerRequestsFeed', 'finance'].includes(farmerView);

  return (
    <div className="min-h-screen bg-green-50/50 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="p-1.5 bg-slate-200/70 rounded-full grid grid-cols-2 gap-2 max-w-sm mx-auto mb-8">
            <RoleButton role="farmer" label="I'm a Farmer" icon={<FarmerIcon className="h-5 w-5"/>} isActive={userRole === 'farmer'} onClick={() => setUserRole('farmer')} />
            <RoleButton role="buyer" label="I'm a Buyer" icon={<BuyerIcon className="h-5 w-5"/>} isActive={userRole === 'buyer'} onClick={() => setUserRole('buyer')} />
          </div>

          {userRole === 'farmer' ? (
            <div className="space-y-6">
                {farmerProfile && <FarmerNav activeView={farmerView} onNavigate={(view) => setFarmerView(view)} profile={farmerProfile}/>}
                {renderFarmerContent()}
            </div>
           ) : (
            renderBuyerContent()
           )}
        </div>
      </main>
      
      {showCopilotButton && (
        <button 
            onClick={() => setIsCopilotOpen(true)}
            className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-xl hover:bg-blue-700 transition-all transform hover:scale-110"
            aria-label="Open AI Co-pilot"
        >
            <SparklesIcon className="h-8 w-8" />
        </button>
      )}

      {isPostRequestModalOpen && (
        <PostRequestModal 
            onClose={() => setIsPostRequestModalOpen(false)}
            onPostRequest={handlePostBuyerRequest}
            currentBuyerName={buyerName}
        />
      )}

      {requestToRespond && farmerProfile && (
        <FarmerResponseModal
            request={requestToRespond}
            farmerListings={allListings.filter(l => l.farmerName === farmerProfile.name)}
            onClose={() => setRequestToRespond(null)}
            onSendOffer={handleRespondToRequest}
        />
      )}

      {isTransactionModalOpen && (
          <TransactionModal 
            onClose={() => setIsTransactionModalOpen(false)}
            onAddTransaction={handleAddTransaction}
          />
      )}

      {isSavingsGoalModalOpen && (
          <SavingsGoalModal
              onClose={() => setIsSavingsGoalModalOpen(false)}
              onAddGoal={handleAddSavingsGoal}
          />
      )}
      
      {isContributeModalOpen && goalToContribute && (
          <ContributeModal
              goal={goalToContribute}
              onClose={() => setIsContributeModalOpen(false)}
              onContribute={handleContributeToGoal}
          />
      )}

      <CopilotModal 
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        chatHistory={copilotChatHistory}
        isChatLoading={isCopilotLoading}
        onSendMessage={handleCopilotSendMessage}
      />
      {isVideoModalOpen && selectedTutorial && (
        <VideoPlayerModal 
            tutorial={selectedTutorial}
            onClose={handleCloseVideoModal}
            onAskExpert={handleAskAboutTutorial}
        />
      )}
    </div>
  );
};

export default App;