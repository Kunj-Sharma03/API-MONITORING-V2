import React from 'react';
import useSocket from '@/hooks/useSocket';
import { Activity, Wifi, WifiOff, Bell, Clock } from 'lucide-react';

/**
 * Real-time Dashboard Component
 * Shows live monitor updates and alerts using Socket.io
 */
export default function RealTimeDashboard() {
  const { 
    isConnected, 
    monitorUpdates, 
    alerts, 
    clearAlerts,
    clearMonitorUpdates 
  } = useSocket();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        {isConnected ? (
          <>
            <Wifi className="w-5 h-5 text-green-500" />
            <span className="text-green-700">Real-time connection active</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-red-500" />
            <span className="text-red-700">Connection offline</span>
          </>
        )}
      </div>

      {/* Live Monitor Updates */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Live Monitor Updates</h3>
          </div>
          <button
            onClick={clearMonitorUpdates}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {monitorUpdates.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Waiting for monitor updates...
            </p>
          ) : (
            monitorUpdates.map((update, index) => (
              <div
                key={`${update.monitorId}-${update.timestamp}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-l-blue-400"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        update.status === 'UP' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></span>
                    <span className="font-medium">{update.url}</span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        update.status === 'UP'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {update.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Response: {update.responseTime}ms | Code: {update.statusCode}
                    {update.errorMessage && (
                      <span className="text-red-600"> | {update.errorMessage}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(update.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">Live Alerts</h3>
            {alerts.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {alerts.length}
              </span>
            )}
          </div>
          <button
            onClick={clearAlerts}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No recent alerts
            </p>
          ) : (
            alerts.map((alert, index) => (
              <div
                key={`${alert.monitorId}-${alert.timestamp}-${index}`}
                className="p-4 bg-red-50 border-l-4 border-l-red-500 rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-red-800">{alert.url}</span>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Status Change
                      </span>
                    </div>
                    <p className="text-sm text-red-700">
                      Changed from <strong>{alert.prevStatus}</strong> to{' '}
                      <strong>{alert.status}</strong>
                    </p>
                    <div className="text-xs text-red-600 mt-1">
                      Response: {alert.responseTime}ms | Code: {alert.statusCode}
                      {alert.errorMessage && (
                        <span> | {alert.errorMessage}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-red-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
