import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { RestaurantStatus } from '@prisma/client';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  offer?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  popularity?: string;

  @IsOptional()
  @IsString()
  ambiance?: string;

  @IsOptional()
  @IsEnum(RestaurantStatus)
  status?: RestaurantStatus;
}






