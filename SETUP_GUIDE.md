# HydroWatch Platform - Setup Guide

## ✅ Phase 0 Setup Complete!

The initial project structure has been created. Follow these steps to complete the setup:

## 📋 Next Steps

### 1. Set Up Environment Variables

**Backend (.env):**
```bash
cd backend
# Copy the example file (you'll need to create .env manually)
# Use the values from .env.example as reference
```

Create `backend/.env` with:
```env
DATABASE_URL=postgresql://hydrowatch:dev_password@localhost:5432/hydrowatch_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_development_secret_key_min_32_characters_long
JWT_REFRESH_SECRET=your_refresh_secret_min_32_characters_long
```

**Frontend (.env.local):**
```bash
cd frontend
# Create .env.local file
```

Create `frontend/.env.local` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 2. Start Docker Services

```bash
# From project root
docker-compose up -d
```

This will start:
- PostgreSQL with TimescaleDB on port 5432
- Redis on port 6379

### 3. Set Up Database

```bash
cd backend

# Enable TimescaleDB extension (connect to database first)
# You can use: psql -h localhost -U hydrowatch -d hydrowatch_dev
# Then run: CREATE EXTENSION IF NOT EXISTS timescaledb;

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 4. Install Additional Dependencies

**Backend:**
```bash
cd backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install class-validator class-transformer zod
npm install axios @nestjs/bullmq bullmq
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install winston
npm install -D @types/passport-jwt @types/bcrypt @types/node-cron
```

**Frontend:**
```bash
cd frontend
npm install @tanstack/react-query zustand date-fns
npm install recharts leaflet react-leaflet
npm install i18next react-i18next
npx shadcn-ui@latest init
```

### 5. Update Backend Port

Update `backend/src/main.ts` to use port 3001:

```typescript
await app.listen(3001);
```

### 6. Test the Setup

**Start Backend:**
```bash
cd backend
npm run start:dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
hydrowatch-platform/
├── frontend/              # Next.js 14 application
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   └── lib/               # Utilities and API clients
├── backend/               # NestJS application
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── common/        # Shared utilities
│   │   └── main.ts        # Application entry
│   └── prisma/            # Database schema
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── development-process/   # Development documentation
├── docker-compose.yml     # Docker configuration
└── README.md             # Project README
```

## 🚀 Development Workflow

1. **Start Docker services**: `docker-compose up -d`
2. **Run backend**: `cd backend && npm run start:dev`
3. **Run frontend**: `cd frontend && npm run dev`
4. **Access**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📚 Documentation

All development documentation is in the `development-process/` folder:

- `01-project-overview.md` - Project overview and requirements
- `02-system-architecture.md` - System architecture
- `03-module-breakdown.md` - Module details
- `04-api-design.md` - API endpoints
- `05-database-schema.md` - Database schema
- `06-development-plan.md` - Development phases
- `07-coding-standards.md` - Coding conventions
- `08-testing-strategy.md` - Testing approach
- `09-deployment-guide.md` - Deployment instructions
- `10-maintenance-guide.md` - Maintenance procedures

## 🎯 Next Phase: Backend Foundation

Once setup is complete, proceed to **Phase 1: Backend Foundation** (Week 3-5):

1. Create authentication module
2. Set up base API structure
3. Implement error handling
4. Create health check endpoint

See `development-process/06-development-plan.md` for detailed steps.

## ⚠️ Important Notes

- Make sure Docker is running before starting services
- Database migrations must be run before starting the backend
- Environment variables must be set for both frontend and backend
- TimescaleDB extension must be enabled in PostgreSQL

## 🐛 Troubleshooting

**Docker issues:**
```bash
# Check if containers are running
docker ps

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

**Database connection issues:**
- Verify DATABASE_URL in backend/.env
- Check if PostgreSQL container is running
- Ensure TimescaleDB extension is enabled

**Port conflicts:**
- Backend uses port 3001 (change in main.ts if needed)
- Frontend uses port 3000
- PostgreSQL uses port 5432
- Redis uses port 6379

