import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ValidateVisitDto } from './dto/validate-visit.dto';
import { CreateLoyaltyProgramDto } from './dto/create-loyalty-program.dto';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async validateVisit(userId: string, validateDto: ValidateVisitDto) {
    const { restaurantId, validationCode, amount } = validateDto;

    // Vérifier que le restaurant existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { loyaltyProgram: true },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Vérifier le code de validation (simplifié - à améliorer)
    if (validationCode && validationCode !== '1234' && validationCode !== 'BONUS') {
      throw new BadRequestException('Invalid validation code');
    }

    // Récupérer ou créer l'adhésion
    let membership = await this.prisma.userLoyaltyMembership.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });

    if (!membership) {
      // Créer l'adhésion si elle n'existe pas
      const program = restaurant.loyaltyProgram;
      membership = await this.prisma.userLoyaltyMembership.create({
        data: {
          userId,
          restaurantId,
          points: program?.welcomeBonus || 0,
          stamps: 0,
          tier: 'Bronze',
          nextTierThreshold: 100,
        },
      });
    }

    // Calculer les points/stamps selon le type de programme
    const program = restaurant.loyaltyProgram;
    let pointsEarned = 0;
    let stampsEarned = 0;

    if (program) {
      switch (program.type) {
        case 'points':
          if (amount && program.spendingRatio) {
            pointsEarned = Math.floor(amount * program.spendingRatio);
          } else {
            pointsEarned = 50; // Points par défaut
          }
          break;
        case 'stamps':
          stampsEarned = 1;
          break;
        case 'spending':
          // Points basés sur le montant total dépensé
          if (amount && program.spendingRatio) {
            pointsEarned = Math.floor(amount * program.spendingRatio);
          }
          break;
        case 'missions':
          // Gérer les missions séparément
          pointsEarned = 10; // Points de base
          break;
      }
    } else {
      // Programme par défaut : points
      pointsEarned = amount ? Math.floor(amount * 1.5) : 50;
    }

    // Créer la visite
    const visit = await this.prisma.visit.create({
      data: {
        userId,
        restaurantId,
        amount: amount || null,
        pointsEarned,
        validationMethod: validationCode ? 'code' : 'nfc',
        validationCode: validationCode || null,
      },
    });

    // Mettre à jour l'adhésion
    const updatedMembership = await this.prisma.userLoyaltyMembership.update({
      where: { id: membership.id },
      data: {
        points: membership.points + pointsEarned,
        stamps: membership.stamps + stampsEarned,
      },
    });

    // Mettre à jour les statistiques du restaurant
    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        visitCount: { increment: 1 },
      },
    });

    // Mettre à jour ou créer le customer
    await this.updateCustomerStats(userId, restaurantId, amount || 0);

    return {
      success: true,
      pointsEarned,
      stampsEarned,
      visit,
      membership: updatedMembership,
    };
  }

  async getMemberships(userId: string) {
    return this.prisma.userLoyaltyMembership.findMany({
      where: { userId },
      include: {
        restaurant: {
          include: {
            loyaltyProgram: {
              include: {
                missions: true,
              },
            },
          },
        },
        missionProgress: {
          include: {
            mission: true,
          },
        },
      },
    });
  }

  async getMembership(userId: string, restaurantId: number) {
    return this.prisma.userLoyaltyMembership.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
      include: {
        restaurant: {
          include: {
            loyaltyProgram: {
              include: {
                missions: true,
              },
            },
          },
        },
        missionProgress: {
          include: {
            mission: true,
          },
        },
      },
    });
  }

  async createLoyaltyProgram(createDto: CreateLoyaltyProgramDto) {
    // Vérifier que le restaurant existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: createDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Vérifier qu'il n'y a pas déjà un programme
    const existing = await this.prisma.loyaltyProgram.findUnique({
      where: { restaurantId: createDto.restaurantId },
    });

    if (existing) {
      throw new BadRequestException('Loyalty program already exists for this restaurant');
    }

    return this.prisma.loyaltyProgram.create({
      data: {
        restaurantId: createDto.restaurantId,
        type: createDto.type,
        spendingRatio: createDto.spendingRatio,
        targetCount: createDto.targetCount,
        targetSpending: createDto.targetSpending,
        welcomeBonus: createDto.welcomeBonus || 0,
        rewardLabel: createDto.rewardLabel,
      },
    });
  }

  async getLoyaltyProgram(restaurantId: number) {
    return this.prisma.loyaltyProgram.findUnique({
      where: { restaurantId },
      include: {
        missions: true,
      },
    });
  }

  private async updateCustomerStats(userId: string, restaurantId: number, amount: number) {
    const now = new Date();
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });

    if (customer) {
      // Mettre à jour les stats
      const totalVisits = await this.prisma.visit.count({
        where: {
          userId,
          restaurantId,
        },
      });

      const totalRevenue = await this.prisma.visit.aggregate({
        where: {
          userId,
          restaurantId,
        },
        _sum: {
          amount: true,
        },
      });

      const avgTicket = totalRevenue._sum.amount
        ? Number(totalRevenue._sum.amount) / totalVisits
        : 0;

      await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          lastVisit: now,
          totalRevenue: totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0,
          averageTicket: avgTicket,
          visitsPerMonth: totalVisits, // Simplifié
        },
      });
    } else {
      // Créer le customer
      await this.prisma.customer.create({
        data: {
          userId,
          restaurantId,
          lastVisit: now,
          totalRevenue: amount,
          averageTicket: amount,
          visitsPerMonth: 1,
          status: 'Nouveau',
        },
      });
    }
  }
}






