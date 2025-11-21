import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/base/base.repository';
import { RainfallStation, Prisma } from '@prisma/client';

export interface CreateRainfallStationDto {
  name: string;
  location: { lat: number; lng: number };
  address?: string;
  region: string;
  state?: string;
  country?: string;
  elevation?: number;
  externalId?: string;
}

export interface UpdateRainfallStationDto {
  name?: string;
  location?: { lat: number; lng: number };
  address?: string;
  region?: string;
  state?: string;
  elevation?: number;
  isActive?: boolean;
}

@Injectable()
export class RainfallRepository extends BaseRepository<
  RainfallStation,
  CreateRainfallStationDto,
  UpdateRainfallStationDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'rainfallStation');
  }

  async findAll(): Promise<RainfallStation[]> {
    return this.prisma.rainfallStation.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<RainfallStation | null> {
    return this.prisma.rainfallStation.findUnique({
      where: { id },
    });
  }

  async create(data: CreateRainfallStationDto): Promise<RainfallStation> {
    return this.prisma.rainfallStation.create({
      data: {
        ...data,
        location: data.location as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, data: UpdateRainfallStationDto): Promise<RainfallStation> {
    const updateData: any = { ...data };
    if (data.location) {
      updateData.location = data.location as Prisma.InputJsonValue;
    }

    return this.prisma.rainfallStation.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.rainfallStation.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<RainfallStation> {
    return this.prisma.rainfallStation.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByRegion(region: string): Promise<RainfallStation[]> {
    return this.prisma.rainfallStation.findMany({
      where: {
        region,
        isActive: true,
      },
    });
  }
}

