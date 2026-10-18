/* Independent static pages must use full-document navigation, not Nuxt routing. */
(() => {
  const links = [
    { href: '/branding/', label: '브랜드', selector: '.header__side.--start' },
    { href: '/banana-milk/', label: '바나나맛우유', selector: '.header__side.--end' }
  ];
  function appendLink(nav, item, mobile = false) {
    if (!nav || nav.querySelector(`[data-page-link="${item.href}"]`)) return;
    const template = nav.querySelector('a');
    const link = template ? template.cloneNode(false) : document.createElement('a');
    link.href = item.href;
    link.textContent = item.label;
    link.className = mobile ? 'ko-display size-lg sticker-text' : 'header__link';
    link.dataset.pageLink = item.href;
    link.removeAttribute('aria-current');
    nav.insertBefore(link, nav.querySelector('button'));
  }
  function updateLinks() {
    for (const item of links) {
      document.querySelectorAll(item.selector).forEach(nav => appendLink(nav, item));
      document.querySelectorAll('#mobile-menu').forEach(nav => appendLink(nav, item, true));
    }
    document.querySelectorAll('a[href="/icons/banana-milk"],a[href="/icons/banana-milk/"]').forEach(link => {
      link.href = '/banana-milk/';
    });
  }
  // Capture before the existing app's delegated click handlers.
  window.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['/branding/', '/banana-milk/', '/icons/banana-milk', '/icons/banana-milk/'].includes(url.pathname)) return;
    if (url.pathname.startsWith('/icons/')) url.pathname = '/banana-milk/';
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(url.href);
  }, true);
  function start() {
    updateLinks();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => { queued = false; updateLinks(); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
