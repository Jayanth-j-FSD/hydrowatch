import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroundwaterRepository } from './groundwater.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroundwaterService {
  private readonly logger = new Logger(GroundwaterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly groundwaterRepository: GroundwaterRepository,
  ) {}

  async getAllWells() {
    return this.groundwaterRepository.findAll();
  }

  async getWellById(id: string) {
    const well = await this.groundwaterRepository.findById(id);
    if (!well) {
      throw new NotFoundException(`Well with ID ${id} not found`);
    }
    return well;
  }

  async getCurrentDepth(wellId: string) {
    const well = await this.getWellById(wellId);
    
    const latestDepth = await this.prisma.groundwaterDepth.findFirst({
      where: { wellId },
      orderBy: { timestamp: 'desc' },
    });

    if (!latestDepth) {
      return {
        well,
        depth: null,
        message: 'No depth data available',
      };
    }

    return {
      well,
      depth: latestDepth.depth,
      timestamp: latestDepth.timestamp,
      season: latestDepth.season,
    };
  }

  async getDepthHistory(wellId: string, startDate?: string, endDate?: string, limit: number = 100) {
    const where: Prisma.GroundwaterDepthWhereInput = {
      wellId,
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

    const depths = await this.prisma.groundwaterDepth.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return depths;
  }

  async getQualityData(wellId: string) {
    const well = await this.getWellById(wellId);
    
    const latestQuality = await this.prisma.groundwaterQuality.findFirst({
      where: { wellId },
      orderBy: { timestamp: 'desc' },
    });

    return {
      well,
      quality: latestQuality || null,
    };
  }

  async getRegionalData(region: string) {
    const wells = await this.groundwaterRepository.findByRegion(region);
    
    const regionalData = await Promise.all(
      wells.map(async (well) => {
        const latestDepth = await this.prisma.groundwaterDepth.findFirst({
          where: { wellId: well.id },
          orderBy: { timestamp: 'desc' },
        });

        return {
          well,
          latestDepth: latestDepth ? {
            depth: latestDepth.depth,
            timestamp: latestDepth.timestamp,
          } : null,
        };
      }),
    );

    return regionalData;
  }

  async getHeatmapData(region?: string) {
    const where: Prisma.GroundwaterWellWhereInput = {
      isActive: true,
    };

    if (region) {
      where.region = region;
    }

    const wells = await this.prisma.groundwaterWell.findMany({
      where,
      include: {
        groundwaterDepth: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    return wells.map((well) => ({
      id: well.id,
      name: well.name,
      location: well.location,
      depth: well.groundwaterDepth[0]?.depth || null,
      timestamp: well.groundwaterDepth[0]?.timestamp || null,
    }));
  }
}

