import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateLoyaltyProgramDto {
  @IsNumber()
  restaurantId: number;

  @IsString()
  type: string;

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
