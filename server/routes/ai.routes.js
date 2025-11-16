const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI only if API key exists
let genAI = null;
if (process.env.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('✓ Gemini AI initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Gemini AI:', error.message);
    }
}

router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;

        // Try to use Gemini AI if available
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

                const prompt = `You are Vally, a friendly and enthusiastic AI assistant for SkillSwap - a platform where people exchange skills and learn from each other.

SkillSwap Features:
- Users list skills they have and want to learn
- Smart matching connects people with complementary skills
- Send swap requests to connect
- Real-time chat to coordinate learning sessions
- Build a supportive learning community

Your Personality:
- Friendly, encouraging, and helpful
- Use emojis occasionally to be engaging
- Keep responses concise (2-3 sentences max)
- Guide users on using the platform effectively

User question: ${message}

Your response:`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const aiResponse = response.text();

                console.log('✓ Gemini AI responded');
                
                return res.status(200).json({ 
                    message: aiResponse,
                    response: aiResponse,
                    source: 'gemini'
                });
            } catch (aiError) {
                console.error('Gemini AI error:', aiError.message);
                // Fall through to mock responses
            }
        }

        // Fallback: Smart mock responses
        console.log('Using fallback responses');
        const userMessage = message.toLowerCase();
        let response = '';

        if (userMessage.includes('skill') || userMessage.includes('learn')) {
            const responses = [
                "Learning new skills opens so many doors! 🚀 On SkillSwap, you can find someone to teach you while sharing your expertise. What skill interests you?",
                "The best learning happens through doing! Browse the Skills page to see what's available, or tell me what you want to learn! 💡",
                "Every expert was once a beginner! Find a swap partner who complements your skills and start your learning journey together. 🌟"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else if (userMessage.includes('swap') || userMessage.includes('exchange')) {
            const responses = [
                "Skill swapping is all about win-win growth! 🤝 You teach what you know, learn what you don't. Have you set up your profile yet?",
                "Ready to swap? Browse the Skills page to see who's offering what, then send a swap request to connect! ✨",
                "The magic of SkillSwap is mutual learning! Find someone whose skills you want, and offer something they need. 🎯"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else if (userMessage.includes('hi') || userMessage.includes('hello') || userMessage.includes('hey')) {
            const responses = [
                "Hey there! 👋 I'm Vally, your SkillSwap companion. Ready to learn something new today? What can I help you with?",
                "Hello! 🌟 Welcome to SkillSwap! I'm here to help you navigate the platform and find amazing learning opportunities. What's on your mind?",
                "Hi! 😊 Excited to help you on your learning journey! Ask me anything about finding skills or connecting with others!"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else if (userMessage.includes('help') || userMessage.includes('how')) {
            const responses = [
                "Happy to help! 💫 You can browse skills, connect with others, and start swapping. What specifically would you like to know?",
                "Let me guide you! First, update your profile with your skills. Then explore the Skills page to find matches. Need help with a specific step?",
                "I'm here for you! 🎓 SkillSwap has: Profile (showcase your skills), Skills page (find matches), and Chat (coordinate sessions). Where should we start?"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else if (userMessage.includes('thank')) {
            const responses = [
                "You're so welcome! 🌟 Happy to help anytime. Keep learning and growing!",
                "My pleasure! 😊 That's what I'm here for. Good luck with your skill-swapping adventure!",
                "Anytime! 💖 Feel free to ask if you need anything else. Now go find that perfect swap partner!"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else {
            const responses = [
                "That's a great question! 💭 SkillSwap connects people to learn from each other. What would you like to explore?",
                "Interesting! 🤔 In our community, you can find experts in many fields. Have you checked the Skills page?",
                "Good thinking! 🎯 Whether teaching or learning, SkillSwap has a vibrant community ready to help. What's your goal?",
                "I love your curiosity! ✨ Browse skills, update your profile, and start connecting. What interests you most?"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }

        res.status(200).json({ 
            message: response,
            response: response,
            source: 'fallback'
        });
    } catch (err) {
        console.error('AI chat error:', err);
        res.status(500).json({ 
            message: "Oops! I had a little hiccup. 😅 Try asking me again!",
            error: err.message
        });
    }
});

module.exports = router;