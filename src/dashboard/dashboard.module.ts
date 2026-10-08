import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importante

@Module({
  imports: [PrismaModule], // Conectamos la base de datos
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {} 