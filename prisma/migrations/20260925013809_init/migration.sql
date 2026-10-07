-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'CAJERO', 'CLIENTE');

-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('EN_LOCAL', 'PICKUP', 'RUTA');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('PENDIENTE', 'PAGADO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Ruta" (
    "idRuta" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "diaEntrega" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("idRuta")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoUsuario" "RolUsuario" NOT NULL DEFAULT 'CLIENTE',
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "localidad" TEXT,
    "municipio" TEXT,
    "idRuta" INTEGER,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "idCategoria" SERIAL NOT NULL,
    "nombreCategoria" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("idCategoria")
);

-- CreateTable
CREATE TABLE "Producto" (
    "idProducto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "idCategoria" INTEGER NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "stock" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("idProducto")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "idPedido" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuario" INTEGER NOT NULL,
    "tipoPedido" "TipoPedido" NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'PENDIENTE',
    "idRuta" INTEGER,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("idPedido")
);

-- CreateTable
CREATE TABLE "DetallePedido" (
    "idDPedido" SERIAL NOT NULL,
    "idPedido" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DetallePedido_pkey" PRIMARY KEY ("idDPedido")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_idRuta_fkey" FOREIGN KEY ("idRuta") REFERENCES "Ruta"("idRuta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria"("idCategoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idRuta_fkey" FOREIGN KEY ("idRuta") REFERENCES "Ruta"("idRuta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "Pedido"("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;
