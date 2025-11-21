import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface UseWebSocketOptions {
  namespace?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(
  event: string,
  handler: (data: any) => void,
  options: UseWebSocketOptions = {},
) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { namespace = '', onConnect, onDisconnect, onError } = options;

  useEffect(() => {
    const socket = io(`${WS_URL}${namespace}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`WebSocket connected to ${namespace || 'default'}`);
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log(`WebSocket disconnected from ${namespace || 'default'}`);
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      onError?.(error);
    });

    socket.on(event, (data) => {
      handler(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [event, namespace]);

  const emit = useCallback((eventName: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  return { emit, disconnect, socket: socketRef.current };
}

/**
 * Hook for river station real-time updates
 */
export function useRiverStationUpdates(stationId: string) {
  const queryClient = useQueryClient();

  useWebSocket(
    'level:update',
    (data) => {
      if (data.stationId === stationId) {
        // Update the query cache
        queryClient.setQueryData(['river', 'station', stationId, 'current'], data);
        queryClient.invalidateQueries({ queryKey: ['river', 'station', stationId] });
      }
    },
    {
      namespace: '/river',
    },
  );
}

/**
 * Hook for dam capacity real-time updates
 */
export function useDamCapacityUpdates(damId: string) {
  const queryClient = useQueryClient();

  useWebSocket(
    'capacity:update',
    (data) => {
      if (data.damId === damId) {
        queryClient.setQueryData(['dams', 'dam', damId, 'capacity'], data);
        queryClient.invalidateQueries({ queryKey: ['dams', 'dam', damId] });
      }
    },
    {
      namespace: '/dams',
    },
  );
}

