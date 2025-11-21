import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('notifications')
export class NotificationJob extends WorkerHost {
  private readonly logger = new Logger(NotificationJob.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing notification job: ${job.id}`);

    const { notificationId, type, userId, subject, message, channel } = job.data;

    try {
      // TODO: Implement actual notification sending
      // - Email: SendGrid/SES
      // - SMS: Twilio/AWS SNS
      // - Push: Web Push API

      // For now, just mark as sent
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Notification ${notificationId} sent successfully`);
      return { success: true, notificationId };
    } catch (error) {
      this.logger.error(`Failed to send notification ${notificationId}:`, error);

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }
}

