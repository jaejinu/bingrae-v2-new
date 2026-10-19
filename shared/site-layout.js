(() => {
  const header = document.querySelector('.site-header');
  const button = header.querySelector('.site-header__burger');
  const menu = header.querySelector('.shared-mobile');
  const main = document.querySelector('main');
  const footer = document.querySelector('.site-footer');
  function setOpen(open, restoreFocus = false) {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.classList.toggle('site-menu-open', open);
    main.inert = open;
    footer.inert = open;
    if (restoreFocus) button.focus();
  }
  button.addEventListener('click', () => setOpen(menu.hidden));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') setOpen(false, true);
    if (event.key === 'Tab') {
      const focusable = [...header.querySelectorAll('a,button')].filter(el => el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
    }
  });
  matchMedia('(min-width:1001px)').addEventListener('change', () => setOpen(false));
  header.querySelectorAll('a').forEach(link => {
    if (new URL(link.href).pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '') && !link.hash) link.setAttribute('aria-current', 'page');
  });
  const motion = header.querySelector('.shared-motion');
  motion.addEventListener('click', () => {
    const paused = document.documentElement.classList.toggle('site-motion-paused');
    motion.setAttribute('aria-pressed', String(paused));
    motion.setAttribute('aria-label', paused ? '애니메이션 재생' : '애니메이션 일시정지');
    motion.textContent = paused ? '▶' : 'Ⅱ';
  });
})();
