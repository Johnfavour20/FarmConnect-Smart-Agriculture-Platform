import type { Listing, TutorialCategory, Post, Comment, PollOption } from '../types';

const CROP_TYPES = ['Cassava', 'Maize (Yellow)', 'Tomato (Roma)', 'Yam (Puna)', 'Bell Peppers', 'Onions (Red)', 'Okra', 'Plantain', 'Watermelon', 'Ginger', 'Garlic', 'Sweet Potato', 'Cabbage', 'Carrots'];
const LOCATIONS = ['Ikeja, Lagos', 'Abeokuta, Ogun', 'Ibadan, Oyo', 'Kano, Kano', 'Enugu, Enugu', 'Port Harcourt, Rivers', 'Jos, Plateau', 'Kaduna, Kaduna', 'Benin City, Edo', 'Onitsha, Anambra', 'Zaria, Kaduna', 'Warri, Delta'];
const FARMER_NAMES = ['John Bako', 'Amina Yusuf', 'Chinedu Okoro', 'Fatima Bello', 'Emeka Nwosu', 'Hadiza Ibrahim', 'Olumide Adeyemi', 'Ngozi Eze', 'Musa Aliyu', 'Funmilayo Adekunle'];

// Simple function to get a random item from an array
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Simple function to get a random number in a range
const getRandomNumber = (min: number, max: number, decimals: number = 0): number => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
};

// Generate a somewhat plausible description
const generateDescription = (crop: string): string => {
    const qualities = ['Freshly harvested', 'Organically grown', 'High-quality', 'Sun-ripened', 'Grade A'];
    const endings = ['ready for immediate sale.', 'perfect for cooking and processing.', 'available in bulk quantities.', 'from our family farm to you.'];
    return `${getRandomItem(qualities)} ${crop}, ${getRandomItem(endings)}`;
};

export const generateMockListings = (count: number = 30): Listing[] => {
    const listings: Listing[] = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < count; i++) {
        let id: string;
        do {
            id = (Date.now() + Math.random()).toString();
        } while (usedIds.has(id));
        usedIds.add(id);

        const cropType = getRandomItem(CROP_TYPES);

        listings.push({
            id,
            cropType,
            quantityKg: getRandomNumber(25, 500),
            pricePerKg: getRandomNumber(150, 850),
            location: getRandomItem(LOCATIONS),
            description: generateDescription(cropType),
            imageUrl: `https://picsum.photos/400/300?random=${i}`,
            farmerName: getRandomItem(FARMER_NAMES),
        });
    }
    return listings;
};

const POST_CONTENTS = [
    "Just finished harvesting my first batch of tomatoes for the season! They are looking juicy and ripe. Anyone else having a good tomato season?",
    "I'm noticing some strange spots on my cassava leaves. Has anyone seen this before? Attaching a photo.",
    "Question for my fellow maize farmers: what's the best organic fertilizer you've used? Looking for recommendations.",
    "The rain has been great for my yams this year. Hoping for a bumper harvest!",
    "Market day in Ikeja was buzzing today! Good prices for bell peppers if anyone is looking to sell.",
    "How do you all deal with grasshoppers? They are starting to become a problem on my farm.",
    "Sharing a photo of my beautiful okra plants. They love this weather!",
    "Who has experience with intercropping plantain and maize? Would love to hear your thoughts on it.",
    "Just a reminder to check your soil pH levels before the next planting season. It makes a huge difference!",
    "I'm trying out a new variety of sweet potato this year. The vines are growing so fast!",
];

const COMMENTS = [
    "Wow, those look great!",
    "I use neem oil for pests, it works wonders.",
    "Thanks for the tip!",
    "I've seen that on my leaves too. I think it's blight.",
    "Congratulations on the harvest!",
    "Have you tried using poultry manure?",
];

export const generateMockPosts = (count: number = 15): Post[] => {
    const posts: Post[] = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < count; i++) {
        let id: string;
        do {
            id = `post_${(Date.now() + Math.random()).toString()}`;
        } while (usedIds.has(id));
        usedIds.add(id);

        const farmerName = getRandomItem(FARMER_NAMES);
        const createdAt = Date.now() - getRandomNumber(1000 * 60, 1000 * 60 * 60 * 24 * 7); // a week's worth of posts
        const likes = getRandomNumber(0, 50);

        // Generate comments
        const comments: Comment[] = [];
        const numComments = getRandomNumber(0, 4);
        for (let j = 0; j < numComments; j++) {
            comments.push({
                id: `comment_${i}_${j}`,
                farmerName: getRandomItem(FARMER_NAMES.filter(name => name !== farmerName)),
                content: getRandomItem(COMMENTS),
                createdAt: createdAt + getRandomNumber(1000 * 60, 1000 * 60 * 60 * 5), // comment within 5 hours
            });
        }
        
        const isPoll = Math.random() < 0.2; // 20% chance of being a poll
        const hasImage = Math.random() < 0.4; // 40% chance of having an image

        const post: Post = {
            id,
            farmerName,
            content: '',
            createdAt,
            likes,
            comments,
        };

        if (isPoll) {
            post.isPoll = true;
            post.pollQuestion = "What's the biggest challenge you're facing this season?";
            const pollOptions: PollOption[] = [
                { text: "Pests & Diseases", votes: [] },
                { text: "Access to Market", votes: [] },
                { text: "Unpredictable Weather", votes: [] },
                { text: "High Cost of Inputs", votes: [] },
            ];
            // Simulate some votes
            const totalVotes = getRandomNumber(0, 25);
            const availableVoters = [...FARMER_NAMES];
            for (let k = 0; k < totalVotes; k++) {
                if(availableVoters.length === 0) break;
                const voterIndex = getRandomNumber(0, availableVoters.length-1);
                const voter = availableVoters.splice(voterIndex, 1)[0];
                const optionIndex = getRandomNumber(0, 3);
                pollOptions[optionIndex].votes.push(voter);
            }
            post.pollOptions = pollOptions;
            post.tags = ['poll', 'farming challenges'];
        } else {
            post.content = getRandomItem(POST_CONTENTS);
            if (hasImage) {
                 post.imageUrl = `https://source.unsplash.com/600x400/?farm,nigeria&random=${i}`;
            }
        }
        
        // Add tags
        if (!post.tags) {
            const tags = new Set<string>();
            if (post.content.toLowerCase().includes('tomato')) tags.add('tomatoes');
            if (post.content.toLowerCase().includes('cassava')) tags.add('cassava');
            if (post.content.toLowerCase().includes('maize')) tags.add('maize');
            if (post.content.toLowerCase().includes('pests') || post.content.toLowerCase().includes('grasshoppers')) tags.add('pests');
            if (post.content.toLowerCase().includes('fertilizer')) tags.add('fertilizer');
            if (tags.size === 0) tags.add('general advice');
            post.tags = Array.from(tags);
        }

        posts.push(post);
    }
    return posts.sort((a,b) => b.createdAt - a.createdAt);
};


export const generateMockTutorials = (): TutorialCategory[] => {
    return [
        {
            title: "Crop Management",
            tutorials: [
                { id: "cm1", title: "Optimizing Maize Yields", description: "Learn advanced techniques for planting, fertilizing, and managing your maize crop for maximum output.", duration: "12:45", thumbnailUrl: "https://source.unsplash.com/400x300/?maize,field" },
                { id: "cm2", title: "Cassava Planting Guide", description: "A step-by-step guide on how to properly plant cassava cuttings for healthy growth and a bountiful harvest.", duration: "8:30", thumbnailUrl: "https://source.unsplash.com/400x300/?cassava,farm" },
                { id: "cm3", title: "Tomato Pruning Secrets", description: "Discover the secrets to pruning tomato plants to increase fruit size and prevent common diseases.", duration: "15:10", thumbnailUrl: "https://source.unsplash.com/400x300/?tomato,plant" },
                { id: "cm4", title: "Yam Staking Techniques", description: "Explore different methods for staking yams to support vine growth and improve tuber development.", duration: "10:05", thumbnailUrl: "https://source.unsplash.com/400x300/?yam,farm" },
            ]
        },
        {
            title: "Pest & Disease Control",
            tutorials: [
                { id: "pdc1", title: "Identifying Common Pests", description: "A visual guide to identifying the most common pests that affect crops in Nigeria and how to spot them early.", duration: "18:20", thumbnailUrl: "https://source.unsplash.com/400x300/?insect,leaf" },
                { id: "pdc2", title: "Organic Pesticide Recipes", description: "Learn how to create effective, low-cost organic pesticides using locally available materials like neem oil.", duration: "9:55", thumbnailUrl: "https://source.unsplash.com/400x300/?natural,remedy" },
                { id: "pdc3", title: "Managing Cassava Mosaic Disease", description: "Understand the symptoms of Cassava Mosaic Disease and integrated strategies for its management and prevention.", duration: "11:40", thumbnailUrl: "https://source.unsplash.com/400x300/?sick,plant" },
            ]
        },
        {
            title: "Soil Health & Irrigation",
            tutorials: [
                { id: "shi1", title: "Introduction to Composting", description: "Turn your farm waste into 'black gold'. This tutorial covers the basics of setting up and maintaining a compost pile.", duration: "13:00", thumbnailUrl: "https://source.unsplash.com/400x300/?compost,soil" },
                { id: "shi2", title: "Simple Drip Irrigation", description: "Learn how to build a simple and efficient drip irrigation system to conserve water and deliver it directly to your plants' roots.", duration: "16:45", thumbnailUrl: "https://source.unsplash.com/400x300/?drip,irrigation" },
                { id: "shi3", title: "Testing Your Soil's pH", description: "A simple guide to testing your soil's pH level using common household materials and what the results mean for your crops.", duration: "7:15", thumbnailUrl: "https://source.unsplash.com/400x300/?soil,test" },
            ]
        },
    ];
};