import { Module } from '@nestjs/common';
import { RainfallController } from './rainfall.controller';
import { RainfallService } from './rainfall.service';
import { RainfallRepository } from './rainfall.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RainfallController],
  providers: [RainfallService, RainfallRepository, PrismaService],
  exports: [RainfallService],
})
export class RainfallModule {}

