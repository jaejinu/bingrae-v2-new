import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createBravoFromSheet, createSamancoFromSheet, createBananaFromSheet } from './sheet-products.mjs';
import { createYoplaitVolume } from './yoplait-volume.mjs';

export function createIconProducts(root) {
  let progress=0, disposed=false;
  const entries=[];
  const arts=[...root.querySelectorAll('.icon-panel__art')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function render(entry) {
    const w=entry.art.clientWidth,h=entry.art.clientHeight;
    if(!w||!h)return;
    entry.renderer.setSize(w,h,false);
    entry.camera.aspect=w/h;entry.camera.updateProjectionMatrix();
    const turn=reduced?0:Math.max(0,Math.min(1,progress*arts.length-entry.index));
    entry.pivot.rotation.y=reduced?0:(turn-entry.index/Math.max(1,arts.length-1))*Math.PI*2;
    entry.art.dataset.rotation=String(Math.round(turn*360));
    entry.renderer.render(entry.scene,entry.camera);
  }
  const observer=new ResizeObserver(()=>entries.forEach(render));
  arts.forEach(async(art,index)=>{
    let renderer;
    try {
      const key=art.dataset.stage;
      const model=key==='yoplait'?await createYoplaitVolume():key==='bravo'?await createBravoFromSheet():key==='samanco'?await createSamancoFromSheet():key==='bananaMilk'?await createBananaFromSheet():(await new GLTFLoader().loadAsync('/models/teum/'+(key==='bananaMilk'?'banana-milk':key)+'.glb')).scene;
      if(disposed)return;
      const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const holder=new THREE.Group();holder.add(model);holder.scale.setScalar(2.5/Math.max(size.x,size.y,size.z));
      const pivot=new THREE.Group();pivot.add(holder);
      const scene=new THREE.Scene();scene.add(pivot,new THREE.HemisphereLight(0xffffff,0xb4a59d,2.4));
      const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(-3,5,6);scene.add(light);
      const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.6,6.2);camera.lookAt(0,0,0);
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.domElement.className='icon-product-canvas';renderer.domElement.setAttribute('aria-hidden','true');
      art.append(renderer.domElement);
      const entry={art,index,scene,pivot,camera,renderer};entries.push(entry);render(entry);
      art.classList.add('icon-product-ready');observer.observe(art);
    }catch(error){renderer?.dispose();console.error('Icon model failed',error);}
  });
  return {
    update(value){progress=value;entries.forEach(render);},
    destroy(){disposed=true;observer.disconnect();entries.forEach(e=>{e.scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [o.material].flat()){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();}}});e.renderer.dispose();e.renderer.domElement.remove();e.art.classList.remove('icon-product-ready');});}
  };
}
