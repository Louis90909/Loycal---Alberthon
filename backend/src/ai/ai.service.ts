import { Injectable, NotFoundException } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { RAGService } from './rag.service';
import { PrismaService } from '../database/prisma.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AIService {
  constructor(
    private geminiService: GeminiService,
    private ragService: RAGService,
    private prisma: PrismaService,
  ) {}

  async chatWithRemi(userId: string, chatDto: ChatDto): Promise<string> {
    // Récupérer l'utilisateur et son restaurant
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.restaurantId) {
      throw new NotFoundException('User is not associated with a restaurant');
    }

    // Récupérer le contexte via RAG
    const context = await this.ragService.getContextForRestaurant(user.restaurantId, userId);

    if (!context) {
      throw new NotFoundException('Restaurant not found');
    }

    // Enrichir le contexte avec des insights
    const insights = await this.ragService.getInsights(user.restaurantId);
    const enrichedContext = {
      ...context,
      insights: insights.join(' '),
    };

    // Appeler Gemini avec le contexte enrichi
    return this.geminiService.chatWithRemi(chatDto.message, chatDto.history || [], enrichedContext);
  }

  async generateOffer(userId: string, objective: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.restaurantId) {
      throw new NotFoundException('User or restaurant not found');
    }

    // Récupérer le contexte
    const context = await this.ragService.getContextForRestaurant(user.restaurantId, userId);

    // Générer l'offre avec Gemini
    return this.geminiService.generateOffer(objective);
  }

  async generateCampaign(userId: string, objective: string, segment: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.restaurantId) {
      throw new NotFoundException('User or restaurant not found');
    }

    // Récupérer le contexte
    const context = await this.ragService.getContextForRestaurant(user.restaurantId, userId);

    // Générer la campagne avec Gemini
    return this.geminiService.generateCampaign(objective, segment);
  }
}






