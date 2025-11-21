import { Module } from '@nestjs/common';
import { DamsController } from './dams.controller';
import { DamsService } from './dams.service';
import { DamsGateway } from './gateways/dams.gateway';
import { DamsRepository } from './dams.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DamsController],
  providers: [DamsService, DamsGateway, DamsRepository, PrismaService],
  exports: [DamsService, DamsGateway],
})
export class DamsModule {}

