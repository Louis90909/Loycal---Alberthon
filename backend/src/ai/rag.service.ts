import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RAGService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère le contexte pour Rémi basé sur les données du restaurant
   * Pour l'instant, on récupère les données directement depuis la DB
   * Plus tard, on pourra intégrer un vector DB (Pinecone, Qdrant) pour la recherche sémantique
   */
  async getContextForRestaurant(restaurantId: number, userId: string): Promise<any> {
    // Récupérer les données du restaurant
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        loyaltyProgram: true,
      },
    });

    if (!restaurant) {
      return null;
    }

    // Récupérer les analytics
    const paidOrders = await this.prisma.pOSOrder.findMany({
      where: {
        restaurantId,
        status: 'paid',
      },
    });

    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalVisits = paidOrders.length;
    const averageTicket = totalVisits > 0 ? totalRevenue / totalVisits : 0;

    // Récupérer les campagnes récentes
    const recentCampaigns = await this.prisma.campaign.findMany({
      where: { restaurantId },
      include: { stats: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Récupérer les visites récentes
    const recentVisits = await this.prisma.visit.findMany({
      where: { restaurantId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    // Récupérer les membres
    const memberships = await this.prisma.userLoyaltyMembership.findMany({
      where: { restaurantId },
    });

    // Construire le contexte
    return {
      restaurantName: restaurant.name,
      cuisine: restaurant.cuisine,
      revenue: totalRevenue.toFixed(0),
      averageTicket: averageTicket.toFixed(2),
      loyaltyType: restaurant.loyaltyProgram?.type || 'Non défini',
      memberCount: memberships.length,
      recentCampaigns: recentCampaigns.map((c) => ({
        name: c.name,
        type: c.type,
        stats: c.stats,
      })),
      recentVisits: recentVisits.length,
      visitCount: restaurant.visitCount,
      rewardScore: restaurant.rewardScore,
    };
  }

  /**
   * Récupère des insights basés sur les données
   * Pour l'instant, on fait une analyse simple
   * Plus tard, on pourra utiliser des embeddings pour une recherche plus intelligente
   */
  async getInsights(restaurantId: number): Promise<string[]> {
    const insights: string[] = [];

    // Analyser les campagnes
    const campaigns = await this.prisma.campaign.findMany({
      where: { restaurantId },
      include: { stats: true },
    });

    const bestCampaign = campaigns
      .filter((c) => c.stats)
      .sort((a, b) => Number(b.stats.revenue) - Number(a.stats.revenue))[0];

    if (bestCampaign) {
      insights.push(
        `Votre meilleure campagne est "${bestCampaign.name}" avec ${bestCampaign.stats.revenue}€ de revenus générés.`,
      );
    }

    // Analyser les visites
    const visits = await this.prisma.visit.findMany({
      where: { restaurantId },
      orderBy: { date: 'desc' },
    });

    if (visits.length > 0) {
      const last30Days = visits.filter(
        (v) => new Date(v.date).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000,
      );
      insights.push(
        `${last30Days.length} visites enregistrées dans les 30 derniers jours.`,
      );
    }

    // Analyser les membres
    const memberships = await this.prisma.userLoyaltyMembership.findMany({
      where: { restaurantId },
    });

    if (memberships.length > 0) {
      const activeMembers = memberships.filter((m) => m.points > 0 || m.stamps > 0);
      insights.push(
        `${activeMembers.length} membres actifs sur ${memberships.length} membres totaux.`,
      );
    }

    return insights;
  }
}






