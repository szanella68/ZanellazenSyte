const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const {
  CORS_ORIGINS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} = require('../config');

function applySecurity(app) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
    message: { error: 'Too many requests, please try again later' },
  });

  app.use('/api', limiter);
  app.use('/zanellazen/api', limiter);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }));
}

module.exports = applySecurity;
