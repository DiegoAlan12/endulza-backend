import { IsArray, IsNotEmpty } from 'class-validator';

export class CreatePedidoDto {
  // Le decimos a NestJS que autorice la entrada de la propiedad "detalles"
  @IsArray()
  @IsNotEmpty()
  detalles: any[]; 
}