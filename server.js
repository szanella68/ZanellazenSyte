const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://zanserver.sytes.net'
  ],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve frontend from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Avoid favicon 404s at root
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Route specifiche per le pagine
app.get('/ricette', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ricette.html'));
});

app.get('/nautica', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'nautica.html'));
});

app.get('/meteo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meteo.html'));
});

app.get('/dialetto', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dialetto.html'));
});

app.get('/radio', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'radio.html'));
});

// Mantieni blog directory esistente
app.use('/blog', express.static(path.join(__dirname, '../blog')));

// Catch-all route per homepage
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('   🌐 ZanellaZen Homepage Server');
  console.log('========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Homepage: http://localhost:${PORT}/`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Shutting down gracefully...');
  process.exit(0);
});