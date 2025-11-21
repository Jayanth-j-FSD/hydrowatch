import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface SendNotificationDto {
  userId: string;
  type: 'email' | 'sms' | 'push';
  subject?: string;
  message: string;
  channel?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async sendNotification(data: SendNotificationDto) {
    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        message: data.message,
        status: 'pending',
      },
    });

    // Add to queue for processing
    await this.notificationQueue.add('send-notification', {
      notificationId: notification.id,
      ...data,
    });

    return notification;
  }

  async getNotificationHistory(userId: string, limit: number = 100) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getPreferences(userId: string) {
    // TODO: Implement notification preferences table
    // For now, return default preferences
    return {
      userId,
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      quietHours: null,
    };
  }

  async updatePreferences(userId: string, preferences: any) {
    // TODO: Implement notification preferences update
    return { message: 'Preferences updated successfully' };
  }
}

