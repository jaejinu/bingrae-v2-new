// 수정 위치: enhancements/today-slogan.mjs — 슬로건 글자 분해/역스크롤 복원.
// 연결: _startup-fixed/0myL3wtN.js의 SectionTodaySlogan → index.html #today-slogan.
// 분해 엔진: enhancements/hero-shatter.mjs의 createWordShatter (Moments와 동일).
import { createWordShatter } from './hero-shatter.mjs';
// Today 전용 전체 화면 슬로건. Moments의 글자 바운스 수치와 별 SVG/CSS를 그대로 재사용합니다.
export function createTodaySlogan(root, { gsap, reducedMotion }) {
  const stage = root.querySelector(':scope > .section-head');
  const heading = stage?.querySelector('h2');
  if (!heading) return () => {};
  const original = heading.innerHTML;
  const previousLabel = heading.getAttribute('aria-label');
  heading.setAttribute('aria-label', '빙그레는 오늘도 새로운 틈을 만듭니다.');
  heading.replaceChildren();
  const letters = [];
  for (const label of ['빙그레는 오늘도', '새로운 틈을 만듭니다.']) {
    const line = document.createElement('span');
    line.className = 'moments-copy-line';
    line.setAttribute('aria-hidden', 'true');
    for (const character of label) {
      const letter = document.createElement('span');
      letter.className = 'moments-copy-letter';
      letter.textContent = character === ' ' ? '\u00a0' : character;
      line.append(letter);
      letters.push(letter);
    }
    heading.append(line);
  }
  const stars = document.createElement('div');
  stars.className = 'moments-copy-stars';
  stars.setAttribute('aria-hidden', 'true');
  let template = document.querySelector('.hero__spark');
  if (!template) {
    template = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    template.setAttribute('viewBox', '0 0 40 40');
    template.innerHTML =
      '<path d="M20 2 C21.5 13 27 18.5 38 20 C27 21.5 21.5 27 20 38 C18.5 27 13 21.5 2 20 C13 18.5 18.5 13 20 2 Z" fill="#fffdf6" stroke="#141414" stroke-width="2.5" stroke-linejoin="round"/>';
  }
  for (let i = 0; i < 4; i++) {
    const star = template.cloneNode(true);
    star.removeAttribute('id');
    star.removeAttribute('style');
    star.setAttribute('class', 'moments-copy-star');
    star.style.setProperty('--delay', `${i * -0.55}s`);
    stars.append(star);
  }
  stage.append(stars);
  // Moments와 동일한 글자 조각 생성기, 90% 분해 지점, 88% 역스크롤 복원 지점을 사용합니다.
  const shatter = createWordShatter(
    stage,
    letters.filter((letter) => letter.textContent !== '\u00a0'),
    { gsap },
  );
  let reveal,
    scroll,
    scattered = false;
  function restore() {
    shatter.clear();
    gsap.set(letters, {
      autoAlpha: 1,
      yPercent: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    });
    scattered = false;
    root.dataset.sloganPhase = 'text';
  }
  function finishCopy() {
    if (scattered || !reveal || (scroll?.scrollTrigger?.progress ?? 0) < 0.9)
      return;
    scattered = true;
    // 빠르게 스크롤해도 시간 대기로 분해가 생략되지 않도록 글자를 정렬한 뒤 조각냅니다.
    reveal.progress(1, true);
    gsap.set(letters, { yPercent: 0, scaleX: 1, scaleY: 1, rotation: 0 });
    root.dataset.sloganPhase = 'text-scatter';
    shatter.burst();
  }
  root.dataset.sloganPhase = 'text';
  const context = gsap.context(() => {
    if (reducedMotion()) return;
    reveal = gsap.timeline({ paused: true });
    letters.forEach((letter, index) => {
      const at = 1 + index * 0.035;
      reveal
        .to(letter, { scaleX: 1.12, scaleY: 0.82, duration: 0.08 }, at)
        .to(
          letter,
          {
            yPercent: -30,
            scaleX: 0.96,
            scaleY: 1.05,
            rotation: index % 2 ? 3 : -3,
            duration: 0.2,
            ease: 'power2.out',
          },
          at + 0.08,
        )
        .to(
          letter,
          {
            yPercent: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'bounce.out',
          },
          at + 0.28,
        );
    });
    reveal.call(finishCopy, [], 7.5);
    scroll = gsap
      .timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => '+=' + innerHeight * 3.5,
          pin: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
          onEnter: () => {
            restore();
            reveal.restart();
          },
          onUpdate: (self) => {
            if (scattered && self.progress < 0.88) restore();
            finishCopy();
          },
          onLeaveBack: () => {
            reveal.pause(0);
            restore();
          },
          onRefresh: () => {
            if (scattered) restore();
          },
        },
      })
      .to({}, { duration: 1 });
  }, stage);
  return () => {
    reveal?.kill();
    scroll?.scrollTrigger?.kill();
    scroll?.kill();
    shatter.clear();
    context.revert();
    delete root.dataset.sloganPhase;
    stars.remove();
    heading.innerHTML = original;
    if (previousLabel === null) heading.removeAttribute('aria-label');
    else heading.setAttribute('aria-label', previousLabel);
  };
}
