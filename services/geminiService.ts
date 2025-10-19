import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Diagnosis, Listing, ChatMessage, CopilotMessageContent, DailyForecast, WeatherAdvice, FarmerProfile, Reminder, Post, TutorialCategory, GrowthPlanTask, Transaction } from '../types';

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

export const diagnoseCrop = async (imageFile: File): Promise<Diagnosis> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `You are an expert agronomist specializing in common crop diseases in Nigeria. Your goal is to provide a clear, concise, and helpful diagnosis based on an image of a plant.
    Analyze the attached image of a crop. Identify the crop type and any diseases, pests, or nutrient deficiencies. 
    Provide the following information in a structured JSON format. The response MUST be only the JSON object.
    - cropType: The type of the crop shown in the image. Choose from: 'Cassava', 'Maize', 'Tomato', 'Yam'. If you cannot determine the crop or it's another type, return 'Other Crop'.
    - diseaseName: The common name of the disease or pest. If the plant is healthy, return 'Healthy'.
    - confidenceScore: Your confidence in this diagnosis as a percentage string, e.g., '95%'.
    - severity: The severity of the issue, one of 'Low', 'Medium', 'High'. If healthy, return 'N/A'.
    - recommendedTreatment: A step-by-step guide for treatment. Use simple, actionable language. If healthy, provide general care tips for the identified crop.
    - preventiveTips: A list of bullet points for preventive measures relevant to the identified crop.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        cropType: { type: Type.STRING, description: "The type of crop, e.g., 'Cassava', 'Maize', 'Tomato', 'Yam', or 'Other Crop'." },
                        diseaseName: { type: Type.STRING, description: "Name of the disease, pest, or 'Healthy'." },
                        confidenceScore: { type: Type.STRING, description: "Confidence of the diagnosis, e.g., '95%'." },
                        severity: { type: Type.STRING, description: "Severity level: 'Low', 'Medium', 'High', or 'N/A'." },
                        recommendedTreatment: { type: Type.STRING, description: "Step-by-step treatment advice or general care tips." },
                        preventiveTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of preventive measures." }
                    },
                    required: ["cropType", "diseaseName", "confidenceScore", "severity", "recommendedTreatment", "preventiveTips"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as Diagnosis;

    } catch (e) {
        console.error("Error calling Gemini API:", e);
        throw new Error("Failed to get a diagnosis from the AI. The model may be overloaded or the image could not be processed. Please try again.");
    }
};

export const askAgronomist = async (prompt: string, imageFile: File | null): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = "You are an expert agronomist and agricultural advisor specializing in Nigeria. A farmer is asking you for advice. Provide clear, practical, and actionable information. If an image is provided, use it as the primary context for your answer. Your response should be comprehensive and helpful to a farmer with local knowledge.";

    const textPart = { text: prompt };
    let contents;

    if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        contents = { parts: [imagePart, textPart] };
    } else {
        contents = { parts: [textPart] };
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
            }
        });

        return response.text.trim();
    } catch (e) {
         console.error("Error calling Gemini API for agronomist advice:", e);
        throw new Error("Failed to get advice from the AI. The model may be busy. Please try again in a moment.");
    }
};


export const getPriceSuggestion = async (cropType: string, location: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `You are an agricultural market analyst for Nigeria. Based on current market data, provide a suggested price range per kilogram (in Nigerian Naira, ₦) for selling "${cropType}" in the "${location}" area. 
    Keep your response concise and start directly with the price range. For example: "Suggested range: ₦200 - ₦230 per kg." Then, add a very brief justification. For example: "This is based on current demand in the region."
    The entire response should be a single, short paragraph.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (e) {
         console.error("Error calling Gemini API for price suggestion:", e);
        throw new Error("Failed to get a price suggestion. The model may be busy. Please try again in a moment.");
    }
};

export const getMarketAnalysis = async (listings: Listing[]): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
     if (listings.length === 0) {
        return "The marketplace is quiet right now. Add a listing to get things started and attract buyers!";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const simplifiedListings = listings.map(l => ({
        crop: l.cropType,
        price_per_kg: l.pricePerKg,
        location: l.location,
        quantity: l.quantityKg,
    }));

    const prompt = `You are a Nigerian agricultural market analyst. Below is a list of current produce listings from a marketplace.
    Analyze this data and provide a "Market Pulse" summary for a farmer.
    Your analysis should be concise, helpful, and formatted in Markdown.
    
    Your summary MUST include:
    1.  **Top Opportunity:** Identify the single most promising trend a farmer could act on. This could be a crop in high demand, a location with high prices, etc. Start this section with a sparkle emoji ✨.
    2.  **Market Insights:** Provide 2-3 bullet points on other interesting trends. For example, which crops have the most listings, or average prices for key crops.
    
    Here is the current market data (JSON format):
    ${JSON.stringify(simplifiedListings)}
    
    Generate the Market Pulse summary. Be encouraging and focus on actionable advice.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (e) {
         console.error("Error calling Gemini API for market analysis:", e);
        throw new Error("Failed to generate market analysis. The model may be busy. Please try again in a moment.");
    }
};

export const getFinancialAnalysis = async (transactions: Transaction[], farmer: FarmerProfile): Promise<string> => {
     if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
     if (transactions.length === 0) {
        return "You have no financial data yet. Add your first income or expense transaction to get an analysis of your farm's profitability.";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are a friendly and encouraging financial advisor for a Nigerian farmer named ${farmer.name}. Below is their list of income and expense transactions.
    Analyze this data and provide a "Profit Pulse" summary.
    Your analysis must be concise, helpful, and formatted in Markdown.
    
    IMPORTANT: Transactions with the category 'Savings Contribution' are transfers to a savings goal and should NOT be treated as an operational expense when calculating profitability. Mentioning that the farmer is saving is a positive financial habit. Transactions with the category 'Goal Withdrawal' are funds moved back from savings, not operational income.

    Your summary MUST include:
    1.  **Key Insight:** Identify the single most important financial takeaway. This could be their most profitable crop, their biggest expense category, or a comment on their overall profitability (excluding savings transfers). Start this section with a lightbulb emoji💡.
    2.  **Profitability Tip:** Provide one actionable suggestion to help them improve their net profit.
    3.  **Expense Breakdown:** Briefly mention their top 1-2 operational expense categories.
    
    Here is the transaction data (JSON format):
    ${JSON.stringify(transactions)}
    
    Generate the Profit Pulse summary. Be positive and focus on simple, actionable advice.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (e) {
         console.error("Error calling Gemini API for financial analysis:", e);
        throw new Error("Failed to generate financial analysis. The model may be busy. Please try again.");
    }
}

export const getWeatherForecastForLocation = async (location: string): Promise<DailyForecast[]> => {
    // Simulate network delay to feel like a real API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you would call a weather API here.
    // This simulation generates a deterministic but unique forecast based on the location string.
    console.log(`Simulating weather fetch for: ${location}`);

    let hash = 0;
    for (let i = 0; i < location.length; i++) {
        const char = location.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }

    const baseTemp = 28 + (Math.abs(hash) % 5); // Base temp between 28 and 32
    const basePrecip = 10 + (Math.abs(hash) % 30);

    const conditions: DailyForecast['condition'][] = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Storm'];
    const days = ['Today', 'Tom', 'Wed', 'Thu', 'Fri'];
    
    const forecast: DailyForecast[] = days.map((day, index) => {
        const dayHash = Math.abs(hash + index * 31);
        return {
            day,
            condition: conditions[dayHash % conditions.length],
            tempHigh: baseTemp + (dayHash % 4),
            tempLow: baseTemp - 4 + (dayHash % 3),
            precipChance: Math.min(95, basePrecip + (dayHash % 50)),
        };
    });

    if (forecast[1].condition === 'Storm') forecast[0].condition = 'Rain';
    if (forecast[0].condition === 'Rain') forecast[0].precipChance = Math.max(70, forecast[0].precipChance);

    return forecast;
};

export const getFarmingAdviceForWeather = async (forecast: DailyForecast[], farmer: FarmerProfile): Promise<Omit<WeatherAdvice, 'forecast'>> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `You are an expert Nigerian agronomist providing hyper-local farming advice. A farmer named ${farmer.name} in ${farmer.location} (with a farm at ${farmer.farmLocation || farmer.location}) has the following 5-day weather forecast. 
    Analyze the forecast and provide:
    1. A brief summary.
    2. A list of 2-3 actionable tips.
    3. A list of critical weather alerts if any severe conditions are detected. Severe conditions include storms, heavy rain (over 60% chance), strong winds, or sudden significant temperature drops. If no severe conditions exist, return an empty array for "alerts".

    The response MUST be a JSON object with the keys "aiSummary", "aiTips", and "alerts".
    - "aiSummary": A brief, 1-2 sentence overview of the upcoming weather week.
    - "aiTips": A JSON array of 2-3 short, practical, and actionable tips based on the forecast. Each tip should be a string.
    - "alerts": A JSON array of alert objects. Each object should have "severity" ('warning' for critical issues like storms, 'advisory' for less severe but important notices), "title", and "message".

    Weather Forecast Data:
    ${JSON.stringify(forecast)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        aiSummary: { type: Type.STRING },
                        aiTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                        alerts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    severity: { type: Type.STRING, description: "'warning' or 'advisory'" },
                                    title: { type: Type.STRING },
                                    message: { type: Type.STRING }
                                },
                                required: ["severity", "title", "message"]
                            }
                        }
                    },
                    required: ["aiSummary", "aiTips", "alerts"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (e) {
        console.error("Error calling Gemini API for weather advice:", e);
        throw new Error("Failed to generate farming advice for the weather. The model may be busy. Please try again.");
    }
};

export const getReminderSuggestion = async (
    farmer: FarmerProfile,
    listings: Listing[],
    weather: DailyForecast[],
    transactions: Transaction[],
    posts: Post[]
): Promise<Omit<Reminder, 'id' | 'isComplete' | 'dueDate'>> => {
     if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const farmersCrops = [...new Set(listings.map(l => l.cropType))];
    const recentExpenses = transactions.filter(t => t.type === 'expense').slice(0, 5);
    const recentPosts = posts.filter(p => p.farmerName === farmer.name).slice(0, 3).map(p => p.content);


    const prompt = `You are a premium AI farming assistant for a farmer in Nigeria. Your task is to suggest a single, highly relevant, and proactive reminder by synthesizing multiple data points about the farmer's activities.

    Farmer's Context:
    - Name: ${farmer.name}
    - Location: ${farmer.farmLocation || farmer.location}
    - Currently selling: ${farmersCrops.join(', ') || 'None listed'}
    - 5-day weather forecast: ${JSON.stringify(weather)}
    - Recent expenses: ${JSON.stringify(recentExpenses)}
    - Recent community posts: ${JSON.stringify(recentPosts)}

    Based on ALL this context, generate one helpful reminder. The reminder should be insightful.
    Examples of premium suggestions:
    - If weather shows rain and a recent post mentioned "spots on my leaves": "Follow up on your leaf spot concern. Check plants for blight after the upcoming rain."
    - If a large "Fertilizer" expense was recently logged: "Your recent fertilizer purchase was significant. Plan to apply it before the rain on Wednesday for best results."
    - If no income has been logged but they have listings: "Market prices for ${farmersCrops[0] || 'your crops'} are good. Consider posting in the community to attract buyers."

    The response MUST be a JSON object with the keys "title" and "notes".
    - "title": A short, clear title for the reminder (max 10 words).
    - "notes": Optional additional details or context for the reminder (max 30 words).
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        notes: { type: Type.STRING }
                    },
                    required: ["title"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (e) {
        console.error("Error calling Gemini API for reminder suggestion:", e);
        throw new Error("Failed to generate a reminder suggestion. The model may be busy. Please try again.");
    }
};


export const routeUserQuery = async (
    prompt: string,
    imageFile: File | null,
    allListings: Listing[]
): Promise<CopilotMessageContent> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // If an image is provided, the primary intent is almost always diagnosis.
    if (imageFile) {
        return await diagnoseCrop(imageFile);
    }
    
    // If no image, classify the text prompt.
    const routerPrompt = `You are an AI router for an agricultural app. Classify the user's intent based on their query.
    The possible intents are: 'PRICE_SUGGESTION', 'MARKET_ANALYSIS', 'GENERAL_ADVICE'.

    - If the user asks for the price of a specific crop in a specific location (e.g., "price of maize in Lagos", "how much for tomatoes in Ikeja"), the intent is 'PRICE_SUGGESTION'. Extract the 'crop' and 'location'.
    - If the user asks a general question about market trends, what's in demand, or for an analysis of the market, the intent is 'MARKET_ANALYSIS'.
    - Otherwise, for any other agricultural question (e.g., "how to improve soil", "what is this bug?"), the intent is 'GENERAL_ADVICE'.

    Respond ONLY with a JSON object.
    User Query: "${prompt}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: routerPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intent: { type: Type.STRING, description: "One of 'PRICE_SUGGESTION', 'MARKET_ANALYSIS', 'GENERAL_ADVICE'." },
                        crop: { type: Type.STRING, description: "The crop type, if applicable." },
                        location: { type: Type.STRING, description: "The location, if applicable." }
                    },
                    required: ["intent"]
                }
            }
        });

        const classification = JSON.parse(response.text.trim());

        switch (classification.intent) {
            case 'PRICE_SUGGESTION':
                if (classification.crop && classification.location) {
                    const suggestion = await getPriceSuggestion(classification.crop, classification.location);
                    return { type: 'priceSuggestion', suggestion };
                }
                // Fallback if entities not found
                return await askAgronomist(prompt, null);

            case 'MARKET_ANALYSIS':
                const analysis = await getMarketAnalysis(allListings);
                return { type: 'marketAnalysis', analysis };

            case 'GENERAL_ADVICE':
            default:
                return await askAgronomist(prompt, null);
        }

    } catch (e) {
        console.error("Error routing user query:", e);
        // Fallback to general advice on any routing error
        return await askAgronomist(prompt, null);
    }
};

export const initializeChatSession = (diagnosis: Diagnosis): Chat => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: [
        { 
          role: 'user', 
          parts: [{ text: `CONTEXT: The user has just received the following crop diagnosis.
            - Crop Type: ${diagnosis.cropType}
            - Disease/Pest: ${diagnosis.diseaseName}
            - Confidence: ${diagnosis.confidenceScore}
            - Severity: ${diagnosis.severity}
            - Recommended Treatment: ${diagnosis.recommendedTreatment}
            - Preventive Tips: ${diagnosis.preventiveTips.join(', ')}
            
            Now, answer any follow-up questions the user has.` 
          }] 
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I have the diagnosis details. I am ready to answer the user's questions." }]
        }
      ],
      config: {
        systemInstruction: 'You are FarmConnect AI, an expert agronomist providing follow-up advice to a farmer in Nigeria. The user has just received an automated diagnosis. Your role is to clarify, expand, and provide practical guidance based on that diagnosis. Be friendly, encouraging, and use simple language.',
      },
    });

    return chat;
};

export const initializeBuyerChatSession = (listing: Listing): { chatSession: Chat, initialMessage: string } => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: [
        { 
          role: 'user', 
          parts: [{ text: `CONTEXT: A buyer is interested in the following marketplace listing.
            - Farmer's Name: ${listing.farmerName}
            - Crop Type: ${listing.cropType}
            - Quantity Available: ${listing.quantityKg} kg
            - Price: ₦${listing.pricePerKg} per kg
            - Location: ${listing.location}
            - Farmer's Description: ${listing.description || 'Not provided.'}
            
            Your role is to act as a helpful assistant to the buyer. Answer their questions about the produce, availability, payment, and logistics. Do not invent information; base your answers on the listing details.` 
          }] 
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I have the listing details. I am ready to assist the buyer." }]
        }
      ],
      config: {
        systemInstruction: 'You are FarmConnect AI, a marketplace assistant helping a buyer connect with a farmer. Your tone should be helpful, professional, and trustworthy. Keep responses concise and focused on the user\'s questions about the listing.',
      },
    });

    const initialMessage = `Hello! I see you're interested in the **${listing.cropType}** from **${listing.farmerName}** in **${listing.location}**. I'm here to help answer any questions you have about this listing. What would you like to know?`;
    
    return { chatSession, initialMessage };
};


export const initializeFarmerChatSession = (listing: Listing, history: ChatMessage[]): Chat => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Reformat our app's history for the Gemini API
    const geminiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: [
        { 
          role: 'user', 
          parts: [{ text: `CONTEXT: You are ${listing.farmerName}, a farmer who has listed produce on the marketplace. A buyer has started a conversation with you.
            - Your Listing - Crop Type: ${listing.cropType}
            - Your Listing - Quantity Available: ${listing.quantityKg} kg
            - Your Listing - Price: ₦${listing.pricePerKg} per kg
            - Your Listing - Location: ${listing.location}
            - Your Listing - Description: ${listing.description || 'Not provided.'}
            
            Below is the conversation history so far. Your role is to answer the buyer's questions and facilitate a sale. Be helpful and clear in your responses.` 
          }] 
        },
        {
          role: 'model',
          parts: [{ text: `Understood. I am ready to act as the farmer, ${listing.farmerName}, and continue the conversation with the buyer based on the provided history.` }]
        },
        ...geminiHistory
      ],
      config: {
        systemInstruction: 'You are FarmConnect AI, acting as a helpful assistant for a farmer. You are speaking to a potential buyer. Your tone should be friendly, professional, and aimed at making a sale. Answer questions based on the listing details provided.',
      },
    });
    
    return chatSession;
};

export const getGrowthPlan = async (
    farmer: FarmerProfile,
    listings: Listing[],
    posts: Post[],
    tutorials: TutorialCategory[]
): Promise<GrowthPlanTask[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const simplifiedListings = listings.map(l => l.cropType).join(', ') || 'none';
    const simplifiedPosts = posts.slice(0, 3).map(p => p.content.substring(0, 50)).join('; ');
    const simplifiedTutorials = tutorials.flatMap(c => c.tutorials.map(t => ({ id: t.id, title: t.title }))).slice(0, 10);

    const prompt = `You are an AI farm mentor for a Nigerian farmer named ${farmer.name}. Your goal is to create a personalized "Growth Plan" with 3-4 actionable tasks to help them succeed. The tasks should be encouraging, relevant, and varied.

    Farmer's Context:
    - Name: ${farmer.name}
    - Level: ${farmer.level}
    - Location: ${farmer.location}
    - Current Marketplace Listings: ${simplifiedListings}
    - Recent Community Posts: "${simplifiedPosts}"

    Available Tutorials:
    ${JSON.stringify(simplifiedTutorials)}

    Generate a list of 3-4 tasks. Each task must be a JSON object with:
    - "id": A unique string ID for the task.
    - "title": A short, engaging title (e.g., "Boost Your Soil Knowledge").
    - "description": A 1-2 sentence explanation of why this task is helpful.
    - "action": One of the following action types: 'VIEW_TUTORIAL', 'CREATE_POST', 'EDIT_LISTING', 'INSPECT_CROP', 'LEARN_MORE'.
    - "targetId": (Optional) The ID of the tutorial or listing if relevant.
    - "xp": The experience points awarded for completing the task (between 10 and 50).

    Task Ideas:
    - Suggest a relevant tutorial from the list based on their crops.
    - Encourage them to share knowledge in the community.
    - Suggest improving an old marketplace listing.
    - Give a general farming tip as a 'LEARN_MORE' task.

    The response must be a valid JSON array of these task objects.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            action: { type: Type.STRING },
                            targetId: { type: Type.STRING },
                            xp: { type: Type.INTEGER },
                        },
                        required: ["id", "title", "description", "action", "xp"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (e) {
        console.error("Error calling Gemini API for growth plan:", e);
        throw new Error("Failed to generate a growth plan. The model may be busy. Please try again.");
    }
};