// Common types used across the application

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
}

export interface Location {
  lat: number;
  lng: number;
}

// River Types
export interface RiverStation {
  id: string;
  name: string;
  riverName: string;
  location: Location;
  address?: string;
  dangerLevel: number;
  floodLevel: number;
  elevation?: number;
  basin?: string;
  region?: string;
  state?: string;
  country: string;
  externalId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RiverLevel {
  id: string;
  stationId: string;
  level: number;
  timestamp: string;
  status: 'safe' | 'warning' | 'danger' | 'critical';
}

// Dam Types
export interface Dam {
  id: string;
  name: string;
  location: Location;
  address?: string;
  totalCapacity: number;
  type?: string;
  height?: number;
  length?: number;
  powerCapacity?: number;
  region?: string;
  state?: string;
  country: string;
  externalId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DamCapacity {
  id: string;
  damId: string;
  storage: number;
  capacity: number;
  percentage: number;
  inflowRate?: number;
  outflowRate?: number;
  powerGeneration?: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical' | 'overflow';
}

// Groundwater Types
export interface GroundwaterWell {
  id: string;
  name: string;
  location: Location;
  address?: string;
  region: string;
  state?: string;
  country: string;
  aquiferType?: string;
  externalId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroundwaterDepth {
  id: string;
  wellId: string;
  depth: number;
  timestamp: string;
  season: 'pre-monsoon' | 'monsoon' | 'post-monsoon';
}

// Rainfall Types
export interface RainfallStation {
  id: string;
  name: string;
  location: Location;
  address?: string;
  region: string;
  state?: string;
  country: string;
  elevation?: number;
  externalId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RainfallForecast {
  date: string;
  predictedRainfall: number;
  confidence: number;
  intensity: 'light' | 'moderate' | 'heavy' | 'extreme';
}

export interface RainfallData {
  id: string;
  stationId: string;
  date: string;
  rainfall: number;
  season: 'summer' | 'monsoon' | 'winter';
}

// Alert Types
export interface AlertConfiguration {
  id: string;
  userId: string;
  type: 'river' | 'dam' | 'groundwater' | 'rainfall';
  entityId: string;
  thresholdOperator: 'gt' | 'lt' | 'eq';
  thresholdValue: number;
  channels: ('sms' | 'email' | 'push')[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  configurationId?: string;
  type: string;
  entityId: string;
  entityName?: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: string;
  resolvedAt?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

