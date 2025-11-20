# API Design: HydroWatch Platform

This document defines all REST API endpoints, request/response schemas, authentication rules, and API versioning strategy for the HydroWatch platform.

---

## API Overview

### Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://staging-api.hydrowatch.com/api/v1`
- **Production**: `https://api.hydrowatch.com/api/v1`

### API Versioning
- Current version: **v1**
- Version specified in URL path: `/api/v1/...`
- Future versions: `/api/v2/...`

### Authentication
- **Method**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: 24 hours (refresh token: 7 days)

### Response Format
All responses follow a consistent structure:

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-21T10:30:00Z",
    "requestId": "req_123456"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-11-21T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Rate Limiting
- **Default**: 100 requests/minute per IP
- **Authenticated**: 200 requests/minute per user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Authentication Endpoints

### POST /api/v1/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "viewer"
    },
    "expiresIn": 86400
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `429` - Too many login attempts

---

### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "expiresIn": 86400
  }
}
```

---

### POST /api/v1/auth/logout
Invalidate current token.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

---

## River Tracker Endpoints

### GET /api/v1/river/stations
Get list of all river monitoring stations.

**Query Parameters:**
- `region` (string, optional) - Filter by region
- `river` (string, optional) - Filter by river name
- `status` (string, optional) - Filter by status: `safe`, `warning`, `danger`, `critical`
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stations": [
      {
        "id": "station_123",
        "name": "Ganga - Haridwar",
        "riverName": "Ganga",
        "location": {
          "lat": 29.9457,
          "lng": 78.1642
        },
        "currentLevel": 285.5,
        "dangerLevel": 290.0,
        "floodLevel": 295.0,
        "status": "safe",
        "lastUpdated": "2025-11-21T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### GET /api/v1/river/stations/:id
Get detailed information about a specific station.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "station_123",
    "name": "Ganga - Haridwar",
    "riverName": "Ganga",
    "location": {
      "lat": 29.9457,
      "lng": 78.1642,
      "address": "Haridwar, Uttarakhand"
    },
    "currentLevel": 285.5,
    "dangerLevel": 290.0,
    "floodLevel": 295.0,
    "status": "safe",
    "lastUpdated": "2025-11-21T10:30:00Z",
    "metadata": {
      "elevation": 314,
      "basin": "Ganga Basin"
    }
  }
}
```

---

### GET /api/v1/river/stations/:id/levels
Get historical water level data for a station.

**Query Parameters:**
- `startDate` (ISO 8601, required) - Start date
- `endDate` (ISO 8601, required) - End date
- `interval` (string, optional) - Data interval: `hourly`, `daily`, `weekly`, `monthly` (default: `daily`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stationId": "station_123",
    "levels": [
      {
        "timestamp": "2025-11-21T00:00:00Z",
        "level": 285.5,
        "status": "safe"
      },
      {
        "timestamp": "2025-11-20T00:00:00Z",
        "level": 284.2,
        "status": "safe"
      }
    ],
    "summary": {
      "min": 280.1,
      "max": 288.5,
      "avg": 285.0,
      "count": 365
    }
  }
}
```

---

### GET /api/v1/river/stations/:id/current
Get current water level for a station.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stationId": "station_123",
    "level": 285.5,
    "status": "safe",
    "timestamp": "2025-11-21T10:30:00Z",
    "trend": "increasing", // "increasing", "decreasing", "stable"
    "change24h": 0.5
  }
}
```

---

### GET /api/v1/river/alerts
Get active flood alerts.

**Query Parameters:**
- `severity` (string, optional) - Filter by severity: `warning`, `critical`
- `region` (string, optional) - Filter by region

**Response (200):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_123",
        "stationId": "station_456",
        "stationName": "Yamuna - Delhi",
        "severity": "critical",
        "message": "Water level exceeds flood level",
        "currentLevel": 296.5,
        "floodLevel": 295.0,
        "triggeredAt": "2025-11-21T09:15:00Z"
      }
    ]
  }
}
```

---

## Dams Dashboard Endpoints

### GET /api/v1/dams
Get list of all dams/reservoirs.

**Query Parameters:**
- `region` (string, optional) - Filter by region
- `status` (string, optional) - Filter by status: `normal`, `warning`, `critical`, `overflow`
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dams": [
      {
        "id": "dam_123",
        "name": "Bhakra Dam",
        "location": {
          "lat": 31.4104,
          "lng": 76.4333
        },
        "totalCapacity": 9621.0,
        "currentStorage": 7500.0,
        "percentage": 77.9,
        "status": "normal",
        "lastUpdated": "2025-11-21T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### GET /api/v1/dams/:id
Get detailed information about a specific dam.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "dam_123",
    "name": "Bhakra Dam",
    "location": {
      "lat": 31.4104,
      "lng": 76.4333,
      "address": "Bilaspur, Himachal Pradesh"
    },
    "totalCapacity": 9621.0,
    "currentStorage": 7500.0,
    "percentage": 77.9,
    "inflowRate": 150.5,
    "outflowRate": 120.0,
    "powerGeneration": 1320.5,
    "status": "normal",
    "lastUpdated": "2025-11-21T10:30:00Z",
    "metadata": {
      "type": "Concrete Gravity",
      "height": 226,
      "length": 518
    }
  }
}
```

---

### GET /api/v1/dams/:id/capacity
Get historical capacity data.

**Query Parameters:**
- `startDate` (ISO 8601, required)
- `endDate` (ISO 8601, required)
- `interval` (string, optional) - `daily`, `weekly`, `monthly`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "damId": "dam_123",
    "capacity": [
      {
        "timestamp": "2025-11-21T00:00:00Z",
        "storage": 7500.0,
        "capacity": 9621.0,
        "percentage": 77.9
      }
    ],
    "summary": {
      "min": 4500.0,
      "max": 9500.0,
      "avg": 7200.0
    }
  }
}
```

---

### GET /api/v1/dams/:id/flow
Get inflow/outflow history.

**Query Parameters:**
- `startDate` (ISO 8601, required)
- `endDate` (ISO 8601, required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "damId": "dam_123",
    "flow": [
      {
        "timestamp": "2025-11-21T00:00:00Z",
        "inflow": 150.5,
        "outflow": 120.0,
        "net": 30.5
      }
    ]
  }
}
```

---

### GET /api/v1/dams/:id/power
Get power generation history.

**Query Parameters:**
- `startDate` (ISO 8601, required)
- `endDate` (ISO 8601, required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "damId": "dam_123",
    "power": [
      {
        "timestamp": "2025-11-21T00:00:00Z",
        "generation": 1320.5,
        "capacity": 1500.0,
        "utilization": 88.0
      }
    ]
  }
}
```

---

## Groundwater Endpoints

### GET /api/v1/groundwater/wells
Get list of all groundwater monitoring wells.

**Query Parameters:**
- `region` (string, optional)
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "wells": [
      {
        "id": "well_123",
        "name": "Well - Delhi Sector 5",
        "location": {
          "lat": 28.6139,
          "lng": 77.2090
        },
        "region": "Delhi",
        "depthToWater": 25.5,
        "quality": {
          "tds": 450,
          "ph": 7.2,
          "status": "good"
        },
        "lastUpdated": "2025-11-21T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 200,
      "totalPages": 10
    }
  }
}
```

---

### GET /api/v1/groundwater/wells/:id/depth
Get historical depth data.

**Query Parameters:**
- `startDate` (ISO 8601, required)
- `endDate` (ISO 8601, required)
- `season` (string, optional) - `pre-monsoon`, `monsoon`, `post-monsoon`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "wellId": "well_123",
    "depth": [
      {
        "timestamp": "2025-11-21T00:00:00Z",
        "depth": 25.5,
        "season": "post-monsoon"
      }
    ],
    "trend": "depleting",
    "changeAnnual": -2.5
  }
}
```

---

### GET /api/v1/groundwater/heatmap
Get regional heatmap data.

**Query Parameters:**
- `region` (string, optional)
- `date` (ISO 8601, optional) - Default: latest

**Response (200):**
```json
{
  "success": true,
  "data": {
    "region": "Delhi",
    "date": "2025-11-21",
    "heatmap": [
      {
        "lat": 28.6139,
        "lng": 77.2090,
        "depth": 25.5,
        "status": "moderate"
      }
    ],
    "legend": {
      "high": { "min": 0, "max": 10 },
      "moderate": { "min": 10, "max": 30 },
      "low": { "min": 30, "max": 50 },
      "critical": { "min": 50, "max": 100 }
    }
  }
}
```

---

## Rainfall Forecast Endpoints

### GET /api/v1/rainfall/stations
Get list of rainfall monitoring stations.

**Query Parameters:**
- `region` (string, optional)
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stations": [
      {
        "id": "rain_123",
        "name": "Delhi - Palam",
        "location": {
          "lat": 28.5562,
          "lng": 77.1000
        },
        "region": "Delhi",
        "lastUpdated": "2025-11-21T10:30:00Z"
      }
    ]
  }
}
```

---

### GET /api/v1/rainfall/stations/:id/forecast
Get 7-day rainfall forecast.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stationId": "rain_123",
    "forecast": [
      {
        "date": "2025-11-22",
        "predictedRainfall": 15.5,
        "confidence": 85,
        "intensity": "moderate",
        "probability": 0.75
      },
      {
        "date": "2025-11-23",
        "predictedRainfall": 8.2,
        "confidence": 80,
        "intensity": "light",
        "probability": 0.60
      }
    ],
    "summary": {
      "total7Days": 45.5,
      "average": 6.5,
      "maxDay": "2025-11-22"
    }
  }
}
```

---

### GET /api/v1/rainfall/stations/:id/history
Get historical rainfall data.

**Query Parameters:**
- `startDate` (ISO 8601, required)
- `endDate` (ISO 8601, required)
- `interval` (string, optional) - `daily`, `weekly`, `monthly`, `seasonal`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stationId": "rain_123",
    "history": [
      {
        "date": "2025-11-21",
        "rainfall": 12.5,
        "season": "post-monsoon"
      }
    ],
    "summary": {
      "total": 850.5,
      "average": 2.3,
      "max": 45.0,
      "maxDate": "2025-08-15"
    }
  }
}
```

---

### GET /api/v1/rainfall/risk-indicators
Get drought/flood risk indicators.

**Query Parameters:**
- `region` (string, optional)
- `date` (ISO 8601, optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "region": "Delhi",
    "date": "2025-11-21",
    "droughtRisk": {
      "level": "low",
      "probability": 0.15,
      "indicators": ["normal_rainfall", "adequate_reservoir"]
    },
    "floodRisk": {
      "level": "moderate",
      "probability": 0.35,
      "indicators": ["high_reservoir", "forecasted_rainfall"]
    }
  }
}
```

---

## Alert System Endpoints

### GET /api/v1/alerts
Get all alerts (requires authentication).

**Query Parameters:**
- `status` (string, optional) - `active`, `resolved`, `acknowledged`
- `severity` (string, optional) - `info`, `warning`, `critical`
- `type` (string, optional) - `river`, `dam`, `groundwater`, `rainfall`
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_123",
        "type": "river",
        "entityId": "station_456",
        "entityName": "Yamuna - Delhi",
        "severity": "critical",
        "message": "Water level exceeds flood level",
        "triggeredAt": "2025-11-21T09:15:00Z",
        "resolvedAt": null,
        "acknowledged": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### GET /api/v1/alerts/configurations
Get user's alert configurations.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "configurations": [
      {
        "id": "config_123",
        "type": "river",
        "entityId": "station_456",
        "entityName": "Yamuna - Delhi",
        "threshold": {
          "operator": "gt",
          "value": 295.0
        },
        "channels": ["email", "sms"],
        "enabled": true,
        "createdAt": "2025-11-15T10:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/v1/alerts/configurations
Create new alert configuration.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "river",
  "entityId": "station_456",
  "threshold": {
    "operator": "gt",
    "value": 295.0
  },
  "channels": ["email", "sms"],
  "enabled": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "config_123",
    "type": "river",
    "entityId": "station_456",
    "threshold": {
      "operator": "gt",
      "value": 295.0
    },
    "channels": ["email", "sms"],
    "enabled": true,
    "createdAt": "2025-11-21T10:30:00Z"
  }
}
```

---

### PUT /api/v1/alerts/configurations/:id
Update alert configuration.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "threshold": {
    "operator": "gt",
    "value": 300.0
  },
  "channels": ["email"],
  "enabled": true
}
```

**Response (200):** Updated configuration object

---

### DELETE /api/v1/alerts/configurations/:id
Delete alert configuration.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

---

### POST /api/v1/alerts/:id/acknowledge
Acknowledge an alert.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "alert_123",
    "acknowledged": true,
    "acknowledgedAt": "2025-11-21T10:30:00Z"
  }
}
```

---

## Export & Reporting Endpoints

### POST /api/v1/export/pdf
Generate PDF report.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "river",
  "entityId": "station_123",
  "startDate": "2025-11-01",
  "endDate": "2025-11-21",
  "includeCharts": true,
  "includeSummary": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportId": "report_123",
    "url": "https://api.hydrowatch.com/reports/report_123.pdf",
    "expiresAt": "2025-11-28T10:30:00Z"
  }
}
```

---

### POST /api/v1/export/csv
Generate CSV export.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "river",
  "entityId": "station_123",
  "startDate": "2025-11-01",
  "endDate": "2025-11-21",
  "fields": ["timestamp", "level", "status"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "exportId": "export_123",
    "url": "https://api.hydrowatch.com/exports/export_123.csv",
    "expiresAt": "2025-11-28T10:30:00Z"
  }
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('https://api.hydrowatch.com', {
  auth: { token: 'jwt_token_here' }
});
```

### Events (Client → Server)
- `subscribe:river:station:{id}` - Subscribe to station updates
- `unsubscribe:river:station:{id}` - Unsubscribe
- `subscribe:dam:{id}` - Subscribe to dam updates
- `subscribe:alerts:all` - Subscribe to all alerts

### Events (Server → Client)
- `river:level:update` - River level update
- `dam:capacity:update` - Dam capacity update
- `groundwater:depth:update` - Groundwater depth update
- `rainfall:forecast:update` - Rainfall forecast update
- `alert:created` - New alert created
- `alert:resolved` - Alert resolved

**Example:**
```json
{
  "event": "river:level:update",
  "data": {
    "stationId": "station_123",
    "level": 285.5,
    "status": "safe",
    "timestamp": "2025-11-21T10:30:00Z"
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID` | 401 | Invalid token |
| `AUTH_EXPIRED` | 401 | Token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `EXTERNAL_API_ERROR` | 502 | External API failure |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-21  
**Author**: Development Team

