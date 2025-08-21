// GraphQL client utility for frontend integration
import { useState, useEffect } from 'react';

/**
 * Simple GraphQL client hook
 * Works alongside existing REST API calls
 */
export function useGraphQL() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = async (queryString, variables = {}, token = null) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          query: queryString,
          variables
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setLoading(false);
      return result.data;

    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const mutate = async (mutationString, variables = {}, token = null) => {
    return query(mutationString, variables, token);
  };

  return { query, mutate, loading, error };
}

/**
 * GraphQL queries for monitors
 */
export const MONITOR_QUERIES = {
  GET_MONITORS: `
    query GetMonitors {
      monitors {
        id
        url
        status
        last_response_time
        last_status_code
        created_at
        is_active
        interval_minutes
      }
    }
  `,

  GET_MONITOR_DETAILS: `
    query GetMonitorDetails($id: ID!) {
      monitor(id: $id) {
        id
        url
        status
        last_response_time
        last_status_code
        created_at
        is_active
        interval_minutes
        alert_threshold
        logs(limit: 10) {
          id
          status
          response_time
          status_code
          timestamp
          error_message
        }
        alerts(limit: 5) {
          id
          reason
          error_message
          created_at
        }
        stats {
          total_checks
          successful_checks
          failed_checks
          uptime_percentage
          avg_response_time
          last_24h_uptime
        }
      }
    }
  `,

  CREATE_MONITOR: `
    mutation CreateMonitor($input: CreateMonitorInput!) {
      createMonitor(input: $input) {
        id
        url
        status
        created_at
        is_active
      }
    }
  `,

  UPDATE_MONITOR: `
    mutation UpdateMonitor($id: ID!, $input: UpdateMonitorInput!) {
      updateMonitor(id: $id, input: $input) {
        id
        url
        is_active
        interval_minutes
        alert_threshold
      }
    }
  `,

  DELETE_MONITOR: `
    mutation DeleteMonitor($id: ID!) {
      deleteMonitor(id: $id)
    }
  `
};

/**
 * Enhanced monitors hook using GraphQL
 * Can be used alongside or instead of useMonitorsSWR
 */
export function useMonitorsGraphQL() {
  const { query, mutate, loading, error } = useGraphQL();
  const [monitors, setMonitors] = useState([]);

  // Get auth token (reuse your existing logic)
  const getToken = () => {
    if (typeof window !== 'undefined') {
  // Align with the rest of the app which stores JWT under 'token'
  return localStorage.getItem('token');
    }
    return null;
  };

  const fetchMonitors = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const data = await query(MONITOR_QUERIES.GET_MONITORS, {}, token);
      setMonitors(data.monitors || []);
    } catch (err) {
      console.error('GraphQL fetch monitors error:', err);
    }
  };

  const createMonitor = async (input) => {
    const token = getToken();
    const data = await mutate(MONITOR_QUERIES.CREATE_MONITOR, { input }, token);
    await fetchMonitors(); // Refresh list
    return data.createMonitor;
  };

  const updateMonitor = async (id, input) => {
    const token = getToken();
    const data = await mutate(MONITOR_QUERIES.UPDATE_MONITOR, { id, input }, token);
    await fetchMonitors(); // Refresh list
    return data.updateMonitor;
  };

  const deleteMonitor = async (id) => {
    const token = getToken();
    const data = await mutate(MONITOR_QUERIES.DELETE_MONITOR, { id }, token);
    await fetchMonitors(); // Refresh list
    return data.deleteMonitor;
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  return {
    monitors,
    loading,
    error,
    fetchMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor
  };
}
