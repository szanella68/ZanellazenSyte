# ZanellaZen • Node.js Static Site

Sito personale di Stefano Zanella servito tramite Express. I contenuti sono statici (`public/`), con una piccola API che espone l’elenco delle ricette per frontend o automazioni.

## ✨ Caratteristiche
- **Stack**: Node.js + Express senza template engine.
- **Sicurezza**: Helmet, rate limiting e CORS centralizzati, configurabili via `.env`.
- **Routing pulito**: router dedicati per `/` e `/zanellazen`, in modo da funzionare sia in locale sia dietro Traefik (Hostinger).
- **Deploy ready**: Dockerfile e documentazione per integrare il servizio nello stesso `docker-compose` di GymTracker.

## ⚙️ Setup Locale
```bash
npm install

# Ambiente sviluppo con nodemon
npm run dev

# Oppure avvio standard
npm start
```

Il server ascolta sulla porta `3001` (configurabile). Apri `http://localhost:3001` per la homepage.

## 🔧 Configurazione
Le principali variabili (vedi `.env.example`):

```
PORT=3001
TRUST_PROXY=1
CORS_ORIGINS=http://localhost:3001,https://zanserver.sytes.net
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

## 📚 Documentazione
- `STRUCTURE.md`: panoramica delle cartelle e del flusso applicativo.
- `docs/impostazioni-hostinger.md`: istruzioni per deploy su VPS Hostinger (Docker + Traefik), allineate con GymTracker.

## 🐳 Docker
```bash
docker build -t zanellazen .
docker run --rm -p 3001:3001 --env-file .env zanellazen
```

Il Dockerfile usa Node 18 alpine, installa solo dipendenze production e definisce un healthcheck su `/api/health`.

## 📦 API Principali
- `GET /api/health` → stato del servizio.
- `GET /api/recipes` → elenco ricette disponibile sotto `public/ricette/ricette_istruzioni`.
- Le stesse API sono esposte con prefisso `/zanellazen/api/*` per compatibilità proxy.

## 🛠️ Strumenti utili
- `tools/inspect-structure.cjs`: genera una mappa della struttura file (usato per diagnosi).
- `start_zanellazen.bat`, `stop_core.bat`, ecc.: script Windows per esecuzione rapida in locale.

## 📄 Licenza
MIT
