# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Check basic project health
node server.js
```

**Note**: No linting or testing tools are currently configured. The package.json scripts for `lint`, `test`, and `format` are placeholders.

## Architecture Overview

This is a Node.js personal homepage using Express without templating engines. The application serves static content from `public/` with a small API for recipes and health checks.

### Key Architecture Patterns

- **Dual routing**: The app serves content both at root (`/`) and under `/zanellazen` prefix for Traefik proxy compatibility
- **Static-first**: All pages are pre-built HTML files in `public/`, with Express handling routing and API endpoints
- **Modular structure**: Security, routing, and configuration are separated into dedicated modules

### Core Modules

- `config/index.js`: Environment configuration with parsing helpers for CORS origins, trust proxy, and rate limiting
- `middleware/security.js`: Centralized security setup (Helmet, CORS, rate limiting)
- `routes/api.js`: Health checks and recipes API
- `routes/pages.js`: Direct static page routing for root paths
- `routes/zanellazen.js`: Prefixed routing that reuses the same API and pages
- `services/recipes.js`: Logic for reading recipe metadata from static HTML files

### Directory Structure

```
├── config/           # Environment and app configuration
├── middleware/       # Express middleware (security)
├── routes/           # Route handlers (api, pages, zanellazen)
├── services/         # Business logic (recipes)
├── public/           # Static website content
├── docs/             # Deployment documentation
└── tools/            # Utility scripts
```

## Deployment

The application is designed for Docker deployment behind Traefik proxy:
- Uses Node 18 Alpine base image
- Exposes port 3001 internally
- Includes healthcheck on `/api/health`
- Environment configured via `.env` file
- See `docs/impostazioni-hostinger.md` for production setup

## Environment Variables

Key variables (see `.env.example`):
- `PORT`: Server port (default: 3001)
- `TRUST_PROXY`: Enable when behind proxy (default: 1)
- `CORS_ORIGINS`: Comma-separated allowed origins
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window

## API Endpoints

- `GET /api/health` - Service health check
- `GET /api/recipes` - List available recipes from `public/ricette/ricette_istruzioni/`
- Same endpoints available under `/zanellazen/api/*` for proxy compatibility