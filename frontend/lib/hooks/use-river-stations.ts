import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { RiverStation } from '../types';

export function useRiverStations() {
  return useQuery<RiverStation[]>({
    queryKey: ['river', 'stations'],
    queryFn: () => apiClient.get<RiverStation[]>('/river/stations'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRiverStation(id: string) {
  return useQuery<RiverStation>({
    queryKey: ['river', 'station', id],
    queryFn: () => apiClient.get<RiverStation>(`/river/stations/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRiverCurrentLevel(stationId: string) {
  return useQuery({
    queryKey: ['river', 'station', stationId, 'current'],
    queryFn: () => apiClient.get(`/river/stations/${stationId}/current`),
    enabled: !!stationId,
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent for current data)
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useRiverHistoricalLevels(
  stationId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100,
) {
  return useQuery({
    queryKey: ['river', 'station', stationId, 'levels', startDate, endDate, limit],
    queryFn: () =>
      apiClient.get(`/river/stations/${stationId}/levels`, {
        params: { startDate, endDate, limit },
      }),
    enabled: !!stationId,
    staleTime: 10 * 60 * 1000, // 10 minutes for historical data
  });
}

export function useRiverAlerts() {
  return useQuery({
    queryKey: ['river', 'alerts'],
    queryFn: () => apiClient.get('/river/alerts'),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

