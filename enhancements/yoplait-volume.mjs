import * as THREE from './vendor/three.module.js';

// Each face has its own UV island: no repeated front label around the cup.
export async function createYoplaitVolume() {
  const source = await new THREE.TextureLoader().loadAsync('/enhancements/products/yoplait-four-views.png');
  const image = source.image;
  const sx = image.width / 1536, sy = image.height / 1024;
  function faceTexture(view) {
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 768;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#faf9f6';ctx.fillRect(0,0,768,768);
    for(let row=0;row<768;row++) {
      const p=row/767;
      const left=view.left+(view.bottomLeft-view.left)*p;
      const right=view.right+(view.bottomRight-view.right)*p;
      ctx.drawImage(image,left*sx,(view.top+(view.bottom-view.top)*p)*sy,(right-left)*sx,Math.max(1,(view.bottom-view.top)/768*sy),0,row,768,1);
    }
    // Rectify the curved label hem in the photograph to the mesh's straight seam.
    // White plastic below the strawberry print belongs to the separate base mesh.
    const raw=ctx.getImageData(0,0,768,768);
    const hems=new Array(768).fill(767);
    for(let x=0;x<768;x++) {
      for(let y=767;y>=500;y--) {
        const k=(y*768+x)*4;
        const r=raw.data[k],g=raw.data[k+1],b=raw.data[k+2];
        if(Math.max(r,g,b)-Math.min(r,g,b)>38 && Math.min(r,g,b)<200){hems[x]=y;break;}
      }
    }
    const flat=ctx.createImageData(768,768);
    for(let x=0;x<768;x++) {
      const edge=hems[x];
      for(let y=0;y<768;y++) {
        const srcY=y<450?y:450+(y-450)*(edge-450)/317;
        const a=Math.floor(srcY),b=Math.min(767,a+1),t=srcY-a;
        const dst=(y*768+x)*4;
        for(let q=0;q<4;q++)flat.data[dst+q]=raw.data[(a*768+x)*4+q]*(1-t)+raw.data[(b*768+x)*4+q]*t;
      }
    }
    ctx.putImageData(flat,0,0);
    // Remove baked neutral studio shadows; the 3D lights shade the white plastic.
    const pixels=ctx.getImageData(0,0,768,768);
    for(let k=0;k<pixels.data.length;k+=4){
      const r=pixels.data[k],g=pixels.data[k+1],b=pixels.data[k+2];
      const low=Math.min(r,g,b),spread=Math.max(r,g,b)-low;
      if(low>150&&spread<20){const amount=Math.min(1,(low-150)/45)*(1-spread/20);for(let q=0;q<3;q++)pixels.data[k+q]+= (246-pixels.data[k+q])*amount;}
    }
    ctx.putImageData(pixels,0,0);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;return map;
  }
  const front=faceTexture({top:128,bottom:423,left:218,right:563,bottomLeft:242,bottomRight:541});
  const side=faceTexture({top:128,bottom:423,left:980,right:1317,bottomLeft:1001,bottomRight:1297});
  const back=faceTexture({top:610,bottom:908,left:220,right:563,bottomLeft:242,bottomRight:544});
  const group=new THREE.Group();
  const maps=[front,side,back,side];
  const segments=48,rings=24;
  const signedPower=v=>Math.sign(v)*Math.pow(Math.abs(v),.32);
  for(let face=0;face<4;face++) {
    const positions=[],uvs=[],indices=[];
    for(let j=0;j<=rings;j++) {
      const v=j/rings;
      const scale=.79+.21*v;
      for(let i=0;i<=segments;i++) {
        const u=i/segments, a=face*Math.PI/2+(u-.5)*Math.PI/2;
        positions.push(signedPower(Math.sin(a))*1.02*scale,-.78+v*1.755,signedPower(Math.cos(a))*.86*scale);
        // Face is viewed from outside, so its left edge corresponds to u=0.
        const faceU=(signedPower(Math.sin((u-.5)*Math.PI/2))/Math.pow(Math.SQRT1_2,.32)+1)/2; uvs.push(faceU,v);
        if(j<rings&&i<segments){const k=j*(segments+1)+i;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}
      }
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:maps[face],roughness:.8,side:THREE.DoubleSide})));
  }
  function roundedRect(w,h,r) {
    const s=new THREE.Shape();s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);return s;
  }
  const shape=roundedRect(1.17,.99,.23);
  const rim=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSize:.014,bevelThickness:.012,bevelSegments:3,steps:1}),new THREE.MeshStandardMaterial({color:0xfffdf7,roughness:.65}));
  rim.rotation.x=-Math.PI/2;rim.position.y=.98;group.add(rim);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;
  canvas.getContext('2d').drawImage(image,921*sx,560*sy,460*sx,372*sy,0,0,1024,1024);
  const topMap=new THREE.CanvasTexture(canvas);topMap.colorSpace=THREE.SRGBColorSpace;topMap.anisotropy=8;
  const lidGeo=new THREE.ShapeGeometry(shape,32),pos=lidGeo.attributes.position,uv=lidGeo.attributes.uv;
  for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+1.17)/2.34,(pos.getY(i)+.99)/1.98);
  const lid=new THREE.Mesh(lidGeo,new THREE.MeshStandardMaterial({map:topMap,roughness:.7}));lid.rotation.x=-Math.PI/2;lid.position.y=1.03;group.add(lid);
  const bottom=new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(.785,.66,.24),{depth:.14,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:8,steps:1}),new THREE.MeshStandardMaterial({color:0xfaf8f1,roughness:.8}));bottom.rotation.x=-Math.PI/2;bottom.position.y=-.955;group.add(bottom);
  group.userData.source='front-right-back-top sheet';
  source.dispose();return group;
}




