// Base path detection for remote/local access
function getBasePath() {
  return window.location.pathname.startsWith('/zanellazen') ? '/zanellazen' : '';
}

function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

function resolveStaticAssetPath(assetPath) {
  if (!assetPath) return assetPath;
  const lower = assetPath.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) {
    return assetPath;
  }

  const basePath = typeof window.__zanellazenBasePath === 'string'
    ? window.__zanellazenBasePath
    : getBasePath();

  const normalizedBase = basePath || '';

  if (assetPath.startsWith('/')) {
    return `${normalizedBase}${assetPath}`;
  }

  return `${normalizedBase}/${assetPath.replace(/^\/+/, '')}`;
}

function applyStaticAssetPaths() {
  document.querySelectorAll('[data-zz-asset]').forEach(el => {
    if (!el || el.tagName === 'SCRIPT') return;
    const asset = el.getAttribute('data-zz-asset');
    if (!asset) return;

    const attr = el.getAttribute('data-zz-attr')
      || (el.tagName === 'LINK' ? 'href' : 'src');

    const resolved = resolveStaticAssetPath(asset);
    if (resolved && el.getAttribute(attr) !== resolved) {
      el.setAttribute(attr, resolved);
    }
  });
}

onReady(applyStaticAssetPaths);

const RECIPE_IMAGE_WHITELIST = new Set([
  '0.jpg','1.jpg','10.jpg','11.jpg','13.jpg','14.jpg','15.jpg','16.jpg','17.jpg',
  '1_2s66gw4y.jpg','1_3b366w97.jpg','1_3lssv9y3.jpg','1_55hf2iun.jpg','1_5ffug5gw.jpg','1_5j3lgxgj.jpg',
  '1_k196joum.jpg','1_kzitgwne.jpg','1_nbiy0ftz.jpg','1_og82ckly.jpg','1_q09a32j0.jpg','1_u1qir809.jpg',
  '1_u919jgi4.jpg','1_xd6bw58w.jpg','2.jpg','2_1pizo2md.jpg','2_2mdasx8v.jpg','2_3t0cow0s.jpg',
  '2_5pjo9urv.jpg','2_d2u89zxi.jpg','2_fo83z1g6.jpg','2_hdtz5s4g.jpg','2_ia0ck3jo.jpg','2_it09xdqd.jpg',
  '2_p5k2svir.jpg','2_y38oito2.jpg','2_yvadrfej.jpg','3.jpg','3_4ff9br0v.jpg','3_747blvgx.jpg',
  '3_acx27akn.jpg','3_k9tozyql.jpg','3_nlspg0oj.jpg','3_rozz6268.jpg','3_rv38583l.jpg','3_suyrxzxb.jpg',
  '3_wsevpug3.jpg','4.jpg','4_5tm1uae4.jpg','4_7w5tkfk4.jpg','4_96z4ctkb.jpg','4_a5bv27op.jpg',
  '4_ucsmb64q.jpg','4_upzdnlcn.jpg','4_vrakvfvs.jpg','4_zzomedci.jpg','5.jpg','5_0ae01mxz.jpg',
  '5_4ex9kgri.jpg','5_83vj0bli.jpg','5_covj313w.jpg','5_fy8x8a3e.jpg','5_ml14b71z.jpg','5_pbyhp3rg.jpg',
  '5_thtfv3np.jpg','6.jpg','6_ga82je08.jpg','6_pslclgsa.jpg','6_pva0i4gz.jpg','7.jpg','7_nap50btz.jpg',
  '8.jpg','8_9521fmun.jpg','8_jwmr3bro.jpg','9.jpg','ca1.jpg','e.jpg','feltre2t.jpg','g10.jpg','g4.jpg',
  'g5.jpg','g6.jpg','g7.jpg','g8.jpg','g9.jpg','gou1.jpg','gou2.jpg','gou3.jpg','iu3fcm.jpg',
  'iu3fcm_yf250ocu.jpg','iu3fcm_yizo0m0f.jpg','panoramafeltre.jpg','pc2.jpg','pixabay-bb483ac8992a45425e.jpg',
  'ricette.jpg','webzan00.jpg'
].map(name => name.toLowerCase()));

function updateNavigationLinks() {
  const basePath = getBasePath();
  const prefix = '/zanellazen';

  // Ambiente locale: rimuovi il prefisso per facilitare lo sviluppo
  if (!basePath && window.location.hostname === 'localhost') {
    document.querySelectorAll(`a[href^="${prefix}"]`).forEach(link => {
      const href = link.getAttribute('href');
      link.setAttribute('href', href.replace(prefix, '') || '/');
    });
    return;
  }

  if (!basePath) {
    return;
  }

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const normalized = href.trim();
    if (!normalized) return;

    const lower = normalized.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:') || lower.startsWith('//')) {
      return;
    }

    if (normalized.startsWith(prefix)) {
      return;
    }

    if (normalized.startsWith('/')) {
      if (!normalized.startsWith(basePath + '/')) {
        link.setAttribute('href', basePath + normalized);
      }
      return;
    }

    if (normalized.startsWith('./') || normalized.startsWith('../') || normalized.startsWith('#')) {
      return;
    }

    link.setAttribute('href', `${basePath}/${normalized.replace(/^\/+/,'')}`);
  });
}

window.updateNavigationLinks = updateNavigationLinks;

onReady(updateNavigationLinks);

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

  const basePath = getBasePath();
  const file = recipeFileById[recipeId];
  if (file) {
    try {
      const resp = await fetch(`${basePath}/ricette/ricette_istruzioni/${file}`);
      if (resp.ok) {
        const html = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let content = doc.querySelector('[data-recipe-content]');
        let titleEl = doc.querySelector('[data-recipe-title]');

        if (!content) {
          const inners = Array.from(doc.querySelectorAll('div.text-inner'));
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
            const src = (img.getAttribute('src') || '').trim();
            if (!src || src.startsWith('http')) return;
            const base = src.split('/').pop();
            if (!base) {
              img.remove();
              return;
            }
            const normalized = base.toLowerCase();
            if (!RECIPE_IMAGE_WHITELIST.has(normalized)) {
              img.remove();
              return;
            }
            img.removeAttribute('src');
            img.setAttribute('data-zz-asset', `/ricette/gallery/${base}`);
          });

          modalTitle.textContent = (titleEl && titleEl.textContent.trim()) || recipeTitleById[recipeId] || '';
          modalContent.innerHTML = '';
          modalContent.appendChild(clone);
          applyStaticAssetPaths();
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
  const filePath = recipeFileById[recipeId] ? `${basePath}/ricette/ricette_istruzioni/${recipeFileById[recipeId]}` : '';
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
function initRecipeModalDismiss() {
  const modal = document.getElementById('recipeModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeRecipeModal();
      }
    });
  }
}

onReady(initRecipeModalDismiss);

// Console message
console.log('🌐 ZanellaZen Homepage caricata correttamente!');
console.log('📧 Contattami per collaborazioni: stefano@example.com');

function logBackendVersion() {
  const basePath = getBasePath();
  const candidates = [];

  if (basePath) {
    candidates.push(`${basePath}/api/health`);
  }
  candidates.push('/api/health');

  (async () => {
    for (const url of candidates) {
      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) {
          continue;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          continue;
        }

        const data = await response.json();
        if (data && data.version) {
          console.log('🆔 Backend ZanellaZen versione:', data.version);
          return;
        }
      } catch (error) {
        console.debug('Health check fallback for', url, error);
      }
    }

    console.warn('Impossibile recuperare la versione backend: nessuna risposta JSON valida');
  })();
}

onReady(logBackendVersion);

// Nautica gallery initializer (no external libs)
function initNauticaGallery() {
  const container = document.getElementById('nauticaGallery');
  if (!container) return;

  const total = parseInt(container.getAttribute('data-count') || '40', 10);
  const galleryPrefix = resolveStaticAssetPath('/nautica/gallery').replace(/\/+$/, '');
  let current = 1;

  function assignSrc(el, candidates) {
    let index = 0;

    const tryAssign = () => {
      if (index >= candidates.length) {
        el.removeAttribute('src');
        el.classList.add('image-missing');
        return;
      }

      const candidate = candidates[index++];
      el.onerror = () => {
        el.onerror = null;
        el.onload = null;
        tryAssign();
      };
      el.onload = () => {
        el.onerror = null;
        el.onload = null;
        el.classList.remove('image-missing');
      };
      el.src = candidate;
    };

    el.classList.remove('image-missing');
    tryAssign();
  }

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
    img.alt = `Miniatura ${i}`;
    img.className = 'gallery-thumbnail';
    img.addEventListener('click', () => setCurrent(i));
    assignSrc(img, [
      `${galleryPrefix}/${i}_thumb.png`,
      `${galleryPrefix}/${i}_thumb.jpg`,
      `${galleryPrefix}/${i}.jpg`,
      `${galleryPrefix}/${i}.png`
    ]);
    thumbs.appendChild(img);
    thumbImgs.push(img);
  }

  function setCurrent(i) {
    current = i;
    assignSrc(mainImg, [
      `${galleryPrefix}/${i}_big.jpg`,
      `${galleryPrefix}/${i}_big.png`,
      `${galleryPrefix}/${i}.jpg`,
      `${galleryPrefix}/${i}.png`
    ]);
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
}

onReady(initNauticaGallery);
