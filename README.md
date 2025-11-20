# HydroWatch - Water & Climate Monitoring Platform

A comprehensive, real-time water and climate monitoring platform designed to track, analyze, and predict water resources across multiple dimensions.

## 🚀 Features

- **Real-time River Water Level Tracker** - Multi-location monitoring with flood risk alerts
- **Comprehensive Dams Status Dashboard** - Reservoir capacity, inflow/outflow, power generation
- **Groundwater Data Visualizer** - Depth measurements, quality indicators, regional heatmaps
- **Rainfall Prediction Dashboard** - 7-day forecasts, historical patterns, risk indicators
- **Alert Notification System** - SMS/Email/Push notifications for critical events
- **Data Export and Reporting** - PDF reports, CSV exports, comparative analytics

## 🛠️ Tech Stack

### Frontend
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- TailwindCSS
- Shadcn/ui
- Recharts
- Leaflet/Mapbox

### Backend
- NestJS 10+
- TypeScript
- PostgreSQL 15+ with TimescaleDB
- Prisma ORM
- Redis
- BullMQ
- Socket.io

## 📋 Prerequisites

- Node.js 20+ LTS
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd hydrowatch-platform
```

### 2. Set up environment variables

```bash
# Copy example environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 3. Start Docker services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL with TimescaleDB (port 5432)
- Redis (port 6379)

### 4. Set up database

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 6. Run development servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📁 Project Structure

```
hydrowatch-platform/
├── frontend/          # Next.js application
├── backend/           # NestJS application
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── docker-compose.yml # Docker configuration
└── README.md
```

## 📚 Documentation

See the `development-process/` folder for comprehensive documentation:
- Project Overview
- System Architecture
- Module Breakdown
- API Design
- Database Schema
- Development Plan
- Coding Standards
- Testing Strategy
- Deployment Guide
- Maintenance Guide

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

See `development-process/09-deployment-guide.md` for detailed deployment instructions.

## 📝 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

