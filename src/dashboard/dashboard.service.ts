import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getResumen() {
    // 1. Contar cuántos pedidos se han entregado con éxito
    const pedidosCompletados = await this.prisma.pedido.count({
      where: { status: 'ENTREGADO' }
    });

    // 2. Extraer todos los pedidos entregados para sumar sus ingresos
    const pedidosEntregados = await this.prisma.pedido.findMany({
      where: { status: 'ENTREGADO' },
      select: { total: true }
    });
    
    // Sumamos el total (Convertimos a Number por si en Prisma está como Decimal/String)
    const ingresosTotales = pedidosEntregados.reduce((suma, pedido) => suma + Number(pedido.total || 0), 0);

    // 3. Alerta de Stock: Buscar productos con 5 o menos unidades
    const productosStockBajo = await this.prisma.producto.findMany({
      where: { stock: { lte: 5 } }, // lte = less than or equal (menor o igual a)
      select: { idProducto: true, nombre: true, stock: true },
      orderBy: { stock: 'asc' } // Ordenar del más vacío al más lleno
    });

    return {
      pedidosCompletados,
      ingresosTotales,
      productosStockBajo
    };
  }
}