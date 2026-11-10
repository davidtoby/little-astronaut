import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
const root=fileURLToPath(new URL('../',import.meta.url));
function page(savedLanguage='zh'){
 const html=readFileSync(root+'public/index.html','utf8');
 const dom=new JSDOM(html,{url:'http://localhost:8787',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window; w.localStorage.setItem('astro-language',savedLanguage);
 w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.ResizeObserver=class{observe(){}};
 const frames=[];w.requestAnimationFrame=cb=>frames.push(cb);
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({createRadialGradient(){return{addColorStop(){}}}}, {get:(o,k)=>o[k]||(()=>{})});
 const played=[];w.played=played;const scripts=['i18n-data.js','i18n.js','audio/narration.js'].map(p=>readFileSync(root+'public/'+p,'utf8'));scripts.push(
 `const narrationPlayer={voice:'teacher',get name(){return t('温柔老师')},unlock(){},stop(){},play(text){window.played.push(text)},pause(){},resume(){},setVoice(v){this.voice=v},duration(text){return window.ASTRO_NARRATION.clips[text]?.[astroI18n.language==='en'?'en-'+this.voice:this.voice]?.duration||0},longestDuration(text){return this.duration(text)},isBusyFor(){return false}};`);
 scripts.push(readFileSync(root+'public/app.js','utf8'));w.eval(scripts.join('\n'));
 const click=selector=>w.document.querySelector(selector).click();
 const language=value=>{const el=w.document.getElementById('language');el.value=value;el.dispatchEvent(new w.Event('change'))};
 return {dom,w,click,language,played,frames};
}
function assertEnglish(p){
 const w=p.w;
 const walker=w.document.createTreeWalker(w.document.body,w.NodeFilter.SHOW_TEXT);
 const chinese=[];
 while(walker.nextNode()){
  const n=walker.currentNode;
  if(n.parentElement.closest('script,style,#language'))continue;
  if(/[\u3400-\u9fff]/.test(n.nodeValue))chinese.push(n.nodeValue.trim());
 }
 assert.deepEqual(chinese,[],'every static and dynamic label must switch language');
 for(const e of w.document.querySelectorAll('[aria-label]'))assert(!/[\u3400-\u9fff]/.test(e.getAttribute('aria-label')));
}
test('all scenes, planets, captions and launch steps switch English and back without losing selection',()=>{
 const p=page();p.click('[data-go="solar"]');p.click('#planet-picker button:nth-child(7)');p.language('en');
 assert.equal(p.w.document.documentElement.lang,'en-GB');assert.equal(p.w.document.getElementById('planet-name').textContent,'Saturn');assertEnglish(p);
 p.click('[data-go="rocket"]');p.click('#steps button:nth-child(3)');assert.equal(p.w.document.getElementById('stage-title').textContent,'Go faster sideways');assertEnglish(p);
 p.click('#stage-speak');const key=p.played.at(-1);assert(p.w.ASTRO_NARRATION.clips[key]['en-teacher']);
 p.language('zh');assert.equal(p.w.document.getElementById('stage-title').textContent,'向旁边飞得更快');
 p.click('[data-go="solar"]');assert.equal(p.w.document.getElementById('planet-name').textContent,'土星');p.language('en');assertEnglish(p);p.dom.window.close();
});
test('saved English applies on first load and countdown has translated text and narration',()=>{
 const p=page('en');assert.equal(p.w.document.title,'Little Astronaut · A Space Playground for Kids');assertEnglish(p);
 p.click('#sound');p.click('[data-go="rocket"]');p.click('#launch');assert.equal(p.w.document.getElementById('stage-title').textContent,'Count with me: three, two, one!');assertEnglish(p);
 assert.equal(p.played.at(-1),'三，二，一，出发！');assert(p.w.ASTRO_NARRATION.clips[p.played.at(-1)]['en-teacher']);p.dom.window.close();
});
test('every narrated entry has both female voices in both languages and complete local MP3 data',()=>{
 const manifest=JSON.parse(readFileSync(root+'public/audio/manifest.json'));
 const content=JSON.parse(readFileSync(root+'public/narration-content.json'));
 for(const item of content){
  for(const name of ['teacher','sister','en-teacher','en-sister']){
   const clip=manifest.clips[item.key][name];assert(clip.duration>0);assert(readFileSync(root+'public/'+clip.src).length>1000);
   if(name.startsWith('en-'))assert.equal(clip.spokenText,item.en);
  }
 }
 assert.equal(content.length,20);
});
for(const lang of ['zh','en']){
 test(`${lang}: an enabled narrated launch automatically completes all five stages`,()=>{
  const p=page(lang);p.click('#sound');p.click('[data-go="rocket"]');p.click('#launch');
  for(let frame=0;frame<4000;frame++){const cb=p.frames.shift();cb(frame*16);}
  assert.equal(p.w.document.getElementById('stage-title').textContent,lang==='en'?'Hooray! We’re in orbit!':'成功啦！绕地球飞');
  assert(p.w.document.getElementById('speed').textContent.startsWith('7.8'));
  const stageKeys=Object.entries(p.w.ASTRO_NARRATION.clips).filter(([,v])=>v.teacher.src.includes('stage-')).map(([key])=>key);
  assert(stageKeys.every(key=>p.played.includes(key)));
  if(lang==='en')assertEnglish(p);p.dom.window.close();
 });
}
