'use client';

import React, { useState, useMemo } from 'react';
import useUnifiedDashboard from '@/hooks/useUnifiedDashboard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Chart from '@/components/ui/Chart';
import SplitText from '@/components/ui/SplitText';
import { useRouter } from 'next/navigation';
import { MonitorIcon, Activity, AlertTriangle, TrendingUp, ChevronDown, Wifi, WifiOff } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');

  // Unified dashboard hook (uses GraphQL for analytics, REST for monitors)
  const {
    monitors,
    analytics,
    isConnected,
    loading
  } = useUnifiedDashboard(timeRange);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Memoize SplitText animation props to prevent infinite re-renders
  const splitTextFrom = useMemo(() => ({ opacity: 0, y: 40 }), []);
  const splitTextTo = useMemo(() => ({ opacity: 1, y: 0 }), []);

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-text-primary)]">
  <main className="flex-1 py-6 md:py-10 pt-16 md:pt-10 bg-transparent min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          {/* Hero Section - Limit to viewport but not force entire page lock */}
          <div className="relative flex flex-col items-center justify-center w-full min-h-[85vh]">
            {/* Top Actions */}
            <div className="absolute right-4 md:right-8 top-8 flex items-center gap-4 z-10">
              {/* Real-time Connection Status */}
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-genz-primary ${
                  isConnected
                    ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                    : 'bg-red-500/10 text-red-400 border border-red-400/30'
                }`}
              >
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
                className="bg-red-500/20 text-white border border-red-500/30 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-all duration-300 text-base font-medium font-genz-primary"
              >
                Logout
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center w-full h-full">
              <SplitText
                text="Hello, User"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold font-orcherum text-center mb-6 text-white"
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

              {/* Main Stats - Total and Active Monitors */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 items-center justify-center z-10">
                <div className="flex flex-col items-center gap-1 bg-black/60 backdrop-blur-lg border border-[#00ff88]/50 rounded-xl px-8 sm:px-10 py-6 sm:py-8 min-w-[160px] sm:min-w-[180px] shadow-xl hover:border-[#00ff88]/70 hover:bg-black/70 transition-all duration-300">
                  <MonitorIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ff88] mb-2" />
                  <span className="text-sm text-gray-200 font-genz-primary">Total Monitors</span>
                  <span className="text-2xl sm:text-3xl font-bold font-orcherum text-white">
                    {loading ? '...' : (monitors || []).length}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-black/60 backdrop-blur-lg border border-[#00ff88]/50 rounded-xl px-8 sm:px-10 py-6 sm:py-8 min-w-[160px] sm:min-w-[180px] shadow-xl hover:border-[#00ff88]/70 hover:bg-black/70 transition-all duration-300">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00ff88] inline-block mb-2 shadow-lg" />
                  <span className="text-sm text-gray-200 font-genz-primary">Active</span>
                  <span className="text-2xl sm:text-3xl font-bold font-orcherum text-white">
                    {loading ? '...' : (monitors || []).filter(m => m.is_active).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Scroll Indicator - fixed at bottom of viewport */}
            <div className="absolute bottom-4 md:bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce pointer-events-none select-none z-20">
              <span className="text-sm text-gray-300 mb-2 font-medium font-genz-primary">Scroll for Analytics</span>
              <ChevronDown className="w-6 h-6 text-[#00ff88]" />
            </div>
          </div>

          {/* Time Range Selector */}
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur={true}
            baseRotation={1}
            blurStrength={4}
            containerClassName="time-range-selector"
          >
            <div className="w-full flex justify-center mb-8">
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

          {/* Small spacer to ensure scroll continues past hero */}
          <div className="h-4" />

          {/* Overview Stats */}
          <ScrollReveal 
            baseOpacity={0.1} 
            enableBlur={true} 
            baseRotation={1} 
            blurStrength={4}
            containerClassName="overview-stats"
          >
            <div className="w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white font-orcherum">
                Overview Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Average Uptime */}
                <div className="bg-black/60 backdrop-blur-lg border border-[#00ff88]/50 rounded-xl p-6 text-center shadow-xl hover:border-[#00ff88]/70 hover:bg-black/70 transition-all duration-300">
                  <Activity className="w-8 h-8 text-[#00ff88] mx-auto mb-3" />
                  <h3 className="text-sm text-gray-200 mb-2 font-genz-primary">Average Uptime</h3>
                  <p className="text-2xl font-bold text-white font-orcherum">
                    {loading ? '...' : `${(analytics.overview?.overall_uptime ?? 0)}%`}
                  </p>
                </div>

                {/* Response Time */}
                <div className="bg-black/60 backdrop-blur-lg border border-[#00ff88]/50 rounded-xl p-6 text-center shadow-xl hover:border-[#00ff88]/70 hover:bg-black/70 transition-all duration-300">
                  <TrendingUp className="w-8 h-8 text-[#44ff44] mx-auto mb-3" />
                  <h3 className="text-sm text-gray-200 mb-2 font-genz-primary">Avg Response Time</h3>
                  <p className="text-2xl font-bold text-white font-orcherum">
                    {loading ? '...' : `${(analytics.overview?.avg_response_time ?? 0)}ms`}
                  </p>
                </div>

                {/* Total Alerts */}
                <div className="bg-black/60 backdrop-blur-lg border border-[#00ff88]/50 rounded-xl p-6 text-center shadow-xl hover:border-[#00ff88]/70 hover:bg-black/70 transition-all duration-300">
                  <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-sm text-gray-200 mb-2 font-genz-primary">Total Alerts</h3>
                  <p className="text-2xl font-bold text-white font-orcherum">
                    {loading ? '...' : (analytics.alertsHistory || []).reduce((sum, a) => sum + (a.alert_count || 0), 0)}
                  </p>
                </div>

                {/* Active Incidents (fallback to 0 if not available) */}
                <div className="bg-black/60 backdrop-blur-lg border border-[#00ff88]/50 rounded-xl p-6 text-center shadow-xl hover:border-[#00ff88]/70 hover:bg-black/70 transition-all duration-300">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <h3 className="text-sm text-gray-200 mb-2 font-genz-primary">Active Incidents</h3>
                  <p className="text-2xl font-bold text-white font-orcherum">
                    {loading ? '...' : 0}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Uptime Trend Chart */}
          <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
            <div className="w-full mt-10 md:mt-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white font-orcherum">
                Uptime Trend
              </h2>
              
              <div 
                className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl mx-auto"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(235,255,235,0.38) 0%, rgba(210,255,210,0.18) 100%)',
                  minHeight: '400px'
                }}
              >
                {loading ? (
                  <div className="w-full h-[350px] flex items-center justify-center">
                    <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                  </div>
                ) : (analytics.uptimeHistory || []).length === 0 ? (
                  <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
                    <Activity className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-secondary)] text-lg">No uptime data available</p>
                  </div>
                ) : (
                  <Chart
                    type="line"
                    className="w-full h-[350px]"
                    height={350}
                    data={{
                      labels: (analytics.uptimeHistory || []).map(item => {
                        const date = new Date(item.date + 'T00:00:00');
                        return date.toLocaleDateString();
                      }),
                      datasets: [{
                        label: 'Uptime %',
                        data: (analytics.uptimeHistory || []).map(item => item.uptime_percentage ?? 0),
                        borderColor: 'rgba(34, 197, 94, 1)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                        },
                        x: {
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Response Time Trend */}
          <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
            <div className="w-full mt-10 md:mt-14">
              <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)] font-orcherum">
                Response Time Trend
              </h2>
              
              <div 
                className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl mx-auto"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,240,225,0.38) 0%, rgba(255,220,210,0.18) 100%)',
                  minHeight: '400px'
                }}
              >
                {loading ? (
                  <div className="w-full h-[350px] flex items-center justify-center">
                    <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                  </div>
                ) : (analytics.responseTime || []).length === 0 ? (
                  <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
                    <TrendingUp className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-secondary)] text-lg">No response time data available</p>
                  </div>
                ) : (
                  <Chart
                    type="line"
                    className="w-full h-[350px]"
                    height={350}
                    data={{
                      labels: (analytics.responseTime || []).map(item => {
                        const date = new Date(item.date + 'T00:00:00');
                        return date.toLocaleDateString();
                      }),
                      datasets: [{
                        label: 'Response Time (ms)',
                        data: (analytics.responseTime || []).map(item => item.avg_response_time ?? 0),
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgba(255, 159, 64, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                        },
                        x: {
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Alerts History Chart */}
          <ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={1} blurStrength={4}>
            <div className="w-full mt-10 md:mt-14">
              <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)] font-orcherum">
                Alerts History
              </h2>
              
              <div 
                className="bg-[var(--color-surface)] bg-opacity-70 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl mx-auto"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,235,235,0.38) 0%, rgba(255,210,210,0.18) 100%)',
                  minHeight: '400px'
                }}
              >
                {loading ? (
                  <div className="w-full h-[350px] flex items-center justify-center">
                    <div className="animate-pulse w-2/3 h-2/3 bg-[var(--color-surface)] rounded-2xl opacity-60" />
                  </div>
                ) : (analytics.alertsHistory || []).length === 0 ? (
                  <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="w-16 h-16 text-[var(--color-text-secondary)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-secondary)] text-lg">No alerts data available</p>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-2">Data will appear when alerts are triggered</p>
                  </div>
                ) : (
                  <Chart
                    type="bar"
                    className="w-full h-[350px]"
                    height={350}
                    data={{
                      labels: (analytics.alertsHistory || []).map(item => {
                        const date = new Date(item.date + 'T00:00:00');
                        return date.toLocaleDateString();
                      }),
                      datasets: [{
                        label: 'Alerts',
                        data: (analytics.alertsHistory || []).map(item => item.alert_count ?? 0),
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                        },
                        x: {
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Call to Action */}
          <ScrollReveal baseOpacity={0.05} enableBlur={true} baseRotation={2} blurStrength={6} animationEnd="bottom bottom">
            <div className="w-full text-center py-24">
              <h2 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)] font-orcherum">
                Ready to dive deeper?
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8">
                Explore detailed per-monitor analytics, manage your monitors, and view comprehensive reports.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard/analytics')}
                  className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all"
                >
                  Detailed Analytics
                </button>
                <button
                  onClick={() => router.push('/dashboard/monitors')}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-8 py-3 rounded-lg font-medium hover:bg-opacity-80 transition-all"
                >
                  Manage Monitors
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
