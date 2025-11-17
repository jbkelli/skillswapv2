import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export default function AIChatbot({ inChatMode = false, onClose }) {
  const [isOpen, setIsOpen] = useState(inChatMode);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey there! I\'m Vally, your AI learning companion. Feeling stuck? Let\'s break through that zone together! 🚀' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call your AI API here (OpenAI, Claude, etc.)
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: input,
          context: 'skillswap'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || data.response || 'I\'m here to help! What would you like to know?'
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (inChatMode) {
    // Button mode for chat page
    return (
      <>
        {/* Toggle Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="mb-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-purple-600 text-xs">
              V
            </div>
            <span className="font-semibold">Need help? Ask Vally! 🚀</span>
          </button>
        )}

        {/* Chat Interface */}
        {isOpen && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg mb-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-purple-600 text-sm">
                  V
                </div>
                <div>
                  <h4 className="font-bold text-sm">Vally - AI Assistant</h4>
                  <p className="text-xs text-purple-100">Here to help you learn!</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Messages */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-2 bg-gray-900">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
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
                  <div className="bg-gray-700 px-3 py-2 rounded-lg rounded-bl-none">
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
            <div className="p-3 bg-gray-800 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Vally anything..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Floating chatbot for homepage
  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed top-20 sm:top-24 right-2 sm:right-4 z-[9999] group">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-linear-to-br from-purple-600 to-pink-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            Feeling like breaking the zone? Chat with Vally! 💬
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed top-20 sm:top-24 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-96 max-w-md h-[70vh] sm:h-[500px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-[9999] flex flex-col">
          {/* Header */}
          <div className="bg-linear-to-r from-purple-600 to-pink-600 p-3 sm:p-4 rounded-t-2xl flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-purple-600">
                V
              </div>
              <div>
                <h3 className="font-bold">Vally</h3>
                <p className="text-xs text-purple-100">AI Learning Companion</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-100 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none">
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
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
