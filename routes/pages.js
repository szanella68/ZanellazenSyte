const express = require('express');
const path = require('path');

const { PUBLIC_DIR } = require('../config');

const router = express.Router();

const pageRoutes = [
  { url: '/ricette', file: ['ricette', 'ricette.html'] },
  { url: '/nautica', file: ['nautica', 'nautica.html'] },
  { url: '/meteo', file: ['meteo', 'meteo.html'] },
  { url: '/dialetto', file: ['dialetto', 'dialetto.html'] },
  { url: '/radio', file: ['radio', 'radio.html'] },
  { url: '/shop', file: ['shop.html'] },
  { url: '/blog', file: ['blog', 'index.html'] },
];

pageRoutes.forEach(({ url, file }) => {
  router.get(url, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, ...file));
  });
});

module.exports = router;
