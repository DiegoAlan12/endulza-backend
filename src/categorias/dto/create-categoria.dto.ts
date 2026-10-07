import { IsString, IsNotEmpty, MinLength, Length } from 'class-validator';

export class CreateCategoriaDto {
  @IsString({ message: 'El nombre de la categoría debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de la categoría no puede estar vacío' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombreCategoria: string;

  @IsString({ message: 'El prefijo debe ser texto' })
  @IsNotEmpty({ message: 'El prefijo no puede estar vacío' })
  @Length(3, 4, { message: 'El prefijo debe tener entre 3 y 4 caracteres' })
  prefijo: string;
  
}