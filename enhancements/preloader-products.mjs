// High-resolution cutouts move through a shallow 3D space; these are not meshes.
// Visible horizontal bounds measured from the opaque product pixels. Transparent
// canvas margins and faint edge halos must not count as product width.
const PRODUCTS = [
  { name: 'yoplait', width: 1354, height: 1162, left: 80, right: 1291 },
  { name: 'banana-milk', width: 1165, height: 1350, left: 88, right: 1075 },
  { name: 'bravo', width: 1024, height: 1536, left: 244, right: 783, scale: 1.1 },
  { name: 'samanco', width: 1536, height: 1024, left: 60, right: 1439 },
];
const PRODUCT_SCALE = .8;
const PRODUCT_GAP_SCALE = .433333;
const REST = 'translate3d(0, 0, 0) rotateY(0deg) rotateZ(0deg) scale(1)';

export function createPreloaderProducts(row, { reducedMotion } = {}) {
  if (!row) return { play: () => Promise.resolve(), exit() {}, destroy() {} };
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shouldReduce = reducedMotion ?? (() => media.matches && document.documentElement.dataset.motion !== 'full');
  const animations = new Set();
  let destroyed = false;
  let exiting = false;
  let introFinished = false;
  let loadTimer;
  const items = [...row.children].map((element, index) => {
    const product = PRODUCTS[index];
    const visual = document.createElement('div');
    visual.className = 'pre__product-visual';
    const image = new Image();
    image.className = 'pre__product-image';
    image.alt = '';
    image.draggable = false;
    image.decoding = 'async';
    image.fetchPriority = 'high';
    image.src = `/enhancements/products/${product.name}.png`;
    visual.append(image);
    element.append(visual);
    element.dataset.product = product.name;
    return { element, visual, image, product, index };
  });
  row.classList.add('pre__row--large');
  row.dataset.productMotion = 'loading';

  function layoutProducts() {
    const width = row.clientWidth;
    const height = row.clientHeight;
    if (!width || !height) return;
    const referenceGap = parseFloat(getComputedStyle(row).columnGap) || 0;
    // Product sizing stays independent from the spacing adjustment.
    const referenceWidth = (width - referenceGap * (items.length - 1)) / items.length;
    let leftInset = 0;
    let rightInset = 0;
    let totalProductWidth = 0;
    for (const { element, image, product, index } of items) {
      const scale = Math.min(referenceWidth / product.width, height / product.height) * PRODUCT_SCALE * (product.scale ?? 1);
      const imageWidth = product.width * scale;
      const imageHeight = product.height * scale;
      const productWidth = (product.right - product.left) * scale;
      totalProductWidth += productWidth;
      element.style.width = `${productWidth}px`;
      Object.assign(image.style, {
        width: `${imageWidth}px`, height: `${imageHeight}px`,
        left: `${-product.left * scale}px`, top: `${(height - imageHeight) / 2}px`,
      });
      if (index === 0) leftInset = (referenceWidth - imageWidth) / 2 + product.left * scale;
      if (index === items.length - 1) rightInset = (referenceWidth - imageWidth) / 2 + (product.width - product.right) * scale;
    }
    // Reduce every silhouette-to-silhouette gap equally, keeping the group centered.
    const totalGap = Math.max(0, width - leftInset - rightInset - totalProductWidth);
    const inwardShift = totalGap * (1 - PRODUCT_GAP_SCALE) / 2;
    row.style.paddingLeft = `${leftInset + inwardShift}px`;
    row.style.paddingRight = `${rightInset + inwardShift}px`;
  }
  layoutProducts();
  const resizeObserver = new ResizeObserver(layoutProducts);
  resizeObserver.observe(row, { box: 'border-box' });

  function animate(element, keyframes, options) {
    const animation = element.animate(keyframes, { easing: 'cubic-bezier(.22, 1, .36, 1)', ...options });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  }

  function cancelAll() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }

  function wave() {
    if (destroyed || exiting || shouldReduce()) return;
    for (const { visual, index } of items) {
      animate(visual, [
        { transform: REST, offset: 0 },
        { transform: 'translate3d(0, -12px, 0) rotateY(-4deg) rotateZ(-2deg) scale(1.025, 1.035)', offset: .2 },
        { transform: 'translate3d(0, 3px, 0) rotateY(2deg) rotateZ(1deg) scale(1.025, .98)', offset: .4 },
        { transform: REST, offset: .58 },
        { transform: REST, offset: 1 },
      ], { duration: 2400, delay: index * 150, iterations: Infinity });
    }
  }

  async function play() {
    // Start the sequence together, after decoding, even on a cold image cache.
    await Promise.race([
      Promise.allSettled(items.map(({ image }) => image.decode())),
      new Promise(resolve => { loadTimer = setTimeout(resolve, 8000); }),
    ]);
    clearTimeout(loadTimer);
    if (destroyed || exiting) return;
    layoutProducts();
    row.dataset.productMotion = 'spreading';
    if (!shouldReduce() && typeof row.animate === 'function') {
      const bounds = row.getBoundingClientRect();
      const center = bounds.left + bounds.width / 2;
      const flights = items.map(({ element, visual, index }) => {
        const rect = element.getBoundingClientRect();
        const dx = center - (rect.left + rect.width / 2);
        const tilt = [-12, 9, -7, 14][index];
        const stack = `translate3d(${dx + (index - 1.5) * 11}px, ${index * -6}px, 0) rotateY(${tilt}deg) rotateZ(${tilt}deg) scale(.82)`;
        element.style.zIndex = String(4 - index);
        animate(visual, [{ opacity: 0 }, { opacity: 1 }], { duration: 280 });
        return animate(element, [
          { transform: stack, offset: 0 },
          { transform: stack, offset: .38 },
          { transform: `translate3d(${-Math.sign(dx) * 15}px, -14px, 0) rotateY(${-tilt / 2}deg) rotateZ(${-tilt / 3}deg) scale(1.055, .96)`, offset: .78 },
          { transform: 'translate3d(0, 4px, 0) rotateY(1deg) rotateZ(1deg) scale(.985, 1.025)', offset: .9 },
          { transform: REST, offset: 1 },
        ], { duration: 1800, delay: index * 280, fill: 'backwards' }).finished.catch(() => {});
      });
      await Promise.all(flights);
    }
    if (destroyed || exiting) return;
    introFinished = true;
    row.dataset.productMotion = 'settled';
    wave();
  }

  function onPreferenceChange() {
    if (!shouldReduce()) {
      if (introFinished) { cancelAll(); wave(); }
      return;
    }
    cancelAll();
  }
  function onVisibilityChange() {
    for (const animation of animations) document.hidden ? animation.pause() : animation.play();
  }
  const preferenceObserver = new MutationObserver(onPreferenceChange);
  preferenceObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  media.addEventListener('change', onPreferenceChange);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return {
    play,
    exit() { exiting = true; cancelAll(); },
    destroy() {
      destroyed = true;
      clearTimeout(loadTimer);
      cancelAll();
      preferenceObserver.disconnect();
      resizeObserver.disconnect();
      media.removeEventListener('change', onPreferenceChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
