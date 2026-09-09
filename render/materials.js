import * as THREE from 'three';
export async function applyEstateMaterials(estate,renderer){
 const loader=new THREE.TextureLoader();
 const [stone,asphalt,grass]=await Promise.all(['limestone.png','asphalt.png','lawn.png'].map(n=>loader.loadAsync('./assets/'+n)));
 for(const texture of [stone,asphalt,grass]){texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
 const mapping={'Warm limestone':{map:stone,bump:.018,color:'#e7e2d7'},'Ivory render':{map:stone,bump:.008,color:'#f4f1e9'},'Asphalt':{map:asphalt,bump:.035,color:'#c7c9ca'},'Lawn':{map:grass,bump:.055,color:'#d9e3c8'}};
 estate.traverse(o=>{if(!o.isMesh)return;const spec=mapping[o.material.name];if(spec){o.material.map=spec.map;o.material.bumpMap=spec.map;o.material.bumpScale=spec.bump;o.material.color.set(spec.color);o.material.roughness=.93;o.material.needsUpdate=true}if(o.material.name==='Blue reflective glazing'){o.material.roughness=.16;o.material.metalness=.55;o.material.color.set('#607e84');o.material.envMapIntensity=1.5}if(o.material.name==='Charcoal roof'){o.material.color.set('#434a4a');o.material.metalness=.28;o.material.roughness=.54}});
}
export function outdoorEnvironment(scene,renderer){
 const width=512,height=256,data=new Float32Array(width*height*4),sun=new THREE.Vector3(-.51,.76,.4).normalize();
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const u=x/width,v=y/height,phi=v*Math.PI,theta=u*Math.PI*2,dir=new THREE.Vector3(-Math.sin(phi)*Math.cos(theta),Math.cos(phi),Math.sin(phi)*Math.sin(theta));const horizon=Math.pow(1-Math.abs(dir.y),3);const sky=dir.y>0;const glow=Math.pow(Math.max(0,dir.dot(sun)),80)*7;const disk=Math.pow(Math.max(0,dir.dot(sun)),1800)*28;const i=(y*width+x)*4;data[i]=(sky?.50+horizon*.6:.18)+glow+disk;data[i+1]=(sky?.68+horizon*.4:.20)+glow*.76+disk*.85;data[i+2]=(sky?.88+horizon*.13:.15)+glow*.46+disk*.6;data[i+3]=1;}
 const texture=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.FloatType);texture.mapping=THREE.EquirectangularReflectionMapping;texture.needsUpdate=true;const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(texture).texture;scene.environmentIntensity=.8;texture.dispose();pmrem.dispose();
}
