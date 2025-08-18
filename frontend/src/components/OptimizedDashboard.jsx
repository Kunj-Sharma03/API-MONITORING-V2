'use client';

import React, { useState, useMemo } from 'react';
import useDashboardGraphQL from '@/hooks/useDashboardGraphQL';
import useSocket from '@/hooks/useSocket';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Chart from '@/components/ui/Chart';
import SplitText from '@/components/ui/SplitText';
import { useRouter } from 'next/navigation';
import { MonitorIcon, Activity, AlertTriangle, TrendingUp, ChevronDown, Wifi, WifiOff, Zap } from 'lucide-react';

/**
 * Optimized Dashboard using GraphQL
 * Single query replaces 4+ REST API calls for better performance
 */
export default function OptimizedDashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');
  
  // 🚀 Single GraphQL query for ALL dashboard data
  const {
    user,
    monitors,
    analytics,
    monitorStats,
    recentAlerts,
    loading,
    error,
    refetch,
    dataEfficiency
  } = useDashboardGraphQL(timeRange);

  // Real-time socket connection (still needed for live updates)
  const { isConnected, monitorUpdates, alerts } = useSocket();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Memoize animation props
  const splitTextFrom = useMemo(() => ({ opacity: 0, y: 40 }), []);
  const splitTextTo = useMemo(() => ({ opacity: 1, y: 0 }), []);

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Dashboard</h2>
          <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-opacity-80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <main className="flex-1 px-4 md:px-8 py-6 md:py-10 pt-16 md:pt-10 bg-[var(--color-bg)] bg-opacity-80 min-h-screen">
        
        {/* Hero Section */}
        <div className="relative flex flex-col items-center justify-center w-full min-h-screen">
          
          {/* Top Actions */}
          <div className="absolute right-8 top-8 flex items-center gap-4 z-10">
            
            {/* GraphQL Efficiency Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded text-sm bg-purple-900 bg-opacity-20 text-purple-400 border border-purple-400 border-opacity-30">
              <Zap className="w-3 h-3" />
              <span>GraphQL</span>
            </div>
            
            {/* Real-time Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
              isConnected 
                ? 'bg-green-900 bg-opacity-20 text-green-400 border border-green-400 border-opacity-30' 
                : 'bg-red-900 bg-opacity-20 text-red-400 border border-red-400 border-opacity-30'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-[var(--color-error)] text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-base font-medium"
            >
              Logout
            </button>
          </div>
          
          {/* Main Content */}
          <div className="flex flex-col items-center justify-center w-full h-full -mt-16">
            <SplitText
              text={`Hello, ${user?.email || 'User'}!`}
              className="text-4xl font-bold font-sans text-center mb-6"
              delay={60}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={splitTextFrom}
              to={splitTextTo}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
            
            {/* Main Stats */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 items-center justify-center z-10">
              <div className="flex flex-col items-center gap-1 bg-[var(--color-surface)] bg-opacity-80 border border-[var(--color-border)] rounded-lg px-8 sm:px-10 py-6 sm:py-8 min-w-[160px] sm:min-w-[180px] shadow-md">
                <MonitorIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--color-primary)] mb-2" />
                <span className="text-sm text-[var(--color-text-secondary)] font-sans">Total Monitors</span>
                <span className="text-2xl sm:text-3xl font-bold font-sans">
                  {loading ? '...' : monitorStats.total}
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1 bg-[var(--color-surface)] bg-opacity-80 border border-[var(--color-border)] rounded-lg px-8 sm:px-10 py-6 sm:py-8 min-w-[160px] sm:min-w-[180px] shadow-md">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--color-success)] inline-block mb-2" />
                <span className="text-sm text-[var(--color-text-secondary)] font-sans">Active</span>
                <span className="text-2xl sm:text-3xl font-bold font-sans">
                  {loading ? '...' : monitorStats.active}
                </span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 flex flex-col items-center animate-bounce">
            <span className="text-sm text-[var(--color-text-secondary)] mb-2 font-medium">Scroll for Analytics</span>
            <ChevronDown className="w-6 h-6 text-[var(--color-text-secondary)]" />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="w-full space-y-16 pb-32">
          
          {/* Time Range Selector */}
          <ScrollReveal 
            baseOpacity={0.1} 
            enableBlur={true} 
            baseRotation={1} 
            blurStrength={4}
            containerClassName="time-range-selector"
          >
            <div className="w-full max-w-7xl mx-auto flex justify-center mb-8">
              <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">Time Range:</span>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-[var(--color-bg)] bg-opacity-80 border border-[var(--color-border)] text-[var(--color-text-primary)] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Data Efficiency Banner */}
          <ScrollReveal 
            baseOpacity={0.1} 
            enableBlur={true} 
            baseRotation={1} 
            blurStrength={4}
            containerClassName="efficiency-banner"
          >
            <div className="w-full max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-20 border border-purple-400 border-opacity-30 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <Zap className="w-8 h-8 text-purple-400" />
                  <h3 className="text-xl font-bold text-purple-300">GraphQL Optimization Active</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-purple-200">
                    <strong>Network Efficiency:</strong><br />
                    {dataEfficiency.reducedNetworkCalls}
                  </div>
                  <div className="text-purple-200">
                    <strong>Data Fetching:</strong><br />
                    {dataEfficiency.optimizedFields}
                  </div>
                  <div className="text-purple-200">
                    <strong>Relationships:</strong><br />
                    {dataEfficiency.relationshipLoading}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Overview Stats */}
          <ScrollReveal 
            baseOpacity={0.1} 
            enableBlur={true} 
            baseRotation={1} 
            blurStrength={4}
            containerClassName="overview-stats"
          >
            <div className="w-full max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)]">
                Overview Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Average Uptime */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 text-center shadow-lg">
                  <Activity className="w-8 h-8 text-[var(--color-success)] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Average Uptime</h3>
                  <p className="text-3xl font-bold text-[var(--color-success)]">
                    {loading ? '...' : `${analytics.overview?.overall_uptime || 0}%`}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    {analytics.overview?.total_checks || 0} total checks
                  </p>
                </div>

                {/* Average Response Time */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 text-center shadow-lg">
                  <TrendingUp className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Avg Response Time</h3>
                  <p className="text-3xl font-bold text-[var(--color-primary)]">
                    {loading ? '...' : `${analytics.overview?.avg_response_time || 0}ms`}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    Across all monitors
                  </p>
                </div>

                {/* Total Alerts */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 text-center shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-[var(--color-warning)] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Recent Alerts</h3>
                  <p className="text-3xl font-bold text-[var(--color-warning)]">
                    {loading ? '...' : recentAlerts}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    Last 24 hours
                  </p>
                </div>

                {/* Monitor Status */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 text-center shadow-lg">
                  <MonitorIcon className="w-8 h-8 text-[var(--color-info)] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Online Monitors</h3>
                  <p className="text-3xl font-bold text-[var(--color-info)]">
                    {loading ? '...' : `${monitorStats.online}/${monitorStats.total}`}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    Currently active
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Charts Section */}
          {!loading && analytics.uptimeHistory?.length > 0 && (
            <ScrollReveal 
              baseOpacity={0.1} 
              enableBlur={true} 
              baseRotation={1} 
              blurStrength={4}
              containerClassName="charts-section"
            >
              <div className="w-full max-w-7xl mx-auto space-y-8">
                
                {/* Uptime Chart */}
                <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">📈 Uptime History</h3>
                  <Chart
                    data={analytics.uptimeHistory}
                    type="line"
                    xKey="date"
                    yKey="uptime_percentage"
                    color="var(--color-success)"
                    height={300}
                  />
                </div>

                {/* Response Time Chart */}
                {analytics.responseTimeHistory?.length > 0 && (
                  <div className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">⚡ Response Time History</h3>
                    <Chart
                      data={analytics.responseTimeHistory}
                      type="line"
                      xKey="date"
                      yKey="avg_response_time"
                      color="var(--color-primary)"
                      height={300}
                    />
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>
      </main>
    </div>
  );
}
