import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy'; // 1. Importar la estrategia

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: 'ENDULZA_SECRETO_SUPER_SEGURO_2026',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // 2. Agregarla aquí
})
export class AuthModule {}