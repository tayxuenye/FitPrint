'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Outfit, WardrobeItem } from '@/types';
import { getItems, getChatHistory, saveChatHistory } from '@/lib/storage';

interface AIStylistProps {
    wardrobeItems: WardrobeItem[];
}

const QUICK_ACTIONS = [
    "I need an outfit for a job interview",
    "What should I wear for a casual date?",
    "Show me formal outfit options",
    "Help me pick something for a party",
];

export default function AIStylist({ wardrobeItems }: AIStylistProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load chat history on mount
    useEffect(() => {
        const history = getChatHistory();
        if (history.length > 0) {
            setMessages(history);
        } else {
            // Add greeting message
            const greeting: ChatMessage = {
                id: 'greeting',
                role: 'assistant',
                content: "Hi! I'm your personal AI stylist. I can help you pick the perfect outfit for any occasion. Just tell me what you need!",
                timestamp: new Date().toISOString(),
            };
            setMessages([greeting]);
        }
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSendMessage = async (messageText?: string) => {
        const text = messageText || inputValue.trim();
        if (!text || isLoading) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            console.log('💬 Sending message to AI:', text);
            // Use client-side AI (no API calls needed)
            const { generateAIResponse } = await import('@/lib/aiStylist');
            const result = await generateAIResponse(text, wardrobeItems, []);
            console.log('✅ AI response received:', result);

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: result.message,
                outfits: result.outfits,
                timestamp: new Date().toISOString(),
            };

            const updatedMessages = [...newMessages, assistantMessage];
            setMessages(updatedMessages);
            saveChatHistory(updatedMessages);
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: "I'm sorry, I'm having trouble right now. Please try again later.",
                timestamp: new Date().toISOString(),
            };
            setMessages([...newMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        handleSendMessage(action);
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 z-40 flex items-center justify-center"
                    aria-label="Open AI Stylist"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
                    <div className="bg-white dark:bg-zinc-900 flex flex-col h-screen overflow-hidden pb-16">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">AI Stylist</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                aria-label="Close chat"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-3 ${message.role === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                        {/* Display outfits if present */}
                                        {message.outfits && message.outfits.length > 0 && (
                                            <div className="mt-3 space-y-3">
                                                {message.outfits.map((outfit) => (
                                                    <div
                                                        key={outfit.id}
                                                        className="bg-white/10 dark:bg-zinc-700/50 rounded-xl p-3 mt-2"
                                                    >
                                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                                            {outfit.items.map((item) => (
                                                                <div key={item.id} className="flex-shrink-0">
                                                                    <div
                                                                        className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                                                                        style={{ backgroundColor: item.colorHex }}
                                                                    >
                                                                        {item.category === 'tops' && '👕'}
                                                                        {item.category === 'bottoms' && '👖'}
                                                                        {item.category === 'shoes' && '👟'}
                                                                        {item.category === 'accessories' && '⌚'}
                                                                        {item.category === 'outerwear' && '🧥'}
                                                                        {item.category === 'dresses' && '👗'}
                                                                    </div>
                                                                    <p className="text-xs mt-1 text-center truncate w-16">
                                                                        {item.name.split(' ').slice(0, 2).join(' ')}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {outfit.reasoning && (
                                                            <p className="text-xs mt-2 opacity-90 italic">
                                                                {outfit.reasoning}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-3">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions (show only if no messages except greeting) */}
                        {messages.length === 1 && messages[0].role === 'assistant' && (
                            <div className="px-4 pb-2">
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_ACTIONS.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickAction(action)}
                                            className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex-shrink-0 bg-white dark:bg-zinc-900 sticky bottom-0">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Ask for outfit recommendations..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-base"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="px-4 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Send message"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

