import { useState, useEffect } from 'react';
import { useGraphQL } from './useGraphQL';
import useAuthToken from './useAuthToken';

/**
 * Optimized Dashboard Hook using GraphQL
 * Replaces multiple REST API calls with a single efficient GraphQL query
 */
export default function useDashboardGraphQL(timeRange = '7d') {
  const { query, loading: graphqlLoading, error: graphqlError } = useGraphQL();
  const { token } = useAuthToken();
  
  const [dashboardData, setDashboardData] = useState({
    user: null,
    monitors: [],
    analytics: {
      overview: null,
      uptimeHistory: [],
      responseTimeHistory: [],
      alertsHistory: []
    },
    loading: true,
    error: null
  });

  // Single GraphQL query to fetch all dashboard data efficiently
  const DASHBOARD_QUERY = `
    query GetDashboardData($timeRange: String!) {
      me {
        id
        email
      }
      
      monitors {
        id
        url
        interval_minutes
        alert_threshold
        is_active
        created_at
        last_checked_at
        status
        last_response_time
        last_status_code
        stats {
          total_checks
          successful_checks
          failed_checks
          uptime_percentage
          avg_response_time
          last_24h_checks
          last_24h_uptime
        }
      }
      
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

  const fetchDashboardData = async () => {
    if (!token) {
      setDashboardData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🚀 Fetching dashboard data via GraphQL...', { timeRange });
      
      const data = await query(DASHBOARD_QUERY, { timeRange }, token);
      
      console.log('✅ GraphQL dashboard data received:', {
        user: data.me?.email,
        monitorsCount: data.monitors?.length || 0,
        analyticsOverview: data.analytics?.overview,
        uptimeHistoryPoints: data.analytics?.uptimeHistory?.length || 0,
        responseTimePoints: data.analytics?.responseTimeHistory?.length || 0,
        alertHistoryPoints: data.analytics?.alertsHistory?.length || 0
      });

      setDashboardData({
        user: data.me,
        monitors: data.monitors || [],
        analytics: {
          overview: data.analytics?.overview || null,
          uptimeHistory: data.analytics?.uptimeHistory || [],
          responseTimeHistory: data.analytics?.responseTimeHistory || [],
          alertsHistory: data.analytics?.alertsHistory || []
        },
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ GraphQL dashboard query failed:', error);
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

  // Utility functions for data access
  const getMonitorStats = () => {
    const { monitors } = dashboardData;
    return {
      total: monitors.length,
      active: monitors.filter(m => m.is_active).length,
      online: monitors.filter(m => m.status === 'UP').length,
      offline: monitors.filter(m => m.status === 'DOWN').length,
      avgResponseTime: monitors.reduce((acc, m) => acc + (m.last_response_time || 0), 0) / (monitors.length || 1)
    };
  };

  const getRecentAlerts = () => {
    // Extract alerts from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return dashboardData.analytics.alertsHistory
      .filter(point => new Date(point.date) >= yesterday)
      .reduce((total, point) => total + point.alert_count, 0);
  };

  const isLoading = dashboardData.loading || graphqlLoading;
  const error = dashboardData.error || graphqlError;

  return {
    // Data
    user: dashboardData.user,
    monitors: dashboardData.monitors,
    analytics: dashboardData.analytics,
    
    // Computed stats
    monitorStats: getMonitorStats(),
    recentAlerts: getRecentAlerts(),
    
    // Status
    loading: isLoading,
    error,
    
    // Actions
    refetch: fetchDashboardData,
    
    // Benefits tracking
    dataEfficiency: {
      singleQuery: true,
      reducedNetworkCalls: '4 REST calls → 1 GraphQL query',
      optimizedFields: 'Only requested fields fetched',
      relationshipLoading: 'Efficient joins via GraphQL resolvers'
    }
  };
}
