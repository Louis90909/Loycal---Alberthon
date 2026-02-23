import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateFlashPromotionDto } from './dto/create-flash-promotion.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async createCampaign(createDto: CreateCampaignDto) {
    // Vérifier que le restaurant existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: createDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        restaurantId: createDto.restaurantId,
        name: createDto.name,
        type: createDto.type,
        status: createDto.status || 'active',
        description: createDto.description,
        targetSegment: createDto.targetSegment,
      },
    });

    // Créer les stats initiales
    await this.prisma.campaignStats.create({
      data: {
        campaignId: campaign.id,
        openRate: 0,
        conversionRate: 0,
        revenue: 0,
      },
    });

    return campaign;
  }

  async getCampaigns(restaurantId: number) {
    return this.prisma.campaign.findMany({
      where: { restaurantId },
      include: {
        stats: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createFlashPromotion(createDto: CreateFlashPromotionDto) {
    // Vérifier que le restaurant et le menu item existent
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: createDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: createDto.menuItemId },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Créer la promotion flash
    const flashPromo = await this.prisma.flashPromotion.create({
      data: {
        restaurantId: createDto.restaurantId,
        menuItemId: createDto.menuItemId,
        itemName: createDto.itemName,
        discountPrice: createDto.discountPrice,
        originalPrice: createDto.originalPrice,
        quantityTotal: createDto.quantityTotal,
        quantityRemaining: createDto.quantityTotal,
        startTime: new Date(`1970-01-01T${createDto.startTime}:00`),
        endTime: new Date(`1970-01-01T${createDto.endTime}:00`),
        active: true,
        targetSegment: createDto.targetSegment,
      },
    });

    // Créer automatiquement une campagne associée
    const campaign = await this.prisma.campaign.create({
      data: {
        restaurantId: createDto.restaurantId,
        name: `⚡ Flash : ${createDto.itemName}`,
        type: 'flash',
        status: 'active',
        description: `Vente flash sur ${createDto.itemName} ! ${createDto.discountPrice}€ au lieu de ${createDto.originalPrice}€.`,
        targetSegment: createDto.targetSegment || 'Clients fidèles',
        flashPromoId: flashPromo.id,
      },
    });

    // Créer les stats
    await this.prisma.campaignStats.create({
      data: {
        campaignId: campaign.id,
        openRate: 0,
        conversionRate: 0,
        revenue: 0,
      },
    });

    return flashPromo;
  }

  async getFlashPromotions(restaurantId: number, activeOnly: boolean = true) {
    const where: any = { restaurantId };
    if (activeOnly) {
      where.active = true;
    }

    return this.prisma.flashPromotion.findMany({
      where,
      include: {
        menuItem: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllActiveFlashPromotions() {
    return this.prisma.flashPromotion.findMany({
      where: { active: true },
      include: {
        menuItem: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            cuisine: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}








