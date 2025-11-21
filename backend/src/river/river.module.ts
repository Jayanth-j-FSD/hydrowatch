import { Module } from '@nestjs/common';
import { RiverController } from './river.controller';
import { RiverService } from './river.service';
import { RiverGateway } from './gateways/river.gateway';
import { StationsRepository } from '../stations/stations.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RiverController],
  providers: [RiverService, RiverGateway, StationsRepository, PrismaService],
  exports: [RiverService, RiverGateway],
})
export class RiverModule {}

