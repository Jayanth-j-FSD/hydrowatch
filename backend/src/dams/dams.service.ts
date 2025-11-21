import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DamsRepository } from '../dams/dams.repository';
import { CreateDamCapacityDto, DamCapacityQueryDto, DamStatus } from './dto/dam-capacity.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DamsService {
  private readonly logger = new Logger(DamsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly damsRepository: DamsRepository,
  ) {}

  async getAllDams() {
    return this.damsRepository.findAll();
  }

  async getDamById(id: string) {
    const dam = await this.damsRepository.findById(id);
    if (!dam) {
      throw new NotFoundException(`Dam with ID ${id} not found`);
    }
    return dam;
  }

  async getCurrentCapacity(damId: string) {
    const dam = await this.getDamById(damId);
    
    const latestCapacity = await this.prisma.damCapacity.findFirst({
      where: { damId },
      orderBy: { timestamp: 'desc' },
    });

    if (!latestCapacity) {
      return {
        dam,
        storage: null,
        capacity: Number(dam.totalCapacity),
        percentage: 0,
        status: DamStatus.NORMAL,
        message: 'No capacity data available',
      };
    }

    const percentage = (latestCapacity.storage / Number(dam.totalCapacity)) * 100;
    const status = this.calculateStatus(percentage);

    return {
      dam,
      storage: latestCapacity.storage,
      capacity: Number(dam.totalCapacity),
      percentage: Number(percentage.toFixed(2)),
      inflowRate: latestCapacity.inflowRate,
      outflowRate: latestCapacity.outflowRate,
      powerGeneration: latestCapacity.powerGeneration,
      status,
      timestamp: latestCapacity.timestamp,
    };
  }

  async getCapacityHistory(query: DamCapacityQueryDto) {
    const { damId, startDate, endDate, limit = 100 } = query;

    if (!damId) {
      throw new NotFoundException('Dam ID is required');
    }

    const where: Prisma.DamCapacityWhereInput = {
      damId,
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const capacities = await this.prisma.damCapacity.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return capacities;
  }

  async createCapacity(data: CreateDamCapacityDto) {
    const dam = await this.getDamById(data.damId);

    const percentage = (data.storage / Number(dam.totalCapacity)) * 100;
    const status = this.calculateStatus(percentage);

    const capacity = await this.prisma.damCapacity.create({
      data: {
        damId: data.damId,
        storage: data.storage,
        capacity: Number(dam.totalCapacity),
        percentage: Number(percentage.toFixed(2)),
        inflowRate: data.inflowRate,
        outflowRate: data.outflowRate,
        powerGeneration: data.powerGeneration,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        status,
      },
    });

    return capacity;
  }

  calculateStatus(percentage: number): DamStatus {
    if (percentage >= 100) {
      return DamStatus.OVERFLOW;
    } else if (percentage >= 90) {
      return DamStatus.CRITICAL;
    } else if (percentage >= 75) {
      return DamStatus.WARNING;
    } else {
      return DamStatus.NORMAL;
    }
  }

  async getDamsByRegion(region: string) {
    return this.damsRepository.findByRegion(region);
  }

  async getActiveAlerts() {
    const overflowDams = await this.prisma.damCapacity.findMany({
      where: {
        status: DamStatus.OVERFLOW,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        dam: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return overflowDams.map((capacity) => ({
      dam: capacity.dam,
      storage: capacity.storage,
      capacity: capacity.capacity,
      percentage: capacity.percentage,
      status: capacity.status,
      timestamp: capacity.timestamp,
    }));
  }
}

