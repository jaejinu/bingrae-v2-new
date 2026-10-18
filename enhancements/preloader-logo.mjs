// An original, text-based adaptation of Planetoño's preloader motion:
// a staggered star reveal, a travelling piano wave, and a flight to the header.
// No reference artwork or Rive assets are shipped with this implementation.
const STAR_PATH = 'M20 2C23 13 27 17 38 20C27 23 23 27 20 38C17 27 13 23 2 20C13 17 17 13 20 2Z';
const SETTLED = 'translateY(0) scale(1, 1) rotate(0deg)';
const REVEAL_DELAY = 620;
const REVEAL_DURATION = 1500;

export function createPreloaderLogo(node, { reducedMotion } = {}) {
  if (!node || typeof node.animate !== 'function') return { destroy() {}, exitTo() {} };
  const label = node.textContent.trim();
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shouldReduce = reducedMotion ?? (() => media.matches && document.documentElement.dataset.motion !== 'full');
  const animations = new Set();
  const letters = [];
  const listeners = [];
  let exiting = false;
  let destroyed = false;
  let flight = null;
  let flightAnimation = null;
  let target = null;
  let previousTargetVisibility = '';

  function animate(element, keyframes, options) {
    const animation = element.animate(keyframes, { easing: 'cubic-bezier(.22, 1, .36, 1)', ...options });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  }

  node.classList.add('pre__logo');
  node.setAttribute('role', 'img');
  node.setAttribute('aria-label', label);
  const fragment = document.createDocumentFragment();
  let index = 0;
  for (const character of Array.from(label)) {
    const letter = document.createElement('span');
    letter.setAttribute('aria-hidden', 'true');
    if (/\s/.test(character)) {
      letter.className = 'pre__logo-space';
      fragment.append(letter);
      continue;
    }
    letter.className = 'pre__logo-letter';
    const wave = document.createElement('span');
    wave.className = 'pre__logo-wave';
    const glyph = document.createElement('span');
    glyph.className = 'pre__logo-glyph';
    glyph.textContent = character;
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    star.setAttribute('viewBox', '0 0 40 40');
    star.setAttribute('class', 'pre__logo-star');
    star.setAttribute('focusable', 'false');
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', STAR_PATH);
    star.append(shape);
    wave.append(glyph);
    letter.append(wave, star);
    fragment.append(letter);
    const item = { letter, wave, glyph, star, index: index++, reaction: null };
    letters.push(item);
    const react = () => {
      if (exiting || destroyed || shouldReduce()) return;
      item.reaction?.cancel();
      item.reaction = animate(glyph, [
        { transform: SETTLED, offset: 0 },
        { transform: 'translateY(.055em) scale(1.14, .78) rotate(-3deg)', offset: .18 },
        { transform: 'translateY(-.17em) scale(.92, 1.16) rotate(2deg)', offset: .46 },
        { transform: 'translateY(.02em) scale(1.035, .96) rotate(-1deg)', offset: .72 },
        { transform: SETTLED, offset: 1 },
      ], { duration: 650 });
    };
    letter.addEventListener('pointerenter', react);
    letter.addEventListener('pointerdown', react);
    listeners.push(() => {
      letter.removeEventListener('pointerenter', react);
      letter.removeEventListener('pointerdown', react);
    });
  }
  node.replaceChildren(fragment);

  function cancelLetters() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }

  function play({ reveal = false } = {}) {
    cancelLetters();
    if (shouldReduce() || exiting || destroyed) return;
    for (const { wave, glyph, star, index: order } of letters) {
      const delay = order * 120;
      const tilt = order % 2 === 0 ? -1 : 1;
      if (reveal) {
        animate(star, [
          { opacity: 0, transform: 'scale(0) rotate(-35deg)', offset: 0 },
          { opacity: 1, transform: 'scale(1.18) rotate(8deg)', offset: .27 },
          { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: .42 },
          { opacity: 1, transform: 'scale(.94, 1.08) rotate(0deg)', offset: .68 },
          { opacity: 0, transform: 'scale(.15, 1.5) rotate(35deg)', offset: 1 },
        ], { duration: 850, delay, fill: 'backwards' });
        // A full-letter-height jump, a second bounce, then a small settling hop.
        // Each ascent slows at the apex; each descent accelerates into a squash.
        animate(glyph, [
          { opacity: 0, transform: 'translateY(.2em) scale(.3, 1.35)', offset: 0, easing: 'ease-out' },
          { opacity: 1, transform: 'translateY(.12em) scale(1.2, .66)', offset: .1, easing: 'cubic-bezier(.16, 1, .3, 1)' },
          { opacity: 1, transform: `translateY(-1.05em) scale(.94, 1.12) rotate(${tilt * 5}deg)`, offset: .34, easing: 'cubic-bezier(.55, 0, .85, .4)' },
          { opacity: 1, transform: `translateY(.1em) scale(1.18, .74) rotate(${-tilt * 2}deg)`, offset: .53, easing: 'cubic-bezier(.16, 1, .3, 1)' },
          { opacity: 1, transform: `translateY(-.46em) scale(.97, 1.08) rotate(${-tilt * 3}deg)`, offset: .7, easing: 'cubic-bezier(.55, 0, .85, .4)' },
          { opacity: 1, transform: 'translateY(.035em) scale(1.1, .88)', offset: .84, easing: 'cubic-bezier(.16, 1, .3, 1)' },
          { opacity: 1, transform: 'translateY(-.15em) scale(.99, 1.03)', offset: .92, easing: 'ease-in' },
          { opacity: 1, transform: SETTLED, offset: 1 },
        ], { duration: REVEAL_DURATION, delay: delay + REVEAL_DELAY, easing: 'linear', fill: 'backwards' });
      }
      animate(wave, [
        { transform: SETTLED, offset: 0 },
        { transform: 'translateY(-.15em) scale(1.025, 1.035)', offset: .17 },
        { transform: 'translateY(.025em) scale(1.015, .98)', offset: .36 },
        { transform: SETTLED, offset: .49 },
        { transform: SETTLED, offset: 1 },
      ], { duration: 1900, delay: (reveal ? REVEAL_DELAY + REVEAL_DURATION + 120 : 0) + delay, iterations: Infinity });
    }
  }

  function removeFlight() {
    flightAnimation?.cancel();
    flightAnimation = null;
    flight?.remove();
    flight = null;
    if (target) target.style.visibility = previousTargetVisibility;
    target = null;
  }

  function exitTo(headerLogo) {
    if (exiting || destroyed) return;
    exiting = true;
    cancelLetters();
    if (shouldReduce() || !headerLogo || !node.isConnected) return;
    const from = node.getBoundingClientRect();
    const to = headerLogo.getBoundingClientRect();
    if (!from.width || !from.height || !to.width || !to.height) return;
    const computed = window.getComputedStyle(node);
    flight = node.cloneNode(true);
    flight.classList.add('pre__logo-flight');
    flight.removeAttribute('role');
    flight.removeAttribute('aria-label');
    flight.setAttribute('aria-hidden', 'true');
    Object.assign(flight.style, {
      width: `${from.width}px`, height: `${from.height}px`,
      fontSize: computed.fontSize, fontFamily: computed.fontFamily,
      lineHeight: computed.lineHeight, letterSpacing: computed.letterSpacing,
    });
    target = headerLogo;
    previousTargetVisibility = target.style.visibility;
    target.style.visibility = 'hidden';
    node.style.visibility = 'hidden';
    document.body.append(flight);
    flightAnimation = flight.animate([
      { transform: `translate3d(${from.left}px, ${from.top}px, 0) scale(1, 1)` },
      { transform: `translate3d(${to.left}px, ${to.top}px, 0) scale(${to.width / from.width}, ${to.height / from.height})` },
    ], { duration: 1100, easing: 'cubic-bezier(.165, .84, .44, 1)', fill: 'forwards' });
    // The enclosing Nuxt preloader owns completion. Its unmount cleans up the
    // flight at the exact point when the real header becomes available.
  }

  const onPreferenceChange = () => {
    play();
    if (shouldReduce() && exiting) removeFlight();
  };
  media.addEventListener('change', onPreferenceChange);
  const preferenceObserver = new MutationObserver(onPreferenceChange);
  preferenceObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  const onVisibilityChange = () => {
    for (const animation of animations) document.hidden ? animation.pause() : animation.play();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  play({ reveal: true });

  return {
    exitTo,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelLetters();
      removeFlight();
      preferenceObserver.disconnect();
      media.removeEventListener('change', onPreferenceChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      listeners.forEach(remove => remove());
    },
  };
}
