import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';

@Injectable()
export class POSService {
  constructor(private prisma: PrismaService) {}

  async createOrder(createDto: CreateOrderDto) {
    // Vérifier que le restaurant existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: createDto.restaurantId },
      include: { menuItems: true },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Vérifier que l'utilisateur existe si fourni
    if (createDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createDto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Vérifier les items du menu
    const menuItemIds = createDto.items.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: createDto.restaurantId,
      },
    });

    if (menuItems.length !== createDto.items.length) {
      throw new BadRequestException('Some menu items are invalid');
    }

    // Calculer le total
    let total = createDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Appliquer réduction si reward appliqué
    if (createDto.appliedRewardId) {
      const reward = await this.prisma.reward.findUnique({
        where: { id: createDto.appliedRewardId },
      });

      if (reward && reward.restaurantId === createDto.restaurantId) {
        // Appliquer la réduction (simplifié - à améliorer selon type de reward)
        total = Math.max(0, total - reward.cost); // Exemple : réduction de X points
      }
    }

    // Créer la commande
    const order = await this.prisma.pOSOrder.create({
      data: {
        restaurantId: createDto.restaurantId,
        userId: createDto.userId || null,
        status: 'pending',
        total,
        type: createDto.type || 'dine_in',
        tableNumber: createDto.tableNumber,
        appliedRewardId: createDto.appliedRewardId || null,
        items: {
          create: createDto.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        appliedReward: true,
      },
    });

    return order;
  }

  async getOrders(restaurantId: number) {
    return this.prisma.pOSOrder.findMany({
      where: { restaurantId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        appliedReward: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.pOSOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        appliedReward: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async payOrder(orderId: string, payDto: PayOrderDto) {
    const order = await this.prisma.pOSOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Cannot pay a cancelled order');
    }

    // Mettre à jour la commande
    const updatedOrder = await this.prisma.pOSOrder.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        paymentMethod: payDto.paymentMethod,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Si l'utilisateur est connecté, créer une visite et attribuer des points
    if (order.userId) {
      await this.createVisitFromOrder(updatedOrder);
    }

    return updatedOrder;
  }

  async deleteOrder(orderId: string) {
    const order = await this.prisma.pOSOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'paid') {
      throw new BadRequestException('Cannot delete a paid order');
    }

    await this.prisma.pOSOrder.delete({
      where: { id: orderId },
    });

    return { success: true };
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'paid' | 'cancelled') {
    const order = await this.prisma.pOSOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.pOSOrder.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  private async createVisitFromOrder(order: any) {
    if (!order.userId || !order.restaurantId) {
      return;
    }

    // Vérifier si une visite existe déjà pour cette commande (éviter les doublons)
    // Pour simplifier, on crée une visite à chaque paiement

    // Récupérer le programme de fidélité
    const program = await this.prisma.loyaltyProgram.findUnique({
      where: { restaurantId: order.restaurantId },
    });

    // Calculer les points selon le programme
    let pointsEarned = 0;
    if (program && program.type === 'points' && program.spendingRatio) {
      pointsEarned = Math.floor(Number(order.total) * program.spendingRatio);
    } else {
      pointsEarned = Math.floor(Number(order.total) * 1.5); // Par défaut
    }

    // Créer la visite
    await this.prisma.visit.create({
      data: {
        userId: order.userId,
        restaurantId: order.restaurantId,
        amount: Number(order.total),
        pointsEarned,
        validationMethod: 'pos',
      },
    });

    // Mettre à jour l'adhésion
    const membership = await this.prisma.userLoyaltyMembership.findUnique({
      where: {
        userId_restaurantId: {
          userId: order.userId,
          restaurantId: order.restaurantId,
        },
      },
    });

    if (membership) {
      await this.prisma.userLoyaltyMembership.update({
        where: { id: membership.id },
        data: {
          points: membership.points + pointsEarned,
        },
      });
    }
  }
}






