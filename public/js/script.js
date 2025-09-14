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

  // Prefer: load original recipe HTML and inject its main content
  const recipeFileById = {
    'gulaschsuppe': 'gulaschsuppe.html',
    'amatriciana': 'pasta-all-amatriciana.html',
    'carbonara': 'spaghetti-alla-carbonara.html',
    'risotto-funghi': 'risotto-ai-funghi.html',
    'risotto-radicchio': 'risotto-al-radicchio-di-treviso.html',
    'capesante-gratinate': 'capesante-gratinate.html',
    'capesante-olio': 'capesante-all-olio.html',
    'baccala-vicentina': 'baccala-alla-vicentina.html',
    'mazzancolle-limone': 'mazzancolle-al-limone.html',
    'seppie-umido': 'seppie-in-umido.html',
    'pollo-curry': 'pollo-al-curry.html',
    'filetto-pepe-verde': 'filetto-al-pepe-verde.html',
    'filetto-wellington': 'filetto-alla-wellington.html',
    'tiramisu': 'tiramisu.html',
    'fritelle-mele': 'fritelle-di-mele.html',
    'crostata-ricotta': 'crostata-di-ricotta.html',
    'crema-catalana': 'crema-catalana.html'
  };
  const recipeTitleById = {
    'gulaschsuppe': 'GULASCHSUPPE',
    'amatriciana': "Pasta all'Amatriciana",
    'carbonara': 'Spaghetti alla Carbonara',
    'risotto-funghi': 'Risotto ai Funghi',
    'risotto-radicchio': 'Risotto al Radicchio di Treviso',
    'capesante-gratinate': 'Capesante Gratinate',
    'capesante-olio': "Capesante all'Olio",
    'baccala-vicentina': 'Baccalà alla Vicentina',
    'mazzancolle-limone': 'Mazzancolle al Limone',
    'seppie-umido': 'Seppie in Umido',
    'pollo-curry': 'Pollo al Curry',
    'filetto-pepe-verde': 'Filetto al Pepe Verde',
    'filetto-wellington': 'Filetto alla Wellington',
    'tiramisu': 'Tiramisù',
    'fritelle-mele': 'Frittelle di Mele',
    'crostata-ricotta': 'Crostata di Ricotta',
    'crema-catalana': 'Crema Catalana'
  };

  const file = recipeFileById[recipeId];
  if (file) {
    try {
      const resp = await fetch(`/ricette/ricette_istruzioni/${file}`);
      if (resp.ok) {
        const html = await resp.text();
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        // Heuristic: take the largest .text-inner content block (from original pages)
        const inners = Array.from(tmp.querySelectorAll('div.text-inner'));
        let best = null;
        let bestScore = -1;
        for (const el of inners) {
          const score = (el.textContent || '').length + el.querySelectorAll('img').length * 50;
          if (score > bestScore) { best = el; bestScore = score; }
        }
        if (best) {
          const content = document.createElement('div');
          content.innerHTML = best.innerHTML;
          // Rewrite image src to use ricette/gallery preserving filenames
          content.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            const base = src.split('/').pop();
            if (base) img.setAttribute('src', `/ricette/gallery/${base}`);
          });
          modalTitle.textContent = recipeTitleById[recipeId] || '';
          modalContent.innerHTML = '';
          modalContent.appendChild(content);
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
          return; // Done with dynamic load
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
