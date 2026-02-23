import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) { }

  async createReservation(userId: string, createDto: CreateReservationDto) {
    // Vérifier que le restaurant existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: createDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.status !== 'ACTIVE') {
      throw new BadRequestException('Restaurant is not active');
    }

    // Vérifier que la date n'est pas dans le passé
    const reservationDate = new Date(createDto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      throw new BadRequestException('Cannot make reservation in the past');
    }

    // Vérifier et décrémenter la quantité d'une promo flash si spécifiée
    if (createDto.flashPromoId) {
      const flashPromo = await this.prisma.flashPromotion.findUnique({
        where: { id: createDto.flashPromoId },
      });

      if (!flashPromo || !flashPromo.active) {
        throw new BadRequestException('Flash promotion is not available');
      }

      if (flashPromo.quantityRemaining <= 0) {
        throw new BadRequestException('Flash promotion is out of stock');
      }

      await this.prisma.flashPromotion.update({
        where: { id: flashPromo.id },
        data: {
          quantityRemaining: { decrement: 1 },
        },
      });
    }

    // Créer la réservation
    const reservation = await this.prisma.reservation.create({
      data: {
        restaurantId: createDto.restaurantId,
        userId,
        date: reservationDate,
        time: new Date(`1970-01-01T${createDto.time}:00`),
        guests: createDto.guests,
        status: 'confirmed',
        flashPromoId: createDto.flashPromoId || null,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            cuisine: true,
          },
        },
      },
    });

    // Mettre à jour ou créer le profil Customer pour le restaurateur
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId: createDto.restaurantId,
        },
      },
    });

    if (customer) {
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: { lastVisit: new Date() },
      });
    } else {
      await this.prisma.customer.create({
        data: {
          userId,
          restaurantId: createDto.restaurantId,
          lastVisit: new Date(),
          status: 'Nouveau',
        },
      });
    }

    return reservation;
  }

  async getUserReservations(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            cuisine: true,
            offer: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getRestaurantReservations(restaurantId: number) {
    return this.prisma.reservation.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async cancelReservation(reservationId: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new BadRequestException('You can only cancel your own reservations');
    }

    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'cancelled',
      },
    });
  }
}








