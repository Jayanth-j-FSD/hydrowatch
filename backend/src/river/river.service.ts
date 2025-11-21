import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StationsRepository } from '../stations/stations.repository';
import { CreateRiverLevelDto, RiverLevelQueryDto, RiverLevelStatus } from './dto/river-level.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RiverService {
  private readonly logger = new Logger(RiverService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stationsRepository: StationsRepository,
  ) {}

  async getAllStations() {
    return this.stationsRepository.findAll();
  }

  async getStationById(id: string) {
    const station = await this.stationsRepository.findById(id);
    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }
    return station;
  }

  async getCurrentLevel(stationId: string) {
    const station = await this.getStationById(stationId);
    
    const latestLevel = await this.prisma.riverLevel.findFirst({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
    });

    if (!latestLevel) {
      return {
        station,
        level: null,
        status: RiverLevelStatus.SAFE,
        message: 'No level data available',
      };
    }

    const status = this.calculateFloodRisk(
      latestLevel.level,
      Number(station.dangerLevel),
      Number(station.floodLevel),
    );

    return {
      station,
      level: latestLevel.level,
      timestamp: latestLevel.timestamp,
      status,
    };
  }

  async getHistoricalLevels(query: RiverLevelQueryDto) {
    const { stationId, startDate, endDate, limit = 100 } = query;

    if (!stationId) {
      throw new NotFoundException('Station ID is required');
    }

    const where: Prisma.RiverLevelWhereInput = {
      stationId,
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

    const levels = await this.prisma.riverLevel.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return levels;
  }

  async createLevel(data: CreateRiverLevelDto) {
    const station = await this.getStationById(data.stationId);

    const status = this.calculateFloodRisk(
      data.level,
      Number(station.dangerLevel),
      Number(station.floodLevel),
    );

    const level = await this.prisma.riverLevel.create({
      data: {
        stationId: data.stationId,
        level: data.level,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        status,
      },
    });

    return level;
  }

  calculateFloodRisk(
    level: number,
    dangerLevel: number,
    floodLevel: number,
  ): RiverLevelStatus {
    if (level >= floodLevel) {
      return RiverLevelStatus.CRITICAL;
    } else if (level >= dangerLevel) {
      return RiverLevelStatus.DANGER;
    } else if (level >= dangerLevel * 0.8) {
      return RiverLevelStatus.WARNING;
    } else {
      return RiverLevelStatus.SAFE;
    }
  }

  async getStationsByRiver(riverName: string) {
    return this.stationsRepository.findByRiver(riverName);
  }

  async getStationsByRegion(region: string) {
    return this.stationsRepository.findByRegion(region);
  }

  async getActiveAlerts() {
    const criticalLevels = await this.prisma.riverLevel.findMany({
      where: {
        status: RiverLevelStatus.CRITICAL,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        station: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return criticalLevels.map((level) => ({
      station: level.station,
      level: level.level,
      status: level.status,
      timestamp: level.timestamp,
    }));
  }
}

