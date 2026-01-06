import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MenuItemDto {
  id?: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  available?: boolean;
}

export class UpdateMenuDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  menu: MenuItemDto[];
}






