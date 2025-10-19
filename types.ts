export interface Diagnosis {
  cropType: string;
  diseaseName: string;
  confidenceScore: string;
  severity: 'Low' | 'Medium' | 'High' | 'N/A';
  recommendedTreatment: string;
  preventiveTips: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AgronomistChatMessage {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string; // For user-uploaded images
}

// --- Co-pilot Types ---
export type CopilotMessageContent = string | Diagnosis | { type: 'marketAnalysis', analysis: string } | { type: 'priceSuggestion', suggestion: string };

export interface CopilotChatMessage {
  role: 'user' | 'model' | 'system';
  content: CopilotMessageContent;
  imageUrl?: string; // For user-uploaded images
}


export interface Listing {
    id: string;
    cropType: string;
    quantityKg: number;
    pricePerKg: number;
    location: string;
    description: string;
    imageUrl: string;
    farmerName: string;
}

export type UserRole = 'farmer' | 'buyer';

export type AllChats = {
  [listingId: string]: ChatMessage[];
};

export interface Comment {
  id: string;
  farmerName: string;
  content: string;
  createdAt: number;
}

export type PollOption = {
  text: string;
  votes: string[]; // Array of farmer names who voted
};

export interface Post {
  id: string;
  farmerName: string;
  content: string;
  imageUrl?: string;
  createdAt: number; // Unix timestamp for sorting
  likes: number;
  comments: Comment[];
  // New Community Features
  tags?: string[];
  isPoll?: boolean;
  pollQuestion?: string;
  pollOptions?: PollOption[];
}

export interface FarmerProfile {
  name: string;
  location: string; // e.g. Primary Market / City
  farmLocation?: string; // Specific location for weather
  profilePictureUrl?: string; // Data URL of the profile picture
  level: number;
  xp: number;
}

// --- Weather Feature Types ---
export interface DailyForecast {
    day: string; // e.g., 'Today', 'Tomorrow', 'Wed'
    condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rain' | 'Storm';
    tempHigh: number;
    tempLow: number;
    precipChance: number; // Percentage
}

export interface WeatherAlert {
    severity: 'warning' | 'advisory';
    title: string;
    message: string;
}

export interface WeatherAdvice {
    forecast: DailyForecast[];
    aiSummary: string;
    aiTips: string[];
    alerts: WeatherAlert[];
}

// --- Learning Hub Types ---
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "5:32"
  thumbnailUrl: string;
}

export interface TutorialCategory {
  title: string;
  tutorials: Tutorial[];
}

// --- Smart Reminders Types ---
export interface Reminder {
  id: string;
  title: string;
  dueDate: number; // Unix timestamp
  isComplete: boolean;
  notes?: string;
  relatedCrop?: string;
}

// --- Growth Plan Types ---
export type GrowthPlanTaskAction = 'VIEW_TUTORIAL' | 'CREATE_POST' | 'EDIT_LISTING' | 'INSPECT_CROP' | 'LEARN_MORE';

export interface GrowthPlanTask {
  id: string;
  title: string;
  description: string;
  action: GrowthPlanTaskAction;
  targetId?: string; // e.g., tutorial.id or listing.id
  xp: number;
}

// --- Buyer Request Board Types ---
export interface FarmerResponse {
  farmerName: string;
  listingId: string;
  createdAt: number;
}

export interface BuyerRequest {
  id: string;
  buyerName: string;
  cropType: string;
  quantityKg: number;
  location: string;
  details: string;
  createdAt: number;
  responses: FarmerResponse[];
}

// --- Farm Finance Tracker Types ---
export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 'Seeds' | 'Fertilizer' | 'Pesticides' | 'Labor' | 'Equipment' | 'Transport' | 'Savings Contribution' | 'Other';
export type IncomeCategory = 'Marketplace Sale' | 'Local Sale' | 'Goal Withdrawal' | 'Other';
export type TransactionCategory = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  date: number; // Unix timestamp
  description: string;
  amount: number;
  category: TransactionCategory;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: number;
}

export interface FinancialAnalysis {
  netProfit: number;
  totalIncome: number;
  totalExpenses: number;
  aiSummary: string;
}