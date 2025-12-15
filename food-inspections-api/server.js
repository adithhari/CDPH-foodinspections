const express = require('express');
const cors = require('cors');
require('dotenv').config();

const facilitiesRouter = require('./routes/facilities');
const inspectionsRouter = require('./routes/inspections');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detailed request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log('\n' + '═'.repeat(80));
  console.log(`📥 INCOMING REQUEST`);
  console.log('─'.repeat(80));
  console.log(`⏰ Time:        ${timestamp}`);
  console.log(`🔷 Method:      ${req.method}`);
  console.log(`🔗 Path:        ${req.path}`);
  console.log(`🌐 Full URL:    ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log(`❓ Query Params:`, req.query);
  }
  
  if (Object.keys(req.params).length > 0) {
    console.log(`📌 URL Params:  `, req.params);
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:        `, req.body);
  }
  
  console.log(`🖥️  IP:          ${req.ip}`);
  console.log('═'.repeat(80));
  
  // Capture response
  const oldSend = res.send;
  res.send = function(data) {
    console.log(`\n📤 RESPONSE for ${req.method} ${req.path}`);
    console.log(`✅ Status:      ${res.statusCode}`);
    console.log('═'.repeat(80) + '\n');
    oldSend.apply(res, arguments);
  };
  
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Food Inspections API',
    version: '1.0.0',
    endpoints: {
      facilities: '/api/facilities',
      inspections: '/api/inspections',
      analytics: '/api/analytics'
    }
  });
});

// API Routes
app.use('/api/facilities', facilitiesRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/analytics', analyticsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🍔 Food Inspections API Server                          ║
║                                                            ║
║   Status: Running                                          ║
║   Port: ${PORT}                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                               ║
║                                                            ║
║   Base URL: http://localhost:${PORT}                       ║
║                                                            ║
║   Available Endpoints:                                     ║
║   ├─ GET  /api/facilities                                  ║
║   ├─ GET  /api/inspections                                 ║
║   └─ GET  /api/analytics                                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
