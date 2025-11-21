import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/base/base.repository';
import { Dam, Prisma } from '@prisma/client';

export interface CreateDamDto {
  name: string;
  location: { lat: number; lng: number };
  address?: string;
  totalCapacity: number;
  type?: string;
  height?: number;
  length?: number;
  powerCapacity?: number;
  region?: string;
  state?: string;
  country?: string;
  externalId?: string;
}

export interface UpdateDamDto {
  name?: string;
  location?: { lat: number; lng: number };
  address?: string;
  totalCapacity?: number;
  type?: string;
  height?: number;
  length?: number;
  powerCapacity?: number;
  region?: string;
  state?: string;
  isActive?: boolean;
}

@Injectable()
export class DamsRepository extends BaseRepository<Dam, CreateDamDto, UpdateDamDto> {
  constructor(prisma: PrismaService) {
    super(prisma, 'dam');
  }

  async findAll(): Promise<Dam[]> {
    return this.prisma.dam.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Dam | null> {
    return this.prisma.dam.findUnique({
      where: { id },
    });
  }

  async create(data: CreateDamDto): Promise<Dam> {
    return this.prisma.dam.create({
      data: {
        ...data,
        location: data.location as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, data: UpdateDamDto): Promise<Dam> {
    const updateData: any = { ...data };
    if (data.location) {
      updateData.location = data.location as Prisma.InputJsonValue;
    }

    return this.prisma.dam.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.dam.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<Dam> {
    return this.prisma.dam.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByRegion(region: string): Promise<Dam[]> {
    return this.prisma.dam.findMany({
      where: {
        region,
        isActive: true,
      },
    });
  }
}

