import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCampaignDto {
  @IsNumber()
  restaurantId: number;

  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  targetSegment?: string;
}
