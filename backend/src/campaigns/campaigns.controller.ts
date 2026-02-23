import { Controller, Post, Get, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateFlashPromotionDto } from './dto/create-flash-promotion.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Post()
  async createCampaign(@Body() createDto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(createDto);
  }

  @Get(':restaurantId')
  async getCampaigns(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.campaignsService.getCampaigns(restaurantId);
  }

  @Post('flash')
  async createFlashPromotion(@Body() createDto: CreateFlashPromotionDto) {
    return this.campaignsService.createFlashPromotion(createDto);
  }

  @Get('flash/:restaurantId')
  async getFlashPromotions(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const active = activeOnly !== 'false';
    return this.campaignsService.getFlashPromotions(restaurantId, active);
  }

  @Get('flash')
  async getAllActiveFlashPromotions() {
    return this.campaignsService.getAllActiveFlashPromotions();
  }
}








