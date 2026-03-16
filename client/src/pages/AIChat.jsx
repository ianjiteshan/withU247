import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your WithU247 AI Companion. How can I support you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef(null);

  const helplines = [
    { name: "Vandrevala Foundation", number: "9999666555" },
    { name: "AASRA", number: "9820466726" },
    { name: "iCall", number: "9152987821" },
    { name: "Kiran (National)", number: "1800-599-0019" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, session_id: sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        if (data.crisis) {
          setMessages(prev => [...prev, {
            role: 'crisis',
            content: '🚨 We noticed you may be in distress. Please reach out:\n\n' +
              data.helplines.map(h => `• ${h.name}: ${h.number}`).join('\n') +
              '\n\nYou are not alone. Help is available 24/7.'
          }]);
          setShowCrisisModal(true);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong connecting to the companion.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error communicating with the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 px-4 md:px-12 flex flex-col font-sans mb-[100px]">
      <div className="max-w-4xl w-full mx-auto flex flex-col h-[80vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Chat Header */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-zinc-900/80 backdrop-blur-md z-10 p-4 border-b border-zinc-800/50 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-xl mr-3 shadow-lg shadow-red-600/20">
              W
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">WithU247 AI</h1>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Companion</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCrisisModal(true)}
            className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all border border-red-600/20"
          >
            <span className="animate-pulse">🆘</span> Emergency Help
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 pt-24 pb-32 space-y-6 scrollbar-hide relative z-0">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-red-600 text-white rounded-br-none' 
                      : msg.role === 'crisis'
                        ? 'bg-red-900/30 text-red-100 rounded-bl-none border-2 border-red-600/50'
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-zinc-800 p-4 rounded-xl rounded-bl-none border border-zinc-700 flex space-x-1.5 px-6">
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How are you feeling today?"
              className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-red-600 transition-all shadow-inner text-white placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2.5 p-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center flex shadow-lg hover:shadow-red-600/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
          <p className="text-center text-[10px] text-zinc-500 mt-3 uppercase tracking-widest font-bold">
            Companion can make mistakes • For life-threatening emergencies, call Local Authorities
          </p>
        </div>
      </div>

      {/* Crisis Overlay Modal */}
      <AnimatePresence>
        {showCrisisModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowCrisisModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-zinc-900 border border-red-600/30 rounded-3xl p-8 z-[110] shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-600/10 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-pulse">
                  🆘
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Emergency Support</h2>
                <p className="text-zinc-500 font-medium">Please reach out to these 24/7 helplines. You are not alone.</p>
              </div>

              <div className="space-y-3">
                {helplines.map(h => (
                  <div key={h.name} className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700 rounded-2xl group hover:border-red-600/50 transition-all shadow-sm">
                    <div>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{h.name}</p>
                      <p className="text-white font-black text-lg">{h.number}</p>
                    </div>
                    <a 
                      href={`tel:${h.number.replace(/-/g, '')}`} 
                      className="bg-red-600 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-lg hover:bg-red-700 transition-all uppercase tracking-tighter"
                    >
                      Call Now
                    </a>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowCrisisModal(false)}
                className="w-full mt-8 py-3 bg-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-700 hover:text-white transition-all uppercase text-xs"
              >
                Close Resources
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
