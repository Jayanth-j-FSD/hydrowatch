import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Alert, AlertConfiguration } from '../types';

export function useAlertConfigurations() {
  return useQuery<AlertConfiguration[]>({
    queryKey: ['alerts', 'configurations'],
    queryFn: () => apiClient.get<AlertConfiguration[]>('/alerts/configurations'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['alerts', 'active'],
    queryFn: () => apiClient.get<Alert[]>('/alerts/active'),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useAlertHistory(limit: number = 100) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', 'history', limit],
    queryFn: () => apiClient.get<Alert[]>(`/alerts/history?limit=${limit}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAlertConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: 'river' | 'dam' | 'groundwater' | 'rainfall';
      entityId: string;
      thresholdOperator: 'gt' | 'lt' | 'eq';
      thresholdValue: number;
      channels: ('sms' | 'email' | 'push')[];
      enabled?: boolean;
    }) => apiClient.post<AlertConfiguration>('/alerts/configurations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'configurations'] });
    },
  });
}

export function useUpdateAlertConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      thresholdOperator?: 'gt' | 'lt' | 'eq';
      thresholdValue?: number;
      channels?: ('sms' | 'email' | 'push')[];
      enabled?: boolean;
    }) => apiClient.put<AlertConfiguration>(`/alerts/configurations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'configurations'] });
    },
  });
}

export function useDeleteAlertConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/alerts/configurations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'configurations'] });
    },
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/alerts/${id}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

