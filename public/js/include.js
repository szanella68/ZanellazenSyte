// Component loader per includere header e footer
document.addEventListener('DOMContentLoaded', function() {
  // Trova tutti gli elementi con data-include
  const includeElements = document.querySelectorAll('[data-include]');

  includeElements.forEach(async (element) => {
    const file = element.getAttribute('data-include');

    try {
      const response = await fetch(file);
      if (response.ok) {
        const content = await response.text();
        element.innerHTML = content;
      } else {
        console.error(`Errore nel caricamento di ${file}:`, response.status);
      }
    } catch (error) {
      console.error(`Errore nel caricamento di ${file}:`, error);
    }
  });
});

// Navigation helper per evidenziare pagina corrente
document.addEventListener('DOMContentLoaded', function() {
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
});