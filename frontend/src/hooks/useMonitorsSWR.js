import useSWR from 'swr';
import useAuthToken from './useAuthToken';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const fetcher = ([url, token]) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => data.monitors || []);

export default function useMonitorsSWR() {
  const { token, user } = useAuthToken();
  const [realTimeUpdates, setRealTimeUpdates] = useState(new Map());

  const shouldFetch = typeof window !== "undefined" && !!token;

  const { data = [], isLoading, mutate } = useSWR(
    shouldFetch ? [`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api/monitor/all`, token] : null,
    fetcher,
    { 
      refreshInterval: 60000, // Reduced to 60 seconds since we have real-time updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  // Socket.io for real-time updates
  useEffect(() => {
    if (!token) return;

  const serverUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('🔌 useMonitorsSWR connected to real-time updates');
      if (user?.id) {
        socket.emit('join-user-room', user.id);
      }
    });

    // Listen for real-time monitor updates
    socket.on('monitor-check', (update) => {
      console.log('📊 Real-time monitor update:', update);
      setRealTimeUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(update.monitorId, {
          status: update.status,
          responseTime: update.responseTime,
          statusCode: update.statusCode,
          lastChecked: update.timestamp,
          errorMessage: update.errorMessage
        });
        return newMap;
      });
    });

    // Listen for user-specific updates
    socket.on('user-monitor-check', (update) => {
      console.log('👤 User monitor update:', update);
      // Trigger SWR revalidation for significant changes
      if (update.status !== update.prevStatus) {
        mutate();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user?.id, mutate]);

  useEffect(() => {
    if (token) {
      console.log('Token changed, clearing SWR cache');
      mutate();
    }
  }, [token, mutate]);

  // Merge real-time updates with SWR data
  const enhancedMonitors = data.map(monitor => {
    const realTimeUpdate = realTimeUpdates.get(monitor.id);
    if (realTimeUpdate) {
      return {
        ...monitor,
        status: realTimeUpdate.status,
        last_response_time: realTimeUpdate.responseTime,
        last_status_code: realTimeUpdate.statusCode,
        last_checked_at: realTimeUpdate.lastChecked,
        error_message: realTimeUpdate.errorMessage
      };
    }
    return monitor;
  });

  return { 
    monitors: enhancedMonitors, 
    isLoading, 
    mutate,
    realTimeUpdates: realTimeUpdates.size
  };
}
