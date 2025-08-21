import { useState, useEffect, useMemo } from 'react';
import { useGraphQL } from './useGraphQL';
import useAuthToken from './useAuthToken';
import useSocket from './useSocket';

/**
 * Unified Dashboard Hook
 * Seamlessly uses GraphQL for efficient analytics and REST for other operations
 * Implementation details are hidden from the components
 */
export default function useUnifiedDashboard(timeRange = '7d') {
  const { query: graphqlQuery, loading: graphqlLoading, error: graphqlError } = useGraphQL();
  const { token } = useAuthToken();
  const { isConnected, monitorUpdates, alerts } = useSocket();
  
  const [dashboardData, setDashboardData] = useState({
    user: null,
    monitors: [],
    analytics: {
      overview: null,
      uptimeHistory: [],
      responseTime: [], // Fixed: was responseTimeHistory
      alertsHistory: []
    },
    loading: true,
    error: null
  });

  // Optimized GraphQL query for analytics data (more efficient than 4 REST calls)
  const ANALYTICS_QUERY = `
    query GetAnalytics($timeRange: String!) {
      analytics(range: $timeRange) {
        overview {
          total_monitors
          active_monitors
          total_checks
          successful_checks
          failed_checks
          overall_uptime
          avg_response_time
        }
        uptimeHistory(range: $timeRange) {
          date
          uptime_percentage
          total_checks
          successful_checks
        }
        responseTimeHistory(range: $timeRange) {
          date
          avg_response_time
          min_response_time
          max_response_time
        }
        alertsHistory(range: $timeRange) {
          date
          alert_count
        }
      }
    }
  `;

  // GraphQL query for user info (simpler than REST)
  const USER_QUERY = `
    query GetUser {
      me {
        id
        email
      }
    }
  `;

  // Fetch user data using GraphQL (efficient)
  const fetchUserData = async () => {
    if (!token) return null;
    
    try {
      const data = await graphqlQuery(USER_QUERY, {}, token);
      return data.me;
    } catch (error) {
      console.warn('GraphQL user query failed, user will be null:', error.message);
      return null;
    }
  };

  // Fetch monitors using REST (existing implementation works well)
  const fetchMonitors = async () => {
    if (!token) return [];
    
    try {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const response = await fetch(`${apiUrl}/api/monitor/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.monitors || [];
    } catch (error) {
      console.error('REST monitors fetch failed:', error);
      return [];
    }
  };

  // Fetch analytics using GraphQL (much more efficient than 4 REST calls)
  const fetchAnalytics = async () => {
    if (!token) return {
      overview: null,
      uptimeHistory: [],
      responseTime: [], // Fixed naming
      alertsHistory: []
    };
    
    try {
      const data = await graphqlQuery(ANALYTICS_QUERY, { timeRange }, token);
      const analytics = data.analytics || {};
      
      // Map GraphQL response to component-expected structure
      return {
        overview: analytics.overview || null,
        uptimeHistory: analytics.uptimeHistory || [],
        responseTime: analytics.responseTimeHistory || [], // Map responseTimeHistory to responseTime
        alertsHistory: analytics.alertsHistory || []
      };
    } catch (error) {
      console.error('GraphQL analytics query failed:', error);
      // Fallback: could implement REST analytics here if needed
      return {
        overview: null,
        uptimeHistory: [],
        responseTime: [], // Consistent naming
        alertsHistory: []
      };
    }
  };

  // Main data fetching function
  const fetchDashboardData = async () => {
    if (!token) {
      setDashboardData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch data concurrently for better performance
      const [userData, monitorsData, analyticsData] = await Promise.all([
        fetchUserData(),
        fetchMonitors(),
        fetchAnalytics()
      ]);

      setDashboardData({
        user: userData,
        monitors: monitorsData,
        analytics: analyticsData,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Dashboard data fetch failed:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch dashboard data'
      }));
    }
  };

  // Fetch data when token or time range changes
  useEffect(() => {
    fetchDashboardData();
  }, [token, timeRange]);

  // Merge real-time updates with existing data
  const enhancedMonitors = useMemo(() => {
    if (!dashboardData.monitors.length || !monitorUpdates.size) {
      return dashboardData.monitors;
    }

    return dashboardData.monitors.map(monitor => {
      const realTimeUpdate = monitorUpdates.get(monitor.id);
      if (realTimeUpdate) {
        return {
          ...monitor,
          latest_status: realTimeUpdate.status,
          last_response_time: realTimeUpdate.responseTime,
          last_status_code: realTimeUpdate.statusCode,
          last_checked_at: realTimeUpdate.lastChecked
        };
      }
      return monitor;
    });
  }, [dashboardData.monitors, monitorUpdates]);

  // Computed statistics
  const monitorStats = useMemo(() => {
    const monitors = enhancedMonitors;
    return {
      total: monitors.length,
      active: monitors.filter(m => m.is_active).length,
      online: monitors.filter(m => m.latest_status === 'UP').length,
      offline: monitors.filter(m => m.latest_status === 'DOWN').length,
      avgResponseTime: monitors.length > 0 ? 
        monitors.reduce((acc, m) => acc + (m.last_response_time || 0), 0) / monitors.length : 0
    };
  }, [enhancedMonitors]);

  const recentAlerts = useMemo(() => {
    if (!dashboardData.analytics.alertsHistory.length) return 0;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return dashboardData.analytics.alertsHistory
      .filter(point => new Date(point.date) >= yesterday)
      .reduce((total, point) => total + point.alert_count, 0);
  }, [dashboardData.analytics.alertsHistory]);

  const isLoading = dashboardData.loading || graphqlLoading;
  const error = dashboardData.error || graphqlError;

  return {
    // Data
    user: dashboardData.user,
    monitors: enhancedMonitors,
    analytics: dashboardData.analytics,
    
    // Real-time data
    isConnected,
    alerts,
    
    // Computed stats
    monitorStats,
    recentAlerts,
    
    // Status
    loading: isLoading,
    error,
    
    // Actions
    refetch: fetchDashboardData,
    
    // Performance info (hidden implementation detail)
    _performanceInfo: {
      analyticsMethod: 'GraphQL (1 query)',
      monitorsMethod: 'REST (1 query)', 
      userMethod: 'GraphQL (1 query)',
      totalQueries: 3,
      note: 'GraphQL used for analytics efficiency, REST kept for monitors compatibility'
    }
  };
}
