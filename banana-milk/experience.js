(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const product=document.querySelector('.danji-drag');
  let angle=0,grab=null;
  function tilt(value){angle=Math.max(-25,Math.min(25,value));product.style.setProperty('--tilt',angle+'deg');product.setAttribute('aria-valuenow',String(Math.round(angle)));product.setAttribute('aria-valuetext',Math.round(angle)+'도')}
  product.addEventListener('pointerdown',event=>{if(event.button!==0)return;grab={x:event.clientX,angle};product.setPointerCapture(event.pointerId)});
  product.addEventListener('pointermove',event=>{if(grab)tilt(grab.angle+(event.clientX-grab.x)*.18)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>product.addEventListener(type,()=>grab=null));
  product.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();tilt(event.key==='Home'?0:event.key==='End'?25:angle+(event.key==='ArrowLeft'?-3:3))}});
  const palettes=[['#f5d56c','#303c2c',-12],['#dfe6be','#303c2c',8],['#306046','#fff8eb',-4]];
  const journey=document.querySelector('.danji-journey'),chapters=[...document.querySelectorAll('[data-chapter]')];
  let previous=-1,queued=false;
  function update(){queued=false;const range=document.documentElement.scrollHeight-innerHeight;document.querySelector('.scroll-progress').style.width=(range>0?Math.min(100,scrollY/range*100):0)+'%';const active=chapters.filter(item=>item.getBoundingClientRect().top<innerHeight*.65).at(-1)||chapters[0];const index=Number(active.dataset.chapter);if(index!==previous){previous=index;journey.style.background=palettes[index][0];journey.style.color=palettes[index][1];document.querySelector('.danji-sticky img').style.transform='rotate('+(reduced.matches?0:palettes[index][2])+'deg)'}}
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();
  const flavors={banana:['01 / THE ORIGINAL','처음의 달콤함, 그대로.','1974년부터 함께한 오리지널. 익숙한 노란 단지에 담긴 달콤한 바나나의 풍미.','바나나맛우유',-12],zero:['02 / NO ADDED SUGAR','오늘은, 무가당으로.','바나나맛우유 무가당. 상세 원재료와 영양정보는 공식 제품 정보를 확인해 주세요.','바나나맛우유 무가당',8],light:['03 / LIGHT','익숙한 단지의 또 다른 선택.','바나나맛우유 Light. 오늘의 취향에 맞는 단지를 만나보세요.','바나나맛우유 Light',-6],strawberry:['04 / STRAWBERRY','분홍빛으로 만나는 즐거움.','달콤한 딸기의 풍미가 생각나는 날에는, 딸기맛우유.','딸기맛우유',12]};
  document.querySelectorAll('[data-product]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.product,data=flavors[key];document.querySelectorAll('[data-product]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));const image=document.querySelector('#selected-product');image.src='assets/'+key+'.png';image.alt=data[3];image.style.transform='translate(-50%,-50%) rotate('+(reduced.matches?0:data[4])+'deg)';document.querySelector('#flavor-label').textContent=data[0];document.querySelector('#flavor-title').textContent=data[1];document.querySelector('#flavor-description').textContent=data[2]}));
  const memories={bath:'따뜻한 물에 몸을 담그고 나온 날.\n시원한 한 모금이면, 오늘의 행복은 충분했어요.',school:'학교가 끝나고 친구와 나란히 걷던 길.\n단지 하나를 고르며, 오늘의 이야기를 꺼냈어요.',break:'조금 바쁜 하루에도 잠깐은 쉬어 가요.\n편의점에서 만난 익숙한 노랑이 작은 쉼표가 되어줘요.'};
  let memoryIndex=0;const keys=Object.keys(memories);
  function selectMemory(key){memoryIndex=keys.indexOf(key);document.querySelectorAll('[data-memory]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.memory===key)));const text=document.querySelector('#memory-text');text.textContent=memories[key];text.style.whiteSpace='pre-line'}
  document.querySelectorAll('[data-memory]').forEach(button=>button.addEventListener('click',()=>selectMemory(button.dataset.memory)));
  document.querySelector('.danji-memory-trigger').addEventListener('click',()=>selectMemory(keys[(memoryIndex+1)%keys.length]));
})();
