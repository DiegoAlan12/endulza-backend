import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

async create(createProductoDto: CreateProductoDto) {
    // 1. Buscamos la categoría en la BD para obtener su "prefijo" (Ej. "GOM")
    const categoria = await this.prisma.categoria.findUnique({
      where: { idCategoria: createProductoDto.idCategoria },
    });

    if (!categoria) {
      throw new BadRequestException('La categoría especificada no existe');
    }

    // 2. Contamos cuántos productos existen actualmente en ESA categoría
    const cantidadProductos = await this.prisma.producto.count({
      where: { idCategoria: createProductoDto.idCategoria },
    });

    // 3. Generamos el número secuencial. 
    // Si hay 0 productos, es el 1. padStart(3, '0') lo convierte en "001".
    const secuencial = (cantidadProductos + 1).toString().padStart(3, '0');
    
    // 4. Armamos el código de barras final (Ej: "GOM" + "001" = "GOM001")
    const codigoGenerado = `${categoria.prefijo}${secuencial}`;

    // 5. Guardamos el producto inyectando nuestro código generado
    return await this.prisma.producto.create({
      data: {
        nombre: createProductoDto.nombre,
        idCategoria: createProductoDto.idCategoria,
        unidadMedida: createProductoDto.unidadMedida,
        costo: createProductoDto.costo,
        precio: createProductoDto.precio,
        stock: createProductoDto.stock,
        codigoBarras: codigoGenerado, // ¡Asignación automática!
        imagenUrl: createProductoDto.imagenUrl
      },
    });
  }

// En src/productos/productos.service.ts

  findAll() {
    // Usamos prisma para buscar todos los productos en la tabla
    return this.prisma.producto.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    // 1. Verificamos que el producto exista
    const productoExiste = await this.prisma.producto.findUnique({
      where: { idProducto: id },
    });

    if (!productoExiste) {
      throw new BadRequestException('El producto no existe');
    }

    // 2. Actualizamos con los nuevos datos
    // Nota: Como quitamos "codigoBarras" del CreateDto, 
    // NestJS no permitirá modificar el código de barras aquí, ¡lo cual es perfecto para evitar errores en caja!
    return await this.prisma.producto.update({
      where: { idProducto: id },
      data: updateProductoDto,
    });
  }

 async remove(id: number) {
    // Verificamos si el producto existe antes de intentar borrarlo
    const productoExiste = await this.prisma.producto.findUnique({
      where: { idProducto: id },
    });

    if (!productoExiste) {
      throw new BadRequestException('El producto no existe o ya fue eliminado');
    }

    // Si existe, lo eliminamos de la base de datos
    return await this.prisma.producto.delete({
      where: { idProducto: id },
    });
  }
}
