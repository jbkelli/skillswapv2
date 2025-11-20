const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { AI, injector } = require('../service/emailGenerator');
const { aiLimiter } = require('../middleware/rateLimiter.middleware');

// Here's everything Vally knows about SkillSwap
const SKILLSWAP_CONTEXT = `You are Vally, a friendly and helpful AI assistant for SkillSwap.

SkillSwap is a platform where people exchange skills and learn from each other through direct connections.

KEY FEATURES:
- Profile Creation: Users create profiles with skills they HAVE and skills they WANT to learn
- Dashboard: Two main tabs:
  * "Your Swappies" - Shows your connections/matches
  * "Discover Swappies" - Browse all users to find matches
- Swap Requests: Send and receive connection requests to swap skills
- Real-time Chat: Message your swap partners to coordinate learning sessions
- Search & Filter: Find users by name, skills they have, or location
- User Profiles: View detailed profiles with skills, bio, and contact info

HOW SKILLSWAP WORKS:
1. Sign up and create your profile
2. Add skills you HAVE (what you can teach)
3. Add skills you WANT to learn
4. Browse other users in "Discover Swappies"
5. Send a swap request to someone whose skills complement yours
6. Once they accept, they become your "Swappie"
7. Chat with them to arrange learning sessions
8. Exchange skills and grow together!

EXAMPLE USE CASES:
- A graphic designer who wants to learn web development finds a developer who wants to learn design
- Someone who speaks Spanish wants to learn French, finds a French speaker who wants to learn Spanish
- A guitar player wants to learn piano, connects with a pianist who wants to learn guitar

PLATFORM FEATURES:
- Contact page to reach the SkillSwap team
- User authentication and secure login
- Real-time notifications for new requests and messages
- Profile customization with bio and location

IMPORTANT: Be concise and natural. Answer questions directly without repeatedly introducing yourself. Only mention your name if it's the first message or if specifically asked. Be encouraging, friendly, and helpful.`;

// Endpoint to generate professional cold emails using AI
router.post('/generate-email', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { sender, receiver, bizName, category, pitch } = req.body;

        // Making sure we have all the info we need
        if (!sender || !receiver || !bizName || !category || !pitch) {
            return res.status(400).json({ 
                message: 'All fields are required: sender, receiver, bizName, category, pitch' 
            });
        }

        // Let the AI work its magic
        const generatedEmail = await injector(sender, receiver, bizName, category, pitch);

        res.status(200).json({ 
            success: true,
            email: generatedEmail
        });
    } catch (err) {
        console.error('Email generation error:', err);
        res.status(500).json({ 
            message: 'Failed to generate email. Please try again.',
            error: err.message 
        });
    }
});

// Main chat endpoint where Vally responds to user questions
router.post('/chat', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Give Vally the SkillSwap knowledge base before answering
        const contextualPrompt = `${SKILLSWAP_CONTEXT}

User Question: ${prompt}

Provide a helpful response as Vally. If the question is about SkillSwap, use the context above. If it's a general question, answer it naturally while maintaining your friendly Vally personality.`;

        // Get Vally's response
        const response = await AI(contextualPrompt);

        res.status(200).json({ 
            success: true,
            response: response
        });
    } catch (err) {
        console.error('AI chat error:', err);
        res.status(500).json({ 
            message: 'AI request failed. Please try again.',
            error: err.message
        });
    }
});

module.exports = router;
