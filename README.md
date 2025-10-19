# 🌾 FarmConnect: Smart Agriculture Platform

FarmConnect is an integrated digital platform designed to empower Nigerian farmers by providing them with cutting-edge tools, direct market access, and a supportive community. This MVP focuses on leveraging the Google Gemini API to deliver AI-powered crop health monitoring, market analysis, and personalized growth plans, helping farmers increase their yield, improve their skills, and boost their profitability.

## ✨ Core Features

### 1. 📸 AI Crop Scanner
- **Instant Diagnosis**: Farmers can upload a photo of a crop leaf to get an instant, AI-powered diagnosis.
- **Detailed Reports**: The diagnosis includes the crop type, disease name, confidence score, severity level, recommended treatments, and preventive tips.
- **Powered by Gemini**: Utilizes the `gemini-2.5-flash` model for fast and accurate image analysis.

### 2. 📈 Direct-to-Buyer Marketplace
- **For Farmers**: Easily list healthy produce for sale directly from the diagnosis screen or dashboard. An AI-powered tool suggests competitive market prices based on crop type and location.
- **For Buyers**: A clean, filterable feed to browse listings by crop type and location. Buyers can contact farmers directly through an AI-moderated chat to inquire or make offers.
- **Inventory Management**: Listing quantities are automatically updated after a confirmed purchase.

### 3. 🚀 AI-Powered Growth Plan (Gamified Experience)
- **Personalized Mentorship**: The platform analyzes a farmer's profile, listings, and community activity to generate a personalized list of actionable tasks.
- **Skill Development**: Tasks encourage learning (e.g., "Watch a tutorial on organic pesticides"), community engagement ("Share your experience with yam cultivation"), and farm management.
- **Level Up**: Completing tasks rewards farmers with XP, allowing them to level up their profile, creating a sense of progression and accomplishment.

### 4. 🤖 AI Co-pilot & Expert Chat
- **Centralized AI**: A floating Co-pilot acts as a single point of contact for AI assistance. It intelligently routes user queries to the appropriate service, whether it's diagnosing a crop, analyzing the market, or suggesting a price.
- **Ask an Agronomist**: A dedicated chat interface allows farmers to ask complex agricultural questions to an AI expert, with the option to upload images for context.

### 5. 🏡 Smart Farmer Dashboard
- **At-a-Glance Overview**: The central hub for farmers, providing key statistics like active listings, unread messages, and profile level.
- **Integrated Widgets**:
    - **Market Pulse**: AI-generated summary of current market trends and opportunities based on platform listings.
    - **Weather & Planning**: Local weather forecasts paired with AI-driven farming advice.
    - **Smart Reminders**: A to-do list with AI-powered suggestions for timely tasks based on weather, crops, and market conditions.
    - **Recent Activity**: A feed of new messages and comments.

### 6. 🧑‍🤝‍🧑 Interactive Community Feed
- **Share & Learn**: Farmers can create text posts, share images, and conduct polls to engage with the community.
- **Organized Discussions**: Posts can be tagged with relevant topics (e.g., `#maize`, `#pests`), allowing for easy filtering.
- **Engagement**: Users can like and comment on posts, fostering a supportive and collaborative environment.

### 7. 📚 Learning Hub
- **Curated Content**: A library of video tutorials organized by category (e.g., Crop Management, Pest Control).
- **Interactive Learning**: After watching a tutorial, farmers can directly ask the AI Agronomist follow-up questions.

## 🛠️ Technology Stack

- **Frontend**:
    - **React**: For building the component-based user interface.
    - **TypeScript**: For type safety and improved developer experience.
    - **Tailwind CSS**: For rapid, utility-first styling.
- **AI & Backend Logic**:
    - **Google Gemini API (`@google/genai`)**: The core of the application, powering:
        - **`gemini-2.5-flash`**: Used for multimodal inputs (image + text), chat sessions, JSON generation, and function routing due to its speed and versatility.
    - **Client-Side Persistence**: `localStorage` is used to store application state (listings, chats, profile) for a seamless experience without requiring a dedicated backend server in this MVP.

## 📁 Project Structure

The project is organized into a modular and easy-to-understand structure:

```
/
├── components/         # Reusable React components for each feature
├── services/           # Modules for external API calls and mock data
│   ├── geminiService.ts  # All interactions with the Google Gemini API
│   └── mockData.ts     # Functions to generate initial data
├── types.ts            # Centralized TypeScript type definitions
├── App.tsx             # Main application component, handles state management
├── index.html          # The entry point HTML file
├── index.tsx           # React application entry point
└── README.md           # This file
```

## 🚀 Getting Started

This application is designed to run in a browser-based environment where the necessary API key is provided as an environment variable.

1.  **API Key**: Ensure you have a valid **Google Gemini API key**.
2.  **Environment Setup**: The application expects the API key to be available as `process.env.API_KEY`. In a platform like AI Studio, this is configured for you.
3.  **Run the App**: Simply open the `index.html` file in a modern web browser. The application is a self-contained Single Page Application (SPA).

## 🔮 Future Enhancements

- **Real-time Backend**: Transition from `localStorage` to a dedicated backend service (e.g., Firebase, Node.js with a database) for robust user authentication, real-time chat, and persistent data storage.
- **Payment Gateway Integration**: Integrate a payment solution (like Paystack or Flutterwave) to facilitate secure transactions within the marketplace.
- **Offline Functionality**: Implement Service Workers to enable core features, like the crop scanner and learning hub, to work in areas with poor or no internet connectivity.
- **Multilingual Support**: Add support for major Nigerian languages such as Hausa, Yoruba, and Igbo to improve accessibility.
- **Supply Chain Logistics**: Integrate with logistics partners to help facilitate the delivery of produce from farmers to buyers.
- **Advanced Analytics**: Provide farmers with more detailed analytics on their sales, market performance, and crop yields over time.
