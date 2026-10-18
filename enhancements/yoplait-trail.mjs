/** A viewport SVG whose endpoints stay attached to the star and next product. */
export function createYoplaitTrail(star, { gsap }) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('yoplait-scroll-trail');
  Object.assign(svg.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '41', overflow: 'hidden', visibility: 'hidden' });
  const path = document.createElementNS(ns, 'path');
  for (const [name, value] of Object.entries({ fill: 'none', stroke: '#000', 'stroke-width': '3', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' })) path.setAttribute(name, value);
  // Keep the draw-on mask separate from the visible dash pattern.
  const defs = document.createElementNS(ns, 'defs');
  const mask = document.createElementNS(ns, 'mask');
  const maskId = `trail-reveal-${Math.random().toString(36).slice(2)}`;
  mask.setAttribute('id', maskId);
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('x', '-10000'); mask.setAttribute('y', '-10000');
  mask.setAttribute('width', '20000'); mask.setAttribute('height', '20000');
  path.setAttribute('stroke', '#fff'); path.setAttribute('stroke-width', '6');
  mask.append(path); defs.append(mask); svg.append(defs);
  const dashed = document.createElementNS(ns, 'path');
  for (const [name,value] of Object.entries({fill:'none',stroke:'#000','stroke-width':'3','stroke-linecap':'round','stroke-dasharray':'10 8','vector-effect':'non-scaling-stroke',mask:`url(#${maskId})`})) dashed.setAttribute(name,value);
  svg.append(dashed);
  const tip = document.createElementNS(ns, 'g');
  const tipStar = document.createElementNS(ns, 'g');
  const originalPath = star.querySelector('path');
  if (originalPath) tipStar.append(originalPath.cloneNode(true));
  tipStar.setAttribute('transform', 'translate(-20 -20)');
  tip.append(tipStar);
  svg.append(tip);
  document.body.append(svg);
  let enabled = false, startScroll = 0, endScroll = 1, frame = 0, pulse;
  function draw() {
    frame = 0;
    if (!enabled) return;
    svg.style.display='block';
    const moments=document.querySelector('#moments');
    if (['text','text-scatter'].includes(moments?.dataset.momentsPhase) && Math.abs(moments.getBoundingClientRect().top)<innerHeight*.75) {
      svg.style.visibility='hidden';svg.style.display='none';return;
    }
    const target = document.querySelector('#moments .moments-cinema') || document.querySelector('#moments .product-art');
    if (!target) return;
    const a = star.getBoundingClientRect(), b = target.getBoundingClientRect();
    const x1 = a.left + a.width / 2, y1 = a.top + a.height / 2;
    const x2 = b.left + b.width / 2, y2 = b.top + b.height * .25;
    const bend = Math.min(innerWidth * .22, 240);
    const gap = Math.max(120, (y2 - y1) * .5);
    path.setAttribute('d', `M ${x1} ${y1} C ${x1 - bend} ${y1 + gap}, ${x2 + bend} ${y2 - gap}, ${x2} ${y2}`);

    const progress = Math.max(0, Math.min(1, (scrollY - startScroll) / Math.max(160, endScroll - startScroll)));
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length * (1 - progress)}`;
    path.style.opacity = '1';
    tip.style.visibility = 'visible';
    let point = path.getPointAtLength(length * progress);
    svg.style.visibility = 'visible';
    svg.style.opacity = '1';
    svg.dataset.phase = 'hero-to-yoplait';
    if (progress >= 1) {
      // A connector exists only between adjacent product panels, never as a free-floating trail.
      const panels = [...document.querySelectorAll('#icons .icon-panel')];
      const first = panels[0]?.getBoundingClientRect();
      const section = document.querySelector('#icons')?.getBoundingClientRect();
      const travel = first ? -first.left / first.width : 0;
      const index = Math.floor(Math.max(0,travel));
      const fraction = travel-index;
      const active = section && Math.abs(section.top)<3 && index<panels.length-1 && fraction>.06 && fraction<.94;
      if (!active) {
        svg.style.visibility='hidden';svg.style.display='none';
        svg.dataset.phase='arrived';
        return;
      }
      const from=panels[index].querySelector('.icon-panel__art').getBoundingClientRect();
      const to=panels[index+1].querySelector('.icon-panel__art').getBoundingClientRect();
      const ax=from.left+from.width/2,ay=from.top+from.height*.25;
      const bx=to.left+to.width/2,by=to.top+to.height*.25;
      const arc=Math.min(innerHeight*.30,260);
      path.setAttribute('d',`M ${ax} ${ay} C ${ax+innerWidth*.30} ${ay-arc}, ${bx-innerWidth*.30} ${by-arc}, ${bx} ${by}`);
      const t=(fraction-.06)/.88;
      const total=path.getTotalLength();
      path.style.strokeDasharray=`${total}`;
      path.style.strokeDashoffset=`${total*(1-t)}`;
      point=path.getPointAtLength(total*t);
      svg.style.opacity=String(Math.min(1,t/.12,(1-t)/.12));
      svg.dataset.phase='product-transition';
      svg.dataset.transition=`${index+1}-${index+2}`;
    }
    dashed.setAttribute('d', path.getAttribute('d'));
    tip.setAttribute('transform', `translate(${point.x} ${point.y})`);
    svg.dataset.progress = progress.toFixed(3);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  return {
    start(range) {
      if (enabled) return;
      enabled = true;
      startScroll = range?.start ?? scrollY;
      endScroll = range?.end ?? (scrollY + innerHeight);
      svg.style.visibility = 'visible';
      star.style.animation = 'none';
      gsap.set(star, { opacity: 0 });
      pulse = gsap.to(tipStar, { opacity: .35, duration: .65, repeat: -1, yoyo: true, ease: 'sine.inOut', onUpdate: schedule });
      draw();
    },
    reset() {
      enabled = false;
      pulse?.kill();
      svg.style.visibility = 'hidden';svg.style.display='none';
      gsap.set(star, { scale: 1, opacity: 1 });
    },
    destroy() {
      pulse?.kill();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      svg.remove();
      star.style.removeProperty('animation');
    },
  };
}



