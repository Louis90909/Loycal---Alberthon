import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { CampaignType, CampaignStatus } from '@prisma/client';

export class CreateCampaignDto {
  @IsNumber()
  restaurantId: number;

  @IsString()
  name: string;

  @IsEnum(CampaignType)
  type: CampaignType;

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  targetSegment?: string;
}






