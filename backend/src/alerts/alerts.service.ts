import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertConfigDto, UpdateAlertConfigDto, AlertType, ThresholdOperator } from './dto/alert-config.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createConfiguration(userId: string, createDto: CreateAlertConfigDto) {
    return this.prisma.alertConfiguration.create({
      data: {
        userId,
        ...createDto,
        thresholdValue: createDto.thresholdValue,
      },
    });
  }

  async getUserConfigurations(userId: string) {
    return this.prisma.alertConfiguration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateConfiguration(id: string, userId: string, updateDto: UpdateAlertConfigDto) {
    const config = await this.prisma.alertConfiguration.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Alert configuration not found');
    }

    if (config.userId !== userId) {
      throw new NotFoundException('You can only update your own configurations');
    }

    return this.prisma.alertConfiguration.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteConfiguration(id: string, userId: string) {
    const config = await this.prisma.alertConfiguration.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Alert configuration not found');
    }

    if (config.userId !== userId) {
      throw new NotFoundException('You can only delete your own configurations');
    }

    await this.prisma.alertConfiguration.delete({
      where: { id },
    });

    return { message: 'Configuration deleted successfully' };
  }

  async getActiveAlerts(userId?: string) {
    const where: Prisma.AlertWhereInput = {
      resolvedAt: null,
    };

    if (userId) {
      where.configuration = {
        userId,
      };
    }

    return this.prisma.alert.findMany({
      where,
      include: {
        configuration: true,
      },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  async getAlertHistory(userId?: string, limit: number = 100) {
    const where: Prisma.AlertWhereInput = {};

    if (userId) {
      where.configuration = {
        userId,
      };
    }

    return this.prisma.alert.findMany({
      where,
      include: {
        configuration: true,
      },
      orderBy: { triggeredAt: 'desc' },
      take: limit,
    });
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
      },
    });
  }

  async evaluateThresholds(type: AlertType, entityId: string, currentValue: number) {
    const configs = await this.prisma.alertConfiguration.findMany({
      where: {
        type,
        entityId,
        enabled: true,
      },
      include: {
        user: true,
      },
    });

    const triggeredAlerts = [];

    for (const config of configs) {
      const shouldTrigger = this.checkThreshold(
        currentValue,
        config.thresholdOperator as ThresholdOperator,
        Number(config.thresholdValue),
      );

      if (shouldTrigger) {
        // Check if alert already exists and is not resolved
        const existingAlert = await this.prisma.alert.findFirst({
          where: {
            configurationId: config.id,
            resolvedAt: null,
          },
        });

        if (!existingAlert) {
          const alert = await this.prisma.alert.create({
            data: {
              configurationId: config.id,
              type: config.type,
              entityId: config.entityId,
              entityName: this.getEntityName(type, entityId),
              severity: this.calculateSeverity(currentValue, Number(config.thresholdValue)),
              message: this.generateAlertMessage(
                type,
                currentValue,
                config.thresholdOperator as ThresholdOperator,
                Number(config.thresholdValue),
              ),
            },
          });

          triggeredAlerts.push({ alert, config });
        }
      }
    }

    return triggeredAlerts;
  }

  private checkThreshold(
    value: number,
    operator: ThresholdOperator,
    threshold: number,
  ): boolean {
    switch (operator) {
      case ThresholdOperator.GT:
        return value > threshold;
      case ThresholdOperator.LT:
        return value < threshold;
      case ThresholdOperator.EQ:
        return Math.abs(value - threshold) < 0.01;
      default:
        return false;
    }
  }

  private calculateSeverity(currentValue: number, thresholdValue: number): 'info' | 'warning' | 'critical' {
    const difference = Math.abs(currentValue - thresholdValue);
    const percentage = (difference / thresholdValue) * 100;

    if (percentage > 50) return 'critical';
    if (percentage > 20) return 'warning';
    return 'info';
  }

  private generateAlertMessage(
    type: AlertType,
    currentValue: number,
    operator: ThresholdOperator,
    threshold: number,
  ): string {
    const operatorText = {
      [ThresholdOperator.GT]: 'exceeded',
      [ThresholdOperator.LT]: 'dropped below',
      [ThresholdOperator.EQ]: 'reached',
    };

    return `${type} value ${operatorText[operator]} threshold: ${currentValue} (threshold: ${threshold})`;
  }

  private async getEntityName(type: AlertType, entityId: string): Promise<string> {
    switch (type) {
      case AlertType.RIVER:
        const station = await this.prisma.station.findUnique({ where: { id: entityId } });
        return station?.name || entityId;
      case AlertType.DAM:
        const dam = await this.prisma.dam.findUnique({ where: { id: entityId } });
        return dam?.name || entityId;
      default:
        return entityId;
    }
  }
}

