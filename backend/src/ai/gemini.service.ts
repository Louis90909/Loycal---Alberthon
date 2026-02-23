import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not set. AI features will not work.');
    } else {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async chatWithRemi(
    message: string,
    history: { role: 'user' | 'model'; text: string }[],
    context: any,
  ): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini API not configured');
    }

    try {
      const LOYCAL_AI_PERSONA = `
Tu es Rémi, l'expert IA de Loycal, une solution de fidélisation pour restaurants indépendants.
Ton objectif est d'aider les restaurateurs à optimiser leur business via la psychologie comportementale et l'analyse de données.
TON STYLE : Professionnel, direct, encourageant. Pas de bla-bla. Des actions concrètes.
`;

      const statsContext = `
CONTEXTE :
- Restaurant : ${context.restaurantName || 'Mon Restaurant'}
- CA Fidélité : ${context.revenue || 0}€
- Panier Moyen : ${context.averageTicket || 0}€
- Programme : ${context.loyaltyType || 'Non défini'}
- Membres : ${context.memberCount || 0}
`;

      const chat = this.ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: LOYCAL_AI_PERSONA + '\n' + statsContext,
        },
      });

      // Ajouter l'historique si disponible
      if (history && history.length > 0) {
        for (const msg of history.slice(-5)) {
          // Limiter à 5 derniers messages pour le contexte
          await chat.sendMessage({ message: msg.text });
        }
      }

      const response = await chat.sendMessage({ message });
      return response.text || "Je n'ai pas pu formuler de réponse.";
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Erreur de connexion avec Rémi.');
    }
  }

  async generateOffer(objective: string): Promise<any> {
    if (!this.ai) {
      throw new Error('Gemini API not configured');
    }

    try {
      const LOYCAL_AI_PERSONA = `
Tu es Rémi, l'expert IA de Loycal. Génère des offres de fidélité pertinentes pour restaurateurs.
`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Objectif : "${objective}". Génère une offre.` }] },
        config: {
          systemInstruction: LOYCAL_AI_PERSONA,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              target: { type: Type.STRING },
              implementationTip: { type: Type.STRING },
            },
            required: ['title', 'description', 'target', 'implementationTip'],
          },
        },
      });

      const resultText = response.text?.trim();
      return resultText ? JSON.parse(resultText) : { title: '', description: '', target: '', implementationTip: '' };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Erreur génération offre.');
    }
  }

  async generateCampaign(objective: string, segment: string): Promise<any> {
    if (!this.ai) {
      throw new Error('Gemini API not configured');
    }

    try {
      const LOYCAL_AI_PERSONA = `
Tu es Rémi, l'expert IA de Loycal. Génère des campagnes marketing pour restaurateurs.
`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              text: `Génère une idée de campagne marketing. Objectif : "${objective}". Segment : "${segment}".`,
            },
          ],
        },
        config: {
          systemInstruction: LOYCAL_AI_PERSONA,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              channel: { type: Type.STRING, enum: ['SMS', 'Email'] },
              targetSegment: { type: Type.STRING },
              objective: { type: Type.STRING },
              message: { type: Type.STRING },
            },
            required: ['channel', 'targetSegment', 'objective', 'message'],
          },
        },
      });

      const resultText = response.text?.trim();
      return resultText
        ? JSON.parse(resultText)
        : { channel: 'Email', targetSegment: segment, objective, message: '' };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Erreur génération campagne.');
    }
  }
}








