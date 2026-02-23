
import React, { useState, useEffect, useRef } from 'react';
import { RemiIcon } from './icons/RemiIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { chatWithRemi } from '../services/geminiService';
import { getBackendService } from '../../shared/services/apiConfig';

interface Message {
    role: 'user' | 'remi';
    content: string;
}

const RemiExpertHub: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'remi', content: "Bonjour Chef ! Je suis Rémi, votre copilote en fidélisation. J'ai accès à vos données de vente et de fidélité pour vous conseiller. Quel est votre défi aujourd'hui ?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        "Comment augmenter mon taux de retour ?",
        "Une offre pour booster mes mardis midis ?",
        "Que faire pour mes clients inactifs ?",
        "Comment optimiser mon panier moyen ?"
    ];

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const backend = await getBackendService();
            const user = backend.getCurrentUser();
            const rId = user?.restaurantId ? (user.restaurantId) : null;
            const restaurant = rId ? await backend.getRestaurant(rId) : null;
            const analytics: any = await backend.getAnalytics(rId || 1);

            const context = {
                restaurantName: restaurant?.name || "Mon Restaurant",
                cuisine: restaurant?.cuisine || "Inconnue",
                revenue: (analytics?.totalRevenue || 0).toFixed(0),
                averageTicket: (analytics?.averageTicket || 0).toFixed(2),
                loyaltyType: restaurant?.loyaltyConfig?.type || "Non défini",
                memberCount: 124 // Mocked count
            };

            // 2. Call Gemini
            const historyForAi = messages.map(m => ({
                role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
                text: m.content
            }));

            const response = await chatWithRemi(text, historyForAi, context);

            setMessages(prev => [...prev, { role: 'remi', content: response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'remi',
                content: "Oups, j'ai eu un petit problème de connexion avec ma toque de chef. Pouvez-vous réessayer dans un instant ?"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in border border-gray-100">
            {/* Chat Header */}
            <div className="bg-brand-primary p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="bg-white/10 p-2 rounded-full border border-white/20">
                        <RemiIcon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Rémi l'Expert IA</h1>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs text-brand-light font-medium">Analyses basées sur vos données réelles</span>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:block text-right text-white/60 text-xs">
                    <p>Panier moyen actuel</p>
                    <p className="font-bold text-white text-sm">38.50€</p>
                </div>
            </div>

            {/* Message Area */}
            <div
                ref={scrollRef}
                className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                    >
                        <div className={`flex max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                            {msg.role === 'remi' && (
                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 p-1 mr-3 flex-shrink-0 mt-1">
                                    <RemiIcon className="w-full h-full" />
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-brand-primary text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                }`}>
                                {msg.content.split('\n').map((line, i) => (
                                    <p key={i} className={line.startsWith('#') ? 'font-bold text-base my-2' : 'mb-2'}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                            <SpinnerIcon className="w-4 h-4 text-brand-secondary" />
                            <span className="text-gray-500 text-xs font-medium">Rémi analyse vos chiffres...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input & Suggestions */}
            <div className="bg-white p-6 border-t border-gray-100">
                {/* Quick Suggestions */}
                {!isLoading && (
                    <div className="flex space-x-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s)}
                                className="px-4 py-2 bg-slate-100 hover:bg-brand-secondary/10 hover:text-brand-secondary border border-slate-200 rounded-full text-[11px] font-bold text-gray-600 whitespace-nowrap transition-all active:scale-95"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex space-x-4 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(input);
                                }
                            }}
                            placeholder="Posez votre question à Rémi..."
                            className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none resize-none transition-all pr-12 bg-slate-50"
                        />
                        <div className="absolute right-4 bottom-4 text-gray-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => handleSend(input)}
                        disabled={!input.trim() || isLoading}
                        className="bg-brand-secondary hover:bg-orange-600 text-white h-[56px] px-8 rounded-2xl font-bold shadow-lg shadow-brand-secondary/20 disabled:bg-gray-200 disabled:shadow-none transition-all transform active:scale-95 flex items-center justify-center min-w-[120px]"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5 mr-0" /> : "Envoyer"}
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 text-center">
                    Rémi peut commettre des erreurs. Validez toujours ses recommandations stratégiques avant de les appliquer.
                </p>
            </div>
        </div>
    );
};

export default RemiExpertHub;
