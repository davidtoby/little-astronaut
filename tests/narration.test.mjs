import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(fs.readFileSync(root+'public/audio/manifest.json'));
function player(language='zh'){
 const pending=new Map(),sources=[],messages=[];
 const sound={dataset:{},removeAttribute(){delete this.dataset.playing}};
 let context;
 class FakeContext{
  constructor(){context=this}
  state='running';destination={};
  resume(){this.state='running';return Promise.resolve()}
  suspend(){this.state='suspended';return Promise.resolve()}
  decodeAudioData(bytes){return Promise.resolve({bytes})}
  createBufferSource(){const s={connect(){},start(){s.started=true},stop(){s.stopped=true;s.onended?.()}};sources.push(s);return s}
 }
 const locale={language};
 const scope={window:{ASTRO_NARRATION:manifest,AudioContext:FakeContext,addEventListener(){}},astroI18n:locale,t:x=>x,document:{getElementById(){return sound}},localStorage:{getItem(){return null},setItem(){}},fetch(src){return new Promise((resolve,reject)=>pending.set(src,{resolve,reject}))},AbortController,setTimeout,clearTimeout,toast(t){messages.push(t)}};
 vm.createContext(scope);vm.runInContext(fs.readFileSync(root+'public/narration-player.js','utf8')+'\nthis.player=narrationPlayer;',scope);
 scope.player.unlock();return{p:scope.player,pending,sources,messages,sound,locale,get context(){return context}};
}
const okay={ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};
const texts=Object.keys(manifest.clips);
for(const language of ['zh','en']){
 test(`${language}: rapid taps play only the newest clip; pause, continue and stop retain correct playback`,async()=>{
  const h=player(language),style=language==='en'?'en-teacher':'teacher';
  const a=h.p.play(texts[0]),b=h.p.play(texts[1]);
  h.pending.get(manifest.clips[texts[1]][style].src).resolve(okay);await b;
  h.pending.get(manifest.clips[texts[0]][style].src).resolve(okay);await a;
  assert.equal(h.sources.length,1);assert(h.p.isBusyFor(texts[1]));
  h.p.pause();assert.equal(h.context.state,'suspended');assert(!h.sources[0].stopped);h.p.resume();assert.equal(h.context.state,'running');
  h.p.stop();assert(h.sources[0].stopped);assert(!h.p.isBusyFor(texts[1]));assert.equal(h.sound.dataset.playing,undefined);
 });
}
test('switching language stops the previous request and fetches the corresponding English voice',async()=>{
 const h=player();const old=h.p.play(texts[0]);h.p.stop();h.locale.language='en';const next=h.p.play(texts[0]);
 h.pending.get(manifest.clips[texts[0]].teacher.src).resolve(okay);await old;assert.equal(h.sources.length,0);
 h.pending.get(manifest.clips[texts[0]]['en-teacher'].src).resolve(okay);await next;assert.equal(h.sources.length,1);h.p.stop();
});
test('failed audio cannot leave the rocket waiting for narration forever',async()=>{
 const h=player();const a=h.p.play(texts[0]);h.pending.get(manifest.clips[texts[0]].teacher.src).resolve({ok:false});await a;
 assert(!h.p.isBusyFor(texts[0]));assert.equal(h.messages.length,1);
});
