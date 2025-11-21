import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Dam, DamCapacity } from '../types';

export function useDams() {
  return useQuery<Dam[]>({
    queryKey: ['dams'],
    queryFn: () => apiClient.get<Dam[]>('/dams'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDam(id: string) {
  return useQuery<Dam>({
    queryKey: ['dams', 'dam', id],
    queryFn: () => apiClient.get<Dam>(`/dams/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDamCapacity(damId: string) {
  return useQuery<DamCapacity>({
    queryKey: ['dams', 'dam', damId, 'capacity'],
    queryFn: () => apiClient.get<DamCapacity>(`/dams/${damId}/capacity`),
    enabled: !!damId,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useDamCapacityHistory(
  damId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100,
) {
  return useQuery<DamCapacity[]>({
    queryKey: ['dams', 'dam', damId, 'capacity', 'history', startDate, endDate, limit],
    queryFn: () =>
      apiClient.get<DamCapacity[]>(`/dams/${damId}/capacity/history`, {
        params: { startDate, endDate, limit },
      }),
    enabled: !!damId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDamAlerts() {
  return useQuery({
    queryKey: ['dams', 'alerts'],
    queryFn: () => apiClient.get('/dams/alerts'),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

