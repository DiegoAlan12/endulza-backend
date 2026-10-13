import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard) // Bloqueamos todo el controlador
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // Cualquier empleado logueado puede ver el catálogo
  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  // SOLO ADMIN puede crear un nuevo producto
  @Roles('ADMIN')
  @Post()
  create(@Body() createProductoDto: any) {
    return this.productosService.create(createProductoDto);
  }

  // SOLO ADMIN puede editar nombre, precio, etc. (OJO: Aquí va el :id)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductoDto: any) {
    return this.productosService.update(id, updateProductoDto);
  }

  // SOLO ADMIN puede sumar stock (OJO: Aquí va el :id/stock)
  @Roles('ADMIN')
  @Patch(':id/stock')
  resurtirStock(@Param('id', ParseIntPipe) id: number, @Body() datos: { cantidadEntrante: number }) {
    return this.productosService.sumarStock(id, datos.cantidadEntrante);
  }
}
