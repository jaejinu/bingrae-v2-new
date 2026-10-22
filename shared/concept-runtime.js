/** Shared motion contract: pausing never changes geometry or scroll position. */
export function createRuntime() {
  const root = document.documentElement;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('.motion');
  const updates = new Set();
  const animations = new Set();
  let paused = false;
  let queued = false;
  const still = () => paused || media.matches;
  function render() {
    queued = false;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--read', max > 0 ? Math.min(1, scrollY / max) : 0);
    const links = [...document.querySelectorAll('.site-bar nav a')];
    let current = null;
    for (const link of links) {
      const section = document.querySelector(link.getAttribute('href'));
      if (section && section.getBoundingClientRect().top <= innerHeight * .45) current = link;
      link.removeAttribute('aria-current');
    }
    current?.setAttribute('aria-current', 'location');
    for (const update of updates) update();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }
  function syncMotion() {
    root.classList.toggle('no-motion', still());
    button.setAttribute('aria-pressed', String(still()));
    button.innerHTML = media.matches ? '모션 감소 설정' : still() ? '<span aria-hidden="true">▶</span> 모션 켜기' : '<span aria-hidden="true">Ⅱ</span> 모션 끄기';
    button.disabled = media.matches;
    if (still()) for (const animation of animations) animation.finish();
    schedule();
  }
  button.addEventListener('click', () => { paused = !paused; syncMotion(); });
  media.addEventListener('change', syncMotion);
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  // Content is always visible; transitions never gate reading or interaction.
  function animate(node, frames = [{opacity:.45, transform:'translateY(7px)'}, {opacity:1, transform:'translateY(0)'}], duration = 380) {
    if (still() || !node.animate) return null;
    node.getAnimations().forEach(animation => animation.cancel());
    const animation = node.animate(frames, {duration, easing:'cubic-bezier(.2,.7,.2,1)'});
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    return animation;
  }
  syncMotion();
  return {still, animate, schedule, onUpdate(fn) { updates.add(fn); schedule(); }};
}

const imageCache = new Map();
export function prepareImage(src) {
  const url = new URL(src, location.href).href;
  if (!imageCache.has(url)) {
    const img = new Image();
    img.src = url;
    imageCache.set(url, img.decode().then(() => url).catch(error => {
      imageCache.delete(url);
      throw error;
    }));
  }
  return imageCache.get(url);
}

/** Call after decoding: retain the outgoing photo until the new photo is ready. */
export function crossfadePhoto(img, src, alt, runtime) {
  const parent = img.parentElement;
  parent.querySelectorAll('[data-outgoing]').forEach(node => node.remove());
  if (new URL(src, location.href).href === img.src) { img.alt = alt; return; }
  const old = img.cloneNode(false);
  old.removeAttribute('id'); old.removeAttribute('loading'); old.alt = '';
  old.setAttribute('aria-hidden', 'true'); old.dataset.outgoing = '';
  Object.assign(old.style, {position:'absolute', inset:'0', width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none'});
  img.src = src; img.alt = alt;
  if (runtime.still()) return;
  parent.append(old);
  const animation = runtime.animate(old, [{opacity:1},{opacity:0}], 480);
  if (animation) animation.finished.catch(() => {}).finally(() => old.remove());
  else old.remove();
}
