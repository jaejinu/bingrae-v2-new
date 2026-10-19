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
  const context = gsap.context(() => {
    if (reducedMotion()) return;
    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top 60%',
        toggleActions: 'play none none restart',
      },
    });
    reveal.from(heading, {
      autoAlpha: 0,
      y: 35,
      duration: 0.45,
      ease: 'power2.out',
    });
    letters.forEach((letter, index) => {
      const at = 0.15 + index * 0.035;
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
  }, stage);
  return () => {
    context.revert();
    stars.remove();
    heading.innerHTML = original;
    if (previousLabel === null) heading.removeAttribute('aria-label');
    else heading.setAttribute('aria-label', previousLabel);
  };
}
