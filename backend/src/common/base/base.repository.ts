import { PrismaService } from '../../prisma/prisma.service';
import { IRepository } from '../interfaces/repository.interface';

export abstract class BaseRepository<T, CreateDto, UpdateDto>
  implements IRepository<T, CreateDto, UpdateDto>
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: string,
  ) {}

  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: CreateDto): Promise<T>;
  abstract update(id: string, data: UpdateDto): Promise<T>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete(id: string): Promise<T>;
}

