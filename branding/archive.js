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
  const journey=document.querySelector('.brand-journey');
  const clamp=value=>Math.max(0,Math.min(1,value));
  function updateJourney(stopped){
    journey.classList.toggle('is-pinned',!stopped);
    if(stopped){
      lines.forEach(line=>line.style.setProperty('--read','100%'));
      return;
    }
    const bounds=journey.getBoundingClientRect();
    const progress=clamp(-bounds.top/Math.max(1,bounds.height-innerHeight));
    const enter=clamp((progress-.14)/.18);
    const exit=clamp((progress-.85)/.15);
    const read=clamp((progress-.33)/.4);
    journey.style.setProperty('--opening-opacity',1-enter);
    journey.style.setProperty('--opening-y',(-enter*28)+'px');
    journey.style.setProperty('--statement-opacity',enter*(1-exit));
    journey.style.setProperty('--statement-y',((1-enter)*28-exit*24)+'px');
    journey.style.setProperty('--description-opacity',clamp((read-.75)/.25));
    journey.style.setProperty('--warmth',clamp((progress-.45)/.5));
    lines.forEach((line,index)=>line.style.setProperty('--read',clamp(read*lines.length-index)*100+'%'));
    if(progress>.14){cancelAnimationFrame(frame);counter.textContent=String(lastYear)}
  }
  // The per-year gallery owns history when present; retain era effects for older layouts.
  if(document.querySelector('script[src="history-gallery.js"]')){
    const updateIntro=()=>{
      const stopped=reduce.matches||document.documentElement.classList.contains('site-motion-paused');
      if(stopped){cancelAnimationFrame(frame);counter.textContent=String(lastYear)}
      updateJourney(stopped);
    };
    let pending=false;
    addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;updateIntro()})}},{passive:true});
    addEventListener('resize',updateIntro);
    reduce.addEventListener('change',updateIntro);
    new MutationObserver(updateIntro).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    updateIntro();
    return;
  }
  const eras=[...document.querySelectorAll('.history-era')];
  const image=document.querySelector('#archive-history-art');
  const dates=['1967 — 1999','2000 — 2019','2020 — TODAY'];
  const pictures=[['../banana-milk/assets/banana.png','바나나맛우유 현재 패키지'],['assets/melona-white.png','흰색 배경의 메로나 제품 이미지'],['assets/vivacity-decor.png','꽃과 열매로 꾸민 비바시티 배경']];
  let selected=-1,queued=false;
  const historyPanel=document.querySelector('.history-sticky');
  const year=document.querySelector('#history-year');
  const eraCaption=document.querySelector('#history-caption');
  const pointerDevice=matchMedia('(hover: hover) and (pointer: fine)');
  const productFrame=image.parentElement;
  let pointerFrame=0;
  function resetProductTilt(){
    cancelAnimationFrame(pointerFrame);
    pointerFrame=0;
    image.style.removeProperty('--product-x');
    image.style.removeProperty('--product-y');
    image.style.removeProperty('--product-tilt');
  }
  productFrame.addEventListener('pointermove',event=>{
    if(!pointerDevice.matches||!image.classList.contains('is-banana-floating'))return;
    cancelAnimationFrame(pointerFrame);
    const x=event.clientX,y=event.clientY;
    pointerFrame=requestAnimationFrame(()=>{
      const box=productFrame.getBoundingClientRect();
      const dx=Math.max(-1,Math.min(1,(x-box.left)/box.width*2-1));
      const dy=Math.max(-1,Math.min(1,(y-box.top)/box.height*2-1));
      image.style.setProperty('--product-x',dx*7+'px');
      image.style.setProperty('--product-y',dy*4+'px');
      image.style.setProperty('--product-tilt',dx*4+'deg');
    });
  },{passive:true});
  productFrame.addEventListener('pointerleave',resetProductTilt);
  productFrame.addEventListener('pointercancel',resetProductTilt);
  const splash=document.createElement('div');
  splash.className='history-milk-splash';
  splash.setAttribute('aria-hidden','true');
  image.parentElement.append(splash);
  const productLayer=document.createElement('div');
  productLayer.className='vivacity-product-layer';
  productLayer.hidden=true;
  const productPosition=document.createElement('div');
  const productImage=new Image();
  productImage.src='assets/vivacity-product.png';
  productImage.alt='비바시티 눈건강 젤리 제품';
  productPosition.append(productImage);
  productLayer.append(productPosition);
  image.parentElement.append(productLayer);
  // Decorative droplets are separate from the product bitmap, so the packaging stays still.
  const drops=Array.from({length:14},(_,index)=>{
    const drop=document.createElement('i');
    const angle=(index*360/14-100)*Math.PI/180;
    drop.style.setProperty('--drop-delay',(index%4*.16)+'s');
    drop.style.setProperty('--drop-size',(5+index%4*2)+'px');
    splash.append(drop);
    return {drop,angle};
  });
  function sizeSplash(){
    const frame=image.parentElement;
    const ratio=1420/1108;
    const layerWidth=Math.min(frame.clientWidth,frame.clientHeight*ratio);
    productLayer.style.width=layerWidth+'px';
    productLayer.style.height=(layerWidth/ratio)+'px';
    const radius=Math.min(image.parentElement.clientWidth,image.parentElement.clientHeight)*.49;
    drops.forEach(({drop,angle})=>{
      drop.style.setProperty('--drop-x',Math.cos(angle)*radius+'px');
      drop.style.setProperty('--drop-y',Math.sin(angle)*radius*.86+'px');
    });
  }
  if('ResizeObserver' in window)new ResizeObserver(sizeSplash).observe(image.parentElement);
  else addEventListener('resize',sizeSplash);
  if('ResizeObserver' in window)new ResizeObserver(entries=>{
    historyPanel.style.setProperty('--history-panel-height',entries[0].contentRect.height+'px');
  }).observe(historyPanel);
  sizeSplash();
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
    const stopped=reduce.matches||document.documentElement.classList.contains('site-motion-paused');
    updateJourney(stopped);
    // On phones the timeline scrolls below a compact pinned image panel.
    const trigger=matchMedia('(max-width: 760px)').matches
      ?historyPanel.getBoundingClientRect().bottom+40:innerHeight*.5;
    const active=eras.filter(era=>era.getBoundingClientRect().top<=trigger).at(-1)||eras[0];
    showEra(eras.indexOf(active),stopped);
    // Use the stationary frame, not the animated image, for visibility checks.
    const imageBounds=image.parentElement.getBoundingClientRect();
    const melonaVisible=selected===1&&!stopped&&imageBounds.bottom>0&&imageBounds.top<innerHeight;
    splash.classList.toggle('is-playing',melonaVisible);
    image.classList.toggle('is-melona-rising',melonaVisible);
    const bananaVisible=selected===0&&!stopped&&imageBounds.bottom>0&&imageBounds.top<innerHeight;
    image.classList.toggle('is-banana-floating',bananaVisible);
    if(!bananaVisible)resetProductTilt();
    productLayer.hidden=selected!==2;
    productLayer.classList.toggle('is-floating',selected===2&&!stopped&&imageBounds.bottom>0&&imageBounds.top<innerHeight);
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
