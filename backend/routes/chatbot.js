const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Health-related topic restriction - more permissive for food and nutrition
const isHealthRelated = (message) => {
  const restrictedKeywords = [
    'coding', 'programming', 'code', 'software', 'developer', 'programming language',
    'politics', 'government', 'election', 'political', 'president', 'minister',
    'hacking', 'hack', 'cybersecurity', 'malware', 'virus', 'security breach',
    'movies', 'film', 'cinema', 'tv show', 'series', 'entertainment',
    'gaming', 'game', 'video game', 'console', 'playstation', 'xbox',
    'illegal', 'crime', 'drugs', 'weapons', 'violence', 'criminal',
    'stocks', 'trading', 'investment', 'crypto', 'bitcoin', 'blockchain',
    'religion', 'religious', 'spiritual', 'god', 'prayer', 'worship'
  ];
  
  const foodNutritionKeywords = [
    'food', 'eat', 'eating', 'diet', 'nutrition', 'healthy', 'health',
    'calories', 'calorie', 'protein', 'carbs', 'carbohydrate', 'fat', 'fiber',
    'vitamin', 'mineral', 'supplement', 'water', 'hydration', 'drink',
    'breakfast', 'lunch', 'dinner', 'meal', 'snack', 'snacking',
    'weight', 'bmi', 'obese', 'obesity', 'thin', 'fat', 'fit', 'fitness',
    'exercise', 'workout', 'gym', 'training', 'muscle', 'strength',
    'energy', 'metabolism', 'digestion', 'stomach', 'hunger', 'appetite',
    'vegetable', 'fruit', 'meat', 'fish', 'chicken', 'egg', 'milk', 'dairy',
    'rice', 'bread', 'pasta', 'pizza', 'burger', 'sandwich', 'salad', 'soup',
    'samosa', 'idli', 'dosa', 'poha', 'upma', 'dhokla', 'dal', 'rajma',
    'banana', 'apple', 'orange', 'mango', 'grapes', 'berries',
    'oats', 'oatmeal', 'cereal', 'nuts', 'almonds', 'walnuts', 'cashews',
    'tea', 'coffee', 'juice', 'soda', 'coke', 'pepsi', 'water',
    'sugar', 'salt', 'oil', 'butter', 'cheese', 'yogurt', 'curd',
    'chocolate', 'candy', 'sweet', 'dessert', 'cake', 'ice cream',
    'indian', 'chinese', 'italian', 'mexican', 'american', 'thai',
    'restaurant', 'fast food', 'junk food', 'organic', 'natural',
    'vegan', 'vegetarian', 'non-vegetarian', 'gluten free', 'keto',
    'allergy', 'intolerant', 'sensitive', 'digestive', 'constipation',
    'diabetes', 'blood pressure', 'cholesterol', 'heart', 'cardio'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check for restricted topics first
  if (restrictedKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return false;
  }
  
  // If it contains any food/nutrition keywords, allow it
  if (foodNutritionKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return true;
  }
  
  // For very short messages (1-2 words), be more permissive if they could be food
  const words = lowerMessage.split(' ').filter(word => word.length > 0);
  if (words.length <= 2) {
    // Common food items that might not be in the keywords list
    const commonFoods = [
      'samosa', 'pizza', 'burger', 'banana', 'milk', 'bread', 'rice', 'egg',
      'chicken', 'fish', 'apple', 'orange', 'grapes', 'mango', 'nuts', 'oats',
      'pasta', 'salad', 'soup', 'sandwich', 'tea', 'coffee', 'juice', 'water',
      'sugar', 'salt', 'oil', 'butter', 'cheese', 'yogurt', 'chocolate',
      'candy', 'cake', 'ice', 'cream', 'dosa', 'idli', 'poha', 'upma'
    ];
    
    if (words.some(word => commonFoods.includes(word))) {
      return true;
    }
  }
  
  return false;
};

// Chat with AI health assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Basic validation
    if (!message || !userId) {
      return res.status(400).json({ message: 'Message and userId are required' });
    }

    // Check if message is health-related
    if (!isHealthRelated(message)) {
      return res.json({
        message: 'I can only help with health, nutrition, fitness, and wellness topics. Please ask me about healthy eating, exercise, hydration, or other health-related questions!',
        timestamp: new Date().toISOString(),
        restricted: true
      });
    }

    // System prompt for health assistant
    const systemPrompt = `You are a helpful AI health and nutrition assistant. Help students with food, hydration, calories, BMI, fitness, exercise, healthy eating, and wellness advice. If a user asks unrelated topics outside health or nutrition, politely refuse.

    Your responses should be:
    - Friendly and encouraging
    - Short and practical (2-4 sentences max)
    - Beginner-friendly and easy to understand
    - Focused on actionable advice

    When users mention specific foods, always provide:
    1. Estimated calories (approximate ranges are fine)
    2. Whether it's healthy or not (in simple terms)
    3. Healthier alternatives
    4. Moderation advice if needed

    Examples:
    User: "samosa"
    Response: "A samosa has about 150-250 calories depending on size. It's tasty but fried, so enjoy it occasionally. Try baked samosas or dhokla (120 calories) as healthier alternatives!"

    User: "banana"
    Response: "A medium banana has about 105 calories and is very healthy! It's packed with potassium and fiber. Great for energy and digestion. Perfect as a pre-workout snack!"

    User: "how much water should I drink"
    Response: "Aim for 8-10 glasses (2-3 liters) of water daily. More if you exercise or it's hot. Your body needs water for energy, digestion, and clear skin. Keep a water bottle handy!"

    Always include both Indian and international options when suggesting alternatives. Encourage moderation and balance rather than strict dieting.`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "llama-3.1-8b-instant",
        max_tokens: 500,
        temperature: 0.7
      });

      const response = {
        message: chatCompletion.choices[0]?.message?.content || 'Sorry, I could not process your request.',
        timestamp: new Date().toISOString(),
        restricted: false
      };

      res.json(response);
    } catch (groqError) {
      console.error('Groq API error:', groqError);
      res.status(500).json({ 
        message: 'AI service is currently unavailable. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat history
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    // TODO: Fetch chat history from Google Sheets
    res.json({ 
      message: 'Chat history',
      userId,
      history: [] // TODO: Implement actual data fetching
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
