const sectionInteractions=document.createElement('script');
sectionInteractions.src='interactions.js';document.body.append(sectionInteractions);
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const bigName=document.querySelector('.big-name');
document.querySelector('.smile path').setAttribute('pathLength','1');
const nameSmile=document.createElementNS('http://www.w3.org/2000/svg','svg');
nameSmile.setAttribute('viewBox','0 0 240 70');
nameSmile.setAttribute('aria-hidden','true');
nameSmile.classList.add('name-smile');
const nameStroke=document.createElementNS('http://www.w3.org/2000/svg','path');
nameStroke.setAttribute('d','M12 12 Q120 105 228 12');
nameStroke.setAttribute('pathLength','1');
nameSmile.append(nameStroke);bigName.after(nameSmile);
if(!motionPreference.matches){
  document.documentElement.classList.add('brand-motion');
  if('IntersectionObserver' in window)bigName.classList.add('motion-ready');
}
motionPreference.addEventListener('change',event=>{
  if(event.matches){document.documentElement.classList.remove('brand-motion');bigName.classList.remove('motion-ready')}
});
const promiseImage=document.querySelector('.promise-intro figure img');
const promiseCaption=document.querySelector('.promise-intro figcaption');
const promiseFigure=promiseImage.closest('figure');
const promiseItems=[...document.querySelectorAll('.promise-list details')];
const promiseScenes=[
  {src:'assets/friends.png',alt:'공원에서 아이스크림을 즐기며 웃는 친구들',caption:'함께 웃는 순간에, 맛있는 즐거움.'},
  {src:'assets/quiet.png',alt:'창가에서 우유 한 잔을 즐기는 사람',caption:'매일의 선택에, 믿을 수 있는 마음.'},
  {src:'assets/family.png',alt:'식탁에서 간식을 나누는 가족',caption:'나누는 일상에, 함께하는 행복.'}
];
let sceneVersion=0;
async function showPromiseScene(index,animate=true){
  const version=++sceneVersion,scene=promiseScenes[index];
  const preload=new Image();preload.src=scene.src;
  try{await preload.decode()}catch{return}
  if(version!==sceneVersion)return;
  promiseImage.src=scene.src;promiseImage.alt=scene.alt;promiseCaption.textContent=scene.caption;
  promiseFigure.dataset.scene=String(index);
  promiseFigure.getAnimations().forEach(animation=>animation.cancel());
  if(animate&&!motionPreference.matches&&promiseFigure.animate){
    promiseFigure.animate([{opacity:.45,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'ease-out'});
  }
}
promiseCaption.setAttribute('aria-live','polite');promiseCaption.setAttribute('aria-atomic','true');
promiseItems.forEach((item,index)=>item.addEventListener('toggle',()=>{if(item.open)showPromiseScene(index)}));
showPromiseScene(Math.max(0,promiseItems.findIndex(item=>item.open)),false);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.3});observer.observe(document.querySelector('.big-name'))}
document.querySelectorAll('.promise-list details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.promise-list details').forEach(other=>{if(other!==item)other.open=false})}));
