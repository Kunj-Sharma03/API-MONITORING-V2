// Load environment variables (Railway provides them automatically, fallback to .env for local)
require('dotenv').config({ silent: true });

// Debug: Check what environment variables Railway is providing
console.log('🔍 Railway Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'EXISTS' : 'MISSING');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? 'EXISTS' : 'MISSING');
console.log('Environment variables count:', Object.keys(process.env).filter(key => !key.startsWith('npm_')).length);

// List all env vars starting with our expected names
const ourVars = Object.keys(process.env).filter(key => 
  key.startsWith('DATABASE_') || 
  key.startsWith('GOOGLE_') || 
  key.startsWith('JWT_') ||
  key.startsWith('EMAIL_') ||
  key.startsWith('BREVO_')
);
console.log('Our variables found:', ourVars);

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { ApolloServer } = require('apollo-server-express');
const cron = require('node-cron');
const LOG_CLEANUP_DAYS = parseInt(process.env.LOG_CLEANUP_DAYS || '7');
const apiLimiter = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const monitorRoutes = require('./routes/monitor');
const analyticsRoutes = require('./routes/analytics');
const checkMonitors = require('./services/monitorWorker');
const { pool } = require('./db');
const validateEnv = require('./utils/validateEnv');

// GraphQL imports
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const createContext = require('./graphql/context');

// Swagger imports
const { swaggerSpec, swaggerUi, swaggerOptions } = require('./swagger');

validateEnv();

const app = express();
const server = createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Configure trust proxy more securely for Docker/Railway deployment
// Only trust the first proxy (load balancer/reverse proxy)
app.set('trust proxy', 1);

app.use(cors());

// Apply JSON middleware only to non-GraphQL routes
app.use((req, res, next) => {
  if (req.path === '/graphql') {
    return next();
  }
  express.json()(req, res, next);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // Set to true if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 🚀 Initialize Apollo GraphQL Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
  // Enable GraphQL Playground in development
  introspection: process.env.NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production',
});

// 🌐 Root route
app.get('/', (req, res) => {
  res.send('API is working!');
});

// 🛡️ Apply rate limiter to all /api routes
app.use('/api', apiLimiter);

// 📦 Routes
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/analytics', analyticsRoutes);

// 📚 API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// 📄 Swagger JSON endpoint
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ⏱️ Cron monitor check (runs every minute)
let isChecking = false;

cron.schedule('* * * * *', async () => {
  if (isChecking) return console.warn('⚠️ Skipping check: previous still running');

  isChecking = true;
  console.log('⏱️ Running scheduled monitor check...');
  try {
    await pool.query('SELECT 1'); // DB ping
    await checkMonitors().catch(err => console.error('🚨 Monitor job failed:', err.message));
  } catch (err) {
    console.error('🔌 Monitor check failed:', err.message);
  } finally {
    isChecking = false;
  }
});

// 🧹 Daily cleanup: delete monitor_logs older than LOG_CLEANUP_DAYS
cron.schedule('0 0 * * *', async () => {
  console.log(`🧹 Cleaning up logs older than ${LOG_CLEANUP_DAYS} days...`);
  try {
    const result = await pool.query(
      `DELETE FROM monitor_logs WHERE timestamp < NOW() - INTERVAL '${LOG_CLEANUP_DAYS} days' RETURNING id`
    );
    console.log(`✅ Deleted ${result.rowCount} old logs`);
  } catch (err) {
    console.error('❌ Log cleanup failed:', err.message);
  }
});


// 🔁 Retry DB connection on startup
async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ DB connected successfully');
      return;
    } catch (err) {
      console.error(`❌ DB connection failed (attempt ${i + 1}):`, err.message);
      if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
    }
  }
  console.warn('⚠️ Starting server without DB connection.');
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Join user to their personal room for targeted updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io available globally for other modules
global.io = io;

// 🧨 Handle global unhandled DB rejections
process.on('unhandledRejection', (err) => {
  console.error('🧨 Unhandled DB error:', err.message);
});

const PORT = process.env.PORT || 5000;

// 🚀 Start server with Apollo GraphQL
async function startServer() {
  try {
    // Start Apollo Server
    await apolloServer.start();
    
    // Apply GraphQL middleware to Express
    apolloServer.applyMiddleware({ 
      app, 
      path: '/graphql',
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true
      }
    });
    
    // Connect to database first
    await connectWithRetry();
    
    // Start unified HTTP server (REST + GraphQL + Socket.io)
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 REST API available at http://localhost:${PORT}/api`);
      console.log(`🚀 GraphQL available at http://localhost:${PORT}${apolloServer.graphqlPath}`);
      console.log(`🌐 Socket.io server ready for real-time connections`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
