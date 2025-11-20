# Module Breakdown: HydroWatch Platform

This document provides a detailed breakdown of all modules in the HydroWatch platform, their purposes, inputs/outputs, dependencies, and integration points.

---

## Module Overview

The application is divided into **6 core modules** plus **shared/common modules**:

1. **River Tracker Module**
2. **Dams Dashboard Module**
3. **Groundwater Visualizer Module**
4. **Rainfall Forecast Module**
5. **Alert System Module**
6. **Notification Service Module**

**Shared Modules:**
- Data Integration Service
- Authentication & Authorization
- Export & Reporting
- WebSocket Gateway
- Job Queue Manager

---

## 1. River Tracker Module

### Purpose
Monitor real-time river water levels across multiple stations, provide historical data analysis, and generate flood risk alerts.

### Components

#### Frontend Components
- `RiverTrackerPage` - Main dashboard page
- `StationMap` - Interactive map with station markers
- `StationList` - List view with filters
- `LevelChart` - Historical level visualization
- `FloodRiskIndicator` - Visual risk status
- `StationDetailView` - Individual station details

#### Backend Services
- `RiverController` - REST API endpoints
- `RiverService` - Business logic
- `RiverRepository` - Data access layer
- `RiverDataSyncJob` - Scheduled data synchronization

### Inputs
- **External APIs**: India-WRIS, USGS Water Services
- **User Inputs**: Station selection, date range filters, location search
- **WebSocket**: Real-time level updates

### Outputs
- **API Responses**: Station data, level history, flood risk status
- **WebSocket Events**: `river:level:update`, `river:alert:triggered`
- **UI Updates**: Charts, maps, alert notifications

### Data Models
```typescript
interface RiverStation {
  id: string;
  name: string;
  riverName: string;
  location: { lat: number; lng: number };
  dangerLevel: number;
  floodLevel: number;
  currentLevel?: number;
  lastUpdated?: Date;
}

interface RiverLevelData {
  stationId: string;
  level: number;
  timestamp: Date;
  status: 'safe' | 'warning' | 'danger' | 'critical';
}
```

### Dependencies
- **External**: India-WRIS API, USGS API
- **Internal**: Alert System (for flood alerts), Notification Service
- **Database**: `stations` table, `river_levels` hypertable (TimescaleDB)
- **Cache**: Redis for station metadata and recent levels

### API Endpoints
- `GET /api/v1/river/stations` - List all stations
- `GET /api/v1/river/stations/:id` - Station details
- `GET /api/v1/river/stations/:id/levels` - Historical levels
- `GET /api/v1/river/stations/:id/current` - Current level
- `GET /api/v1/river/alerts` - Active flood alerts

### Integration Points
- **Alert System**: Triggers alerts when levels exceed thresholds
- **Notification Service**: Sends alerts via SMS/Email/Push
- **Export Service**: Generates PDF/CSV reports

---

## 2. Dams Dashboard Module

### Purpose
Monitor reservoir capacity, inflow/outflow rates, power generation, and provide overflow alerts for dams and reservoirs.

### Components

#### Frontend Components
- `DamsDashboardPage` - Main dashboard
- `CapacityChart` - Reservoir capacity visualization
- `InflowOutflowChart` - Flow rate charts
- `PowerGenerationStats` - Power generation metrics
- `DamStatusCard` - Individual dam status cards
- `DamDetailView` - Detailed dam information

#### Backend Services
- `DamsController` - REST API endpoints
- `DamsService` - Business logic
- `DamsRepository` - Data access layer
- `DamsDataSyncJob` - Scheduled data synchronization

### Inputs
- **External APIs**: India-WRIS, Central Water Commission (CWC)
- **User Inputs**: Dam selection, date range, metric filters
- **WebSocket**: Real-time capacity updates

### Outputs
- **API Responses**: Dam status, capacity history, flow rates, power stats
- **WebSocket Events**: `dam:capacity:update`, `dam:overflow:alert`
- **UI Updates**: Capacity charts, status indicators, alerts

### Data Models
```typescript
interface Dam {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  totalCapacity: number; // in million cubic meters
  currentStorage?: number;
  inflowRate?: number; // cubic meters per second
  outflowRate?: number;
  powerGeneration?: number; // MW
  status: 'normal' | 'warning' | 'critical' | 'overflow';
  lastUpdated?: Date;
}

interface DamCapacityData {
  damId: string;
  storage: number;
  capacity: number;
  percentage: number;
  timestamp: Date;
}
```

### Dependencies
- **External**: India-WRIS, CWC APIs
- **Internal**: Alert System (for overflow alerts)
- **Database**: `dams` table, `dam_capacity` hypertable (TimescaleDB)
- **Cache**: Redis for dam metadata and recent capacity data

### API Endpoints
- `GET /api/v1/dams` - List all dams
- `GET /api/v1/dams/:id` - Dam details
- `GET /api/v1/dams/:id/capacity` - Capacity history
- `GET /api/v1/dams/:id/flow` - Inflow/outflow history
- `GET /api/v1/dams/:id/power` - Power generation history
- `GET /api/v1/dams/alerts` - Active overflow alerts

### Integration Points
- **Alert System**: Triggers alerts for overflow conditions
- **Notification Service**: Sends critical alerts
- **Export Service**: Generates dam status reports

---

## 3. Groundwater Visualizer Module

### Purpose
Visualize groundwater depth measurements, water quality indicators, depletion trends, and regional heatmaps.

### Components

#### Frontend Components
- `GroundwaterDashboard` - Main dashboard
- `DepthChart` - Depth over time visualization
- `QualityIndicators` - TDS, pH, contamination levels
- `RegionalHeatmap` - Geographic heatmap
- `DepletionTrendChart` - Long-term trend analysis
- `WellDetailView` - Individual well details

#### Backend Services
- `GroundwaterController` - REST API endpoints
- `GroundwaterService` - Business logic
- `GroundwaterRepository` - Data access layer
- `GroundwaterDataSyncJob` - Scheduled data synchronization

### Inputs
- **External APIs**: India-WRIS, State groundwater departments
- **User Inputs**: Region selection, well filters, quality parameters
- **WebSocket**: Real-time depth updates

### Outputs
- **API Responses**: Well data, depth history, quality metrics, regional aggregates
- **WebSocket Events**: `groundwater:depth:update`, `groundwater:quality:update`
- **UI Updates**: Charts, heatmaps, quality indicators

### Data Models
```typescript
interface GroundwaterWell {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  region: string;
  aquiferType: string;
  depthToWater?: number; // meters
  quality?: {
    tds: number; // Total Dissolved Solids (mg/L)
    ph: number;
    arsenic?: number;
    fluoride?: number;
  };
  lastUpdated?: Date;
}

interface GroundwaterDepthData {
  wellId: string;
  depth: number;
  timestamp: Date;
  season: 'pre-monsoon' | 'monsoon' | 'post-monsoon';
}
```

### Dependencies
- **External**: India-WRIS, State government APIs
- **Internal**: Export Service (for regional reports)
- **Database**: `groundwater_wells` table, `groundwater_depth` hypertable (TimescaleDB)
- **Cache**: Redis for well metadata and regional aggregates

### API Endpoints
- `GET /api/v1/groundwater/wells` - List all wells
- `GET /api/v1/groundwater/wells/:id` - Well details
- `GET /api/v1/groundwater/wells/:id/depth` - Depth history
- `GET /api/v1/groundwater/wells/:id/quality` - Quality history
- `GET /api/v1/groundwater/regions/:regionId` - Regional data
- `GET /api/v1/groundwater/heatmap` - Heatmap data

### Integration Points
- **Export Service**: Generates regional groundwater reports
- **Alert System**: Triggers alerts for critical depletion

---

## 4. Rainfall Forecast Module

### Purpose
Provide 7-day rainfall forecasts, historical rainfall patterns, seasonal analysis, and drought/flood probability indicators.

### Components

#### Frontend Components
- `RainfallForecastPage` - Main dashboard
- `ForecastChart` - 7-day forecast visualization
- `HistoricalPatternChart` - Historical rainfall patterns
- `SeasonalAnalysisChart` - Seasonal comparison
- `RiskIndicators` - Drought/flood probability
- `LocationForecastView` - Location-specific forecast

#### Backend Services
- `RainfallController` - REST API endpoints
- `RainfallService` - Business logic
- `RainfallRepository` - Data access layer
- `RainfallDataSyncJob` - Scheduled data synchronization

### Inputs
- **External APIs**: IMD, OpenWeatherMap, NASA IMERG
- **User Inputs**: Location selection, date range, forecast type
- **WebSocket**: Real-time forecast updates

### Outputs
- **API Responses**: Forecast data, historical patterns, risk indicators
- **WebSocket Events**: `rainfall:forecast:update`, `rainfall:alert:triggered`
- **UI Updates**: Forecast charts, risk indicators, alerts

### Data Models
```typescript
interface RainfallStation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  region: string;
  elevation?: number;
}

interface RainfallForecast {
  stationId: string;
  date: Date;
  predictedRainfall: number; // mm
  confidence: number; // 0-100
  intensity: 'light' | 'moderate' | 'heavy' | 'extreme';
}

interface RainfallData {
  stationId: string;
  date: Date;
  rainfall: number; // mm
  season: 'summer' | 'monsoon' | 'winter';
}
```

### Dependencies
- **External**: IMD, OpenWeatherMap, NASA APIs
- **Internal**: Alert System (for flood/drought alerts)
- **Database**: `rainfall_stations` table, `rainfall_data` hypertable (TimescaleDB)
- **Cache**: Redis for forecast data and historical aggregates

### API Endpoints
- `GET /api/v1/rainfall/stations` - List all stations
- `GET /api/v1/rainfall/stations/:id/forecast` - 7-day forecast
- `GET /api/v1/rainfall/stations/:id/history` - Historical data
- `GET /api/v1/rainfall/stations/:id/seasonal` - Seasonal analysis
- `GET /api/v1/rainfall/regions/:regionId` - Regional forecast
- `GET /api/v1/rainfall/risk-indicators` - Drought/flood risk

### Integration Points
- **Alert System**: Triggers alerts for extreme rainfall/flood risk
- **Notification Service**: Sends weather warnings
- **Export Service**: Generates rainfall reports

---

## 5. Alert System Module

### Purpose
Manage alert configurations, monitor threshold conditions, and trigger notifications for critical events.

### Components

#### Frontend Components
- `AlertsPage` - Alert management dashboard
- `AlertConfiguration` - User alert settings
- `AlertHistory` - Historical alerts
- `ThresholdSettings` - Custom threshold configuration
- `AlertCard` - Individual alert display

#### Backend Services
- `AlertsController` - REST API endpoints
- `AlertsService` - Business logic and threshold monitoring
- `AlertsRepository` - Data access layer
- `AlertEvaluationJob` - Continuous threshold evaluation

### Inputs
- **Module Data**: River levels, dam capacity, groundwater depth, rainfall
- **User Inputs**: Alert configuration, threshold settings
- **System Events**: Data updates from other modules

### Outputs
- **API Responses**: Alert configurations, alert history, active alerts
- **Notifications**: SMS, Email, Push notifications (via Notification Service)
- **WebSocket Events**: `alert:created`, `alert:resolved`

### Data Models
```typescript
interface AlertConfiguration {
  id: string;
  userId: string;
  type: 'river' | 'dam' | 'groundwater' | 'rainfall';
  entityId: string; // stationId, damId, etc.
  threshold: {
    operator: 'gt' | 'lt' | 'eq';
    value: number;
  };
  channels: ('sms' | 'email' | 'push')[];
  enabled: boolean;
}

interface Alert {
  id: string;
  configurationId: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledged: boolean;
}
```

### Dependencies
- **Internal**: All data modules (River, Dams, Groundwater, Rainfall)
- **Internal**: Notification Service
- **Database**: `alerts` table, `alert_configurations` table
- **Cache**: Redis for active alerts and threshold checks

### API Endpoints
- `GET /api/v1/alerts` - List all alerts
- `GET /api/v1/alerts/active` - Active alerts
- `GET /api/v1/alerts/configurations` - User alert configurations
- `POST /api/v1/alerts/configurations` - Create alert configuration
- `PUT /api/v1/alerts/configurations/:id` - Update configuration
- `DELETE /api/v1/alerts/configurations/:id` - Delete configuration
- `POST /api/v1/alerts/:id/acknowledge` - Acknowledge alert

### Integration Points
- **All Data Modules**: Receives data updates for threshold evaluation
- **Notification Service**: Sends notifications when alerts trigger
- **WebSocket Gateway**: Broadcasts alerts in real-time

---

## 6. Notification Service Module

### Purpose
Handle multi-channel notifications (SMS, Email, Push) with queuing, retry logic, and delivery tracking.

### Components

#### Frontend Components
- `NotificationSettings` - User notification preferences
- `NotificationHistory` - Delivery history

#### Backend Services
- `NotificationsController` - REST API endpoints
- `NotificationsService` - Business logic
- `EmailService` - Email delivery (SendGrid/SES)
- `SMSService` - SMS delivery (Twilio/AWS SNS)
- `PushService` - Web push notifications
- `NotificationQueue` - BullMQ job queue

### Inputs
- **Alert System**: Alert events requiring notifications
- **User Inputs**: Notification preferences, test notifications
- **System Events**: Scheduled notifications

### Outputs
- **Notifications**: SMS, Email, Push messages
- **API Responses**: Notification status, delivery history
- **WebSocket Events**: `notification:sent`, `notification:failed`

### Data Models
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'sms' | 'email' | 'push';
  channel: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  quietHours?: { start: string; end: string };
}
```

### Dependencies
- **External**: SendGrid/Twilio/AWS SNS (for delivery)
- **Internal**: Alert System
- **Database**: `notifications` table
- **Queue**: BullMQ for async processing

### API Endpoints
- `GET /api/v1/notifications` - Notification history
- `GET /api/v1/notifications/preferences` - User preferences
- `PUT /api/v1/notifications/preferences` - Update preferences
- `POST /api/v1/notifications/test` - Send test notification

### Integration Points
- **Alert System**: Receives alert events and sends notifications
- **Job Queue**: Processes notifications asynchronously

---

## Shared Modules

### 7. Data Integration Service

**Purpose**: Centralized service for integrating with external APIs.

**Components**:
- `APIClient` - HTTP client with retry logic
- `DataTransformer` - Transform external data to internal format
- `RateLimiter` - API rate limiting
- `CacheManager` - Caching layer

**Dependencies**: All external APIs (India-WRIS, IMD, OpenWeatherMap, etc.)

---

### 8. Authentication & Authorization

**Purpose**: User authentication and role-based access control.

**Components**:
- `AuthController` - Login/logout endpoints
- `AuthService` - JWT token management
- `AuthGuard` - Route protection
- `RolesGuard` - Role-based access

**Dependencies**: `users` table, JWT library

---

### 9. Export & Reporting Service

**Purpose**: Generate PDF reports and CSV exports.

**Components**:
- `ExportController` - Export endpoints
- `PDFGenerator` - PDF report generation
- `CSVGenerator` - CSV export
- `ReportTemplate` - Report templates

**Dependencies**: PDF library (Puppeteer/PDFKit), All data modules

---

### 10. WebSocket Gateway

**Purpose**: Real-time data broadcasting.

**Components**:
- `DataUpdatesGateway` - Socket.io gateway
- `RoomManager` - Room management
- `EventEmitter` - Event broadcasting

**Dependencies**: Socket.io, Redis Pub/Sub

---

### 11. Job Queue Manager

**Purpose**: Manage scheduled jobs and background tasks.

**Components**:
- `JobScheduler` - Job scheduling
- `JobWorker` - Job processing
- `JobMonitor` - Job status monitoring

**Dependencies**: BullMQ, Redis

---

## Module Dependencies Graph

```
River Module ──┐
Dams Module ───┤
Groundwater ───┼──► Alert System ──► Notification Service
Rainfall ──────┘
                │
                ▼
         Data Integration Service
                │
                ▼
         External APIs
```

---

## Module Communication Patterns

### 1. Synchronous (REST API)
- Frontend → Backend: HTTP requests
- Module → Module: Direct service calls

### 2. Asynchronous (Events)
- Module → Alert System: Event emission
- Alert System → Notification Service: Event emission
- Backend → Frontend: WebSocket events

### 3. Scheduled (Jobs)
- Data Integration → Modules: Scheduled data sync
- Alert System: Continuous threshold evaluation
- Export Service: Scheduled report generation

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-21  
**Author**: Development Team

