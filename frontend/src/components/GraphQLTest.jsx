'use client';

import React, { useState } from 'react';
import { useGraphQL, MONITOR_QUERIES } from '@/hooks/useGraphQL';
import useAuthToken from '@/hooks/useAuthToken';

/**
 * GraphQL Testing Component
 * Demonstrates hybrid REST + GraphQL integration
 */
export default function GraphQLTest() {
  const { query, mutate, loading, error } = useGraphQL();
  const { token } = useAuthToken();
  const [result, setResult] = useState(null);
  const [queryType, setQueryType] = useState('monitors');

  const runQuery = async (queryName) => {
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      let data;
      setQueryType(queryName);
      
      switch (queryName) {
        case 'me':
          data = await query(`
            query GetMe {
              me {
                id
                email
                created_at
              }
            }
          `, {}, token);
          break;
          
        case 'monitors':
          data = await query(MONITOR_QUERIES.GET_MONITORS, {}, token);
          break;
          
        case 'createMonitor':
          data = await mutate(MONITOR_QUERIES.CREATE_MONITOR, {
            input: {
              url: "https://httpstat.us/200",
              interval_minutes: 5,
              alert_threshold: 3
            }
          }, token);
          break;
          
        default:
          break;
      }
      
      setResult(data);
    } catch (err) {
      console.error('GraphQL Error:', err);
    }
  };

  if (!token) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <p className="text-yellow-700">Please login to test GraphQL queries</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg mb-6">
      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
        🚀 GraphQL Integration Test
      </h3>
      
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => runQuery('me')}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading && queryType === 'me' ? 'Loading...' : 'Get User Info'}
        </button>
        
        <button
          onClick={() => runQuery('monitors')}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading && queryType === 'monitors' ? 'Loading...' : 'Get Monitors'}
        </button>
        
        <button
          onClick={() => runQuery('createMonitor')}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {loading && queryType === 'createMonitor' ? 'Creating...' : 'Create Test Monitor'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto">
          <h4 className="text-white mb-2">GraphQL Response:</h4>
          <pre className="text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-[var(--color-text-secondary)]">
        <p><strong>Endpoints Active:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>📡 REST API: <code>{`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api`}</code></li>
          <li>🚀 GraphQL: <code>{`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/graphql`}</code></li>
          <li>🌐 Socket.io: <code>{`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}`}</code></li>
        </ul>
      </div>
    </div>
  );
}
