import { IsString, IsNotEmpty, IsInt, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  idCategoria: number;

  @IsString()
  @IsNotEmpty()
  unidadMedida: string;

  // Usamos IsNumber para aceptar decimales y Min(0) para evitar precios o costos negativos
  @IsNumber()
  @Min(0)
  costo: number;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsNumber()
  @Min(0)
  stock: number;
  
  @IsString()
  @IsOptional()
  imagenUrl?: string;
}