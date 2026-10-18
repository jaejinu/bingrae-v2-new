/** Break the rendered schedule into clipped pieces of its original typography. */
export function createWordShatter(pin, tokens, { gsap, speed = 1, columns: requestedColumns, rows: requestedRows }) {
  let layer;
  let timeline;

  const paintProperties = [
    'display', 'box-sizing', 'align-items', 'flex-direction', 'column-gap', 'row-gap',
    'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch',
    'font-feature-settings', 'font-variation-settings', 'line-height', 'letter-spacing',
    'white-space', 'text-transform', 'color', '-webkit-text-stroke', 'paint-order',
    'text-shadow', 'margin-top', 'vertical-align',
    'object-fit', 'object-position', 'filter',
  ];

  function freezeAppearance(source, copy) {
    const style = getComputedStyle(source);
    copy.removeAttribute('class');
    copy.removeAttribute('style');
    copy.removeAttribute('id');
    for (const property of paintProperties) copy.style.setProperty(property, style.getPropertyValue(property));
  }

  function clear() {
    timeline?.kill();
    timeline = undefined;
    layer?.remove();
    layer = undefined;
  }

  function burst() {
    clear();
    const area = pin.getBoundingClientRect();
    const span = Math.min(area.width, area.height);
    const columns = requestedColumns ?? (area.width <= 760 ? 2 : 3);
    const rows = requestedRows ?? 2;
    const pieces = [];
    const batch = document.createDocumentFragment();
    const noise = seed => {
      const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return value - Math.floor(value);
    };

    // Read every settled word before attaching anything to the live layout.
    const snapshots = tokens.map(token => {
      const bounds = token.getBoundingClientRect();
      const template = token.cloneNode(true);
      const sourceChildren = [...token.querySelectorAll('*')];
      const copyChildren = [...template.querySelectorAll('*')];
      freezeAppearance(token, template);
      sourceChildren.forEach((child, index) => freezeAppearance(child, copyChildren[index]));
      template.className = 'hero__fragment-copy';
      Object.assign(template.style, {
        position: 'static', margin: '0', width: `${bounds.width}px`, height: `${bounds.height}px`,
        opacity: '1', visibility: 'visible', transform: 'none',
      });
      return { bounds, template };
    });

    snapshots.forEach(({ bounds, template }, wordIndex) => {
      const wordX = bounds.left + bounds.width / 2 - area.left - area.width / 2;
      const wordY = bounds.top + bounds.height / 2 - area.top - area.height * .44;
      const outward = Math.atan2(wordY, wordX);
      const wave = Math.hypot(wordX / area.width, wordY / area.height) * .14;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const left = column * 100 / columns;
          const right = (column + 1) * 100 / columns;
          const top = row * 100 / rows;
          const bottom = (row + 1) * 100 / rows;
          const tl = `${left}% ${top}%`, tr = `${right}% ${top}%`;
          const bl = `${left}% ${bottom}%`, br = `${right}% ${bottom}%`;
          const triangles = (row + column) % 2
            ? [[tl, tr, bl], [tr, br, bl]]
            : [[tl, tr, br], [tl, br, bl]];
          triangles.forEach((vertices, half) => {
            const seed = wordIndex * 31 + row * 11 + column * 3 + half + 1;
            const angle = outward + (noise(seed) - .5) * 3.1;
            const distance = span * (.28 + noise(seed + 17) * .48);
            const shard = document.createElement('span');
            shard.className = 'hero__shard';
            Object.assign(shard.style, {
              left: `${bounds.left - area.left}px`, top: `${bounds.top - area.top}px`,
              width: `${bounds.width}px`, height: `${bounds.height}px`,
              clipPath: `polygon(${vertices.join(', ')})`,
              transformOrigin: `${(column + .5) * 100 / columns}% ${(row + .5) * 100 / rows}%`,
            });
            shard.append(template.cloneNode(true));
            batch.append(shard);
            pieces.push({
              shard,
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              lift: span * (.045 + noise(seed + 23) * .07),
              gravity: span * (.08 + noise(seed + 29) * .14),
              rotation: (noise(seed + 37) > .5 ? 1 : -1) * (100 + noise(seed + 41) * 260),
              delay: wave + noise(seed + 47) * .025,
            });
          });
        }
      }
    });

    layer = document.createElement('div');
    layer.className = 'hero__shards';
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    layer.append(batch);
    pin.append(layer);
    // Swap the complete words for the matching shards in the same frame.
    gsap.set(tokens, { autoAlpha: 0 });
    timeline = gsap.timeline({ onComplete: clear }).timeScale(speed);
    for (const piece of pieces) {
      const { shard, x, y, lift, gravity, rotation, delay } = piece;
      timeline
        .to(shard, { x, rotation, duration: .94, ease: 'power2.out' }, delay)
        .to(shard, { scale: .18, duration: .94, ease: 'power1.in' }, delay)
        .to(shard, { y: y * .55 - lift, duration: .28, ease: 'power2.out' }, delay)
        .to(shard, { y: y + gravity, duration: .66, ease: 'power1.in' }, delay + .28)
        .to(shard, { opacity: 0, duration: .32, ease: 'power1.in' }, delay + .58);
    }
  }

  return { burst, clear };
}
