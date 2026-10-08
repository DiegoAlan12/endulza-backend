import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('pedidos')

export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Patch(':id/producto/:idProducto')
  actualizarCantidad(
    @Param('id', ParseIntPipe) idPedido: number,
    @Param('idProducto', ParseIntPipe) idProducto: number,
    @Body('nuevaCantidad') nuevaCantidad: number,
  ) {
    return this.pedidosService.actualizarCantidadProducto(idPedido, idProducto, nuevaCantidad);
  }


  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(+id, updatePedidoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(+id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) idPedido: number,
    @Body('status') status: string,
    @Body('pin') pin?: string,
  ) {
    return this.pedidosService.actualizarEstado(idPedido, status, pin);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/cancelar')
  cancelarPedido(@Param('id', ParseIntPipe) idPedido: number) {
    return this.pedidosService.cancelarPedido(idPedido);
  }

}
