const menu=document.querySelector('.menu'),nav=document.querySelector('#nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','메뉴 열기')}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기')});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus()}});
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu()});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.3});observer.observe(document.querySelector('.big-name'))}
document.querySelectorAll('.promise-list details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.promise-list details').forEach(other=>{if(other!==item)other.open=false})}));
