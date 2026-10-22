import {createRuntime, prepareImage, crossfadePhoto} from '/shared/concept-runtime.js';

const runtime = createRuntime();
const moods = [
  {name:'신나게',symbol:'☺',color:'#f3cb53',heading:'조금의 신나는 기분.',hero:'신나는 한 입',photo:'assets/friends.jpg',alt:'두 친구가 아이스크림을 나누는 연출 이미지',kicker:'WITH FRIENDS',title:'웃을 이유는,\n작아도 충분해.',description:'친구와 나누는 시시한 농담,\n함께 고른 아이스크림 하나.',product:'부라보콘',image:'/bravo/assets/bravo.png',word:'BRAVO!',match:'신나는 기분에 어울리는',copy:'익숙한 하트 하나에 담긴 즐거움.\n좋아하는 사람과 함께라면 더 달콤해요.',link:'/bravo/',message:'오늘은 조금 더 신나게!'},
  {name:'다정하게',symbol:'♡',color:'#edb8bd',heading:'조금의 다정한 마음.',hero:'다정한 한 입',photo:'assets/family.jpg',alt:'가족이 식탁에서 함께 간식을 나누는 연출 이미지',kicker:'BETTER TOGETHER',title:'같이 먹으면,\n더 좋은 날.',description:'한 입 나누고, 오늘의 이야기도 나누고.\n마음이 가까워지는 시간.',product:'붕어싸만코',image:'/samanco-v2/assets/samanco.png',word:'TOGETHER',match:'다정한 마음에 어울리는',copy:'바삭한 한 입, 부드럽게 번지는 달콤함.\n함께 나누고 싶은 순간을 만나보세요.',link:'/samanco-v2/',message:'다정한 마음은 나눌수록 커져.'},
  {name:'느긋하게',symbol:'◌',color:'#c0d2bc',heading:'조금의 느긋한 여유.',hero:'느긋한 한 모금',photo:'assets/quiet.jpg',alt:'햇살 아래 우유 한 잔과 쉬는 일상의 연출 이미지',kicker:'A MOMENT FOR ME',title:'잠깐 쉬어가도,\n괜찮으니까.',description:'바쁘게 흘러가는 하루에 나만의 쉼표.\n익숙한 달콤함으로 충전해요.',product:'바나나맛우유',image:'/banana-milk/assets/banana.png',word:'SLOW DOWN',match:'느긋한 여유에 어울리는',copy:'익숙한 노란 단지에 담긴 달콤한 쉼표.\n오늘은 조금 천천히, 나만의 속도로.',link:'/banana-milk/',message:'오늘은 나의 속도로, 천천히.'}
];
const root = document.documentElement;
const input = document.querySelector('#joy-input');
const cardText = document.querySelector('#card-text');
const card = document.querySelector('#joy-card');
const moodButtons = [...document.querySelectorAll('[data-mood]')];
let selected = 0;
let selectionRequest = 0;
let cardColor = moods[0].color;
let customColor = false;
function text(id, value) { document.getElementById(id).textContent = value; }
function setCardColor(color) {
  cardColor = color;
  card.style.backgroundColor = color;
  document.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === color)));
}
function updateCard() {
  const mood = moods[selected];
  cardText.textContent = input.value.trim() || mood.message;
  input.placeholder = mood.message;
  text('card-mood', mood.name); text('card-symbol', mood.symbol);
  text('selected-mood', `${mood.symbol} ${mood.name}`);
  if (!customColor) setCardColor(mood.color);
}
async function selectMood(index) {
  const request = ++selectionRequest;
  const mood = moods[index];
  // Commit image, text, product and card together. Rapid clicks are last-choice-wins.
  try { await Promise.all([prepareImage(mood.photo), prepareImage(mood.image)]); }
  catch {
    document.querySelector('#card-status').textContent = '이미지를 불러오지 못했습니다. 잠시 후 기분을 다시 선택해 주세요.';
    return;
  }
  if (request !== selectionRequest) return;
  selected = index;
  root.style.setProperty('--mood', mood.color);
  moodButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.mood) === index)));
  const heroImage = document.querySelector('#hero-product');
  const productImage = document.querySelector('#spotlight-image');
  [heroImage, productImage].forEach(img => { img.src = mood.image; img.alt = mood.product; runtime.animate(img, [{opacity:.25},{opacity:1}], 400); });
  crossfadePhoto(document.querySelector('#mood-photo'), mood.photo, mood.alt, runtime);
  text('hero-mood', `0${index + 1} — ${mood.hero}`); text('hero-product-name', mood.product);
  text('moment-heading', mood.heading); text('mood-symbol', mood.symbol); text('mood-kicker', mood.kicker);
  text('mood-title', mood.title); text('mood-description', mood.description);
  text('spotlight-word', mood.word); text('spotlight-count', `0${index + 1}`);
  text('match-label', mood.match); text('product-name', mood.product); text('product-copy', mood.copy);
  document.querySelector('#product-link').href = mood.link;
  updateCard();
  runtime.animate(document.querySelector('.spotlight-text'));
  runtime.animate(document.querySelector('.club-scene-copy>div'));
}
moodButtons.forEach(button => button.addEventListener('click', () => selectMood(Number(button.dataset.mood))));
// Decoding before interaction prevents flashes during the first transition.
moods.forEach(mood => [mood.photo, mood.image].forEach(src => prepareImage(src).catch(() => {})));
input.addEventListener('input', updateCard);
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
  customColor = true; setCardColor(button.dataset.color);
}));
const cover = document.querySelector('.club-cover');
runtime.onUpdate(() => {
  const rect = cover.getBoundingClientRect();
  if (rect.bottom <= 0) return;
  cover.style.setProperty('--lift', runtime.still() ? '0px' : `${Math.max(-18, Math.min(0, rect.top) * .045)}px`);
});
// Stop ambient motion when the cover is outside the viewport or the tab is hidden.
let coverVisible = true;
const orbit = document.querySelector('.art-orbit');
function syncOrbit() { orbit.style.animationPlayState = coverVisible && !document.hidden ? 'running' : 'paused'; }
new IntersectionObserver(entries => { coverVisible = entries[0].isIntersecting; syncOrbit(); }).observe(cover);
document.addEventListener('visibilitychange', syncOrbit);

const track = document.querySelector('.memory-track');
const memories = [...track.children];
const memoryArrows = [...document.querySelectorAll('[data-memory-dir]')];
const step = () => memories[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
let memoryTarget = null;
function moveMemory(direction) {
  const index = memoryTarget ?? Math.round(track.scrollLeft / step());
  const last = Math.ceil((track.scrollWidth - track.clientWidth) / step());
  memoryTarget = Math.max(0, Math.min(last, index + direction));
  track.scrollTo({left: memoryTarget * step(), behavior:runtime.still() ? 'instant' : 'smooth'});
}
track.addEventListener('scrollend', () => { memoryTarget = null; });
track.addEventListener('wheel', () => { memoryTarget = null; }, {passive:true});
track.addEventListener('touchstart', () => { memoryTarget = null; }, {passive:true});
function syncMemory() {
  const first = Math.round(track.scrollLeft / step());
  const visible = Math.max(1, Math.round(track.clientWidth / step()));
  text('memory-position', `${String(first + 1).padStart(2, '0')} — ${String(Math.min(6, first + visible)).padStart(2, '0')} / 06`);
  memoryArrows[0].disabled = track.scrollLeft < 2;
  memoryArrows[1].disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
}
memoryArrows.forEach(button => button.addEventListener('click', () => moveMemory(Number(button.dataset.memoryDir))));
track.addEventListener('scroll', syncMemory, {passive:true});
track.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home' || event.key === 'End') track.scrollTo({left:event.key === 'Home' ? 0 : track.scrollWidth, behavior:runtime.still() ? 'instant' : 'smooth'});
  else moveMemory(event.key === 'ArrowRight' ? 1 : -1);
});
let drag = null;
track.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  memoryTarget = null;
  drag = {x:event.clientX, left:track.scrollLeft};
  track.setPointerCapture(event.pointerId); track.classList.add('dragging');
});
track.addEventListener('pointermove', event => { if (drag) track.scrollLeft = drag.left - (event.clientX - drag.x); });
function endDrag() { drag = null; track.classList.remove('dragging'); }
['pointerup','pointercancel','lostpointercapture'].forEach(type => track.addEventListener(type, endDrag));
addEventListener('resize', syncMemory); syncMemory();

// Export the same mood, custom message and color shown in the preview.
document.querySelector('#card-form').addEventListener('submit', async event => {
  event.preventDefault();
  const status = document.querySelector('#card-status');
  const button = document.querySelector('.download');
  button.disabled = true;
  status.textContent = '오늘의 기쁨을 이미지로 만드는 중입니다.';
  const snapshot = {message:cardText.textContent, color:cardColor, mood:{...moods[selected]}};
  try {
    await document.fonts.ready;
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = snapshot.color; ctx.fillRect(0,0,1200,1200);
    ctx.fillStyle = '#26352e'; ctx.textAlign = 'center';
    ctx.font = '23px sans-serif'; ctx.fillText(`MY LITTLE JOY / ${snapshot.mood.name}`,600,105);
    ctx.font = '260px sans-serif'; ctx.fillText(snapshot.mood.symbol,600,495);
    ctx.font = '800 65px Paperlogy, sans-serif';
    const lines = []; let line = '';
    for (const char of Array.from(snapshot.message)) {
      if (ctx.measureText(line + char).width > 980 && line) { lines.push(line); line = char; }
      else line += char;
    }
    if (line) lines.push(line);
    lines.forEach((line, i) => ctx.fillText(line,600,745 + i * 95 - (lines.length - 1) * 47.5));
    ctx.font = '20px sans-serif'; ctx.fillText('작은 기쁨 수집가 · BINGGRAE MOMENT',600,1065);
    ctx.font = '16px sans-serif'; ctx.fillText('비공식 브랜드 리뉴얼 콘셉트',600,1120);
    const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
    if (!blob) throw new Error('PNG export failed');
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'my-binggrae-moment.png'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url),10000);
    status.textContent = '오늘의 기쁨을 담았습니다. 다운로드 목록을 확인해 주세요.';
  } catch (error) {
    status.textContent = '이미지를 만들지 못했습니다. 다시 시도해 주세요.';
    console.error(error);
  } finally { button.disabled = false; }
});
