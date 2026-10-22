(() => {
  const report='https://www.bing.co.kr/upload/esg/2025%EB%85%84%20%EB%B9%99%EA%B7%B8%EB%A0%88%20%EC%A7%80%EC%86%8D%EA%B0%80%EB%8A%A5%EA%B2%BD%EC%98%81%EB%B3%B4%EA%B3%A0%EC%84%9C.pdf';
  const business='https://www.bing.co.kr/company/business';
  // Visual dates are distinct from event dates; these are contextual reference materials.
  const records = {
    1967:['assets/history/founding-1967.svg','1967년 주식회사 대일양행 설립을 표현한 그래픽','공식 연혁 기준 · 빙그레할 틈 제작 그래픽','https://www.bing.co.kr/company/history'],
    1973:['assets/history/factory-2013.jpg','빙그레 남양주 공장 외관 · 2013년 보도 사진','2013 공장 자료 사진 · 일요시사','https://www.ilyosisa.co.kr/news/article.html?no=32250'],
    1982:['assets/history/identity.svg','빙그레 현재 로고 · 사명 변경 관련 참고 이미지','현재 로고 · 당시 로고가 아닌 참고 자료','https://commons.wikimedia.org/wiki/File:Binggrae_logo_(Korean).svg'],
    1987:['assets/history/research.png','2022~2024 연구개발비 · 연구 활동 참고 자료','2025 공식 보고서 · 최근 연구개발 자료',report+'#page=75'],
    1998:['assets/history/haccp.png','2025 보고서 수록 HACCP 인증서 · 최초 인증서가 아닌 참고 자료','2025 공식 보고서 · 품질 인증 참고 자료',report+'#page=76'],
    2002:['assets/history/vision.jpg','빙그레 경영 가치 체계 · 현재 비전 참고 자료','2025 공식 보고서 · 현재 경영 가치',report+'#page=6'],
    2014:['assets/history/global.jpg','해외 수출 현황 지도 · 상하이 진출 관련 참고 자료','2025 공식 보고서 · 해외사업 참고 자료',report+'#page=8'],
    2016:['assets/history/font.png','빙그레체 공식 서체 예시','빙그레 공식 미디어 라이브러리','https://www.bing.co.kr/news/media_font'],
    2019:['assets/product_img06.png','건강지향 브랜드 비바시티 제품 · 현재 참고 이미지','현재 건강지향 제품 · 공식 사업분야',business],
    2020:['../bravo/assets/bravo.png','해태아이스크림의 부라보콘 · 현재 제품 참고 이미지','현재 부라보콘 · 인수 관련 제품 참고 자료',business],
    2021:['assets/history/protein.png','더단백 제품 · 2025년 보고서 수록 패키지','2025 공식 보고서 · 더단백 제품',report+'#page=17'],
    2025:['assets/product_img07_new.png','메로나 수출용 제품 · 호주 법인 설립 관련 참고 이미지','현재 수출제품 · 공식 사업분야',business],
    2026:['assets/history/portfolio.jpg','빙그레 공식 사업분야의 2026 제품 포트폴리오','2026 공식 사업분야 · 제품 포트폴리오',business],
  };
  const panel=document.querySelector('.history-sticky');
  const frame=panel.querySelector('figure');
  const image=document.querySelector('#archive-history-art');
  const year=document.querySelector('#history-year');
  const caption=document.querySelector('#history-caption');
  const entries=[...document.querySelectorAll('.history-era article')];
  const source=document.createElement('a');
  source.className='history-visual-source';source.target='_blank';source.rel='noopener';
  panel.append(source);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let selected=-1,queued=false,request=0,animations=[];
  const cache=new Map();
  function load(src){
    if(!cache.has(src))cache.set(src,new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>resolve({width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>resolve(null);img.src=src;
    }));
    return cache.get(src);
  }
  async function show(index){
    if(index===selected)return;
    selected=index;
    const token=++request,entry=entries[index];
    const value=entry.querySelector('time').textContent.trim(),record=records[value];
    const dimensions=await load(record[0]);
    if(!dimensions||token!==request)return;
    animations.forEach(a=>a.cancel());animations=[];
    frame.querySelectorAll('.history-image-outgoing').forEach(node=>node.remove());
    const previous=image.cloneNode();
    const stopped=reduce.matches||document.documentElement.classList.contains('site-motion-paused');
    year.textContent=value;caption.textContent=entry.querySelector('h4').textContent;
    image.src=record[0];image.alt=record[1];
    // Keep raster detail at two source pixels per CSS pixel; SVG scales freely.
    const vector=record[0].endsWith('.svg');
    image.style.setProperty('--asset-width',vector?'100%':dimensions.width/2+'px');
    image.style.setProperty('--asset-height',vector?'100%':dimensions.height/2+'px');
    source.textContent=record[2]+' ↗';source.href=record[3];
    panel.dataset.activeYear=value;
    entries.forEach((node,i)=>{
      node.classList.toggle('is-current-year',i===index);
      if(i===index)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');
    });
    if(!stopped&&previous.getAttribute('src')!==record[0]){
      previous.removeAttribute('id');previous.alt='';previous.setAttribute('aria-hidden','true');
      previous.className='history-image-outgoing';frame.append(previous);
      const fade=previous.animate([{opacity:1},{opacity:0}],{duration:360,easing:'ease-out',fill:'forwards'});
      fade.onfinish=()=>previous.remove();animations.push(fade);
    }
    const next=entries[index+1];
    if(next)load(records[next.querySelector('time').textContent.trim()][0]);
  }
  function update(){
    queued=false;
    const trigger=matchMedia('(max-width:760px)').matches?panel.getBoundingClientRect().bottom+45:innerHeight*.55;
    const active=entries.filter(entry=>entry.getBoundingClientRect().top<=trigger).at(-1)||entries[0];
    show(entries.indexOf(active));
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});
  addEventListener('resize',update);
  new ResizeObserver(list=>panel.style.setProperty('--history-panel-height',list[0].contentRect.height+'px')).observe(panel);
  function stop(){
    if(reduce.matches||document.documentElement.classList.contains('site-motion-paused')){
      animations.forEach(a=>a.cancel());
      frame.querySelectorAll('.history-image-outgoing').forEach(node=>node.remove());
    }
  }
  reduce.addEventListener('change',stop);
  new MutationObserver(stop).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  update();
})();
