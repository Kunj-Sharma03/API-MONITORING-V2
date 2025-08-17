import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthToken from './useAuthToken';

/**
 * Custom hook for Socket.io real-time communication
 * Provides real-time monitor updates, alerts, and analytics
 */
export default function useSocket() {
  const { token, user } = useAuthToken();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [monitorUpdates, setMonitorUpdates] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Only connect if we have a token (user is authenticated)
    if (!token) return;

    // Initialize Socket.io connection
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    socketRef.current = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 Connected to server:', socket.id);
      setIsConnected(true);
      
      // Join user-specific room for targeted updates
      if (user?.id) {
        socket.emit('join-user-room', user.id);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    // Monitor check updates (real-time status changes)
    socket.on('monitor-check', (data) => {
      console.log('📊 Monitor check update:', data);
      setMonitorUpdates(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 updates
    });

    // User-specific monitor updates
    socket.on('user-monitor-check', (data) => {
      console.log('👤 User monitor check:', data);
      // Could trigger specific user UI updates here
    });

    // Alert notifications
    socket.on('monitor-alert', (data) => {
      console.log('🚨 Monitor alert:', data);
      setAlerts(prev => [data, ...prev.slice(0, 19)]); // Keep last 20 alerts
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Monitor Alert: ${data.url}`, {
          body: `Status changed from ${data.prevStatus} to ${data.status}`,
          icon: '/logo192.png',
          tag: `monitor-${data.monitorId}` // Prevent duplicate notifications
        });
      }
    });

    // User-specific alerts
    socket.on('user-alert', (data) => {
      console.log('👤 User alert:', data);
      
      // Show browser notification for user-specific alerts
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Your Monitor: ${data.url}`, {
          body: `Status is now ${data.status}`,
          icon: '/logo192.png',
          tag: `user-monitor-${data.monitorId}`
        });
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      setIsConnected(false);
    };
  }, [token, user?.id]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Utility functions
  const emitEvent = (eventName, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    }
  };

  const clearAlerts = () => setAlerts([]);
  const clearMonitorUpdates = () => setMonitorUpdates([]);

  return {
    isConnected,
    monitorUpdates,
    alerts,
    emitEvent,
    clearAlerts,
    clearMonitorUpdates,
    socket: socketRef.current
  };
}
