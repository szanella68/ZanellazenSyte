# 📁 ZanellaZen Project Structure

```
zanellazen/
├── server.js                    # Bootstrap Express con moduli dedicati
├── package.json                 # Dipendenze e script
├── package-lock.json
├── .env.example                 # Variabili d’ambiente suggerite
├── Dockerfile                   # Build container (Node 18 + healthcheck)
├── .dockerignore                # Esclude asset non necessari dal build
├── README.md
├── STRUCTURE.md                 # Questa guida rapida
├── docs/
│   └── impostazioni-hostinger.md# Deploy su Hostinger con Docker+Traefik
├── config/
│   └── index.js                 # Costanti progetto (path, CORS, rate limit)
├── middleware/
│   └── security.js              # Helmet, CORS e rate limiting centrali
├── routes/
│   ├── api.js                   # Endpoint API (/api/*)
│   ├── pages.js                 # Routing diretto per pagine statiche root
│   └── zanellazen.js            # Routing prefissato /zanellazen
├── services/
│   └── recipes.js               # Logica di lettura ricette statiche
├── public/                      # Asset statici del sito
│   ├── index.html
│   ├── css/, js/, style/, ecc.
│   └── ricette/…                # Contenuti HTML delle ricette
└── tools/                       # Utility CLI esistenti (ispezioni, update link)
```

## Flusso applicazione
- `server.js` importa configurazioni e middleware, applica sicurezza condivisa e monta i router.
- `routes/pages.js` e `routes/zanellazen.js` mappano le pagine statiche verso i file corretti dentro `public/`.
- `routes/api.js` espone `/api/health` e `/api/recipes`, riutilizzate anche sotto `/zanellazen/api` grazie al router dedicato.
- `services/recipes.js` centralizza la trasformazione dei metadati ricette.

## Deploy
- Locally: `npm install && npm run dev` (oppure `npm start`).
- Docker: build tramite `Dockerfile`; healthcheck automatico su `/api/health`.
- Hostinger: seguire `docs/impostazioni-hostinger.md` per integrare nel compose condiviso con Traefik.
