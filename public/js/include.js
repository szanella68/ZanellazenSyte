function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

// Component loader per includere header e footer
function loadIncludedComponents() {
  // Trova tutti gli elementi con data-include
  const includeElements = document.querySelectorAll('[data-include]');

  const basePath = typeof window.__zanellazenBasePath === 'string'
    ? window.__zanellazenBasePath
    : (window.location.pathname.startsWith('/zanellazen') ? '/zanellazen' : '');

  includeElements.forEach(async (element) => {
    const file = element.getAttribute('data-include') || '';
    let url = file;

    if (file.startsWith('/')) {
      url = `${basePath}${file}`;
    } else if (!file.startsWith('.') && !file.startsWith('http://') && !file.startsWith('https://')) {
      url = `${basePath}/${file.replace(/^\/+/, '')}`;
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        element.innerHTML = content;
        // DEBUG: Log completo per capire cosa succede
        console.log('🔍 include.js - Header caricato, ora controllo updateNavigationLinks');
        console.log('📍 Hostname:', window.location.hostname);
        console.log('📍 Pathname:', window.location.pathname);
        console.log('📍 Full URL:', window.location.href);

        if (typeof window.updateNavigationLinks === 'function') {
          window.updateNavigationLinks();
        }
      } else {
        console.error(`Errore nel caricamento di ${url}:`, response.status);
      }
    } catch (error) {
      console.error(`Errore nel caricamento di ${url}:`, error);
    }
  });
}

onReady(loadIncludedComponents);

// Navigation helper per evidenziare pagina corrente
function highlightActiveNav() {
  // Aspetta che i componenti si carichino
  setTimeout(() => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (currentPath === href || (currentPath === '/' && href === '/')) {
        link.style.color = '#10b981';
        link.style.background = 'rgba(16, 185, 129, 0.15)';
        link.style.fontWeight = '600';
      }
    });
  }, 100);
}

onReady(highlightActiveNav);
