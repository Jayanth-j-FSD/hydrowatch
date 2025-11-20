# Testing Strategy: HydroWatch Platform

This document outlines the comprehensive testing strategy, including unit tests, integration tests, E2E tests, test environments, tools, and frameworks for the HydroWatch platform.

---

## Testing Philosophy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /____\     - User flows
     /      \    - Critical paths
    /________\   Integration Tests (30%)
   /          \  - API endpoints
  /____________\ Unit Tests (60%)
                - Services, utilities, components
```

### Testing Principles

1. **Test Early, Test Often**: Write tests alongside code
2. **Test Behavior, Not Implementation**: Focus on what, not how
3. **Maintainability**: Tests should be easy to read and update
4. **Isolation**: Tests should be independent and isolated
5. **Coverage**: Aim for >80% code coverage
6. **Fast Feedback**: Tests should run quickly
7. **Realistic Data**: Use realistic test data

---

## Testing Types

### 1. Unit Tests

**Purpose**: Test individual functions, methods, and components in isolation.

**Coverage Target**: >80%

**Tools**:
- **Frontend**: Vitest
- **Backend**: Jest

**What to Test**:
- Service methods
- Utility functions
- Component rendering
- Business logic
- Data transformations
- Validation functions

**Example**:
```typescript
// river.service.spec.ts
describe('RiverService', () => {
  let service: RiverService;
  let repository: RiverRepository;

  beforeEach(() => {
    repository = createMockRepository();
    service = new RiverService(repository);
  });

  describe('calculateFloodRisk', () => {
    it('should return "safe" when level is below danger threshold', () => {
      const risk = service.calculateFloodRisk(280, 290, 295);
      expect(risk).toBe('safe');
    });

    it('should return "critical" when level exceeds flood threshold', () => {
      const risk = service.calculateFloodRisk(296, 290, 295);
      expect(risk).toBe('critical');
    });
  });
});
```

---

### 2. Integration Tests

**Purpose**: Test interactions between multiple components, services, or modules.

**Coverage Target**: Critical paths and API endpoints

**Tools**:
- **Backend**: Jest + Supertest
- **Frontend**: React Testing Library

**What to Test**:
- API endpoints (request/response)
- Database operations
- External API integrations
- Service interactions
- WebSocket connections
- Job queue processing

**Example**:
```typescript
// river.controller.e2e.spec.ts
describe('RiverController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/river/stations (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/river/stations')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.stations)).toBe(true);
      });
  });

  it('/api/v1/river/stations/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/river/stations/station_123')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe('station_123');
      });
  });
});
```

---

### 3. End-to-End (E2E) Tests

**Purpose**: Test complete user flows from frontend to backend.

**Coverage Target**: Critical user journeys

**Tools**: Playwright

**What to Test**:
- User authentication flow
- Viewing river levels
- Setting up alerts
- Exporting reports
- Real-time data updates
- Mobile responsiveness

**Example**:
```typescript
// river-tracker.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('River Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/river-tracker');
  });

  test('should display station list', async ({ page }) => {
    await expect(page.locator('[data-testid="station-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="station-card"]')).toHaveCount(
      { min: 1 },
    );
  });

  test('should show station details on click', async ({ page }) => {
    await page.click('[data-testid="station-card"]:first-child');
    await expect(page.locator('[data-testid="station-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="level-chart"]')).toBeVisible();
  });

  test('should update levels in real-time', async ({ page }) => {
    const initialLevel = await page
      .locator('[data-testid="current-level"]')
      .textContent();

    // Simulate WebSocket update
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('river:level:update', {
          detail: { level: 286.5 },
        }),
      );
    });

    await expect(page.locator('[data-testid="current-level"]')).not.toHaveText(
      initialLevel!,
    );
  });
});
```

---

### 4. Performance Tests

**Purpose**: Test application performance under load.

**Tools**: k6, Artillery

**What to Test**:
- API response times
- Concurrent user handling
- Database query performance
- Cache effectiveness
- WebSocket connection limits

**Example**:
```javascript
// load-test.js (k6)
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  const response = http.get('https://api.hydrowatch.com/api/v1/river/stations');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

### 5. Security Tests

**Purpose**: Test security vulnerabilities and authentication.

**Tools**: OWASP ZAP, manual testing

**What to Test**:
- Authentication bypass
- Authorization checks
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Input validation

---

## Test Environments

### Development Environment

- **Purpose**: Local development and testing
- **Database**: Docker PostgreSQL + TimescaleDB
- **Cache**: Docker Redis
- **External APIs**: Mock services (MSW)

### Test Environment

- **Purpose**: Automated testing (CI/CD)
- **Database**: Test database (isolated)
- **Cache**: Test Redis instance
- **External APIs**: Mock services

### Staging Environment

- **Purpose**: Pre-production testing
- **Database**: Staging database (production-like)
- **Cache**: Staging Redis
- **External APIs**: Real APIs (test keys)

### Production Environment

- **Purpose**: Live application
- **Database**: Production database
- **Cache**: Production Redis cluster
- **External APIs**: Real APIs (production keys)

---

## Testing Tools & Frameworks

### Frontend Testing

| Tool | Purpose | Version |
|------|---------|---------|
| **Vitest** | Unit testing | Latest |
| **React Testing Library** | Component testing | Latest |
| **Playwright** | E2E testing | Latest |
| **MSW** | API mocking | Latest |
| **@testing-library/user-event** | User interaction simulation | Latest |

### Backend Testing

| Tool | Purpose | Version |
|------|---------|---------|
| **Jest** | Unit & integration testing | Latest |
| **Supertest** | HTTP endpoint testing | Latest |
| **@nestjs/testing** | NestJS testing utilities | Latest |
| **Prisma Mock** | Database mocking | Latest |

### Test Utilities

| Tool | Purpose |
|------|---------|
| **Faker.js** | Generate fake test data |
| **Factory Bot** | Test data factories |
| **Sinon** | Spies, stubs, mocks |
| **Nock** | HTTP request mocking |

---

## Test Data Management

### Test Fixtures

```typescript
// fixtures/river-stations.ts
export const mockStations = [
  {
    id: 'station_123',
    name: 'Ganga - Haridwar',
    riverName: 'Ganga',
    currentLevel: 285.5,
    dangerLevel: 290.0,
    floodLevel: 295.0,
    status: 'safe',
  },
  {
    id: 'station_456',
    name: 'Yamuna - Delhi',
    riverName: 'Yamuna',
    currentLevel: 296.5,
    dangerLevel: 290.0,
    floodLevel: 295.0,
    status: 'critical',
  },
];
```

### Test Factories

```typescript
// factories/station.factory.ts
import { faker } from '@faker-js/faker';

export function createStation(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.location.city(),
    riverName: faker.location.river(),
    currentLevel: faker.number.float({ min: 280, max: 300 }),
    dangerLevel: 290.0,
    floodLevel: 295.0,
    status: 'safe',
    ...overrides,
  };
}
```

### Database Seeding

```typescript
// seeds/test.seed.ts
export async function seedTestData(prisma: PrismaClient) {
  await prisma.station.createMany({
    data: mockStations,
  });
}
```

---

## Mocking Strategies

### External API Mocking

```typescript
// mocks/india-wris.api.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('https://india-wris.gov.in/api/river-levels', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        stations: mockStations,
      }),
    );
  }),
];
```

### Database Mocking

```typescript
// mocks/prisma.mock.ts
export const createMockPrisma = () => ({
  station: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});
```

### WebSocket Mocking

```typescript
// mocks/websocket.mock.ts
export const createMockSocket = () => ({
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
});
```

---

## Test Coverage

### Coverage Targets

- **Overall**: >80%
- **Services**: >90%
- **Controllers**: >85%
- **Utilities**: >95%
- **Components**: >75%

### Coverage Tools

- **Frontend**: Vitest coverage (c8)
- **Backend**: Jest coverage (Istanbul)

### Coverage Reports

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.spec.ts', '**/node_modules/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:frontend
      - run: npm run test:coverage

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:backend
      - run: npm run test:coverage

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
```

---

## Test Execution

### Running Tests

```bash
# Frontend unit tests
npm run test:frontend

# Backend unit tests
npm run test:backend

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "vitest",
    "test:backend": "jest",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage && jest --coverage"
  }
}
```

---

## Test Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
it('should calculate flood risk correctly', () => {
  // Arrange
  const currentLevel = 285.5;
  const dangerLevel = 290.0;
  const floodLevel = 295.0;

  // Act
  const risk = calculateFloodRisk(currentLevel, dangerLevel, floodLevel);

  // Assert
  expect(risk).toBe('safe');
});
```

### 2. Descriptive Test Names

```typescript
// ✅ Good
it('should return "critical" when water level exceeds flood threshold', () => {
  // ...
});

// ❌ Bad
it('test 1', () => {
  // ...
});
```

### 3. One Assertion Per Test (When Possible)

```typescript
// ✅ Good: Focused test
it('should return station by id', async () => {
  const station = await service.getStation('station_123');
  expect(station.id).toBe('station_123');
});

// ✅ Good: Multiple related assertions
it('should return station with all required fields', async () => {
  const station = await service.getStation('station_123');
  expect(station).toHaveProperty('id');
  expect(station).toHaveProperty('name');
  expect(station).toHaveProperty('currentLevel');
});
```

### 4. Test Isolation

```typescript
// ✅ Good: Each test is independent
describe('RiverService', () => {
  let service: RiverService;

  beforeEach(() => {
    service = new RiverService(createMockRepository());
  });

  it('test 1', () => {
    // Independent test
  });

  it('test 2', () => {
    // Independent test (doesn't depend on test 1)
  });
});
```

### 5. Mock External Dependencies

```typescript
// ✅ Good: Mock external API
jest.mock('../api/india-wris.client', () => ({
  IndiaWrisClient: jest.fn().mockImplementation(() => ({
    getRiverLevels: jest.fn().mockResolvedValue(mockData),
  })),
}));
```

---

## Test Data Cleanup

### Database Cleanup

```typescript
// Clean up after each test
afterEach(async () => {
  await prisma.station.deleteMany();
  await prisma.riverLevel.deleteMany();
});
```

### Transaction Rollback

```typescript
// Use transactions for test isolation
describe('RiverService', () => {
  let prisma: PrismaClient;

  beforeEach(async () => {
    await prisma.$transaction(async (tx) => {
      // Test operations
    });
  });
});
```

---

## Continuous Testing

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:lint && npm run test:unit"
    }
  }
}
```

### Test on Pull Requests

- Run all tests on PR creation
- Require tests to pass before merge
- Generate coverage reports
- Block merge if coverage drops

---

## Test Metrics & Reporting

### Metrics to Track

- Test execution time
- Code coverage percentage
- Test pass/fail rate
- Flaky test detection
- Test maintenance cost

### Reporting Tools

- **Coverage**: HTML coverage reports
- **Test Results**: JUnit XML for CI/CD
- **Visual Regression**: Percy, Chromatic (if needed)

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-21  
**Author**: Development Team

