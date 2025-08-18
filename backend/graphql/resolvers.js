const { pool, safeQuery } = require('../db');
const { ForbiddenError, UserInputError } = require('apollo-server-express');

const resolvers = {
  Query: {
    // Get current user
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new ForbiddenError('You must be logged in');
      }
      return context.user;
    },

    // Get all monitors for current user
    monitors: async (parent, args, context) => {
      if (!context.user) {
        throw new ForbiddenError('You must be logged in');
      }

      const result = await safeQuery(
        `SELECT 
          m.*,
          latest_log.status as latest_status,
          latest_log.response_time as last_response_time,
          latest_log.status_code as last_status_code
        FROM monitors m
        LEFT JOIN (
          SELECT DISTINCT ON (monitor_id) 
                 monitor_id, status, response_time, status_code
          FROM monitor_logs
          ORDER BY monitor_id, timestamp DESC
        ) latest_log ON latest_log.monitor_id = m.id
        WHERE m.user_id = $1 
        ORDER BY m.created_at DESC`,
        [context.user.id]
      );

      return result.rows.map(monitor => ({
        ...monitor,
        status: monitor.latest_status
      }));
    },

    // Get single monitor
    monitor: async (parent, { id }, context) => {
      if (!context.user) {
        throw new ForbiddenError('You must be logged in');
      }

      const result = await safeQuery(
        `SELECT 
          m.*,
          latest_log.status as latest_status,
          latest_log.response_time as last_response_time,
          latest_log.status_code as last_status_code,
          latest_log.error_message
        FROM monitors m
        LEFT JOIN (
          SELECT DISTINCT ON (monitor_id) 
                 monitor_id, status, response_time, status_code, error_message
          FROM monitor_logs
          ORDER BY monitor_id, timestamp DESC
        ) latest_log ON latest_log.monitor_id = m.id
        WHERE m.id = $1 AND m.user_id = $2`,
        [id, context.user.id]
      );

      if (result.rows.length === 0) {
        throw new ForbiddenError('Monitor not found');
      }

      return {
        ...result.rows[0],
        status: result.rows[0].latest_status
      };
    },

    // Get analytics data
    analytics: async (parent, { range = '7d' }, context) => {
      if (!context.user) {
        throw new ForbiddenError('You must be logged in');
      }

      // Calculate date range
      const now = new Date();
      let startDate;
      switch (range) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // This will be implemented in the analytics resolver
      return { range, startDate, userId: context.user.id };
    }
  },

  Mutation: {
    // Create new monitor
    createMonitor: async (parent, { input }, context) => {
      if (!context.user) {
        throw new ForbiddenError('You must be logged in');
      }

      const { url, interval_minutes = 5, alert_threshold = 3 } = input;

      // Validate URL
      try {
        new URL(url);
      } catch (error) {
        throw new ForbiddenError('Invalid URL provided');
      }

      const result = await safeQuery(
        `INSERT INTO monitors (user_id, url, interval_minutes, alert_threshold)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [context.user.id, url, interval_minutes, alert_threshold]
      );

      return result.rows[0];
    },

    // Update monitor
    updateMonitor: async (parent, { id, input }, context) => {
      if (!context.user) {
        throw new ForbiddenError('You must be logged in');
      }

      // Check if monitor exists and belongs to user
      const existingMonitor = await safeQuery(
        'SELECT * FROM monitors WHERE id = $1 AND user_id = $2',
        [id, context.user.id]
      );

      if (existingMonitor.rows.length === 0) {
        throw new ForbiddenError('Monitor not found');
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (input.url !== undefined) {
        try {
          new URL(input.url);
        } catch (error) {
          throw new ForbiddenError('Invalid URL provided');
        }
        updateFields.push(`url = $${paramCount++}`);
        updateValues.push(input.url);
      }

      if (input.interval_minutes !== undefined) {
        updateFields.push(`interval_minutes = $${paramCount++}`);
        updateValues.push(input.interval_minutes);
      }

      if (input.alert_threshold !== undefined) {
        updateFields.push(`alert_threshold = $${paramCount++}`);
        updateValues.push(input.alert_threshold);
      }

      if (input.is_active !== undefined) {
        updateFields.push(`is_active = $${paramCount++}`);
        updateValues.push(input.is_active);
      }

      if (updateFields.length === 0) {
        return existingMonitor.rows[0];
      }

      updateValues.push(id, context.user.id);
      const result = await safeQuery(
        `UPDATE monitors SET ${updateFields.join(', ')} 
         WHERE id = $${paramCount} AND user_id = $${paramCount + 1} 
         RETURNING *`,
        updateValues
      );

      return result.rows[0];
    },

    // Delete monitor
    deleteMonitor: async (parent, { id }, context) => {
      if (!context.user) {
        throw new ForbiddenError('You must be logged in');
      }

      const result = await safeQuery(
        'DELETE FROM monitors WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, context.user.id]
      );

      return result.rows.length > 0;
    },

    // Delete alert
    deleteAlert: async (parent, { id }, context) => {
      if (!context.user) {
        throw new ForbiddenError('You must be logged in');
      }

      // Check if alert belongs to user's monitor
      const result = await safeQuery(
        `DELETE FROM alerts 
         WHERE id = $1 
         AND monitor_id IN (SELECT id FROM monitors WHERE user_id = $2)
         RETURNING id`,
        [id, context.user.id]
      );

      return result.rows.length > 0;
    }
  },

  // Nested field resolvers
  User: {
    monitors: async (user) => {
      const result = await safeQuery(
        'SELECT * FROM monitors WHERE user_id = $1 ORDER BY created_at DESC',
        [user.id]
      );
      return result.rows;
    }
  },

  Monitor: {
    logs: async (monitor, { limit = 50 }) => {
      const result = await safeQuery(
        `SELECT * FROM monitor_logs 
         WHERE monitor_id = $1 
         ORDER BY timestamp DESC 
         LIMIT $2`,
        [monitor.id, limit]
      );
      return result.rows;
    },

    alerts: async (monitor, { limit = 20 }) => {
      const result = await safeQuery(
        `SELECT * FROM alerts 
         WHERE monitor_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [monitor.id, limit]
      );
      return result.rows;
    },

    stats: async (monitor) => {
      // Get total checks
      const totalChecksRes = await safeQuery(
        'SELECT COUNT(*) as count FROM monitor_logs WHERE monitor_id = $1',
        [monitor.id]
      );

      // Get successful checks
      const successfulChecksRes = await safeQuery(
        `SELECT COUNT(*) as count FROM monitor_logs 
         WHERE monitor_id = $1 AND status = 'UP'`,
        [monitor.id]
      );

      // Get average response time
      const avgResponseTimeRes = await safeQuery(
        `SELECT AVG(response_time) as avg_time FROM monitor_logs 
         WHERE monitor_id = $1 AND response_time IS NOT NULL`,
        [monitor.id]
      );

      // Get last 24h stats
      const last24hChecksRes = await safeQuery(
        `SELECT COUNT(*) as count FROM monitor_logs 
         WHERE monitor_id = $1 AND timestamp > NOW() - INTERVAL '24 hours'`,
        [monitor.id]
      );

      const last24hSuccessfulRes = await safeQuery(
        `SELECT COUNT(*) as count FROM monitor_logs 
         WHERE monitor_id = $1 AND status = 'UP' 
         AND timestamp > NOW() - INTERVAL '24 hours'`,
        [monitor.id]
      );

      const totalChecks = parseInt(totalChecksRes.rows[0].count);
      const successfulChecks = parseInt(successfulChecksRes.rows[0].count);
      const last24hChecks = parseInt(last24hChecksRes.rows[0].count);
      const last24hSuccessful = parseInt(last24hSuccessfulRes.rows[0].count);

      return {
        total_checks: totalChecks,
        successful_checks: successfulChecks,
        failed_checks: totalChecks - successfulChecks,
        uptime_percentage: totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
        avg_response_time: avgResponseTimeRes.rows[0].avg_time || 0,
        last_24h_checks: last24hChecks,
        last_24h_uptime: last24hChecks > 0 ? (last24hSuccessful / last24hChecks) * 100 : 0
      };
    }
  },

  Alert: {
    monitor: async (alert) => {
      const result = await safeQuery(
        'SELECT * FROM monitors WHERE id = $1',
        [alert.monitor_id]
      );
      return result.rows[0];
    }
  },

  // Analytics resolver - implements efficient data fetching
  Analytics: {
    overview: async (analytics) => {
      const { userId, startDate } = analytics;
      
      try {
        // Get total monitors for user
        const totalMonitorsRes = await safeQuery(
          'SELECT COUNT(*) as count FROM monitors WHERE user_id = $1',
          [userId]
        );
        const totalMonitors = parseInt(totalMonitorsRes.rows[0].count);

        // Get active monitors (recently checked)
        const now = new Date();
        const activeMonitorsRes = await safeQuery(
          `SELECT COUNT(*) as count FROM monitors 
           WHERE user_id = $1 AND is_active = true 
           AND last_checked_at > $2`,
          [userId, new Date(now.getTime() - 10 * 60 * 1000)]
        );
        const activeMonitors = parseInt(activeMonitorsRes.rows[0].count);

        // Calculate statistics for the time range
        const statsRes = await safeQuery(
          `SELECT 
             COUNT(CASE WHEN ml.status = 'UP' THEN 1 END) as successful_checks,
             COUNT(CASE WHEN ml.status = 'DOWN' THEN 1 END) as failed_checks,
             COUNT(*) as total_checks,
             AVG(ml.response_time) as avg_response_time
           FROM monitor_logs ml
           JOIN monitors m ON ml.monitor_id = m.id
           WHERE m.user_id = $1 AND ml.timestamp >= $2`,
          [userId, startDate]
        );

        const stats = statsRes.rows[0];
        const successfulChecks = parseInt(stats.successful_checks) || 0;
        const failedChecks = parseInt(stats.failed_checks) || 0;
        const totalChecks = parseInt(stats.total_checks) || 0;
        const overallUptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

        // Get alert statistics
        const alertsRes = await safeQuery(
          `SELECT COUNT(*) as total_alerts
           FROM alerts a
           JOIN monitors m ON a.monitor_id = m.id
           WHERE m.user_id = $1 AND a.triggered_at >= $2`,
          [userId, startDate]
        );
        const totalAlerts = parseInt(alertsRes.rows[0].total_alerts) || 0;

        // Get current active incidents (monitors currently down)
        const incidentsRes = await safeQuery(
          `SELECT COUNT(*) as active_incidents
           FROM monitors m
           LEFT JOIN (
             SELECT DISTINCT ON (monitor_id) monitor_id, status
             FROM monitor_logs
             ORDER BY monitor_id, timestamp DESC
           ) latest ON m.id = latest.monitor_id
           WHERE m.user_id = $1 AND m.is_active = true AND latest.status = 'DOWN'`,
          [userId]
        );
        const activeIncidents = parseInt(incidentsRes.rows[0].active_incidents) || 0;

        return {
          total_monitors: totalMonitors,
          active_monitors: activeMonitors,
          total_checks: totalChecks,
          successful_checks: successfulChecks,
          failed_checks: failedChecks,
          overall_uptime: Math.round(overallUptime * 100) / 100,
          avg_response_time: Math.round(parseFloat(stats.avg_response_time) || 0),
          total_alerts: totalAlerts,
          active_incidents: activeIncidents
        };
      } catch (error) {
        console.error('Analytics overview error:', error);
        return {
          total_monitors: 0,
          active_monitors: 0,
          total_checks: 0,
          successful_checks: 0,
          failed_checks: 0,
          overall_uptime: 0,
          avg_response_time: 0,
          total_alerts: 0,
          active_incidents: 0
        };
      }
    },

    uptimeHistory: async (analytics, { range }) => {
      const { userId, startDate } = analytics;
      
      try {
        const uptimeRes = await safeQuery(
          `SELECT 
             TO_CHAR(DATE(ml.timestamp), 'YYYY-MM-DD') as date,
             COUNT(CASE WHEN ml.status = 'UP' THEN 1 END) as successful_checks,
             COUNT(*) as total_checks
           FROM monitor_logs ml
           JOIN monitors m ON ml.monitor_id = m.id
           WHERE m.user_id = $1 AND ml.timestamp >= $2
           GROUP BY DATE(ml.timestamp)
           ORDER BY DATE(ml.timestamp) ASC`,
          [userId, startDate]
        );

        return uptimeRes.rows.map(row => ({
          date: row.date, // Now it's already a YYYY-MM-DD string
          uptime_percentage: row.total_checks > 0 ? 
            Math.round((row.successful_checks / row.total_checks) * 10000) / 100 : 0,
          total_checks: parseInt(row.total_checks),
          successful_checks: parseInt(row.successful_checks)
        }));
      } catch (error) {
        console.error('Uptime history error:', error);
        return [];
      }
    },

    responseTimeHistory: async (analytics, { range }) => {
      const { userId, startDate } = analytics;
      
      try {
        const responseRes = await safeQuery(
          `SELECT 
             TO_CHAR(DATE(ml.timestamp), 'YYYY-MM-DD') as date,
             AVG(ml.response_time) as avg_response_time,
             MIN(ml.response_time) as min_response_time,
             MAX(ml.response_time) as max_response_time
           FROM monitor_logs ml
           JOIN monitors m ON ml.monitor_id = m.id
           WHERE m.user_id = $1 AND ml.timestamp >= $2 AND ml.response_time IS NOT NULL
           GROUP BY DATE(ml.timestamp)
           ORDER BY DATE(ml.timestamp) ASC`,
          [userId, startDate]
        );

        return responseRes.rows.map(row => ({
          date: row.date, // Now it's already a YYYY-MM-DD string
          avg_response_time: Math.round(parseFloat(row.avg_response_time) || 0),
          min_response_time: parseInt(row.min_response_time) || 0,
          max_response_time: parseInt(row.max_response_time) || 0
        }));
      } catch (error) {
        console.error('Response time history error:', error);
        return [];
      }
    },

    alertsHistory: async (analytics, { range }) => {
      const { userId, startDate } = analytics;
      
      try {
        const alertsRes = await safeQuery(
          `SELECT 
             TO_CHAR(DATE(a.triggered_at), 'YYYY-MM-DD') as date,
             COUNT(*) as alert_count
           FROM alerts a
           JOIN monitors m ON a.monitor_id = m.id
           WHERE m.user_id = $1 AND a.triggered_at >= $2
           GROUP BY DATE(a.triggered_at)
           ORDER BY DATE(a.triggered_at) ASC`,
          [userId, startDate]
        );

        return alertsRes.rows.map(row => ({
          date: row.date, // Now it's already a YYYY-MM-DD string
          alert_count: parseInt(row.alert_count)
        }));
      } catch (error) {
        console.error('Alerts history error:', error);
        return [];
      }
    }
  }
};

module.exports = resolvers;
