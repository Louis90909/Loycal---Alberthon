// Updated geminiService.ts to use REST API directly
import type { OfferSuggestion, CampaignIdea, Restaurant } from '../../shared/types';

// Get API key from environment
const getApiKey = () => {
    return import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBxH2JTiA2TzgAcfNrhIgkHLLB5YLhoGXI';
};

const LOYCAL_AI_PERSONA = `
Tu es Rémi, l'expert IA de Loycal, une solution de fidélisation pour restaurants indépendants.
Ton objectif est d'aider les restaurateurs à optimiser leur business via la psychologie comportementale et l'analyse de données.
TON STYLE : Professionnel, direct, encourageant. Pas de bla-bla. Des actions concrètes.
`;

// Helper function to call Gemini API
const callGeminiAPI = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const apiKey = getApiKey();
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API Error');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Pas de réponse.";
};

export const chatWithRemi = async (message: string, history: {role: 'user' | 'model', text: string}[], context: any): Promise<string> => {
    try {
        const statsContext = `
CONTEXTE :
- Restaurant : ${context.restaurantName}
- CA Fidélité : ${context.revenue}€
- Panier Moyen : ${context.averageTicket}€
- Programme : ${context.loyaltyType}
        `;

        const systemPrompt = LOYCAL_AI_PERSONA + "\n" + statsContext;
        
        // Include last 3 messages as context
        let conversationContext = '';
        if (history.length > 0) {
            const recentHistory = history.slice(-3);
            conversationContext = '\n\nHistorique récent:\n' + recentHistory.map(h => 
                `${h.role === 'user' ? 'Restaurateur' : 'Rémi'}: ${h.text}`
            ).join('\n');
        }

        const fullPrompt = conversationContext + '\n\nQuestion actuelle: ' + message;
        
        return await callGeminiAPI(fullPrompt, systemPrompt);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Erreur de connexion avec Rémi.");
    }
};

export const generateDynamicInsight = async (section: string, context: any): Promise<string> => {
    try {
        const prompt = `Génère un conseil court (1-2 phrases) pour la section "${section}". 
        Données : CA ${context.revenue}€, Panier moyen ${context.averageTicket}€, Type ${context.loyaltyType}.
        Inclus un concept de psychologie comportementale.`;
        
        return await callGeminiAPI(prompt, LOYCAL_AI_PERSONA);
    } catch (error) {
        return "Analysez vos segments pour identifier vos clients les plus rentables.";
    }
};

export const generateAnalyticalReport = async (theme: string, data: any): Promise<string> => {
    try {
        const prompt = `Rédige un rapport analytique complet sur le thème "${theme}".
        Données brutes : ${JSON.stringify(data)}.
        Structure : 1. État des lieux, 2. Points forts, 3. Axes d'amélioration, 4. Plan d'action prioritaires.
        Utilise du Markdown (titres, listes).`;
        
        return await callGeminiAPI(prompt, LOYCAL_AI_PERSONA);
    } catch (error) {
        throw new Error("Impossible de générer le rapport personnalisé.");
    }
};

export const generateOffer = async (objective: string): Promise<OfferSuggestion> => {
    try {
        const prompt = `Objectif : "${objective}". 
        Génère une offre promotionnelle au format JSON avec ces champs:
        - title: Le titre de l'offre
        - description: Description détaillée
        - target: Le segment ciblé
        - implementationTip: Un conseil pratique de mise en œuvre
        
        Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;
        
        const response = await callGeminiAPI(prompt, LOYCAL_AI_PERSONA);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid JSON response');
    } catch (error) {
        throw new Error("Erreur génération offre.");
    }
};

export const generateCampaign = async (objective: string, segment: string): Promise<CampaignIdea> => {
    try {
        const prompt = `Génère une idée de campagne marketing. 
        Objectif : "${objective}". 
        Segment : "${segment}".
        
        Réponds au format JSON avec:
        - channel: "SMS" ou "Email"
        - targetSegment: Le segment ciblé
        - objective: L'objectif reformulé
        - message: Le message de la campagne
        
        Réponds UNIQUEMENT avec le JSON.`;
        
        const response = await callGeminiAPI(prompt, LOYCAL_AI_PERSONA);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return { channel: 'Email', targetSegment: segment, objective, message: response };
    } catch (error) {
        throw new Error("Erreur génération campagne.");
    }
};

export const generateMapInsight = async (competitors: Restaurant[], userRestaurant: Restaurant): Promise<string> => {
    try {
        const prompt = `Analyse l'environnement concurrentiel de mon restaurant "${userRestaurant.name}" (${userRestaurant.cuisine}).
        Concurrents aux alentours : ${JSON.stringify(competitors.map(c => ({ name: c.name, cuisine: c.cuisine, offer: c.offer })))}.
        Donne un conseil stratégique court (1-2 phrases) sur comment se démarquer.`;
        
        return await callGeminiAPI(prompt, LOYCAL_AI_PERSONA);
    } catch (error) {
        return "Analysez vos concurrents pour identifier des opportunités de différenciation.";
    }
};