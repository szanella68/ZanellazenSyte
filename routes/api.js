const express = require('express');

const { listRecipes } = require('../services/recipes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
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
