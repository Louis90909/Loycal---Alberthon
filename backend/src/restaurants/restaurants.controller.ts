import { Controller, Get, Put, Param, Body, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const active = activeOnly !== 'false';
    return this.restaurantsService.findAll(active);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRestaurantDto,
    @Request() req,
  ) {
    return this.restaurantsService.update(id, updateDto, req.user.id);
  }

  @Put(':id/menu')
  @UseGuards(JwtAuthGuard)
  async updateMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
    @Request() req,
  ) {
    return this.restaurantsService.updateMenu(id, updateMenuDto, req.user.id);
  }
}






