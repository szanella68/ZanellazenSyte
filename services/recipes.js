const fs = require('fs');
const path = require('path');

const { PUBLIC_DIR } = require('../config');

const RECIPES_DIR = path.join(PUBLIC_DIR, 'ricette', 'ricette_istruzioni');

const TITLE_MAP = {
  'gulaschsuppe': 'GulaschSuppe',
  'pasta-all-amatriciana': "Pasta all'Amatriciana",
  'spaghetti-alla-carbonara': 'Spaghetti alla Carbonara',
  'risotto-ai-funghi': 'Risotto ai Funghi',
  'risotto-al-radicchio-di-treviso': 'Risotto al Radicchio di Treviso',
  'capesante-gratinate': 'Capesante Gratinate',
  'capesante-all-olio': "Capesante all'Olio",
  'baccala-alla-vicentina': 'Baccalà alla Vicentina',
  'mazzancolle-al-limone': 'Mazzancolle al Limone',
  'seppie-in-umido': 'Seppie in Umido',
  'pollo-al-curry': 'Pollo al Curry',
  'filetto-al-pepe-verde': 'Filetto al Pepe Verde',
  'filetto-alla-wellington': 'Filetto alla Wellington',
  'tiramisu': 'Tiramisù',
  'fritelle-di-mele': 'Fritelle di Mele',
  'crostata-di-ricotta': 'Crostata di Ricotta',
  'crema-catalana': 'Crema Catalana',
};

function formatRecipeTitle(name) {
  return TITLE_MAP[name] || name.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function getRecipeCategory(name) {
  if ([
    'gulaschsuppe',
    'pasta-all-amatriciana',
    'spaghetti-alla-carbonara',
    'risotto-ai-funghi',
    'risotto-al-radicchio-di-treviso',
  ].includes(name)) {
    return 'primi';
  }
  if ([
    'capesante-gratinate',
    'capesante-all-olio',
    'baccala-alla-vicentina',
    'mazzancolle-al-limone',
    'seppie-in-umido',
  ].includes(name)) {
    return 'pesce';
  }
  if ([
    'pollo-al-curry',
    'filetto-al-pepe-verde',
    'filetto-alla-wellington',
  ].includes(name)) {
    return 'carne';
  }
  if ([
    'tiramisu',
    'fritelle-di-mele',
    'crostata-di-ricotta',
    'crema-catalana',
  ].includes(name)) {
    return 'dolci';
  }
  return 'altri';
}

const EMOJI_MAP = {
  'gulaschsuppe': '🍲',
  'pasta-all-amatriciana': '🍝',
  'spaghetti-alla-carbonara': '🍝',
  'risotto-ai-funghi': '🍚',
  'risotto-al-radicchio-di-treviso': '🍚',
  'capesante-gratinate': '🐚',
  'capesante-all-olio': '🐚',
  'baccala-alla-vicentina': '🐟',
  'mazzancolle-al-limone': '🦐',
  'seppie-in-umido': '🐙',
  'pollo-al-curry': '🍗',
  'filetto-al-pepe-verde': '🥩',
  'filetto-alla-wellington': '🥩',
  'tiramisu': '🍰',
  'fritelle-di-mele': '🍎',
  'crostata-di-ricotta': '🥧',
  'crema-catalana': '🍮',
};

function getRecipeEmoji(name) {
  return EMOJI_MAP[name] || '🍽️';
}

function listRecipes() {
  const files = fs.readdirSync(RECIPES_DIR, { withFileTypes: true });
  return files
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => {
      const name = entry.name.replace('.html', '');
      return {
        id: name,
        filename: entry.name,
        title: formatRecipeTitle(name),
        category: getRecipeCategory(name),
        emoji: getRecipeEmoji(name),
      };
    });
}

module.exports = {
  listRecipes,
};
