import { Module } from '@nestjs/common';
import { GroundwaterController } from './groundwater.controller';
import { GroundwaterService } from './groundwater.service';
import { GroundwaterRepository } from './groundwater.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GroundwaterController],
  providers: [GroundwaterService, GroundwaterRepository, PrismaService],
  exports: [GroundwaterService],
})
export class GroundwaterModule {}

