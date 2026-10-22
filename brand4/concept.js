import {createRuntime, prepareImage} from '/shared/concept-runtime.js';
import {history} from './history-data.js';

const runtime = createRuntime();
const desktop = matchMedia('(min-width:701px)');
const notes = [...document.querySelectorAll('.scene-note')];
const photos = [...document.querySelectorAll('.scene-photo')];
const sceneLinks = [...document.querySelectorAll('.scene-steps a')];
const captions = ['WITH FRIENDS', 'AROUND OUR TABLE', 'A MOMENT FOR ME'];
let activeScene = 0;
let sceneRequest = 0;
async function chooseScene(index) {
  if (index === activeScene) return;
  const token = ++sceneRequest;
  try { await prepareImage(photos[index].src); } catch { return; }
  if (token !== sceneRequest) return;
  activeScene = index;
  photos.forEach((photo, i) => {
    photo.classList.toggle('is-active', i === index);
    photo.setAttribute('aria-hidden', String(i !== index));
  });
  sceneLinks.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
  document.querySelector('#scene-caption').textContent = captions[index];
  document.querySelector('#scene-count').textContent = `0${index + 1} / 03`;
}
photos.forEach((photo, i) => {
  photo.setAttribute('aria-hidden', String(i !== 0));
  prepareImage(photo.src).catch(() => {});
});
runtime.onUpdate(() => {
  const cover = document.querySelector('.journal-cover');
  const rect = cover.getBoundingClientRect();
  if (rect.bottom > 0) cover.style.setProperty('--cover-shift', runtime.still() ? '0px' : `${Math.min(16, Math.max(0, -rect.top) * .025)}px`);
  if (!desktop.matches) return;
  let index = 0;
  notes.forEach((note, i) => { if (note.getBoundingClientRect().top < innerHeight * .52) index = i; });
  // Always invalidate a pending image if the scroll direction changes back.
  if (index === activeScene) sceneRequest++;
  else chooseScene(index);
});
desktop.addEventListener('change', runtime.schedule);

const yearButtons = [...document.querySelectorAll('[data-year-index]')];
const arrows = [...document.querySelectorAll('[data-year-dir]')];
let activeYear = 0;
let yearRequest = 0;
async function chooseYear(index) {
  if (index < 0 || index >= history.length) return;
  const token = ++yearRequest;
  const entry = history[index];
  try { await prepareImage(entry.image); } catch {
    // Text remains available even if an individual reference image cannot load.
  }
  if (token !== yearRequest) return;
  activeYear = index;
  yearButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  document.querySelector('#archive-index').textContent = String(index + 1).padStart(2, '0');
  document.querySelector('#archive-year').textContent = entry.year;
  document.querySelector('#archive-title').textContent = entry.title;
  document.querySelector('#archive-body').textContent = entry.body;
  const img = document.querySelector('#archive-image');
  img.src = entry.image; img.alt = entry.alt;
  const source = document.querySelector('#archive-source');
  source.href = entry.link; source.textContent = `${entry.caption} ↗`;
  arrows[0].disabled = index === 0; arrows[1].disabled = index === history.length - 1;
  runtime.animate(document.querySelector('.archive-copy'));
  runtime.animate(img, [{opacity:.25},{opacity:1}]);
}
yearButtons.forEach(button => button.addEventListener('click', () => chooseYear(Number(button.dataset.yearIndex))));
arrows.forEach(button => button.addEventListener('click', () => chooseYear(activeYear + Number(button.dataset.yearDir))));
arrows[0].disabled = true;
// Keyboard traversal of the year row follows native button focus conventions.
document.querySelector('.year-picker').addEventListener('keydown', event => {
  const index = yearButtons.indexOf(document.activeElement);
  if (index < 0 || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? history.length - 1 : Math.max(0, Math.min(history.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
  yearButtons[next].focus(); chooseYear(next);
});
document.querySelector('.complete-history').addEventListener('toggle', runtime.schedule);
