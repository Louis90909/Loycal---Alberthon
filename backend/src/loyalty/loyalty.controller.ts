import { Controller, Post, Get, Body, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { ValidateVisitDto } from './dto/validate-visit.dto';
import { CreateLoyaltyProgramDto } from './dto/create-loyalty-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Post('visits')
  async validateVisit(@Body() validateDto: ValidateVisitDto, @Request() req) {
    return this.loyaltyService.validateVisit(req.user.id, validateDto);
  }

  @Get('memberships')
  async getMemberships(@Request() req) {
    return this.loyaltyService.getMemberships(req.user.id);
  }

  @Get('memberships/:restaurantId')
  async getMembership(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Request() req,
  ) {
    return this.loyaltyService.getMembership(req.user.id, restaurantId);
  }

  @Get('programs/:restaurantId')
  async getLoyaltyProgram(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.loyaltyService.getLoyaltyProgram(restaurantId);
  }

  @Post('programs')
  async createLoyaltyProgram(@Body() createDto: CreateLoyaltyProgramDto) {
    return this.loyaltyService.createLoyaltyProgram(createDto);
  }
}








