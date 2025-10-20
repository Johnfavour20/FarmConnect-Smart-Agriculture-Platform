import React, { useState, useEffect, useCallback } from 'react';

// Import Types
import type {
  Diagnosis,
  ChatMessage,
  Listing,
  FarmerProfile,
  AllChats,
  UserRole,
  Post,
  Comment,
  AgronomistChatMessage,
  CopilotChatMessage,
  CopilotMessageContent,
  WeatherAdvice,
  Tutorial,
  TutorialCategory,
  Reminder,
  GrowthPlanTask,
  BuyerRequest,
  FarmerResponse,
  Transaction,
  SavingsGoal,
  FinancialAnalysis,
  FinancialReportData,
  CooperativePledge,
  Order,
  Wallet,
  Payout,
  PayoutStatus
} from './types';

// Import Components
import { Header } from './components/Header';
import { CropScanner } from './components/CropScanner';
import { DiagnosisResult } from './components/DiagnosisResult';
import { MarketplaceListingForm } from './components/MarketplaceListingForm';
import { ListingSuccess } from './components/ListingSuccess';
import { FarmerNav } from './components/FarmerNav';
import { FarmerDashboard } from './components/FarmerDashboard';
import { FarmerChatView } from './components/FarmerChatView';
import { EditListingForm } from './components/EditListingForm';
// FIX: Aliased FarmerProfile component to avoid name collision with the FarmerProfile type.
import { FarmerProfile as FarmerProfileComponent } from './components/FarmerProfile';
import { CommunityFeed } from './components/CommunityFeed';
import { AgronomistChat } from './components/AgronomistChat';
import { CopilotModal } from './components/CopilotModal';
import { LearningHub } from './components/LearningHub';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { BuyerRequestsFeed } from './components/BuyerRequestsFeed';
import { FarmerResponseModal } from './components/FarmerResponseModal';
import { FinanceTracker } from './components/FinanceTracker';
import { FinancialReportModal } from './components/FinancialReportModal';
import { CooperativeHub } from './components/CooperativeHub';
import { InitiateCooperativeModal } from './components/InitiateCooperativeModal';
import { JoinCooperativeModal } from './components/JoinCooperativeModal';
import { WalletView } from './components/WalletView';


// Buyer Components
import { MarketplaceFeed } from './components/MarketplaceFeed';
import { BuyerChatView } from './components/BuyerChatView';
import { PurchaseModal } from './components/PurchaseModal';
import { PurchaseSuccess } from './components/PurchaseSuccess';
import { PostRequestModal } from './components/PostRequestModal';


// Import Services
import * as geminiService from './services/geminiService';
import { generateMockListings, generateMockPosts, generateMockTutorials } from './services/mockData';
import { LeafIcon } from './components/IconComponents';

type ViewMode = 'scanner' | 'diagnosis' | 'listingForm' | 'listingSuccess' | 'dashboard' | 'farmerChat' | 'editListing' | 'profile' | 'community' | 'agronomist' | 'learningHub' | 'buyerRequestsFeed' | 'finance' | 'cooperativeHub' | 'wallet' | 'marketplace' | 'buyerChat' | 'purchaseSuccess' | 'postRequest';


const App: React.FC = () => {
    // --- App State ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<UserRole>('farmer');
    const [view, setView] = useState<ViewMode>('dashboard');

    // --- Data State ---
    const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
    const [allListings, setAllListings] = useState<Listing[]>([]);
    const [activeListing, setActiveListing] = useState<Listing | null>(null);
    const [allChats, setAllChats] = useState<AllChats>({});
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allBuyerRequests, setAllBuyerRequests] = useState<BuyerRequest[]>([]);
    const [activeRequest, setActiveRequest] = useState<BuyerRequest | null>(null);
    const [allOrders, setAllOrders] = useState<Order[]>([]);

    // --- Chat & AI State ---
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [agronomistChatHistory, setAgronomistChatHistory] = useState<AgronomistChatMessage[]>([]);
    const [isAgronomistChatLoading, setIsAgronomistChatLoading] = useState(false);
    
    // Price Suggestion State
    const [priceSuggestion, setPriceSuggestion] = useState<string | null>(null);
    const [isPriceSuggestionLoading, setIsPriceSuggestionLoading] = useState(false);
    const [priceSuggestionError, setPriceSuggestionError] = useState<string | null>(null);

    // Market Analysis State
    const [marketAnalysis, setMarketAnalysis] = useState<string | null>(null);
    const [isMarketAnalysisLoading, setIsMarketAnalysisLoading] = useState(false);
    const [marketAnalysisError, setMarketAnalysisError] = useState<string | null>(null);
    
    // Weather State
    const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState<string | null>(null);
    
    // Learning Hub State
    const [tutorialCategories, setTutorialCategories] = useState<TutorialCategory[]>([]);
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

    // Reminders State
    const [reminders, setReminders] = useState<Reminder[]>([]);
    
    // Growth Plan State
    const [growthPlanTasks, setGrowthPlanTasks] = useState<GrowthPlanTask[]>([]);
    const [isGrowthPlanLoading, setIsGrowthPlanLoading] = useState(false);
    const [growthPlanError, setGrowthPlanError] = useState<string | null>(null);
    
    // Finance State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [financialAnalysis, setFinancialAnalysis] = useState<FinancialAnalysis | null>(null);
    const [isFinancialAnalysisLoading, setIsFinancialAnalysisLoading] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [financialReportData, setFinancialReportData] = useState<FinancialReportData | null>(null);
    const [isFinancialReportLoading, setIsFinancialReportLoading] = useState(false);
    
    // Wallet & Escrow State
    const [farmerWallet, setFarmerWallet] = useState<Wallet>({ balance: 0, transactions: [] });
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);


    // Cooperative State
    const [requestToCoop, setRequestToCoop] = useState<BuyerRequest | null>(null);
    const [isPlanningLogistics, setIsPlanningLogistics] = useState(false);


    // Co-pilot State
    const [isCopilotOpen, setIsCopilotOpen] = useState(false);
    const [copilotHistory, setCopilotHistory] = useState<CopilotChatMessage[]>([]);
    const [isCopilotLoading, setIsCopilotLoading] = useState(false);


    // Buyer State
    const [marketplaceFilters, setMarketplaceFilters] = useState({ cropType: 'all', location: '' });
    const [visibleListingsCount, setVisibleListingsCount] = useState(9);
    const [purchaseDetails, setPurchaseDetails] = useState<{ listing: Omit<Listing, 'id' | 'imageUrl'>, quantity: number } | null>(null);
    const [listingToBuy, setListingToBuy] = useState<Listing | null>(null);
    const [isPostingRequest, setIsPostingRequest] = useState(false);
    const [buyerName, setBuyerName] = useState('Valued Buyer');

    // Community Feed State
    const [communityActiveTag, setCommunityActiveTag] = useState<string | null>(null);
    const [visiblePostsCount, setVisiblePostsCount] = useState(5);


    // --- Effects ---
    useEffect(() => {
        // Load initial data on mount
        const savedProfile = localStorage.getItem('farmerProfile');
        if (savedProfile) {
            setFarmerProfile(JSON.parse(savedProfile));
            setView('dashboard');
        } else {
            setView('profile'); // Onboarding
        }

        setAllListings(generateMockListings());
        setAllPosts(generateMockPosts());
        setTutorialCategories(generateMockTutorials());
        
        // Mock some buyer requests
        setAllBuyerRequests([
            { id: 'req1', buyerName: 'Fresh Foods Inc.', cropType: 'Tomato (Roma)', quantityKg: 200, location: 'Ikeja, Lagos', details: 'Looking for a weekly supplier. Must be Grade A.', createdAt: Date.now() - 3600000, responses: [] },
            { id: 'req2', buyerName: 'Mama Cass', cropType: 'Yam (Puna)', quantityKg: 500, location: 'Ibadan, Oyo', details: 'Need a large batch for an event next month.', createdAt: Date.now() - 86400000, responses: [] },
        ]);
    }, []);
    
    useEffect(() => {
        if (farmerProfile?.farmLocation && !weatherAdvice) {
            handleFetchWeather();
        }
    }, [farmerProfile?.farmLocation, weatherAdvice]);

    const resetScanner = useCallback(() => {
        setImageFile(null);
        setDiagnosis(null);
        setError(null);
        setChatHistory([]);
        setView('scanner');
    }, []);

    // --- Handlers ---
    const handleImageSelect = (file: File) => {
        setImageFile(file);
        setError(null);
    };

    const handleDiagnose = useCallback(async () => {
        if (!imageFile) {
            setError('Please select an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.diagnoseCrop(imageFile);
            setDiagnosis(result);
            setChatHistory([{ role: 'model', content: "I've analyzed your image. What other questions do you have about this diagnosis?" }]);
            setView('diagnosis');
        } catch (err) {
            setError('Failed to get diagnosis. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    const handleSendMessage = useCallback(async (message: string) => {
        setChatHistory(prev => [...prev, { role: 'user', content: message }]);
        setIsChatLoading(true);
        try {
            const response = await geminiService.continueChat(chatHistory, message);
            setChatHistory(prev => [...prev, { role: 'model', content: response }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    }, [chatHistory]);

    const handleGetPriceSuggestion = useCallback(async (cropType: string, location: string) => {
        setIsPriceSuggestionLoading(true);
        setPriceSuggestion(null);
        setPriceSuggestionError(null);
        try {
            const suggestion = await geminiService.getPriceSuggestion(cropType, location);
            setPriceSuggestion(suggestion);
        } catch (err) {
            setPriceSuggestionError('Could not get suggestion.');
        } finally {
            setIsPriceSuggestionLoading(false);
        }
    }, []);

    const handlePublishListing = useCallback((listingData: Omit<Listing, 'id' | 'imageUrl' | 'farmerName'>) => {
        if (!imageFile || !farmerProfile) return;
        
        const newListing: Listing = {
            ...listingData,
            id: Date.now().toString(),
            imageUrl: URL.createObjectURL(imageFile),
            farmerName: farmerProfile.name
        };
        setAllListings(prev => [newListing, ...prev]);
        setActiveListing(newListing);
        setView('listingSuccess');
    }, [imageFile, farmerProfile]);

    const handleNavigate = (newView: any) => {
        // A simple navigation handler
        if (newView === 'scanner') {
            resetScanner();
        } else {
            setView(newView);
        }
    };
    
    const handleSaveProfile = useCallback((profileData: Omit<FarmerProfile, 'level' | 'xp' | 'profilePictureUrl'>, newImageFile: File | null) => {
        const currentProfile = farmerProfile || { name: '', location: '', level: 1, xp: 0 };
        const newProfile: FarmerProfile = {
            ...currentProfile,
            ...profileData,
            profilePictureUrl: newImageFile ? URL.createObjectURL(newImageFile) : currentProfile.profilePictureUrl
        };
        setFarmerProfile(newProfile);
        localStorage.setItem('farmerProfile', JSON.stringify(newProfile));
        setView('dashboard');
    }, [farmerProfile]);
    
     const handleFetchMarketAnalysis = useCallback(async () => {
        setIsMarketAnalysisLoading(true);
        setMarketAnalysisError(null);
        try {
            const analysis = await geminiService.getMarketAnalysis(allListings.slice(0, 10)); // Analyze recent listings
            setMarketAnalysis(analysis);
        } catch (err) {
            setMarketAnalysisError('Failed to load market analysis.');
        } finally {
            setIsMarketAnalysisLoading(false);
        }
    }, [allListings]);
    
    const handleFetchWeather = useCallback(async () => {
        if(!farmerProfile?.farmLocation) return;
        setIsWeatherLoading(true);
        setWeatherError(null);
        try {
            const advice = await geminiService.getWeatherAdvice(farmerProfile.farmLocation);
            setWeatherAdvice(advice);
        } catch(err) {
            setWeatherError("Could not fetch weather data.");
        } finally {
            setIsWeatherLoading(false);
        }
    }, [farmerProfile?.farmLocation]);
    
    const handleAddReminder = useCallback((reminder: Omit<Reminder, 'id'>) => {
        const newReminder: Reminder = { ...reminder, id: Date.now().toString() };
        setReminders(prev => [...prev, newReminder]);
    }, []);

    const handleToggleReminder = useCallback((reminderId: string) => {
        setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, isComplete: !r.isComplete } : r));
    }, []);

    const handleGetReminderSuggestion = useCallback(async () => {
        return geminiService.getReminderSuggestion(reminders, farmerProfile);
    }, [reminders, farmerProfile]);
    
    const handleFetchGrowthPlan = useCallback(async () => {
        if (!farmerProfile) return;
        setIsGrowthPlanLoading(true);
        setGrowthPlanError(null);
        try {
            const tasks = await geminiService.getGrowthPlan(farmerProfile, allListings, allPosts);
            setGrowthPlanTasks(tasks);
        } catch (err) {
            setGrowthPlanError("Failed to generate growth plan.");
        } finally {
            setIsGrowthPlanLoading(false);
        }
    }, [farmerProfile, allListings, allPosts]);

    const handleCompleteGrowthPlanTask = useCallback((taskId: string, xp: number) => {
        setGrowthPlanTasks(prev => prev.filter(task => task.id !== taskId));
        setFarmerProfile(prev => {
            if (!prev) return null;
            const newXp = prev.xp + xp;
            const xpForNextLevel = prev.level * 100;
            const newProfile = {
                ...prev,
                xp: newXp % xpForNextLevel,
                level: prev.level + Math.floor(newXp / xpForNextLevel),
            };
            localStorage.setItem('farmerProfile', JSON.stringify(newProfile));
            return newProfile;
        });
    }, []);

    const handleAskAgronomist = useCallback(async (prompt: string, image: File | null) => {
        const userMessage: AgronomistChatMessage = {
            role: 'user',
            text: prompt,
            imageUrl: image ? URL.createObjectURL(image) : undefined,
        };
        setAgronomistChatHistory(prev => [...prev, userMessage]);
        setIsAgronomistChatLoading(true);
        try {
            const response = await geminiService.askAgronomist(prompt, image);
            setAgronomistChatHistory(prev => [...prev, { role: 'model', text: response }]);
        } catch(err) {
             setAgronomistChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I couldn't process that. Please try again." }]);
        } finally {
            setIsAgronomistChatLoading(false);
        }
    }, []);

    const handleFetchFinancialAnalysis = useCallback(async (periodTransactions: Transaction[], period: { month: string, year: number }) => {
        if (periodTransactions.length === 0) {
            setFinancialAnalysis({
                totalIncome: 0,
                totalExpenses: 0,
                netProfit: 0,
                aiSummary: `No transactions recorded for ${period.month} ${period.year}. Add some transactions to get an analysis.`,
            });
            return;
        }

        setIsFinancialAnalysisLoading(true);
        try {
            const { totalIncome, totalExpenses, netProfit } = periodTransactions.reduce((acc, t) => {
                if (t.type === 'income') acc.totalIncome += t.amount;
                else acc.totalExpenses += t.amount;
                acc.netProfit = acc.totalIncome - acc.totalExpenses;
                return acc;
            }, { totalIncome: 0, totalExpenses: 0, netProfit: 0 });

            const summary = await geminiService.getFinancialAnalysis(periodTransactions, period);
            
            setFinancialAnalysis({
                totalIncome,
                totalExpenses,
                netProfit,
                aiSummary: summary,
            });
        } catch (err) {
            console.error("Failed to get financial analysis", err);
            setFinancialAnalysis(prev => {
                if (!prev) return null;
                return {...prev, aiSummary: 'Could not generate financial analysis at this time.' };
            });
        } finally {
            setIsFinancialAnalysisLoading(false);
        }
    }, []);
    
    const handleGenerateFinancialReport = useCallback(async () => {
        if (!farmerProfile || transactions.length === 0) return;

        setIsReportModalOpen(true);
        setIsFinancialReportLoading(true);

        // 1. Calculate stats
        const { totalIncome, totalExpenses, salesTransactions, months } = transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.totalIncome += t.amount;
                acc.salesTransactions += 1;
            } else {
                acc.totalExpenses += t.amount;
            }
            const monthYear = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            acc.months.add(monthYear);
            return acc;
        }, { totalIncome: 0, totalExpenses: 0, salesTransactions: 0, months: new Set<string>() });
        
        const finalNetProfit = totalIncome - totalExpenses;
        const avgMonthlyIncome = months.size > 0 ? totalIncome / months.size : 0;
        const largestIncomeTransactions = [...transactions]
            .filter(t => t.type === 'income')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
        
        const stats = { totalIncome, totalExpenses, netProfit: finalNetProfit, salesTransactions, avgMonthlyIncome };

        // 2. Get AI Summary
        try {
            const summary = await geminiService.getFinancialReportSummary(farmerProfile, stats);
            setFinancialReportData({
                farmer: farmerProfile,
                ...stats,
                largestIncomeTransactions,
                aiSummary: summary,
            });
        } catch (err) {
            setFinancialReportData({
                farmer: farmerProfile,
                ...stats,
                largestIncomeTransactions,
                aiSummary: 'Could not generate AI summary at this time.',
            });
        } finally {
            setIsFinancialReportLoading(false);
        }

    }, [farmerProfile, transactions]);
    
    // --- Cooperative Handlers ---
    const handleInitiateCooperative = useCallback((requestId: string, quantity: number) => {
        if (!farmerProfile) return;
        setAllBuyerRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                const newPledge: CooperativePledge = {
                    farmerName: farmerProfile.name,
                    farmerLocation: farmerProfile.farmLocation || farmerProfile.location,
                    quantityKg: quantity
                };
                return {
                    ...req,
                    isCooperative: true,
                    initiatingFarmer: farmerProfile.name,
                    pledges: [newPledge],
                };
            }
            return req;
        }));
        setRequestToCoop(null);
        setView('cooperativeHub');
    }, [farmerProfile]);

    const handleJoinCooperative = useCallback((requestId: string, quantity: number) => {
        if (!farmerProfile) return;
        setAllBuyerRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                const newPledge: CooperativePledge = {
                    farmerName: farmerProfile.name,
                    farmerLocation: farmerProfile.farmLocation || farmerProfile.location,
                    quantityKg: quantity
                };
                return {
                    ...req,
                    pledges: [...(req.pledges || []), newPledge],
                };
            }
            return req;
        }));
        setRequestToCoop(null);
    }, [farmerProfile]);

    const handlePlanLogistics = useCallback(async (requestId: string) => {
        const request = allBuyerRequests.find(r => r.id === requestId);
        if (!request || !request.pledges) return;
        
        setIsPlanningLogistics(true);
        try {
            const plan = await geminiService.getLogisticsPlan(request);
            const chatId = `coop-${requestId}`;
            setAllBuyerRequests(prev => prev.map(r => r.id === requestId ? {...r, logisticsPlan: plan, chatId: chatId} : r));
            // Create a new group chat
            setAllChats(prev => ({
                ...prev,
                [chatId]: [{
                    role: 'model',
                    content: `**Logistics Plan Generated!**\n\nHello everyone, here is the AI-generated plan for fulfilling the order for ${request.quantityKg}kg of ${request.cropType}.\n\n${plan}`
                }]
            }));
        } catch(err) {
            console.error("Failed to get logistics plan", err);
            // Optionally, update the request with an error message
            setAllBuyerRequests(prev => prev.map(r => r.id === requestId ? {...r, logisticsPlan: "Error: Could not generate a logistics plan. Please try again."} : r));
        } finally {
            setIsPlanningLogistics(false);
        }
    }, [allBuyerRequests]);
    
    // --- Secure Pay Handlers ---
    const handleInitiatePurchase = useCallback((listing: Listing, quantity: number) => {
        const newOrder: Order = {
            id: `order-${Date.now()}`,
            listingId: listing.id,
            buyerName: buyerName,
            farmerName: listing.farmerName,
            cropType: listing.cropType,
            quantityKg: quantity,
            pricePerKg: listing.pricePerKg,
            totalAmount: quantity * listing.pricePerKg,
            status: 'Pending',
            createdAt: Date.now(),
        };
        setAllOrders(prev => [...prev, newOrder]);
        setActiveOrder(newOrder);
        // Simulate funding the escrow
        setTimeout(() => handleConfirmPayment(newOrder.id), 1000);
        setView('purchaseSuccess');
    }, [buyerName]);

    const handleConfirmPayment = (orderId: string) => {
        setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Funded' } : o));
        // Find the related chat and post a system message
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
            const chatId = order.listingId;
            const systemMessage: ChatMessage = {
                role: 'model',
                content: `**Payment Secured!**\nBuyer ${order.buyerName} has funded the escrow for ${order.quantityKg}kg of ${order.cropType}. You can now arrange for delivery.`
            };
             setAllChats(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), systemMessage]
            }));
        }
    };
    
    const handleConfirmDelivery = (orderId: string) => {
        const order = allOrders.find(o => o.id === orderId);
        if(!order || !farmerProfile) return;

        setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Completed', completedAt: Date.now() } : o));

        // Create income transaction for the farmer
        const incomeTransaction: Transaction = {
            id: `txn-${order.id}`,
            type: 'income',
            date: Date.now(),
            description: `Sale of ${order.quantityKg}kg ${order.cropType} to ${order.buyerName}`,
            amount: order.totalAmount,
            category: 'Marketplace Sale'
        };
        setTransactions(prev => [incomeTransaction, ...prev]);
        setFarmerWallet(prev => ({
            balance: prev.balance + order.totalAmount,
            transactions: [incomeTransaction, ...prev.transactions]
        }));
    };
    
    const handleWithdrawFunds = useCallback((amount: number, method: 'Bank Transfer' | 'Mobile Money', destination: string) => {
        const newPayout: Payout = {
            id: `payout-${Date.now()}`,
            amount,
            method,
            destination,
            status: 'Pending',
            requestedAt: Date.now()
        };
        setFarmerWallet(prev => ({
            balance: prev.balance - amount,
            transactions: [newPayout, ...prev.transactions]
        }));
        // Simulate payout completion
        setTimeout(() => {
             setFarmerWallet(prev => ({
                ...prev,
                transactions: prev.transactions.map(t => t.id === newPayout.id ? {...t, status: 'Completed', completedAt: Date.now()} : t)
            }))
        }, 3000);

    }, []);

    const handleContactFarmer = (listing: Listing) => {
        setActiveListing(listing);
        const history = allChats[listing.id] || [{ role: 'model', content: `Hello! I'm ${buyerName}. I'm interested in your ${listing.cropType}.` }];
        setChatHistory(history);
        setView('buyerChat');
    };

    // --- Render Logic ---

    const renderFarmerContent = () => {
        if (!farmerProfile) {
            return <FarmerProfileComponent profile={null} onSave={handleSaveProfile} userPosts={[]} />;
        }

        switch (view) {
            case 'scanner':
                return <CropScanner onImageSelect={handleImageSelect} onDiagnose={handleDiagnose} isLoading={isLoading} error={error} imageFile={imageFile} />;
            case 'diagnosis':
                return <DiagnosisResult diagnosis={diagnosis!} imageFile={imageFile} onReset={resetScanner} onListProduce={() => setView('listingForm')} onAddReminder={handleAddReminder} chatHistory={chatHistory} isChatLoading={isChatLoading} onSendMessage={handleSendMessage} />;
            case 'listingForm':
                return <MarketplaceListingForm diagnosis={diagnosis!} imageFile={imageFile!} onPublish={handlePublishListing} onCancel={resetScanner} farmerProfile={farmerProfile} onGetPriceSuggestion={handleGetPriceSuggestion} priceSuggestion={priceSuggestion} isPriceSuggestionLoading={isPriceSuggestionLoading} priceSuggestionError={priceSuggestionError} onClearPriceSuggestion={() => setPriceSuggestion(null)} />;
            case 'listingSuccess':
                return <ListingSuccess listing={activeListing!} onReset={resetScanner} />;
            case 'dashboard':
                 return <FarmerDashboard 
                    listings={allListings.filter(l => l.farmerName === farmerProfile.name)}
                    allChats={allChats} 
                    allPosts={allPosts}
                    transactions={transactions}
                    farmerProfile={farmerProfile}
                    onViewChat={(listing) => { setActiveListing(listing); setView('farmerChat'); }} 
                    onEdit={(listing) => { setActiveListing(listing); setView('editListing'); }} 
                    onDelete={(id) => setAllListings(allListings.filter(l => l.id !== id))}
                    onFetchMarketAnalysis={handleFetchMarketAnalysis}
                    marketAnalysis={marketAnalysis}
                    isMarketAnalysisLoading={isMarketAnalysisLoading}
                    marketAnalysisError={marketAnalysisError}
                    weatherAdvice={weatherAdvice}
                    isWeatherLoading={isWeatherLoading}
                    weatherError={weatherError}
                    onFetchWeather={handleFetchWeather}
                    reminders={reminders}
                    onAddReminder={handleAddReminder}
                    onToggleReminder={handleToggleReminder}
                    onGetReminderSuggestion={handleGetReminderSuggestion}
                    growthPlanTasks={growthPlanTasks}
                    isGrowthPlanLoading={isGrowthPlanLoading}
                    growthPlanError={growthPlanError}
                    onFetchGrowthPlan={handleFetchGrowthPlan}
                    onCompleteGrowthPlanTask={handleCompleteGrowthPlanTask}
                    onNavigate={handleNavigate}
                />;
            case 'farmerChat':
                return <FarmerChatView listing={activeListing!} chatHistory={allChats[activeListing!.id] || []} isChatLoading={isChatLoading} onSendMessage={() => {}} onBack={() => setView('dashboard')} farmerProfile={farmerProfile}/>;
            case 'editListing':
                return <EditListingForm listing={activeListing!} onUpdate={(updated) => { setAllListings(allListings.map(l => l.id === updated.id ? updated : l)); setView('dashboard');}} onCancel={() => setView('dashboard')} onGetPriceSuggestion={handleGetPriceSuggestion} priceSuggestion={priceSuggestion} isPriceSuggestionLoading={isPriceSuggestionLoading} priceSuggestionError={priceSuggestionError} onClearPriceSuggestion={() => setPriceSuggestion(null)} />;
            case 'profile':
                return <FarmerProfileComponent profile={farmerProfile} onSave={handleSaveProfile} userPosts={allPosts.filter(p => p.farmerName === farmerProfile.name)} />;
            case 'community':
                const filteredPosts = communityActiveTag ? allPosts.filter(p => p.tags?.includes(communityActiveTag)) : allPosts;
                return <CommunityFeed 
                    posts={allPosts}
                    filteredPosts={filteredPosts}
                    onCreatePost={() => {}}
                    onPostReaction={() => {}}
                    onAddComment={() => {}}
                    onPollVote={() => {}}
                    farmerProfile={farmerProfile}
                    activeTag={communityActiveTag}
                    onTagSelect={setCommunityActiveTag}
                    visibleCount={visiblePostsCount}
                    onLoadMore={() => setVisiblePostsCount(prev => prev + 5)}
                />;
            case 'agronomist':
                return <AgronomistChat chatHistory={agronomistChatHistory} isChatLoading={isAgronomistChatLoading} onAsk={handleAskAgronomist} />;
            case 'learningHub':
                return <LearningHub categories={tutorialCategories} onSelectTutorial={setSelectedTutorial} />;
            case 'buyerRequestsFeed':
                return <BuyerRequestsFeed requests={allBuyerRequests} farmerProfile={farmerProfile} onRespond={(req) => { setActiveRequest(req); }} onFormCooperative={(req) => setRequestToCoop(req)} />;
            case 'cooperativeHub':
                return <CooperativeHub requests={allBuyerRequests} farmerProfile={farmerProfile} onJoinCooperative={(req) => setRequestToCoop(req)} onPlanLogistics={handlePlanLogistics} isPlanningLogistics={isPlanningLogistics} />;
            case 'finance':
                const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
                    setTransactions(prev => [{ ...t, id: Date.now().toString() }, ...prev]);
                };
                 const handleContributeToGoal = (id: string, amount: number) => {
                    const goal = savingsGoals.find(g => g.id === id);
                    if (goal) {
                        const newTransaction: Omit<Transaction, 'id'> = {
                            type: 'expense',
                            date: Date.now(),
                            description: `Contribution to "${goal.name}"`,
                            amount: amount,
                            category: 'Savings Contribution'
                        };
                        handleAddTransaction(newTransaction);
                        setSavingsGoals(p => p.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
                    }
                };

                return <FinanceTracker 
                    transactions={transactions} 
                    savingsGoals={savingsGoals} 
                    financialAnalysis={financialAnalysis} 
                    onAddTransaction={handleAddTransaction} 
                    onAddGoal={(name, amount) => setSavingsGoals(p => [{ id: Date.now().toString(), name, targetAmount: amount, currentAmount: 0, createdAt: Date.now()}, ...p] )} 
                    onContributeToGoal={handleContributeToGoal} 
                    onFetchAnalysis={handleFetchFinancialAnalysis} 
                    isAnalysisLoading={isFinancialAnalysisLoading} 
                    onGenerateReport={handleGenerateFinancialReport}
                />;
            case 'wallet':
                return <WalletView wallet={farmerWallet} onWithdraw={handleWithdrawFunds} />;
            default:
                return <p>Unknown view</p>;
        }
    };
    
     const renderBuyerContent = () => {
        const filteredListings = allListings.filter(listing => {
            const cropMatch = marketplaceFilters.cropType === 'all' || listing.cropType === marketplaceFilters.cropType;
            const locationMatch = marketplaceFilters.location === '' || listing.location.toLowerCase().includes(marketplaceFilters.location.toLowerCase());
            return cropMatch && locationMatch;
        });

        switch (view) {
            case 'marketplace':
                return <MarketplaceFeed 
                    allListings={allListings} 
                    filteredListings={filteredListings}
                    onContactFarmer={handleContactFarmer}
                    filters={marketplaceFilters}
                    onFilterChange={setMarketplaceFilters}
                    onPostRequest={() => setIsPostingRequest(true)}
                    visibleCount={visibleListingsCount}
                    onLoadMore={() => setVisibleListingsCount(prev => prev + 6)}
                    farmerProfile={null}
                />;
            case 'buyerChat':
                return <BuyerChatView 
                    listing={activeListing!}
                    chatHistory={chatHistory}
                    isChatLoading={isChatLoading}
                    onSendMessage={handleSendMessage}
                    onBack={() => setView('marketplace')}
                    onInitiatePurchase={() => setListingToBuy(activeListing!)}
                    farmerProfile={null}
                />
            case 'purchaseSuccess':
                // This view might be deprecated in favor of the new order flow
                return <PurchaseSuccess details={purchaseDetails!} onDone={() => setView('marketplace')} />;

            default:
                 setView('marketplace'); // Default to marketplace for buyer
                 return null;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Header />

            <button onClick={() => setIsCopilotOpen(true)} className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg z-30 transform hover:scale-110 transition-transform">
                <LeafIcon className="h-8 w-8"/>
            </button>

            <main className="container mx-auto px-4 py-6">
                <div className="text-center mb-6">
                    <div className="inline-flex bg-white p-1 rounded-full shadow-md">
                        <button onClick={() => { setUserRole('farmer'); setView('dashboard'); }} className={`px-6 py-2 rounded-full font-semibold transition-colors ${userRole === 'farmer' ? 'bg-green-600 text-white' : 'text-slate-600'}`}>Farmer</button>
                        <button onClick={() => { setUserRole('buyer'); setView('marketplace'); }} className={`px-6 py-2 rounded-full font-semibold transition-colors ${userRole === 'buyer' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Buyer</button>
                    </div>
                </div>

                {userRole === 'farmer' && farmerProfile && (
                     <div className="mb-6">
                        <FarmerNav activeView={view as any} onNavigate={handleNavigate} profile={farmerProfile} />
                    </div>
                )}

                {userRole === 'farmer' ? renderFarmerContent() : renderBuyerContent()}
            </main>
            
            {/* Modals */}
             {selectedTutorial && (
                <VideoPlayerModal 
                    tutorial={selectedTutorial} 
                    onClose={() => setSelectedTutorial(null)} 
                    onAskExpert={() => {
                        setSelectedTutorial(null);
                        setAgronomistChatHistory([{ role: 'user', text: `I have a question about the tutorial: "${selectedTutorial.title}".` }]);
                        setView('agronomist');
                    }}
                />
            )}
            {activeRequest && (
                <FarmerResponseModal
                    request={activeRequest}
                    farmerListings={allListings.filter(l => l.farmerName === farmerProfile?.name)}
                    onClose={() => setActiveRequest(null)}
                    onSendOffer={(listingId) => {
                        console.log(`Offer sent for request ${activeRequest.id} with listing ${listingId}`);
                        setActiveRequest(null);
                    }}
                />
            )}
             {requestToCoop && !requestToCoop.isCooperative && (
                <InitiateCooperativeModal
                    request={requestToCoop}
                    onClose={() => setRequestToCoop(null)}
                    onConfirm={handleInitiateCooperative}
                />
            )}
            {requestToCoop && requestToCoop.isCooperative && (
                <JoinCooperativeModal
                    request={requestToCoop}
                    onClose={() => setRequestToCoop(null)}
                    onConfirm={handleJoinCooperative}
                />
            )}
            {listingToBuy && (
                <PurchaseModal
                    listing={listingToBuy}
                    onClose={() => setListingToBuy(null)}
                    onConfirm={(listingId, quantity) => {
                         const listing = allListings.find(l => l.id === listingId);
                         if(listing) {
                             handleInitiatePurchase(listing, quantity);
                         }
                         setListingToBuy(null);
                    }}
                />
            )}
            {isPostingRequest && (
                <PostRequestModal 
                    onClose={() => setIsPostingRequest(false)}
                    onPostRequest={(data, name) => {
                         setBuyerName(name);
                         const newRequest: BuyerRequest = { ...data, id: Date.now().toString(), createdAt: Date.now(), responses: [], buyerName: name };
                         setAllBuyerRequests(prev => [newRequest, ...prev]);
                         setIsPostingRequest(false);
                    }}
                    currentBuyerName={buyerName}
                />
            )}
             {isReportModalOpen && (
                <FinancialReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    reportData={financialReportData}
                    isLoading={isFinancialReportLoading}
                />
            )}
            <CopilotModal 
                isOpen={isCopilotOpen}
                onClose={() => setIsCopilotOpen(false)}
                chatHistory={copilotHistory}
                isChatLoading={isCopilotLoading}
                onSendMessage={async (prompt, image) => {
                    const userMsg: CopilotChatMessage = { role: 'user', content: prompt, imageUrl: image ? URL.createObjectURL(image) : undefined };
                    setCopilotHistory(prev => [...prev, userMsg]);
                    setIsCopilotLoading(true);
                    try {
                        const response: CopilotMessageContent = await geminiService.copilotAsk(prompt, image, { diagnosis, listings: allListings, profile: farmerProfile });
                        setCopilotHistory(prev => [...prev, { role: 'model', content: response }]);
                    } catch (e) {
                         setCopilotHistory(prev => [...prev, { role: 'model', content: "Sorry, I ran into an issue." }]);
                    } finally {
                        setIsCopilotLoading(false);
                    }
                }}
            />

        </div>
    );
};

export default App;