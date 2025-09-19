const express = require('express');
const fs = require('fs');
const path = require('path');

const {
  PORT,
  TRUST_PROXY,
  PUBLIC_DIR,
  BLOG_DIR,
} = require('./config');

const applySecurity = require('./middleware/security');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');
const zanellazenRoutes = require('./routes/zanellazen');

const app = express();

if (TRUST_PROXY !== false) {
  app.set('trust proxy', TRUST_PROXY);
}

applySecurity(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const staticRoot = express.static(PUBLIC_DIR);
app.use(staticRoot);

if (fs.existsSync(BLOG_DIR)) {
  app.use('/blog', express.static(BLOG_DIR));
}

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/', pageRoutes);
app.use('/api', apiRoutes);
app.use('/zanellazen', zanellazenRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

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

process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Shutting down gracefully...');
  process.exit(0);
});
