import React, { useState } from 'react';
import { RatIcon } from './icons/RatIcon';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon } from './icons/SpinnerIcon';

const RatExpertHub: React.FC = () => {
    const [messages, setMessages] = useState<{role: 'user' | 'rat', content: string}[]>([
        { role: 'rat', content: "Bonjour ! Je suis ton Expert en Fidélité. J'ai analysé tes données : il y a du potentiel sur les services du mardi soir. Que veux-tu faire aujourd'hui ?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const suggestions = [
        "Optimise mon programme",
        "Fais-moi gagner plus",
        "Campagne pour samedi soir ?",
        "Analyse mes clients inactifs"
    ];

    const handleSend = async (text: string) => {
        if (!text.trim()) return;
        
        const userMsg = { role: 'user' as const, content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Initialize the GoogleGenAI instance with the API key from environment variables.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // Call generateContent with both model name and prompt as per guidelines.
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [{ text: `Tu es "Le Rat Expert", un consultant en fidélité pour restaurateurs.
                    Ton style est : Professionnel, direct, orienté résultat, un peu "Pixar" (sympathique mais expert).
                    Tu parles à un restaurateur occupé. Fais court. Donne des actions concrètes.
                    
                    Le restaurateur demande : "${text}"` }]
                },
                config: {
                    systemInstruction: "Tu es un expert UX en fidélité restaurant. Réponds toujours avec une structure : 1. Analyse rapide 2. Action recommandée 3. Impact estimé.",
                }
            });

            // Extract text directly from the text property of the response object.
            setMessages(prev => [...prev, { role: 'rat', content: response.text || "Je réfléchis..." }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'rat', content: "Désolé, je ne peux pas analyser tes données pour le moment." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
            {/* Header Area */}
            <div className="bg-white p-6 rounded-t-2xl shadow-sm border-b border-gray-200 flex items-center space-x-4">
                <div className="bg-brand-secondary/10 p-2 rounded-full border-2 border-brand-secondary">
                    <RatIcon className="w-10 h-10 text-brand-dark" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Rat Expert en Fidélité</h1>
                    <p className="text-sm text-green-600 font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Analyse temps réel active
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'rat' && (
                                <div className="flex-shrink-0 mr-3 mt-1">
                                    <div className="w-8 h-8 bg-white rounded-full border border-gray-200 p-1 flex items-center justify-center">
                                        <RatIcon className="w-full h-full" />
                                    </div>
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
                                msg.role === 'user' 
                                ? 'bg-brand-primary text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="flex items-center space-x-2 bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200">
                             <SpinnerIcon className="w-4 h-4 text-brand-secondary" />
                             <span className="text-gray-500 text-sm">Analyse en cours...</span>
                        </div>
                     </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 rounded-b-2xl shadow-lg border-t border-gray-200">
                {/* Suggestions Pills */}
                <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSend(s)}
                            className="px-4 py-2 bg-gray-100 hover:bg-brand-secondary/10 hover:text-brand-secondary border border-gray-200 rounded-full text-sm font-semibold text-gray-600 whitespace-nowrap transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="flex space-x-4">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                        placeholder="Demandez une analyse, une offre ou une optimisation..."
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                    <button 
                        onClick={() => handleSend(input)}
                        disabled={!input.trim() || isLoading}
                        className="bg-brand-primary hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-bold shadow-md disabled:bg-gray-300 transition-colors"
                    >
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatExpertHub;