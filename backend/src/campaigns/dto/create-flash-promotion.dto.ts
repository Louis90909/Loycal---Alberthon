import { IsNumber, IsString, IsBoolean, IsOptional, Min, IsTimeZone } from 'class-validator';

export class CreateFlashPromotionDto {
  @IsNumber()
  restaurantId: number;

  @IsString()
  menuItemId: string;

  @IsString()
  itemName: string;

  @IsNumber()
  @Min(0)
  discountPrice: number;

  @IsNumber()
  @Min(0)
  originalPrice: number;

  @IsNumber()
  @Min(1)
  quantityTotal: number;

  @IsString()
  startTime: string; // Format "HH:mm"

  @IsString()
  endTime: string; // Format "HH:mm"

  @IsString()
  @IsOptional()
  targetSegment?: string;
}






