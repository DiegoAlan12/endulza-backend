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

    // 2. Buscamos el ÚLTIMO producto creado en esta categoría para analizar su código
    const ultimoProducto = await this.prisma.producto.findFirst({
      where: { idCategoria: createProductoDto.idCategoria },
      orderBy: { idProducto: 'desc' }, // Trae el más reciente
    });

    let siguienteNumero = 1;

    // 3. Si ya existen productos, extraemos su número secuencial
    if (ultimoProducto && ultimoProducto.codigoBarras) {
      // Reemplazamos el prefijo por vacío para quedarnos solo con el número (Ej: "GOM005" -> "005")
      const numeroString = ultimoProducto.codigoBarras.replace(categoria.prefijo, '');
      const numeroActual = parseInt(numeroString, 10);
      
      // Si el parseo es exitoso, sumamos 1. Si falla, sumamos a 0.
      siguienteNumero = (isNaN(numeroActual) ? 0 : numeroActual) + 1;
    }

    // 4. Generamos el número secuencial a 3 dígitos (Ej. padStart(3, '0') lo convierte en "006")
    const secuencial = siguienteNumero.toString().padStart(3, '0');
    
    // 5. Armamos el código de barras final (Ej: "GOM" + "006" = "GOM006")
    const codigoGenerado = `${categoria.prefijo}${secuencial}`;

    // 6. Guardamos el producto inyectando nuestro código generado
    return await this.prisma.producto.create({
      data: {
        nombre: createProductoDto.nombre,
        idCategoria: createProductoDto.idCategoria,
        unidadMedida: createProductoDto.unidadMedida,
        costo: createProductoDto.costo,
        precio: createProductoDto.precio,
        stock: createProductoDto.stock,
        codigoBarras: codigoGenerado, // ¡Asignación automática infalible!
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
