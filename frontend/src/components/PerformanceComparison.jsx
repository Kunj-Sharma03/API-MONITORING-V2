'use client';

import React, { useState, useEffect } from 'react';
import useAuthToken from '@/hooks/useAuthToken';
import useDashboardGraphQL from '@/hooks/useDashboardGraphQL';
import { useGraphQL } from '@/hooks/useGraphQL';

/**
 * Performance Comparison Component
 * Demonstrates the efficiency gains of GraphQL vs REST
 */
export default function PerformanceComparison() {
  const { token } = useAuthToken();
  const [metrics, setMetrics] = useState({
    rest: { requests: 0, totalTime: 0, dataSize: 0, calls: [] },
    graphql: { requests: 0, totalTime: 0, dataSize: 0, calls: [] }
  });
  const [isRunning, setIsRunning] = useState(false);

  // REST API simulation
  const runRestApiTest = async () => {
    if (!token) return;
    
    const startTime = performance.now();
    const calls = [];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      // Simulate the 4 separate REST calls that the original dashboard makes
      const endpoints = [
        '/api/monitor/all',
        '/api/analytics/overview?range=7d',
        '/api/analytics/uptime-history?range=7d',
        '/api/analytics/response-time?range=7d'
      ];

      let totalDataSize = 0;

      for (const endpoint of endpoints) {
        const callStart = performance.now();
        const response = await fetch(`${apiUrl}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const callEnd = performance.now();
        
        const dataSize = JSON.stringify(data).length;
        totalDataSize += dataSize;
        
        calls.push({
          endpoint,
          time: callEnd - callStart,
          size: dataSize,
          status: response.status
        });
      }

      const endTime = performance.now();
      
      return {
        requests: endpoints.length,
        totalTime: endTime - startTime,
        dataSize: totalDataSize,
        calls
      };
    } catch (error) {
      console.error('REST test failed:', error);
      return {
        requests: 0,
        totalTime: 0,
        dataSize: 0,
        calls: [],
        error: error.message
      };
    }
  };

  // GraphQL API test
  const runGraphQLTest = async () => {
    if (!token) return;
    
    const startTime = performance.now();
    
    try {
      const query = `
        query GetDashboardData($timeRange: String!) {
          me { id email created_at }
          monitors {
            id url interval_minutes alert_threshold is_active
            created_at last_checked_at status last_response_time
            last_status_code error_message
          }
          analytics(range: $timeRange) {
            overview {
              total_monitors active_monitors total_checks
              successful_checks failed_checks overall_uptime avg_response_time
            }
            uptimeHistory(range: $timeRange) {
              date uptime_percentage total_checks successful_checks
            }
            responseTimeHistory(range: $timeRange) {
              date avg_response_time min_response_time max_response_time
            }
          }
        }
      `;

      const { query: queryFn } = useGraphQL();
      const data = await queryFn(query, { timeRange: '7d' }, token);
      
      const endTime = performance.now();
      const dataSize = JSON.stringify(data).length;

      return {
        requests: 1, // Single GraphQL query
        totalTime: endTime - startTime,
        dataSize,
        calls: [{
          endpoint: '/graphql',
          time: endTime - startTime,
          size: dataSize,
          status: 200
        }]
      };
    } catch (error) {
      console.error('GraphQL test failed:', error);
      return {
        requests: 0,
        totalTime: 0,
        dataSize: 0,
        calls: [],
        error: error.message
      };
    }
  };

  const runComparison = async () => {
    setIsRunning(true);
    
    // Run REST test
    const restResults = await runRestApiTest();
    
    // Run GraphQL test
    const graphqlResults = await runGraphQLTest();
    
    setMetrics({
      rest: restResults,
      graphql: graphqlResults
    });
    
    setIsRunning(false);
  };

  const calculateSavings = () => {
    if (!metrics.rest.totalTime || !metrics.graphql.totalTime) return null;
    
    const timeSaving = ((metrics.rest.totalTime - metrics.graphql.totalTime) / metrics.rest.totalTime) * 100;
    const requestSaving = ((metrics.rest.requests - metrics.graphql.requests) / metrics.rest.requests) * 100;
    const dataSaving = metrics.rest.dataSize > 0 ? 
      ((metrics.rest.dataSize - metrics.graphql.dataSize) / metrics.rest.dataSize) * 100 : 0;
    
    return {
      time: Math.round(timeSaving * 100) / 100,
      requests: Math.round(requestSaving * 100) / 100,
      data: Math.round(dataSaving * 100) / 100
    };
  };

  const savings = calculateSavings();

  if (!token) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
        <p className="text-yellow-700">Please login to run performance comparison</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
        🏃‍♂️ REST vs GraphQL Performance
      </h3>
      
      <button
        onClick={runComparison}
        disabled={isRunning}
        className="mb-6 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-opacity-80 disabled:opacity-50 transition-colors"
      >
        {isRunning ? 'Running Tests...' : 'Run Performance Test'}
      </button>

      {(metrics.rest.requests > 0 || metrics.graphql.requests > 0) && (
        <div className="space-y-6">
          
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-center py-2">REST APIs</th>
                  <th className="text-center py-2">GraphQL</th>
                  <th className="text-center py-2">Improvement</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-2 font-medium">Network Requests</td>
                  <td className="text-center">{metrics.rest.requests}</td>
                  <td className="text-center">{metrics.graphql.requests}</td>
                  <td className="text-center text-green-400">
                    {savings ? `${savings.requests}%` : '-'}
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-2 font-medium">Total Time (ms)</td>
                  <td className="text-center">{Math.round(metrics.rest.totalTime)}</td>
                  <td className="text-center">{Math.round(metrics.graphql.totalTime)}</td>
                  <td className="text-center text-green-400">
                    {savings ? `${savings.time}%` : '-'}
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-2 font-medium">Data Size (bytes)</td>
                  <td className="text-center">{metrics.rest.dataSize.toLocaleString()}</td>
                  <td className="text-center">{metrics.graphql.dataSize.toLocaleString()}</td>
                  <td className="text-center text-green-400">
                    {savings && savings.data > 0 ? `${savings.data}%` : 'Similar'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* REST Calls */}
            <div className="bg-red-900 bg-opacity-20 border border-red-400 border-opacity-30 rounded-lg p-4">
              <h4 className="font-bold text-red-300 mb-3">REST API Calls ({metrics.rest.requests})</h4>
              <div className="space-y-2 text-xs">
                {metrics.rest.calls.map((call, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-red-200">{call.endpoint}</span>
                    <span className="text-red-300">{Math.round(call.time)}ms</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GraphQL Call */}
            <div className="bg-green-900 bg-opacity-20 border border-green-400 border-opacity-30 rounded-lg p-4">
              <h4 className="font-bold text-green-300 mb-3">GraphQL Query ({metrics.graphql.requests})</h4>
              <div className="space-y-2 text-xs">
                {metrics.graphql.calls.map((call, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-green-200">{call.endpoint}</span>
                    <span className="text-green-300">{Math.round(call.time)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          {savings && (
            <div className="bg-blue-900 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-2">Performance Summary</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• {metrics.rest.requests - metrics.graphql.requests} fewer network requests</li>
                <li>• {Math.round(metrics.rest.totalTime - metrics.graphql.totalTime)}ms faster response time</li>
                <li>• Single query eliminates waterfall loading</li>
                <li>• Reduced server load and bandwidth usage</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
