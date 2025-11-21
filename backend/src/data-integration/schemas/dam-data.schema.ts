import { z } from 'zod';

export const DamCapacityDataSchema = z.object({
  damId: z.string(),
  storage: z.number(),
  capacity: z.number(),
  percentage: z.number(),
  timestamp: z.date(),
});

export const DamDataSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  address: z.string().optional(),
  totalCapacity: z.number(),
  type: z.string().optional(),
  height: z.number().optional(),
  length: z.number().optional(),
  powerCapacity: z.number().optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  externalId: z.string().optional(),
});

export type DamCapacityData = z.infer<typeof DamCapacityDataSchema>;
export type DamData = z.infer<typeof DamDataSchema>;

