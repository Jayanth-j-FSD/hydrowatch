import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { GroundwaterWell, GroundwaterDepth } from '../types';

export function useGroundwaterWells() {
  return useQuery<GroundwaterWell[]>({
    queryKey: ['groundwater', 'wells'],
    queryFn: () => apiClient.get<GroundwaterWell[]>('/groundwater/wells'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGroundwaterWell(id: string) {
  return useQuery<GroundwaterWell>({
    queryKey: ['groundwater', 'well', id],
    queryFn: () => apiClient.get<GroundwaterWell>(`/groundwater/wells/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGroundwaterCurrentDepth(wellId: string) {
  return useQuery({
    queryKey: ['groundwater', 'well', wellId, 'depth'],
    queryFn: () => apiClient.get(`/groundwater/wells/${wellId}/depth`),
    enabled: !!wellId,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useGroundwaterDepthHistory(
  wellId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100,
) {
  return useQuery<GroundwaterDepth[]>({
    queryKey: ['groundwater', 'well', wellId, 'depth', 'history', startDate, endDate, limit],
    queryFn: () =>
      apiClient.get<GroundwaterDepth[]>(`/groundwater/wells/${wellId}/depth/history`, {
        params: { startDate, endDate, limit },
      }),
    enabled: !!wellId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGroundwaterQuality(wellId: string) {
  return useQuery({
    queryKey: ['groundwater', 'well', wellId, 'quality'],
    queryFn: () => apiClient.get(`/groundwater/wells/${wellId}/quality`),
    enabled: !!wellId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGroundwaterRegionalData(region: string) {
  return useQuery({
    queryKey: ['groundwater', 'region', region],
    queryFn: () => apiClient.get(`/groundwater/regions/${region}`),
    enabled: !!region,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGroundwaterHeatmap(region?: string) {
  return useQuery({
    queryKey: ['groundwater', 'heatmap', region],
    queryFn: () => apiClient.get('/groundwater/heatmap', { params: { region } }),
    staleTime: 10 * 60 * 1000,
  });
}

