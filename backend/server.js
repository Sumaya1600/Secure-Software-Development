// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const trackingController = require('./controllers/trackingController');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

// Tracking endpoints (public - no auth required)
app.get('/track/:token', trackingController.trackOpen);
app.get('/click/:token', trackingController.trackClick);
app.post('/report/:token', trackingController.trackReport);
app.get('/api/analytics/campaign/:campaignId', trackingController.getCampaignStats);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  
    Phishing Portal Backend Running

  Port: ${PORT}
  Environment: ${process.env.NODE_ENV}
  Database: ${process.env.DB_NAME}
  
  `);
});

module.exports = app;