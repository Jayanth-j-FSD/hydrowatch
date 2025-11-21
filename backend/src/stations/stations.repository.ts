import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/base/base.repository';
import { Station, Prisma } from '@prisma/client';

export interface CreateStationDto {
  name: string;
  riverName: string;
  location: { lat: number; lng: number };
  address?: string;
  dangerLevel: number;
  floodLevel: number;
  elevation?: number;
  basin?: string;
  region?: string;
  state?: string;
  country?: string;
  externalId?: string;
}

export interface UpdateStationDto {
  name?: string;
  riverName?: string;
  location?: { lat: number; lng: number };
  address?: string;
  dangerLevel?: number;
  floodLevel?: number;
  elevation?: number;
  basin?: string;
  region?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
}

@Injectable()
export class StationsRepository extends BaseRepository<
  Station,
  CreateStationDto,
  UpdateStationDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'station');
  }

  async findAll(): Promise<Station[]> {
    return this.prisma.station.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Station | null> {
    return this.prisma.station.findUnique({
      where: { id },
    });
  }

  async create(data: CreateStationDto): Promise<Station> {
    return this.prisma.station.create({
      data: {
        ...data,
        location: data.location as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, data: UpdateStationDto): Promise<Station> {
    const updateData: any = { ...data };
    if (data.location) {
      updateData.location = data.location as Prisma.InputJsonValue;
    }

    return this.prisma.station.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.station.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<Station> {
    return this.prisma.station.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByRiver(riverName: string): Promise<Station[]> {
    return this.prisma.station.findMany({
      where: {
        riverName,
        isActive: true,
      },
    });
  }

  async findByRegion(region: string): Promise<Station[]> {
    return this.prisma.station.findMany({
      where: {
        region,
        isActive: true,
      },
    });
  }
}

