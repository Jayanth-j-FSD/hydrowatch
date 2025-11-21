import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RainfallRepository } from './rainfall.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class RainfallService {
  private readonly logger = new Logger(RainfallService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rainfallRepository: RainfallRepository,
  ) {}

  async getAllStations() {
    return this.rainfallRepository.findAll();
  }

  async getStationById(id: string) {
    const station = await this.rainfallRepository.findById(id);
    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }
    return station;
  }

  async getForecast(stationId: string, days: number = 7) {
    const station = await this.getStationById(stationId);
    
    // TODO: Integrate with actual forecast API (IMD, OpenWeatherMap)
    // For now, return mock structure
    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        predictedRainfall: Math.random() * 50, // Mock data
        confidence: 75 + Math.random() * 20,
        intensity: this.getIntensity(Math.random() * 50),
      });
    }

    return {
      station,
      forecast,
    };
  }

  async getHistoricalData(stationId: string, startDate?: string, endDate?: string, limit: number = 100) {
    const where: Prisma.RainfallDataWhereInput = {
      stationId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const data = await this.prisma.rainfallData.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    });

    return data;
  }

  async getSeasonalAnalysis(stationId: string, year?: number) {
    const station = await this.getStationById(stationId);
    const targetYear = year || new Date().getFullYear();

    const data = await this.prisma.rainfallData.findMany({
      where: {
        stationId,
        date: {
          gte: new Date(`${targetYear}-01-01`),
          lte: new Date(`${targetYear}-12-31`),
        },
      },
      orderBy: { date: 'asc' },
    });

    const seasonal = {
      summer: { total: 0, days: 0 },
      monsoon: { total: 0, days: 0 },
      winter: { total: 0, days: 0 },
    };

    data.forEach((record) => {
      const month = new Date(record.date).getMonth() + 1;
      let season: 'summer' | 'monsoon' | 'winter';

      if (month >= 3 && month <= 5) {
        season = 'summer';
      } else if (month >= 6 && month <= 9) {
        season = 'monsoon';
      } else {
        season = 'winter';
      }

      seasonal[season].total += Number(record.rainfall);
      seasonal[season].days += 1;
    });

    return {
      station,
      year: targetYear,
      seasonal,
    };
  }

  async getRiskIndicators(region?: string) {
    // Calculate drought/flood risk based on recent rainfall
    const where: Prisma.RainfallDataWhereInput = {
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    };

    if (region) {
      const stations = await this.rainfallRepository.findByRegion(region);
      where.stationId = {
        in: stations.map((s) => s.id),
      };
    }

    const recentData = await this.prisma.rainfallData.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const totalRainfall = recentData.reduce((sum, record) => sum + Number(record.rainfall), 0);
    const averageRainfall = totalRainfall / (recentData.length || 1);

    // Simple risk calculation
    const droughtRisk = averageRainfall < 10 ? 'high' : averageRainfall < 25 ? 'medium' : 'low';
    const floodRisk = averageRainfall > 100 ? 'high' : averageRainfall > 50 ? 'medium' : 'low';

    return {
      region: region || 'all',
      averageRainfall: Number(averageRainfall.toFixed(2)),
      droughtRisk,
      floodRisk,
      period: '30 days',
    };
  }

  private getIntensity(rainfall: number): 'light' | 'moderate' | 'heavy' | 'extreme' {
    if (rainfall < 2.5) return 'light';
    if (rainfall < 7.5) return 'moderate';
    if (rainfall < 15) return 'heavy';
    return 'extreme';
  }
}

