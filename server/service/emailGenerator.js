const { GoogleGenerativeAI } = require('@google/generative-ai');

// Setting up Gemini with our API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Main AI function - just pass in a prompt and get back generated text
async function AI(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite-preview-09-2025" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('AI error:', error.message);
        throw error;
    }
}

// Template for generating cold outreach emails
const COLD_EMAIL_PROMPT = `
Generate a professional cold outreach email with the following structure:
1. Subject line
2. Email body
3. Signature

Now generate the final outreach email
`;

// This function takes user details and crafts a personalized cold email
function injector(sender, receiver, bizName, category, pitch) {
    const prompt = `
You are a professional email writer. Generate a personalized cold outreach email with these details:

Sender: ${sender}
Receiver: ${receiver}
Business/Company: ${bizName}
Category/Industry: ${category}
Pitch/Value Proposition: ${pitch}

Create a compelling cold email that:
1. Has an attention-grabbing subject line
2. Starts with a personalized greeting
3. Briefly introduces the sender and their company
4. Clearly states the value proposition
5. Includes a clear call-to-action
6. Ends with a professional signature

Format the response as:
Subject: [subject line]

[email body]

[signature]
`;

    return AI(prompt);
}

module.exports = {
    AI,
    injector
};
