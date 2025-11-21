import { Test, TestingModule } from '@nestjs/testing';
import { DamsService } from './dams.service';
import { PrismaService } from '../prisma/prisma.service';
import { DamsRepository } from './dams.repository';
import { DamStatus } from './dto/dam-capacity.dto';

describe('DamsService', () => {
  let service: DamsService;
  let prismaService: PrismaService;
  let damsRepository: DamsRepository;

  const mockPrismaService = {
    damCapacity: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockDamsRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByRegion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DamsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DamsRepository,
          useValue: mockDamsRepository,
        },
      ],
    }).compile();

    service = module.get<DamsService>(DamsService);
    prismaService = module.get<PrismaService>(PrismaService);
    damsRepository = module.get<DamsRepository>(DamsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateStatus', () => {
    it('should return "normal" when percentage is below 75%', () => {
      const status = service.calculateStatus(50);
      expect(status).toBe(DamStatus.NORMAL);
    });

    it('should return "warning" when percentage is between 75% and 90%', () => {
      const status = service.calculateStatus(80);
      expect(status).toBe(DamStatus.WARNING);
    });

    it('should return "critical" when percentage is between 90% and 100%', () => {
      const status = service.calculateStatus(95);
      expect(status).toBe(DamStatus.CRITICAL);
    });

    it('should return "overflow" when percentage is 100% or above', () => {
      const status = service.calculateStatus(100);
      expect(status).toBe(DamStatus.OVERFLOW);
    });
  });

  describe('getCurrentCapacity', () => {
    it('should return current capacity with calculated percentage', async () => {
      const mockDam = {
        id: '1',
        name: 'Dam 1',
        totalCapacity: 1000,
      };

      const mockCapacity = {
        storage: 750,
        capacity: 1000,
        percentage: 75,
        timestamp: new Date(),
        status: DamStatus.WARNING,
      };

      mockDamsRepository.findById.mockResolvedValue(mockDam);
      mockPrismaService.damCapacity.findFirst.mockResolvedValue(mockCapacity);

      const result = await service.getCurrentCapacity('1');

      expect(result.dam).toEqual(mockDam);
      expect(result.storage).toBe(750);
      expect(result.percentage).toBe(75);
      expect(result.status).toBe(DamStatus.WARNING);
    });
  });
});

