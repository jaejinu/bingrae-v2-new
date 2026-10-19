(() => {
  const businesses = [
    ['ICE CREAM','product_img01.png','빙그레 아이스크림 제품 모음','추억 한 입,\n즐거움 한 스푼.','투게더, 메로나, 부라보부터 끌레도르까지. 오랫동안 사랑받아 온 맛에 새로운 즐거움을 더합니다.'],
    ['MILK & MORE','product_img02_new.png','빙그레 가공유와 우유 제품 모음','매일 만나는,\n반가운 한 모금.','1974년 시작된 바나나맛우유에서 우유, 두유, 치즈까지. 서로 다른 취향을 위한 다양한 선택을 전합니다.'],
    ['YOGURT','product_img03.png','빙그레 발효유 제품 모음','부드럽게 채우는\n나의 하루.','요플레와 닥터캡슐, 프로틴과 그릭 요거트까지. 발효 기술을 바탕으로 다양한 일상의 취향을 만납니다.'],
    ['COFFEE & JUICE','product_img04.png','빙그레 커피와 음료 제품 모음','하루 사이사이,\n산뜻한 쉼표.','과일의 맛을 담은 따옴, 커피의 풍미를 전하는 아카페라. 잠깐의 휴식을 다채롭게 만드는 음료를 선보입니다.'],
    ['SNACK & DESSERT','product_img05.png','빙그레 스낵과 디저트 제품 모음','심심한 순간에,\n맛있는 즐거움.','꽃게랑을 비롯한 스낵과 디저트. 익숙한 즐거움에서 새로운 맛까지, 고르는 재미를 넓혀갑니다.'],
    ['HEALTHY EVERYDAY','product_img06.png','빙그레 건강지향식품 제품 모음','맛있게, 꾸준하게.\n건강한 일상으로.','건강지향 통합 브랜드 TFT는 맛, 기능, 신뢰를 중심으로 매일의 건강한 선택을 제안합니다.'],
    ['BEYOND BORDERS','product_img07_new.png','빙그레 수출 제품 모음','국경을 넘어,\n같은 즐거움.','메로나, 바나나맛우유, 붕어싸만코가 세계의 일상과 만납니다. 서로 다른 곳에서도 함께 즐기는 빙그레입니다.']
  ];
  const buttons = [...document.querySelectorAll('[data-business]')];
  buttons.forEach((button,index) => button.addEventListener('click', () => {
    const [word,src,alt,title,description] = businesses[index];
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    document.querySelector('#business-word').textContent=word;
    const image=document.querySelector('#business-image');image.src='assets/'+src;image.alt=alt;
    document.querySelector('#business-number').textContent=String(index+1).padStart(2,'0')+' / 07';
    const heading=document.querySelector('#business-title');heading.textContent=title;heading.style.whiteSpace='pre-line';
    document.querySelector('#business-description').textContent=description;
  }));
  const eras=[...document.querySelectorAll('.history-era')];
  const eraLinks=[...document.querySelectorAll('.history-sticky nav a')];
  let queued=false;
  function updateEra(){
    queued=false;
    const active=eras.filter(era=>era.getBoundingClientRect().top<innerHeight*.45).at(-1)||eras[0];
    document.querySelector('#history-year').textContent=active.dataset.year;
    document.querySelector('#history-caption').textContent=active.dataset.caption;
    eraLinks.forEach(link=>{if(link.hash==='#'+active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateEra)}},{passive:true});
  addEventListener('resize',updateEra);updateEra();
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.3});document.querySelectorAll('.story-scene>div').forEach(el=>observer.observe(el));}
})();
