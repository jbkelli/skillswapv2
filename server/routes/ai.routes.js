const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// AI Chat endpoint
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, context } = req.body;
        const userMessage = message.toLowerCase();

        // Context-aware mock AI responses
        let response = '';

        // Detect keywords and provide contextual responses
        if (userMessage.includes('skill') || userMessage.includes('learn')) {
            const skillResponses = [
                "Learning new skills is exciting! On SkillSwap, you can find someone to teach you while sharing your own expertise. What skill are you interested in?",
                "Great question about skills! The best way to learn is by doing. Have you checked out the available skills in your area on the Skills page?",
                "Skill development takes practice! I recommend starting with small goals and finding a swap partner who complements your abilities.",
                "Every skill starts with curiosity! Browse through our community to find mentors who can help you on your learning journey."
            ];
            response = skillResponses[Math.floor(Math.random() * skillResponses.length)];
        } else if (userMessage.includes('swap') || userMessage.includes('exchange')) {
            const swapResponses = [
                "Skill swapping is all about mutual growth! Find someone whose skills you want and offer something they need in return. It's a win-win!",
                "The beauty of SkillSwap is the exchange - you teach what you know, and learn what you don't. Have you created your profile yet?",
                "Ready to swap? Head to the Skills page to browse what others are offering, and make sure your profile shows what you can teach!",
                "Swapping skills builds community! When you find a match, use our chat feature to coordinate sessions and start learning together."
            ];
            response = swapResponses[Math.floor(Math.random() * swapResponses.length)];
        } else if (userMessage.includes('help') || userMessage.includes('how')) {
            const helpResponses = [
                "I'm here to help! You can browse skills, connect with others, and start swapping. What would you like to know more about?",
                "Need guidance? Start by completing your profile, listing your skills, then browse the community to find potential swap partners!",
                "Happy to assist! SkillSwap has three main areas: Your Profile (what you offer/want), Skills (browse community), and Chat (connect with matches).",
                "Let me guide you! First, update your profile with skills you have and want. Then explore the Skills page to find your perfect swap partner!"
            ];
            response = helpResponses[Math.floor(Math.random() * helpResponses.length)];
        } else if (userMessage.includes('profile') || userMessage.includes('account')) {
            const profileResponses = [
                "Your profile is your introduction to the community! Make sure to add your skills, bio, and a profile picture to attract swap partners.",
                "A complete profile gets more matches! Head to the Profile page to add your skills, interests, and what you're looking to learn.",
                "Your profile is looking good! Keep it updated with new skills you acquire and new things you want to learn.",
                "Pro tip: The more detailed your profile, the better your matches! Add specific skills and be clear about your learning goals."
            ];
            response = profileResponses[Math.floor(Math.random() * profileResponses.length)];
        } else if (userMessage.includes('chat') || userMessage.includes('message') || userMessage.includes('connect')) {
            const chatResponses = [
                "Communication is key! Once you find someone interesting, use the Chat feature to discuss swap opportunities and schedule sessions.",
                "Ready to connect? Find someone with complementary skills and start a conversation! The Chat page makes it easy to coordinate.",
                "Great connections start with a message! Don't be shy - reach out to potential swap partners and introduce yourself!",
                "The Chat feature helps you organize your swaps. Message your matches, set up times, and start learning from each other!"
            ];
            response = chatResponses[Math.floor(Math.random() * chatResponses.length)];
        } else if (userMessage.includes('hi') || userMessage.includes('hello') || userMessage.includes('hey')) {
            const greetingResponses = [
                "Hey there! 👋 I'm Vally, your SkillSwap companion. Ready to break through that learning zone? What can I help you with?",
                "Hello! So glad you're here! I can help you navigate SkillSwap, find skills to learn, or answer any questions. What's on your mind?",
                "Hi! Welcome to SkillSwap! I'm here to make your skill-learning journey smooth and fun. What would you like to explore?",
                "Hey! 🚀 Excited to help you on your learning adventure! Ask me anything about finding skills, connecting with others, or using the platform!"
            ];
            response = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
        } else if (userMessage.includes('thank') || userMessage.includes('thanks')) {
            const thanksResponses = [
                "You're very welcome! Happy to help anytime. Keep learning and growing! 🌟",
                "My pleasure! That's what I'm here for. Good luck with your skill-swapping journey!",
                "Anytime! Feel free to ask if you need anything else. I'm always here to help! 😊",
                "Glad I could help! Remember, the best learning happens when you take action. Go find that perfect swap partner!"
            ];
            response = thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
        } else {
            // General responses for everything else
            const generalResponses = [
                "That's a great question! SkillSwap is all about connecting people to learn from each other. What specific aspect interests you?",
                "Interesting! In the SkillSwap community, you can find experts in various fields. Have you explored the Skills page yet?",
                "I love your curiosity! The best way to learn is by connecting with others. Let me know if you need help finding the right match!",
                "Good thinking! Whether you're looking to teach or learn, SkillSwap has a vibrant community ready to help. What's your goal?",
                "Great question! Every journey starts with a single step. Browse skills, update your profile, and start connecting. What would you like to focus on first?",
                "I'm here to make your experience smooth! SkillSwap works best when you're active - update your profile, browse skills, and reach out to potential partners!",
                "That's worth exploring! The community has diverse skills. Check the Skills page to see what's available, or tell me what you're interested in!",
                "Absolutely! Learning is a collaborative process. Use SkillSwap to find people who complement your abilities and grow together!"
            ];
            response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        }

        // TODO: Replace with actual AI API call in production
        // Example with OpenAI:
        // const completion = await openai.chat.completions.create({
        //     model: "gpt-3.5-turbo",
        //     messages: [
        //         { role: "system", content: "You are Vally, a friendly AI learning companion for SkillSwap platform." },
        //         { role: "user", content: message }
        //     ]
        // });

        res.status(200).json({ 
            message: response,
            response: response
            // response: completion.choices[0].message.content
        });
    } catch (err) {
        console.error('AI chat error:', err);
        res.status(500).json({ message: 'AI service error' });
    }
});

module.exports = router;
