(() => {
  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const wide = matchMedia('(min-width: 900px)');
  const still = () => root.classList.contains('no-motion');

  /* Index menu */
  const menuButton = $('.bar__menu');
  const menu = $('#index-menu');
  const main = $('main');
  const footer = $('.foot');
  let closeTimer = 0;
  function setMenu(open, restoreFocus = true) {
    clearTimeout(closeTimer);
    menuButton.setAttribute('aria-expanded', String(open));
    $('span', menuButton).textContent = open ? 'Close' : 'Index';
    main.inert = open;
    footer.inert = open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('menu-open')));
      $('a', menu).focus({ preventScroll: true });
    } else {
      root.classList.remove('menu-open');
      closeTimer = setTimeout(() => { menu.hidden = true; }, still() ? 0 : 800);
      if (restoreFocus) menuButton.focus();
    }
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false, false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  /* Hero: year count and a smile that follows the pointer */
  const hero = $('.hero');
  const smile = $('.hero__smile path');
  const count = $('.hero__count');
  if (!still()) {
    const startedAt = performance.now();
    (function tick(now) {
      const progress = clamp((now - startedAt) / 1800);
      count.textContent = String(1967 + Math.round(59 * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    })(startedAt);
  }
  const aim = { depth: .5, tilt: 0 };
  const current = { depth: .5, tilt: 0 };
  let heroVisible = true;
  let heroFrame = 0;
  function drawSmile(depth, tilt) {
    smile.setAttribute('d', `M40 30 Q${(300 + tilt * 240).toFixed(1)} ${(50 + depth * 130).toFixed(1)} 560 30`);
  }
  function heroLoop(time) {
    heroFrame = 0;
    if (!heroVisible || still()) return drawSmile(.5, 0);
    if (!fine.matches) {
      aim.depth = .5 + Math.sin(time / 900) * .35;
      aim.tilt = Math.sin(time / 1500) * .15;
    }
    current.depth += (aim.depth - current.depth) * .08;
    current.tilt += (aim.tilt - current.tilt) * .08;
    drawSmile(current.depth, current.tilt);
    heroFrame = requestAnimationFrame(heroLoop);
  }
  function startHero() {
    if (heroVisible && !heroFrame && !still()) heroFrame = requestAnimationFrame(heroLoop);
  }
  hero.addEventListener('pointermove', event => {
    const bounds = hero.getBoundingClientRect();
    aim.depth = clamp((event.clientY - bounds.top) / bounds.height);
    aim.tilt = clamp((event.clientX - bounds.left) / bounds.width) - .5;
  });
  hero.addEventListener('pointerleave', () => { aim.depth = .5; aim.tilt = 0; });
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; startHero(); }).observe(hero);

  /* Words light up while reading */
  const wordBlocks = $$('[data-words]').map(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { fragment.append(part); continue; }
        const word = document.createElement('span');
        word.className = 'w';
        word.textContent = part;
        fragment.append(word);
      }
      node.replaceWith(fragment);
    }
    return { element, words: $$('.w', element), lit: -1 };
  });

  /* Scenes: vertical scroll drives a horizontal track on wide screens */
  const scenes = $('.scenes');
  const track = $('.scenes__track');
  const sceneItems = $$('.scene');
  const sceneCount = $('.scenes__count b');
  let pinned = false;
  let distance = 0;
  function layout() {
    pinned = wide.matches && !still();
    scenes.classList.toggle('is-pinned', pinned);
    track.style.transform = '';
    if (pinned) {
      distance = Math.max(0, track.scrollWidth - innerWidth);
      scenes.style.height = `${innerHeight + distance}px`;
    } else {
      scenes.style.height = '';
      sceneItems.forEach(scene => scene.style.removeProperty('--shift'));
    }
  }

  /* History: the row nearest the middle of the screen is active */
  const timeline = $('.timeline');
  const events = $$('.event');
  const reels = $$('.odo__reel');
  let active = -1;
  let hovered = -1;
  function activate(index) {
    if (index === active) return;
    active = index;
    events.forEach((event, i) => event.classList.toggle('is-active', i === index));
    [...events[index].dataset.year].forEach((digit, i) => reels[i].style.setProperty('--d', digit));
  }
  if (fine.matches) {
    events.forEach((event, i) => event.addEventListener('pointerenter', () => { hovered = i; activate(i); }));
    timeline.addEventListener('pointerleave', () => { hovered = -1; update(); });
  }

  /* Today: drag or step through the shelf, tilt cards toward the pointer */
  const shelf = $('.shelf');
  $$('.shelf__nav button').forEach(button => button.addEventListener('click', () => {
    const step = $('li', shelf).getBoundingClientRect().width + 20;
    shelf.scrollBy({ left: step * Number(button.dataset.dir), behavior: still() ? 'auto' : 'smooth' });
  }));
  let drag = null;
  let dragged = false;
  shelf.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: shelf.scrollLeft };
    dragged = false;
  });
  addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (!dragged && Math.abs(dx) > 6) { dragged = true; shelf.classList.add('is-dragging'); }
    if (dragged) shelf.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    shelf.classList.remove('is-dragging');
  });
  shelf.addEventListener('click', event => {
    if (dragged) { event.preventDefault(); dragged = false; }
  }, true);
  shelf.addEventListener('dragstart', event => event.preventDefault());
  if (fine.matches) $$('.item').forEach(item => {
    item.addEventListener('pointermove', event => {
      if (still() || drag) return;
      const bounds = item.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      item.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      item.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      item.style.setProperty('--rx', `${((.5 - y) * 10).toFixed(2)}deg`);
      item.style.setProperty('--ry', `${((x - .5) * 12).toFixed(2)}deg`);
    });
    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--rx', '0deg');
      item.style.setProperty('--ry', '0deg');
    });
  });

  /* Scroll-driven updates */
  const progressBar = $('.progress span');
  const outro = $('.outro');
  const outroSmile = $('.outro__smile');
  function update() {
    const vh = innerHeight;
    const max = root.scrollHeight - vh;
    progressBar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max).toFixed(4) : 0})`;
    hero.style.setProperty('--p', still() ? 0 : clamp(scrollY / vh).toFixed(3));

    for (const block of wordBlocks) {
      const bounds = block.element.getBoundingClientRect();
      const progress = still() ? 1 : clamp((vh * .8 - bounds.top) / (bounds.height + vh * .3));
      const lit = Math.round(progress * block.words.length);
      if (lit === block.lit) continue;
      block.words.forEach((word, i) => word.classList.toggle('on', i < lit));
      block.lit = lit;
    }

    if (pinned) {
      const bounds = scenes.getBoundingClientRect();
      const progress = clamp(-bounds.top / Math.max(1, bounds.height - vh));
      track.style.transform = `translate3d(${(-progress * distance).toFixed(1)}px,0,0)`;
      let nearest = 0;
      let best = Infinity;
      sceneItems.forEach((scene, i) => {
        const box = scene.getBoundingClientRect();
        const offset = (box.left + box.width / 2 - innerWidth / 2) / innerWidth;
        scene.style.setProperty('--shift', `${(offset * -9).toFixed(2)}%`);
        if (Math.abs(offset) < best) { best = Math.abs(offset); nearest = i; }
      });
      sceneCount.textContent = String(nearest + 1);
    }

    if (hovered < 0) {
      let nearest = 0;
      let best = Infinity;
      events.forEach((event, i) => {
        const box = event.getBoundingClientRect();
        const gap = Math.abs(box.top + box.height / 2 - vh / 2);
        if (gap < best) { best = gap; nearest = i; }
      });
      activate(nearest);
    }

    const outroBox = outro.getBoundingClientRect();
    outroSmile.style.setProperty('--draw', still() ? 0 : (1 - clamp((vh - outroBox.top) / (outroBox.height * .7))).toFixed(3));
  }
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => { layout(); schedule(); });
  addEventListener('load', () => { layout(); update(); });

  /* Header shows the current section */
  const sectionNumber = $('.bar__num');
  const sectionLabel = $('.bar__label');
  const sectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      sectionNumber.textContent = entry.target.dataset.section;
      sectionLabel.textContent = entry.target.dataset.label;
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  $$('[data-section]').forEach(section => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    revealObserver.unobserve(entry.target);
  }), { threshold: .12 });
  $$('[data-reveal]').forEach(element => revealObserver.observe(element));

  /* Motion toggle (defaults to the system's reduced-motion setting) */
  const motionButton = $('.bar__motion');
  function syncMotionButton() {
    motionButton.textContent = still() ? '모션 켜기' : '모션 끄기';
  }
  motionButton.addEventListener('click', () => {
    root.classList.toggle('no-motion');
    try { localStorage.setItem('brand2-motion', still() ? 'off' : 'on'); } catch {}
    syncMotionButton();
    layout();
    update();
    startHero();
  });
  syncMotionButton();

  layout();
  update();
})();
