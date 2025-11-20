# Coding Standards: HydroWatch Platform

This document defines coding standards, conventions, folder structures, naming conventions, and reusable patterns for the HydroWatch platform.

---

## General Principles

### Code Quality
- **TypeScript Strict Mode**: Always enabled
- **No `any` types**: Use proper types or `unknown`
- **SOLID Principles**: Follow SOLID design principles
- **DRY (Don't Repeat Yourself)**: Reuse code, avoid duplication
- **KISS (Keep It Simple, Stupid)**: Prefer simple solutions
- **YAGNI (You Aren't Gonna Need It)**: Don't over-engineer

### Code Style
- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint with TypeScript rules
- **Line Length**: Maximum 100 characters
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings (JavaScript/TypeScript)
- **Semicolons**: Always use semicolons

---

## Folder Structure

### Frontend Structure

```
/frontend
├── /src
│   ├── /app                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── /river-tracker
│   │   ├── /dams-dashboard
│   │   ├── /groundwater
│   │   ├── /rainfall-forecast
│   │   └── /api                # API routes (BFF)
│   ├── /components
│   │   ├── /ui                 # Shadcn/ui components
│   │   ├── /charts             # Chart components
│   │   ├── /maps               # Map components
│   │   ├── /alerts             # Alert components
│   │   └── /common             # Common components
│   ├── /lib
│   │   ├── /api                # API client functions
│   │   ├── /utils              # Utility functions
│   │   ├── /constants          # Constants
│   │   └── /validations        # Zod schemas
│   ├── /hooks                  # Custom React hooks
│   ├── /store                  # Zustand stores
│   ├── /types                  # TypeScript types
│   └── /styles                 # Global styles
├── /public                     # Static assets
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.js
└── package.json
```

### Backend Structure

```
/backend
├── /src
│   ├── main.ts                 # Application entry
│   ├── app.module.ts            # Root module
│   ├── /modules
│   │   ├── /river
│   │   │   ├── river.module.ts
│   │   │   ├── river.controller.ts
│   │   │   ├── river.service.ts
│   │   │   ├── river.repository.ts
│   │   │   ├── /dto
│   │   │   │   ├── create-river.dto.ts
│   │   │   │   └── update-river.dto.ts
│   │   │   └── /entities
│   │   │       └── river.entity.ts
│   │   ├── /dams
│   │   ├── /groundwater
│   │   ├── /rainfall
│   │   ├── /alerts
│   │   └── /notifications
│   ├── /common
│   │   ├── /decorators
│   │   ├── /guards
│   │   ├── /interceptors
│   │   ├── /pipes
│   │   ├── /filters
│   │   └── /interfaces
│   ├── /config
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── external-apis.config.ts
│   ├── /database
│   │   ├── /migrations
│   │   ├── /seeds
│   │   └── schema.prisma
│   ├── /jobs
│   │   ├── data-sync.job.ts
│   │   └── report-generation.job.ts
│   └── /websockets
│       └── data-updates.gateway.ts
├── /test
│   ├── /unit
│   ├── /integration
│   └── /e2e
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── nest-cli.json
└── package.json
```

---

## Naming Conventions

### Files and Folders

#### Frontend
- **Components**: PascalCase (`RiverTracker.tsx`, `StationCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useRiverData.ts`, `useStationMap.ts`)
- **Utils**: camelCase (`formatDate.ts`, `calculateRisk.ts`)
- **Types**: PascalCase (`RiverStation.ts`, `AlertConfig.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL.ts`, `MAX_RETRIES.ts`)
- **Folders**: kebab-case (`river-tracker/`, `dams-dashboard/`)

#### Backend
- **Modules**: kebab-case (`river.module.ts`, `dams-dashboard.module.ts`)
- **Controllers**: kebab-case with `.controller.ts` (`river.controller.ts`)
- **Services**: kebab-case with `.service.ts` (`river.service.ts`)
- **Repositories**: kebab-case with `.repository.ts` (`river.repository.ts`)
- **DTOs**: kebab-case with `.dto.ts` (`create-river.dto.ts`)
- **Entities**: kebab-case with `.entity.ts` (`river.entity.ts`)
- **Guards**: kebab-case with `.guard.ts` (`auth.guard.ts`)
- **Pipes**: kebab-case with `.pipe.ts` (`validation.pipe.ts`)

### Variables and Functions

#### TypeScript/JavaScript
- **Variables**: camelCase (`stationId`, `currentLevel`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **Functions**: camelCase (`getRiverLevel()`, `calculateFloodRisk()`)
- **Classes**: PascalCase (`RiverService`, `StationRepository`)
- **Interfaces**: PascalCase (`IRiverStation`, `IAlertConfig`)
- **Types**: PascalCase (`RiverLevel`, `AlertSeverity`)
- **Enums**: PascalCase (`AlertSeverity`, `StationStatus`)

#### Database
- **Tables**: snake_case (`river_levels`, `alert_configurations`)
- **Columns**: snake_case (`station_id`, `current_level`, `created_at`)
- **Indexes**: `idx_<table>_<column>` (`idx_stations_region`)
- **Foreign Keys**: `fk_<table>_<referenced_table>` (`fk_alerts_configuration_id`)

---

## TypeScript Standards

### Type Definitions

```typescript
// ✅ Good: Explicit types
interface RiverStation {
  id: string;
  name: string;
  currentLevel: number;
  status: 'safe' | 'warning' | 'danger' | 'critical';
}

// ❌ Bad: Using any
function getStation(data: any): any {
  return data;
}

// ✅ Good: Proper typing
function getStation(data: unknown): RiverStation {
  if (isRiverStation(data)) {
    return data;
  }
  throw new Error('Invalid station data');
}
```

### Type Guards

```typescript
// ✅ Good: Type guard function
function isRiverStation(data: unknown): data is RiverStation {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'currentLevel' in data
  );
}
```

### Enums vs Union Types

```typescript
// ✅ Good: Union type for simple cases
type AlertSeverity = 'info' | 'warning' | 'critical';

// ✅ Good: Enum for complex cases
enum StationType {
  RIVER = 'river',
  DAM = 'dam',
  GROUNDWATER = 'groundwater',
  RAINFALL = 'rainfall',
}
```

---

## React/Next.js Standards

### Component Structure

```typescript
// ✅ Good: Functional component with TypeScript
interface StationCardProps {
  station: RiverStation;
  onSelect: (id: string) => void;
}

export function StationCard({ station, onSelect }: StationCardProps) {
  const handleClick = () => {
    onSelect(station.id);
  };

  return (
    <div onClick={handleClick}>
      <h3>{station.name}</h3>
      <p>Level: {station.currentLevel}</p>
    </div>
  );
}
```

### Hooks Usage

```typescript
// ✅ Good: Custom hook for data fetching
export function useRiverStation(stationId: string) {
  return useQuery({
    queryKey: ['river', 'station', stationId],
    queryFn: () => fetchStation(stationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ✅ Good: Custom hook for WebSocket
export function useRiverUpdates(stationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(API_URL);
    socket.on(`river:station:${stationId}`, (data) => {
      queryClient.setQueryData(['river', 'station', stationId], data);
    });

    return () => socket.disconnect();
  }, [stationId, queryClient]);
}
```

### File Organization

```typescript
// ✅ Good: Component file structure
// StationCard.tsx
import { useState } from 'react';
import { StationCardProps } from './types';
import { formatLevel } from '@/lib/utils';

export function StationCard({ station, onSelect }: StationCardProps) {
  // Component logic
}

// Types in separate file or at bottom
export interface StationCardProps {
  station: RiverStation;
  onSelect: (id: string) => void;
}
```

---

## NestJS Standards

### Module Structure

```typescript
// ✅ Good: Module file
@Module({
  imports: [DatabaseModule, CacheModule],
  controllers: [RiverController],
  providers: [RiverService, RiverRepository],
  exports: [RiverService],
})
export class RiverModule {}
```

### Service Pattern

```typescript
// ✅ Good: Service with dependency injection
@Injectable()
export class RiverService {
  constructor(
    private readonly repository: RiverRepository,
    private readonly logger: Logger,
  ) {}

  async getStation(id: string): Promise<RiverStation> {
    this.logger.log(`Fetching station ${id}`);
    const station = await this.repository.findById(id);
    if (!station) {
      throw new NotFoundException(`Station ${id} not found`);
    }
    return station;
  }
}
```

### Controller Pattern

```typescript
// ✅ Good: Controller with proper decorators
@Controller('river/stations')
@UseGuards(AuthGuard)
export class RiverController {
  constructor(private readonly service: RiverService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stations' })
  @ApiResponse({ status: 200, type: [RiverStationDto] })
  async getStations(@Query() query: GetStationsQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by ID' })
  async getStation(@Param('id') id: string) {
    return this.service.getStation(id);
  }
}
```

### DTO Pattern

```typescript
// ✅ Good: DTO with validation
export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  riverName: string;

  @IsNumber()
  @IsNotEmpty()
  dangerLevel: number;

  @IsNumber()
  @IsNotEmpty()
  floodLevel: number;
}
```

---

## Error Handling

### Frontend Error Handling

```typescript
// ✅ Good: Error boundary
export class ErrorBoundary extends React.Component {
  // Error boundary implementation
}

// ✅ Good: Try-catch in async functions
async function fetchStation(id: string) {
  try {
    const response = await api.get(`/river/stations/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch station: ${error.message}`);
    }
    throw error;
  }
}
```

### Backend Error Handling

```typescript
// ✅ Good: Custom exception filter
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      success: false,
      error: {
        code: exception.code || 'INTERNAL_ERROR',
        message: exception.message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
```

---

## Testing Standards

### Unit Tests

```typescript
// ✅ Good: Unit test structure
describe('RiverService', () => {
  let service: RiverService;
  let repository: RiverRepository;

  beforeEach(() => {
    repository = createMockRepository();
    service = new RiverService(repository);
  });

  it('should return station by id', async () => {
    const mockStation = { id: '1', name: 'Test Station' };
    jest.spyOn(repository, 'findById').mockResolvedValue(mockStation);

    const result = await service.getStation('1');

    expect(result).toEqual(mockStation);
    expect(repository.findById).toHaveBeenCalledWith('1');
  });
});
```

### Integration Tests

```typescript
// ✅ Good: Integration test
describe('RiverController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/river/stations (GET)', () => {
    return request(app.getHttpServer())
      .get('/river/stations')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.stations)).toBe(true);
      });
  });
});
```

---

## Code Comments

### JSDoc Comments

```typescript
/**
 * Calculates flood risk based on current water level
 * @param currentLevel - Current water level in meters
 * @param dangerLevel - Danger threshold level
 * @param floodLevel - Flood threshold level
 * @returns Risk status: 'safe', 'warning', 'danger', or 'critical'
 * @example
 * ```typescript
 * const risk = calculateFloodRisk(285.5, 290.0, 295.0);
 * // Returns: 'safe'
 * ```
 */
export function calculateFloodRisk(
  currentLevel: number,
  dangerLevel: number,
  floodLevel: number,
): 'safe' | 'warning' | 'danger' | 'critical' {
  if (currentLevel >= floodLevel) return 'critical';
  if (currentLevel >= dangerLevel) return 'danger';
  if (currentLevel >= dangerLevel * 0.9) return 'warning';
  return 'safe';
}
```

### Inline Comments

```typescript
// ✅ Good: Explain why, not what
// Use exponential backoff to avoid overwhelming the API
const delay = Math.min(1000 * Math.pow(2, attempt), 30000);

// ❌ Bad: Obvious comment
// Increment the counter
counter++;
```

---

## Git Conventions

### Commit Messages

Format: `type(scope): subject`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(river): add real-time level updates
fix(dams): resolve capacity calculation bug
docs(api): update endpoint documentation
refactor(groundwater): simplify depth calculation
test(river): add unit tests for service
```

### Branch Naming

- `main` - Production branch
- `develop` - Development branch
- `feature/river-tracker` - Feature branches
- `fix/dam-capacity-bug` - Bug fix branches
- `hotfix/critical-alert` - Hotfix branches

---

## Environment Variables

### Naming Convention

```bash
# ✅ Good: UPPER_SNAKE_CASE with prefix
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
API_BASE_URL=https://api.hydrowatch.com
JWT_SECRET=...
INDIA_WRIS_API_KEY=...
OPENWEATHER_API_KEY=...

# ❌ Bad: Inconsistent naming
databaseUrl=...
redis_url=...
```

### Environment Files

- `.env.example` - Template with all variables (no secrets)
- `.env.local` - Local development (gitignored)
- `.env.staging` - Staging environment
- `.env.production` - Production environment

---

## Performance Standards

### Frontend

- **Bundle Size**: < 500KB initial load (gzipped)
- **Code Splitting**: Route-based and component-based
- **Lazy Loading**: Images and heavy components
- **Memoization**: Use `useMemo` and `useCallback` appropriately

### Backend

- **Response Time**: < 500ms for cached, < 2s for uncached
- **Database Queries**: Use indexes, avoid N+1 queries
- **Caching**: Cache API responses for 15 minutes
- **Connection Pooling**: Configure appropriate pool sizes

---

## Security Standards

### Input Validation

```typescript
// ✅ Good: Validate all inputs
import { z } from 'zod';

const StationSchema = z.object({
  name: z.string().min(1).max(255),
  riverName: z.string().min(1).max(255),
  dangerLevel: z.number().positive(),
  floodLevel: z.number().positive(),
});

// Validate before processing
const validated = StationSchema.parse(input);
```

### Authentication

```typescript
// ✅ Good: Use guards for protected routes
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'analyst')
@Get('admin/stations')
async getAdminStations() {
  // Admin-only endpoint
}
```

---

## Documentation Standards

### Code Documentation

- **Public APIs**: Must have JSDoc comments
- **Complex Logic**: Explain with comments
- **Type Definitions**: Document interfaces and types

### README Files

Each module should have a README with:
- Purpose and overview
- Usage examples
- API documentation
- Dependencies

---

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.logs or debug code
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Accessibility requirements met

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-21  
**Author**: Development Team

