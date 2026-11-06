'use strict';
/* ===== Segédfüggvények ===== */
const $=s=>document.querySelector(s);
const DAY=864e5;
const C={blue:'var(--kj-blue-line)',gold:'var(--kj-gold-line)',violet:'var(--kj-violet)',green:'var(--kj-green-line)',red:'var(--kj-red-line)'};
const I=(n,c='')=>`<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const z2=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+z2(d.getMonth()+1)+'-'+z2(d.getDate());
const today=()=>ymd(new Date());
const pYmd=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=1)=>n==null||isNaN(n)?'–':(+n).toLocaleString('hu-HU',{maximumFractionDigits:d});
const sgn=(n,d=1)=>n==null||isNaN(n)?'–':(n>0?'+':n<0?'−':'±')+fmt(Math.abs(n),d);
const fmtShort=v=>v>=1e4?fmt(v/1000,0)+'k':v>=1000?fmt(v/1000,1)+'k':fmt(v,1);
const e1rm=(w,r)=>!w||!r?0:(r===1?w:w*(1+r/30)); // Epley
const dur=ms=>{const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return(h?h+':'+z2(m):m)+':'+z2(s%60)};
const fmtSec=s=>s>=60?(s%60?Math.floor(s/60)+':'+z2(s%60):s/60+' perc'):s+' mp';
function fmtDate(s){const d=typeof s==='string'?pYmd(s):new Date(s);const o={month:'short',day:'numeric'};if(d.getFullYear()!==new Date().getFullYear())o.year='numeric';return d.toLocaleDateString('hu-HU',o)}
const fmtTime=ts=>{const d=new Date(ts);return z2(d.getHours())+':'+z2(d.getMinutes())};
const byName=(a,b)=>a.name.localeCompare(b.name,'hu');

/* ===== Alapadatok ===== */
const DEF_EX=[
['Fekvenyomás (rúd)','Mell'],['Ferde fekvenyomás (kézisúlyzó)','Mell'],['Fekvenyomás (kézisúlyzó)','Mell'],['Tárogatás (kábel)','Mell'],['Tolódzkodás','Mell'],
['Felhúzás (rúd)','Hát'],['Evezés (rúd)','Hát'],['Húzódzkodás','Hát'],['Mellhez húzás (kábel)','Hát'],['Evezés ülve (kábel)','Hát'],['Evezés (kézisúlyzó)','Hát'],
['Guggolás (rúd)','Láb'],['Román felhúzás (rúd)','Láb'],['Lábtolás (gép)','Láb'],['Kitörés (kézisúlyzó)','Láb'],['Lábhajlítás (gép)','Láb'],['Lábnyújtás (gép)','Láb'],['Csípőemelés (rúd)','Láb'],['Vádliemelés (gép)','Láb'],
['Katonai nyomás (rúd)','Váll'],['Vállból nyomás (kézisúlyzó)','Váll'],['Oldalemelés (kézisúlyzó)','Váll'],['Face pull (kábel)','Váll'],
['Bicepsz hajlítás (kézisúlyzó)','Kar'],['Bicepsz hajlítás (rúd)','Kar'],['Kalapács hajlítás','Kar'],['Tricepsz letolás (kábel)','Kar'],['Francia nyomás','Kar'],
['Hasprés','Törzs'],['Lábemelés függésben','Törzs'],['Hasgörgő','Törzs'],
['KB swing (kétkezes)','Kettlebell'],['KB swing (egykezes)','Kettlebell'],['KB goblet guggolás','Kettlebell'],['KB török felállás (get-up)','Kettlebell'],
['KB clean','Kettlebell'],['KB clean & press','Kettlebell'],['KB snatch','Kettlebell'],['KB nyomás (egykezes)','Kettlebell'],['KB evezés','Kettlebell'],
['KB felhúzás','Kettlebell'],['KB front rack guggolás','Kettlebell'],['KB halo','Kettlebell'],['KB windmill','Kettlebell'],['KB thruster','Kettlebell'],['KB high pull','Kettlebell']];
const DEF_TPL=[
 ['Push – mell, váll, tricepsz',[['Fekvenyomás (rúd)',3],['Ferde fekvenyomás (kézisúlyzó)',3],['Katonai nyomás (rúd)',3],['Oldalemelés (kézisúlyzó)',3],['Tricepsz letolás (kábel)',3]]],
 ['Pull – hát, bicepsz',[['Felhúzás (rúd)',3],['Evezés (rúd)',3],['Húzódzkodás',3],['Mellhez húzás (kábel)',3],['Bicepsz hajlítás (kézisúlyzó)',3]]],
 ['Láb',[['Guggolás (rúd)',3],['Román felhúzás (rúd)',3],['Lábtolás (gép)',3],['Kitörés (kézisúlyzó)',3],['Vádliemelés (gép)',3]]],
 ['Kettlebell – swing & get-up',[['KB swing (egykezes)',10],['KB török felállás (get-up)',5]]],
 ['Kettlebell – teljes test',[['KB goblet guggolás',3],['KB clean & press',3],['KB evezés',3],['KB swing (kétkezes)',3],['KB halo',2]]],
 ['Kettlebell – ballisztikus',[['KB swing (kétkezes)',5],['KB clean',4],['KB snatch',4],['KB front rack guggolás',3],['KB windmill',2]]]];
const DEF_REST={'KB swing (egykezes)':45,'KB swing (kétkezes)':60,'KB snatch':60,'KB török felállás (get-up)':60};
function addDefaults(st){
  for(const[name,cat]of DEF_EX)if(!st.exercises.some(e=>e.name===name)){const e={id:uid(),name,cat};if(DEF_REST[name])e.rest=DEF_REST[name];st.exercises.push(e)}
  const f=n=>st.exercises.find(e=>e.name===n)?.id;
  for(const[name,items]of DEF_TPL)if(!st.templates.some(t=>t.name===name)&&(st.v===0||name.startsWith('Kettlebell')))
    st.templates.push({id:uid(),name,items:items.filter(([n])=>f(n)).map(([n,s])=>({exId:f(n),sets:s}))});
}
function defaults(){const st={v:0,exercises:[],templates:[],workouts:[],body:[],active:null,settings:{rest:90,theme:null}};addDefaults(st);st.v=2;return st}
const KEY='edzesnaplo.v1';
let S; // a betöltés a fájl végén történik (a validáló függvények után)
function load(){try{const raw=localStorage.getItem(KEY);if(raw){const s=sanitizeState(JSON.parse(raw));if(s.v<2){addDefaults(s);s.v=2}return s}}catch(e){console.warn('Betöltési hiba',e)}return defaults()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Mentés sikertelen (tárhely?)')}}

/* ===== Téma ===== */
const mq=matchMedia('(prefers-color-scheme: dark)');
function curTheme(){return S.settings.theme||(mq.matches?'dark':'light')}
function applyTheme(){const t=curTheme();document.documentElement.dataset.theme=t;$('#themeColor').content=t==='dark'?'#060a17':'#eef2f8';$('#themeBtn').innerHTML=I(t==='dark'?'sun':'moon','sm')}
function toggleTheme(){S.settings.theme=curTheme()==='dark'?'light':'dark';save();applyTheme();if(tab==='stats'||tab==='body')render()}
mq.addEventListener?.('change',()=>{if(!S.settings.theme)applyTheme()});

/* ===== Állapot ===== */
let tab='workout',calMonth=null,calSel=today(),bodyDate=today(),statRange=90,strEx=null,strMetric='e',rest=null,tplDraft=null,pickCb=null,pickCancel=null;
const exById=id=>S.exercises.find(e=>e.id===id);
const exName=id=>exById(id)?.name||'(törölt gyakorlat)';
const exRest=id=>exById(id)?.rest??S.settings.rest??90;
const setStr=s=>s.w?`${fmt(s.w)}×${s.r}`:`${s.r} ism.`;
const wSorted=()=>[...S.workouts].sort((a,b)=>a.start-b.start);
const wVolume=w=>w.exercises.reduce((a,e)=>a+e.sets.reduce((b,s)=>b+(s.w||0)*(s.r||0),0),0);
const PRLBL={w:'max súly',e:'becs. 1RM',r:'ismétlés',v:'sorozat-volumen'};
const PRUNIT={w:' kg',e:' kg',r:'',v:' kg'};

function prevSets(exId){let best=null;for(const w of S.workouts)for(const e of w.exercises)if(e.exId===exId&&(!best||w.start>best.t))best={t:w.start,sets:e.sets};return best?best.sets:[]}
function bests(sets){const b={w:0,e:0,r:0,v:0};for(const s of sets){if(s.w>b.w)b.w=s.w;const e=e1rm(s.w,s.r);if(e>b.e)b.e=e;if(s.r>b.r)b.r=s.r;if(s.w*s.r>b.v)b.v=s.w*s.r}return b}
function bestsBefore(exId,ts,skipId){const all=[];for(const w of S.workouts){if(w.id===skipId||w.start>=ts)continue;for(const e of w.exercises)if(e.exId===exId)all.push(...e.sets)}return all.length?bests(all):null}
function detectPRs(w){const out=[];for(const e of w.exercises){const prev=bestsBefore(e.exId,w.start,w.id);if(!prev)continue;const cur=bests(e.sets);for(const t of['w','e','r','v'])if(cur[t]>prev[t]+1e-9&&cur[t]>0)out.push({exId:e.exId,type:t,val:Math.round(cur[t]*10)/10})}return out}
function allPRs(){const m={};for(const w of wSorted())for(const e of w.exercises){const r=m[e.exId]||(m[e.exId]={w:{v:0},e:{v:0},r:{v:0},v:{v:0},n:0});r.n++;for(const s of e.sets){const d=w.start;if(s.w>r.w.v)r.w={v:s.w,d,s};const q=e1rm(s.w,s.r);if(q>r.e.v)r.e={v:q,d,s};if(s.r>r.r.v)r.r={v:s.r,d,s};if(s.w*s.r>r.v.v)r.v={v:s.w*s.r,d,s}}}return m}

/* ===== Saját párbeszédablakok (alert/confirm/prompt helyett) ===== */
let dlgResolve=null,dlgDefault=null;
function dlg(html,def=null){if(dlgResolve)dlgClose(dlgDefault);return new Promise(res=>{dlgResolve=res;dlgDefault=def;$('#dlgBox').innerHTML=html;$('#dlg').classList.add('on');setTimeout(()=>{const f=$('#dlgBox [autofocus]')||$('#dlgBox .btn.p,#dlgBox .btn.danger');f&&f.focus()},40)})}
function dlgClose(v){$('#dlg').classList.remove('on');const r=dlgResolve;dlgResolve=null;r&&r(v)}
function ask(msg,{title='Megerősítés',ok='Rendben',cancel='Mégse',danger=false}={}){
  return dlg(`<h2>${esc(title)}</h2><p>${msg}</p><div class="row end"><button class="btn" data-click="dlgClose(false)">${cancel}</button><button class="btn ${danger?'danger':'p'}" data-click="dlgClose(true)">${ok}</button></div>`,false)}
function form(title,fields,{ok='Mentés',intro=''}={}){
  const f=fields.map((x,i)=>`<label for="ff${i}">${esc(x.label)}</label>`+(x.type==='select'
    ?`<select id="ff${i}" data-f="${x.id}">${x.options.map(o=>`<option value="${esc(o[0])}" ${o[0]==x.value?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`
    :`<input id="ff${i}" data-f="${x.id}" type="${x.type||'text'}" value="${esc(x.value??'')}" placeholder="${esc(x.placeholder||'')}" ${x.list?`list="dl${i}"`:''} ${x.min!=null?`min="${x.min}"`:''} ${x.step?`step="${x.step}"`:''} ${x.type==='number'?'inputmode="numeric"':''} ${i===0?'autofocus':''} autocomplete="off">`
      +(x.list?`<datalist id="dl${i}">${x.list.map(o=>`<option value="${esc(o)}">`).join('')}</datalist>`:''))
    +(x.hint?`<div class="hint">${x.hint}</div>`:'')).join('');
  return dlg(`<h2>${esc(title)}</h2>${intro?`<p class="mut small">${intro}</p>`:''}<form data-submit="formSubmit()">${f}<div class="row end"><button type="button" class="btn" data-click="dlgClose(null)">Mégse</button><button class="btn p" type="submit">${ok}</button></div></form>`,null)}
function readForm(){const o={};document.querySelectorAll('#dlgBox [data-f]').forEach(el=>o[el.dataset.f]=el.value.trim());return o}
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#dlg').classList.contains('on'))dlgClose(dlgDefault);else if($('#modal').classList.contains('on'))modalBg()});


/* ===== Eseménykezelés (CSP: nincs inline handler, nincs eval) =====
   A sablonokban data-click/input/change/submit="fn(arg,...)" áll; az argumentum csak
   literál lehet (szám, 'szöveg', null, true/false), illetve this / this.value. */
const ACT=new Set(["addSet", "adjRest", "bodyFromCal", "calNav", "chooseEx", "closeModal", "delBody", "delEx", "delTemplate", "delWorkout", "demoData", "discardWorkout", "dlgBackdrop", "dlgClose", "editBodyRow", "editEx", "editTemplate", "exportCSV", "exportData", "finishWorkout", "formSubmit", "go", "goToday", "importData", "modalBg", "moveEx", "newExFromList", "newExercise", "openImport", "pickForActive", "pickForTpl", "renderPick", "repeatWorkout", "resetAll", "rmEx", "rmSet", "saveAsTemplate", "saveAsTplFromSummary", "saveBody", "saveTpl", "selDay", "setBodyDate", "setDefRest", "setExRest", "setRange", "setStrEx", "setStrMetric", "setTheme", "setTplName", "setTplSets", "setVal", "setWName", "showStr", "startWorkout", "stopRest", "toggleSet", "toggleTheme", "tplMove", "tplRemove", "updateTplFrom"]);
function splitArgs(s){const out=[];let cur='',q=false;for(const ch of s){if(ch==="'")q=!q;if(ch===','&&!q){out.push(cur.trim());cur=''}else cur+=ch}if(cur.trim())out.push(cur.trim());return out}
function parseArg(a,el){if(a==='this')return el;if(a==='this.value')return el.value;if(/^'[^'"\\]*'$/.test(a))return a.slice(1,-1);if(/^-?\d+(\.\d+)?$/.test(a))return +a;if(a==='null')return null;if(a==='true')return true;if(a==='false')return false;throw new Error('arg')}
function runAct(src,el){const m=/^([A-Za-z_]\w*)\((.*)\)$/.exec((src||'').trim());if(!m||!ACT.has(m[1])||typeof window[m[1]]!=='function'){console.warn('Ismeretlen művelet:',src);return}
  let args;try{args=m[2].trim()?splitArgs(m[2]).map(a=>parseArg(a,el)):[]}catch(e){console.warn('Hibás argumentum:',src);return}window[m[1]].apply(el,args)}
for(const type of['click','input','change','submit'])document.addEventListener(type,e=>{
  if(type==='click'){const bd=e.target.closest&&e.target.closest('[data-backdrop]');if(bd&&e.target===bd){runAct(bd.dataset.backdrop+'()',bd);return}}
  const el=e.target.closest&&e.target.closest('[data-'+type+']');if(!el)return;if(type==='submit')e.preventDefault();runAct(el.getAttribute('data-'+type),el)});
/* kis segédműveletek a korábbi inline kódok helyett */
function setTplName(v){tplDraft.name=v}
function setTplSets(i,v){tplDraft.items[i].sets=Math.max(1,Math.min(30,parseInt(v)||1))}
function setWName(v){S.active.name=v;save()}
function tplRemove(i){tplDraft.items.splice(i,1);renderTpl()}
function setStrMetric(k){strMetric=k;render()}
function setStrEx(id){strEx=id;render()}
function showStr(id){strEx=id;render();document.getElementById('strcard')?.scrollIntoView({behavior:'smooth'})}
function setRange(v){statRange=v;render()}
function goToday(){selDay(today())}
function stopRest(){rest=null;tick()}
function pickForTpl(){pickExercise(tplAddEx,renderTpl)}
function pickForActive(){pickExercise(addExToActive)}
function dlgBackdrop(){dlgClose(dlgDefault)}
function newExFromList(){createExercise().then(e=>e&&render())}
function saveAsTplFromSummary(id){closeModal();saveAsTemplate(id)}
function editBodyRow(d){bodyDate=d;render();scrollTo(0,0)}
function bodyFromCal(d){bodyDate=d;go('body')}
function setBodyDate(v){bodyDate=/^\d{4}-\d\d-\d\d$/.test(v)?v:today();render()}
function setTheme(v){S.settings.theme=v;save();applyTheme();render()}
function openImport(){$('#imp').click()}
function setDefRest(v){S.settings.rest=Math.max(0,Math.min(1800,parseInt(v)||0));save();toast('Mentve')}
function formSubmit(){dlgClose(readForm())}

/* ===== Adatellenőrzés (import és betöltés) =====
   Az azonosítók és dátumok HTML-attribútumokba kerülnek, ezért szigorúan validáljuk őket. */
const ID_RE=/^[A-Za-z0-9_-]{1,40}$/,DATE_RE=/^\d{4}-\d\d-\d\d$/;
const num=(v,min,max)=>{v=+v;return isFinite(v)&&v>=min&&v<=max?v:null};
const str=(v,n=120)=>String(v??'').slice(0,n);
function sanitizeState(d){
  if(!d||typeof d!=='object'||!Array.isArray(d.exercises)||!Array.isArray(d.workouts))throw new Error('format');
  const map={},fix=id=>{const k=String(id);if(!map[k])map[k]=ID_RE.test(k)?k:uid();return map[k]};
  const o={v:num(d.v,1,99)||2,settings:{rest:num(d.settings?.rest,0,1800)??90,theme:['light','dark'].includes(d.settings?.theme)?d.settings.theme:null,lastBackup:num(d.settings?.lastBackup,0,9e15)||undefined}};
  o.exercises=d.exercises.filter(e=>e&&e.name).map(e=>{const x={id:fix(e.id),name:str(e.name,100),cat:str(e.cat||'Egyéb',40)};const r=num(e.rest,0,1800);if(r!=null&&e.rest!==''&&e.rest!=null)x.rest=r;return x});
  const sets=a=>(Array.isArray(a)?a:[]).map(s=>({w:num(s?.w,0,2000)??0,r:num(s?.r,0,10000)??0}));
  o.templates=(Array.isArray(d.templates)?d.templates:[]).filter(t=>t&&t.name).map(t=>({id:fix(t.id),name:str(t.name,100),items:(Array.isArray(t.items)?t.items:[]).map(i=>({exId:fix(i?.exId),sets:num(i?.sets,1,30)||3}))}));
  o.workouts=d.workouts.filter(w=>w&&num(w.start,0,9e15)).map(w=>({id:fix(w.id),name:str(w.name||'Edzés',100),start:+w.start,end:num(w.end,0,9e15)||+w.start,tplId:w.tplId?fix(w.tplId):null,
    exercises:(Array.isArray(w.exercises)?w.exercises:[]).map(e=>({exId:fix(e?.exId),sets:sets(e?.sets)})),
    prs:(Array.isArray(w.prs)?w.prs:[]).filter(p=>p&&['w','e','r','v'].includes(p.type)).map(p=>({exId:fix(p.exId),type:p.type,val:num(p.val,0,1e7)||0}))}));
  o.body=(Array.isArray(d.body)?d.body:[]).filter(b=>b&&DATE_RE.test(b.date)).map(b=>{const x={date:b.date};const w=num(b.weight,20,400),f=num(b.fat,2,70),wa=num(b.waist,30,250);if(w!=null)x.weight=w;if(f!=null)x.fat=f;if(wa!=null)x.waist=wa;return x});
  const a=d.active;
  o.active=a&&num(a.start,0,9e15)?{id:fix(a.id),name:str(a.name,100),start:+a.start,tplId:a.tplId?fix(a.tplId):null,exercises:(Array.isArray(a.exercises)?a.exercises:[]).map(e=>({exId:fix(e?.exId),sets:(Array.isArray(e?.sets)?e.sets:[]).map(s=>({w:s?.w===''?'':num(s?.w,0,2000)??'',r:s?.r===''?'':num(s?.r,0,10000)??'',done:!!s?.done}))}))}:null;
  return o;
}

/* ===== Navigáció, keret ===== */
function go(t){tab=t;render();scrollTo(0,0)}
function render(){
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
  $('#title').textContent={workout:S.active?'Edzés folyamatban':'Edzés',history:'Naptár',body:'Testadatok',stats:'Statisztika',more:'Beállítások'}[tab];
  $('#hdr').innerHTML=S.active&&tab!=='workout'?`<button class="pill" data-click="go('workout')" aria-label="Edzés folytatása">${I('biceps-flexed','sm')}<span id="elapsed2"></span></button>`:'';
  for(const k in CH)delete CH[k];
  $('main').innerHTML=({workout:S.active?vActive:vWorkout,history:vHistory,body:vBody,stats:vStats,more:vMore})[tab]();
  attachCharts();tick();updAvol();
}
function openModal(h){$('#sheet').innerHTML=h;$('#modal').classList.add('on')}
function closeModal(){$('#modal').classList.remove('on')}
function modalBg(){if(pickCb){const c=pickCancel;pickCb=pickCancel=null;closeModal();c&&c()}else closeModal()}
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2200)}

/* ===== Edzés kezdőlap ===== */
function backupNag(){
  if(S.workouts.length+S.body.length<5)return '';
  const lb=S.settings.lastBackup||0,days=Math.floor((Date.now()-lb)/DAY);
  if(lb&&days<14)return '';
  return `<div class="card" style="border-color:var(--kj-gold-line);background:var(--kj-gold-soft)"><div class="row" style="flex-wrap:nowrap"><span style="color:var(--kj-gold)">${I('info')}</span><span style="flex:1" class="small">${lb?`${days} napja nem mentettél.`:'Még nem készült mentés.'} Az adatok csak ezen az eszközön vannak.</span><button class="btn sm p" data-click="exportData()">Mentés</button></div></div>`;
}
function vWorkout(){
  let h=backupNag()+`<div class="card"><button class="btn p block" data-click="startWorkout()">${I('plus')} Üres edzés indítása</button></div>
  <div class="row" style="margin:6px 2px 10px"><h3 style="margin:0">Sablonok</h3><span class="sp"></span><button class="btn sm gold" data-click="editTemplate()">${I('plus','sm')} Új sablon</button></div>`;
  if(!S.templates.length)h+=`<div class="card mut">Még nincs sablon.</div>`;
  for(const t of S.templates){
    const last=Math.max(0,...S.workouts.filter(w=>w.tplId===t.id).map(w=>w.start));
    const kb=t.items.length&&t.items.every(it=>exById(it.exId)?.cat==='Kettlebell');
    h+=`<div class="card"><div class="row" style="flex-wrap:nowrap"><h2 style="flex:1;margin:0;font-size:17px">${esc(t.name)} ${kb?'<span class="tag">KB</span>':''}</h2><button class="btn sm ico" data-click="editTemplate('${t.id}')" aria-label="Sablon szerkesztése">${I('pencil','sm')}</button></div>
    <div class="mut small" style="margin:7px 0 12px">${t.items.map(it=>`<span class="mono">${it.sets}×</span> ${esc(exName(it.exId))}`).join(' · ')||'Üres sablon'}</div>
    <div class="row"><span class="mut small">${last?'Utoljára: '+fmtDate(last):'Még nem használt'}</span><span class="sp"></span><button class="btn p sm" data-click="startWorkout('${t.id}')">${I('dumbbell','sm')} Indítás</button></div></div>`;
  }
  const rec=wSorted().reverse().slice(0,3);
  if(rec.length){h+=`<h3 style="margin:20px 2px 10px">Legutóbbi edzések</h3>`;rec.forEach(w=>h+=workoutCard(w));}
  return h;
}
function workoutCard(w,actions=true){
  const mins=Math.max(1,Math.round((w.end-w.start)/60000)),nSets=w.exercises.reduce((a,e)=>a+e.sets.length,0);
  return `<div class="card"><div class="row" style="flex-wrap:nowrap"><h2 style="flex:1;margin:0;font-size:16.5px">${esc(w.name)}</h2><span class="mut small mono">${fmtDate(w.start)} · ${fmtTime(w.start)}</span></div>
  <div class="sum"><span>${I('timer','sm')} ${mins} perc</span>·<span>${fmt(wVolume(w),0)} kg volumen</span>·<span>${nSets} sorozat</span></div>
  ${w.exercises.map(e=>`<div class="exl"><span>${esc(exName(e.exId))}</span><span>${e.sets.map(setStr).join(', ')}</span></div>`).join('')}
  ${w.prs?.length?`<div>${w.prs.map(p=>`<span class="badge">${I('trophy','sm')} ${esc(exName(p.exId))} – ${PRLBL[p.type]}: ${fmt(p.val)}${PRUNIT[p.type]}</span>`).join('')}</div>`:''}
  ${actions?`<div class="row" style="margin-top:12px"><button class="btn sm" data-click="repeatWorkout('${w.id}')">${I('rotate-ccw','sm')} Ismétlés</button><button class="btn sm" data-click="saveAsTemplate('${w.id}')">${I('save','sm')} Sablonként</button><span class="sp"></span><button class="btn sm d ico" data-click="delWorkout('${w.id}')" aria-label="Edzés törlése">${I('trash-2','sm')}</button></div>`:''}</div>`;
}

/* ===== Aktív edzés ===== */
async function startWorkout(t){
  if(typeof t==='string')t=S.templates.find(x=>x.id===t);
  if(S.active&&!await ask('Már fut egy edzés. Elveted, és újat indítasz? A rögzített sorozatai elvesznek.',{title:'Futó edzés',ok:'Elvetés és új',danger:true}))return;
  S.active={id:uid(),name:t?.name||'Edzés',start:Date.now(),tplId:t?.id||null,
    exercises:(t?.items||[]).filter(it=>exById(it.exId)).map(it=>({exId:it.exId,sets:Array.from({length:it.sets||3},()=>({w:'',r:'',done:false}))}))};
  rest=null;save();go('workout');
}
function vActive(){
  const a=S.active;
  let h=`<div class="card"><input value="${esc(a.name)}" data-input="setWName(this.value)" style="font:800 17px var(--display)" aria-label="Edzés neve">
  <div class="row" style="margin-top:10px"><span class="mut">${I('timer','sm')} <b id="elapsed" class="mono" style="color:var(--kj-text)">0:00</b></span><span class="sp"></span><span class="mut small mono" id="avol"></span></div></div>`;
  a.exercises.forEach((e,i)=>{
    const prev=prevSets(e.exId),pb=bestsBefore(e.exId,Infinity),ex=exById(e.exId),custom=ex?.rest!=null;
    h+=`<div class="card"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0"><div class="ex-title">${esc(exName(e.exId))}</div>
    <button class="restbtn ${custom?'custom':''}" data-click="setExRest('${e.exId}')" title="Pihenőidő ennél a gyakorlatnál">${I('timer','sm')} ${fmtSec(exRest(e.exId))}${custom?'':' · alap'}</button></div>
    <button class="btn sm ico" data-click="moveEx(${i},-1)" aria-label="Fel">${I('arrow-up','sm')}</button><button class="btn sm ico" data-click="moveEx(${i},1)" aria-label="Le">${I('arrow-down','sm')}</button><button class="btn sm ico d" data-click="rmEx(${i})" aria-label="Eltávolítás">${I('x','sm')}</button></div>
    <table class="sets"><tr><th>#</th><th>Előző</th><th>kg</th><th>Ism.</th><th></th></tr>
    ${e.sets.map((s,j)=>{const p=prev[j]||prev[prev.length-1];return `<tr class="${s.done?'done':''}" id="r${i}_${j}"><td class="mut">${j+1}</td><td class="mut">${prev[j]?setStr(prev[j]):'–'}</td>
      <td><input type="number" inputmode="decimal" step="0.5" min="0" value="${s.w}" placeholder="${p?p.w:''}" data-input="setVal(${i},${j},'w',this.value)" aria-label="Súly"></td>
      <td><input type="number" inputmode="numeric" step="1" min="0" value="${s.r}" placeholder="${p?p.r:''}" data-input="setVal(${i},${j},'r',this.value)" aria-label="Ismétlés"></td>
      <td><button class="chk" data-click="toggleSet(${i},${j})" aria-label="Sorozat kész">${I('check','sm')}</button></td></tr>`}).join('')}
    </table><div class="row" style="margin-top:8px"><button class="btn sm" data-click="addSet(${i})">${I('plus','sm')} Sorozat</button><button class="btn sm" data-click="rmSet(${i})">${I('minus','sm')} Sorozat</button><span class="sp"></span>
    <span class="mut small">${pb?(pb.w?`${I('trophy','sm')} <span class="mono">${fmt(pb.w)} kg · 1RM ~${fmt(pb.e,0)}</span>`:`${I('trophy','sm')} <span class="mono">${pb.r} ism.</span>`):'Első alkalom'}</span></div></div>`;
  });
  h+=`<button class="btn block gold" data-click="pickForActive()">${I('plus')} Gyakorlat hozzáadása</button>
  <div class="row" style="margin-top:14px"><button class="btn d" data-click="discardWorkout()">${I('trash-2','sm')} Elvetés</button><span class="sp"></span><button class="btn g" data-click="finishWorkout()">${I('check')} Edzés befejezése</button></div>`;
  return h;
}
function setVal(i,j,k,v){S.active.exercises[i].sets[j][k]=v===''?'':+v;save();updAvol()}
function toggleSet(i,j){
  const e=S.active.exercises[i],s=e.sets[j];
  if(!s.done){
    const prev=prevSets(e.exId),p=prev[j]||prev[prev.length-1];
    if(s.w===''&&p)s.w=p.w; if(s.r===''&&p)s.r=p.r;
    if(s.r===''||!(+s.r>0)){toast('Add meg az ismétlésszámot');return}
    if(s.w==='')s.w=0;
    s.done=true;startRest(e.exId);
  }else s.done=false;
  save();
  const row=$('#r'+i+'_'+j);row.classList.toggle('done',s.done);const ins=row.querySelectorAll('input');ins[0].value=s.w;ins[1].value=s.r;updAvol();
}
function addSet(i){const sets=S.active.exercises[i].sets;const l=sets[sets.length-1];sets.push({w:l?l.w:'',r:l?l.r:'',done:false});save();render()}
function rmSet(i){const sets=S.active.exercises[i].sets;if(sets.length)sets.pop();save();render()}
function moveEx(i,d){const a=S.active.exercises,j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];save();render()}
async function rmEx(i){if(!await ask(`Eltávolítod a(z) <b>${esc(exName(S.active.exercises[i].exId))}</b> gyakorlatot az edzésből?`,{ok:'Eltávolítás',danger:true}))return;S.active.exercises.splice(i,1);save();render()}
function addExToActive(id){S.active.exercises.push({exId:id,sets:Array.from({length:3},()=>({w:'',r:'',done:false}))});save();render();setTimeout(()=>scrollTo(0,document.body.scrollHeight),30)}
function updAvol(){const el=$('#avol');if(!el||!S.active)return;let v=0,n=0;for(const e of S.active.exercises)for(const s of e.sets)if(s.done){v+=(+s.w||0)*(+s.r||0);n++}el.textContent=`${n} sorozat · ${fmt(v,0)} kg`}
async function discardWorkout(){if(!await ask('Biztosan elveted az edzést? A rögzített sorozatok elvesznek.',{title:'Edzés elvetése',ok:'Elvetés',danger:true}))return;S.active=null;rest=null;save();render()}
async function finishWorkout(){
  const a=S.active;
  const exs=a.exercises.map(e=>({exId:e.exId,sets:e.sets.filter(s=>s.done).map(s=>({w:+s.w||0,r:+s.r||0}))})).filter(e=>e.sets.length);
  if(!exs.length){if(await ask('Nincs teljesített (pipált) sorozat. Elveted az edzést?',{title:'Üres edzés',ok:'Elvetés',danger:true})){S.active=null;rest=null;save();render()}return}
  const open=a.exercises.reduce((n,e)=>n+e.sets.filter(s=>!s.done).length,0);
  if(open&&!await ask(`${open} nem pipált sorozat van – ezek nem kerülnek mentésre. Befejezed az edzést?`,{title:'Befejezés',ok:'Befejezés'}))return;
  const w={id:a.id,name:(a.name||'').trim()||'Edzés',start:a.start,end:Date.now(),tplId:a.tplId,exercises:exs};
  w.prs=detectPRs(w);
  S.workouts.push(w);S.active=null;rest=null;save();render();
  const t=w.tplId&&S.templates.find(x=>x.id===w.tplId);
  openModal(`<h2 style="display:flex;gap:8px;align-items:center">${I('party-popper')} Edzés kész!</h2>${workoutCard(w,false)}
  <div class="row">${t?`<button class="btn" data-click="updateTplFrom('${w.id}')">${I('save','sm')} Sablon frissítése</button>`:`<button class="btn" data-click="saveAsTplFromSummary('${w.id}')">${I('save','sm')} Mentés sablonként</button>`}<span class="sp"></span><button class="btn p" data-click="closeModal()">Rendben</button></div>`);
}
function updateTplFrom(wid){const w=S.workouts.find(x=>x.id===wid),t=S.templates.find(x=>x.id===w.tplId);if(!t)return;t.items=w.exercises.map(e=>({exId:e.exId,sets:e.sets.length}));save();closeModal();toast('Sablon frissítve');render()}
function repeatWorkout(wid){const w=S.workouts.find(x=>x.id===wid);startWorkout({id:w.tplId&&S.templates.some(t=>t.id===w.tplId)?w.tplId:null,name:w.name,items:w.exercises.map(e=>({exId:e.exId,sets:e.sets.length}))})}
async function saveAsTemplate(wid){const w=S.workouts.find(x=>x.id===wid);const r=await form('Mentés sablonként',[{id:'name',label:'Sablon neve',value:w.name}]);if(!r||!r.name)return;
  S.templates.push({id:uid(),name:r.name,items:w.exercises.map(e=>({exId:e.exId,sets:e.sets.length}))});save();toast('Sablon mentve');render()}
async function delWorkout(wid){const w=S.workouts.find(x=>x.id===wid);if(!await ask(`Törlöd a(z) <b>${esc(w.name)}</b> edzést (${fmtDate(w.start)})?`,{title:'Edzés törlése',ok:'Törlés',danger:true}))return;S.workouts=S.workouts.filter(x=>x.id!==wid);save();render()}

/* ===== Pihenőidő ===== */
function startRest(exId){const t=exRest(exId);if(!t)return;rest={end:Date.now()+t*1000,total:t,ex:exName(exId)};tick()}
function adjRest(d){if(!rest)return;rest.end+=d*1000;rest.total=Math.max(rest.total+d,1);tick()}
async function setExRest(exId){
  const ex=exById(exId);if(!ex)return;
  const r=await form('Pihenőidő',[{id:'rest',label:'Pihenő sorozatok között (mp)',type:'number',min:0,step:5,value:ex.rest??'',placeholder:`alapértelmezett: ${S.settings.rest} mp`,hint:'Üresen hagyva a Beállításokban megadott alapértelmezést használja. 0 = nincs pihenőszámláló.'}],{intro:esc(ex.name)});
  if(!r)return;if(r.rest==='')delete ex.rest;else ex.rest=Math.max(0,Math.min(1800,parseInt(r.rest)||0));save();render();
}
function beep(){try{const ac=new(window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();o.frequency.value=880;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.6);o.start();o.stop(ac.currentTime+.6)}catch(e){}}
function tick(){
  if(S.active){const t=dur(Date.now()-S.active.start);const a=$('#elapsed'),b=$('#elapsed2');if(a)a.textContent=t;if(b)b.textContent=t}
  const rb=$('#rest');document.body.classList.toggle('resting',!!rest);
  if(rest){const left=Math.ceil((rest.end-Date.now())/1000);
    if(left<=0){rest=null;rb.classList.remove('on');try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}beep();toast('Pihenő vége – következő sorozat!')}
    else{rb.classList.add('on');$('#restt').textContent=dur(left*1000);$('#restex').textContent=rest.ex||'';$('#restbar').style.width=Math.min(100,left/rest.total*100)+'%'}}
  else rb.classList.remove('on');
}
setInterval(tick,1000);

/* ===== Gyakorlatválasztó ===== */
function pickExercise(cb,onCancel){
  pickCb=cb;pickCancel=onCancel||null;
  openModal(`<h2>Gyakorlat választása</h2><input id="exq" placeholder="Keresés…" data-input="renderPick()" autocomplete="off"><div id="exlist" class="exlist"></div>
  <div class="row" style="margin-top:12px"><button class="btn sm gold" data-click="newExercise()">${I('plus','sm')} Új gyakorlat</button><span class="sp"></span><button class="btn sm" data-click="modalBg()">Mégse</button></div>`);
  renderPick();
}
const catSort=(a,b)=>a==='Kettlebell'?1:b==='Kettlebell'?-1:a.localeCompare(b,'hu');
function renderPick(){
  const q=($('#exq').value||'').toLowerCase().trim();
  const list=S.exercises.filter(e=>e.name.toLowerCase().includes(q)||e.cat.toLowerCase().includes(q)).sort(byName);
  const cats=[...new Set(list.map(e=>e.cat))].sort(catSort);
  $('#exlist').innerHTML=cats.map(c=>`<div class="cat">${esc(c)}</div>`+list.filter(e=>e.cat===c).map(e=>`<button class="exi" data-click="chooseEx('${e.id}')"><span>${esc(e.name)}</span>${e.rest!=null?`<span class="mut small mono">${I('timer','sm')} ${fmtSec(e.rest)}</span>`:''}</button>`).join('')).join('')||'<div class="mut" style="padding:12px 0">Nincs találat – hozd létre új gyakorlatként.</div>';
}
function chooseEx(id){const cb=pickCb;pickCb=pickCancel=null;closeModal();cb&&cb(id)}
function exFields(e={}){const cats=[...new Set(S.exercises.map(x=>x.cat))].sort(catSort);
  return[{id:'name',label:'Név',value:e.name||'',placeholder:'pl. KB egykezes evezés'},{id:'cat',label:'Izomcsoport / kategória',value:e.cat||'',list:cats,placeholder:'pl. Hát, Kettlebell'},
    {id:'rest',label:'Pihenőidő (mp)',type:'number',min:0,step:5,value:e.rest??'',placeholder:`alapértelmezett: ${S.settings.rest} mp`,hint:'Üresen: az alapértelmezett pihenőidőt használja.'}]}
function applyEx(e,r){e.name=r.name;e.cat=r.cat||'Egyéb';if(r.rest==='')delete e.rest;else e.rest=Math.max(0,Math.min(1800,parseInt(r.rest)||0))}
async function createExercise(def=''){
  const r=await form('Új gyakorlat',exFields({name:def}));if(!r||!r.name)return null;
  if(S.exercises.some(e=>e.name.toLowerCase()===r.name.toLowerCase())){toast('Már létezik ilyen nevű gyakorlat');return null}
  const e={id:uid()};applyEx(e,r);S.exercises.push(e);save();return e;
}
async function newExercise(){const e=await createExercise($('#exq')?.value||'');if(e)chooseEx(e.id)}

/* ===== Sablonszerkesztő ===== */
function editTemplate(id){const t=id&&S.templates.find(x=>x.id===id);tplDraft=t?JSON.parse(JSON.stringify(t)):{id:null,name:'',items:[]};renderTpl()}
function renderTpl(){
  const t=tplDraft;
  openModal(`<h2>${t.id?'Sablon szerkesztése':'Új sablon'}</h2><label>Név</label><input value="${esc(t.name)}" data-input="setTplName(this.value)" placeholder="pl. Push nap">
  <label>Gyakorlatok · sorozatszám</label>
  ${t.items.map((it,i)=>`<div class="row li"><span style="flex:1;min-width:0">${esc(exName(it.exId))}<br><span class="mut small mono">${I('timer','sm')} ${fmtSec(exRest(it.exId))}</span></span><input type="number" min="1" max="30" value="${it.sets}" style="width:56px;text-align:center" data-input="setTplSets(${i},this.value)" aria-label="Sorozatok"><button class="btn sm ico" data-click="tplMove(${i},-1)" aria-label="Fel">${I('arrow-up','sm')}</button><button class="btn sm ico d" data-click="tplRemove(${i})" aria-label="Törlés">${I('x','sm')}</button></div>`).join('')||'<div class="mut small">Még nincs gyakorlat.</div>'}
  <button class="btn block gold" style="margin-top:12px" data-click="pickForTpl()">${I('plus','sm')} Gyakorlat hozzáadása</button>
  <div class="row" style="margin-top:16px">${t.id?`<button class="btn d" data-click="delTemplate('${t.id}')">${I('trash-2','sm')} Törlés</button>`:''}<span class="sp"></span><button class="btn" data-click="closeModal()">Mégse</button><button class="btn p" data-click="saveTpl()">${I('save','sm')} Mentés</button></div>`);
}
function tplAddEx(id){tplDraft.items.push({exId:id,sets:3});renderTpl()}
function tplMove(i,d){const a=tplDraft.items,j=i+d;if(j<0)return;[a[i],a[j]]=[a[j],a[i]];renderTpl()}
function saveTpl(){const t=tplDraft;t.name=(t.name||'').trim();if(!t.name){toast('Adj nevet a sablonnak');return}
  if(t.id){const i=S.templates.findIndex(x=>x.id===t.id);S.templates[i]=t}else{t.id=uid();S.templates.push(t)}save();closeModal();render()}
async function delTemplate(id){if(!await ask('Törlöd a sablont? A korábbi edzések megmaradnak.',{title:'Sablon törlése',ok:'Törlés',danger:true}))return;S.templates=S.templates.filter(t=>t.id!==id);save();closeModal();render()}

/* ===== Naptár ===== */
function selDay(k){calSel=k;const d=pYmd(k);calMonth=[d.getFullYear(),d.getMonth()];render()}
function calNav(d){let[y,m]=calMonth;m+=d;if(m<0){m=11;y--}if(m>11){m=0;y++}calMonth=[y,m];render()}
function vHistory(){
  if(!calMonth){const d=new Date();calMonth=[d.getFullYear(),d.getMonth()]}
  const[y,m]=calMonth,first=new Date(y,m,1),off=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate(),cellsN=Math.ceil((off+days)/7)*7;
  const wDay={};for(const w of S.workouts){const k=ymd(new Date(w.start));(wDay[k]=wDay[k]||[]).push(w)}
  const bMap={};for(const b of S.body)bMap[b.date]=b;
  let cells=['H','K','SZE','CS','P','SZO','V'].map(d=>`<div class="h">${d}</div>`).join('');
  for(let i=0;i<cellsN;i++){const d=new Date(y,m,1-off+i),k=ymd(d);
    cells+=`<div class="d ${d.getMonth()!==m?'o':''} ${k===today()?'t':''} ${k===calSel?'sel':''}" data-click="selDay('${k}')">${d.getDate()}<div class="dots">${wDay[k]?`<i class="dot" style="background:${C.green}"></i>`:''}${bMap[k]?`<i class="dot" style="background:${C.gold}"></i>`:''}</div></div>`}
  const mW=S.workouts.filter(w=>{const d=new Date(w.start);return d.getFullYear()===y&&d.getMonth()===m});
  const mB=S.body.filter(b=>{const d=pYmd(b.date);return d.getFullYear()===y&&d.getMonth()===m&&b.weight!=null}).sort((a,b)=>a.date<b.date?-1:1);
  const mDelta=mB.length>1?mB[mB.length-1].weight-mB[0].weight:null;
  let h=`<div class="card"><div class="row" style="margin-bottom:12px;flex-wrap:nowrap"><button class="iconbtn" data-click="calNav(-1)" aria-label="Előző hónap">${I('chevron-left')}</button><h2 style="flex:1;text-align:center;margin:0;text-transform:capitalize">${first.toLocaleDateString('hu-HU',{year:'numeric',month:'long'})}</h2><button class="iconbtn" data-click="calNav(1)" aria-label="Következő hónap">${I('chevron-right')}</button></div>
  <div class="cal">${cells}</div>
  <div class="legend" style="margin-top:12px"><span><i style="background:${C.green}"></i>Edzés</span><span><i style="background:${C.gold}"></i>Testmérés</span><span class="sp"></span><button class="btn sm" data-click="goToday()">Ma</button></div></div>
  <div class="grid3" style="margin-bottom:12px">${stat('Edzés a hónapban',mW.length)}${stat('Volumen',mW.length?fmtShort(mW.reduce((a,w)=>a+wVolume(w),0))+' kg':null)}${stat('Súlyváltozás',mDelta==null?null:sgn(mDelta)+' kg')}</div>`;
  const dw=(wDay[calSel]||[]).sort((a,b)=>a.start-b.start),db=bMap[calSel];
  h+=`<h3 style="margin:8px 2px 10px">${pYmd(calSel).toLocaleDateString('hu-HU',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}</h3>`;
  h+=`<div class="card"><div class="row"><h2 style="flex:1;margin:0;font-size:16.5px">${I('scale','sm')} Testadatok</h2><button class="btn sm" data-click="bodyFromCal('${calSel}')">${db?I('pencil','sm')+' Szerkesztés':I('plus','sm')+' Rögzítés'}</button></div>
  ${db?`<div class="grid3" style="margin-top:12px">${stat('Súly',db.weight!=null?fmt(db.weight)+' kg':null)}${stat('Testzsír',db.fat!=null?fmt(db.fat)+' %':null)}${stat('Derék',db.waist!=null?fmt(db.waist)+' cm':null)}</div>`:'<div class="mut small" style="margin-top:6px">Nincs mérés erre a napra.</div>'}</div>`;
  h+=dw.length?dw.map(w=>workoutCard(w)).join(''):`<div class="card mut small">Nincs edzés erre a napra.</div>`;
  return h;
}

/* ===== Testadatok ===== */
const bodySorted=()=>[...S.body].sort((a,b)=>a.date<b.date?-1:1);
function series(k){return bodySorted().filter(b=>b[k]!=null).map(b=>({x:pYmd(b.date).getTime(),y:b[k]}))}
function deltaN(s,n){if(s.length<2)return null;const l=s[s.length-1],t=l.x-n*DAY;let p=null;for(const q of s)if(q.x<=t)p=q;return p?l.y-p.y:null}
function avgLast(s,n){if(!s.length)return null;const l=s[s.length-1].x,a=s.filter(p=>p.x>l-n*DAY);return a.reduce((x,p)=>x+p.y,0)/a.length}
function movAvg(s,n=7){return s.map(p=>{const a=s.filter(q=>q.x<=p.x&&q.x>p.x-n*DAY);return{x:p.x,y:a.reduce((x,q)=>x+q.y,0)/a.length}})}
function slopeWeek(s){if(s.length<3||s[s.length-1].x-s[0].x<6*DAY)return null;const n=s.length,xs=s.map(p=>p.x/DAY),mx=xs.reduce((a,b)=>a+b)/n,my=s.reduce((a,p)=>a+p.y,0)/n;let nu=0,de=0;s.forEach((p,i)=>{nu+=(xs[i]-mx)*(p.y-my);de+=(xs[i]-mx)**2});return de?nu/de*7:null}
function lastDays(s,n){if(!s.length)return s;const l=s[s.length-1].x;return s.filter(p=>p.x>l-n*DAY)}
function stat(l,v,cls=''){return `<div class="stat ${cls}"><b>${v==null||v===''?'–':v}</b><span>${l}</span></div>`}
const dcls=v=>v==null||Math.abs(v)<1e-9?'':v>0?'pos':'neg';
function trendStat(label,s,unit,d=2){const v=slopeWeek(s);return stat(label+' · '+unit,v==null?null:sgn(v,d),dcls(v))}
function vBody(){
  const e=S.body.find(b=>b.date===bodyDate)||{},sorted=bodySorted(),lastW=[...sorted].reverse().find(b=>b.weight!=null),lastF=[...sorted].reverse().find(b=>b.fat!=null);
  const ws=series('weight'),fs=series('fat'),d30=deltaN(ws,30);
  let h=`<div class="card"><h2>Mérés rögzítése</h2><label for="bd">Dátum</label><input type="date" id="bd" value="${bodyDate}" max="${today()}" data-change="setBodyDate(this.value)">
  <div class="grid3"><div><label for="bw">Súly (kg)</label><input id="bw" type="number" step="0.1" inputmode="decimal" value="${e.weight??''}" placeholder="${lastW?lastW.weight:''}"></div>
  <div><label for="bf">Testzsír (%)</label><input id="bf" type="number" step="0.1" inputmode="decimal" value="${e.fat??''}" placeholder="${lastF?lastF.fat:''}"></div>
  <div><label for="bwa">Derék (cm)</label><input id="bwa" type="number" step="0.5" inputmode="decimal" value="${e.waist??''}"></div></div>
  <div class="row" style="margin-top:14px">${e.date?`<button class="btn d" data-click="delBody('${e.date}')">${I('trash-2','sm')} Törlés</button>`:''}<span class="sp"></span><button class="btn p" data-click="saveBody()">${I('save','sm')} ${e.date?'Frissítés':'Mentés'}</button></div></div>
  <h3 style="margin:16px 2px 10px">Testsúly</h3>
  <div class="grid3" style="margin-bottom:8px">${stat('Utolsó súly',lastW?fmt(lastW.weight)+' kg':null)}${stat('7 napos átlag',ws.length?fmt(avgLast(ws,7))+' kg':null)}${stat('Δ 30 nap',d30==null?null:sgn(d30)+' kg',dcls(d30))}</div>
  <div class="grid3" style="margin-bottom:12px">${trendStat('Trend 14 nap',lastDays(ws,14),'kg/hét')}${trendStat('Trend 30 nap',lastDays(ws,30),'kg/hét')}${trendStat('Trend 90 nap',lastDays(ws,90),'kg/hét')}</div>
  <h3 style="margin:16px 2px 10px">Testzsír</h3>
  <div class="grid3" style="margin-bottom:12px">${stat('Utolsó testzsír',lastF?fmt(lastF.fat)+' %':null)}${trendStat('Trend 30 nap',lastDays(fs,30),'%p/hét')}${trendStat('Trend 90 nap',lastDays(fs,90),'%p/hét')}</div>
  <div class="hint" style="margin:-4px 2px 14px">A trend a mérésekre illesztett lineáris regresszió meredeksége heti változásra vetítve – kevésbé érzékeny a napi ingadozásra, mint két mérés különbsége.</div>`;
  const rows=[];let pw=null;for(const b of sorted){rows.push({b,d:b.weight!=null&&pw!=null?b.weight-pw:null});if(b.weight!=null)pw=b.weight}
  h+=`<div class="card"><h2>Előzmények</h2>${rows.length?`<table class="tbl"><tr><th>Dátum</th><th>Súly</th><th>Δ</th><th>Zsír %</th><th>Derék</th></tr>
  ${rows.reverse().slice(0,90).map(({b,d})=>`<tr class="click" data-click="editBodyRow('${b.date}')"><td>${fmtDate(b.date)}</td><td>${fmt(b.weight)}</td><td class="mut">${d==null?'':sgn(d)}</td><td>${fmt(b.fat)}</td><td>${fmt(b.waist)}</td></tr>`).join('')}</table>`:'<div class="empty">Még nincs mérés.</div>'}</div>`;
  return h;
}
function saveBody(){
  const d=$('#bd').value;if(!d)return;
  const num=id=>{const v=$(id).value.replace(',','.');return v===''?null:+v};
  const w=num('#bw'),f=num('#bf'),wa=num('#bwa');
  if(w==null&&f==null&&wa==null){toast('Adj meg legalább egy értéket');return}
  if(w!=null&&!(w>=20&&w<=400)){toast('A súly 20–400 kg között legyen');return}
  if(f!=null&&!(f>=2&&f<=70)){toast('A testzsír 2–70% között legyen');return}
  if(wa!=null&&!(wa>=30&&wa<=250)){toast('A derékkerület 30–250 cm között legyen');return}
  S.body=S.body.filter(b=>b.date!==d);const e={date:d};if(w!=null)e.weight=w;if(f!=null)e.fat=f;if(wa!=null)e.waist=wa;S.body.push(e);save();toast('Mentve');render();
}
async function delBody(d){if(!await ask(`Törlöd a(z) ${fmtDate(d)} mérést?`,{title:'Mérés törlése',ok:'Törlés',danger:true}))return;S.body=S.body.filter(b=>b.date!==d);save();render()}

/* ===== Statisztika ===== */
function weekStart(ts){const d=new Date(ts);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getTime()}
function strSeries(exId,metric){return wSorted().map(w=>{const sets=w.exercises.filter(e=>e.exId===exId).flatMap(e=>e.sets);if(!sets.length)return null;const b=bests(sets);
  const y=metric==='v'?sets.reduce((a,s)=>a+s.w*s.r,0):metric==='w'?b.w:metric==='r'?b.r:b.e;return{x:w.start,y:Math.round(y*10)/10}}).filter(Boolean)}
function vStats(){
  const cut=statRange?Date.now()-statRange*DAY:-Infinity,inR=p=>p.x>=cut;
  const chips=[[30,'30 nap'],[90,'90 nap'],[365,'1 év'],[0,'Mind']].map(([v,l])=>`<button class="chip ${statRange===v?'on':''}" data-click="setRange(${v})">${l}</button>`).join('');
  const wAll=series('weight'),w=wAll.filter(inR),ma=movAvg(wAll).filter(inR),d7=deltaN(wAll,7),d30=deltaN(wAll,30),d90=deltaN(wAll,90),sl=slopeWeek(w);
  let h=`<div class="chips">${chips}</div>
  <div class="card"><h2>Testsúly</h2>${lineChart([{name:'Súly',color:C.blue,points:w,dots:true,w:1.6},{name:'7 napos átlag',color:C.gold,points:ma,w:3}],{unit:' kg'})}
  <div class="grid3" style="margin-top:12px">${stat('Jelenlegi',wAll.length?fmt(wAll[wAll.length-1].y)+' kg':null)}${stat('Δ 7 nap',d7==null?null:sgn(d7)+' kg',dcls(d7))}${stat('Δ 30 nap',d30==null?null:sgn(d30)+' kg',dcls(d30))}
  ${stat('Δ 90 nap',d90==null?null:sgn(d90)+' kg',dcls(d90))}${stat('Trend (kg/hét)',sl==null?null:sgn(sl,2),dcls(sl))}${stat('Min – max (kg)',w.length?fmt(Math.min(...w.map(p=>p.y)),0)+'–'+fmt(Math.max(...w.map(p=>p.y)),0):null)}</div></div>`;
  const f=series('fat'),wa=series('waist'),fr=f.filter(inR),f30=deltaN(f,30),fsl=slopeWeek(fr),w30=deltaN(wa,30),w90=deltaN(wa,90);
  h+=`<div class="card"><h2>Testzsír %</h2>${lineChart([{name:'Testzsír',color:C.violet,points:fr,dots:true}],{unit:' %',h:190})}
  <div class="grid3" style="margin-top:12px">${stat('Jelenlegi',f.length?fmt(f[f.length-1].y)+' %':null)}${stat('Δ 30 nap',f30==null?null:sgn(f30)+' %p',dcls(f30))}${stat('Trend (%p/hét)',fsl==null?null:sgn(fsl,2),dcls(fsl))}</div></div>
  <div class="card"><h2>Derékkerület</h2>${lineChart([{name:'Derék',color:C.green,points:wa.filter(inR),dots:true}],{unit:' cm',h:190})}
  <div class="grid3" style="margin-top:12px">${stat('Jelenlegi',wa.length?fmt(wa[wa.length-1].y)+' cm':null)}${stat('Δ 30 nap',w30==null?null:sgn(w30)+' cm',dcls(w30))}${stat('Δ 90 nap',w90==null?null:sgn(w90)+' cm',dcls(w90))}</div></div>`;
  const ws0=weekStart(Date.now()),weeks=[...Array(12)].map((_,i)=>{const d=new Date(ws0);d.setDate(d.getDate()-(11-i)*7);return d.getTime()}),cnt=weeks.map(()=>0),vol=weeks.map(()=>0);
  for(const x of S.workouts){const i=weeks.indexOf(weekStart(x.start));if(i>=0){cnt[i]++;vol[i]+=wVolume(x)}}
  const lbl=weeks.map(t=>{const d=new Date(t);return z2(d.getMonth()+1)+'.'+z2(d.getDate())});
  const nm=new Date(),thisM=S.workouts.filter(x=>{const d=new Date(x.start);return d.getMonth()===nm.getMonth()&&d.getFullYear()===nm.getFullYear()}).length;
  h+=`<div class="card"><h2>Edzések</h2><div class="grid3" style="margin-bottom:12px">${stat('Összes edzés',S.workouts.length)}${stat('Ebben a hónapban',thisM)}${stat('Átlag / hét (12 hét)',fmt(cnt.reduce((a,b)=>a+b,0)/12,1))}</div>
  <h3>Edzésszám hetente</h3>${barChart(lbl,cnt,{color:C.green})}<h3 style="margin-top:14px">Heti volumen (kg)</h3>${barChart(lbl,vol,{color:C.blue})}</div>`;
  const used=[...new Set(S.workouts.flatMap(x=>x.exercises.map(e=>e.exId)))].filter(exById);
  if(!used.includes(strEx))strEx=[...used].sort((a,b)=>strSeries(b,'e').length-strSeries(a,'e').length)[0]||null;
  used.sort((a,b)=>exName(a).localeCompare(exName(b),'hu'));
  h+=`<div class="card" id="strcard"><h2>Erőtrend</h2>`;
  if(!used.length)h+=`<div class="empty">Rögzíts edzéseket a trendekhez.</div>`;
  else{
    const isBW=strSeries(strEx,'w').every(p=>!p.y);
    const mets=isBW?[['r','Max ismétlés']]:[['e','Becs. 1RM'],['w','Max súly'],['r','Max ismétlés'],['v','Volumen']];
    if(!mets.some(m=>m[0]===strMetric))strMetric=mets[0][0];
    const unit=strMetric==='r'?' ism.':' kg',sr=strSeries(strEx,strMetric).filter(inR);
    const first=sr[0],last=sr[sr.length-1],ch=first&&last&&first.y?(last.y-first.y)/first.y*100:null;
    h+=`<select data-change="setStrEx(this.value)" aria-label="Gyakorlat">${used.map(id=>`<option value="${id}" ${id===strEx?'selected':''}>${esc(exName(id))}</option>`).join('')}</select>
    <div class="chips" style="margin-top:12px">${mets.map(([k,l])=>`<button class="chip ${strMetric===k?'on':''}" data-click="setStrMetric('${k}')">${l}</button>`).join('')}</div>
    ${lineChart([{name:mets.find(m=>m[0]===strMetric)[1],color:C.blue,points:sr,dots:true}],{unit,h:210})}
    <div class="grid3" style="margin-top:12px">${stat('Alkalom (időszak)',sr.length)}${stat('Legutóbbi',last?fmt(last.y)+unit:null)}${stat('Változás (időszak)',ch==null?null:sgn(ch,1)+' %',ch>0?'neg':ch<0?'pos':'')}</div>`;
  }
  h+=`</div>`;
  const pr=allPRs(),ids=Object.keys(pr).filter(exById).sort((a,b)=>exName(a).localeCompare(exName(b),'hu'));
  h+=`<div class="card"><h2 style="display:flex;gap:8px;align-items:center"><span style="color:var(--kj-gold)">${I('trophy')}</span> Személyes rekordok</h2>${ids.length?`<table class="tbl"><tr><th>Gyakorlat</th><th>Max súly</th><th>Becs. 1RM</th><th>Max ism.</th><th>Legjobb sorozat</th></tr>
  ${ids.map(id=>{const r=pr[id];return `<tr class="click" data-click="showStr('${id}')"><td>${esc(exName(id))}<small>${r.n} alkalom</small></td>
  <td>${r.w.v?fmt(r.w.v)+' kg<small>'+fmtDate(r.w.d)+'</small>':'–'}</td><td>${r.e.v?fmt(r.e.v,1)+' kg<small>'+fmtDate(r.e.d)+'</small>':'–'}</td>
  <td>${r.r.v}<small>${fmtDate(r.r.d)}</small></td><td>${r.v.v?setStr(r.v.s)+'<small>'+fmtDate(r.v.d)+'</small>':setStr(r.r.s)}</td></tr>`}).join('')}</table>
  <div class="hint" style="margin-top:10px">Becsült 1RM: Epley-képlet (súly × (1 + ism./30)). Koppints egy sorra az erőtrendhez.</div>`:'<div class="empty">Még nincs rekord.</div>'}</div>`;
  return h;
}

/* ===== Grafikonok (SVG, külső könyvtár nélkül) ===== */
const CH={};let chN=0;
function niceTicks(a,b,n){const raw=(b-a)/n||1,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p,st=(f<1.5?1:f<3?2:f<7?5:10)*p,t=[];for(let v=Math.floor(a/st)*st;v<b+st*.999;v+=st){t.push(+v.toFixed(6));if(t.length>12)break}if(t.length<2)t.push(t[0]+st);return t}
function xLbl(x,span){const d=new Date(x);return span>400*DAY?d.getFullYear()+'.'+z2(d.getMonth()+1):z2(d.getMonth()+1)+'.'+z2(d.getDate())+'.'}
function lineChart(series,o={}){
  series=series.filter(s=>s.points.length);
  if(!series.length)return '<div class="empty">Ebben az időszakban nincs adat</div>';
  const W=600,H=o.h||230,pl=52,pr=14,pt=12,pb=30,all=series.flatMap(s=>s.points);
  let x0=Math.min(...all.map(p=>p.x)),x1=Math.max(...all.map(p=>p.x));if(x1-x0<DAY){x0-=3*DAY;x1+=3*DAY}
  let y0=Math.min(...all.map(p=>p.y)),y1=Math.max(...all.map(p=>p.y));const sp=y1-y0||Math.max(1,Math.abs(y1)*.04);y0-=sp*.12;y1+=sp*.12;
  const tk=niceTicks(y0,y1,4);y0=tk[0];y1=tk[tk.length-1];
  const sx=x=>pl+(x-x0)/(x1-x0)*(W-pl-pr),sy=y=>pt+(1-(y-y0)/(y1-y0))*(H-pt-pb);
  let g='';
  tk.forEach(t=>g+=`<line x1="${pl}" x2="${W-pr}" y1="${sy(t)}" y2="${sy(t)}" class="gl"/><text x="${pl-8}" y="${sy(t)+5}" text-anchor="end" class="ax">${fmt(t,1)}</text>`);
  for(let i=0;i<=4;i++){const x=x0+(x1-x0)*i/4;g+=`<text x="${sx(x)}" y="${H-8}" text-anchor="${i===0?'start':i===4?'end':'middle'}" class="ax">${xLbl(x,x1-x0)}</text>`}
  series.forEach(s=>{const d=s.points.map((p,i)=>(i?'L':'M')+sx(p.x).toFixed(1)+' '+sy(p.y).toFixed(1)).join('');
    g+=`<path d="${d}" style="fill:none;stroke:${s.color};stroke-width:${s.w||2.5};stroke-linejoin:round;stroke-linecap:round"/>`;
    if(s.dots&&s.points.length<=120)s.points.forEach(p=>g+=`<circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="${s.points.length>50?2.2:3.4}" style="fill:${s.color}"/>`)});
  const id='c'+(chN++);CH[id]={series,sx,sy,x0,x1,W,H,pl,pr,pt,pb,unit:o.unit||''};
  const legend=series.length>1?`<div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`:'';
  return `${legend}<svg class="chart" data-ch="${id}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map(s=>s.name).join(', '))} grafikon">${g}<g class="tt"></g></svg>`;
}
function attachCharts(){
  document.querySelectorAll('svg.chart[data-ch]').forEach(svg=>{const c=CH[svg.dataset.ch];if(!c)return;const tt=svg.querySelector('.tt');
    const show=ev=>{const r=svg.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*c.W,xv=c.x0+(x-c.pl)/(c.W-c.pl-c.pr)*(c.x1-c.x0);
      const near=(pts,t)=>{let q=null;for(const p of pts)if(!q||Math.abs(p.x-t)<Math.abs(q.x-t))q=p;return q};
      const b=near(c.series[0].points,xv);if(!b)return;const px=c.sx(b.x);
      const lines=[fmtDate(b.x)];c.series.forEach(s=>{const q=near(s.points,b.x);if(q&&Math.abs(q.x-b.x)<DAY*1.5)lines.push((c.series.length>1?s.name+': ':'')+fmt(q.y,1)+c.unit)});
      const bw=Math.max(...lines.map(l=>l.length))*9.2+20,bh=lines.length*21+12;let bx=px+12;if(bx+bw>c.W-c.pr)bx=px-12-bw;
      tt.innerHTML=`<line x1="${px}" x2="${px}" y1="${c.pt}" y2="${c.H-c.pb}" style="stroke:var(--kj-muted);stroke-dasharray:3 3"/><circle cx="${px}" cy="${c.sy(b.y)}" r="6" style="fill:${c.series[0].color};stroke:var(--kj-tt);stroke-width:2.5"/><rect x="${bx}" y="${c.pt}" width="${bw}" height="${bh}" rx="9" style="fill:var(--kj-tt);stroke:var(--kj-border-strong)"/>`+lines.map((l,i)=>`<text x="${bx+10}" y="${c.pt+24+i*21}" class="ttx">${esc(l)}</text>`).join('')};
    svg.addEventListener('pointermove',show);svg.addEventListener('pointerdown',show);svg.addEventListener('pointerleave',()=>tt.innerHTML='')});
}
function barChart(labels,vals,o={}){
  const W=600,H=o.h||180,pl=48,pr=8,pt=22,pb=28,max=Math.max(...vals,0);
  if(!max)return '<div class="empty">Az elmúlt 12 hétben nincs edzés</div>';
  const tk=niceTicks(0,max,3),top=tk[tk.length-1],bw=(W-pl-pr)/vals.length,ih=H-pt-pb;let g='';
  tk.forEach(t=>{const y=pt+(1-t/top)*ih;g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" class="gl"/><text x="${pl-8}" y="${y+5}" text-anchor="end" class="ax">${fmtShort(t)}</text>`});
  vals.forEach((v,i)=>{const h=v/top*ih,x=pl+i*bw+bw*.18,cx=x+bw*.32;
    if(v)g+=`<rect x="${x}" y="${H-pb-h}" width="${bw*.64}" height="${h}" rx="5" style="fill:${o.color}"/><text x="${cx}" y="${H-pb-h-6}" text-anchor="middle" class="bv">${fmtShort(v)}</text>`;
    if((vals.length-1-i)%2===0)g+=`<text x="${cx}" y="${H-8}" text-anchor="middle" class="ax">${labels[i]}</text>`});
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

/* ===== Beállítások: gyakorlatok, adatok ===== */
function vMore(){
  const cats=[...new Set(S.exercises.map(e=>e.cat))].sort(catSort);
  const usage={};for(const w of S.workouts)for(const e of w.exercises)usage[e.exId]=(usage[e.exId]||0)+1;
  return `<div class="card"><h2>Beállítások</h2>
  <label for="defrest">Alapértelmezett pihenőidő (mp)</label>
  <input id="defrest" type="number" min="0" max="1800" step="15" value="${S.settings.rest??90}" data-change="setDefRest(this.value)">
  <div class="hint">Pipálás után indul. Gyakorlatonként felülírható (edzés közben a gyakorlat neve alatti időre koppintva, vagy lent a listában). 0 = kikapcsolva.</div>
  <label>Megjelenés</label>
  <div class="chips" style="margin:0">${[[null,'Rendszer szerint'],['light','Világos'],['dark','Sötét']].map(([v,l])=>`<button class="chip ${S.settings.theme===v?'on':''}" data-click="setTheme(${v?`'${v}'`:'null'})">${l}</button>`).join('')}</div></div>
  <div class="card"><h2>Mentés</h2><div class="hint" style="margin:0 0 12px">Minden adat csak ezen az eszközön, a böngésző helyi tárhelyén van – semmi nem kerül szerverre. A <b>Mentés / megosztás</b> a telefon megosztás menüjét nyitja meg: innen menthetsz Google Drive-ra, a Fájlok appba vagy iCloud Drive-ra. Visszatöltés: <b>Import</b>, majd a fájl kiválasztása (a Drive is megjelenik a fájlválasztóban, ha telepítve van).</div>
  <div class="stat" style="margin-bottom:12px"><b style="font-size:16px">${S.settings.lastBackup?fmtDate(S.settings.lastBackup)+' · '+fmtTime(S.settings.lastBackup):'Még nem volt'}</b><span>Utolsó mentés</span></div>
  <div class="row"><button class="btn p" data-click="exportData()">${I(canShareFiles()?'share':'download','sm')} Mentés / megosztás</button><button class="btn" data-click="openImport()">${I('folder-open','sm')} Import</button><input type="file" id="imp" accept=".json,application/json" style="display:none" data-change="importData(this)"></div>
  <div class="row" style="margin-top:10px"><button class="btn" data-click="exportCSV()">${I('download','sm')} Testadatok (CSV)</button><button class="btn gold" data-click="demoData()">Mintaadatok</button><span class="sp"></span><button class="btn d" data-click="resetAll()">${I('trash-2','sm')} Minden törlése</button></div></div>
  <div class="card"><div class="row" style="margin-bottom:4px"><h2 style="margin:0;flex:1">Gyakorlatok <span class="mut mono" style="font-size:14px">${S.exercises.length}</span></h2><button class="btn sm gold" data-click="newExFromList()">${I('plus','sm')} Új</button></div>
  ${cats.map(c=>`<h3 style="margin-top:16px">${esc(c)}</h3>`+S.exercises.filter(e=>e.cat===c).sort(byName).map(e=>`<div class="row li"><span style="flex:1;min-width:0">${esc(e.name)}<br><span class="mut small mono">${e.rest!=null?`<span style="color:var(--kj-violet)">${I('timer','sm')} ${fmtSec(e.rest)}</span>`:`${I('timer','sm')} alap`}${usage[e.id]?` · ${usage[e.id]} edzés`:''}</span></span><button class="btn sm ico" data-click="editEx('${e.id}')" aria-label="Szerkesztés">${I('pencil','sm')}</button><button class="btn sm ico d" data-click="delEx('${e.id}')" aria-label="Törlés">${I('trash-2','sm')}</button></div>`).join('')).join('')}</div>
  <div class="hint" style="text-align:center;margin:10px 0 4px">Ikonok: Lucide (ISC) · Betűk: Instrument Sans, Bricolage Grotesque, JetBrains Mono (OFL)</div>`;
}
async function editEx(id){const e=exById(id);const r=await form('Gyakorlat szerkesztése',exFields(e));if(!r||!r.name)return;
  if(S.exercises.some(x=>x.id!==id&&x.name.toLowerCase()===r.name.toLowerCase())){toast('Már létezik ilyen nevű gyakorlat');return}applyEx(e,r);save();render()}
async function delEx(id){if(S.workouts.some(w=>w.exercises.some(e=>e.exId===id))){toast('Edzésben már szerepel – csak szerkeszthető');return}
  if(!await ask(`Törlöd a(z) <b>${esc(exName(id))}</b> gyakorlatot? A sablonokból is kikerül.`,{title:'Gyakorlat törlése',ok:'Törlés',danger:true}))return;
  S.exercises=S.exercises.filter(e=>e.id!==id);S.templates.forEach(t=>t.items=t.items.filter(i=>i.exId!==id));save();render()}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function canShareFiles(){try{return !!(navigator.canShare&&navigator.canShare({files:[new File(['{}'],'t.json',{type:'application/json'})]}))}catch(e){return false}}
async function shareOrDownload(name,text,type,title){
  const file=new File([text],name,{type});
  if(canShareFiles()){
    try{await navigator.share({files:[file],title});return true}
    catch(e){if(e&&e.name==='AbortError')return false} // a felhasználó bezárta a menüt
  }
  download(name,text,type);return true;
}
async function exportData(){
  const now=Date.now(),snap=JSON.stringify(Object.assign({},S,{settings:Object.assign({},S.settings,{lastBackup:now})}));
  if(await shareOrDownload('edzesnaplo-'+today()+'.json',snap,'application/json','Edzésnapló mentés')){S.settings.lastBackup=now;save();if(tab==='more'||tab==='workout')render();toast('Mentés kész')}
}
function exportCSV(){const c=v=>v==null?'':String(v).replace('.',',');shareOrDownload('testadatok-'+today()+'.csv','﻿datum;suly_kg;testzsir_szazalek;derek_cm\n'+bodySorted().map(b=>[b.date,c(b.weight),c(b.fat),c(b.waist)].join(';')).join('\n'),'text/csv','Testadatok')}
async function importData(inp){const f=inp.files[0];inp.value='';if(!f)return;
  let d;try{if(f.size>20e6)throw 0;d=sanitizeState(JSON.parse(await f.text()))}catch(e){toast('Hibás vagy nem támogatott fájl');return}
  if(!await ask(`A fájlban ${d.workouts.length} edzés és ${d.body.length} mérés van. Felülírja a jelenlegi adatokat?`,{title:'Importálás',ok:'Felülírás',danger:true}))return;
  if(d.v<2){addDefaults(d);d.v=2}S=d;save();applyTheme();render();toast('Importálva')}
async function resetAll(){if(!await ask('Minden edzés, mérés, sablon és saját gyakorlat törlődik erről az eszközről. Érdemes előtte exportálni.',{title:'Minden adat törlése',ok:'Tovább',danger:true}))return;
  if(!await ask('Ez nem vonható vissza. Biztosan törlöd?',{title:'Utolsó megerősítés',ok:'Végleges törlés',danger:true}))return;const th=S.settings.theme;S=defaults();S.settings.theme=th;rest=null;save();go('workout')}
async function demoData(){
  if(!await ask('Kb. 4 hónapnyi mintaadatot (edzéseket és méréseket) adok hozzá a meglévőkhöz. Később a „Minden törlése” gombbal eltávolítható.',{title:'Mintaadatok',ok:'Hozzáadás'}))return;
  const base={'Fekvenyomás (rúd)':70,'Ferde fekvenyomás (kézisúlyzó)':24,'Katonai nyomás (rúd)':42,'Oldalemelés (kézisúlyzó)':9,'Tricepsz letolás (kábel)':30,'Felhúzás (rúd)':110,'Evezés (rúd)':60,'Húzódzkodás':0,'Mellhez húzás (kábel)':55,'Bicepsz hajlítás (kézisúlyzó)':12,'Guggolás (rúd)':90,'Román felhúzás (rúd)':80,'Lábtolás (gép)':160,'Kitörés (kézisúlyzó)':18,'Vádliemelés (gép)':70,
    'KB swing (egykezes)':20,'KB swing (kétkezes)':24,'KB török felállás (get-up)':16,'KB goblet guggolás':24,'KB clean & press':16,'KB evezés':24,'KB halo':12,'KB clean':20,'KB snatch':16,'KB front rack guggolás':20,'KB windmill':12};
  const kb=n=>n.startsWith('KB ');
  const t0=new Date();t0.setHours(0,0,0,0);let wt=88,fat=23.5,waist=94,k=0;const tpls=S.templates.filter(t=>t.items.length);
  for(let i=120;i>=1;i--){const d=new Date(t0);d.setDate(d.getDate()-i);const key=ymd(d);
    wt+=-0.03+(Math.random()-.5)*.55;fat-=.018;waist-=.03;
    if(Math.random()<.8&&!S.body.some(b=>b.date===key)){const e={date:key,weight:+wt.toFixed(1)};if(d.getDay()===1){e.fat=+(fat+(Math.random()-.5)*.6).toFixed(1);e.waist=+(waist+(Math.random()-.5)).toFixed(1)}S.body.push(e)}
    if(tpls.length&&[1,2,4,6].includes(d.getDay())&&Math.random()<.85){const t=tpls[k++%tpls.length],prog=1+(120-i)*.0011;
      const st=new Date(d);st.setHours(17,30+Math.floor(Math.random()*40));
      const w={id:uid(),name:t.name,tplId:t.id,start:st.getTime(),end:st.getTime()+(45+Math.random()*30)*60000,exercises:t.items.map(it=>{const n=exName(it.exId),b=base[n]??20;
        return{exId:it.exId,sets:Array.from({length:it.sets},(_,j)=>kb(n)?{w:b+(i<50?4:0),r:n.includes('get-up')?1:n.includes('halo')||n.includes('windmill')?5:10}:b?{w:Math.round(b*prog*(Math.random()<.15?1.03:1)/2.5)*2.5,r:Math.max(3,8-j-Math.floor(Math.random()*2))}:{w:0,r:Math.round(6+(120-i)/30+Math.random()*2-j)})}})};
      w.prs=detectPRs(w);S.workouts.push(w)}}
  save();toast('Mintaadatok betöltve');render();
}

S=load();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
  const had=!!navigator.serviceWorker.controller;
  addEventListener('load',()=>navigator.serviceWorker.register('edzesnaplo-sw.js',{scope:'edzesnaplo.html'}).catch(e=>console.warn('Service worker:',e)));
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)toast('Új verzió telepítve – a következő indításkor aktív')});
}
applyTheme();render();
