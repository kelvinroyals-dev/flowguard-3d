import * as THREE from 'three';

// Illustrative low-point overtopping, aligned with the estate's road geometry.
export const overflowAmount = water => THREE.MathUtils.clamp((water-60)/36,0,1);
export const channelHeight = water => .12 + Math.min(water,60)/60*.56 + overflowAmount(water)*.16;

export function createFloodSurfaces(sections,parent){
 const entries=[];
 for(const section of sections){
  const horizontal=section.id.startsWith('D-');
  // The northern boundary has no road. OUT discharges into the canal.
  if(section.id==='OUT'||section.id.startsWith('D-0'))continue;
  const side=horizontal?-1:section.id.startsWith('P-')?-1:1;
  const length=Math.hypot(section.to.x-section.from.x,section.to.z-section.from.z);
  const material=new THREE.MeshStandardMaterial({color:'#429bad',emissive:'#143943',emissiveIntensity:.22,roughness:.2,metalness:.18,transparent:true,opacity:.76,side:THREE.DoubleSide,depthWrite:false});
  const geometry=new THREE.PlaneGeometry(1,1,24,1);
  const water=new THREE.Mesh(geometry,material);water.frustumCulled=false;water.visible=false;water.renderOrder=2;water.userData.section=section.id;parent.add(water);
  const spill=new THREE.Mesh(new THREE.PlaneGeometry(1,1,24,1),material.clone());spill.frustumCulled=false;spill.visible=false;spill.renderOrder=3;parent.add(spill);
  const ripples=new THREE.Group();water.add(ripples);
  for(let i=0;i<4;i++){
   const line=new THREE.Mesh(new THREE.PlaneGeometry(1,.025),new THREE.MeshBasicMaterial({color:'#b3e6eb',transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}));
   line.rotation.x=-Math.PI/2;line.visible=false;ripples.add(line);
  }
  entries.push({section,horizontal,side,length,water,spill,ripples,level:0});
 }
 return entries;
}
export function updateFloodSurfaces(entries,snapshot,dt,time){
 for(const e of entries){
  const target=overflowAmount(snapshot.sections[e.section.id].water);
  e.level=THREE.MathUtils.damp(e.level,target,target>e.level?2:0.65,dt);
  const p=e.level,visible=p>.004;e.water.visible=e.spill.visible=visible;if(!visible)continue;
  const edge=e.section.width/2+.3,reach=e.horizontal?6.6:6.5;
  const width=(reach-edge)*Math.sqrt(p),span=e.length*(.4+.6*Math.sqrt(p));
  const depth=.37+p*.27,cx=(e.section.from.x+e.section.to.x)/2,cz=(e.section.from.z+e.section.to.z)/2;
  const bank=.685+p*.14;
  for(const [surface,isSpill]of [[e.water,false],[e.spill,true]]){
   const positions=surface.geometry.attributes.position;
   for(let i=0;i<positions.count;i++){
    const u=(i%25)/24,t=i<25?0:1;
    const along=(u-.5)*span;
    const wave=Math.sin(u*19+time*1.8)*.07*Math.sin(Math.PI*u);
    const across=isSpill?edge-.20+t*.30:edge+.10+t*Math.max(.01,width+wave);
    const y=isSpill?bank*(1-t)+depth*t:depth+Math.sin(u*22+time*2)*.012*p;
    positions.setXYZ(i,e.horizontal?cx+along:cx+e.side*across,y,e.horizontal?cz+e.side*across:cz+along);
   }
   positions.needsUpdate=true;surface.geometry.computeVertexNormals();
   surface.material.opacity=isSpill?.62:.65+p*.19;
  }
  e.ripples.children.forEach((line,i)=>{
   line.visible=width>.2;const t=((time*.11+i/4)%1);
   const across=edge+.15+t*width;
   line.position.set(e.horizontal?cx:cx+e.side*across,depth+.025,e.horizontal?cz+e.side*across:cz);
   line.rotation.z=e.horizontal?0:Math.PI/2;
   line.scale.set(span*(.55+.2*Math.sin(i)),1,1);
   line.material.opacity=.25*Math.sin(t*Math.PI);
  });
 }
}
