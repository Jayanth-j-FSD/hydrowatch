import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class DataTransformerService {
  private readonly logger = new Logger(DataTransformerService.name);

  /**
   * Transform and validate data using Zod schema
   */
  transform<T>(data: unknown, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      this.logger.error('Data transformation failed:', error);
      throw error;
    }
  }

  /**
   * Transform array of data
   */
  transformArray<T>(data: unknown[], schema: z.ZodSchema<T>): T[] {
    return data.map((item) => this.transform(item, schema));
  }

  /**
   * Normalize location data
   */
  normalizeLocation(location: any): { lat: number; lng: number } {
    if (typeof location === 'object' && location !== null) {
      return {
        lat: parseFloat(location.lat || location.latitude || location.lat || 0),
        lng: parseFloat(location.lng || location.longitude || location.lon || location.lng || 0),
      };
    }
    return { lat: 0, lng: 0 };
  }

  /**
   * Normalize date to ISO string
   */
  normalizeDate(date: any): Date {
    if (date instanceof Date) {
      return date;
    }
    if (typeof date === 'string') {
      return new Date(date);
    }
    if (typeof date === 'number') {
      return new Date(date);
    }
    return new Date();
  }

  /**
   * Normalize numeric value
   */
  normalizeNumber(value: any, defaultValue: number = 0): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }

  /**
   * Map external API response to internal format
   */
  mapExternalToInternal<T>(
    externalData: any,
    mappingFn: (data: any) => T,
  ): T {
    try {
      return mappingFn(externalData);
    } catch (error) {
      this.logger.error('Mapping failed:', error);
      throw error;
    }
  }
}

