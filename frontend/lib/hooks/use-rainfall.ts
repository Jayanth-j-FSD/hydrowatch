import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { RainfallStation, RainfallForecast, RainfallData } from '../types';

export function useRainfallStations() {
  return useQuery<RainfallStation[]>({
    queryKey: ['rainfall', 'stations'],
    queryFn: () => apiClient.get<RainfallStation[]>('/rainfall/stations'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRainfallStation(id: string) {
  return useQuery<RainfallStation>({
    queryKey: ['rainfall', 'station', id],
    queryFn: () => apiClient.get<RainfallStation>(`/rainfall/stations/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRainfallForecast(stationId: string, days: number = 7) {
  return useQuery<{ station: RainfallStation; forecast: RainfallForecast[] }>({
    queryKey: ['rainfall', 'station', stationId, 'forecast', days],
    queryFn: () =>
      apiClient.get<{ station: RainfallStation; forecast: RainfallForecast[] }>(
        `/rainfall/stations/${stationId}/forecast`,
        { params: { days } },
      ),
    enabled: !!stationId,
    staleTime: 30 * 60 * 1000, // 30 minutes (forecast doesn't change often)
  });
}

export function useRainfallHistory(
  stationId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100,
) {
  return useQuery<RainfallData[]>({
    queryKey: ['rainfall', 'station', stationId, 'history', startDate, endDate, limit],
    queryFn: () =>
      apiClient.get<RainfallData[]>(`/rainfall/stations/${stationId}/history`, {
        params: { startDate, endDate, limit },
      }),
    enabled: !!stationId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRainfallSeasonal(stationId: string, year?: number) {
  return useQuery({
    queryKey: ['rainfall', 'station', stationId, 'seasonal', year],
    queryFn: () =>
      apiClient.get(`/rainfall/stations/${stationId}/seasonal`, {
        params: { year },
      }),
    enabled: !!stationId,
    staleTime: 60 * 60 * 1000, // 1 hour (seasonal data doesn't change)
  });
}

export function useRainfallRiskIndicators(region?: string) {
  return useQuery({
    queryKey: ['rainfall', 'risk-indicators', region],
    queryFn: () =>
      apiClient.get('/rainfall/risk-indicators', { params: { region } }),
    staleTime: 30 * 60 * 1000,
  });
}

