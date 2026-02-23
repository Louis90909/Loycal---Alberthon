import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { POSService } from './pos.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pos')
@UseGuards(JwtAuthGuard)
export class POSController {
  constructor(private posService: POSService) {}

  @Post('orders')
  async createOrder(@Body() createDto: CreateOrderDto) {
    return this.posService.createOrder(createDto);
  }

  @Get('orders/:restaurantId')
  async getOrders(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.posService.getOrders(restaurantId);
  }

  @Get('orders/detail/:id')
  async getOrder(@Param('id') id: string) {
    return this.posService.getOrder(id);
  }

  @Put('orders/:id/pay')
  async payOrder(@Param('id') id: string, @Body() payDto: PayOrderDto) {
    return this.posService.payOrder(id, payDto);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'paid' | 'cancelled',
  ) {
    return this.posService.updateOrderStatus(id, status);
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id') id: string) {
    return this.posService.deleteOrder(id);
  }
}








