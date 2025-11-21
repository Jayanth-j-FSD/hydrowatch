import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DataSyncScheduler implements OnModuleInit {
  private readonly logger = new Logger(DataSyncScheduler.name);

  constructor(
    @InjectQueue('river-sync') private riverSyncQueue: Queue,
    @InjectQueue('dam-sync') private damSyncQueue: Queue,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing data sync scheduler');

    // Schedule river data sync every 15 minutes
    setInterval(async () => {
      await this.scheduleRiverSync();
    }, 15 * 60 * 1000);

    // Schedule dam data sync every 15 minutes
    setInterval(async () => {
      await this.scheduleDamSync();
    }, 15 * 60 * 1000);

    // Run initial sync
    await this.scheduleRiverSync();
    await this.scheduleDamSync();
  }

  private async scheduleRiverSync() {
    try {
      await this.riverSyncQueue.add('sync-river-data', {}, {
        removeOnComplete: 10,
        removeOnFail: 50,
      });
      this.logger.log('Scheduled river data sync');
    } catch (error) {
      this.logger.error('Failed to schedule river sync:', error);
    }
  }

  private async scheduleDamSync() {
    try {
      await this.damSyncQueue.add('sync-dam-data', {}, {
        removeOnComplete: 10,
        removeOnFail: 50,
      });
      this.logger.log('Scheduled dam data sync');
    } catch (error) {
      this.logger.error('Failed to schedule dam sync:', error);
    }
  }
}

