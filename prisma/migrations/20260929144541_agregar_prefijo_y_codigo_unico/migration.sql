/*
  Warnings:

  - A unique constraint covering the columns `[prefijo]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigoBarras]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `prefijo` to the `Categoria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "prefijo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_prefijo_key" ON "Categoria"("prefijo");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoBarras_key" ON "Producto"("codigoBarras");
