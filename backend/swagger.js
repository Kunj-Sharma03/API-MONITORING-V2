const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Monitoring Platform',
    version: '2.0.0',
    description: `
      A comprehensive API monitoring platform with real-time monitoring, alerting, and analytics.
      
      ## Features
      - 🔍 **Monitor API endpoints** with customizable intervals
      - 📊 **Real-time analytics** and uptime tracking  
      - 🚨 **Smart alerting** with email notifications
      - 📈 **Historical data** and performance metrics
      - 🔌 **GraphQL & REST APIs** for flexible data access
      - 🔄 **WebSocket** support for real-time updates
      
      ## Authentication
      Most endpoints require JWT authentication. Include your token in the Authorization header:
      \`Authorization: Bearer <your-jwt-token>\`
      
      ## Rate Limiting
      API requests are rate-limited to prevent abuse. Check response headers for limits.
    `,
    contact: {
      name: 'API Monitoring Team',
      email: 'support@api-monitoring.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://api-monitoring-app-production.up.railway.app',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login or /auth/register'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique user identifier'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          }
        }
      },
      Monitor: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique monitor identifier'
          },
          url: {
            type: 'string',
            format: 'uri',
            description: 'URL to monitor',
            example: 'https://api.example.com/health'
          },
          interval_minutes: {
            type: 'integer',
            minimum: 1,
            maximum: 1440,
            description: 'Check interval in minutes',
            example: 5
          },
          alert_threshold: {
            type: 'integer',
            minimum: 1,
            description: 'Number of failed checks before alerting',
            example: 3
          },
          is_active: {
            type: 'boolean',
            description: 'Whether monitoring is active'
          },
          latest_status: {
            type: 'string',
            enum: ['UP', 'DOWN'],
            description: 'Current status of the monitored endpoint'
          },
          last_checked_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last check timestamp'
          },
          last_response_time: {
            type: 'integer',
            description: 'Response time in milliseconds from last check'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Monitor creation timestamp'
          }
        }
      },
      Alert: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique alert identifier'
          },
          monitor_id: {
            type: 'string',
            description: 'ID of the associated monitor'
          },
          reason: {
            type: 'string',
            description: 'Reason for the alert',
            example: 'HTTP 500 Internal Server Error'
          },
          error_message: {
            type: 'string',
            description: 'Detailed error message'
          },
          triggered_at: {
            type: 'string',
            format: 'date-time',
            description: 'Alert trigger timestamp'
          }
        }
      },
      Analytics: {
        type: 'object',
        properties: {
          totalMonitors: {
            type: 'integer',
            description: 'Total number of monitors'
          },
          activeMonitors: {
            type: 'integer', 
            description: 'Number of active monitors'
          },
          averageUptime: {
            type: 'number',
            format: 'float',
            description: 'Average uptime percentage'
          },
          averageResponseTime: {
            type: 'number',
            format: 'float',
            description: 'Average response time in milliseconds'
          },
          totalAlerts: {
            type: 'integer',
            description: 'Total alerts in time period'
          },
          activeIncidents: {
            type: 'integer',
            description: 'Currently active incidents'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          details: {
            type: 'string',
            description: 'Additional error details'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Authentication required'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Resource not found'
            }
          }
        }
      },
      ValidationError: {
        description: 'Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: 'Validation failed',
              details: 'URL is required'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    './routes/*.js',
    './index.js'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Custom CSS for better looking documentation
const customCss = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info .title { color: #6366f1; }
  .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  .swagger-ui .info .description p { font-size: 14px; line-height: 1.6; }
  .swagger-ui .btn.authorize { background-color: #6366f1; border-color: #6366f1; }
  .swagger-ui .btn.authorize:hover { background-color: #4f46e5; }
`;

const swaggerOptions = {
  customCss,
  customSiteTitle: 'API Monitoring Platform - API Documentation',
  customfavIcon: '/favicon.ico',
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerOptions
};
