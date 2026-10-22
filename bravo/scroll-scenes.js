// Keep native page scrolling: no wheel interception or forced scroll position.
function bravoClamp(value) { return Math.max(0, Math.min(1, value)); }
function bravoSceneProgress(top, height, viewport, pinned, distance) {
  if (pinned) return bravoClamp(-top / Math.max(1, distance));
  return bravoClamp((viewport * .18 - top) / Math.max(1, height - viewport * .32));
}
function bravoStoryPosition(progress) {
  const part = bravoClamp(progress) * 3;
  const index = Math.min(2, Math.floor(part));
  // Pause on each ticket before moving to the next, so its text can be read.
  return Math.min(2, index + bravoClamp(((part - index) - .58) / .42));
}

if (typeof document !== 'undefined') {
  (() => {
    const scenes = [
      { selector: '.b-intro', kind: 'clock', length: 1.25 },
      { selector: '.b-story', kind: 'story', length: 2.3 },
      { selector: '.b-distance', kind: 'earth', length: 1.45 }
    ].map(config => {
      const section = document.querySelector(config.selector);
      const wrapper = document.createElement('div');
      wrapper.className = 'b-scroll-scene';
      wrapper.dataset.scene = config.kind;
      section.before(wrapper);
      wrapper.append(section);
      return { ...config, section, wrapper, distance: 0, pinned: false, last: -1 };
    });
    const track = document.querySelector('.b-story-track');
    const inputTime = document.querySelector('#b-time');
    const inputOrbit = document.querySelector('#b-orbit');
    let queued = false;
    let enabled = false;
    let currentTicket = -1;

    function update() {
      queued = false;
      if (!enabled) return;
      const viewport = window.innerHeight;
      for (const scene of scenes) {
        const rect = scene.wrapper.getBoundingClientRect();
        const p = bravoSceneProgress(rect.top, scene.section.offsetHeight, viewport, scene.pinned, scene.distance);
        if (Math.abs(p - scene.last) < .0001) continue;
        scene.last = p;
        scene.section.style.setProperty('--scene-progress', p);
        if (scene.kind === 'clock') {
          setTime(p * 360);
        } else if (scene.kind === 'earth') {
          const count = Math.round(1 + p * 26);
          inputOrbit.value = count;
          updateOrbit(count);
          document.querySelector('.b-earth-orbit').style.setProperty('--orbit-angle', `${-20 + p * 720}deg`);
          document.querySelector('.b-earth').style.setProperty('--earth-turn', `${p * 90}deg`);
        } else {
          const position = bravoStoryPosition(p);
          const nearest = Math.round(position);
          if (nearest !== currentTicket) { showChapter(nearest); currentTicket = nearest; }
          track.style.transform = `translateX(${-position * 100}%)`;
        }
      }
    }
    function queueUpdate() {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }
    function refresh() {
      enabled = !paused && !reduced.matches;
      document.body.classList.toggle('b-scroll-mode', enabled);
      // Measure section heights only on resize/load, never in the scroll handler.
      for (const scene of scenes) {
        scene.wrapper.classList.remove('is-pinned');
        scene.wrapper.style.height = '';
        scene.pinned = enabled && window.innerWidth > 640 && scene.section.offsetHeight <= window.innerHeight + 2;
        scene.distance = scene.pinned ? window.innerHeight * scene.length : 0;
        scene.wrapper.classList.toggle('is-pinned', scene.pinned);
        if (scene.pinned) scene.wrapper.style.height = `${scene.section.offsetHeight + scene.distance}px`;
        scene.last = -1;
      }
      document.querySelector('.b-dial-instruction').textContent = enabled ? 'SCROLL TO TURN THE CLOCK ↓' : 'DRAG AROUND THE CLOCK ↻';
      document.querySelector('.b-dial-controls label').textContent = enabled ? '스크롤하면 시계와 이야기가 함께 움직여요' : '시계를 돌려 이야기를 만나세요';
      document.querySelector('.b-orbit-control label').textContent = enabled ? '스크롤로 사랑의 거리를 이어보세요 ↓' : '밀어서 사랑의 거리를 이어보세요';
      inputTime.setAttribute('aria-label', enabled ? '스크롤로 움직이는 부라보 시계. 방향키로도 조절 가능' : '부라보 이야기 시계 각도');
      if (!enabled) { track.style.transition = ''; showChapter(Math.max(0, currentTicket)); }
      queueUpdate();
    }
    function navigateTicket(index) {
      const scene = scenes[1];
      const target = (index + 3) % 3;
      if (!enabled) { showChapter(target); return; }
      const progress = (target + .15) / 3;
      const rect = scene.wrapper.getBoundingClientRect();
      const start = window.scrollY + rect.top;
      const targetY = scene.pinned
        ? start + scene.distance * progress
        : start - window.innerHeight * .18 + (scene.section.offsetHeight - window.innerHeight * .32) * progress;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
    document.querySelector('.b-prev').onclick = () => navigateTicket(chapter - 1);
    document.querySelector('.b-next').onclick = () => navigateTicket(chapter + 1);
    document.querySelectorAll('.b-story-dots button').forEach((button, i) => button.onclick = () => navigateTicket(i));
    // Scroll captions are visual updates; avoid announcing every frame to screen readers.
    document.querySelector('.b-clock-caption').setAttribute('aria-live', 'off');
    document.querySelector('.b-orbit-message').setAttribute('aria-live', 'off');
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh, { once: true });
    document.querySelector('.motion').addEventListener('click', refresh);
    reduced.addEventListener('change', refresh);
    document.fonts?.ready.then(refresh);
    refresh();
  })();
}
