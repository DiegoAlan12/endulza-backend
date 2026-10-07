import { Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class CategoriasService {
  // Inyectamos el servicio de Prisma en el constructor
  constructor(private prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    // Usamos Prisma para guardar en la base de datos
    return await this.prisma.categoria.create({
      data: {
        nombreCategoria: createCategoriaDto.nombreCategoria,
        prefijo: createCategoriaDto.prefijo.toUpperCase(),
      },
    });
  }

  async findAll() {
      return await this.prisma.categoria.findMany({
        include: {
          _count: {
            select: { productos: true }, // Cuenta cuántos productos tiene cada categoría
          },
        },
      });
    }

  findOne(id: number) {
    return this.prisma.categoria.findUnique({
      where: { idCategoria: id },
    });
  }

async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    // 1. Buscamos la categoría actual en la base de datos
    const categoriaActual = await this.prisma.categoria.findUnique({
      where: { idCategoria: id },
    });

    if (!categoriaActual) {
      throw new BadRequestException('La categoría no existe');
    }

    // 2. Si el usuario intenta cambiar el prefijo, validamos si ya tiene productos
    if (updateCategoriaDto.prefijo && updateCategoriaDto.prefijo.toUpperCase() !== categoriaActual.prefijo) {
      const cantidadProductos = await this.prisma.producto.count({
        where: { idCategoria: id },
      });

      if (cantidadProductos > 0) {
        throw new BadRequestException(
          `No puedes cambiar el prefijo de esta categoría porque ya tiene ${cantidadProductos} producto(s) asignado(s). Esto rompería la coherencia de los códigos de barras.`
        );
      }
    }

    // 3. Si pasa la validación, actualizamos (permitiendo cambiar el nombre libremente)
    return await this.prisma.categoria.update({
      where: { idCategoria: id },
      data: {
        nombreCategoria: updateCategoriaDto.nombreCategoria,
        prefijo: updateCategoriaDto.prefijo ? updateCategoriaDto.prefijo.toUpperCase() : undefined,
      },
    });
  }

  async remove(id: number) {
    // REGLA DE NEGOCIO: Proteger la base de datos
    // 1. Revisamos si hay productos usando esta categoría
    const cantidadProductos = await this.prisma.producto.count({
      where: { idCategoria: id },
    });

    if (cantidadProductos > 0) {
      throw new BadRequestException(`No puedes eliminar esta categoría porque tiene ${cantidadProductos} producto(s) asignado(s). Elimina los productos primero.`);
    }

    // 2. Si está vacía, procedemos a borrarla
    return await this.prisma.categoria.delete({
      where: { idCategoria: id },
    });
  }
}