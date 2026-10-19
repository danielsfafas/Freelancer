/**
 * Revelado progresivo de secciones (mejora progresiva).
 *
 * - Sin JS / sin IntersectionObserver / con prefers-reduced-motion: no hace nada
 *   y el contenido queda visible (las clases .reveal no ocultan nada por sí solas).
 * - Con IntersectionObserver: marca <html> con .reveal-ready y agrega .is-visible
 *   a cada .reveal cuando entra en pantalla (fade corto definido en index.css).
 * - Elementos que ya quedaron arriba del viewport (p. ej. al saltar directo a un
 *   #ancla) se muestran de inmediato para no dejar huecos negros.
 */
let started = false;

export function initReveal() {
  if (started || typeof window === 'undefined' || typeof document === 'undefined') return;
  started = true;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduceMotion) return;

  const show = (el) => el.classList.add('is-visible');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -5% 0px', threshold: 0.01 }
  );

  const scan = (root) => {
    if (root.nodeType !== 1 && root !== document) return;
    if (root.matches?.('.reveal:not(.is-visible)')) observer.observe(root);
    root.querySelectorAll?.('.reveal:not(.is-visible)').forEach((el) => observer.observe(el));
  };

  const revealAll = () => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      show(el);
      observer.unobserve(el);
    });
  };

  document.documentElement.classList.add('reveal-ready');
  scan(document);

  // React monta secciones (portafolio, testimonios) después de cargar datos.
  new MutationObserver((mutations) => {
    mutations.forEach((m) => m.addedNodes.forEach(scan));
  }).observe(document.body, { childList: true, subtree: true });

  // Imprimir o capturar la página completa: mostrar todo.
  window.addEventListener('beforeprint', revealAll);
}
