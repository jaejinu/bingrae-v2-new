(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.documentElement;
  const counter=document.querySelector('#archive-counter');
  const range=document.querySelector('.archive-range');
  const statement=document.querySelector('.archive-statement');
  const lines=[...statement.querySelectorAll('h2 span')];
  const journey=document.querySelector('.brand-journey');
  const firstYear=1967,lastYear=2026,countDuration=4200,holdAfterCount=550,readDuration=2400;
  const clamp=value=>Math.max(0,Math.min(1,value));
  const stopped=()=>reduce.matches||root.classList.contains('site-motion-paused');
  statement.classList.add('is-enhanced');

  // The intro runs on its own clock either way; set this to true to also hold the page still until it ends.
  const holdScrollDuringIntro=false;
  const skip=document.querySelector('.intro-skip');
  const scrollKeys=new Set([' ','PageDown','PageUp','ArrowDown','ArrowUp','Home','End']);
  let locked=false;
  const blockScroll=event=>{if(locked)event.preventDefault()};
  const blockKeys=event=>{if(locked&&scrollKeys.has(event.key)&&!event.target.closest?.('input,textarea,select,[contenteditable]'))event.preventDefault()};
  const holdTop=()=>{if(locked&&scrollY!==0)scrollTo(0,0)};
  function lockScroll(){
    if(locked)return;
    locked=true;
    addEventListener('wheel',blockScroll,{passive:false});
    addEventListener('touchmove',blockScroll,{passive:false});
    addEventListener('keydown',blockKeys);
    addEventListener('scroll',holdTop,{passive:true});
  }
  function unlockScroll(){
    if(!locked)return;
    locked=false;
    removeEventListener('wheel',blockScroll);
    removeEventListener('touchmove',blockScroll);
    removeEventListener('keydown',blockKeys);
    removeEventListener('scroll',holdTop);
  }

  // Section 1 counts up to 2026, then section 2 takes over on its own.
  let phase='count',countFrame=0,readFrame=0,timer=0,start=null;
  function setRead(progress){
    lines.forEach((line,index)=>line.style.setProperty('--read',clamp(progress*lines.length-index)*100+'%'));
  }
  function finishCount(){
    cancelAnimationFrame(countFrame);
    counter.textContent=String(lastYear);
    range.style.removeProperty('--count-progress');
  }
  function count(now){
    if(start===null)start=now;
    const progress=Math.min(1,(now-start)/countDuration);
    // Quadratic ease-in: long early holds, progressively faster year changes.
    counter.textContent=String(firstYear+Math.floor((lastYear-firstYear)*progress*progress));
    range.style.setProperty('--count-progress',(progress*progress).toFixed(3));
    if(progress<1)countFrame=requestAnimationFrame(count);
    else timer=setTimeout(showStatement,holdAfterCount);
  }
  function showStatement(){
    if(phase!=='count')return;
    phase='statement';
    clearTimeout(timer);
    finishCount();
    journey.classList.add('is-statement');
    const startedAt=performance.now()+700;
    (function read(now){
      const progress=clamp((now-startedAt)/readDuration);
      setRead(progress);
      if(progress<1)readFrame=requestAnimationFrame(read);
      else{phase='done';statement.classList.add('is-read');skip.hidden=true;unlockScroll()}
    })(performance.now());
  }
  function settle(){
    // Motion off: both sections are simply shown, fully read.
    clearTimeout(timer);
    cancelAnimationFrame(readFrame);
    finishCount();
    phase='done';
    setRead(1);
    statement.classList.add('is-read');
    journey.classList.add('is-statement');
    skip.hidden=true;
    unlockScroll();
  }
  function sync(){
    journey.classList.toggle('is-pinned',!stopped());
    if(stopped())settle();
  }

  if(stopped())settle();
  else{
    counter.textContent=String(firstYear);
    range.style.setProperty('--count-progress','0');
    setRead(0);
    countFrame=requestAnimationFrame(count);
    // Only hold the page on a fresh visit at the top (not a reload, which may restore a scroll position, or a #link).
    const reload=performance.getEntriesByType?.('navigation')[0]?.type==='reload';
    if(holdScrollDuringIntro&&scrollY<10&&!location.hash&&!reload)lockScroll();
  }
  skip.addEventListener('click',settle);
  reduce.addEventListener('change',sync);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
  sync();
})();
