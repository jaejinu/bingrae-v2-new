import * as THREE from './vendor/three.module.js';

async function sheet(path){
 const texture=await new THREE.TextureLoader().loadAsync(path);return texture;
}
function crop(image,x,y,w,h){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 canvas.getContext('2d').drawImage(image,x,y,w,h,0,0,w,h);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;return map;
}
function material(map){return new THREE.MeshStandardMaterial({map,roughness:.86,metalness:0});}

export async function createBravoFromSheet(){
 const source=await sheet('/enhancements/products/bravo-four-views.png');
 const image=source.image,group=new THREE.Group();
 // Inverse-project each quarter of the cone into its supplied camera view.
 const views=[{cx:398,top:29,bottom:499,radius:91},{cx:1139,top:29,bottom:499,radius:91},{cx:399,top:539,bottom:1005,radius:91},{cx:1139,top:29,bottom:499,radius:91}];
 views.forEach((view,face)=>{
  const map=crop(image,view.cx-view.radius,view.top,view.radius*2,view.bottom-view.top);
  const positions=[],uv=[],indices=[],nx=48,ny=48;
  for(let y=0;y<=ny;y++){
   const t=y/ny,r=.014+.576*t;
   for(let x=0;x<=nx;x++){
    const local=(x/nx-.5)*Math.PI/2,angle=face*Math.PI/2+local;
    positions.push(Math.sin(angle)*r,-1.5+t*3,Math.cos(angle)*r);
    // Photo is a perspective view of the taper, not a flat label: preserve its taper in UVs.
    const photoRadius=.015+.985*t;
    const sx=face===3?-Math.sin(local):Math.sin(local);
    uv.push(.5+sx*photoRadius*.5,t);
   }
  }
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=y*(nx+1)+x,b=a+nx+1;indices.push(a,a+1,b,a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  group.add(new THREE.Mesh(geo,material(map)));
 });
 const topMap=crop(image,1000,608,275,272);
 const lid=new THREE.Mesh(new THREE.CircleGeometry(.59,96),material(topMap));lid.rotation.x=-Math.PI/2;lid.position.y=1.5;group.add(lid);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.59,.012,8,96),new THREE.MeshStandardMaterial({color:0xfaf7f1,roughness:.8}));rim.rotation.x=Math.PI/2;rim.position.y=1.5;group.add(rim);
 group.userData.source='bravo-four-views.png';source.dispose();return group;
}

export async function createSamancoFromSheet(){
 const source=await sheet('/enhancements/products/samanco-four-views.png'),image=source.image;
 const front=crop(image,58,34,684,459),back=crop(image,60,537,680,452);
 const canvas=front.image,ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 const W=canvas.width,H=canvas.height,cx=W*.5,cy=H*.51,N=192,R=28;
 function foreground(x,y){const k=(Math.floor(y)*W+Math.floor(x))*4;return x>=0&&y>=0&&x<W&&y<H&&pixels[k]-pixels[k+2]>28&&pixels[k+1]-pixels[k+2]>12;}
 const outline=[];
 for(let i=0;i<=N;i++){
  const a=i/N*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);let last=0;
  for(let r=1;r<Math.max(W,H);r++){const x=cx+dx*r,y=cy+dy*r;if(x<1||x>=W-1||y<1||y>=H-1)break;if(foreground(x,y))last=r;}
  outline.push([cx+dx*Math.max(0,last-1),cy+dy*Math.max(0,last-1)]);
 }
 const group=new THREE.Group(),sx=3/W,sy=2.01/H;
 // Two curved wafer shells, with a real side wall: never a rotating flat photo.
 for(const sign of [1,-1]){
  const positions=[],uv=[],indices=[];
  for(let ring=0;ring<=R;ring++){
   const t=ring/R;
   for(let i=0;i<=N;i++){
    const x=cx+(outline[i][0]-cx)*t,y=cy+(outline[i][1]-cy)*t;
    const dome=.07+.22*Math.pow(Math.max(0,1-t*t),.65);
    positions.push((x-W/2)*sx,(H/2-y)*sy,sign*dome);
    uv.push(sign===1?x/W:1-x/W,1-y/H);
   }
  }
  for(let r=0;r<R;r++)for(let i=0;i<N;i++){const a=r*(N+1)+i,b=a+N+1;if(sign===1)indices.push(a,a+1,b,a+1,b+1,b);else indices.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,material(sign===1?front:back)));
 }
 const sideMap=crop(image,1081,72,143,407),topMap=crop(image,831,692,667,131);
 const positions=[],uv=[],indices=[];
 for(let i=0;i<=N;i++){
  const [x,y]=outline[i];for(const sign of [1,-1]){positions.push((x-W/2)*sx,(H/2-y)*sy,sign*.07);uv.push(sign===1?0:1,1-y/H);}
 }
 for(let i=0;i<N;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 // Side sheet supplies the wafer edge; top sheet supplies the longitudinal seam.
 const edge=material(sideMap);edge.side=THREE.DoubleSide;group.add(new THREE.Mesh(geo,edge));
 const seam=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline.slice(0,N).map(([x,y])=>new THREE.Vector3((x-W/2)*sx,(H/2-y)*sy,0)),true),N,.008,5,true),material(topMap));group.add(seam);
 group.userData.source='samanco-four-views.png';source.dispose();return group;
}

export async function createBananaFromSheet(){
 const source=await sheet('/enhancements/products/banana-four-views.png'),image=source.image,group=new THREE.Group();
 // Profile measured from the supplied bottle: base, waist flange, tapered shoulder and neck.
 const profile=[[0,.76],[.025,.87],[.06,.9],[.43,1.065],[.45,1.08],[.46,1.12],[.51,1.12],[.525,1.08],[.55,1.075],[.87,.65],[.91,.605],[.95,.605],[1,.605]];
 function radius(t){for(let i=1;i<profile.length;i++){if(t<=profile[i][0]){const [a,r]=profile[i-1],[b,s]=profile[i];return r+(s-r)*(t-a)/(b-a);}}return .605;}
 // One continuous UV surface prevents hard seams between separately shaded quarters.
 const sourceCanvas=document.createElement('canvas');sourceCanvas.width=image.width;sourceCanvas.height=image.height;
 const context=sourceCanvas.getContext('2d');context.drawImage(image,0,0);
 const pixels=context.getImageData(0,0,image.width,image.height).data;
 const width=1536,height=1024,atlas=document.createElement('canvas');atlas.width=width;atlas.height=height;
 const ac=atlas.getContext('2d'),out=ac.createImageData(width,height);
 function sample(x,y){const k=(Math.max(0,Math.min(image.height-1,Math.round(y)))*image.width+Math.max(0,Math.min(image.width-1,Math.round(x))))*4;return [pixels[k],pixels[k+1],pixels[k+2]];}
 for(let y=0;y<height;y++){
  const t=1-y/(height-1),r=radius(t),sy=30+(1-t)*464;
  const neutral=sample(1123,sy);
  for(let x=0;x<width;x++){
   const angle=(x/(width-1)*2-1)*Math.PI;
   const front=Math.abs(angle)<Math.PI/2;
   const cx=front?414:414,local=front?angle:angle-Math.sign(angle)*Math.PI;
   const row=front?sy:535+(1-t)*464;
   const rgb=sample(cx+Math.sin(local)*177*r/1.12,row);
   // Retain the supplied printed ink; remove the photographs' baked side shadows.
   // The uniform bottle material is shaded once by the actual 3D lights.
   const green=Math.max(0,Math.min(1,(rgb[1]-rgb[0]-8)/24));
   const red=Math.max(0,Math.min(1,(rgb[0]-rgb[1]-60)/45));
   const ink=t>.58&&t<.87?Math.max(green,red):0;
   const cap=t>.949;
   const capColor=sample(414+Math.sin(angle)*80,42);
   const dst=(y*width+x)*4;
   for(let c=0;c<3;c++)out.data[dst+c]=cap?capColor[c]:neutral[c]*(1-ink)+rgb[c]*ink;
   out.data[dst+3]=255;
  }
 }
 ac.putImageData(out,0,0);
 const map=new THREE.CanvasTexture(atlas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;map.wrapS=THREE.RepeatWrapping;
 const positions=[],uv=[],normals=[],indices=[],nx=192,ny=192;
 for(let y=0;y<=ny;y++){
  const t=y/ny,r=radius(t),lo=Math.max(0,t-.001),hi=Math.min(1,t+.001),slope=(radius(hi)-radius(lo))/((hi-lo)*3);
  for(let x=0;x<=nx;x++){
   const angle=(x/nx*2-1)*Math.PI;
   positions.push(Math.sin(angle)*r,-1.5+t*3,Math.cos(angle)*r);uv.push(x/nx,t);
   const normal=new THREE.Vector3(Math.sin(angle),-slope,Math.cos(angle)).normalize();normals.push(normal.x,normal.y,normal.z);
  }
 }
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=y*(nx+1)+x,b=a+nx+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setIndex(indices);group.add(new THREE.Mesh(geo,material(map)));
 const lid=new THREE.Mesh(new THREE.CircleGeometry(.605,96),material(crop(image,1007,640,233,234)));lid.rotation.x=-Math.PI/2;lid.position.y=1.501;group.add(lid);
 const base=new THREE.Mesh(new THREE.CircleGeometry(.76,96),new THREE.MeshStandardMaterial({color:0xffe69a,roughness:.8}));base.rotation.x=Math.PI/2;base.position.y=-1.501;group.add(base);
 group.userData.source='banana-four-views.png';source.dispose();return group;
}
