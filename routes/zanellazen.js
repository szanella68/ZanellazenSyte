const express = require('express');
const path = require('path');

const { PUBLIC_DIR } = require('../config');
const { listRecipes } = require('../services/recipes');

const router = express.Router();
const staticMiddleware = express.static(PUBLIC_DIR);

router.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const nestedPages = [
  { url: '/ricette', file: ['ricette', 'ricette.html'] },
  { url: '/nautica', file: ['nautica', 'nautica.html'] },
  { url: '/meteo', file: ['meteo', 'meteo.html'] },
  { url: '/dialetto', file: ['dialetto', 'dialetto.html'] },
  { url: '/radio', file: ['radio', 'radio.html'] },
  { url: '/shop', file: ['shop.html'] },
  { url: '/blog', file: ['blog', 'index.html'] },
];

nestedPages.forEach(({ url, file }) => {
  router.get(url, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, ...file));
  });
});

router.get('/api/recipes', (req, res, next) => {
  try {
    const recipes = listRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

router.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  return staticMiddleware(req, res, next);
});

module.exports = router;
