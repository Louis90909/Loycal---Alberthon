import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';


@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) { }

  async findAll(activeOnly: boolean = true) {
    const where = activeOnly ? { status: 'ACTIVE' } : {};
    return this.prisma.restaurant.findMany({
      where,
      include: {
        loyaltyProgram: {
          include: {
            missions: true,
          },
        },
        menuItems: true,
        promotions: {
          where: { active: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        loyaltyProgram: {
          include: {
            missions: true,
          },
        },
        menuItems: true,
        promotions: {
          where: { active: true },
        },
        users: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async update(id: number, updateDto: UpdateRestaurantDto, userId: string) {
    // Vérifier que l'utilisateur est le propriétaire ou admin
    const restaurant = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && restaurant.users[0]?.id !== userId) {
      throw new ForbiddenException('You do not have permission to update this restaurant');
    }

    return this.prisma.restaurant.update({
      where: { id },
      data: updateDto,
      include: {
        menuItems: true,
      },
    });
  }

  async updateMenu(id: number, updateMenuDto: UpdateMenuDto, userId: string) {
    // Vérifier permissions
    const restaurant = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && restaurant.users[0]?.id !== userId) {
      throw new ForbiddenException('You do not have permission to update this menu');
    }

    // Supprimer les anciens items
    await this.prisma.menuItem.deleteMany({
      where: { restaurantId: id },
    });

    // Créer les nouveaux items
    const menuItems = await Promise.all(
      updateMenuDto.menu.map((item) =>
        this.prisma.menuItem.create({
          data: {
            restaurantId: id,
            name: item.name,
            price: item.price,
            category: item.category,
            imageUrl: item.imageUrl,
            available: item.available ?? true,
          },
        }),
      ),
    );

    return menuItems;
  }
}
