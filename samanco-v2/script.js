// Animation preference and pause control.
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
const motion = $('.motion');
function syncMotion() {
  document.body.classList.toggle('paused', paused);
  motion.setAttribute('aria-pressed', String(paused));
  motion.setAttribute(
    'aria-label',
    paused ? '애니메이션 재생' : '애니메이션 일시정지',
  );
  motion.textContent = paused ? '▷' : 'Ⅱ';
}
syncMotion();
motion.onclick = () => {
  paused = !paused;
  syncMotion();
};
reduced.addEventListener('change', (e) => {
  paused = e.matches;
  syncMotion();
});
// Product drag and keyboard controls.
const product = $('.product-center');
let angle = 0,
  grab = null;
function tilt(v) {
  angle = Math.max(-25, Math.min(25, v));
  product.style.setProperty('--tilt', `${angle}deg`);
  product.setAttribute('aria-valuenow', String(Math.round(angle)));
}
tilt(0);
product.onpointerdown = (e) => {
  grab = { x: e.clientX, angle };
  product.setPointerCapture(e.pointerId);
};
product.onpointermove = (e) => {
  if (grab) tilt(grab.angle + (e.clientX - grab.x) * 0.18);
};
product.onpointerup = product.onpointercancel = () => (grab = null);
product.onkeydown = (e) => {
  if (['ArrowLeft', 'ArrowRight', 'Home'].includes(e.key)) {
    e.preventDefault();
    tilt(e.key === 'Home' ? 0 : angle + (e.key === 'ArrowLeft' ? -3 : 3));
  }
};
// Scroll-driven story scenes.
const scenes = [
  ['#b52c35', '#fff8eb', -13],
  ['#f1d59e', '#352221', 8],
  ['#57332e', '#fff8eb', -5],
];
let scene = -1;
function setScene(i) {
  if (i === scene) return;
  scene = i;
  $('.journey').style.background = scenes[i][0];
  $('.journey').style.color = scenes[i][1];
  $('.journey-image img').style.transform = `rotate(${scenes[i][2]}deg)`;
}
const observer = new IntersectionObserver(
  (entries) => {
    const active = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (active) setScene(+active.target.dataset.scene);
  },
  { threshold: [0, 0.25, 0.5, 0.75] },
);
$$('[data-scene]').forEach((e) => observer.observe(e));
setScene(0);
// Ingredient hotspot content.
const flavors = [
  [
    '01 / FISH-SHAPED WAFER',
    '눈으로 먼저 즐기는 한 입.',
    '친숙한 붕어 모양 과자가 달콤한 속을 감싸줍니다.',
    16,
  ],
  [
    '02 / ICE CREAM',
    '시원하게 녹아드는 부드러움.',
    '과자 속 아이스크림으로 사계절 시원하게 즐겨보세요.',
    -8,
  ],
  [
    '03 / RED BEAN',
    '팥이 더하는 달콤한 마무리.',
    '달콤한 팥과 부드러운 아이스크림의 반가운 조합입니다.',
    5,
  ],
];
$$('[data-flavor]').forEach(
  (b) =>
    (b.onclick = () => {
      const i = +b.dataset.flavor,
        f = flavors[i];
      $$('[data-flavor]').forEach((x) =>
        x.setAttribute('aria-pressed', String(x === b)),
      );
      $('.flavor-caption>span').textContent = f[0];
      $('.flavor-caption h3').textContent = f[1];
      $('.flavor-caption p').textContent = f[2];
      $('.flavor-stage>img').style.transform =
        `translate(-50%,-50%) rotate(${f[3]}deg)`;
    }),
);
// Rotating brand messages.
let memory = 0;
const memories = [
  '머리부터, 꼬리부터. 어떤 한 입도 반가운 붕어싸만코.',
  '1991년의 아이디어, 오늘의 달콤한 휴식.',
  '갑자기 붕어싸만코가 생각나는 순간. 오늘도 시원하게!',
];
$('.memory-trigger').onclick = () => {
  $('.memory-line').textContent = memories[memory++ % memories.length];
};
// Shared mobile navigation and scroll progress.
const burger = $('.header__burger'),
  menu = $('#mobile-menu');
function setMenu(open) {
  menu.hidden = !open;
  burger.setAttribute('aria-expanded', String(open));
  burger.textContent = open ? '닫기' : '메뉴';
  document.body.classList.toggle('menu-open', open);
}
burger.onclick = () => setMenu(menu.hidden);
menu.onclick = (e) => {
  if (e.target.closest('a')) setMenu(false);
};
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) {
    setMenu(false);
    burger.focus();
  }
});
matchMedia('(min-width:1001px)').addEventListener('change', (e) => {
  if (e.matches) setMenu(false);
});
let frame = false;
function progress() {
  frame = false;
  const range = document.documentElement.scrollHeight - innerHeight;
  $('.progress').style.width = `${range > 0 ? (scrollY / range) * 100 : 0}%`;
}
addEventListener(
  'scroll',
  () => {
    if (!frame) {
      frame = true;
      requestAnimationFrame(progress);
    }
  },
  { passive: true },
);
addEventListener('resize', progress);
progress();
