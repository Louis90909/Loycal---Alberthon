import { IsNumber, IsString, IsDateString, Min, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  restaurantId: number;

  @IsDateString()
  date: string; // Format "YYYY-MM-DD"

  @IsString()
  time: string; // Format "HH:mm"

  @IsNumber()
  @Min(1)
  guests: number;

  @IsString()
  @IsOptional()
  flashPromoId?: string;
}








