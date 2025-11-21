import { Test, TestingModule } from '@nestjs/testing';
import { RiverService } from './river.service';
import { PrismaService } from '../prisma/prisma.service';
import { StationsRepository } from '../stations/stations.repository';
import { RiverLevelStatus } from './dto/river-level.dto';

describe('RiverService', () => {
  let service: RiverService;
  let prismaService: PrismaService;
  let stationsRepository: StationsRepository;

  const mockPrismaService = {
    riverLevel: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockStationsRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByRiver: jest.fn(),
    findByRegion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiverService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StationsRepository,
          useValue: mockStationsRepository,
        },
      ],
    }).compile();

    service = module.get<RiverService>(RiverService);
    prismaService = module.get<PrismaService>(PrismaService);
    stationsRepository = module.get<StationsRepository>(StationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFloodRisk', () => {
    it('should return "safe" when level is below danger threshold', () => {
      const risk = service.calculateFloodRisk(280, 290, 295);
      expect(risk).toBe(RiverLevelStatus.SAFE);
    });

    it('should return "warning" when level is 80% of danger threshold', () => {
      const risk = service.calculateFloodRisk(232, 290, 295); // 80% of 290
      expect(risk).toBe(RiverLevelStatus.WARNING);
    });

    it('should return "danger" when level exceeds danger threshold', () => {
      const risk = service.calculateFloodRisk(291, 290, 295);
      expect(risk).toBe(RiverLevelStatus.DANGER);
    });

    it('should return "critical" when level exceeds flood threshold', () => {
      const risk = service.calculateFloodRisk(296, 290, 295);
      expect(risk).toBe(RiverLevelStatus.CRITICAL);
    });
  });

  describe('getAllStations', () => {
    it('should return all stations', async () => {
      const mockStations = [
        { id: '1', name: 'Station 1', riverName: 'River 1' },
        { id: '2', name: 'Station 2', riverName: 'River 2' },
      ];

      mockStationsRepository.findAll.mockResolvedValue(mockStations);

      const result = await service.getAllStations();

      expect(result).toEqual(mockStations);
      expect(stationsRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentLevel', () => {
    it('should return current level with status', async () => {
      const mockStation = {
        id: '1',
        name: 'Station 1',
        dangerLevel: 290,
        floodLevel: 295,
      };

      const mockLevel = {
        level: 285,
        timestamp: new Date(),
        status: RiverLevelStatus.SAFE,
      };

      mockStationsRepository.findById.mockResolvedValue(mockStation);
      mockPrismaService.riverLevel.findFirst.mockResolvedValue(mockLevel);

      const result = await service.getCurrentLevel('1');

      expect(result.station).toEqual(mockStation);
      expect(result.level).toBe(285);
      expect(result.status).toBe(RiverLevelStatus.SAFE);
    });

    it('should return safe status when no level data available', async () => {
      const mockStation = {
        id: '1',
        name: 'Station 1',
        dangerLevel: 290,
        floodLevel: 295,
      };

      mockStationsRepository.findById.mockResolvedValue(mockStation);
      mockPrismaService.riverLevel.findFirst.mockResolvedValue(null);

      const result = await service.getCurrentLevel('1');

      expect(result.level).toBeNull();
      expect(result.status).toBe(RiverLevelStatus.SAFE);
      expect(result.message).toBe('No level data available');
    });
  });
});

