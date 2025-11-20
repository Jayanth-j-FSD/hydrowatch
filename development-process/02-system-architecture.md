# System Architecture: HydroWatch Platform

## Architecture Overview

HydroWatch follows a **modern, scalable, microservices-inspired architecture** with clear separation between frontend, backend, and data layers. The system is designed for high availability, real-time data processing, and horizontal scalability.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (React/Next.js)  │  Mobile Browser (Responsive)    │
│  - SSR/SSG Pages              │  - Touch-optimized UI           │
│  - Real-time WebSocket Client │  - Offline caching             │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS / WSS
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                      API GATEWAY / CDN                          │
│  - Nginx Reverse Proxy                                          │
│  - Rate Limiting                                                │
│  - SSL Termination                                               │
│  - Static Asset CDN                                             │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                      FRONTEND SERVER                            │
│  Next.js 14 (App Router)                                        │
│  - SSR/SSG Rendering                                             │
│  - API Routes (BFF Pattern)                                     │
│  - Static Asset Serving                                          │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTP/REST + WebSocket
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                      BACKEND SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│  NestJS Application (Monolithic with Modular Structure)         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ River Module │  │  Dams Module │  │Groundwater   │          │
│  └──────────────┘  └──────────────┘  │  Module      │          │
│  ┌──────────────┐  ┌──────────────┐  └──────────────┘          │
│  │Rainfall      │  │ Alert Module │  ┌──────────────┐          │
│  │  Module      │  └──────────────┘  │Notification  │          │
│  └──────────────┘                     │  Service     │          │
│                                       └──────────────┘          │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         WebSocket Gateway (Socket.io)                │      │
│  └──────────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Job Queue (BullMQ)                           │      │
│  │  - Scheduled Data Sync                               │      │
│  │  - Report Generation                                 │      │
│  └──────────────────────────────────────────────────────┘      │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │  TimescaleDB │  │    Redis     │          │
│  │  (Relational)│  │ (Time-Series)│  │  (Cache/Queue)│          │
│  │              │  │              │  │              │          │
│  │ - Users      │  │ - River Data │  │ - API Cache  │          │
│  │ - Alerts     │  │ - Rainfall   │  │ - Sessions   │          │
│  │ - Settings   │  │ - Groundwater│  │ - Real-time  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│  India-WRIS │ IMD │ OpenWeatherMap │ NASA │ USGS │ Others        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Frontend Architecture

#### Next.js App Router Structure

```
/frontend/src/app
├── layout.tsx                    # Root layout
├── page.tsx                      # Homepage
├── /river-tracker
│   ├── page.tsx                  # River tracking dashboard
│   ├── /[stationId]
│   │   └── page.tsx              # Station details
│   └── layout.tsx
├── /dams-dashboard
│   ├── page.tsx                  # Dams overview
│   └── /[damId]
│       └── page.tsx              # Dam details
├── /groundwater
│   ├── page.tsx                  # Groundwater dashboard
│   └── /[regionId]
│       └── page.tsx              # Regional data
├── /rainfall-forecast
│   ├── page.tsx                  # Rainfall dashboard
│   └── /[locationId]
│       └── page.tsx              # Location forecast
└── /api                          # API routes (BFF)
    ├── /data
    │   └── route.ts              # Data aggregation
    └── /export
        └── route.ts              # Export endpoints
```

#### Frontend Component Hierarchy

```
App
├── Layout
│   ├── Header (Navigation)
│   ├── Sidebar (Optional)
│   └── Footer
├── ThemeProvider (Dark/Light Mode)
├── QueryClientProvider (React Query)
├── Routes
│   ├── RiverTracker
│   │   ├── MapView
│   │   ├── StationList
│   │   ├── LevelChart
│   │   └── AlertPanel
│   ├── DamsDashboard
│   │   ├── CapacityChart
│   │   ├── InflowOutflowChart
│   │   └── PowerGenerationStats
│   ├── GroundwaterVisualizer
│   │   ├── DepthChart
│   │   ├── QualityIndicators
│   │   └── Heatmap
│   └── RainfallForecast
│       ├── ForecastChart
│       ├── HistoricalPatterns
│       └── RiskIndicators
└── Common Components
    ├── AlertNotification
    ├── DataExport
    └── LoadingSkeleton
```

#### State Management Strategy

- **Server State**: TanStack Query (React Query)
  - API data fetching
  - Caching and invalidation
  - Background refetching

- **Client State**: Zustand
  - UI state (modals, filters, theme)
  - User preferences
  - Temporary form data

- **URL State**: Next.js Router
  - Filters and search params
  - Pagination
  - Deep linking

---

### 2. Backend Architecture

#### NestJS Modular Structure

```
/backend/src
├── main.ts                        # Application entry
├── app.module.ts                  # Root module
├── /modules
│   ├── /river
│   │   ├── river.module.ts
│   │   ├── river.controller.ts
│   │   ├── river.service.ts
│   │   ├── river.repository.ts
│   │   └── dto/
│   ├── /dams
│   │   ├── dams.module.ts
│   │   ├── dams.controller.ts
│   │   ├── dams.service.ts
│   │   └── dams.repository.ts
│   ├── /groundwater
│   ├── /rainfall
│   ├── /alerts
│   └── /notifications
├── /common
│   ├── /decorators
│   ├── /guards
│   ├── /interceptors
│   ├── /pipes
│   ├── /filters
│   └── /interfaces
├── /config
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── external-apis.config.ts
├── /database
│   ├── /migrations
│   ├── /seeds
│   └── schema.prisma
├── /jobs
│   ├── data-sync.job.ts
│   └── report-generation.job.ts
└── /websockets
    └── data-updates.gateway.ts
```

#### Request Flow

```
Client Request
    │
    ▼
Nginx (Rate Limiting, SSL)
    │
    ▼
Next.js API Route (BFF) [Optional]
    │
    ▼
NestJS Controller
    │
    ▼
Guard (Auth, Rate Limit)
    │
    ▼
Validation Pipe (Zod/DTO)
    │
    ▼
Service Layer
    │
    ├──► Repository (Database)
    ├──► External API Client
    ├──► Redis Cache (Check)
    └──► WebSocket Broadcast
    │
    ▼
Response Interceptor
    │
    ▼
Client Response
```

---

### 3. Data Flow Architecture

#### Real-Time Data Synchronization Flow

```
External API (India-WRIS, IMD, etc.)
    │
    ▼
Scheduled Job (BullMQ - Every 15 min)
    │
    ▼
API Integration Service
    │
    ├──► Data Validation (Zod)
    ├──► Data Transformation
    └──► Error Handling & Retry
    │
    ▼
Repository Layer
    │
    ├──► PostgreSQL (Relational Data)
    ├──► TimescaleDB (Time-Series Data)
    └──► Redis (Cache + Real-time Store)
    │
    ▼
WebSocket Gateway
    │
    ▼
Frontend (Real-time Updates)
```

#### Data Fetching Flow (Frontend)

```
User Action / Page Load
    │
    ▼
React Query Hook
    │
    ├──► Check Cache (React Query)
    │   └──► Return Cached Data (if valid)
    │
    └──► API Request
        │
        ▼
    Next.js API Route / Direct Backend
        │
        ▼
    Backend Service
        │
        ├──► Check Redis Cache
        │   └──► Return Cached (if exists)
        │
        └──► Database Query
            │
            ├──► PostgreSQL (Relational)
            └──► TimescaleDB (Time-Series)
            │
            ▼
        Store in Redis Cache
            │
            ▼
    Return to Frontend
        │
        ▼
    React Query Cache
        │
        ▼
    UI Update
```

---

### 4. Database Architecture

#### PostgreSQL (Relational Data)

**Tables:**
- `users` - User accounts and preferences
- `alerts` - Alert configurations and history
- `stations` - River monitoring stations
- `dams` - Dam/reservoir information
- `groundwater_wells` - Groundwater monitoring wells
- `rainfall_stations` - Rainfall monitoring stations
- `notifications` - Notification records
- `reports` - Generated report metadata

#### TimescaleDB (Time-Series Data)

**Hypertables:**
- `river_levels` - River water level measurements
- `dam_capacity` - Reservoir capacity over time
- `groundwater_depth` - Groundwater depth measurements
- `rainfall_data` - Daily/monthly rainfall records
- `water_quality` - Water quality parameters over time

**Benefits:**
- Automatic data partitioning by time
- Efficient time-based queries
- Compression for historical data
- Continuous aggregates for analytics

#### Redis (Caching & Real-Time)

**Cache Keys:**
- `api:river:levels:{stationId}` - Cached river levels
- `api:dams:status:{damId}` - Cached dam status
- `api:rainfall:forecast:{locationId}` - Cached forecasts
- `session:{userId}` - User sessions
- `rate-limit:{ip}` - Rate limiting counters

**Pub/Sub Channels:**
- `data:river:updates` - River data updates
- `data:dams:updates` - Dam data updates
- `alerts:critical` - Critical alerts broadcast

---

### 5. WebSocket Architecture

#### Real-Time Update Flow

```
Backend Data Update
    │
    ▼
Service Layer
    │
    ▼
WebSocket Gateway (Socket.io)
    │
    ├──► Emit to Room (e.g., 'river:station:123')
    ├──► Emit to All Connected Clients
    └──► Store in Redis Pub/Sub
    │
    ▼
Frontend Socket Client
    │
    ├──► Join Room (on page load)
    ├──► Listen for Updates
    └──► Update React Query Cache
    │
    ▼
UI Re-render (Optimistic Update)
```

#### Socket.io Rooms Structure

- `river:station:{stationId}` - Station-specific updates
- `dam:{damId}` - Dam-specific updates
- `region:{regionId}` - Regional updates
- `alerts:all` - All alerts
- `alerts:critical` - Critical alerts only

---

### 6. Job Queue Architecture

#### BullMQ Job Types

1. **Data Synchronization Jobs**
   - `sync-river-data` - Every 15 minutes
   - `sync-dam-data` - Every 15 minutes
   - `sync-groundwater-data` - Every 1 hour
   - `sync-rainfall-data` - Every 15 minutes

2. **Report Generation Jobs**
   - `generate-pdf-report` - On-demand or scheduled
   - `generate-csv-export` - On-demand

3. **Notification Jobs**
   - `send-email-alert` - Immediate
   - `send-sms-alert` - Immediate
   - `send-push-notification` - Immediate

#### Job Processing Flow

```
Scheduler (node-cron / BullMQ)
    │
    ▼
Create Job (BullMQ Queue)
    │
    ▼
Worker Process
    │
    ├──► Retry Logic (Exponential Backoff)
    ├──► Error Handling
    └──► Progress Tracking
    │
    ▼
Job Completion
    │
    ├──► Update Database
    ├──► Invalidate Cache
    └──► Emit WebSocket Event
```

---

### 7. Security Architecture

#### Authentication & Authorization

```
Request
    │
    ▼
JWT Guard (NestJS)
    │
    ├──► Verify Token
    ├──► Extract User Info
    └──► Check Permissions
    │
    ▼
Role-Based Access Control (RBAC)
    │
    ├──► Admin - Full access
    ├──► Analyst - Read + Export
    └──► Viewer - Read only
```

#### Security Layers

1. **Network Layer**
   - HTTPS only (TLS 1.3)
   - CORS configuration
   - Rate limiting (Nginx + NestJS)

2. **Application Layer**
   - Input validation (Zod)
   - SQL injection prevention (Prisma)
   - XSS protection (Content Security Policy)
   - CSRF protection

3. **Data Layer**
   - Encrypted environment variables
   - Database connection encryption
   - Sensitive data encryption at rest

---

### 8. Monitoring & Observability

#### Metrics Collection

```
Application
    │
    ├──► Prometheus Metrics
    │   ├── HTTP Request Duration
    │   ├── Error Rate
    │   ├── Active Connections
    │   └── Job Queue Length
    │
    └──► Custom Metrics
        ├── API Response Times
        ├── Cache Hit Rate
        └── External API Success Rate
    │
    ▼
Grafana Dashboards
```

#### Logging Strategy

- **Structured Logging** (Winston)
  - Request/Response logs
  - Error logs with stack traces
  - Business event logs
  - Performance logs

- **Log Levels**
  - ERROR: Critical failures
  - WARN: Warning conditions
  - INFO: General information
  - DEBUG: Detailed debugging

---

### 9. Deployment Architecture

#### Production Environment

```
Internet
    │
    ▼
Load Balancer (Nginx / Cloud Load Balancer)
    │
    ├──► Frontend (Next.js) - Multiple Instances
    └──► Backend (NestJS) - Multiple Instances
    │
    ├──► PostgreSQL (Primary + Replicas)
    ├──► TimescaleDB (Primary + Replicas)
    └──► Redis Cluster
```

#### Container Architecture

```
Docker Compose / Kubernetes
├── frontend-service (Next.js)
├── backend-service (NestJS)
├── postgres-service (PostgreSQL + TimescaleDB)
├── redis-service (Redis)
├── nginx-service (Reverse Proxy)
└── prometheus-service (Monitoring)
```

---

## Scalability Considerations

### Horizontal Scaling

- **Stateless Backend**: All instances share Redis for sessions
- **Database Read Replicas**: Distribute read queries
- **CDN**: Static assets and API responses caching
- **Load Balancing**: Distribute traffic across instances

### Vertical Scaling

- **Database Optimization**: Proper indexing, query optimization
- **Caching Strategy**: Multi-layer caching (Redis, React Query)
- **Time-Series Optimization**: TimescaleDB compression and aggregates

---

## Technology Decisions

### Why NestJS?
- Modular architecture
- Built-in dependency injection
- TypeScript-first
- Excellent for large-scale applications

### Why Next.js App Router?
- Server Components for performance
- Built-in API routes
- Excellent SEO support
- Modern React features

### Why TimescaleDB?
- Optimized for time-series data
- Automatic partitioning
- Compression for historical data
- PostgreSQL compatibility

### Why BullMQ?
- Redis-based (reliable)
- Job prioritization
- Retry mechanisms
- Progress tracking

---

## Architecture Diagrams (Text-Based)

### Sequence Diagram: Real-Time Data Update

```
External API → Scheduled Job → Service → Database → Redis → WebSocket → Frontend
     │              │            │          │         │         │          │
     └──────────────┴────────────┴──────────┴─────────┴─────────┴──────────┘
```

### Component Interaction

```
Frontend Component
    │
    ├──► React Query Hook
    │       │
    │       └──► API Client
    │               │
    │               └──► Backend Controller
    │                       │
    │                       └──► Service
    │                               │
    │                               ├──► Repository → Database
    │                               └──► Cache → Redis
    │
    └──► WebSocket Client
            │
            └──► WebSocket Gateway
                    │
                    └──► Real-time Updates
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-21  
**Author**: Development Team

