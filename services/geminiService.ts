import { GoogleGenAI, Type } from "@google/genai";
// FIX: Added 'Post' to the type import to resolve a 'Cannot find name' error.
import type { Diagnosis, ChatMessage, Listing, FarmerProfile, WeatherAdvice, Reminder, GrowthPlanTask, CopilotMessageContent, Transaction, Post, BuyerRequest, FinancialReportData } from '../types';

// --- Helper Functions ---

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const textModel = 'gemini-2.5-flash';
const proModel = 'gemini-2.5-pro';
const visionModel = 'gemini-2.5-flash'; // Flash is generally good for vision tasks

// --- Service Functions ---

const diagnosisSchema = {
    type: Type.OBJECT,
    properties: {
        cropType: { type: Type.STRING, description: "The type of crop identified, e.g., 'Tomato', 'Maize'." },
        diseaseName: { type: Type.STRING, description: "The common name of the disease or 'Healthy' if no disease is found." },
        confidenceScore: { type: Type.STRING, description: "A percentage value indicating confidence, e.g., '95%'." },
        severity: { type: Type.STRING, description: "Severity of the disease.", enum: ['Low', 'Medium', 'High', 'N/A'] },
        recommendedTreatment: { type: Type.STRING, description: "A detailed, actionable treatment plan. Use markdown for formatting." },
        preventiveTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 concise preventive tips." },
    },
    required: ['cropType', 'diseaseName', 'confidenceScore', 'severity', 'recommendedTreatment', 'preventiveTips']
};


export const diagnoseCrop = async (imageFile: File): Promise<Diagnosis> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const result = await ai.models.generateContent({
        model: visionModel,
        contents: {
            parts: [
                { text: "Analyze this image of a crop. Identify the crop type and any diseases. Provide a detailed diagnosis. If the crop is healthy, say so and provide general care tips instead of a treatment plan. Structure your response according to the provided JSON schema." },
                imagePart
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: diagnosisSchema,
        }
    });

    const jsonString = result.text.trim();
    try {
        return JSON.parse(jsonString) as Diagnosis;
    } catch (e) {
        console.error("Failed to parse diagnosis JSON:", jsonString);
        throw new Error("Received an invalid format from the AI for diagnosis.");
    }
};

export const continueChat = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    const chat = ai.chats.create({
        model: textModel,
        history: history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }))
    });
    
    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
};

export const getPriceSuggestion = async (cropType: string, location: string): Promise<string> => {
    const prompt = `I am a farmer in ${location}, Nigeria. What is a good market price (in Nigerian Naira, NGN) to sell ${cropType}? Provide a single sentence with a suggested price range. For example: 'A good price for ${cropType} in ${location} is around ₦400-₦500 per kg.'`;
    
    const result = await ai.models.generateContent({
        model: textModel,
        contents: prompt
    });

    return result.text;
};

export const getMarketAnalysis = async (listings: Listing[]): Promise<string> => {
    const listingsSummary = listings.map(l => `- ${l.quantityKg}kg of ${l.cropType} in ${l.location} for ₦${l.pricePerKg}/kg`).join('\n');
    const prompt = `As an agricultural market analyst for Nigerian farmers, analyze the following recent listings:\n\n${listingsSummary}\n\nProvide a brief market pulse summary in markdown format. Highlight trends in pricing, supply, and popular locations. Offer one or two actionable insights for a farmer.`;

    const result = await ai.models.generateContent({
        model: proModel, // Use Pro for better analysis
        contents: prompt
    });

    return result.text;
};

export const askAgronomist = async (prompt: string, imageFile: File | null): Promise<string> => {
    const parts: any[] = [{ text: `You are an expert AI agronomist providing helpful advice to a Nigerian farmer. Answer the following question clearly and concisely. If an image is provided, use it as context for your answer.\n\nQuestion: ${prompt}` }];

    if (imageFile) {
        parts.push(await fileToGenerativePart(imageFile));
    }

    const result = await ai.models.generateContent({
        model: visionModel, // Vision model can handle both text and image
        contents: { parts }
    });
    
    return result.text;
};

export const getWeatherAdvice = async (farmLocation: string): Promise<WeatherAdvice> => {
    const prompt = `Provide a 5-day weather forecast and farming advice for a farmer in ${farmLocation}, Nigeria. Today is ${new Date().toLocaleDateString()}.
    
    Your response must be a JSON object with this exact structure:
    {
      "forecast": [
        {"day": "Today", "condition": "Sunny", "tempHigh": 32, "tempLow": 24, "precipChance": 10},
        ... (4 more days)
      ],
      "aiSummary": "A brief summary of the week's weather and its impact.",
      "aiTips": ["Actionable tip 1 based on forecast.", "Actionable tip 2.", "Actionable tip 3."],
      "alerts": [
        {"severity": "warning", "title": "Heat Wave Warning", "message": "High temperatures expected on Friday."}
      ]
    }

    The "condition" must be one of: 'Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Storm'.
    "alerts" should be an empty array if there are no severe weather warnings.
    "day" for tomorrow should be "Tomorrow", then the day of the week (e.g., 'Wed').`;

    const result = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
    });
    
    // The model may not return perfect JSON, so we need to be careful.
    const rawText = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(rawText) as WeatherAdvice;
    } catch(e) {
        console.error("Failed to parse weather JSON:", rawText, e);
        throw new Error("Could not get weather advice from AI.");
    }
};

export const getReminderSuggestion = async (existingReminders: Reminder[], profile: FarmerProfile | null): Promise<Omit<Reminder, 'id' | 'isComplete' | 'dueDate'> | null> => {
    const prompt = `I am a farmer named ${profile?.name}. Here are my upcoming reminders: ${JSON.stringify(existingReminders)}. Based on general farming best practices, suggest one new, relevant task I might be forgetting. For example, 'Check irrigation lines' or 'Prepare soil for next season'. Return a JSON object with "title" and "notes" or null if you have no suggestion.`;

    const result = await ai.models.generateContent({ model: textModel, contents: prompt });
    try {
        return JSON.parse(result.text);
    } catch {
        return null;
    }
};

export const getGrowthPlan = async (profile: FarmerProfile, listings: Listing[], posts: Post[]): Promise<GrowthPlanTask[]> => {
    const prompt = `Create a personalized "Growth Plan" with 3 actionable tasks for a farmer named ${profile.name} who is at Level ${profile.level}.
    Their profile: ${JSON.stringify(profile)}.
    Their listings: ${listings.length} active.
    Their community posts: ${posts.length} created.

    Generate tasks that encourage app engagement and good farming practices.
    Return a JSON array of objects with this exact structure:
    [
        {"id": "task1", "title": "Task Title", "description": "Brief description.", "action": "ACTION_TYPE", "targetId": "optional_id", "xp": 25},
        ...
    ]
    Valid ACTION_TYPE values: 'VIEW_TUTORIAL', 'CREATE_POST', 'EDIT_LISTING', 'INSPECT_CROP', 'LEARN_MORE'.
    'xp' should be between 10 and 50.`;

    const result = await ai.models.generateContent({ model: proModel, contents: prompt });
    try {
        return JSON.parse(result.text) as GrowthPlanTask[];
    } catch(e) {
        console.error("Failed to parse growth plan JSON:", result.text, e);
        return [];
    }
};

export const getFinancialAnalysis = async (monthlyTransactions: Transaction[], period: { month: string, year: number }): Promise<string> => {
    const { totalIncome, totalExpenses, netProfit } = monthlyTransactions.reduce((acc, t) => {
        if (t.type === 'income') acc.totalIncome += t.amount;
        else acc.totalExpenses += t.amount;
        acc.netProfit = acc.totalIncome - acc.totalExpenses;
        return acc;
    }, { totalIncome: 0, totalExpenses: 0, netProfit: 0 });

    const transactionSummary = monthlyTransactions.map(t => ` - ${t.type === 'income' ? 'INCOME' : 'EXPENSE'}: ₦${t.amount.toLocaleString()} for "${t.description}"`).join('\n');
    
    const prompt = `
        You are "Profit Pulse", a friendly financial advisor for a small-scale farmer in Nigeria. 
        Analyze the following financial data for ${period.month} ${period.year}.

        - Total Income: ₦${totalIncome.toLocaleString()}
        - Total Expenses: ₦${totalExpenses.toLocaleString()}
        - Net Profit/Loss: ₦${netProfit.toLocaleString()}

        Here's a list of transactions:
        ${transactionSummary}
        
        Please provide a concise, one-paragraph financial summary.
        - Start with an encouraging and friendly tone.
        - Briefly interpret the net profit or loss.
        - Offer one actionable insight or a question for the farmer to consider for improving their finances next month, based on the provided transactions.
        - Keep the entire summary under 60 words.
    `;
    
    const result = await ai.models.generateContent({
        model: proModel,
        contents: prompt
    });

    return result.text;
};

export const getFinancialReportSummary = async (
    profile: FarmerProfile,
    stats: { totalIncome: number, totalExpenses: number, netProfit: number, salesTransactions: number, avgMonthlyIncome: number }
): Promise<string> => {
    const prompt = `
        You are an AI financial advisor preparing a summary for a loan readiness report for a small-scale Nigerian farmer named ${profile.name}.
        The tone should be professional, positive, and confident, suitable for a loan officer to read.

        Here is the farmer's financial data:
        - Total Recorded Income: ₦${stats.totalIncome.toLocaleString()}
        - Total Recorded Expenses: ₦${stats.totalExpenses.toLocaleString()}
        - Net Profit: ₦${stats.netProfit.toLocaleString()}
        - Average Monthly Income: ₦${stats.avgMonthlyIncome.toLocaleString()}
        - Number of Sales Transactions: ${stats.salesTransactions}

        Based on this data, write a concise, one-paragraph (3-4 sentences) "Advisor's Summary".
        - Acknowledge the farmer's diligence in record-keeping.
        - Highlight the positive net profit as evidence of a viable business.
        - Mention the consistent sales activity.
        - Conclude with a statement about their potential for growth with additional capital.
        - Do not use overly casual or emotional language. Maintain a professional and optimistic tone.
    `;

    const result = await ai.models.generateContent({
        model: proModel,
        contents: prompt
    });

    return result.text;
};

export const getLogisticsPlan = async (request: BuyerRequest): Promise<string> => {
    const pledgesSummary = request.pledges?.map(p => `- ${p.farmerName} from ${p.farmerLocation} will provide ${p.quantityKg}kg.`).join('\n');

    const prompt = `
        You are an expert AI logistics coordinator for small-scale farmers in Nigeria. Your goal is to create the most efficient and cost-effective plan for consolidating produce from multiple farms and delivering it to a buyer.

        **Order Details:**
        - Buyer: ${request.buyerName}
        - Buyer's Location: ${request.location}
        - Total Quantity Required: ${request.quantityKg}kg of ${request.cropType}

        **Participating Farmers (The Cooperative):**
        ${pledgesSummary}

        **Your Task:**
        Generate a clear, step-by-step logistics plan in markdown format. The plan should be easy for farmers to understand and follow.

        **Include the following sections:**
        1.  **Suggested Collection Point:** Propose a logical, central town or landmark that minimizes travel for most farmers.
        2.  **Pickup & Delivery Route:** Suggest an optimal route. You can either suggest a single driver picks up from all farms, or that farmers meet at the collection point. Choose the most practical option for rural Nigeria.
        3.  **Estimated Cost & Cost Sharing:** Estimate a reasonable total cost for hiring a small truck or van for the delivery in Nigerian Naira (₦). Then, provide a fair cost-sharing breakdown for each farmer, proportional to the quantity they are contributing.
        4.  **Coordination Tips:** Provide 2-3 brief, actionable tips for the farmers to ensure a smooth process (e.g., "Confirm pickup times via phone call," "Ensure produce is properly packaged for transport.").

        Assume standard road conditions in Nigeria and provide realistic advice. Be encouraging and clear.
    `;

    const result = await ai.models.generateContent({
        model: proModel,
        contents: prompt
    });

    return result.text;
};


export const generateApplicationAnswer = async (
    question: string, 
    userNotes: string, 
    profile: FarmerProfile, 
    financials: FinancialReportData | null
): Promise<string> => {
    const prompt = `
        You are an expert assistant helping a Nigerian farmer named ${profile.name} apply for an agricultural loan/grant. 
        Their goal is to improve their farm.
        The farmer has provided some simple notes in response to an application question. 
        Your task is to convert their notes into a clear, professional, and persuasive answer suitable for a formal application.

        **Farmer's Profile:**
        - Name: ${profile.name}
        - Location: ${profile.location}
        - Farm Location: ${profile.farmLocation}
        - Level/Experience: ${profile.level}

        **Farmer's Financial Summary:**
        - Total Income: ₦${financials?.totalIncome.toLocaleString() || 'N/A'}
        - Net Profit: ₦${financials?.netProfit.toLocaleString() || 'N/A'}
        - Sales Transactions: ${financials?.salesTransactions || 'N/A'}

        **Application Question:** "${question}"

        **Farmer's Notes:** "${userNotes}"

        Based on all this information, generate a concise, positive, and well-structured answer to the application question (2-4 sentences). 
        Address the question directly, use a professional tone, and subtly incorporate details from the farmer's profile and financials to add credibility.
        Do not just repeat the notes; expand on them professionally.
    `;

     const result = await ai.models.generateContent({
        model: proModel,
        contents: prompt
    });

    return result.text;
};


export const copilotAsk = async (prompt: string, image: File | null, context: { diagnosis: Diagnosis | null, listings: Listing[], profile: FarmerProfile | null }): Promise<CopilotMessageContent> => {
    // This is a router function that decides which tool to use
    if (image && (prompt.toLowerCase().includes('diagnose') || prompt.toLowerCase().includes('what is this'))) {
        return await diagnoseCrop(image);
    }
    
    if (prompt.toLowerCase().includes('market price') || prompt.toLowerCase().includes('suggestion')) {
        const cropMatch = prompt.toLowerCase().match(/price for (.*?)( in|$)/);
        const locationMatch = prompt.toLowerCase().match(/in (.*?)\?*$/);
        const crop = cropMatch ? cropMatch[1].trim() : "tomatoes";
        const location = locationMatch ? locationMatch[1].trim() : "Lagos";
        const suggestion = await getPriceSuggestion(crop, location);
        return { type: 'priceSuggestion', suggestion };
    }

    if (prompt.toLowerCase().includes('market trend') || prompt.toLowerCase().includes('analyze')) {
        const analysis = await getMarketAnalysis(context.listings.slice(0, 10));
        return { type: 'marketAnalysis', analysis };
    }
    
    // Default to a general agronomist question
    return await askAgronomist(prompt, image);
};