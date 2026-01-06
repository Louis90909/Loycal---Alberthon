import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LoyaltyProgramType } from '@prisma/client';

export class CreateLoyaltyProgramDto {
  @IsNumber()
  restaurantId: number;

  @IsEnum(LoyaltyProgramType)
  type: LoyaltyProgramType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  spendingRatio?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  targetCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  targetSpending?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  welcomeBonus?: number;

  @IsString()
  @IsOptional()
  rewardLabel?: string;
}






