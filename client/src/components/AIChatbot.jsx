import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'email'
  
  // Load messages from localStorage on mount
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('vallyMessages');
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }
    return [
      { role: 'assistant', content: 'Hi! I\'m Vally, your AI learning companion for SkillSwap! 🚀 I can help you understand how SkillSwap works, answer questions about the platform, or generate professional cold outreach emails. What would you like to know?' }
    ];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // State for the email generator tab
  const [emailForm, setEmailForm] = useState({
    sender: '',
    receiver: '',
    bizName: '',
    category: '',
    pitch: ''
  });
  const [generatedEmail, setGeneratedEmail] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vallyMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendChat = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: input })
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'I\'m here to help! What would you like to know?'
      }]);
    } catch (err) {
      console.error('AI Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Oops! I had a little hiccup. Try asking me again! 😊'
      }]);
    }

    setLoading(false);
  };

  const handleGenerateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedEmail('');

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(emailForm)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate email: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (err) {
      console.error('Email generation error:', err);
      setGeneratedEmail('Failed to generate email. Please try again.');
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-linear-to-br from-purple-600 to-pink-600 text-white px-6 py-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
          >
            <span className="font-bold text-lg">VALLY</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-linear-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-purple-600">
                V
              </div>
              <div>
                <h4 className="font-bold">Vally - AI Assistant</h4>
                <p className="text-xs text-purple-100">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 font-semibold transition-colors ${
                activeTab === 'chat' 
                  ? 'bg-gray-800 text-white border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-3 font-semibold transition-colors ${
                activeTab === 'email' 
                  ? 'bg-gray-800 text-white border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ✉️ Email Generator
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' ? (
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-2 rounded-lg text-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-700 text-gray-100 rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 px-4 py-2 rounded-lg rounded-bl-none">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-gray-800 border-t border-gray-700 shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={loading || !input.trim()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 text-sm font-semibold"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4">
                <form onSubmit={handleGenerateEmail} className="space-y-3">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={emailForm.sender}
                      onChange={(e) => setEmailForm({...emailForm, sender: e.target.value})}
                      required
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Receiver Name</label>
                    <input
                      type="text"
                      value={emailForm.receiver}
                      onChange={(e) => setEmailForm({...emailForm, receiver: e.target.value})}
                      required
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Recipient name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Business Name</label>
                    <input
                      type="text"
                      value={emailForm.bizName}
                      onChange={(e) => setEmailForm({...emailForm, bizName: e.target.value})}
                      required
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your company"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Category/Industry</label>
                    <input
                      type="text"
                      value={emailForm.category}
                      onChange={(e) => setEmailForm({...emailForm, category: e.target.value})}
                      required
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., SaaS, Marketing"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Pitch/Value Proposition</label>
                    <textarea
                      value={emailForm.pitch}
                      onChange={(e) => setEmailForm({...emailForm, pitch: e.target.value})}
                      required
                      rows={3}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="What value do you offer?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-500 transition-colors font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Email'}
                  </button>
                </form>

                {generatedEmail && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Generated Email:</h4>
                    <pre className="text-gray-300 text-xs whitespace-pre-wrap">{generatedEmail}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
