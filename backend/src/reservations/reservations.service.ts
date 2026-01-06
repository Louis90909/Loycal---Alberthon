import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

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

    // Créer la réservation
    const reservation = await this.prisma.reservation.create({
      data: {
        restaurantId: createDto.restaurantId,
        userId,
        date: reservationDate,
        time: new Date(`1970-01-01T${createDto.time}:00`),
        guests: createDto.guests,
        status: 'confirmed',
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






