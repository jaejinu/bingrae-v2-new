(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const counter=document.querySelector('#archive-counter');
  const firstYear=1967,lastYear=2026,duration=5000;
  let start=null,frame;
  function count(now){
    if(start===null)start=now;
    const progress=Math.min(1,(now-start)/duration);
    // Quadratic ease-in: long early holds, progressively faster year changes.
    counter.textContent=String(firstYear+Math.floor((lastYear-firstYear)*progress*progress));
    if(progress<1)frame=requestAnimationFrame(count);
  }
  if(!reduce.matches&&!document.documentElement.classList.contains('site-motion-paused')){
    counter.textContent=String(firstYear);
    frame=requestAnimationFrame(count);
  }
  const statement=document.querySelector('.archive-statement');
  const lines=[...statement.querySelectorAll('h2 span')];
  statement.classList.add('is-enhanced');
  const scenes=[...document.querySelectorAll('.story-scene')];
  const sceneModes=['down','fixed','up'];
  scenes.forEach((scene,index)=>{scene.dataset.scrollMotion=sceneModes[index]});
  function updateScenes(stopped){
    const viewport=innerHeight;
    // Read all geometry before writing transforms. Images stay clipped by their section.
    const bounds=scenes.map(scene=>scene.getBoundingClientRect());
    scenes.forEach((scene,index)=>{
      const rect=bounds[index];
      scene.classList.toggle('is-scroll-scene',!stopped);
      if(stopped){
        scene.style.removeProperty('--scene-image-y');
        scene.style.removeProperty('--scene-image-height');
        return;
      }
      const progress=Math.max(0,Math.min(1,(viewport-rect.top)/(viewport+rect.height)));
      const travel=Math.min(viewport*.16,150);
      const mode=sceneModes[index];
      // Compensate page scrolling, then add independent viewport-space movement.
      // Down: -2*travel -> 0. Fixed: 0. Up: 0 -> -2*travel.
      const drift=mode==='down'?-2*travel*(1-progress):mode==='up'?-2*travel*progress:0;
      const height=Math.max(viewport,rect.height)+(mode==='fixed'?0:2*travel);
      scene.style.setProperty('--scene-image-height',height+'px');
      scene.style.setProperty('--scene-image-y',(-rect.top+drift)+'px');
    });
  }
  const eras=[...document.querySelectorAll('.history-era')];
  const image=document.querySelector('#archive-history-art');
  const dates=['1967 — 1999','2000 — 2019','2020 — TODAY'];
  const pictures=[['../banana-milk/assets/banana.png','바나나맛우유 현재 패키지'],['assets/melona-white.png','흰색 배경의 메로나 제품 이미지'],['assets/vivacity-white.png','흰색 배경의 비바시티 제품 이미지']];
  let selected=-1,queued=false;
  const historyPanel=document.querySelector('.history-sticky');
  const year=document.querySelector('#history-year');
  const eraCaption=document.querySelector('#history-caption');
  let transitions=[];
  pictures.forEach(([src])=>{const preload=new Image();preload.src=src});
  function showEra(index,stopped){
    if(index===selected)return;
    transitions.forEach(animation=>animation.cancel());
    transitions=[];
    historyPanel.querySelectorAll('.history-image-outgoing').forEach(node=>node.remove());
    const previous=selected<0?null:image.cloneNode();
    selected=index;
    year.textContent=dates[index];
    eraCaption.textContent=eras[index].dataset.caption;
    image.src=pictures[index][0];
    image.alt=pictures[index][1];
    historyPanel.dataset.activeEra=eras[index].id;
    eras.forEach((era,i)=>era.classList.toggle('is-active',i===index));
    if(previous&&!stopped&&typeof image.animate==='function'){
      previous.removeAttribute('id');
      previous.alt='';
      previous.setAttribute('aria-hidden','true');
      previous.classList.add('history-image-outgoing');
      image.parentElement.append(previous);
      const fade=previous.animate([{opacity:1},{opacity:0}],{duration:450,easing:'ease-out',fill:'forwards'});
      fade.onfinish=()=>previous.remove();
      transitions.push(fade);
      [year,eraCaption].forEach(node=>transitions.push(node.animate(
        [{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:400,easing:'ease-out'}
      )));
    }
  }
  function update(){
    queued=false;
    const rect=statement.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,(innerHeight*.9-rect.top)/(innerHeight*.7)));
    const stopped=reduce.matches||document.documentElement.classList.contains('site-motion-paused');
    updateScenes(stopped);
    lines.forEach((line,index)=>line.style.setProperty('--read',(stopped?100:Math.max(0,Math.min(1,progress*lines.length-index))*100)+'%'));
    // On phones the timeline scrolls below a compact pinned image panel.
    const trigger=matchMedia('(max-width: 760px)').matches
      ?historyPanel.getBoundingClientRect().bottom+40:innerHeight*.5;
    const active=eras.filter(era=>era.getBoundingClientRect().top<=trigger).at(-1)||eras[0];
    showEra(eras.indexOf(active),stopped);
    if(stopped){
      transitions.forEach(animation=>animation.cancel());
      historyPanel.querySelectorAll('.history-image-outgoing').forEach(node=>node.remove());
    }
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);
  function stopCounter(){cancelAnimationFrame(frame);counter.textContent='2026';update()}
  reduce.addEventListener('change',()=>{if(reduce.matches)stopCounter();else update()});
  new MutationObserver(()=>{if(document.documentElement.classList.contains('site-motion-paused'))stopCounter();else update()}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  update();
})();
