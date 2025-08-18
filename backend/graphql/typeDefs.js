const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # User type
  type User {
    id: ID!
    email: String!
    monitors: [Monitor!]!
  }

  # Monitor type
  type Monitor {
    id: ID!
    user_id: ID!
    url: String!
    interval_minutes: Int!
    alert_threshold: Int!
    is_active: Boolean!
    created_at: String!
    last_checked_at: String
    status: String
    last_response_time: Int
    last_status_code: Int
    
    # Relationships
    logs(limit: Int = 50): [MonitorLog!]!
    alerts(limit: Int = 20): [Alert!]!
    stats: MonitorStats
  }

  # Monitor log entry
  type MonitorLog {
    id: ID!
    monitor_id: ID!
    status: String!
    response_time: Int
    status_code: Int
    timestamp: String!
  }

  # Alert type
  type Alert {
    id: ID!
    monitor_id: ID!
    reason: String!
    error_message: String
    triggered_at: String!
    
    # Relationships
    monitor: Monitor!
  }

  # Monitor statistics
  type MonitorStats {
    total_checks: Int!
    successful_checks: Int!
    failed_checks: Int!
    uptime_percentage: Float!
    avg_response_time: Float
    last_24h_checks: Int!
    last_24h_uptime: Float!
  }

  # Analytics types
  type Analytics {
    overview: AnalyticsOverview!
    uptimeHistory(range: String = "7d"): [UptimeDataPoint!]!
    responseTimeHistory(range: String = "7d"): [ResponseTimeDataPoint!]!
    alertsHistory(range: String = "7d"): [AlertHistoryDataPoint!]!
  }

  type AnalyticsOverview {
    total_monitors: Int!
    active_monitors: Int!
    total_checks: Int!
    successful_checks: Int!
    failed_checks: Int!
    overall_uptime: Float!
    avg_response_time: Float
    total_alerts: Int!
    active_incidents: Int!
  }

  type UptimeDataPoint {
    date: String!
    uptime_percentage: Float!
    total_checks: Int!
    successful_checks: Int!
  }

  type ResponseTimeDataPoint {
    date: String!
    avg_response_time: Float!
    min_response_time: Int
    max_response_time: Int
  }

  type AlertHistoryDataPoint {
    date: String!
    alert_count: Int!
  }

  # Input types for mutations
  input CreateMonitorInput {
    url: String!
    interval_minutes: Int = 5
    alert_threshold: Int = 3
  }

  input UpdateMonitorInput {
    url: String
    interval_minutes: Int
    alert_threshold: Int
    is_active: Boolean
  }

  # Root Query type
  type Query {
    # User queries
    me: User
    
    # Monitor queries
    monitors: [Monitor!]!
    monitor(id: ID!): Monitor
    
    # Analytics queries
    analytics(range: String = "7d"): Analytics!
    
    # Real-time data
    monitorStatus(id: ID!): Monitor
  }

  # Root Mutation type
  type Mutation {
    # Monitor mutations
    createMonitor(input: CreateMonitorInput!): Monitor!
    updateMonitor(id: ID!, input: UpdateMonitorInput!): Monitor!
    deleteMonitor(id: ID!): Boolean!
    
    # Alert mutations
    deleteAlert(id: ID!): Boolean!
    
    # Manual monitor check
    triggerMonitorCheck(id: ID!): Monitor!
  }

  # Real-time subscriptions
  type Subscription {
    # Monitor updates
    monitorUpdated(userId: ID): Monitor!
    
    # New alerts
    alertCreated(userId: ID): Alert!
    
    # Monitor check results
    monitorCheckResult(monitorId: ID): MonitorLog!
  }
`;

module.exports = typeDefs;
