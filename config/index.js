const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const BLOG_DIR = path.join(ROOT_DIR, '..', 'blog');

const APP_VERSION = process.env.APP_VERSION || '2025-09-19T09:44:58.576980+00:00';

const PORT = parseInt(process.env.PORT, 10) || 3001;

function parseTrustProxy(value) {
  if (value === undefined) return false;
  if (value === '') return false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!Number.isNaN(Number(value))) return Number(value);
  return value;
}

const TRUST_PROXY = parseTrustProxy(process.env.TRUST_PROXY ?? '1');

function parseList(value, fallback) {
  if (!value) return fallback;
  return value
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);
}

const DEFAULT_CORS = [
  'http://localhost:3001',
  'https://zanserver.sytes.net'
];

const CORS_ORIGINS = parseList(process.env.CORS_ORIGINS, DEFAULT_CORS);

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || (15 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000;

module.exports = {
  ROOT_DIR,
  PUBLIC_DIR,
  BLOG_DIR,
  PORT,
  TRUST_PROXY,
  CORS_ORIGINS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  APP_VERSION,
};
