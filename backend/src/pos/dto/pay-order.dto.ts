import { IsString } from 'class-validator';

export class PayOrderDto {
  @IsString()
  paymentMethod: string; // 'card', 'cash', 'mobile', etc.
}








