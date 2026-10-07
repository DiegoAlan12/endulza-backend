import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // El decorador @Global() hace que Prisma esté disponible en toda la app sin tener que importarlo módulo por módulo.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // ¡Crucial! Exportamos el servicio.
})
export class PrismaModule {}