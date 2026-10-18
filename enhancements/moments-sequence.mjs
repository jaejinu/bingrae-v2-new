import * as THREE from './vendor/three.module.js';
import { createYoplaitVolume } from './yoplait-volume.mjs';




import { createWordShatter } from './hero-shatter.mjs';

export function createMomentsSequence(root, { gsap, reducedMotion }) {
  const stage = document.createElement('div');
  stage.className = 'moments-cinema';
  const still = new Image();
  still.src = '/enhancements/products/yoplait.png';
  still.alt = '요플레';
  still.className = 'moments-cinema__still';
  stage.append(still);
  const sparkles = document.createElement('div');
  sparkles.className = 'moments-cinema__sparkles';
  sparkles.setAttribute('aria-hidden', 'true');
  const starTemplate = document.querySelector('.hero__spark');
  if (starTemplate) {
    for (let index = 0; index < 4; index++) {
      const star = starTemplate.cloneNode(true);
      star.removeAttribute('style');
      star.removeAttribute('id');
      star.setAttribute('class', 'moments-cinema__star');
      star.style.setProperty('--spark-delay', `${index * -.43}s`);
      sparkles.append(star);
    }
  }
  stage.append(sparkles);
  const copyStars=document.createElement('div');
  copyStars.className='moments-copy-stars';copyStars.setAttribute('aria-hidden','true');
  if(starTemplate) for(let i=0;i<4;i++){
    const star=starTemplate.cloneNode(true);star.removeAttribute('id');star.removeAttribute('style');
    star.setAttribute('class','moments-copy-star');star.style.setProperty('--delay',`${i*-.55}s`);copyStars.append(star);
  }
  root.append(copyStars);
  root.append(stage);
  root.classList.add('moments--cinema');
  const heading = root.querySelector(':scope > .section-head h2');
  const originalHeading = heading.innerHTML;
  heading.setAttribute('aria-label', '하루의 순간! 제품으로 발견하기');
  heading.replaceChildren();
  const letters = [];
  for (const label of ['하루의 순간!', '제품으로 발견하기']) {
    const line = document.createElement('span');
    line.className = 'moments-copy-line';
    line.setAttribute('aria-hidden', 'true');
    for (const character of label) {
      const letter = document.createElement('span');
      letter.className = 'moments-copy-letter';
      letter.textContent = character === ' ' ? '\u00a0' : character;
      line.append(letter);
      letters.push(letter);
    }
    heading.append(line);
  }
  const text = [root.querySelector(':scope > .section-head')];
  const copyShatter = createWordShatter(root, letters.filter(letter => letter.textContent !== '\u00a0'), { gsap });
  const shatter = createWordShatter(root, [still], { gsap, columns: 8, rows: 8 });
  let renderer, model, camera, world, trigger, reveal, destroyed = false, exploded = false;
  let turn = 0, copyScattered = false;
  function finishCopy() {
    if (copyScattered || !exploded || !reveal || reveal.time()<7.5 || (trigger?.scrollTrigger?.progress ?? 0)<.9) return;
    copyScattered=true;root.dataset.momentsPhase='text-scatter';copyShatter.burst();
  }
  function render() { if(!renderer || !model)return;model.rotation.y=turn*Math.PI*2;renderer.render(world,camera);stage.dataset.rotation=(turn*360).toFixed(1); }
  function resize() {
    if (!renderer) return;
    const {width, height} = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }
  function reset() {
    reveal?.kill();
    shatter.clear();
    copyShatter.clear();
    gsap.set(heading, {autoAlpha:1, y:0});
    gsap.set(letters, {autoAlpha:1, yPercent:0, scaleX:1, scaleY:1, rotation:0});
    exploded = false;
    copyScattered = false;
    stage.style.visibility = 'visible';
    sparkles.style.visibility = 'visible';
    gsap.set(still, { autoAlpha: renderer && model ? 0 : 1 });
    gsap.set(text, { autoAlpha: 0, y: 35 });
    root.dataset.momentsPhase = 'rotate';
  }
  function burst() {
    if (exploded) return;
    exploded = true;
    turn = 1;
    render();
    if (renderer && model) still.src = renderer.domElement.toDataURL('image/png');
    gsap.set(still, { autoAlpha: 1 });
    root.dataset.momentsPhase = 'scatter';
    sparkles.style.visibility = 'hidden';
    shatter.burst();
    stage.style.visibility = 'hidden';
    reveal = gsap.timeline().to(text, { autoAlpha: 1, y: 0, duration: .45, ease: 'power2.out', onStart: () => {root.dataset.momentsPhase = 'text';} }, .85);
    letters.forEach((letter,index) => {
      const at = 1 + index * .035;
      reveal.to(letter,{scaleX:1.12,scaleY:.82,duration:.08},at)
        .to(letter,{yPercent:-30,scaleX:.96,scaleY:1.05,rotation:index%2?3:-3,duration:.2,ease:'power2.out'},at+.08)
        .to(letter,{yPercent:0,scaleX:1,scaleY:1,rotation:0,duration:.3,ease:'bounce.out'},at+.28);
    });
    reveal.call(finishCopy,[],7.5);
  }
  reset();
  if (reducedMotion()) {
    gsap.set(text, { autoAlpha: 1, y: 0 });
    stage.style.display = 'none';
  } else {
    const timeline = gsap.timeline({scrollTrigger: {
      trigger: root, start: 'top top', end: () => `+=${innerHeight * 3.5}`, pin: true, scrub: .35,
      onUpdate: self => {
        const p = self.progress;
        turn = Math.min(1, p / .301);
        render();
        if (p >= .316) burst();
        else if (p < .243 && exploded) reset();
        if(copyScattered && p<.88 && p>=.316){
          copyShatter.clear();gsap.set(letters,{autoAlpha:1,yPercent:0,scaleX:1,scaleY:1,rotation:0});
          copyScattered=false;root.dataset.momentsPhase='text';
        }
        finishCopy();
      },
    }}).to({}, {duration: 1});
    trigger = timeline;
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
      stage.prepend(renderer.domElement);world=new THREE.Scene();
      camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(0,1.25,4.9);camera.lookAt(0,0,0);
      world.add(new THREE.HemisphereLight(0xffffff,0xe0d9d7,2));
      const light=new THREE.DirectionalLight(0xffffff,1.5);light.position.set(-3,5,5);world.add(light);
      resize();
      createYoplaitVolume().then(volume=>{if(destroyed)return;model=volume;world.add(model);if(!exploded)gsap.set(still,{autoAlpha:0});render();}).catch(error=>console.error('요플레 모델 생성 실패',error));
    } catch(error){console.error('요플레 렌더러 초기화 실패',error);}
  }
  window.addEventListener('resize', resize);
  return { destroy() {
    destroyed = true; reveal?.kill(); shatter.clear(); copyShatter.clear(); trigger?.scrollTrigger?.kill(); trigger?.kill();
    window.removeEventListener('resize', resize); renderer?.dispose();
    world?.traverse(o => {o.geometry?.dispose(); if(o.material) for(const m of [].concat(o.material)) {m.map?.dispose();m.dispose();}});
    copyStars.remove();stage.remove(); root.classList.remove('moments--cinema'); gsap.set(text,{clearProps:'opacity,visibility,transform'});
    heading.innerHTML = originalHeading; heading.removeAttribute('aria-label');
  }};
}



