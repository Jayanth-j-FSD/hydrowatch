import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { ApiClientService } from './services/api-client.service';
import { DataTransformerService } from './services/data-transformer.service';
import { RiverSyncJob } from './jobs/river-sync.job';
import { DamSyncJob } from './jobs/dam-sync.job';
import { DataSyncScheduler } from './schedulers/data-sync.scheduler';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: 'river-sync' },
      { name: 'dam-sync' },
      { name: 'notifications' },
    ),
  ],
  providers: [
    ApiClientService,
    DataTransformerService,
    RiverSyncJob,
    DamSyncJob,
    DataSyncScheduler,
    PrismaService,
  ],
  exports: [ApiClientService, DataTransformerService],
})
export class DataIntegrationModule {}

