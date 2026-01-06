import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class ValidateVisitDto {
  @IsNumber()
  restaurantId: number;

  @IsString()
  @IsOptional()
  validationCode?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;
}






