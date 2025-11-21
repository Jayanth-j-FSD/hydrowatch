import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/base/base.repository';
import { GroundwaterWell, Prisma } from '@prisma/client';

export interface CreateGroundwaterWellDto {
  name: string;
  location: { lat: number; lng: number };
  address?: string;
  region: string;
  state?: string;
  country?: string;
  aquiferType?: string;
  externalId?: string;
}

export interface UpdateGroundwaterWellDto {
  name?: string;
  location?: { lat: number; lng: number };
  address?: string;
  region?: string;
  state?: string;
  aquiferType?: string;
  isActive?: boolean;
}

@Injectable()
export class GroundwaterRepository extends BaseRepository<
  GroundwaterWell,
  CreateGroundwaterWellDto,
  UpdateGroundwaterWellDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'groundwaterWell');
  }

  async findAll(): Promise<GroundwaterWell[]> {
    return this.prisma.groundwaterWell.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<GroundwaterWell | null> {
    return this.prisma.groundwaterWell.findUnique({
      where: { id },
    });
  }

  async create(data: CreateGroundwaterWellDto): Promise<GroundwaterWell> {
    return this.prisma.groundwaterWell.create({
      data: {
        ...data,
        location: data.location as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, data: UpdateGroundwaterWellDto): Promise<GroundwaterWell> {
    const updateData: any = { ...data };
    if (data.location) {
      updateData.location = data.location as Prisma.InputJsonValue;
    }

    return this.prisma.groundwaterWell.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.groundwaterWell.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<GroundwaterWell> {
    return this.prisma.groundwaterWell.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByRegion(region: string): Promise<GroundwaterWell[]> {
    return this.prisma.groundwaterWell.findMany({
      where: {
        region,
        isActive: true,
      },
    });
  }
}

