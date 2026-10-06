// Geometry and telemetry are deliberately separate. Coordinates are local estate metres.
// A future API adapter can return the same readings keyed by stable asset ID.
export const nodes=[];export const sections=[];
const xs=[-62,-22,22,62], zs=[-51,-25,1,27,53];
for(let row=0;row<5;row++)for(let col=0;col<4;col++)nodes.push({id:`n${row}${col}`,x:xs[col],z:zs[row]});
const node=(r,c)=>nodes.find(n=>n.id===`n${r}${c}`);
for(let r=0;r<5;r++)for(let c=0;c<3;c++)sections.push({id:`D-${r}${c}`,name:`${['North boundary','North street','Upper street','Central street','South street'][r]} feeder ${c+1}`,from:node(r,c),to:node(r,c+1),width:r===4?1.6:1.1,group:r<3?'upstream':'downstream'});
for(let r=0;r<4;r++)sections.push({id:`M-${r}`,name:['North collector','Central collector','East collector · blockage hotspot','Outfall approach'][r],from:node(r,3),to:node(r+1,3),width:2.1,group:r<3?'upstream':'downstream'});
for(let r=0;r<4;r++)sections.push({id:`P-${r}`,name:`West perimeter ${r+1}`,from:node(r,0),to:node(r+1,0),width:1.3,group:'perimeter'});
sections.push({id:'OUT',name:'Primary estate outfall',from:node(4,3),to:{id:'out',x:83,z:53},width:2.8,group:'downstream'});
export const roads=['North Street','Upper Street','Central Street','South Street','East Avenue','West Avenue','Entrance Road','Outfall Access','North Boundary'];
sections.push({id:'E-0',name:'Entrance west drain',from:{id:'gate-west',x:-8,z:64},to:{id:'entry-west',x:-8,z:53},width:1.1,group:'downstream'},{id:'E-1',name:'Entrance east drain',from:{id:'gate-east',x:8,z:64},to:{id:'entry-east',x:8,z:53},width:1.1,group:'downstream'});
// Split the entrance feeder at its two actual inlet junctions.
const entranceFeeder=sections.find(s=>s.id==='D-41'),entranceEnd=entranceFeeder.to;
entranceFeeder.to={id:'entry-west',x:-8,z:53};
sections.push({...entranceFeeder,id:'D-41b',name:'Entrance feeder centre',from:entranceFeeder.to,to:{id:'entry-east',x:8,z:53}},{...entranceFeeder,id:'D-41c',name:'Entrance feeder east',from:{id:'entry-east',x:8,z:53},to:entranceEnd});
export const devices=[
{id:'FG-020',name:'Entrance drainage',section:'D-40',x:-49,z:53,base:28,silt:12},
{id:'FG-021',name:'Upstream drainage',section:'D-00',x:-40,z:-51,base:31,silt:14},
{id:'FG-022',name:'Major drainage junction',section:'M-0',x:62,z:-38,base:36,silt:16},
{id:'FG-023',name:'Low-lying east garden',section:'D-22',x:46,z:1,base:39,silt:21},
{id:'FG-024',name:'Central collection channel',section:'M-1',x:62,z:-10,base:42,silt:18},
{id:'FG-025',name:'Downstream section',section:'M-3',x:62,z:40,base:32,silt:13},
{id:'FG-026',name:'Primary outfall',section:'OUT',x:76,z:53,base:27,silt:10},
{id:'FG-027',name:'East collector hotspot',section:'M-2',x:62,z:17,base:35,silt:28}];
const existingRoads={'FG-020':'South Street','FG-021':'North Boundary','FG-022':'East Avenue','FG-023':'Upper Street','FG-024':'East Avenue','FG-025':'East Avenue','FG-026':'Outfall Access','FG-027':'East Avenue'};
for(const d of devices)d.road=existingRoads[d.id];
let nextId=28;
function addDevice(road,section,x,z){devices.push({id:'FG-'+String(nextId++).padStart(3,'0'),name:road+' monitoring point',road,section,x,z,base:32,silt:14});}
for(const [road,row,xs] of [['North Street',1,[-46,-4,44]],['Upper Street',2,[-46,-4]],['Central Street',3,[-46,-4,44]],['South Street',4,[-4,44]]])for(const x of xs)addDevice(road,row===4&&x===-4?'D-41b':`D-${row}${x<-22?0:x<22?1:2}`,x,[-51,-25,1,27,53][row]);
for(const [i,z] of [-38,-12,14,40].entries())addDevice('West Avenue','P-'+i,-62,z);
addDevice('Entrance Road','E-0',-8,59);addDevice('Entrance Road','E-1',8,59);
addDevice('Outfall Access','OUT',81,53);addDevice('North Boundary','D-02',40,-51);
export const colours={healthy:'#57cfac',elevated:'#edb65e',critical:'#f77572'};
export function sectionReading(section,scenario,time,recoveryStart=null){
 if(scenario==='recovery'){const start=recoveryStart||sectionReading(section,'blocked',18),end=sectionReading(section,'normal',0),p=Math.min(Math.max(time/24,0),1),q=p*p*(3-2*p);const water=Math.round(start.water+(end.water-start.water)*q);return {...end,water,silt:Math.round(start.silt+(end.silt-start.silt)*q),flow:start.flow+(end.flow-start.flow)*q,risk:water>=85?'critical':water>=60?'elevated':'healthy',observedAt:Math.floor(time/3)*3};}
 const p=Math.min(time/18,1),isBlocked=section.id==='M-2',up=connectedSections('M-2').has(section.id);
 let water=32, silt=16, flow=.8;
 if(scenario==='rain'){water+=p*(section.id.startsWith('M')?48:36);flow+=p*1.1;}
 if(scenario==='blocked'){
  if(isBlocked){water+=p*64;silt=28+p*64;flow=Math.max(.06,.8*(1-p));}
  else if(up){const spread=Math.max(0,(p-.16)/.84);water+=spread*(section.id==='M-1'||section.id==='D-22'?59:44);flow=Math.max(.15,.8-spread*.55);}
  else if(section.group==='downstream'){water-=p*13;flow-=p*.5;}
 }
 return {water:Math.round(water),silt:Math.round(silt),flow:Math.round(flow*100)/100,risk:water>=85?'critical':water>=60?'elevated':'healthy',status:'Online',observedAt:Math.floor(time/3)*3};
}
export function simulatedSnapshot(scenario,time,recoveryStart=null){
 const sectionData=Object.fromEntries(sections.map(s=>[s.id,sectionReading(s,scenario,time,recoveryStart?.sections[s.id])]));
 const deviceData=Object.fromEntries(devices.map(d=>{const r={...sectionData[d.section]};r.water=Math.max(5,Math.min(98,r.water+d.base-32));r.silt=['blocked','recovery'].includes(scenario)&&d.id==='FG-027'?r.silt:d.silt;r.risk=r.water>=85?'critical':r.water>=60?'elevated':'healthy';return[d.id,r]}));
 const p=Math.min(time/18,1),risk=Math.round(scenario==='normal'?12:scenario==='recovery'?(recoveryStart?.risk??89)-((recoveryStart?.risk??89)-12)*Math.min(time/24,1):scenario==='rain'?12+49*p:12+77*p);
 return {sections:sectionData,devices:deviceData,risk,health:Math.round(96-(risk-12)*.65),rainfall:scenario==='rain'?Math.round(58*p):0,alerts:Object.values(deviceData).filter(d=>d.risk!=='healthy').length};
}

// Traverse connected topology rather than guessing proximity.
export function connectedSections(id,direction='upstream'){const result=new Set(),queue=[sections.find(s=>s.id===id)];while(queue.length){const current=queue.shift();if(!current)continue;for(const s of sections){if(s.id===id||result.has(s.id))continue;if(direction==='upstream'?s.to.id===current.from.id:s.from.id===current.to.id){result.add(s.id);queue.push(s);}}}return result;}
