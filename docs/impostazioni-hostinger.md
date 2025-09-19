# Impostazioni Hostinger

## Panoramica infrastruttura
- **Host**: VPS Hostinger con Docker e Docker Compose in `/root` (stessa impostazione di GymTracker).
- **Codice**: repository `zanellazen` in `/root/apps/zanellazen`.
- **Orchestrazione**: `~/docker-compose.yml` gestisce Traefik + applicazioni (GymTracker, ZanellaZen, homepage statica, n8n, ecc.).
- **Obiettivo**: servire ZanellaZen dietro Traefik su HTTPS, mantenendo deploy ripetibili tramite Docker.

## Servizi Docker coinvolti
### traefik (container `root-traefik-1`)
- Termina HTTPS (porte 80/443) e usa label per creare router dinamici.
- Middleware `zanellazen-stripprefix` rimuove `/zanellazen` prima di inoltrare al container Node.
- Certificati salvati nel volume `traefik_data`.

### zanellazen (container `zanellazen`)
- Immagine buildata da `Dockerfile` presente nella repo (Node 18 alpine).
- Espone la porta interna 3001 verso Traefik, nessun bind pubblico diretto.
- Serve contenuto statico da `/app/public` e fornisce API ricette/health per controlli.

## Flusso richieste
1. L’utente visita `https://zanserver.sytes.net/zanellazen/...`.
2. Traefik applica il middleware di strip prefix e inoltra al servizio `zanellazen`.
3. L’app Express verifica CORS e rate limit, serve file statici o API `/zanellazen/api/*`.

## Variabili d’ambiente
Configurabili via `.env` e propagate dal compose:
- `PORT` (default 3001) – inutile cambiarlo se Traefik mappa automaticamente.
- `TRUST_PROXY` (default 1) – necessario quando l’app è dietro Traefik.
- `CORS_ORIGINS` – includere dominio pubblico (`https://zanserver.sytes.net`) e origin locali.
- `RATE_LIMIT_*` – opzionali per raffinare il rate limiting.

## Estratto `docker-compose.yml`
Esempio di servizio da aggiungere in `~/docker-compose.yml`:

```yaml
  zanellazen:
    build:
      context: ./apps/zanellazen
      dockerfile: Dockerfile
    env_file:
      - ./apps/zanellazen/.env
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.zanellazen.rule=PathPrefix(`/zanellazen`)"
      - "traefik.http.routers.zanellazen.entrypoints=websecure"
      - "traefik.http.routers.zanellazen.tls.certresolver=letsencrypt"
      - "traefik.http.middlewares.zanellazen-stripprefix.stripprefix.prefixes=/zanellazen"
      - "traefik.http.routers.zanellazen.middlewares=zanellazen-stripprefix"
      - "traefik.http.services.zanellazen.loadbalancer.server.port=3001"
```

## Deploy aggiornamenti
1. Connettersi alla VPS e portarsi in `/root/apps/zanellazen`.
2. Aggiornare il codice (`git pull` oppure sincronizzazione manuale).
3. Ricostruire solo il servizio interessato: `docker compose -f ~/docker-compose.yml up -d --build zanellazen`.
4. Verificare: `docker compose -f ~/docker-compose.yml ps` e `docker compose -f ~/docker-compose.yml logs --tail 100 zanellazen`.

## Troubleshooting
- **CORS**: se il browser blocca richieste da Traefik, aggiungere l’origin pubblico a `CORS_ORIGINS` e riavviare il container.
- **Route non trovate**: controllare che il middleware `stripprefix` sia attivo; senza, l’app riceve path `/zanellazen/...` e non trova i file.
- **Healthcheck fallisce**: verificare che l’app sia avviata (`docker compose logs`) e che l’endpoint `/api/health` risponda.

## Note
- Il progetto usa solo asset statici, quindi non necessita di database o servizi esterni.
- Struttura cartelle e Dockerfile ricalcano GymTracker per avere un processo di deploy uniforme.
