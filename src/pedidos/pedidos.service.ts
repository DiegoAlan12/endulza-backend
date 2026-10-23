import { Injectable } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  // ... (deja los otros métodos que generó el CLI por ahora)

  async actualizarCantidadProducto(
    idPedido: number,
    idProducto: number,
    nuevaCantidad: number,
  ) {
    // Iniciamos una transacción atómica
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validar que el pedido exista y esté PENDIENTE
      const pedido = await tx.pedido.findUnique({
        where: { idPedido },
        include: { detalles: true },
      });

      if (!pedido) throw new BadRequestException('Pedido no encontrado');
      if (pedido.status !== 'PENDIENTE') {
        throw new BadRequestException(
          'Solo se pueden modificar pedidos en estado PENDIENTE',
        );
      }

      // 2. Encontrar el producto dentro del ticket actual
      const detalleActual = pedido.detalles.find(
        (d) => d.idProducto === idProducto,
      );
      if (!detalleActual) {
        throw new BadRequestException(
          'El producto no forma parte de este pedido',
        );
      }

      // 3. Calcular la diferencia (Magia matemática)
      // Si la cantidad anterior era 5 y la nueva es 3, la diferencia es -2.
      // Si la cantidad anterior era 2 y la nueva es 5, la diferencia es 3.
      const cantidadAnterior = Number(detalleActual.cantidad);
      const diferencia = nuevaCantidad - cantidadAnterior;

      // 4. Proteger el inventario si la dueña quiere AGREGAR más producto al ticket
      if (diferencia > 0) {
        const productoBD = await tx.producto.findUnique({
          where: { idProducto },
        });
        if (!productoBD) {
          throw new BadRequestException('Producto no encontrado');
        }
        if (Number(productoBD.stock) < diferencia) {
          throw new BadRequestException(
            `Stock insuficiente. Solo hay ${productoBD.stock} disponibles.`,
          );
        }
      }

      // 5. Actualizar la cantidad en el ticket (o eliminar si es 0)
      if (nuevaCantidad <= 0) {
        await tx.detallePedido.delete({
          where: { idDPedido: detalleActual.idDPedido },
        });
      } else {
        await tx.detallePedido.update({
          where: { idDPedido: detalleActual.idDPedido },
          data: { cantidad: nuevaCantidad },
        });
      }

      // 6. Actualizar el inventario real
      // Usamos decrement. Si la diferencia es positiva (pidió más), resta del stock.
      // Si la diferencia es negativa (pidió menos), al restar un negativo, ¡suma al stock!
      await tx.producto.update({
        where: { idProducto },
        data: { stock: { decrement: diferencia } },
      });

      // 7. Recalcular el total monetario del pedido
      const detallesActualizados = await tx.detallePedido.findMany({
        where: { idPedido },
      });

      const nuevoTotal = detallesActualizados.reduce((suma, detalle) => {
        return suma + Number(detalle.cantidad) * Number(detalle.precioUnitario);
      }, 0);

      // 8. Guardar el nuevo total y retornar el pedido actualizado
      return await tx.pedido.update({
        where: { idPedido },
        data: { total: nuevoTotal },
        include: { detalles: true },
      });
    });
  }

  async create(createPedidoDto: CreatePedidoDto, idCajero: number) {
    return await this.prisma.$transaction(async (tx) => {
      let totalCalculadoSeguro = 0;
      const detallesAInsertar = [];

      // 1. Validar Stock y Calcular Precios (LA VERDAD DEL BACKEND)
      for (const item of createPedidoDto.detalles) {
        // IMPORTANTE: Usamos 'tx', no 'this.prisma', para mantener el candado de la transacción
        const productoDB = await tx.producto.findUnique({
          where: { idProducto: item.idProducto },
        });

        if (!productoDB) {
          throw new BadRequestException(
            `El producto con ID ${item.idProducto} no existe.`,
          );
        }

        if (Number(productoDB.stock) < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${productoDB.nombre}. Quedan ${productoDB.stock} uds.`,
          );
        }

        // Calculamos el subtotal basándonos en el precio REAL de la BD
        const subtotal = Number(productoDB.precio) * item.cantidad;
        totalCalculadoSeguro += subtotal;

        // Preparamos los datos para insertarlos después
        detallesAInsertar.push({
          idProducto: productoDB.idProducto,
          cantidad: item.cantidad,
          precioUnitario: productoDB.precio, // Guardamos a qué precio se vendió hoy
          
        });
      }

      // 2. Crear la Cabecera del Pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          nombreCliente: createPedidoDto.nombreCliente || 'Público en General',
          total: totalCalculadoSeguro,
          status: 'ENTREGADO',
          tipoPedido: 'EN_LOCAL', // O el valor por defecto que acepte tu base de datos
          idUsuario: idCajero, // O usa "usuario: { connect: { idUsuario: idCajero } }" dependiendo de tu Prisma Schema
        },
      });

      // 3. Registrar los Detalles y Descontar el Stock
      for (const detalle of detallesAInsertar) {
        // A) Insertar el historial del detalle de la venta (si tienes una tabla DetallePedido)
        // Nota: Si tu esquema se llama distinto, ajusta "detallePedido" por el nombre real.
        await tx.detallePedido.create({
          data: {
            idPedido: nuevoPedido.idPedido,
            idProducto: detalle.idProducto,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
          },
        });

        // B) Descontar el stock de forma atómica (Nuevamente, usando tx)
        await tx.producto.update({
          where: { idProducto: detalle.idProducto },
          data: {
            stock: { decrement: detalle.cantidad }, // La magia atómica para restar
          },
        });
      }

      // Si llegamos hasta aquí sin errores, Prisma hace COMMIT y guarda todo permanentemente.
      return nuevoPedido;
    });
  }

  async findAll() {
    return await this.prisma.pedido.findMany({
      include: {
        detalles: {
          include: {
            producto: true, // ¡Esta es la llave maestra! Trae el stock real.
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.pedido.findUnique({
      where: { idPedido: id },
      include: {
        detalles: {
          include: {
            producto: true, // ¡Esta es la llave maestra! Trae el stock real.
          },
        },
      },
    });
  }

  update(id: number, updatePedidoDto: UpdatePedidoDto) {
    return `This action updates a #${id} pedido`;
  }

  remove(id: number) {
    return `This action removes a #${id} pedido`;
  }

  async actualizarEstado(
    idPedido: number,
    nuevoEstado: any,
    pinAutorizacion?: string,
  ) {
    // Si el frontend envía un PIN (porque es una reversión), lo validamos
    if (pinAutorizacion !== undefined) {
      const PIN_MAESTRO = '1234'; // PIN temporal. A futuro, esto se validará con la tabla de Usuarios y bcrypt
      if (pinAutorizacion !== PIN_MAESTRO) {
        throw new BadRequestException(
          'PIN de autorización incorrecto. Permiso denegado.',
        );
      }
    }
    return await this.prisma.pedido.update({
      where: { idPedido },
      data: { status: nuevoEstado },
    });
  }

  async cancelarPedido(idPedido: number) {
    // Usamos una transacción para asegurar que la devolución del stock sea perfecta
    return await this.prisma.$transaction(async (tx) => {
      // 1. Buscamos el pedido y traemos sus detalles
      const pedido = await tx.pedido.findUnique({
        where: { idPedido },
        include: { detalles: true },
      });

      if (!pedido) {
        throw new BadRequestException('Pedido no encontrado');
      }

      if (pedido.status === 'CANCELADO') {
        throw new BadRequestException('El pedido ya fue cancelado previamente');
      }

      // 2. Cambiamos el estado del semáforo a CANCELADO
      const pedidoCancelado = await tx.pedido.update({
        where: { idPedido },
        data: { status: 'CANCELADO' },
      });

      // 3. Magia de inventario: Devolvemos las cantidades a los estantes virtuales
      for (const detalle of pedido.detalles) {
        await tx.producto.update({
          where: { idProducto: detalle.idProducto },
          data: { stock: { increment: detalle.cantidad } },
        });
      }

      return pedidoCancelado;
    });
  }
}
