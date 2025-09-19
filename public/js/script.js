// Base path detection for remote/local access
function getBasePath() {
  return window.location.pathname.startsWith('/zanellazen') ? '/zanellazen' : '';
}

// Fix navigation links on page load
document.addEventListener('DOMContentLoaded', function() {
  const basePath = getBasePath();
  if (basePath) {
    // Update navigation links
    document.querySelectorAll('nav a[href^="/"]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href.startsWith('/zanellazen') && href !== '/') {
        link.setAttribute('href', basePath + href);
      } else if (href === '/') {
        link.setAttribute('href', basePath);
      }
    });

    // Update brand logo link if exists
    const brandLink = document.querySelector('.header-brand a, .header-brand h1');
    if (brandLink && brandLink.tagName === 'A') {
      brandLink.setAttribute('href', basePath);
    }
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.95)';
    header.style.backdropFilter = 'blur(10px)';
  } else {
    header.style.background = '#fff';
    header.style.backdropFilter = 'none';
  }
});

// Simple animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections for animation
document.querySelectorAll('.section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

// Recipe Modal System
async function openRecipeModal(recipeId) {
  const modal = document.getElementById('recipeModal');
  const modalTitle = document.getElementById('modalRecipeTitle');
  const modalContent = document.getElementById('modalRecipeContent');

  // Dynamic recipe file mapping - use filename as ID
  const recipeFileById = {
    'gulaschsuppe': 'gulaschsuppe.html',
    'pasta-all-amatriciana': 'pasta-all-amatriciana.html',
    'spaghetti-alla-carbonara': 'spaghetti-alla-carbonara.html',
    'risotto-ai-funghi': 'risotto-ai-funghi.html',
    'risotto-al-radicchio-di-treviso': 'risotto-al-radicchio-di-treviso.html',
    'capesante-gratinate': 'capesante-gratinate.html',
    'capesante-all-olio': 'capesante-all-olio.html',
    'baccala-alla-vicentina': 'baccala-alla-vicentina.html',
    'mazzancolle-al-limone': 'mazzancolle-al-limone.html',
    'seppie-in-umido': 'seppie-in-umido.html',
    'pollo-al-curry': 'pollo-al-curry.html',
    'filetto-al-pepe-verde': 'filetto-al-pepe-verde.html',
    'filetto-alla-wellington': 'filetto-alla-wellington.html',
    'tiramisu': 'tiramisu.html',
    'fritelle-di-mele': 'fritelle-di-mele.html',
    'crostata-di-ricotta': 'crostata-di-ricotta.html',
    'crema-catalana': 'crema-catalana.html'
  };
  const recipeTitleById = {
    'gulaschsuppe': 'GULASCHSUPPE',
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
    'fritelle-di-mele': 'Frittelle di Mele',
    'crostata-di-ricotta': 'Crostata di Ricotta',
    'crema-catalana': 'Crema Catalana'
  };

  const file = recipeFileById[recipeId];
  if (file) {
    try {
      const resp = await fetch(`/ricette/ricette_istruzioni/${file}`);
      if (resp.ok) {
        const html = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let content = doc.querySelector('[data-recipe-content]');
        let titleEl = doc.querySelector('[data-recipe-title]');

        if (!content) {
          const tmp = document.createElement('div');
          tmp.innerHTML = html;
          const inners = Array.from(tmp.querySelectorAll('div.text-inner'));
          let best = null;
          let bestScore = -1;
          for (const el of inners) {
            const score = (el.textContent || '').length + el.querySelectorAll('img').length * 50;
            if (score > bestScore) { best = el; bestScore = score; }
          }
          content = best;
        }

        if (!titleEl) {
          titleEl = doc.querySelector('h1');
        }

        if (content) {
          const clone = content.cloneNode(true);
          clone.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (!src) return;
            if (src.startsWith('http')) return;
            const base = src.split('/').pop();
            if (base) img.setAttribute('src', `/ricette/gallery/${base}`);
          });

          modalTitle.textContent = (titleEl && titleEl.textContent.trim()) || recipeTitleById[recipeId] || '';
          modalContent.innerHTML = '';
          modalContent.appendChild(clone);
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
          return;
        }
      }
    } catch (e) {
      console.error('Errore caricamento ricetta originale:', e);
    }
  }

  // Fallback minimale: link alla pagina originale
  const filePath = recipeFileById[recipeId] ? `/ricette/ricette_istruzioni/${recipeFileById[recipeId]}` : '';
  modalTitle.textContent = recipeTitleById[recipeId] || 'Ricetta';
  modalContent.innerHTML = filePath
    ? `<p>Impossibile caricare la ricetta in modale. <a href="${filePath}" target="_blank" rel="noopener">Apri la pagina originale</a>.</p>`
    : `<p>Ricetta non trovata.</p>`;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
  const modal = document.getElementById('recipeModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Close modal when clicking outside of it
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('recipeModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeRecipeModal();
      }
    });
  }
});

// Console message
console.log('🌐 ZanellaZen Homepage caricata correttamente!');
console.log('📧 Contattami per collaborazioni: stefano@example.com');

// Nautica gallery initializer (no external libs)
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('nauticaGallery');
  if (!container) return;

  const total = parseInt(container.getAttribute('data-count') || '40', 10);
  let current = 1;

  // Build controls
  const controls = document.createElement('div');
  controls.className = 'gallery-controls';
  const prevBtn = document.createElement('button');
  prevBtn.className = 'nav-btn';
  prevBtn.textContent = '‹';
  const counter = document.createElement('div');
  counter.className = 'gallery-counter';
  const nextBtn = document.createElement('button');
  nextBtn.className = 'nav-btn';
  nextBtn.textContent = '›';
  controls.append(prevBtn, counter, nextBtn);

  // Main image area
  const main = document.createElement('div');
  main.className = 'gallery-main';
  const mainImg = document.createElement('img');
  mainImg.className = 'main-gallery-image';
  mainImg.alt = 'Galleria Nautica';
  main.appendChild(mainImg);

  // Thumbnails
  const thumbs = document.createElement('div');
  thumbs.className = 'gallery-thumbnails';
  const thumbImgs = [];
  for (let i = 1; i <= total; i++) {
    const img = document.createElement('img');
    img.src = `gallery/${i}.jpg`;
    img.alt = `Miniatura ${i}`;
    img.className = 'gallery-thumbnail';
    img.addEventListener('click', () => setCurrent(i));
    thumbs.appendChild(img);
    thumbImgs.push(img);
  }

  function setCurrent(i) {
    current = i;
    mainImg.src = `gallery/${i}_big.jpg`;
    counter.textContent = `${i} / ${total}`;
    thumbImgs.forEach((t, idx) => {
      if (idx === i - 1) t.classList.add('active');
      else t.classList.remove('active');
    });
  }

  prevBtn.addEventListener('click', () => {
    const i = current - 1 < 1 ? total : current - 1;
    setCurrent(i);
  });
  nextBtn.addEventListener('click', () => {
    const i = current + 1 > total ? 1 : current + 1;
    setCurrent(i);
  });

  container.append(controls, main, thumbs);
  setCurrent(1);
});
