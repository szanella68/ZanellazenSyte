# ZanellaZen - Sito Node.js

Sito personale di Stefano Zanella (IU3FCM) completamente rifatto in Node.js con architettura moderna e CSS centrale.

## 🚀 Caratteristiche

- **Framework**: Node.js + Express
- **Template Engine**: EJS
- **Stile**: CSS centrale personalizzato (nessuna dipendenza esterna)
- **Struttura**: Modulare e ordinata
- **Responsive**: Design adattivo per tutti i dispositivi
- **SEO Friendly**: Meta tag ottimizzati e struttura semantica

## 📁 Struttura del Progetto

```
zanellazen-nodejs/
├── src/
│   ├── app.js              # Server principale
│   ├── routes/             # Routes per ogni sezione
│   │   ├── home.js         # Homepage
│   │   ├── ricette.js      # Sezione ricette
│   │   ├── nautica.js      # Sezione nautica
│   │   ├── meteo.js        # Sezione meteorologia
│   │   └── dialetto.js     # Dialetto feltrino
│   ├── views/              # Template EJS
│   │   ├── layouts/        # Layout principali
│   │   │   └── main.ejs    # Layout base
│   │   └── pages/          # Pagine specifiche
│   └── public/             # File statici
│       ├── css/
│       │   └── style.css   # CSS centrale
│       ├── js/
│       └── images/         # Immagini del sito
├── package.json
└── README.md
```

## ⚙️ Installazione

1. **Clona o scarica il progetto**
   ```bash
   cd zanellazen-nodejs
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Avvia il server**
   ```bash
   # Modalità sviluppo (con auto-reload)
   npm run dev

   # Modalità produzione
   npm start
   ```

4. **Apri il browser**
   ```
   http://localhost:3000
   ```

## 🎨 CSS Centrale

Il design utilizza un sistema CSS completamente personalizzato con:

- **Reset CSS** per consistenza cross-browser
- **Grid System** flessibile per layout responsive
- **Card System** per contenuti modulari
- **Color Palette** coerente
- **Typography** ottimizzata per leggibilità
- **Animations** fluide e discrete

### Classi CSS Principali

```css
.container    # Container principale centrato
.card         # Card per contenuti
.grid         # Sistema grid responsive
.btn          # Bottoni stilizzati
.nav          # Navigazione
```

## 📑 Sezioni del Sito

### 🏠 Homepage
- Profilo personale di Stefano Zanella
- Filosofia e interessi
- Ultime notizie e aggiornamenti
- Citazione ispiratrice
- Immagine di Feltre

### 🍝 Ricette
- Catalogo ricette tradizionali e internazionali
- Cards con immagini, difficoltà e tempi
- Ricette dettagliate con ingredienti e procedimento

### ⛵ Nautica
- Passione per la navigazione
- Sezioni su vela, sicurezza e meteorologia marina
- Link utili per navigatori

### 🌤️ Meteorologia
- Stazioni meteo personali
- Links a servizi meteorologici
- Webcam Feltre (offline per manutenzione)

### 🗣️ Dialetto Feltrino
- Espressioni tipiche feltrino-italiano
- Tradizioni orali e proverbi
- Preservazione del patrimonio linguistico

## 🔧 Personalizzazione

### Aggiungere nuove pagine
1. Crea un file route in `src/routes/`
2. Crea il template EJS in `src/views/pages/`
3. Aggiungi la route in `src/app.js`
4. Aggiorna la navigazione in `src/views/layouts/main.ejs`

### Modificare gli stili
Tutti gli stili sono centralizzati in `src/public/css/style.css`

### Aggiungere contenuti
I contenuti sono definiti direttamente nei file route per facilità di gestione.

## 🚀 Deploy

### Server locale
Il progetto è pronto per essere deployato su qualsiasi server che supporti Node.js.

### Variabili d'ambiente
```bash
PORT=3000  # Porta del server (default: 3000)
```

## 🔄 Migrazione da WebSite X5

Questo progetto sostituisce completamente la versione WebSite X5 con:

- ✅ **Nessuna dipendenza** da software proprietario
- ✅ **Codice pulito** e mantenibile
- ✅ **Performance migliorate**
- ✅ **SEO ottimizzato**
- ✅ **Design responsive** nativo
- ✅ **Facilità di aggiornamento**

## 📞 Contatti

**Stefano Zanella**
📧 szanella68@gmail.com
📱 +39 345 1047165
📍 Via Fusina, 25 - 32032 Feltre BL
📻 Radioamatore: IU3FCM

---

*"Homo sum, nihil humani a me alienum puto"*