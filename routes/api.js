const express = require('express');

const { listRecipes } = require('../services/recipes');
const { APP_VERSION } = require('../config');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/recipes', (req, res, next) => {
  try {
    const recipes = listRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
