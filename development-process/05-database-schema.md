# Database Schema: HydroWatch Platform

This document defines the complete database schema, including entity-relationship diagrams, table structures, indexes, constraints, and data retention policies.

---

## Database Overview

### Technology Stack
- **Primary Database**: PostgreSQL 15+
- **Time-Series Extension**: TimescaleDB 2+
- **ORM**: Prisma 5+
- **Cache**: Redis 7+

### Database Architecture

```
PostgreSQL (Relational Data)
├── Users & Authentication
├── Configuration & Settings
└── Metadata Tables

TimescaleDB (Time-Series Data)
├── River Levels
├── Dam Capacity
├── Groundwater Depth
├── Rainfall Data
└── Water Quality

Redis (Cache & Real-Time)
├── API Response Cache
├── Session Storage
└── Real-Time Data Store
```

---

## Entity-Relationship Diagram

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│ AlertConfigurations │
└─────────────────────┘

┌─────────────┐
│   Stations  │──────┐
└─────────────┘      │
                     │ 1:N
┌─────────────┐      │
│ RiverLevels │◄─────┘
└─────────────┘

┌─────────────┐
│    Dams     │──────┐
└─────────────┘      │
                     │ 1:N
┌─────────────┐      │
│DamCapacity  │◄─────┘
└─────────────┘

┌─────────────┐
│    Wells    │──────┐
└─────────────┘      │
                     │ 1:N
┌─────────────┐      │
│Groundwater  │◄─────┘
│   Depth     │
└─────────────┘

┌─────────────┐
│RainfallStns │──────┐
└─────────────┘      │
                     │ 1:N
┌─────────────┐      │
│ RainfallData│◄─────┘
└─────────────┘

┌─────────────┐
│   Alerts    │
└──────┬──────┘
       │
       │ N:1
       │
┌──────▼──────────────┐
│ AlertConfigurations │
└─────────────────────┘
```

---

## PostgreSQL Schema (Relational Data)

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    -- Roles: 'admin', 'analyst', 'viewer'
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Prisma Schema:**
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String
  role          String    @default("viewer") // admin, analyst, viewer
  emailVerified Boolean   @default(false) @map("email_verified")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  lastLogin     DateTime? @map("last_login")

  alertConfigurations AlertConfiguration[]
  notifications      Notification[]

  @@map("users")
}
```

---

### Stations Table (River Monitoring)

```sql
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    river_name VARCHAR(255) NOT NULL,
    location POINT NOT NULL,
    -- PostGIS: ST_Point(lng, lat)
    address TEXT,
    danger_level DECIMAL(10, 2) NOT NULL,
    flood_level DECIMAL(10, 2) NOT NULL,
    elevation DECIMAL(10, 2),
    basin VARCHAR(255),
    region VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(100) DEFAULT 'India',
    external_id VARCHAR(255),
    -- ID from external API (India-WRIS, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stations_river_name ON stations(river_name);
CREATE INDEX idx_stations_region ON stations(region);
CREATE INDEX idx_stations_location ON stations USING GIST(location);
CREATE INDEX idx_stations_external_id ON stations(external_id);
CREATE INDEX idx_stations_active ON stations(is_active);
```

**Prisma Schema:**
```prisma
model Station {
  id          String   @id @default(uuid())
  name        String
  riverName   String   @map("river_name")
  location    Json     // { lat: number, lng: number }
  address     String?
  dangerLevel Decimal  @map("danger_level") @db.Decimal(10, 2)
  floodLevel  Decimal  @map("flood_level") @db.Decimal(10, 2)
  elevation   Decimal? @db.Decimal(10, 2)
  basin       String?
  region      String?
  state       String?
  country     String   @default("India")
  externalId  String?  @map("external_id")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  riverLevels RiverLevel[]

  @@index([riverName])
  @@index([region])
  @@index([isActive])
  @@map("stations")
}
```

---

### Dams Table

```sql
CREATE TABLE dams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location POINT NOT NULL,
    address TEXT,
    total_capacity DECIMAL(12, 2) NOT NULL,
    -- in million cubic meters
    type VARCHAR(100),
    -- e.g., 'Concrete Gravity', 'Earthfill'
    height DECIMAL(10, 2),
    length DECIMAL(10, 2),
    power_capacity DECIMAL(10, 2),
    -- in MW
    region VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(100) DEFAULT 'India',
    external_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dams_region ON dams(region);
CREATE INDEX idx_dams_location ON dams USING GIST(location);
CREATE INDEX idx_dams_external_id ON dams(external_id);
CREATE INDEX idx_dams_active ON dams(is_active);
```

**Prisma Schema:**
```prisma
model Dam {
  id           String   @id @default(uuid())
  name         String
  location     Json
  address      String?
  totalCapacity Decimal @map("total_capacity") @db.Decimal(12, 2)
  type         String?
  height       Decimal? @db.Decimal(10, 2)
  length       Decimal? @db.Decimal(10, 2)
  powerCapacity Decimal? @map("power_capacity") @db.Decimal(10, 2)
  region       String?
  state        String?
  country      String   @default("India")
  externalId   String?  @map("external_id")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  damCapacity  DamCapacity[]

  @@index([region])
  @@index([isActive])
  @@map("dams")
}
```

---

### Groundwater Wells Table

```sql
CREATE TABLE groundwater_wells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location POINT NOT NULL,
    address TEXT,
    region VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    country VARCHAR(100) DEFAULT 'India',
    aquifer_type VARCHAR(255),
    external_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groundwater_wells_region ON groundwater_wells(region);
CREATE INDEX idx_groundwater_wells_location ON groundwater_wells USING GIST(location);
CREATE INDEX idx_groundwater_wells_external_id ON groundwater_wells(external_id);
```

**Prisma Schema:**
```prisma
model GroundwaterWell {
  id         String   @id @default(uuid())
  name       String
  location   Json
  address    String?
  region     String
  state      String?
  country    String   @default("India")
  aquiferType String? @map("aquifer_type")
  externalId String?  @map("external_id")
  isActive   Boolean  @default(true) @map("is_active")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  groundwaterDepth GroundwaterDepth[]

  @@index([region])
  @@map("groundwater_wells")
}
```

---

### Rainfall Stations Table

```sql
CREATE TABLE rainfall_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location POINT NOT NULL,
    address TEXT,
    region VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    country VARCHAR(100) DEFAULT 'India',
    elevation DECIMAL(10, 2),
    external_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rainfall_stations_region ON rainfall_stations(region);
CREATE INDEX idx_rainfall_stations_location ON rainfall_stations USING GIST(location);
```

**Prisma Schema:**
```prisma
model RainfallStation {
  id         String   @id @default(uuid())
  name       String
  location   Json
  address    String?
  region     String
  state      String?
  country    String   @default("India")
  elevation  Decimal? @db.Decimal(10, 2)
  externalId String?  @map("external_id")
  isActive   Boolean  @default(true) @map("is_active")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  rainfallData RainfallData[]

  @@index([region])
  @@map("rainfall_stations")
}
```

---

### Alert Configurations Table

```sql
CREATE TABLE alert_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    -- 'river', 'dam', 'groundwater', 'rainfall'
    entity_id UUID NOT NULL,
    -- References station_id, dam_id, well_id, or station_id
    threshold_operator VARCHAR(10) NOT NULL,
    -- 'gt', 'lt', 'eq'
    threshold_value DECIMAL(12, 2) NOT NULL,
    channels TEXT[] NOT NULL,
    -- Array: ['email', 'sms', 'push']
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_configs_user_id ON alert_configurations(user_id);
CREATE INDEX idx_alert_configs_type ON alert_configurations(type);
CREATE INDEX idx_alert_configs_entity_id ON alert_configurations(entity_id);
CREATE INDEX idx_alert_configs_enabled ON alert_configurations(enabled);
```

**Prisma Schema:**
```prisma
model AlertConfiguration {
  id               String   @id @default(uuid())
  userId           String   @map("user_id")
  type             String   // river, dam, groundwater, rainfall
  entityId         String   @map("entity_id")
  thresholdOperator String  @map("threshold_operator")
  thresholdValue   Decimal  @map("threshold_value") @db.Decimal(12, 2)
  channels         String[]
  enabled          Boolean  @default(true)
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  alerts Alert[]

  @@index([userId])
  @@index([type, entityId])
  @@map("alert_configurations")
}
```

---

### Alerts Table

```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID REFERENCES alert_configurations(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    entity_name VARCHAR(255),
    severity VARCHAR(20) NOT NULL,
    -- 'info', 'warning', 'critical'
    message TEXT NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id)
);

CREATE INDEX idx_alerts_configuration_id ON alerts(configuration_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_entity_id ON alerts(entity_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at);
CREATE INDEX idx_alerts_resolved ON alerts(resolved_at) WHERE resolved_at IS NULL;
```

**Prisma Schema:**
```prisma
model Alert {
  id              String    @id @default(uuid())
  configurationId String?   @map("configuration_id")
  type            String
  entityId        String   @map("entity_id")
  entityName      String?  @map("entity_name")
  severity        String   // info, warning, critical
  message         String
  triggeredAt     DateTime  @default(now()) @map("triggered_at")
  resolvedAt      DateTime? @map("resolved_at")
  acknowledged    Boolean   @default(false)
  acknowledgedAt  DateTime? @map("acknowledged_at")
  acknowledgedBy  String?  @map("acknowledged_by")

  configuration AlertConfiguration? @relation(fields: [configurationId], references: [id], onDelete: SetNull)

  @@index([configurationId])
  @@index([type, entityId])
  @@index([severity])
  @@index([triggeredAt])
  @@map("alerts")
}
```

---

### Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    -- 'email', 'sms', 'push'
    channel VARCHAR(100),
    -- Email address, phone number, push token
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'sent', 'failed', 'delivered'
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

**Prisma Schema:**
```prisma
model Notification {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  type         String    // email, sms, push
  channel      String?
  subject      String?
  message      String
  status       String    @default("pending") // pending, sent, failed, delivered
  sentAt       DateTime? @map("sent_at")
  deliveredAt DateTime?  @map("delivered_at")
  errorMessage String?   @map("error_message")
  createdAt    DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("notifications")
}
```

---

## TimescaleDB Schema (Time-Series Data)

### River Levels Hypertable

```sql
-- Create regular table first
CREATE TABLE river_levels (
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    level DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    -- 'safe', 'warning', 'danger', 'critical'
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(100),
    -- 'india-wris', 'usgs', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert to hypertable
SELECT create_hypertable('river_levels', 'timestamp');

-- Create indexes
CREATE INDEX idx_river_levels_station_timestamp ON river_levels(station_id, timestamp DESC);
CREATE INDEX idx_river_levels_status ON river_levels(status);
CREATE INDEX idx_river_levels_timestamp ON river_levels(timestamp DESC);

-- Compression policy (compress data older than 30 days)
SELECT add_compression_policy('river_levels', INTERVAL '30 days');

-- Retention policy (keep data for 5 years)
SELECT add_retention_policy('river_levels', INTERVAL '5 years');
```

**Prisma Schema:**
```prisma
model RiverLevel {
  stationId String   @map("station_id")
  level     Decimal  @db.Decimal(10, 2)
  status    String
  timestamp DateTime
  source    String?
  createdAt DateTime @default(now()) @map("created_at")

  station Station @relation(fields: [stationId], references: [id], onDelete: Cascade)

  @@id([stationId, timestamp])
  @@index([timestamp(sort: Desc)])
  @@map("river_levels")
}
```

---

### Dam Capacity Hypertable

```sql
CREATE TABLE dam_capacity (
    dam_id UUID NOT NULL REFERENCES dams(id) ON DELETE CASCADE,
    storage DECIMAL(12, 2) NOT NULL,
    capacity DECIMAL(12, 2) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    inflow_rate DECIMAL(10, 2),
    outflow_rate DECIMAL(10, 2),
    power_generation DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL,
    -- 'normal', 'warning', 'critical', 'overflow'
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT create_hypertable('dam_capacity', 'timestamp');

CREATE INDEX idx_dam_capacity_dam_timestamp ON dam_capacity(dam_id, timestamp DESC);
CREATE INDEX idx_dam_capacity_status ON dam_capacity(status);

SELECT add_compression_policy('dam_capacity', INTERVAL '30 days');
SELECT add_retention_policy('dam_capacity', INTERVAL '5 years');
```

---

### Groundwater Depth Hypertable

```sql
CREATE TABLE groundwater_depth (
    well_id UUID NOT NULL REFERENCES groundwater_wells(id) ON DELETE CASCADE,
    depth DECIMAL(10, 2) NOT NULL,
    -- Depth to water level in meters
    season VARCHAR(20),
    -- 'pre-monsoon', 'monsoon', 'post-monsoon'
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT create_hypertable('groundwater_depth', 'timestamp');

CREATE INDEX idx_groundwater_depth_well_timestamp ON groundwater_depth(well_id, timestamp DESC);

SELECT add_compression_policy('groundwater_depth', INTERVAL '90 days');
SELECT add_retention_policy('groundwater_depth', INTERVAL '5 years');
```

---

### Water Quality Hypertable

```sql
CREATE TABLE water_quality (
    well_id UUID NOT NULL REFERENCES groundwater_wells(id) ON DELETE CASCADE,
    tds DECIMAL(10, 2),
    -- Total Dissolved Solids (mg/L)
    ph DECIMAL(4, 2),
    arsenic DECIMAL(8, 4),
    -- mg/L
    fluoride DECIMAL(8, 4),
    -- mg/L
    status VARCHAR(20),
    -- 'excellent', 'good', 'moderate', 'poor'
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT create_hypertable('water_quality', 'timestamp');

CREATE INDEX idx_water_quality_well_timestamp ON water_quality(well_id, timestamp DESC);
```

---

### Rainfall Data Hypertable

```sql
CREATE TABLE rainfall_data (
    station_id UUID NOT NULL REFERENCES rainfall_stations(id) ON DELETE CASCADE,
    rainfall DECIMAL(8, 2) NOT NULL,
    -- in mm
    season VARCHAR(20),
    -- 'summer', 'monsoon', 'winter'
    timestamp DATE NOT NULL,
    -- Daily data
    source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT create_hypertable('rainfall_data', 'timestamp');

CREATE INDEX idx_rainfall_data_station_timestamp ON rainfall_data(station_id, timestamp DESC);
CREATE INDEX idx_rainfall_data_season ON rainfall_data(season);

SELECT add_compression_policy('rainfall_data', INTERVAL '90 days');
SELECT add_retention_policy('rainfall_data', INTERVAL '5 years');
```

---

## Continuous Aggregates (TimescaleDB)

### Daily River Level Aggregates

```sql
CREATE MATERIALIZED VIEW river_levels_daily
WITH (timescaledb.continuous) AS
SELECT
    station_id,
    time_bucket('1 day', timestamp) AS bucket,
    AVG(level) AS avg_level,
    MIN(level) AS min_level,
    MAX(level) AS max_level,
    COUNT(*) AS count
FROM river_levels
GROUP BY station_id, bucket;

SELECT add_continuous_aggregate_policy('river_levels_daily',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');
```

### Monthly Rainfall Aggregates

```sql
CREATE MATERIALIZED VIEW rainfall_monthly
WITH (timescaledb.continuous) AS
SELECT
    station_id,
    time_bucket('1 month', timestamp) AS bucket,
    SUM(rainfall) AS total_rainfall,
    AVG(rainfall) AS avg_rainfall,
    MAX(rainfall) AS max_rainfall,
    COUNT(*) AS days_with_rainfall
FROM rainfall_data
GROUP BY station_id, bucket;
```

---

## Indexing Strategy

### Primary Indexes
- Primary keys on all tables
- Foreign key indexes for relationships

### Performance Indexes
- Composite indexes on (entity_id, timestamp) for time-series queries
- Geographic indexes (GIST) on location columns
- Status/type indexes for filtering

### Query Optimization
- Use covering indexes for common queries
- Partial indexes for filtered queries (e.g., active alerts)
- B-tree indexes for equality/range queries
- GIST indexes for spatial queries

---

## Data Retention Policies

### Relational Data (PostgreSQL)
- **Users**: Permanent (with soft delete option)
- **Stations/Dams/Wells**: Permanent
- **Alerts**: 1 year active, archive older
- **Notifications**: 90 days, then archive

### Time-Series Data (TimescaleDB)
- **Raw Data**: 5 years
- **Compressed Data**: 10 years (compressed)
- **Aggregates**: Permanent (daily/monthly aggregates)

### Cache (Redis)
- **API Cache**: 15 minutes TTL
- **Session Data**: 24 hours TTL
- **Real-time Data**: 1 hour TTL

---

## Migration Strategy

### Prisma Migrations
```bash
# Create migration
npx prisma migrate dev --name add_river_levels

# Apply migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### TimescaleDB Setup
```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert tables to hypertables
SELECT create_hypertable('river_levels', 'timestamp');
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-21  
**Author**: Development Team

