import { z } from 'zod';

export const RiverLevelDataSchema = z.object({
  stationId: z.string(),
  level: z.number(),
  timestamp: z.date(),
  status: z.enum(['safe', 'warning', 'danger', 'critical']),
});

export const StationDataSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  riverName: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  address: z.string().optional(),
  dangerLevel: z.number(),
  floodLevel: z.number(),
  elevation: z.number().optional(),
  basin: z.string().optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  externalId: z.string().optional(),
});

export type RiverLevelData = z.infer<typeof RiverLevelDataSchema>;
export type StationData = z.infer<typeof StationDataSchema>;

