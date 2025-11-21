# Deployment Guide: HydroWatch Platform

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 15+ with TimescaleDB
- Redis 7+

### Development Setup

1. **Clone and setup environment**
```bash
git clone <repository-url>
cd hydrowatch-platform

# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your configuration
```

2. **Start Docker services**
```bash
docker-compose up -d
```

3. **Setup database**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

4. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

5. **Run development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Production Deployment

### Option 1: Docker Compose (Recommended)

1. **Prepare environment variables**
```bash
# Create .env.production file
cp .env.example .env.production
# Edit with production values
```

2. **Build and start**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

3. **Run migrations**
```bash
docker exec hydrowatch-backend-prod npx prisma migrate deploy
```

### Option 2: Manual Deployment

#### Backend
```bash
cd backend
npm install --production
npm run build
npm run start:prod
```

#### Frontend
```bash
cd frontend
npm install --production
npm run build
npm run start
```

---

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
JWT_SECRET=<strong_secret_32_chars_min>
JWT_REFRESH_SECRET=<strong_secret_32_chars_min>
FRONTEND_URL=https://your-domain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com
```

---

## Testing

### Backend Tests
```bash
cd backend
npm run test          # Unit tests
npm run test:cov      # With coverage
npm run test:e2e      # E2E tests
```

### Frontend Tests
```bash
cd frontend
npm run test          # Unit tests
npm run test:coverage # With coverage
npm run test:ui       # UI mode
```

---

## CI/CD

The project includes GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs backend tests with PostgreSQL & Redis
- Runs frontend tests and build
- Performs security audit
- Runs on push/PR to main/develop branches

---

## Monitoring

### Health Checks
- Backend: `GET /api/v1/health`
- Frontend: Built-in Next.js health

### Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Application logs
# Backend uses Winston logger
# Check logs/ directory or configured log destination
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Environment variables secured

---

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check network connectivity
- Verify credentials

### Redis Connection Issues
- Check REDIS_URL format
- Verify Redis is running
- Check authentication if password set

### Build Issues
- Clear node_modules and reinstall
- Check Node.js version (20+)
- Verify all environment variables set

---

## Support

For issues or questions:
- Check documentation in `development-process/` folder
- Review logs for error messages
- Check GitHub Issues

---

**Last Updated**: 2025-01-21

