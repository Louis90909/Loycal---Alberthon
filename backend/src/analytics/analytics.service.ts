import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(restaurantId: number) {
    // Vérifier que le restaurant existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Calculer le CA total depuis les commandes POS payées
    const paidOrders = await this.prisma.pOSOrder.findMany({
      where: {
        restaurantId,
        status: 'paid',
      },
    });

    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalVisits = paidOrders.length;
    const averageTicket = totalVisits > 0 ? totalRevenue / totalVisits : 0;

    // Statistiques de fidélité
    const memberships = await this.prisma.userLoyaltyMembership.count({
      where: { restaurantId },
    });

    // Visites des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentVisits = await this.prisma.visit.count({
      where: {
        restaurantId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Taux de retour (clients ayant visité plus d'une fois)
    const customersWithMultipleVisits = await this.prisma.visit.groupBy({
      by: ['userId'],
      where: {
        restaurantId,
      },
      having: {
        userId: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    const totalCustomers = await this.prisma.visit.groupBy({
      by: ['userId'],
      where: {
        restaurantId,
      },
    });

    const returnRate =
      totalCustomers.length > 0
        ? (customersWithMultipleVisits.length / totalCustomers.length) * 100
        : 0;

    return {
      totalRevenue,
      totalVisits,
      averageTicket,
      memberships,
      recentVisits,
      returnRate: Math.round(returnRate * 100) / 100,
    };
  }

  async getRevenueForecast(restaurantId: number, days: number = 7) {
    // Récupérer les commandes des derniers jours
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.pOSOrder.findMany({
      where: {
        restaurantId,
        status: 'paid',
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Grouper par jour
    const dailyRevenue: Record<string, number> = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(order.total);
    });

    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  async getCustomerSegments(restaurantId: number) {
    const customers = await this.prisma.customer.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Segmenter les clients
    const segments = {
      Premium: customers.filter((c) => c.loyaltyScore >= 80),
      Fidèle: customers.filter((c) => c.loyaltyScore >= 60 && c.loyaltyScore < 80),
      Habitué: customers.filter((c) => c.loyaltyScore >= 40 && c.loyaltyScore < 60),
      Occasionnel: customers.filter((c) => c.loyaltyScore >= 20 && c.loyaltyScore < 40),
      Nouveau: customers.filter((c) => c.loyaltyScore < 20),
      Inactif: customers.filter((c) => {
        if (!c.lastVisit) return true;
        const daysSinceLastVisit =
          (new Date().getTime() - c.lastVisit.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastVisit > 45;
      }),
    };

    return {
      segments: Object.entries(segments).map(([name, customers]) => ({
        name,
        count: customers.length,
        customers: customers.slice(0, 10), // Limiter à 10 pour la réponse
      })),
      total: customers.length,
    };
  }
}








