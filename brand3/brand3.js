(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduce.matches || root.classList.contains('site-motion-paused');
  const clamp = value => Math.min(1, Math.max(0, value));

  // Scenes: inside each track the word shows first, the photo window widens to full screen, then the copy card arrives.
  const scenes = [...document.querySelectorAll('.scene-track')];
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function updateScenes() {
    scenes.forEach(scene => {
      const box = scene.getBoundingClientRect();
      if (box.bottom < -innerHeight || box.top > innerHeight * 2) return;
      const progress = still() ? 1 : clamp(-box.top / Math.max(1, box.height - innerHeight));
      scene.style.setProperty('--grow', ease(clamp((progress - .06) / .56)).toFixed(4));
      scene.style.setProperty('--word', clamp((progress - .12) / .16).toFixed(3));
      scene.style.setProperty('--card', clamp((progress - .62) / .16).toFixed(3));
    });
  }

  // Name: the three letters rise in turn and the smile draws, then deepens, as the word scrolls into view.
  const nameStage = document.querySelector('.name-story__stage');
  const letters = [...nameStage.querySelectorAll('.name-story__word span')];
  const nameSmile = nameStage.querySelector('.name-story__smile path');
  let smileHover = 0, smileHoverAim = 0, hoverFrame = 0;
  function updateName() {
    const box = nameStage.getBoundingClientRect();
    const progress = still() ? 1 : clamp((innerHeight - box.top) / (innerHeight * .7));
    letters.forEach((letter, i) => {
      const shown = clamp(progress * 1.7 - i * .28);
      letter.style.setProperty('--o', shown.toFixed(3));
      letter.style.setProperty('--y', `${((1 - shown) * 36).toFixed(1)}%`);
    });
    const smile = clamp((progress - .4) / .6);
    nameSmile.style.setProperty('--draw', (1 - clamp(smile * 1.6)).toFixed(3));
    nameSmile.setAttribute('d', `M70 30 Q500 ${(70 + smile * 80 + smileHover * 60).toFixed(1)} 930 30`);
  }
  function easeHover() {
    smileHover += (smileHoverAim - smileHover) * .12;
    updateName();
    hoverFrame = Math.abs(smileHoverAim - smileHover) > .005 ? requestAnimationFrame(easeHover) : 0;
  }
  nameStage.addEventListener('pointerenter', () => { smileHoverAim = still() ? 0 : 1; if (!hoverFrame) hoverFrame = requestAnimationFrame(easeHover); });
  nameStage.addEventListener('pointerleave', () => { smileHoverAim = 0; if (!hoverFrame) hoverFrame = requestAnimationFrame(easeHover); });

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; updateScenes(); updateName(); });
  }, { passive: true });
  addEventListener('resize', () => { updateScenes(); updateName(); });
  new MutationObserver(() => { updateScenes(); updateName(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
  updateScenes();
  updateName();

  // The name cards rise in, and the numbers count up, the first time they are seen.
  const counters = [...document.querySelectorAll('.story-numbers [data-count]')];
  function countUp() {
    counters.forEach(counter => {
      const from = Number(counter.dataset.from || 0), to = Number(counter.dataset.count);
      if (still()) { counter.textContent = String(to); return; }
      const startedAt = performance.now();
      (function tick(now) {
        const progress = Math.min(1, (now - startedAt) / 1400);
        counter.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      })(startedAt);
    });
  }
  const nameGrid = document.querySelector('.name-story__grid');
  const numbers = document.querySelector('.story-numbers');
  if ('IntersectionObserver' in window) {
    if (!still()) counters.forEach(counter => { counter.textContent = counter.dataset.from || '0'; });
    const onceObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      onceObserver.unobserve(entry.target);
      if (entry.target === nameGrid) nameGrid.classList.add('is-in');
      else countUp();
    }), { threshold: .4 });
    onceObserver.observe(nameGrid);
    onceObserver.observe(numbers);
  } else nameGrid.classList.add('is-in');

  // History rail: one tick per year, following the gallery's current entry (aria-current).
  const panel = document.querySelector('.history-sticky');
  const entries = [...document.querySelectorAll('.history-era article')];
  const eraNow = document.querySelector('#history-era');
  function jumpTo(entry) {
    // Land the entry just above the gallery's trigger line (below the pinned panel on phones).
    const mobile = matchMedia('(max-width:760px)').matches;
    const anchor = mobile ? parseFloat(getComputedStyle(panel).top) + panel.offsetHeight + 20 : innerHeight * .45;
    scrollTo({ top: entry.getBoundingClientRect().top + scrollY - anchor, behavior: still() ? 'auto' : 'smooth' });
  }
  const rail = document.createElement('nav');
  rail.className = 'history-rail';
  rail.setAttribute('aria-label', '연도 바로가기');
  const list = document.createElement('ol');
  const buttons = entries.map(entry => {
    const year = entry.querySelector('time').textContent.trim();
    entry.id = `year-${year}`;
    const item = document.createElement('li');
    if (entry === entry.parentElement.querySelector('article')) item.className = 'is-era-start';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `${year}년 · ${entry.querySelector('h4').textContent}`);
    button.innerHTML = `<i aria-hidden="true"></i><span aria-hidden="true">${year}</span>`;
    button.addEventListener('click', () => jumpTo(entry));
    item.append(button);
    list.append(item);
    return button;
  });
  rail.append(list);
  panel.append(rail);
  function sync() {
    entries.forEach((entry, i) => {
      const current = entry.hasAttribute('aria-current');
      if (current) buttons[i].setAttribute('aria-current', 'step');
      else buttons[i].removeAttribute('aria-current');
      if (current) eraNow.textContent = entry.closest('.history-era').querySelector('.history-era-label span').textContent.replace(/ · .*/, '') + ' · ' + entry.closest('.history-era').dataset.caption;
    });
  }
  new MutationObserver(sync).observe(document.querySelector('.history-entries'), { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  sync();

  // Numbers lead into the matching place in the history.
  document.querySelectorAll('.story-numbers a[href^="#year-"]').forEach(link => link.addEventListener('click', event => {
    const entry = document.querySelector(link.getAttribute('href'));
    if (!entry) return;
    event.preventDefault();
    jumpTo(entry);
  }));
})();
