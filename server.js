const express = require('express');
const fs = require('fs');
const path = require('path');

const {
  PORT,
  TRUST_PROXY,
  PUBLIC_DIR,
  BLOG_DIR,
  APP_VERSION,
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

app.use((req, res, next) => {
  console.log('[REQ]', req.method, req.originalUrl);
  res.on('finish', () => {
    const location = res.get('Location');
    if (res.statusCode >= 300 && res.statusCode < 400) {
      console.log('[RES]', res.statusCode, location || '');
    }
  });
  res.setHeader('X-Zanellazen-Version', APP_VERSION);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (fs.existsSync(BLOG_DIR)) {
  app.use('/blog', express.static(BLOG_DIR));
}

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/zanellazen', zanellazenRoutes);
app.use('/zanellazen', express.static(PUBLIC_DIR, { redirect: false }));
app.use('/api', apiRoutes);

app.use('/', pageRoutes);

// Static middleware per CSS, JS e assets accessibili in locale (/)
app.use(express.static(PUBLIC_DIR, { redirect: false }));

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
  console.log('   🌐 ZanellaZen Homepage Server 1');
  console.log('========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   🔁 Versione: ${APP_VERSION}`);
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
