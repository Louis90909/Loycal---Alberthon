import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post()
  async createReservation(@Body() createDto: CreateReservationDto, @Request() req) {
    return this.reservationsService.createReservation(req.user.id, createDto);
  }

  @Get('me')
  async getUserReservations(@Request() req) {
    return this.reservationsService.getUserReservations(req.user.id);
  }

  @Delete(':id')
  async cancelReservation(@Param('id') id: string, @Request() req) {
    return this.reservationsService.cancelReservation(id, req.user.id);
  }
}








