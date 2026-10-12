import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../render/index.html',import.meta.url),'utf8');
const source=readFileSync(new URL('../render/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../render/simple-controls.css',import.meta.url),'utf8');
test('demo stays dark regardless of saved or system theme preferences',()=>{
 assert.match(html,/<html lang="en" data-theme="dark">/);
 assert.doesNotMatch(html,/theme-toggle|prefers-color-scheme|localStorage/);
 assert.doesNotMatch(source,/theme-toggle|dataset\.theme|flowguard-theme/);
 assert.match(css,/color-scheme:dark/);
});
test('all JavaScript control targets exist exactly once',()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);
 const dynamicIds=[...source.matchAll(/\bid:'([^']+)'/g)].map(m=>m[1]);
 for(const [,id] of source.matchAll(/\$\('([^']+)'\)/g)) assert.ok(ids.includes(id)||dynamicIds.includes(id),id);
});
test('first-time visitors get three situations and collapsed advanced tools',()=>{
 assert.equal((html.match(/data-scenario=/g)||[]).length,3);
 assert.match(html,/Show me how it works/);
 assert.match(html,/<details class="advanced"><summary>More viewing options/);
 assert.match(html,/A drain gets blocked/);
 assert.match(html,/Show a simulated drain clearance/);
});
test('tour keeps playback accessible and mobile controls remain visible',()=>{
 assert.doesNotMatch(css,/body\.touring #scenario-controls\{display:none/);
 assert.match(css,/#app\.panel-collapsed #control-panel\{display:flex/);
 assert.match(css,/grid-template-rows:42% minmax\(0,1fr\)/);
 assert.match(css,/#control-panel #insight\{display:block!important/);
});
function harness(){
 const elements=new Map();
 const $=id=>{
  if(!elements.has(id)) elements.set(id,{hidden:false,attributes:{},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v},scrollIntoView(){}});
  return elements.get(id);
 };
 const context=vm.createContext({$,state:{mode:'explore',paused:true,tourTime:40},flight:{},tourStep:2,
  closeMobilePanels(){},closeInspector(){},setPanel(open){context.panelOpen=open},
  updateStageProgress(){},queueMicrotask(fn){fn()},document:{body:{classList:{toggle(){}}}}});
 vm.runInContext(source.split('\n').find(line=>line.startsWith('function setMode(')),context);
 return {context,$};
}
test('starting the tour resets its timeline, plays, and keeps controls open',()=>{
 const {context,$}=harness();
 vm.runInContext("setMode('presentation')",context);
 assert.equal(context.state.tourTime,0);
 assert.equal(context.state.paused,false);
 assert.equal(context.panelOpen,true);
 assert.equal($('story').hidden,false);
 assert.equal($('presentation').attributes['aria-pressed'],'true');
});
test('returning to manual exploration hides the tour and cancels camera flight',()=>{
 const {context,$}=harness();
 vm.runInContext("setMode('presentation'); setMode('explore')",context);
 assert.equal(context.flight,null);
 assert.equal($('story').hidden,true);
 assert.equal($('explore').attributes['aria-pressed'],'true');
});
