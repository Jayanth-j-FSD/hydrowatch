# Deployment Guide: HydroWatch Platform

This document provides comprehensive instructions for deploying the HydroWatch platform across development, staging, and production environments.

---

## Deployment Overview

### Environments

1. **Development**: Local development environment
2. **Staging**: Pre-production testing environment
3. **Production**: Live production environment

### Deployment Strategy

- **Containerization**: Docker for consistent deployments
- **CI/CD**: GitHub Actions for automated deployments
- **Infrastructure**: Cloud-based (AWS/GCP/Azure) or self-hosted
- **Database**: Managed PostgreSQL + TimescaleDB
- **Cache**: Managed Redis or self-hosted

---

## Prerequisites

### Required Tools

- Docker & Docker Compose
- Node.js 20+ LTS
- PostgreSQL 15+ (or managed service)
- Redis 7+ (or managed service)
- Git
- CI/CD access (GitHub Actions)

### Required Accounts

- Cloud provider account (AWS/GCP/Azure)
- Domain name (for production)
- SSL certificate (Let's Encrypt or managed)
- External API keys (India-WRIS, OpenWeatherMap, etc.)

---

## Environment Configuration

### Environment Variables

#### Development (.env.local)

```bash
# Application
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hydrowatch_dev
TIMESCALEDB_ENABLED=true

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=development_secret_key_change_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=development_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# External APIs
INDIA_WRIS_API_KEY=your_api_key
IMD_API_KEY=your_api_key
OPENWEATHER_API_KEY=your_api_key
NASA_API_KEY=your_api_key

# Email (Development - use Mailtrap or similar)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
SMTP_FROM=noreply@hydrowatch.local

# SMS (Development - use Twilio sandbox)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

#### Staging (.env.staging)

```bash
# Application
NODE_ENV=staging
PORT=3000
API_URL=https://staging-api.hydrowatch.com

# Database
DATABASE_URL=postgresql://user:password@staging-db.hydrowatch.com:5432/hydrowatch_staging

# Redis
REDIS_URL=redis://staging-redis.hydrowatch.com:6379

# JWT (Use strong secrets)
JWT_SECRET=<generate_strong_secret>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<generate_strong_secret>
JWT_REFRESH_EXPIRES_IN=7d

# External APIs (Use test/staging keys)
INDIA_WRIS_API_KEY=staging_api_key
IMD_API_KEY=staging_api_key
OPENWEATHER_API_KEY=staging_api_key

# Email (Staging SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@hydrowatch.com

# SMS (Staging Twilio)
TWILIO_ACCOUNT_SID=staging_account_sid
TWILIO_AUTH_TOKEN=staging_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend
NEXT_PUBLIC_API_URL=https://staging-api.hydrowatch.com/api/v1
NEXT_PUBLIC_WS_URL=wss://staging-api.hydrowatch.com
```

#### Production (.env.production)

```bash
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.hydrowatch.com

# Database (Use connection pooling)
DATABASE_URL=postgresql://user:password@prod-db.hydrowatch.com:5432/hydrowatch_prod?pool_timeout=20

# Redis (Use cluster if needed)
REDIS_URL=redis://prod-redis.hydrowatch.com:6379

# JWT (Generate strong secrets, rotate regularly)
JWT_SECRET=<generate_strong_secret_256_bits>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<generate_strong_secret_256_bits>
JWT_REFRESH_EXPIRES_IN=7d

# External APIs (Production keys)
INDIA_WRIS_API_KEY=production_api_key
IMD_API_KEY=production_api_key
OPENWEATHER_API_KEY=production_api_key
NASA_API_KEY=production_api_key

# Email (Production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=production_sendgrid_api_key
SMTP_FROM=noreply@hydrowatch.com

# SMS (Production Twilio)
TWILIO_ACCOUNT_SID=production_account_sid
TWILIO_AUTH_TOKEN=production_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend
NEXT_PUBLIC_API_URL=https://api.hydrowatch.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.hydrowatch.com

# Monitoring
SENTRY_DSN=your_sentry_dsn
PROMETHEUS_ENABLED=true
```

---

## Docker Configuration

### Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_USER: hydrowatch
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: hydrowatch_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hydrowatch"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://hydrowatch:dev_password@postgres:5432/hydrowatch_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    networks:
      - hydrowatch-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - backend
    networks:
      - hydrowatch-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - hydrowatch-network

networks:
  hydrowatch-network:
    driver: bridge
```

---

## Database Setup

### Initial Setup

```bash
# 1. Connect to database
psql -h localhost -U hydrowatch -d hydrowatch_dev

# 2. Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

# 3. Run Prisma migrations
cd backend
npx prisma migrate deploy

# 4. Run database seeds (optional)
npx prisma db seed
```

### Migration Strategy

```bash
# Development: Create migration
npx prisma migrate dev --name add_river_levels

# Staging/Production: Apply migrations
npx prisma migrate deploy

# Rollback (if needed)
npx prisma migrate resolve --rolled-back <migration_name>
```

### Database Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Restore
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < "$BACKUP_DIR/backup_$DATE.sql"
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - main
      - develop

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t hydrowatch-backend ./backend
          docker build -t hydrowatch-frontend ./frontend

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          # (SSH to server, pull images, restart services)

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy to production environment
          # (SSH to server, pull images, restart services)
```

---

## Nginx Configuration

### Nginx Config

```nginx
# nginx/nginx.conf
upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name api.hydrowatch.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.hydrowatch.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;

    location / {
        limit_req zone=api_limit burst=20;
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name hydrowatch.com www.hydrowatch.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hydrowatch.com www.hydrowatch.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Deployment Steps

### Development Deployment

```bash
# 1. Clone repository
git clone https://github.com/your-org/hydrowatch-platform.git
cd hydrowatch-platform

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start Docker services
docker-compose up -d

# 4. Run database migrations
cd backend
npx prisma migrate dev

# 5. Seed database (optional)
npx prisma db seed

# 6. Start development servers
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

### Staging Deployment

```bash
# 1. Build Docker images
docker-compose -f docker-compose.prod.yml build

# 2. Push images to registry
docker tag hydrowatch-backend registry.hydrowatch.com/backend:staging
docker push registry.hydrowatch.com/backend:staging

# 3. Deploy to staging server
ssh staging-server
cd /app/hydrowatch-platform
git pull origin develop
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 5. Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Production Deployment

```bash
# 1. Create release branch
git checkout -b release/v1.0.0
git push origin release/v1.0.0

# 2. Run tests
npm run test

# 3. Build production images
docker-compose -f docker-compose.prod.yml build

# 4. Tag and push images
docker tag hydrowatch-backend registry.hydrowatch.com/backend:v1.0.0
docker push registry.hydrowatch.com/backend:v1.0.0

# 5. Deploy to production (with zero downtime)
ssh production-server
cd /app/hydrowatch-platform

# Backup database
./scripts/backup.sh

# Pull latest code
git pull origin main

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Run migrations (with backup)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Rolling update
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend
docker-compose -f docker-compose.prod.yml up -d --no-deps --build frontend

# Health check
curl https://api.hydrowatch.com/health

# 6. Monitor deployment
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Health Checks

### Health Check Endpoint

```typescript
// backend/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();

    const status = dbStatus && redisStatus ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus ? 'up' : 'down',
        redis: redisStatus ? 'up' : 'down',
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}
```

### Docker Health Checks

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']

  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']
```

### Grafana Dashboards

- API response times
- Error rates
- Database query performance
- Redis cache hit rates
- WebSocket connections
- Job queue length

---

## Rollback Procedure

### Database Rollback

```bash
# 1. Identify migration to rollback
npx prisma migrate status

# 2. Rollback migration
npx prisma migrate resolve --rolled-back <migration_name>

# 3. Restore from backup if needed
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
```

### Application Rollback

```bash
# 1. Tag previous version
docker tag registry.hydrowatch.com/backend:v1.0.0 registry.hydrowatch.com/backend:previous

# 2. Deploy previous version
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# 3. Verify health
curl https://api.hydrowatch.com/health
```

---

## Security Checklist

- [ ] Environment variables encrypted
- [ ] SSL/TLS certificates configured
- [ ] Database credentials secure
- [ ] API keys stored securely
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Security headers set (HSTS, CSP)
- [ ] Regular security updates
- [ ] Firewall rules configured
- [ ] Backup encryption enabled

---

## Post-Deployment Verification

### Checklist

- [ ] Health check endpoint responding
- [ ] Database connections working
- [ ] Redis connections working
- [ ] External API integrations working
- [ ] WebSocket connections working
- [ ] Frontend loading correctly
- [ ] Authentication working
- [ ] Real-time updates working
- [ ] Alerts triggering correctly
- [ ] Notifications sending
- [ ] Monitoring dashboards active

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-21  
**Author**: Development Team

