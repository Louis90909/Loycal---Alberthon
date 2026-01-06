import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get(':restaurantId')
  async getAnalytics(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.analyticsService.getAnalytics(restaurantId);
  }

  @Get(':restaurantId/revenue-forecast')
  async getRevenueForecast(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Query('days') days?: string,
  ) {
    const daysCount = days ? parseInt(days, 10) : 7;
    return this.analyticsService.getRevenueForecast(restaurantId, daysCount);
  }

  @Get(':restaurantId/customer-segments')
  async getCustomerSegments(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.analyticsService.getCustomerSegments(restaurantId);
  }
}






