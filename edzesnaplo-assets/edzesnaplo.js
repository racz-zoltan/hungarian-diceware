'use strict';
/* ===== Segédfüggvények ===== */
const $=s=>document.querySelector(s);
const DAY=864e5;
const C={blue:'var(--kj-blue-line)',gold:'var(--kj-gold-line)',violet:'var(--kj-violet)',green:'var(--kj-green-line)',red:'var(--kj-red-line)',
  // adattípusok színei – mindenhol ugyanazt jelentik (naptár, statisztika, étkezés)
  weight:'var(--c-weight)',fat:'var(--c-fat)',waist:'var(--c-waist)',steps:'var(--c-steps)',workout:'var(--c-workout)',kcal:'var(--c-kcal)',
  protein:'var(--c-protein)',carb:'var(--c-carb)',fatm:'var(--c-fatm)',fiber:'var(--c-fiber)',cardio:'var(--c-cardio)',text:'var(--kj-text)'};
const I=(n,c='')=>`<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const z2=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+z2(d.getMonth()+1)+'-'+z2(d.getDate());
const today=()=>ymd(new Date());
const pYmd=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=1)=>n==null||isNaN(n)?'–':(+n).toLocaleString('hu-HU',{maximumFractionDigits:d});
const sgn=(n,d=1)=>{if(n==null||isNaN(n))return'–';const r=Math.round(n*10**d)/10**d;return(r>0?'+':r<0?'−':'±')+fmt(Math.abs(r),d)};
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
['KB felhúzás','Kettlebell'],['KB front rack guggolás','Kettlebell'],['KB halo','Kettlebell'],['KB windmill','Kettlebell'],['KB thruster','Kettlebell'],['KB high pull','Kettlebell'],
['Fekvőtámasz','Saját testsúly'],['Pike fekvőtámasz','Saját testsúly'],['Ausztrál húzódzkodás','Saját testsúly'],['Guggolás (saját testsúly)','Saját testsúly'],
['Kitörés (saját testsúly)','Saját testsúly'],['Bolgár guggolás (saját testsúly)','Saját testsúly'],['Csípőemelés (saját testsúly)','Saját testsúly'],
['Plank (mp)','Saját testsúly'],['Hegymászó','Saját testsúly'],['Burpee','Saját testsúly'],['Superman','Saját testsúly'],
['Futás (terep)','Kardió','cardio'],['Futás (aszfalt)','Kardió','cardio'],['Futópad','Kardió','cardio'],['Kerékpár (kültéri)','Kardió','cardio'],
['Terembicikli','Kardió','cardio'],['Evezőgép','Kardió','cardio'],['Elliptikus tréner','Kardió','cardio'],['Lépcsőzőgép','Kardió','cardio'],
['Gyaloglás','Kardió','cardio'],['Túrázás','Kardió','cardio'],['Úszás','Kardió','cardio'],['Ugrókötél','Kardió','cardio'],
['Koncentrált bicepszhajlítás (kézisúlyzó)','Kar'],['Bolgár guggolás (kézisúlyzó)','Láb'],['Padlón nyomás (kézisúlyzó)','Mell'],
['Román felhúzás (kézisúlyzó)','Láb'],['Goblet guggolás (kézisúlyzó)','Láb'],['Lábemelés fekve','Törzs'],['Dead bug','Törzs']];
const DEF_TPL=[
 ['Push – mell, váll, tricepsz',[['Fekvenyomás (rúd)',3],['Ferde fekvenyomás (kézisúlyzó)',3],['Katonai nyomás (rúd)',3],['Oldalemelés (kézisúlyzó)',3],['Tricepsz letolás (kábel)',3]]],
 ['Pull – hát, bicepsz',[['Felhúzás (rúd)',3],['Evezés (rúd)',3],['Húzódzkodás',3],['Mellhez húzás (kábel)',3],['Bicepsz hajlítás (kézisúlyzó)',3]]],
 ['Láb',[['Guggolás (rúd)',3],['Román felhúzás (rúd)',3],['Lábtolás (gép)',3],['Kitörés (kézisúlyzó)',3],['Vádliemelés (gép)',3]]],
 ['Kettlebell – swing & get-up',[['KB swing (egykezes)',10],['KB török felállás (get-up)',5]]],
 ['Kettlebell – teljes test',[['KB goblet guggolás',3],['KB clean & press',3],['KB evezés',3],['KB swing (kétkezes)',3],['KB halo',2]]],
 ['Kettlebell – ballisztikus',[['KB swing (kétkezes)',5],['KB clean',4],['KB snatch',4],['KB front rack guggolás',3],['KB windmill',2]]],
 ['Saját testsúly – teljes test',[['Fekvőtámasz',3],['Guggolás (saját testsúly)',3],['Ausztrál húzódzkodás',3],['Kitörés (saját testsúly)',3],['Plank (mp)',3]]],
 ['Saját testsúly – felsőtest',[['Húzódzkodás',4],['Fekvőtámasz',4],['Tolódzkodás',3],['Pike fekvőtámasz',3],['Ausztrál húzódzkodás',3]]],
 ['Saját testsúly – láb és törzs',[['Bolgár guggolás (saját testsúly)',3],['Guggolás (saját testsúly)',3],['Csípőemelés (saját testsúly)',3],['Hegymászó',3],['Lábemelés függésben',3]]],
 ['Kardió – gépek (terem)',[['Futópad',1],['Terembicikli',1],['Evezőgép',1]]],
 ['Kardió – szabadtéri',[['Futás (terep)',1]]],
 ['Kézisúlyzó A – húzó + láb',[['Húzódzkodás',4],['Evezés (kézisúlyzó)',4],['Koncentrált bicepszhajlítás (kézisúlyzó)',3],['Bolgár guggolás (kézisúlyzó)',3],['Lábemelés fekve',3]]],
 ['Kézisúlyzó B – nyomó + láb',[['Padlón nyomás (kézisúlyzó)',4],['Oldalemelés (kézisúlyzó)',3],['Fekvőtámasz',3],['Román felhúzás (kézisúlyzó)',3],['Goblet guggolás (kézisúlyzó)',3],['Dead bug',3]]]];
const TPL_VER=n=>n.startsWith('Kardió')?5:n.startsWith('Kézisúlyzó')?4:n.startsWith('Saját testsúly')?3:n.startsWith('Kettlebell')?2:0; // melyik adatverzióban jelent meg
const DATA_V=5;
/* Eszköz szerinti címke: KB = kettlebell, ST = saját testsúly, ET = edzőterem (rúd, gép, kábel), KS = kézisúlyzó (otthon) */
const BW_NAMES=['Húzódzkodás (fordított fogás)','Húzódzkodás','Tolódzkodás','Hasprés','Lábemelés függésben','Hasgörgő','Lábemelés fekve','Dead bug'];
function exEq(e){if(!e)return null;const n=e.name;if(e.kind==='cardio')return'KA';if(e.cat==='Kettlebell'||/^KB /.test(n))return'KB';if(/\((rúd|gép|kábel)\)/.test(n))return'ET';
  if(e.cat==='Saját testsúly'||BW_NAMES.includes(n))return'ST';if(/kézisúlyzó|Kalapács/i.test(n))return'KS';return null}
const TAGS={ET:['et','Edzőterem'],KS:['ks','Kézisúlyzó (otthon)'],ST:['st','Saját testsúly'],KB:['kb','Kettlebell'],KA:['ka','Kardió']}; // ez a sorrend a sablonlistában is
const TAG_ORDER=Object.keys(TAGS);
function tplKey(t){let eq=t.items.map(i=>exEq(exById(i.exId))).filter(Boolean);if(!eq.length)return null;
  if(eq.every(x=>x==='KA'))return'KA';eq=eq.filter(x=>x!=='KA');
  return eq.includes('ET')?'ET':eq.every(x=>x==='KB'||x==='ST')&&eq.includes('KB')?'KB':eq.every(x=>x==='ST')?'ST':eq.every(x=>x==='KS'||x==='ST')?'KS':'ET'}
function tplTag(t){const k=tplKey(t);return k?`<span class="tag ${TAGS[k][0]}" title="${TAGS[k][1]}">${k}</span>`:''}
const tplRank=t=>{const k=tplKey(t);return k?TAG_ORDER.indexOf(k):TAG_ORDER.length};
const DEF_REST={'KB swing (egykezes)':45,'KB swing (kétkezes)':60,'KB snatch':60,'KB török felállás (get-up)':60};
function addDefaults(st){
  for(const[name,cat,kind]of DEF_EX){let e=st.exercises.find(x=>x.name===name);if(!e){e={id:uid(),name,cat};if(DEF_REST[name])e.rest=DEF_REST[name];st.exercises.push(e)}if(kind&&!e.kind)e.kind=kind}
  const f=n=>st.exercises.find(e=>e.name===n)?.id;
  for(const[name,items]of DEF_TPL)if(!st.templates.some(t=>t.name===name)&&(st.v===0||TPL_VER(name)>st.v))
    st.templates.push({id:uid(),name,items:items.filter(([n])=>f(n)).map(([n,s])=>({exId:f(n),sets:s}))});
}
function defaults(){const st={v:0,exercises:[],templates:[],workouts:[],body:[],meals:[],profile:{pace:1},active:null,settings:{rest:90,theme:null,sound:3,wakeLock:true,stepGoal:0}};addDefaults(st);st.v=DATA_V;return st}
const KEY='edzesnaplo.v1';
let S; // a betöltés a fájl végén történik (a validáló függvények után)
function load(){try{const raw=localStorage.getItem(KEY);if(raw){const s=sanitizeState(JSON.parse(raw));if(s.v<DATA_V){addDefaults(s);s.v=DATA_V}return s}}catch(e){console.warn('Betöltési hiba',e)}return defaults()}
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
const isCardio=id=>exById(id)?.kind==='cardio';
const setStr=(s,cardio)=>cardio?(s.w?`${fmt(s.w,2)} km · `:'')+`${s.r} perc`:s.w?`${fmt(s.w)}×${s.r}`:`${s.r} ism.`;
const prLbl=p=>isCardio(p.exId)?({w:['leghosszabb táv',' km'],r:['leghosszabb idő',' perc']}[p.type]||['rekord','']):[PRLBL[p.type],PRUNIT[p.type]];
const wSorted=()=>[...S.workouts].sort((a,b)=>a.start-b.start);
const wVolume=w=>w.exercises.reduce((a,e)=>isCardio(e.exId)?a:a+e.sets.reduce((b,s)=>b+(s.w||0)*(s.r||0),0),0);
const wCardioMin=w=>w.exercises.reduce((a,e)=>isCardio(e.exId)?a+e.sets.reduce((b,s)=>b+(s.r||0),0):a,0);
const PRLBL={w:'max súly',e:'becs. 1RM',r:'ismétlés',v:'sorozat-volumen'};
const PRUNIT={w:' kg',e:' kg',r:'',v:' kg'};

function prevSets(exId){let best=null;for(const w of S.workouts)for(const e of w.exercises)if(e.exId===exId&&(!best||w.start>best.t))best={t:w.start,sets:e.sets};return best?best.sets:[]}
function bests(sets,cardio){const b={w:0,e:0,r:0,v:0};for(const s of sets){if(s.w>b.w)b.w=s.w;if(cardio){if(s.r>b.r)b.r=s.r;continue}const e=e1rm(s.w,s.r);if(e>b.e)b.e=e;if(s.r>b.r)b.r=s.r;if(s.w*s.r>b.v)b.v=s.w*s.r}return b}
function bestsBefore(exId,ts,skipId){const all=[];for(const w of S.workouts){if(w.id===skipId||w.start>=ts)continue;for(const e of w.exercises)if(e.exId===exId)all.push(...e.sets)}return all.length?bests(all,isCardio(exId)):null}
function detectPRs(w){const out=[];for(const e of w.exercises){const prev=bestsBefore(e.exId,w.start,w.id);if(!prev)continue;const cur=bests(e.sets,isCardio(e.exId));for(const t of['w','e','r','v'])if(cur[t]>prev[t]+1e-9&&cur[t]>0)out.push({exId:e.exId,type:t,val:Math.round(cur[t]*10)/10})}return out}
function allPRs(){const m={};for(const w of wSorted())for(const e of w.exercises){const r=m[e.exId]||(m[e.exId]={w:{v:0},e:{v:0},r:{v:0},v:{v:0},n:0});r.n++;const cd=isCardio(e.exId);for(const s of e.sets){const d=w.start;if(s.w>r.w.v)r.w={v:s.w,d,s};if(cd){if(s.r>r.r.v)r.r={v:s.r,d,s};continue}const q=e1rm(s.w,s.r);if(q>r.e.v)r.e={v:q,d,s};if(s.r>r.r.v)r.r={v:s.r,d,s};if(s.w*s.r>r.v.v)r.v={v:s.w*s.r,d,s}}}return m}

/* ===== Saját párbeszédablakok (alert/confirm/prompt helyett) ===== */
let dlgResolve=null,dlgDefault=null;
function dlg(html,def=null){if(dlgResolve)dlgClose(dlgDefault);return new Promise(res=>{dlgResolve=res;dlgDefault=def;$('#dlgBox').innerHTML=html;$('#dlg').classList.add('on');setTimeout(()=>{const f=$('#dlgBox [autofocus]')||$('#dlgBox .btn.p,#dlgBox .btn.danger');f&&f.focus()},40)})}
function dlgClose(v){$('#dlg').classList.remove('on');const r=dlgResolve;dlgResolve=null;r&&r(v)}
function ask(msg,{title='Megerősítés',ok='Rendben',cancel='Mégse',danger=false}={}){
  return dlg(`<h2>${esc(title)}</h2><p>${msg}</p><div class="row end"><button class="btn" data-click="dlgClose(false)">${cancel}</button><button class="btn ${danger?'danger':'p'}" data-click="dlgClose(true)">${ok}</button></div>`,false)}
function form(title,fields,{ok='Mentés',intro=''}={}){
  const f=fields.map((x,i)=>`<label for="ff${i}">${esc(x.label)}</label>`+(x.type==='textarea'
    ?`<textarea id="ff${i}" data-f="${x.id}" rows="${x.rows||6}" placeholder="${esc(x.placeholder||'')}" ${i===0?'autofocus':''} autocomplete="off" spellcheck="false">${esc(x.value??'')}</textarea>`
    :x.type==='select'
    ?`<select id="ff${i}" data-f="${x.id}">${x.options.map(o=>`<option value="${esc(o[0])}" ${o[0]==x.value?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`
    :`<input id="ff${i}" data-f="${x.id}" type="${x.type==='number'?'text':(x.type||'text')}" value="${esc(x.value??'')}" placeholder="${esc(x.placeholder||'')}" ${x.list?`list="dl${i}"`:''} ${x.min!=null?`min="${x.min}"`:''} ${x.step?`step="${x.step}"`:''} ${x.type==='number'?'inputmode="decimal" class="mono"':''} ${i===0?'autofocus':''} autocomplete="off">`
      +(x.list?`<datalist id="dl${i}">${x.list.map(o=>`<option value="${esc(o)}">`).join('')}</datalist>`:''))
    +(x.hint?`<div class="hint">${x.hint}</div>`:'')).join('');
  return dlg(`<h2>${esc(title)}</h2>${intro?`<p class="mut small">${intro}</p>`:''}<form data-submit="formSubmit()">${f}<div class="row end"><button type="button" class="btn" data-click="dlgClose(null)">Mégse</button><button class="btn p" type="submit">${ok}</button></div></form>`,null)}
function readForm(){const o={};document.querySelectorAll('#dlgBox [data-f]').forEach(el=>o[el.dataset.f]=el.value.trim());return o}
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#dlg').classList.contains('on'))dlgClose(dlgDefault);else if($('#modal').classList.contains('on'))modalBg()});


/* ===== Eseménykezelés (CSP: nincs inline handler, nincs eval) =====
   A sablonokban data-click/input/change/submit="fn(arg,...)" áll; az argumentum csak
   literál lehet (szám, 'szöveg', null, true/false), illetve this / this.value. */
const ACT=new Set(["addMeal", "addSet", "adjRest", "bodyFromCal", "calNav", "chooseEx", "closeModal", "copyInstr", "copyMealToday", "delBody", "delEx", "delMeal", "delTemplate", "delWorkout", "demoData", "discardWorkout", "dlgBackdrop", "dlgClose", "editBodyRow", "editEx", "editMeal", "editTemplate", "exportCsv", "exportData", "finishWorkout", "foodFromCal", "foodHelp", "foodNav", "foodToday", "formSubmit", "go", "goProfile", "goToday", "importData", "importHealthFile", "importStrong", "modalBg", "moveEx", "newExFromList", "newExercise", "openHealthFile", "openImport", "openStrong", "pasteMeals", "pasteSteps", "pickForActive", "pickForTpl", "renderPick", "repeatWorkout", "resetAll", "rmEx", "rmSet", "saveAsTemplate", "saveBody", "saveTpl", "selDay", "setBodyDate", "setClaudeUrl", "setDefRest", "setExRest", "setFoodDate", "setFoodRng", "setProf", "setRange", "setSound", "setStepGoal", "setStrEx", "setStrMetric", "setTheme", "setTplName", "setTplSets", "setTrendRng", "setVal", "setWName", "setWake", "showStr", "startWorkout", "stepsHelp", "stopRest", "testSound", "toggleSet", "toggleTheme", "toggleTrend", "toggleWaist", "tplMove", "tplRemove", "updateTplFrom"]);
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
function openStrong(){$('#impStrong').click()}
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
  const o={v:num(d.v,1,99)||2,settings:{rest:num(d.settings?.rest,0,1800)??90,sound:num(d.settings?.sound,0,3)??3,claudeUrl:typeof d.settings?.claudeUrl==='string'&&/^https:\/\/claude\.ai\/[\w\-./?=&#%~]*$/.test(d.settings.claudeUrl)?d.settings.claudeUrl.slice(0,300):null,stepGoal:num(d.settings?.stepGoal,0,100000)??0,wakeLock:d.settings?.wakeLock!==false,theme:['light','dark'].includes(d.settings?.theme)?d.settings.theme:null,lastBackup:num(d.settings?.lastBackup,0,9e15)||undefined}};
  o.exercises=d.exercises.filter(e=>e&&e.name).map(e=>{const x={id:fix(e.id),name:str(e.name,100),cat:str(e.cat||'Egyéb',40)};if(e.kind==='cardio')x.kind='cardio';const r=num(e.rest,0,1800);if(r!=null&&e.rest!==''&&e.rest!=null)x.rest=r;return x});
  const sets=a=>(Array.isArray(a)?a:[]).map(s=>({w:num(s?.w,0,2000)??0,r:num(s?.r,0,10000)??0}));
  o.templates=(Array.isArray(d.templates)?d.templates:[]).filter(t=>t&&t.name).map(t=>({id:fix(t.id),name:str(t.name,100),items:(Array.isArray(t.items)?t.items:[]).map(i=>({exId:fix(i?.exId),sets:num(i?.sets,1,30)||3}))}));
  o.workouts=d.workouts.filter(w=>w&&num(w.start,0,9e15)).map(w=>({id:fix(w.id),name:str(w.name||'Edzés',100),start:+w.start,end:num(w.end,0,9e15)||+w.start,tplId:w.tplId?fix(w.tplId):null,
    exercises:(Array.isArray(w.exercises)?w.exercises:[]).map(e=>({exId:fix(e?.exId),sets:sets(e?.sets)})),
    prs:(Array.isArray(w.prs)?w.prs:[]).filter(p=>p&&['w','e','r','v'].includes(p.type)).map(p=>({exId:fix(p.exId),type:p.type,val:num(p.val,0,1e7)||0}))}));
  o.body=(Array.isArray(d.body)?d.body:[]).filter(b=>b&&DATE_RE.test(b.date)).map(b=>{const x={date:b.date};const w=num(b.weight,20,400),f=num(b.fat,2,70),wa=num(b.waist,30,250),st=num(b.steps,0,200000);if(w!=null)x.weight=w;if(f!=null)x.fat=f;if(wa!=null)x.waist=wa;if(st!=null)x.steps=Math.round(st);return x}).filter(b=>Object.keys(b).length>1);
  o.meals=(Array.isArray(d.meals)?d.meals:[]).filter(m=>m&&DATE_RE.test(m.date)&&m.name).map(m=>({id:fix(m.id),date:m.date,meal:MEALS.some(x=>x[0]===m.meal)?m.meal:'nasi',name:str(m.name,100),kcal:Math.round(num(m.kcal,0,10000)??0),p:num(m.p,0,1000)??0,c:num(m.c,0,1000)??0,f:num(m.f,0,1000)??0,fib:m.fib==null||m.fib===''?null:num(m.fib,0,500)}));
  {const pr=d.profile||{};o.profile={sex:['m','f'].includes(pr.sex)?pr.sex:null,birthYear:num(pr.birthYear,1900,new Date().getFullYear())||null,height:num(pr.height,100,250)||null,
    activity:ACT_LV.some(a=>a[0]===+pr.activity)?+pr.activity:null,goal:GOALS.some(g=>g[0]===pr.goal)?pr.goal:null,pace:[0,1,2].includes(+pr.pace)?+pr.pace:1,
    targetWeight:num(pr.targetWeight,30,300)||null,kcalOverride:num(pr.kcalOverride,800,6000)||null}}
  const a=d.active;
  o.active=a&&num(a.start,0,9e15)?{id:fix(a.id),name:str(a.name,100),start:+a.start,tplId:a.tplId?fix(a.tplId):null,exercises:(Array.isArray(a.exercises)?a.exercises:[]).map(e=>({exId:fix(e?.exId),sets:(Array.isArray(e?.sets)?e.sets:[]).map(s=>({w:s?.w===''?'':num(s?.w,0,2000)??'',r:s?.r===''?'':num(s?.r,0,10000)??'',done:!!s?.done}))}))}:null;
  return o;
}

/* ===== Navigáció, keret ===== */
function go(t){document.activeElement&&document.activeElement.blur&&document.activeElement.blur();tab=t;render();scrollTo(0,0)}
function render(){
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
  $('#title').textContent={workout:S.active?'Edzés folyamatban':'Edzés',food:'Étkezés',history:'Naptár',body:'Testadatok',stats:'Statisztika',more:'Beállítások'}[tab];
  $('#hdr').innerHTML=S.active&&tab!=='workout'?`<button class="pill" data-click="go('workout')" aria-label="Edzés folytatása">${I('biceps-flexed','sm')}<span id="elapsed2"></span></button>`:'';
  for(const k in CH)delete CH[k];
  $('main').innerHTML=({workout:S.active?vActive:vWorkout,food:vFood,history:vHistory,body:vBody,stats:vStats,more:vMore})[tab]();
  attachCharts();tick();updAvol();syncWake();updWakeUI();
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
function profileMissing(){const p=S.profile;return[[!p.sex,'nem'],[!p.birthYear,'születési év'],[!p.height,'magasság'],[!p.activity,'aktivitás']].filter(x=>x[0]).map(x=>x[1])}
function profileNag(){
  if(!profileMissing().length)return '';
  return `<div class="card" style="border-color:var(--kj-gold-line);background:var(--kj-gold-soft)"><div class="row" style="flex-wrap:nowrap"><span style="color:var(--kj-gold)">${I('target')}</span><span style="flex:1" class="small">A személyes egészségcélok elérése érdekében töltsd ki a profiladatokat.</span><button class="btn sm p" data-click="goProfile()">${I('settings','sm')} Beállítások</button></div></div>`;
}
function goProfile(){go('more');const el=$('#profile');if(el){el.scrollIntoView({block:"start"});}}
function relDay(ts){const a=new Date(ts);a.setHours(0,0,0,0);const b=new Date();b.setHours(0,0,0,0);const n=Math.round((b-a)/DAY);
  return n<=0?'ma':n===1?'tegnap':n<7?n+' napja':n<30?Math.floor(n/7)+' hete':n<365?Math.floor(n/30)+' hónapja':Math.floor(n/365)+' éve'}
function tplCard(t,last,uses){
  const tag=tplTag(t);
  return `<div class="card"><div class="row" style="flex-wrap:nowrap"><h2 style="flex:1;margin:0;font-size:17px">${esc(t.name)} ${tag}</h2><button class="btn sm ico" data-click="editTemplate('${t.id}')" aria-label="Sablon szerkesztése">${I('pencil','sm')}</button></div>
  <div class="mut small" style="margin:7px 0 12px">${t.items.map(it=>`<span class="mono">${it.sets}×</span> ${esc(exName(it.exId))}`).join(' · ')||'Üres sablon'}</div>
  <div class="row"><span class="mut small">${last?`Utoljára: <b style="color:var(--kj-text)">${relDay(last)}</b> · ${fmtDate(last)} · ${uses}×`:'Még nem használt'}</span><span class="sp"></span><button class="btn p sm" data-click="startWorkout('${t.id}')">${I('dumbbell','sm')} Indítás</button></div></div>`;
}
function vWorkout(){
  const lastOf={},uses={};for(const w of S.workouts)if(w.tplId){lastOf[w.tplId]=Math.max(lastOf[w.tplId]||0,w.start);uses[w.tplId]=(uses[w.tplId]||0)+1}
  const used=S.templates.filter(t=>lastOf[t.id]).sort((a,b)=>lastOf[b.id]-lastOf[a.id]),fresh=S.templates.filter(t=>!lastOf[t.id]).map((t,i)=>[t,i]).sort((a,b)=>tplRank(a[0])-tplRank(b[0])||a[1]-b[1]).map(x=>x[0]);
  let h=profileNag()+backupNag()+`<div class="card"><button class="btn p block" data-click="startWorkout()">${I('plus')} Üres edzés indítása</button><div class="hint" style="text-align:center">Befejezés után a dátummal és időponttal elmentődik az Edzéseim közé – onnan átnevezhető, módosítható, törölhető.</div></div>`;
  if(used.length){h+=`<h3 style="margin:8px 2px 10px">Edzéseim</h3>`;used.forEach(t=>h+=tplCard(t,lastOf[t.id],uses[t.id]))}
  h+=`<div class="row" style="margin:${used.length?18:6}px 2px 10px"><h3 style="margin:0">Sablonok</h3><span class="sp"></span><button class="btn sm gold" data-click="editTemplate()">${I('plus','sm')} Új sablon</button></div>`;
  h+=`<div class="taglegend">${Object.entries(TAGS).map(([k,[c,l]])=>`<span><span class="tag ${c}">${k}</span> ${l}</span>`).join('')}</div>`;
  if(!fresh.length)h+=`<div class="card mut small">${S.templates.length?'Minden sablon használatban van – fent, az Edzéseim között találod őket.':'Még nincs sablon.'}</div>`;
  fresh.forEach(t=>h+=tplCard(t,0,0));
  const rec=wSorted().reverse().slice(0,3);
  if(rec.length){h+=`<h3 style="margin:20px 2px 10px">Legutóbbi edzések</h3>`;rec.forEach(w=>h+=workoutCard(w));}
  return h;
}
function workoutCard(w,actions=true){
  const mins=Math.max(1,Math.round((w.end-w.start)/60000)),nSets=w.exercises.reduce((a,e)=>a+e.sets.length,0);
  return `<div class="card"><div class="row" style="flex-wrap:nowrap"><h2 style="flex:1;margin:0;font-size:16.5px">${esc(w.name)}</h2><span class="mut small mono">${fmtDate(w.start)} · ${fmtTime(w.start)}</span></div>
  <div class="sum"><span>${I('timer','sm')} ${mins} perc</span>·${wVolume(w)?`<span>${fmt(wVolume(w),0)} kg volumen</span>·`:''}${wCardioMin(w)?`<span>${fmt(wCardioMin(w),0)} perc kardió</span>·`:''}<span>${nSets} sorozat</span></div>
  ${w.exercises.map(e=>`<div class="exl"><span>${esc(exName(e.exId))}</span><span>${e.sets.map(x=>setStr(x,isCardio(e.exId))).join(', ')}</span></div>`).join('')}
  ${w.prs?.length?`<div>${w.prs.map(p=>`<span class="badge">${I('trophy','sm')} ${esc(exName(p.exId))} – ${prLbl(p)[0]}: ${fmt(p.val)}${prLbl(p)[1]}</span>`).join('')}</div>`:''}
  ${actions?`<div class="row" style="margin-top:12px"><button class="btn sm" data-click="repeatWorkout('${w.id}')">${I('rotate-ccw','sm')} Ismétlés</button><button class="btn sm" data-click="saveAsTemplate('${w.id}')">${I('save','sm')} Sablonként</button><span class="sp"></span><button class="btn sm d ico" data-click="delWorkout('${w.id}')" aria-label="Edzés törlése">${I('trash-2','sm')}</button></div>`:''}</div>`;
}

/* ===== Aktív edzés ===== */
async function startWorkout(t){
  if(typeof t==='string')t=S.templates.find(x=>x.id===t);
  if(S.active&&!await ask('Már fut egy edzés. Elveted, és újat indítasz? A rögzített sorozatai elvesznek.',{title:'Futó edzés',ok:'Elvetés és új',danger:true}))return;
  const now=new Date(),autoName=`Edzés – ${now.getFullYear()}.${z2(now.getMonth()+1)}.${z2(now.getDate())}. ${z2(now.getHours())}:${z2(now.getMinutes())}`;
  S.active={id:uid(),name:t?.name||autoName,start:Date.now(),tplId:t?.id||null,
    exercises:(t?.items||[]).filter(it=>exById(it.exId)).map(it=>({exId:it.exId,sets:Array.from({length:it.sets||3},()=>({w:'',r:'',done:false}))}))};
  rest=null;save();go('workout');
}
function vActive(){
  const a=S.active;
  let h=`<div class="card"><input value="${esc(a.name)}" data-input="setWName(this.value)" style="font:800 17px var(--display)" aria-label="Edzés neve">
  <div class="row" style="margin-top:10px"><span class="mut">${I('timer','sm')} <b id="elapsed" class="mono" style="color:var(--kj-text)">0:00</b></span><span class="mut small" id="wakeInd" hidden title="A képernyő nem kapcsol ki edzés közben">${I('smartphone','sm')} ébren</span><span class="sp"></span><span class="mut small mono" id="avol"></span></div></div>`;
  a.exercises.forEach((e,i)=>{
    const prev=prevSets(e.exId),pb=bestsBefore(e.exId,Infinity),ex=exById(e.exId),custom=ex?.rest!=null,cd=ex?.kind==='cardio';
    h+=`<div class="card"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0"><div class="ex-title">${esc(exName(e.exId))}</div>
    <button class="restbtn ${custom?'custom':''}" data-click="setExRest('${e.exId}')" title="Pihenőidő ennél a gyakorlatnál">${I('timer','sm')} ${fmtSec(exRest(e.exId))}${custom?'':' · alap'}</button></div>
    <button class="btn sm ico" data-click="moveEx(${i},-1)" aria-label="Fel">${I('arrow-up','sm')}</button><button class="btn sm ico" data-click="moveEx(${i},1)" aria-label="Le">${I('arrow-down','sm')}</button><button class="btn sm ico d" data-click="rmEx(${i})" aria-label="Eltávolítás">${I('x','sm')}</button></div>
    <table class="sets"><tr><th>#</th><th>Előző</th><th>${cd?'km':'kg'}</th><th>${cd?'Perc':'Ism.'}</th><th></th></tr>
    ${e.sets.map((s,j)=>{const p=prev[j]||prev[prev.length-1];return `<tr class="${s.done?'done':''}" id="r${i}_${j}"><td class="mut">${j+1}</td><td class="mut">${prev[j]?setStr(prev[j],cd):'–'}</td>
      <td><input type="number" inputmode="decimal" step="${cd?'0.01':'0.5'}" min="0" value="${s.w}" placeholder="${p?p.w:''}" data-input="setVal(${i},${j},'w',this.value)" aria-label="${cd?'Táv (km)':'Súly'}"></td>
      <td><input type="number" inputmode="numeric" step="1" min="0" value="${s.r}" placeholder="${p?p.r:''}" data-input="setVal(${i},${j},'r',this.value)" aria-label="${cd?'Idő (perc)':'Ismétlés'}"></td>
      <td><button class="chk" data-click="toggleSet(${i},${j})" aria-label="Sorozat kész">${I('check','sm')}</button></td></tr>`}).join('')}
    </table><div class="row" style="margin-top:8px"><button class="btn sm" data-click="addSet(${i})">${I('plus','sm')} Sorozat</button><button class="btn sm" data-click="rmSet(${i})">${I('minus','sm')} Sorozat</button><span class="sp"></span>
    <span class="mut small">${pb&&cd?`${I('trophy','sm')} <span class="mono">${pb.w?fmt(pb.w,1)+' km · ':''}${pb.r} perc</span>`:pb?(pb.w?`${I('trophy','sm')} <span class="mono">${fmt(pb.w)} kg · 1RM ~${fmt(pb.e,0)}</span>`:`${I('trophy','sm')} <span class="mono">${pb.r} ism.</span>`):'Első alkalom'}</span></div></div>`;
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
    if(s.r===''||!(+s.r>0)){toast(isCardio(e.exId)?'Add meg az időt (perc)':'Add meg az ismétlésszámot');return}
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
  const cMin=exs.reduce((t,e)=>isCardio(e.exId)?t+e.sets.reduce((u,x)=>u+x.r,0):t,0); // utólag rögzített kardiónál az időtartam legalább a kardió ideje
  const w={id:a.id,name:(a.name||'').trim()||'Edzés',start:a.start,end:Math.max(Date.now(),a.start+cMin*60000),tplId:a.tplId,exercises:exs};
  w.prs=detectPRs(w);
  let created=false;
  if(!w.tplId||!S.templates.some(x=>x.id===w.tplId)){ // üres (vagy törölt sablonból indított) edzés: mentés az Edzéseim közé
    const nt={id:uid(),name:w.name,items:w.exercises.map(e=>({exId:e.exId,sets:e.sets.length}))};S.templates.push(nt);w.tplId=nt.id;created=true}
  S.workouts.push(w);S.active=null;rest=null;save();render();
  const t=!created&&S.templates.find(x=>x.id===w.tplId);
  openModal(`<h2 style="display:flex;gap:8px;align-items:center">${I('party-popper')} Edzés kész!</h2>${workoutCard(w,false)}
  <div class="row">${t?`<button class="btn" data-click="updateTplFrom('${w.id}')">${I('save','sm')} Sablon frissítése</button>`:`<span class="small mut">${I('save','sm')} Elmentve az Edzéseim közé</span>`}<span class="sp"></span><button class="btn p" data-click="closeModal()">Rendben</button></div>`);
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
/* Hang: iOS-en az AudioContext csak felhasználói érintésre indulhat el, ezért egyetlen
   kontextust használunk, amit minden érintéskor feloldunk (resume + néma puffer). */
let AC=null;
function audioCtx(){if(!AC){const K=window.AudioContext||window.webkitAudioContext;if(!K)return null;try{AC=new K()}catch(e){return null}}return AC}
function unlockAudio(){const ac=audioCtx();if(!ac||ac.state==='running')return;ac.resume().catch(()=>{});try{const b=ac.createBuffer(1,1,22050),src=ac.createBufferSource();src.buffer=b;src.connect(ac.destination);src.start(0)}catch(e){}}
['pointerdown','touchend','keydown'].forEach(t=>document.addEventListener(t,unlockAudio,{passive:true,capture:true}));
const VOL=[0,.35,.7,1];
function chime(level){
  const v=VOL[level??S.settings.sound??3];if(!v)return;const ac=audioCtx();if(!ac)return;if(ac.state!=='running')ac.resume().catch(()=>{});
  const t0=ac.currentTime+.03,master=ac.createGain(),comp=ac.createDynamicsCompressor();master.gain.value=v;master.connect(comp);comp.connect(ac.destination);
  [[880,0],[1174.66,.17],[1760,.34]].forEach(([f,dt])=>{for(const[type,amp]of[['sine',.9],['triangle',.15]]){
    const o=ac.createOscillator(),g=ac.createGain(),t=t0+dt;o.type=type;o.frequency.value=f;o.connect(g);g.connect(master);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(amp,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+1.1);o.start(t);o.stop(t+1.15)}});
}
/* Képernyő ébren tartása edzés közben (Screen Wake Lock API, iOS 16.4+).
   A rendszer elengedi a zárat, ha az app háttérbe kerül – visszatéréskor újrakérjük. */
let WL=null,wlPending=false;
const wakeSupported=()=>'wakeLock' in navigator;
async function wakeOn(){
  if(WL||wlPending||!wakeSupported()||document.visibilityState!=='visible')return;
  wlPending=true;
  try{WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null;updWakeUI()})}catch(e){WL=null}
  wlPending=false;
  if(WL&&!(S.active&&S.settings.wakeLock!==false))wakeOff(); // közben véget ért az edzés
  updWakeUI();
}
function wakeOff(){if(WL){const w=WL;WL=null;w.release().catch(()=>{})}updWakeUI()}
function syncWake(){if(S.active&&S.settings.wakeLock!==false)wakeOn();else if(WL)wakeOff()}
function updWakeUI(){const el=$('#wakeInd');if(el)el.hidden=!WL}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncWake()});
document.addEventListener('pointerdown',()=>{if(S.active&&!WL)syncWake()},{passive:true});
function setClaudeUrl(v){v=String(v||'').trim();if(v&&!/^https:\/\/claude\.ai\/[\w\-./?=&#%~]*$/.test(v)){toast('Csak https://claude.ai/ kezdetű link adható meg');render();return}S.settings.claudeUrl=v||null;save();toast(v?'Link mentve':'Link törölve')}
function setStepGoal(v){S.settings.stepGoal=Math.max(0,Math.min(100000,parseInt(v)||0));save();toast('Mentve')}
function setWake(v){S.settings.wakeLock=v;save();render()}
function setSound(v){S.settings.sound=v;save();render();if(v)chime(v)}
function testSound(){unlockAudio();chime()}
function tick(){
  if(S.active){const t=dur(Date.now()-S.active.start);const a=$('#elapsed'),b=$('#elapsed2');if(a)a.textContent=t;if(b)b.textContent=t}
  const rb=$('#rest');document.body.classList.toggle('resting',!!rest);
  if(rest){const left=Math.ceil((rest.end-Date.now())/1000);
    if(left<=0){rest=null;rb.classList.remove('on');try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}chime();toast('Pihenő vége – következő sorozat!')}
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
const CAT_LAST=['Saját testsúly','Kettlebell'],catSort=(a,b)=>(CAT_LAST.indexOf(a)-CAT_LAST.indexOf(b))||a.localeCompare(b,'hu');
function renderPick(){
  const q=($('#exq').value||'').toLowerCase().trim();
  const list=S.exercises.filter(e=>e.name.toLowerCase().includes(q)||e.cat.toLowerCase().includes(q)).sort(byName);
  const cats=[...new Set(list.map(e=>e.cat))].sort(catSort);
  $('#exlist').innerHTML=cats.map(c=>`<div class="cat">${esc(c)}</div>`+list.filter(e=>e.cat===c).map(e=>`<button class="exi" data-click="chooseEx('${e.id}')"><span>${esc(e.name)}</span>${e.rest!=null?`<span class="mut small mono">${I('timer','sm')} ${fmtSec(e.rest)}</span>`:''}</button>`).join('')).join('')||'<div class="mut" style="padding:12px 0">Nincs találat – hozd létre új gyakorlatként.</div>';
}
function chooseEx(id){const cb=pickCb;pickCb=pickCancel=null;closeModal();cb&&cb(id)}
function exFields(e={}){const cats=[...new Set(S.exercises.map(x=>x.cat))].sort(catSort);
  return[{id:'name',label:'Név',value:e.name||'',placeholder:'pl. KB egykezes evezés'},{id:'cat',label:'Izomcsoport / kategória',value:e.cat||'',list:cats,placeholder:'pl. Hát, Kettlebell'},
    {id:'kind',label:'Típus',type:'select',value:e.kind||'strength',options:[['strength','Erőedzés (súly × ismétlés)'],['cardio','Kardió (táv km × idő perc)']]},
    {id:'rest',label:'Pihenőidő (mp)',type:'number',min:0,step:5,value:e.rest??'',placeholder:`alapértelmezett: ${S.settings.rest} mp`,hint:'Üresen: az alapértelmezett pihenőidőt használja.'}]}
function applyEx(e,r){e.name=r.name;e.cat=r.cat||'Egyéb';if(r.kind==='cardio')e.kind='cardio';else delete e.kind;if(r.rest==='')delete e.rest;else e.rest=Math.max(0,Math.min(1800,parseInt(r.rest)||0))}
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
  const mDay=new Set(S.meals.map(m=>m.date));
  let cells=['H','K','SZE','CS','P','SZO','V'].map(d=>`<div class="h">${d}</div>`).join('');
  for(let i=0;i<cellsN;i++){const d=new Date(y,m,1-off+i),k=ymd(d);
    cells+=`<div class="d ${d.getMonth()!==m?'o':''} ${k===today()?'t':''} ${k===calSel?'sel':''}" data-click="selDay('${k}')">${d.getDate()}<div class="dots">${wDay[k]?`<i class="dot" style="background:${C.workout}"></i>`:''}${hasMeas(bMap[k])?`<i class="dot" style="background:${C.weight}"></i>`:''}${bMap[k]?.steps!=null?`<i class="dot" style="background:${C.steps}"></i>`:''}${mDay.has(k)?`<i class="dot" style="background:${C.kcal}"></i>`:''}</div></div>`}
  const mW=S.workouts.filter(w=>{const d=new Date(w.start);return d.getFullYear()===y&&d.getMonth()===m});
  const mB=S.body.filter(b=>{const d=pYmd(b.date);return d.getFullYear()===y&&d.getMonth()===m&&b.weight!=null}).sort((a,b)=>a.date<b.date?-1:1);
  const mDelta=mB.length>1?mB[mB.length-1].weight-mB[0].weight:null;
  let h=`<div class="card"><div class="row" style="margin-bottom:12px;flex-wrap:nowrap"><button class="iconbtn" data-click="calNav(-1)" aria-label="Előző hónap">${I('chevron-left')}</button><h2 style="flex:1;text-align:center;margin:0;text-transform:capitalize">${first.toLocaleDateString('hu-HU',{year:'numeric',month:'long'})}</h2><button class="iconbtn" data-click="calNav(1)" aria-label="Következő hónap">${I('chevron-right')}</button></div>
  <div class="cal">${cells}</div>
  <div class="legend" style="margin-top:12px"><span><i style="background:${C.workout}"></i>Edzés</span><span><i style="background:${C.weight}"></i>Testmérés</span><span><i style="background:${C.steps}"></i>Lépés</span><span><i style="background:${C.kcal}"></i>Étkezés</span><span class="sp"></span><button class="btn sm" data-click="goToday()">Ma</button></div></div>
  <div class="grid3" style="margin-bottom:12px">${stat('Edzés a hónapban',mW.length)}${stat('Volumen',mW.length?fmtShort(mW.reduce((a,w)=>a+wVolume(w),0))+' kg':null)}${stat('Súlyváltozás',mDelta==null?null:sgn(mDelta)+' kg')}</div>`;
  const dw=(wDay[calSel]||[]).sort((a,b)=>a.start-b.start),db=bMap[calSel];
  h+=`<h3 style="margin:8px 2px 10px">${pYmd(calSel).toLocaleDateString('hu-HU',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}</h3>`;
  h+=`<div class="card"><div class="row"><h2 style="flex:1;margin:0;font-size:16.5px">${I('scale','sm')} Testadatok</h2><button class="btn sm" data-click="bodyFromCal('${calSel}')">${db?I('pencil','sm')+' Szerkesztés':I('plus','sm')+' Rögzítés'}</button></div>
  ${db?`<div class="grid3" style="margin-top:12px">${stat('Súly',db.weight!=null?fmt(db.weight)+' kg':null)}${stat('Testzsír',db.fat!=null?fmt(db.fat)+' %':null)}${stat('Derék',db.waist!=null?fmt(db.waist)+' cm':null)}</div>
  ${db.steps!=null?`<div class="stat" style="margin-top:8px"><b>${I('footprints','sm')} ${fmt(db.steps,0)}</b><span>Lépés${S.settings.stepGoal?` · cél: ${fmt(S.settings.stepGoal,0)} (${Math.round(db.steps/S.settings.stepGoal*100)}%)`:''}</span></div>`:''}`:'<div class="mut small" style="margin-top:6px">Nincs mérés erre a napra.</div>'}</div>`;
  {const dm=dayMeals(calSel),s=sumMeals(dm),t=targets();
   h+=`<div class="card"><div class="row"><h2 style="flex:1;margin:0;font-size:16.5px">${I('utensils','sm')} Étkezés</h2><button class="btn sm" data-click="foodFromCal('${calSel}')">${dm.length?'Megnyitás':I('plus','sm')+' Rögzítés'}</button></div>
   ${dm.length?`<div class="grid4" style="margin-top:12px">${stat('kcal'+(t.kcal?' / '+fmt(t.kcal,0):''),fmt(s.kcal,0))}${stat('Fehérje',fmt(s.p,0)+' g')}${stat('Szénh.',fmt(s.c,0)+' g')}${stat('Zsír',fmt(s.f,0)+' g')}</div><div class="hint">Rost: ${fmt(s.fib,0)} g · ${dm.length} tétel: ${dm.slice(0,4).map(m=>esc(m.name)).join(', ')}${dm.length>4?'…':''}</div>`:'<div class="mut small" style="margin-top:6px">Nincs rögzített étkezés.</div>'}</div>`;}
  h+=dw.length?dw.map(w=>workoutCard(w)).join(''):`<div class="card mut small">Nincs edzés erre a napra.</div>`;
  return h;
}

/* ===== Profil, célok, javasolt energia- és makrócél =====
   BMR: Mifflin–St Jeor. TDEE = BMR × aktivitási szorzó. Cél = TDEE + célhoz tartozó korrekció.
   Fehérje: g/ttkg a cél szerint (túlsúlynál BMI 27,5-höz tartozó referencia-testsúllyal), zsír: az energia 25–30%-a
   (legalább 0,6 g/ttkg), szénhidrát: a maradék. Alsó határ: nő 1200, férfi 1500 kcal. */
const ACT_LV=[[1.2,'Ülő – irodai munka, kevés mozgás'],[1.375,'Enyhén aktív – heti 1–3 edzés'],[1.55,'Mérsékelten aktív – heti 3–5 edzés'],[1.725,'Nagyon aktív – heti 6–7 edzés'],[1.9,'Extrém – fizikai munka + edzés']];
const GOALS=[['lose','Fogyás'],['maintain','Szinten tartás'],['muscle','Izomépítés'],['gain','Hízás']];
const ADJ={lose:[-300,-500,-750],maintain:[0,0,0],muscle:[150,250,400],gain:[300,500,700]};
const PACE=['Enyhe','Közepes','Gyors'];
const PPK={lose:2.0,maintain:1.6,muscle:1.9,gain:1.7},FATPCT={lose:.25,maintain:.30,muscle:.25,gain:.30};
const lastWeight=()=>{const s=series('weight');return s.length?s[s.length-1].y:null};
const r5=v=>Math.round(v/50)*50;
function targets(){
  const p=S.profile||{},w=lastWeight(),age=p.birthYear?new Date().getFullYear()-p.birthYear:null,goal=p.goal||'maintain';
  const missing=[];if(!p.sex)missing.push('nem');if(!p.birthYear)missing.push('születési év');if(!p.height)missing.push('magasság');if(!p.activity)missing.push('aktivitás');if(!w)missing.push('testsúly (Test fül)');
  const t={missing,goal,w,age,adult:age==null||age>=18};
  if(!missing.length&&t.adult){
    t.bmr=Math.round(10*w+6.25*p.height-5*age+(p.sex==='m'?5:-161));
    t.tdee=Math.round(t.bmr*p.activity);
    t.adj=ADJ[goal][p.pace??1];
    t.suggested=r5(t.tdee+t.adj);t.floor=p.sex==='f'?1200:1500;
    if(t.suggested<t.floor){t.suggested=t.floor;t.floored=true}
  }
  t.kcal=p.kcalOverride||t.suggested||null;t.custom=!!p.kcalOverride;
  if(t.kcal){
    const refW=w?(p.height?Math.min(w,27.5*(p.height/100)**2):w):null;
    t.p=refW?Math.round(refW*PPK[goal]):Math.round(t.kcal*.25/4);
    t.f=Math.round(t.kcal*FATPCT[goal]/9);if(w)t.f=Math.max(t.f,Math.round(.6*w));
    t.c=Math.max(0,Math.round((t.kcal-t.p*4-t.f*9)/4));
    t.fib=Math.max(25,Math.round(t.kcal/1000*14));
  }
  return t;
}
function setProf(k,v){
  const p=S.profile;
  if(k==='sex')p.sex=['m','f'].includes(v)?v:null;
  else if(k==='birthYear'){const y=parseInt(v);p.birthYear=y>=1900&&y<=new Date().getFullYear()?y:null}
  else if(k==='height'){const h=parseFloat(String(v).replace(',','.'));p.height=h>=100&&h<=250?h:null}
  else if(k==='activity'){const a=parseFloat(v);p.activity=ACT_LV.some(x=>x[0]===a)?a:null}
  else if(k==='goal')p.goal=GOALS.some(g=>g[0]===v)?v:null;
  else if(k==='pace')p.pace=[0,1,2].includes(+v)?+v:1;
  else if(k==='targetWeight'){const t=parseFloat(String(v).replace(',','.'));p.targetWeight=t>=30&&t<=300?t:null}
  else if(k==='kcalOverride'){const c=parseInt(v);p.kcalOverride=c>=800&&c<=6000?c:null;if(v!==''&&!p.kcalOverride)toast('800–6000 kcal között adható meg')}
  save();render();
}
function vProfile(){
  const p=S.profile,t=targets(),y=new Date().getFullYear();
  const chip=(k,v,l,on)=>`<button class="chip ${on?'on':''}" data-click="setProf('${k}','${v}')">${l}</button>`;
  let warn='';
  if(p.targetWeight&&t.w){const d=t.w-p.targetWeight;
    if(p.goal==='lose'&&d<=0)warn='A célsúly nem kisebb a jelenlegi súlynál, közben a cél fogyás.';
    if(p.goal==='gain'&&d>=0)warn='A célsúly nem nagyobb a jelenlegi súlynál, közben a cél hízás.';}
  let res='';
  if(!t.adult)res=`<div class="hint">A javasolt érték felnőttekre (18+) vonatkozik.</div>`;
  else if(t.missing.length&&!t.kcal)res=`<div class="hint">A javasolt értékhez hiányzik: ${t.missing.join(', ')}.</div>`;
  else res=`<div class="grid3" style="margin-top:12px">${stat('Alapanyagcsere (BMR)',t.bmr?fmt(t.bmr,0)+' kcal':null)}${stat('Napi energiaigény',t.tdee?fmt(t.tdee,0)+' kcal':null)}${stat(t.custom?'Saját napi érték':(t.goal==='lose'?'Javasolt napi keret':'Javasolt napi bevitel'),fmt(t.kcal,0)+' kcal','neg')}</div>
    <div class="grid4" style="margin-top:8px">${stat('Fehérje',fmt(t.p,0)+' g')}${stat('Szénhidrát',fmt(t.c,0)+' g')}${stat('Zsír',fmt(t.f,0)+' g')}${stat('Rost (min.)',fmt(t.fib,0)+' g')}</div>
    <div class="hint">${t.tdee?`Energiaigény: Mifflin–St Jeor × aktivitás. Korrekció a célhoz: ${t.adj>0?'+':''}${t.adj} kcal (${t.adj<0?'kb. '+fmt(-t.adj*7/7700,2)+' kg/hét fogyás':t.adj>0?'kb. '+fmt(t.adj*7/7700,2)+' kg/hét gyarapodás':'súlytartás'}).`:''}
    ${t.floored?` A javaslat elérte az alsó határt (${t.floor} kcal), ennél kevesebbet nem javaslok.`:''}
    Fehérje: ${PPK[t.goal]} g/ttkg${p.height&&t.w&&t.w>27.5*(p.height/100)**2?' (referencia-testsúlyra)':''}, zsír: az energia ${Math.round(FATPCT[t.goal]*100)}%-a, szénhidrát: a maradék, rost: 14 g / 1000 kcal, de legalább 25 g (ebből a több is jó). Tájékoztató becslés, nem orvosi tanács – egészségügyi állapot esetén egyeztesd szakemberrel.</div>`;
  return `<div class="card" id="profile" style="scroll-margin-top:72px"><h2>${I('target','sm')} Profil és célok</h2>
  <label>Nem</label><div class="chips" style="margin:0">${chip('sex','m','Férfi',p.sex==='m')}${chip('sex','f','Nő',p.sex==='f')}</div>
  <div class="grid3" style="align-items:end"><div><label for="pby">Születési év${p.birthYear?` · ${y-p.birthYear} év`:''}</label><input id="pby" type="number" inputmode="numeric" min="1900" max="${y}" value="${p.birthYear??''}" placeholder="pl. 1980" data-change="setProf('birthYear',this.value)"></div>
  <div><label for="pht">Magasság (cm)</label><input id="pht" type="number" inputmode="decimal" value="${p.height??''}" placeholder="pl. 178" data-change="setProf('height',this.value)"></div>
  <div><label for="ptw">Célsúly (kg)</label><input id="ptw" type="number" inputmode="decimal" step="0.5" value="${p.targetWeight??''}" placeholder="opcionális" data-change="setProf('targetWeight',this.value)"></div></div>
  <label for="pact">Aktivitás</label><select id="pact" data-change="setProf('activity',this.value)"><option value="">– válassz –</option>${ACT_LV.map(([v,l])=>`<option value="${v}" ${p.activity===v?'selected':''}>${l}</option>`).join('')}</select>
  <label>Cél</label><div class="chips" style="margin:0">${GOALS.map(([v,l])=>chip('goal',v,l,(p.goal||'maintain')===v)).join('')}</div>
  ${p.goal&&p.goal!=='maintain'?`<label>Tempó</label><div class="chips" style="margin:0">${PACE.map((l,i)=>`<button class="chip ${(p.pace??1)===i?'on':''}" data-click="setProf('pace',${i})">${l} (${ADJ[p.goal][i]>0?'+':''}${ADJ[p.goal][i]} kcal)</button>`).join('')}</div>`:''}
  <label for="pkc">Saját napi kalóriaérték (kcal)</label><input id="pkc" type="number" inputmode="numeric" value="${p.kcalOverride??''}" placeholder="üresen: a javasolt érték" data-change="setProf('kcalOverride',this.value)">
  ${warn?`<div class="hint" style="color:var(--kj-red)">${warn}</div>`:''}
  ${res}</div>`;
}

/* ===== Étkezés ===== */
const MEALS=[['reggeli','Reggeli'],['tizorai','Tízórai'],['ebed','Ebéd'],['uzsonna','Uzsonna'],['vacsora','Vacsora'],['nasi','Nasi / egyéb']];
const mealLbl=k=>(MEALS.find(m=>m[0]===k)||MEALS[5])[1];
const deacc=t=>String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function mealKey(t){t=deacc(t).trim();if(/^(regg|breakf)/.test(t))return'reggeli';if(/^(tiz|brunch)/.test(t))return'tizorai';if(/^(ebed|lunch)/.test(t))return'ebed';if(/^uzs/.test(t))return'uzsonna';if(/^(vacs|dinner|supper)/.test(t))return'vacsora';return'nasi'}
function guessMeal(){const h=new Date().getHours();return h<10?'reggeli':h<12?'tizorai':h<15?'ebed':h<18?'uzsonna':h<22?'vacsora':'nasi'}
let foodDate=today();
const dayMeals=d=>S.meals.filter(m=>m.date===d);
const sumMeals=l=>l.reduce((a,m)=>({kcal:a.kcal+m.kcal,p:a.p+m.p,c:a.c+m.c,f:a.f+m.f,fib:a.fib+(m.fib||0)}),{kcal:0,p:0,c:0,f:0,fib:0});
const DATE_HEAD=/^(\d{4})\s*[-./]\s*([0-9]{1,2}|[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]{3,10}\.?)\s*[-./]?\s*(\d{1,2})\.?/;
function parseDateStr(t){const m=DATE_HEAD.exec(String(t).trim());if(!m)return null;const mo=monthNum(m[2]);if(!mo||mo>12)return null;
  const d=`${m[1]}-${z2(mo)}-${z2(+m[3])}`,dt=pYmd(d);return dt.getMonth()===mo-1&&dt<=new Date()?d:null}
function parseMacro(t){t=String(t??'').replace(/[\s ]/g,'').replace(/^[^\d]+/,'').replace(/[^\d.,]+$/,'');if(!t)return null;if(/^\d{1,3}([.,]\d{3})+$/.test(t))t=t.replace(/[.,]/g,'');else t=t.replace(',','.');const v=parseFloat(t);return isFinite(v)?Math.round(v*10)/10:null}
/* Formátum soronként: ÉÉÉÉ-HH-NN;étkezés;megnevezés;kcal;fehérje;szénhidrát;zsír  (a dátum elhagyható) */
/* Formátum soronként: ÉÉÉÉ-HH-NN;étkezés;megnevezés;kcal;fehérje;szénhidrát;zsír;rost
   A dátum elhagyható (ilyenkor a kiválasztott nap), a rost is (régebbi, 7 mezős sorok). */
function parseMeals(text,defDate){
  const out=[];
  for(const raw of String(text||'').split(/\r?\n/)){
    const line=raw.trim().replace(/^[-*•]\s*/,'');if(!line||!line.includes(';'))continue;
    let parts=line.split(';').map(x=>x.trim());while(parts.length&&parts[parts.length-1]==='')parts.pop();
    let date=parseDateStr(parts[0]);if(date)parts=parts.slice(1);else date=defDate;
    // a sor végén lévő számmezők: 5 = kcal,F,Sz,Zs,rost; 4 = rost nélkül
    const isNum=t=>{const u=t.replace(/\s*(kcal|kj|gramm|gr|g)\.?$/i,'').trim();return /\d/.test(u)&&/^[\d\s.,\u00a0]+$/.test(u)};
    let k=0;for(let j=parts.length-1;j>=0&&k<5&&isNum(parts[j]);j--)k++;
    if(k<4||parts.length-k<2)continue;
    const nums=parts.slice(-k).map(parseMacro),[kcal,p,c,f]=nums,fib=k===5?nums[4]:null;
    const name=parts.slice(1,parts.length-k).join(' ').slice(0,100);
    if(!name||kcal<0||kcal>10000||[p,c,f].some(x=>x<0||x>1000)||(fib!=null&&(fib<0||fib>500)))continue;
    out.push({date,meal:mealKey(parts[0]),name,kcal:Math.round(kcal),p,c,f,fib});
  }
  return out;
}
async function pasteMeals(){
  let text=null;
  try{if(navigator.clipboard&&navigator.clipboard.readText)text=await navigator.clipboard.readText()}catch(e){text=null}
  let items=parseMeals(text,foodDate);
  if(!items.length){
    const r=await form('Étkezés beillesztése',[{id:'t',label:'Claude válaszának kódblokkja',type:'textarea',placeholder:'2026-11-06;ebéd;Csirkemell 150 g;248;46;0;6;0',hint:'Nyomd hosszan a mezőt, majd Beillesztés. Soronként egy tétel: dátum;étkezés;megnevezés;kcal;fehérje;szénhidrát;zsír;rost'}],{ok:'Feldolgozás',intro:text?'A vágólap tartalmában nem találtam étkezés-sort.':''});
    if(!r)return;items=parseMeals(r.t,foodDate);
    if(!items.length){toast('Nem találtam felismerhető sort');return}
  }
  const key=m=>[m.date,m.meal,deacc(m.name),m.kcal].join('|'),have=new Set(S.meals.map(key));
  const fresh=items.filter(m=>!have.has(key(m))),dup=items.length-fresh.length;
  if(!fresh.length){toast('Ezek a tételek már szerepelnek');return}
  const sum=sumMeals(fresh);
  const list=fresh.slice(0,12).map(m=>`<div class="exl"><span>${esc(m.name)}<br><span class="mut small">${fmtDate(m.date)} · ${mealLbl(m.meal)}</span></span><span>${m.kcal} kcal</span></div>`).join('')+(fresh.length>12?`<div class="mut small">… és még ${fresh.length-12} tétel</div>`:'');
  if(!await ask(`${list}<div class="exl"><b>Összesen</b><span><b>${fmt(sum.kcal,0)} kcal</b> · F ${fmt(sum.p,0)} · Sz ${fmt(sum.c,0)} · Zs ${fmt(sum.f,0)} · R ${fmt(sum.fib,0)} g</span></div>${dup?`<div class="hint">${dup} tétel már szerepelt, azt kihagyom.</div>`:''}`,{title:`${fresh.length} tétel mentése`,ok:'Mentés'}))return;
  for(const m of fresh)S.meals.push(Object.assign({id:uid()},m));
  foodDate=fresh[fresh.length-1].date;save();go('food');toast(`${fresh.length} tétel mentve`);
}
function mealFields(m={}){return[{id:'meal',label:'Étkezés',type:'select',value:m.meal||guessMeal(),options:MEALS},{id:'name',label:'Megnevezés',value:m.name||'',placeholder:'pl. Zabkása 60 g banánnal'},
  {id:'kcal',label:'Energia (kcal)',type:'number',value:m.kcal??''},{id:'p',label:'Fehérje (g)',type:'number',value:m.p??''},{id:'c',label:'Szénhidrát (g)',type:'number',value:m.c??''},{id:'f',label:'Zsír (g)',type:'number',value:m.f??''},{id:'fib',label:'Rost (g)',type:'number',value:m.fib??''}]}
function readMeal(r){const n=k=>{const v=parseMacro(r[k]);return v==null?0:Math.min(k==='kcal'?10000:1000,v)};return{meal:MEALS.some(x=>x[0]===r.meal)?r.meal:'nasi',name:r.name.slice(0,100),kcal:Math.round(n('kcal')),p:n('p'),c:n('c'),f:n('f'),fib:String(r.fib??'').trim()===''?null:Math.min(500,n('fib'))}}
async function addMeal(){const r=await form('Új tétel',mealFields(),{intro:fmtDate(foodDate)});if(!r||!r.name){if(r)toast('Adj meg megnevezést');return}
  S.meals.push(Object.assign({id:uid(),date:foodDate},readMeal(r)));save();render()}
async function editMeal(id){const m=S.meals.find(x=>x.id===id);if(!m)return;const r=await form('Tétel szerkesztése',mealFields(m),{intro:fmtDate(m.date)});if(!r||!r.name)return;Object.assign(m,readMeal(r));save();render()}
async function delMeal(id){const m=S.meals.find(x=>x.id===id);if(!m)return;if(!await ask(`Törlöd: <b>${esc(m.name)}</b> (${m.kcal} kcal)?`,{title:'Tétel törlése',ok:'Törlés',danger:true}))return;S.meals=S.meals.filter(x=>x.id!==id);save();render()}
function copyMealToday(id){const m=S.meals.find(x=>x.id===id);if(!m)return;S.meals.push(Object.assign({},m,{id:uid(),date:today()}));save();toast('Hozzáadva a mai naphoz')}
function foodNav(d){const x=pYmd(foodDate);x.setDate(x.getDate()+d);const k=ymd(x);if(k>today())return;foodDate=k;render()}
function setFoodDate(v){foodDate=DATE_RE.test(v)&&v<=today()?v:today();render()}
function foodToday(){foodDate=today();render()}
function foodFromCal(d){foodDate=d;go('food')}
function mbar(label,v,goal,unit,color,isMin){const pct=goal?Math.min(100,v/goal*100):0,over=!isMin&&goal&&v>goal*1.1;
  return `<div class="mb"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span class="small">${label}</span><span class="small mono" style="${over?'font-weight:700':''}">${fmt(v,0)}${goal?(isMin?' / min. ':' / ')+fmt(goal,0):''} ${unit}${over?' ▲':''}</span></div><div class="bar"><i style="width:${goal?pct:(v?100:0)}%;background:${color};opacity:${goal?1:.35}"></i></div></div>`}
function vFood(){
  const t=targets(),items=dayMeals(foodDate),s=sumMeals(items),isToday=foodDate===today();
  let h=`<div class="card"><div class="row" style="flex-wrap:nowrap"><button class="iconbtn" data-click="foodNav(-1)" aria-label="Előző nap">${I('chevron-left')}</button>
  <input type="date" value="${foodDate}" max="${today()}" data-change="setFoodDate(this.value)" style="flex:1;text-align:center" aria-label="Nap">
  <button class="iconbtn" data-click="foodNav(1)" aria-label="Következő nap" ${isToday?'disabled style="opacity:.35"':''}>${I('chevron-right')}</button>${isToday?'':`<button class="btn sm" data-click="foodToday()">Ma</button>`}</div>
  ${gauge(s.kcal,t.kcal)}
  ${(()=>{const st=kcalStatus(s.kcal,t.kcal,t.goal);return `<div style="text-align:center;margin-top:4px">${st?`<div style="font-weight:700;color:${st.col}">${st.txt}</div>`:''}<div class="mut small" style="margin-top:2px">${isToday?'Ma':pYmd(foodDate).toLocaleDateString('hu-HU',{weekday:'long'})}${t.kcal?` · ${kcalTerm(t.goal).noun}: ${fmt(t.kcal,0)} kcal`:''}</div></div>`})()}
  ${mbar('Fehérje',s.p,t.p,'g',C.protein)}${mbar('Szénhidrát',s.c,t.c,'g',C.carb)}${mbar('Zsír',s.f,t.f,'g',C.fatm)}${mbar('Rost',s.fib,t.fib,'g',C.fiber,true)}
  ${!t.kcal?`<div class="hint">A javasolt napi bevitelhez töltsd ki a profilodat a Beállításokban.</div>`:''}</div>
  <div class="row" style="margin-bottom:12px;flex-wrap:nowrap">${S.settings.claudeUrl?`<a class="btn" href="${esc(S.settings.claudeUrl)}" target="_blank" rel="noopener noreferrer">${I('external-link','sm')} Claude</a>`:''}<button class="btn p" style="flex:1" data-click="pasteMeals()">${I('clipboard-paste','sm')} Beillesztés${S.settings.claudeUrl?'':' Claude-ból'}</button><button class="btn" data-click="addMeal()">${I('plus','sm')} Kézi</button><button class="btn ico" data-click="foodHelp()" aria-label="Súgó: Claude-projekt">${I('circle-help','sm')}</button></div>`;
  if(!items.length)h+=`<div class="card empty">Erre a napra még nincs étkezés.</div>`;
  const trend=`<div class="card"><h2 style="font-size:16.5px">Utolsó 7 nap</h2>${foodTrend(7)}</div>`;
  for(const[k,l]of MEALS){const g=items.filter(m=>m.meal===k);if(!g.length)continue;const gs=sumMeals(g);
    h+=`<div class="card"><div class="row"><h2 style="flex:1;margin:0;font-size:16.5px">${l}</h2><span class="mono small mut">${fmt(gs.kcal,0)} kcal</span></div>
    ${g.map(m=>`<div class="row li" style="flex-wrap:nowrap"><button class="exi" style="flex:1;margin:0;display:block;background:none;border:0;padding:4px 0" data-click="editMeal('${m.id}')"><span>${esc(m.name)}</span><br><span class="mut small mono">F ${fmt(m.p,0)} · Sz ${fmt(m.c,0)} · Zs ${fmt(m.f,0)}${m.fib!=null?' · R '+fmt(m.fib,0):''} g</span></button><span class="mono small" style="white-space:nowrap">${m.kcal} kcal</span>${isToday?'':`<button class="btn sm ico" data-click="copyMealToday('${m.id}')" aria-label="Hozzáadás a mai naphoz">${I('copy','sm')}</button>`}<button class="btn sm ico d" data-click="delMeal('${m.id}')" aria-label="Törlés">${I('trash-2','sm')}</button></div>`).join('')}</div>`}
  h+=trend;
  return h;
}

/* Napi energia-ív: mutató és skálafeliratok nélkül, csak kitöltés. A jelölő a javasolt bevitel / napi keret.
   Színek: a javasolt ±10%-án belül zöld, alatta semleges kék, felette borostyán (jelzés, nem riasztás). */
const kcalOp=(v,T)=>!T||v>=T*.9?1:.45; // a javasolt érték 90%-a alatt halványabb – a szín mindig az étkezési energiáé
const kcalTerm=g=>g==='lose'?{noun:'napi keret',short:'keret'}:{noun:'javasolt bevitel',short:'javasolt'};
function kcalStatus(v,T,goal){
  if(!T)return null;const d=Math.round(T-v),a=fmt(Math.abs(d),0),over=v>T*1.1,inBand=!over&&v>=T*.9;
  const col=inBand?C.kcal:'var(--kj-text)';let txt;
  if(goal==='lose')txt=d>=0?`Még ${a} kcal fér bele a napi keretbe`:`${a} kcal-lal a napi keret felett`;
  else if(goal==='muscle'||goal==='gain')txt=d>0?`Még ${a} kcal a javasolt bevitelig`:over?`${a} kcal-lal a javasolt bevitel felett`:'A javasolt bevitel megvan';
  else txt=d>=0?`A javasolt bevitelig még ${a} kcal`:`${a} kcal-lal a javasolt bevitel felett`;
  return{txt,col};
}
function gauge(v,T){
  const W=300,H=168,cx=150,cy=154,r=126,sw=24,max=T?T*1.5:Math.max(v,2000)*1.25;
  const ang=f=>Math.PI*(1-Math.max(0,Math.min(1,f))),pt=(f,rr=r)=>[cx+rr*Math.cos(ang(f)),cy-rr*Math.sin(ang(f))];
  const arc=(f0,f1,col,op=1)=>{if(f1<=f0)return'';const[a,b]=pt(f0),[c,d]=pt(f1);return `<path d="M${a.toFixed(1)} ${b.toFixed(1)} A${r} ${r} 0 0 1 ${c.toFixed(1)} ${d.toFixed(1)}" style="fill:none;stroke:${col};stroke-width:${sw};stroke-linecap:round;opacity:${op}"/>`};
  const fv=Math.min(v/max,1);
  let g=arc(0,1,'var(--kj-track)')+(fv>0?arc(0,Math.max(fv,.004),C.kcal,kcalOp(v,T)):'');
  if(T){const ft=T/max,[a,b]=pt(ft,r-sw/2-6),[c,d]=pt(ft,r+sw/2+6);g+=`<line x1="${a.toFixed(1)}" y1="${b.toFixed(1)}" x2="${c.toFixed(1)}" y2="${d.toFixed(1)}" style="stroke:var(--kj-text);stroke-width:3;stroke-linecap:round;opacity:.75"/>`}
  g+=`<text x="${cx}" y="${cy-30}" text-anchor="middle" style="fill:var(--kj-text);font:800 46px var(--display)">${fmt(v,0)}</text><text x="${cx}" y="${cy-4}" text-anchor="middle" class="ax" style="font-size:17px">kcal</text>`;
  return `<svg class="gauge" viewBox="0 0 ${W} ${H}" role="img" aria-label="Napi energia: ${Math.round(v)} kcal${T?', '+kcalTerm('').noun+': '+T+' kcal':''}">${g}</svg>`;
}
/* 7 vagy 30 napos kcal-oszlopdiagram célvonallal; 30 napnál 7 napos mozgóátlag, 7 napnál eltérés a céltól. */
function foodTrend(n){
  const t=targets(),byDay={};for(const m of S.meals)(byDay[m.date]=byDay[m.date]||[]).push(m);
  const days=[...Array(n)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(n-1)+i);return ymd(d)});
  const kc=d=>byDay[d]?Math.round(sumMeals(byDay[d]).kcal):0,vals=days.map(kc),T=t.kcal||0;
  const term=kcalTerm(t.goal);
  const logged=Object.keys(byDay).sort();
  const ma=n>7?days.map(d=>{const e=pYmd(d).getTime(),w=logged.filter(x=>{const q=pYmd(x).getTime();return q<=e&&q>e-7*DAY});return w.length?w.reduce((a,x)=>a+kc(x),0)/w.length:null}):null;
  const lbl=days.map(d=>n<=7?(s=>s.charAt(0).toUpperCase()+s.slice(1))(pYmd(d).toLocaleDateString('hu-HU',{weekday:'short'}).replace('.','')):d.slice(5).replace('-','.'));
  const done=days.filter(d=>d!==today()&&byDay[d]).map(kc); // a mai, még tartó nap nem számít bele
  const above=T?done.filter(v=>v>T*1.1).length:0,below=T?done.filter(v=>v<T*.9).length:0,avgDev=T&&done.length?done.reduce((a,v)=>a+v-T,0)/done.length:null;
  const chart=barChart(lbl,vals,{color:C.kcal,opFn:v=>kcalOp(v,T),goal:T,goalColor:C.text,goalLabel:false,avgLine:ma,avgColor:C.text,h:n<=7?220:190,
    sub:n<=7&&T?(v=>v?{text:sgn(v-T,0)+(v>T*1.1?' ▲':''),color:C.text}:null):null,empty:`Az elmúlt ${n} napban nincs rögzített étkezés`});
  return chart+`<div class="legend" style="margin-top:6px">${T?`<span><i style="background:none;border-top:2px dashed ${C.text};height:0;border-radius:0;width:14px;vertical-align:3px"></i>${term.short}: ${fmt(T,0)} kcal</span><span><i style="background:${C.kcal}"></i>legalább 90%</span><span><i style="background:${C.kcal};opacity:.45"></i>alatta</span>`:''}${ma?`<span><i style="background:${C.text};height:3px;vertical-align:3px"></i>7 napos átlag</span>`:''}</div>
  <div class="grid3" style="margin-top:8px">${stat('Átl. eltérés · kcal/nap',avgDev==null?null:sgn(avgDev,0),avgDev==null?'':Math.abs(avgDev)<=T*.1?'neg':'')}${stat('Alatta / felette',T&&done.length?`${below} / ${above} nap`:null)}${stat('±10%-on belül',T&&done.length?`${done.length-above-below} / ${done.length} nap`:null)}</div>`;
}
function setFoodRng(n){foodRng=[7,30,90].includes(n)?n:30;render()}
let waistOpen=false;function toggleWaist(){waistOpen=!waistOpen;render()}
let foodRng=30;

/* ===== Claude-projekt útmutató ===== */
function claudeInstr(){
  const t=targets(),g=GOALS.find(x=>x[0]===t.goal)?.[1]||'Szinten tartás';
  return `Ez a projekt az étkezéseim naplózására szolgál az Edzésnapló appban.

Amikor fotót küldök az ételről, vagy leírom/elmondom, mit ettem:
1. Azonosítsd az ételeket, és becsüld meg az adagokat. Ha egy adag vagy az elkészítés (olaj, vaj, szósz, cukor) érdemben bizonytalan, előbb kérdezz vissza röviden, legfeljebb 2 kérdéssel. Ha grammban megadom, azzal számolj.
2. Tételenként számold ki az energiát (kcal), a makrókat (fehérje, szénhidrát, zsír) és a rostot, grammban. Magyar/európai tápanyagértékekkel számolj, és vedd figyelembe, hogy nyers vagy főtt tömegről van-e szó.
3. Írj egy 1–3 mondatos összefoglalót arról, mire alapoztad a becslést.
4. A válasz VÉGÉN egyetlen kódblokkban add meg a tételeket, tételenként egy sorban, pontosan ebben a formátumban:
ÉÉÉÉ-HH-NN;étkezés;megnevezés;kcal;fehérje;szénhidrát;zsír;rost

Szabályok a kódblokkhoz:
- dátum: a mai nap (Magyarország, Europe/Budapest), kivéve, ha mást mondok (pl. „tegnap vacsorára”)
- étkezés: reggeli, tízórai, ebéd, uzsonna, vacsora vagy nasi. Ha nem mondom meg, a napszak alapján válassz.
- megnevezés: rövid, az adaggal együtt, pontosvessző nélkül (pl. Grillezett csirkemell 150 g)
- a számok egész számok, mértékegység nélkül
- a kódblokkban semmi más ne legyen

Példa:
2026-11-06;ebéd;Grillezett csirkemell 150 g;248;46;0;6;0
2026-11-06;ebéd;Főtt jázmin rizs 180 g;234;5;51;1;1
2026-11-06;ebéd;Vegyes saláta olívaolajjal;120;2;6;10;3

A célom: ${g}.${t.kcal?` ${t.goal==='lose'?'Napi keretem':'Javasolt napi bevitelem'} (tájékoztató): ${t.kcal} kcal, ${t.p} g fehérje, ${t.c} g szénhidrát, ${t.f} g zsír, legalább ${t.fib} g rost. Ha ugyanebben a beszélgetésben több étkezést is küldök, kérésre összesítsd a napi bevitelt. Ítélkezés nélkül, tárgyilagosan fogalmazz.`:''}`;
}
async function copyInstr(){const ta=$('#instrText');try{await navigator.clipboard.writeText(ta.value);toast('Utasítás a vágólapon')}catch(e){ta.focus();ta.select();toast('Jelöld ki és másold ki kézzel')}}
function foodHelp(){
  openModal(`<h2>${I('utensils','sm')} Étkezésnapló Claude-dal</h2>
  <p class="small">Lefényképezed vagy elmondod, mit ettél, Claude kiszámolja a kalóriát, a makrókat és a rostot, és egy kódblokkban adja vissza. Ezt itt egy gombnyomással átveszed. Az Edzésnaplóba csak a számok kerülnek, a fotó csak a Claude-ba megy.</p>
  <h3 style="margin-top:14px">1. A projekt létrehozása (egyszer)</h3>
  <ol class="small" style="padding-left:20px;line-height:1.6">
  <li>Nyisd meg a Claude-ot. A projektet legkényelmesebb a <b>claude.ai</b> weboldalon létrehozni, de a mobilappban is megy, ha ott is elérhető.</li>
  <li>Bal oldali menü → <b>Projektek</b> → <b>Új projekt</b>. Név: pl. <i>Étkezésnapló</i>.</li>
  <li>A projekt oldalán keresd az <b>Utasítások</b> (Instructions / „Projekt utasításainak beállítása”) részt, és illeszd be a lenti szöveget. A <b>Másolás</b> gomb a vágólapra teszi.</li>
  <li>Mentsd. A projekt ezután a telefonos Claude appban is megjelenik a Projektek között.</li>
  <li>Másold ki a projekt címét a böngésző címsorából (<code class="mono">https://claude.ai/project/…</code>), és illeszd be a Beállítások → <b>Claude-projekt linkje</b> mezőbe. Ekkor az Étkezés fülön megjelenik a <b>Claude</b> gomb.</li></ol>
  <textarea id="instrText" rows="9" readonly style="font-size:13px">${esc(claudeInstr())}</textarea>
  <div class="row end" style="margin-top:8px"><button class="btn p sm" data-click="copyInstr()">${I('copy','sm')} Másolás</button></div>
  <div class="hint">Az utasítás tartalmazza a mostani javasolt napi bevitelt is. Ha a Beállításokban módosítod a profilodat, másold ki és illeszd be újra.</div>
  <h3 style="margin-top:14px">2. Használat étkezésenként</h3>
  <ol class="small" style="padding-left:20px;line-height:1.6">
  <li>Claude app → <b>Projektek</b> → <b>Étkezésnapló</b> → új beszélgetés (vagy folytasd a napit).</li>
  <li><b>Fotó:</b> a + vagy kamera ikonnal készíts képet a tányérról. <b>Szöveg vagy hang:</b> írd be vagy diktáld, pl. „reggelire 60 g zabpehely 2 dl tejjel és egy banán”.</li>
  <li>Ha Claude visszakérdez az adagra, válaszolj. A válasz végén lévő kódblokk sarkában lévő <b>másolás</b> ikonnal másold ki.</li>
  <li>Edzésnapló → <b>Étkezés</b> → <b>Beillesztés Claude-ból</b>. Mentés előtt megmutatja a tételeket, és a már rögzítetteket kihagyja.</li></ol>
  <p class="hint">Tipp: grammban vagy darabban megadott adaggal sokkal pontosabb a becslés, mint fotóval. A rejtett olaj, a szósz és az adagméret miatt a fotós becslés könnyen 20–30%-ot téved. Ha a vágólapról nem sikerül a beolvasás, a Beillesztés ablakba kézzel is bemásolhatod.</p>
  <div class="row end"><button class="btn p" data-click="closeModal()">Rendben</button></div>`);
}

/* ===== Testadatok ===== */
const hasMeas=b=>!!b&&(b.weight!=null||b.fat!=null||b.waist!=null);
/* Lépések átvétele vágólapról. Soronként: dátum + lépésszám, tetszőleges elválasztóval.
   Elfogadott dátum: 2026-11-06, 2026. 11. 06., 2026/11/06. Szám: 8432, 8 432, 8.432, 8,432, 8432,0 */
function parseStepNum(t){t=t.replace(/[\s  ']/g,'').replace(/[^\d.,]+$/,'');if(!/^\d/.test(t))return null;if(/^\d{1,3}([.,]\d{3})+$/.test(t))t=t.replace(/[.,]/g,'');else t=t.replace(',','.');const v=parseFloat(t);return isFinite(v)?Math.round(v):null}
const MONTHS={jan:1,febr:2,feb:2,'márc':3,marc:3,mar:3,'ápr':4,apr:4,'máj':5,maj:5,may:5,'jún':6,jun:6,'júl':7,jul:7,aug:8,szept:9,szep:9,sep:9,sept:9,okt:10,oct:10,nov:11,dec:12};
function monthNum(t){t=t.toLowerCase().replace(/\.$/,'');if(/^\d+$/.test(t))return +t;for(const k of Object.keys(MONTHS).sort((a,b)=>b.length-a.length))if(t.startsWith(k))return MONTHS[k];return null}
/* Dátum: 2026-11-06 | 2026. 11. 06. | 2026/11/06 | 2026. nov. 6. | 2026-11-06T00:00:00+01:00 | 2026. nov. 6. 0:00
   Utána elválasztó (; , tab |), majd a lépésszám. */
const STEP_LINE=/(\d{4})\s*[-./]\s*([0-9]{1,2}|[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]{3,10}\.?)\s*[-./]?\s*(\d{1,2})\.?(?:[T\s]+\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?\s*(?:Z|[+-]\d{2}:?\d{2})?)?\s*[;,\t|]\s*(.+)$/;
function parseSteps(text){
  const out={};
  for(const line of String(text||'').split(/\r?\n/)){
    const m=STEP_LINE.exec(line.trim());if(!m)continue;
    const mo=monthNum(m[2]);if(!mo||mo>12)continue;
    const d=`${m[1]}-${z2(mo)}-${z2(+m[3])}`,dt=pYmd(d);if(!DATE_RE.test(d)||dt.getMonth()!==mo-1||dt>new Date())continue;
    const v=parseStepNum(m[4]);if(v==null||v<=0||v>200000)continue; // 0: kitöltött hiányzó nap – kihagyjuk
   out[d]=(out[d]||0)+v; // ugyanaz a nap többször: összeadjuk
  }
  return out;
}
/* ===== Egészség app adatai: lépés, testsúly, testzsír – vágólapról vagy fájlból =====
   Soronként: típus;dátum;érték   (típus: lepes | suly | zsir – ékezettel, angolul is)
   A típus nélküli „dátum;érték” sor lépésszámnak számít (a korábbi, 30 napos parancs kimenete). */
const parseDec=t=>{t=String(t??'').replace(/[\s  ]/g,'').replace(/[^\d.,]+$/,'').replace(/^[^\d]+/,'');if(!t)return null;const v=parseFloat(t.replace(',','.'));return isFinite(v)?v:null};
function healthKind(t){t=deacc(t).trim();if(/^(lep|step)/.test(t))return'steps';if(/^(suly|testsuly|testtom|weight|body ?mass)/.test(t))return'weight';if(/^(zsir|testzsir|fat|body ?fat)/.test(t))return'fat';return null}
function parseHealth(text){
  const out={steps:{},weight:{},fat:{}},seen=new Set();let lines=0;
  for(const raw of String(text||'').split(/\r?\n/)){
    const key=raw.trim().replace(/\s+/g,' ');if(!key||seen.has(key))continue;seen.add(key); // pontosan azonos sor csak egyszer számít
    const parts=raw.trim().split(/[;\t|]/).map(x=>x.trim());while(parts.length&&parts[parts.length-1]==='')parts.pop();if(!parts.length)continue;
    let kind=healthKind(parts[0]),rest=kind?parts.slice(1):parts;if(!kind){if(!/^\d{4}/.test(parts[0]))continue;kind='steps'}
    if(rest.length<2){const m=/^(.+?)[,]\s*(\S+)$/.exec(rest[0]||'');if(!m)continue;rest=[m[1],m[2]]} // „dátum,érték”
    const d=parseDateStr(rest[0]);if(!d)continue;const valTxt=rest.slice(1).join(' ');
    if(kind==='steps'){const v=parseStepNum(valTxt);if(v==null||v<=0||v>200000)continue;out.steps[d]=(out.steps[d]||0)+v}
    else if(kind==='weight'){let v=parseDec(valTxt);if(v==null)continue;if(/lb/i.test(valTxt))v*=0.45359237;v=Math.round(v*10)/10;if(v<20||v>400)continue;if(out.weight[d]==null)out.weight[d]=v} // napon belül az első (reggeli) mérés
    else{let v=parseDec(valTxt);if(v==null)continue;if(v>0&&v<=1)v*=100;/* törtként (0,215) érkezett */v=Math.round(v*10)/10;if(v<2||v>70)continue;if(out.fat[d]==null)out.fat[d]=v}
    lines++;
  }
  return out;
}
async function applyHealth(text,source){
  const H=parseHealth(text),n=k=>Object.keys(H[k]).length;
  if(!n('steps')&&!n('weight')&&!n('fat'))return false;
  const cur=d=>S.body.find(b=>b.date===d);
  let add=0,same=0,diff=0;const tally=(k,key)=>{for(const[d,v]of Object.entries(H[k])){const c=cur(d)?.[key];if(c==null)add++;else if(Math.abs(c-v)<1e-9)same++;else diff++}};
  tally('steps','steps');tally('weight','weight');tally('fat','fat');
  if(!add&&!diff){toast('Nincs új adat – minden érték szerepel már');return true}
  const all=[...new Set([...Object.keys(H.steps),...Object.keys(H.weight),...Object.keys(H.fat)])].sort();
  const intro=`${source}: <b>${n('steps')}</b> nap lépésszám, <b>${n('weight')}</b> testsúly- és <b>${n('fat')}</b> testzsírmérés (${pYmd(all[0]).toLocaleDateString('hu-HU',{year:'numeric',month:'short',day:'numeric'})} – ${pYmd(all[all.length-1]).toLocaleDateString('hu-HU',{year:'numeric',month:'short',day:'numeric'})}).<br>${add} új érték${diff?`, ${diff} eltér a már rögzítettől`:''}${same?`, ${same} már szerepel`:''}.`;
  let over=true;
  if(diff){const r=await form('Egészség adatok átvétele',[{id:'mode',label:'Eltérő meglévő értékeknél',type:'select',value:'over',options:[['over','az Egészség app értéke legyen (felülírás)'],['keep','a már rögzített érték maradjon']]}],{ok:'Mentés',intro});if(!r)return true;over=r.mode==='over'}
  else if(!await ask(intro,{title:'Egészség adatok átvétele',ok:'Mentés'}))return true;
  let saved=0;
  const put=(k,key)=>{for(const[d,v]of Object.entries(H[k])){let b=cur(d);if(b&&b[key]!=null&&!over)continue;if(b&&b[key]===v)continue;if(!b){b={date:d};S.body.push(b)}b[key]=v;saved++}};
  put('steps','steps');put('weight','weight');put('fat','fat');
  save();render();toast(`${saved} érték mentve`);return true;
}
async function pasteSteps(){
  let text=null;try{if(navigator.clipboard&&navigator.clipboard.readText)text=await navigator.clipboard.readText()}catch(e){text=null}
  if(await applyHealth(text,'Vágólap'))return;
  const r=await form('Egészség adatok beillesztése',[{id:'t',label:'Parancs kimenete',type:'textarea',placeholder:'lepes;2026-11-05;9120\nsuly;2026-11-05 07:10;84,2\nzsir;2026-11-05 07:10;21,4',hint:'Nyomd hosszan a mezőt, majd Beillesztés. Hosszabb időszakhoz használd a Fájl gombot.'}],{ok:'Feldolgozás',intro:text?'A vágólap tartalmában nem találtam felismerhető sort.':''});
  if(!r)return;if(!await applyHealth(r.t,'Beillesztett szöveg'))toast('Nem találtam felismerhető sort');
}
function openHealthFile(){$('#impHealth').click()}
async function importHealthFile(inp){const f=inp.files[0];inp.value='';if(!f)return;let t;try{if(f.size>20e6)throw 0;t=await f.text()}catch(e){toast('A fájl nem olvasható');return}
  if(!await applyHealth(t,esc(f.name).slice(0,60)))toast('A fájlban nem találtam lépés-, súly- vagy testzsír-sort')}
function stepsHelp(){
  openModal(`<h2>${I('footprints','sm')} Egészség app adatai iPhone-ról</h2>
  <p class="small">Egy <b>Parancsok</b>-parancs kiírja a lépésszámot, a testsúlyt és a testzsír-százalékot egy szövegfájlba; itt a <b>Fájl</b> gombbal beolvasod. A fájlnak nincs méretkorlátja, így akár több év is átjön (a vágólap kb. 200 napnál elakad). Az adat nem hagyja el a telefont.</p>
  <div class="stat small mono" style="line-height:1.7;margin-bottom:12px">Egészségügyi minták keresése (Steps)<br>Megismétlés … minden elemével<br>&nbsp;&nbsp;↳ Szöveg: lepes;Kezdési dátum;Elem ismétlése<br>&nbsp;&nbsp;↳ Hozzáadás változóhoz: Egeszseg<br>Ismétlés vége<br>… ugyanez Testtömeg (suly) és Testzsír (zsir) …<br>A(z) Egeszseg egyesítése Új sorok elválasztóval<br>Név beállítása: egeszseg.txt<br>Fájl mentése</div>
  <p class="small"><b>Új művelet:</b> a szerkesztő alján lévő <b>Keresés</b> mezőbe írd a nevét, koppints rá – a parancs <b>végére</b> kerül; a <b>nevénél</b> fogva húzható a helyére.</p>
  <ol class="small" style="padding-left:20px;line-height:1.6">
  <li><b>Lépések.</b> <i>Egészségügyi minták keresése</i>: Típus <b>Steps</b>, Kezdési dátum <b>benne van ebben: előző 365 nap</b> (első alkalommal akár több év), Csoportosítás szempontja: <b>Nap</b>, Rendezés: <b>Kezdési dátum, legrégebbi elöl</b>, Korlát: ki.</li>
  <li><i>Ismétlés mindegyikkel</i>, a ciklusba (a <i>Megismétlés…</i> és az <i>Ismétlés vége</i> közé) két művelet:
    <ol type="a" style="padding-left:18px"><li><b>Szöveg</b>: írd be: <code class="mono">lepes;</code> → <b>Elem ismétlése</b> változó → koppints rá → <b>Kezdési dátum</b> → <code class="mono">;</code> → <b>Elem ismétlése</b> (tulajdonság nélkül).</li>
    <li><b>Hozzáadás változóhoz</b> (Add to Variable): a Szöveget add hozzá egy új változóhoz, neve: <code class="mono">Egeszseg</code>.</li></ol></li>
  <li><b>Testsúly.</b> Újra <i>Egészségügyi minták keresése</i>: Típus <b>Testtömeg</b> (Body Mass), ugyanaz a dátumszűrő, Mértékegység: <b>kg</b>, Csoportosítás: <b>nincs</b>, Rendezés: legrégebbi elöl. Utána ugyanaz a ciklus, csak a szöveg eleje <code class="mono">suly;</code>, és ugyanahhoz az <code class="mono">Egeszseg</code> változóhoz add hozzá.</li>
  <li><b>Testzsír.</b> Ugyanígy, Típus <b>Testzsír-százalék</b> (Body Fat Percentage), a szöveg eleje <code class="mono">zsir;</code>.</li>
  <li>A ciklusok után: <b>Szöveg egyesítése</b> → bemenet: <b>Egeszseg</b> változó, elválasztó: <b>Új sorok</b>.</li>
  <li><b>Név beállítása</b> (Set Name) → az Egyesített szöveg neve: <code class="mono">egeszseg.txt</code></li>
  <li><b>Fontos:</b> a <b>Szöveg egyesítése</b>, a <b>Név beállítása</b> és a <b>Fájl mentése</b> a legutolsó <i>Ismétlés vége</i> <b>után</b> álljon, ne a cikluson belül – különben a teljes tartalom minden körben újra kiíródik (az app az azonos sorokat egyszer veszi figyelembe, de a fájl feleslegesen nagy lesz).</li>
  <li><b>Fájl mentése</b> (Save File) → pl. iCloud Drive / Shortcuts mappa; „Felülírás, ha létezik”: be. Ha a „Kérdezze meg, hová mentse” be van kapcsolva, minden futtatáskor választhatsz helyet.</li></ol>
  <p class="small">Futtatás után: Edzésnapló → Test → <b>Fájl</b> → válaszd ki az <code class="mono">egeszseg.txt</code>-t. Mentés előtt megmutatja, hány új és hány eltérő érték van; eltérésnél választhatsz, melyik maradjon. Egy napon több mérésnél az elsőt (reggelit) veszi.</p>
  <p class="small"><b>Csak az utolsó ~30 nap jön át?</b> Az iOS adattípusonként korlátozhatja, mennyi régi adatot láthat a Parancsok app. Nézd meg: <b>Beállítások → Adatvédelem és biztonság → Egészség → Parancsok</b>, és minden használt típusnál (Lépések, Testtömeg, Testzsír) legyen engedélyezve a <b>teljes</b> előzmény. Ha a Lépések 30 napra van állítva, a Parancsok a régebbi napokat egyszerűen nem kapja meg, hiba nélkül.</p>
  <p class="hint">Napi frissítéshez elég a dátumszűrőt „előző 30 nap”-ra állítani – az újraolvasás nem duplikál. A korábbi, csak lépésszámos (vágólapos) parancsod is működik tovább a Beillesztés gombbal. A testzsírt az app akkor is helyesen kezeli, ha a parancs törtként (0,215) adja ki. A műveletnevek iOS-verziónként kicsit eltérhetnek – ha valamit nem találsz, küldj képernyőképet.</p>
  <div class="row end"><button class="btn p" data-click="closeModal()">Rendben</button></div>`);
}

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
  <label for="bst">Lépésszám</label><input id="bst" type="number" step="1" min="0" inputmode="numeric" value="${e.steps??''}" placeholder="pl. 8500">
  <div class="row" style="margin-top:14px">${e.date?`<button class="btn d" data-click="delBody('${e.date}')">${I('trash-2','sm')} Törlés</button>`:''}<span class="sp"></span><button class="btn p" data-click="saveBody()">${I('save','sm')} ${e.date?'Frissítés':'Mentés'}</button></div></div>
  <div class="card"><div class="row" style="flex-wrap:nowrap"><h2 style="flex:1;margin:0">${I('footprints','sm')} Egészség app</h2><button class="btn sm ico" data-click="stepsHelp()" aria-label="Súgó: lépések átvétele">${I('circle-help','sm')}</button></div>
  <div class="row" style="margin-top:10px;flex-wrap:nowrap"><button class="btn sm p" style="flex:1" data-click="openHealthFile()">${I('folder-open','sm')} Fájl</button><button class="btn sm" style="flex:1" data-click="pasteSteps()">${I('clipboard-paste','sm')} Beillesztés</button><input type="file" id="impHealth" accept=".txt,.csv,text/plain,text/csv" style="display:none" data-change="importHealthFile(this)"></div>
  <div class="hint" style="margin:6px 0 10px">Lépésszám, testsúly és testzsír az iPhone Egészség appjából, Parancsok segítségével (leírás a ? gomb alatt) – vagy rögzítsd kézzel fent.</div>
</div>
  <h3 style="margin:16px 2px 10px">Testsúly</h3>
  <div class="grid3" style="margin-bottom:8px">${stat('Utolsó súly',lastW?fmt(lastW.weight)+' kg':null)}${stat('7 napos átlag',ws.length?fmt(avgLast(ws,7))+' kg':null)}${stat('Δ 30 nap',d30==null?null:sgn(d30)+' kg',dcls(d30))}</div>
  <div class="grid3" style="margin-bottom:12px">${trendStat('Trend 14 nap',lastDays(ws,14),'kg/hét')}${trendStat('Trend 30 nap',lastDays(ws,30),'kg/hét')}${trendStat('Trend 90 nap',lastDays(ws,90),'kg/hét')}</div>
  <h3 style="margin:16px 2px 10px">Testzsír</h3>
  <div class="grid3" style="margin-bottom:12px">${stat('Utolsó testzsír',lastF?fmt(lastF.fat)+' %':null)}${trendStat('Trend 30 nap',lastDays(fs,30),'%p/hét')}${trendStat('Trend 90 nap',lastDays(fs,90),'%p/hét')}</div>
  <h3 style="margin:16px 2px 10px">Lépésszám</h3>
  <div class="grid3" style="margin-bottom:12px">${(()=>{const ss=series('steps'),t=S.body.find(b=>b.date===today())?.steps,g=S.settings.stepGoal;return stat('Ma'+(g?` · cél ${fmtShort(g)}`:''),t!=null?fmt(t,0):null)+stat('7 napos átlag',ss.length?fmt(avgLast(ss,7),0):null)+stat('30 napos átlag',ss.length?fmt(avgLast(ss,30),0):null)})()}</div>
  <div class="hint" style="margin:-4px 2px 14px">A trend a mérésekre illesztett lineáris regresszió meredeksége heti változásra vetítve – kevésbé érzékeny a napi ingadozásra, mint két mérés különbsége.</div>`;
  const rows=[];let pw=null;for(const b of sorted){rows.push({b,d:b.weight!=null&&pw!=null?b.weight-pw:null});if(b.weight!=null)pw=b.weight}
  h+=`<div class="card"><h2>Előzmények</h2>${rows.length?`<table class="tbl"><tr><th>Dátum</th><th>Súly</th><th>Δ</th><th>Zsír</th><th>Derék</th><th>Lépés</th></tr>
  ${rows.reverse().slice(0,90).map(({b,d})=>`<tr class="click" data-click="editBodyRow('${b.date}')"><td>${fmtDate(b.date)}</td><td>${fmt(b.weight)}</td><td class="mut">${d==null?'':sgn(d)}</td><td>${fmt(b.fat)}</td><td>${fmt(b.waist)}</td><td>${b.steps!=null?fmtShort(b.steps):'–'}</td></tr>`).join('')}</table>`:'<div class="empty">Még nincs mérés.</div>'}</div>`;
  return h;
}
function saveBody(){
  const d=$('#bd').value;if(!d)return;
  const num=id=>{const v=$(id).value.replace(',','.');return v===''?null:+v};
  const w=num('#bw'),f=num('#bf'),wa=num('#bwa'),st=num('#bst');
  if(w==null&&f==null&&wa==null&&st==null){toast('Adj meg legalább egy értéket');return}
  if(st!=null&&!(st>=0&&st<=200000)){toast('A lépésszám 0–200 000 között legyen');return}
  if(w!=null&&!(w>=20&&w<=400)){toast('A súly 20–400 kg között legyen');return}
  if(f!=null&&!(f>=2&&f<=70)){toast('A testzsír 2–70% között legyen');return}
  if(wa!=null&&!(wa>=30&&wa<=250)){toast('A derékkerület 30–250 cm között legyen');return}
  S.body=S.body.filter(b=>b.date!==d);const e={date:d};if(w!=null)e.weight=w;if(f!=null)e.fat=f;if(wa!=null)e.waist=wa;if(st!=null)e.steps=Math.round(st);S.body.push(e);save();toast('Mentve');render();
}
async function delBody(d){if(!await ask(`Törlöd a(z) ${fmtDate(d)} mérést?`,{title:'Mérés törlése',ok:'Törlés',danger:true}))return;S.body=S.body.filter(b=>b.date!==d);save();render()}

/* ===== Statisztika ===== */
function weekStart(ts){const d=new Date(ts);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getTime()}
function strSeries(exId,metric){const cd=isCardio(exId);return wSorted().map(w=>{const sets=w.exercises.filter(e=>e.exId===exId).flatMap(e=>e.sets);if(!sets.length)return null;
  if(cd){const km=sets.reduce((a,s)=>a+(s.w||0),0),mn=sets.reduce((a,s)=>a+(s.r||0),0),y=metric==='w'?km:metric==='r'?mn:km?mn/km:null;return y==null?null:{x:w.start,y:Math.round(y*100)/100}}
  const b=bests(sets);
  const y=metric==='v'?sets.reduce((a,s)=>a+s.w*s.r,0):metric==='w'?b.w:metric==='r'?b.r:b.e;return{x:w.start,y:Math.round(y*10)/10}}).filter(Boolean)}
function vStats(){
  const cut=statRange?Date.now()-statRange*DAY:-Infinity,inR=p=>p.x>=cut;
  const chips=[[30,'30 nap'],[90,'90 nap'],[365,'1 év'],[0,'Mind']].map(([v,l])=>`<button class="chip ${statRange===v?'on':''}" data-click="setRange(${v})">${l}</button>`).join('');
  const wAll=series('weight'),w=wAll.filter(inR),ma=movAvg(wAll).filter(inR),d7=deltaN(wAll,7),d30=deltaN(wAll,30),d90=deltaN(wAll,90),sl=slopeWeek(w);
  let h=vTrend()+`<h3 style="margin:18px 2px 10px">Részletes nézet</h3><div class="chips">${chips}</div>
  <div class="card"><h2>Testsúly</h2>${lineChart([{name:'Mérés',color:C.weight,points:w,dots:true,w:1.2},{name:'7 napos átlag',color:C.weight,points:ma,w:3.4}],{unit:' kg'})}
  <div class="grid3" style="margin-top:12px">${stat('Jelenlegi',wAll.length?fmt(wAll[wAll.length-1].y)+' kg':null)}${stat('Δ 7 nap',d7==null?null:sgn(d7)+' kg',dcls(d7))}${stat('Δ 30 nap',d30==null?null:sgn(d30)+' kg',dcls(d30))}
  ${stat('Δ 90 nap',d90==null?null:sgn(d90)+' kg',dcls(d90))}${stat('Trend (kg/hét)',sl==null?null:sgn(sl,2),dcls(sl))}${stat('Min – max (kg)',w.length?fmt(Math.min(...w.map(p=>p.y)),0)+'–'+fmt(Math.max(...w.map(p=>p.y)),0):null)}</div>
  ${(()=>{const tw=S.profile.targetWeight;if(!tw||!wAll.length)return '';const cur=wAll[wAll.length-1].y,rem=cur-tw,toward=sl!=null&&Math.abs(sl)>.01&&Math.sign(sl)===-Math.sign(rem);
    return `<h3 style="margin-top:14px">${I('target','sm')} Célsúly</h3><div class="grid3">${stat('Célsúly',fmt(tw)+' kg')}${stat(rem>0?'Hátra (fogyás)':'Hátra (gyarapodás)',Math.abs(rem)<.05?'Elérted!':fmt(Math.abs(rem))+' kg')}${stat('Becsült idő (trend)',Math.abs(rem)<.05?'–':toward?'~'+Math.ceil(Math.abs(rem/sl))+' hét':'–')}</div>${!toward&&Math.abs(rem)>=.05?'<div class="hint">A becsült időhöz a kiválasztott időszak súlytrendjének a cél felé kell mutatnia.</div>':''}`})()}</div>`;
  const f=series('fat'),wa=series('waist'),fr=f.filter(inR),f30=deltaN(f,30),fsl=slopeWeek(fr),w30=deltaN(wa,30),w90=deltaN(wa,90);
  h+=`<div class="card"><h2>Testzsír %</h2>${lineChart([{name:'Testzsír',color:C.fat,points:fr,dots:true}],{unit:' %',h:190})}
  <div class="grid3" style="margin-top:12px">${stat('Jelenlegi',f.length?fmt(f[f.length-1].y)+' %':null)}${stat('Δ 30 nap',f30==null?null:sgn(f30)+' %p',dcls(f30))}${stat('Trend (%p/hét)',fsl==null?null:sgn(fsl,2),dcls(fsl))}</div></div>
  <div class="card"><button class="row" style="width:100%;background:none;border:0;padding:0;color:inherit;cursor:pointer;flex-wrap:nowrap" data-click="toggleWaist()" aria-expanded="${waistOpen}"><h2 style="flex:1;margin:0;text-align:left">Derékbőség</h2><span class="mut small mono">${wa.length?fmt(wa[wa.length-1].y)+' cm':''}</span>${I(waistOpen?'arrow-up':'arrow-down','sm')}</button>
  ${waistOpen?`<div style="margin-top:10px">${lineChart([{name:'Derékbőség',color:C.waist,points:wa.filter(inR),dots:true}],{unit:' cm',h:190})}
  <div class="grid3" style="margin-top:12px">${stat('Jelenlegi',wa.length?fmt(wa[wa.length-1].y)+' cm':null)}${stat('Δ 30 nap',w30==null?null:sgn(w30)+' cm',dcls(w30))}${stat('Δ 90 nap',w90==null?null:sgn(w90)+' cm',dcls(w90))}</div></div>`:''}</div>`;
  {const t=targets(),days=[...new Set(S.meals.map(m=>m.date))].sort(),byDay={};for(const m of S.meals)(byDay[m.date]=byDay[m.date]||[]).push(m);
   const last30=[...Array(30)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-29+i);return ymd(d)});
   const rd=days.filter(d=>pYmd(d).getTime()>=cut&&d!==today()),sums=rd.map(d=>sumMeals(byDay[d])); // a mai (még tartó) napot kihagyjuk az átlagból
   const avg=k=>sums.length?sums.reduce((a,s)=>a+s[k],0)/sums.length:null;
   const inBand=t.kcal&&sums.length?Math.round(sums.filter(s=>Math.abs(s.kcal-t.kcal)<=t.kcal*.1).length/sums.length*100):null;
   let bal='';
   if(t.tdee&&sums.length>=7){const exp=(avg('kcal')-t.tdee)*7/7700,wsr=series('weight').filter(inR),act=slopeWeek(wsr);
     bal=`<h3 style="margin-top:14px">Energiaegyenleg</h3><div class="grid3">${stat('Átl. egyenleg · kcal/nap',sgn(avg('kcal')-t.tdee,0))}${stat('Várható · kg/hét',sgn(exp,2))}${stat('Mért trend · kg/hét',act==null?null:sgn(act,2))}</div>
     <div class="hint">A „várható” az átlagos bevitel és a becsült napi energiaigény (${fmt(t.tdee,0)} kcal) különbségéből számol (7700 kcal ≈ 1 kg). Ha nagyon eltér a mért trendtől, valószínűleg nem minden étkezés került rögzítésre, vagy az energiaigény becslése pontatlan.</div>`}
   h+=`<div class="card"><h2>${I('utensils','sm')} Étkezés</h2>
   <div class="row" style="margin-bottom:6px"><h3 style="margin:0;flex:1">Napi energia</h3><div class="chips" style="margin:0">${[7,30,90].map(n=>`<button class="chip ${foodRng===n?'on':''}" data-click="setFoodRng(${n})">${n} nap</button>`).join('')}</div></div>
   ${foodTrend(foodRng)}
   <h3 style="margin-top:14px">A kiválasztott időszak (${statRange?statRange+' nap':'mind'}) átlagai</h3>
   <div class="grid3" style="margin-top:10px">${stat('Átlag kcal (időszak)',avg('kcal')==null?null:fmt(avg('kcal'),0))}${stat('Átlag fehérje',avg('p')==null?null:fmt(avg('p'),0)+' g')}${stat(t.kcal?'±10%-on belüli nap':'Rögzített nap',t.kcal?(inBand==null?null:inBand+' %'):rd.length)}</div>
   <div class="grid3" style="margin-top:8px">${stat('Átlag szénhidrát',avg('c')==null?null:fmt(avg('c'),0)+' g')}${stat('Átlag zsír',avg('f')==null?null:fmt(avg('f'),0)+' g')}${stat('Átlag rost',avg('fib')==null?null:fmt(avg('fib'),0)+' g')}</div>
   ${bal}</div>`;}
  {const ssAll=series('steps'),goal=S.settings.stepGoal||0,sr=ssAll.filter(inR),ma7=movAvg(ssAll).filter(inR);
   const last30=[...Array(30)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-29+i);return ymd(d)});
   const bm={};for(const b of S.body)if(b.steps!=null)bm[b.date]=b.steps;
   const avg=sr.length?sr.reduce((a,p)=>a+p.y,0)/sr.length:null,best=sr.length?sr.reduce((a,p)=>p.y>a.y?p:a):null;
   h+=`<div class="card"><h2>${I('footprints','sm')} Lépések</h2>
   <h3>Utolsó 30 nap</h3>${barChart(last30.map(d=>d.slice(5).replace('-','.')),last30.map(d=>bm[d]||0),{color:C.steps,opFn:v=>!goal||v>=goal?1:.45,goal,goalColor:C.text,empty:'Az elmúlt 30 napban nincs lépésadat'})}
   ${sr.length>1?`<h3 style="margin-top:14px">7 napos átlag (időszak)</h3>${lineChart([{name:'7 napos átlag',color:C.steps,points:ma7,w:3}],{h:170})}`:''}
   <div class="grid3" style="margin-top:12px">${stat('Átlag (időszak)',avg==null?null:fmt(avg,0))}${stat('Legjobb nap',best?fmt(best.y,0):null)}${goal?stat('Cél teljesítve',sr.length?Math.round(sr.filter(p=>p.y>=goal).length/sr.length*100)+' %':null):stat('Rögzített nap',sr.length)}</div></div>`;}
  const ws0=weekStart(Date.now()),weeks=[...Array(12)].map((_,i)=>{const d=new Date(ws0);d.setDate(d.getDate()-(11-i)*7);return d.getTime()}),cnt=weeks.map(()=>0),vol=weeks.map(()=>0);
  for(const x of S.workouts){const i=weeks.indexOf(weekStart(x.start));if(i>=0){cnt[i]++;vol[i]+=wVolume(x)}}
  const lbl=weeks.map(t=>{const d=new Date(t);return z2(d.getMonth()+1)+'.'+z2(d.getDate())});
  const nm=new Date(),thisM=S.workouts.filter(x=>{const d=new Date(x.start);return d.getMonth()===nm.getMonth()&&d.getFullYear()===nm.getFullYear()}).length;
  h+=`<div class="card"><h2>Edzések</h2><div class="grid3" style="margin-bottom:12px">${stat('Összes edzés',S.workouts.length)}${stat('Ebben a hónapban',thisM)}${stat('Átlag / hét (12 hét)',fmt(cnt.reduce((a,b)=>a+b,0)/12,1))}</div>
  <h3>Edzésszám hetente</h3>${barChart(lbl,cnt,{color:C.workout})}<h3 style="margin-top:14px">Heti volumen (kg, erőedzés)</h3>${barChart(lbl,vol,{color:C.workout,opFn:()=>.7})}</div>`;
  const used=[...new Set(S.workouts.flatMap(x=>x.exercises.map(e=>e.exId)))].filter(exById);
  if(!used.includes(strEx))strEx=[...used].sort((a,b)=>strSeries(b,'e').length-strSeries(a,'e').length)[0]||null;
  used.sort((a,b)=>exName(a).localeCompare(exName(b),'hu'));
  h+=`<div class="card" id="strcard"><h2>Edzéstrend</h2>`;
  if(!used.length)h+=`<div class="empty">Rögzíts edzéseket a trendekhez.</div>`;
  else{
    const cdx=isCardio(strEx),isBW=!cdx&&strSeries(strEx,'w').every(p=>!p.y);
    const mets=cdx?[['w','Táv (km)'],['r','Idő (perc)'],['p','Tempó (perc/km)']]:isBW?[['r','Max ismétlés']]:[['e','Becs. 1RM'],['w','Max súly'],['r','Max ismétlés'],['v','Volumen']];
    if(!mets.some(m=>m[0]===strMetric))strMetric=mets[0][0];
    const unit=cdx?{w:' km',r:' perc',p:' perc/km'}[strMetric]:strMetric==='r'?' ism.':' kg',sr=strSeries(strEx,strMetric).filter(inR);
    const first=sr[0],last=sr[sr.length-1],ch=first&&last&&first.y?(last.y-first.y)/first.y*100:null;
    h+=`<select data-change="setStrEx(this.value)" aria-label="Gyakorlat">${used.map(id=>`<option value="${id}" ${id===strEx?'selected':''}>${esc(exName(id))}</option>`).join('')}</select>
    <div class="chips" style="margin-top:12px">${mets.map(([k,l])=>`<button class="chip ${strMetric===k?'on':''}" data-click="setStrMetric('${k}')">${l}</button>`).join('')}</div>
    ${lineChart([{name:mets.find(m=>m[0]===strMetric)[1],color:cdx?C.cardio:C.workout,points:sr,dots:true}],{unit,h:210})}
    <div class="grid3" style="margin-top:12px">${stat('Alkalom (időszak)',sr.length)}${stat('Legutóbbi',last?fmt(last.y)+unit:null)}${stat('Változás (időszak)',ch==null?null:sgn(ch,1)+' %')}</div>`;
  }
  h+=`</div>`;
  const pr=allPRs(),allIds=Object.keys(pr).filter(exById).sort((a,b)=>exName(a).localeCompare(exName(b),'hu')),ids=allIds.filter(id=>!isCardio(id)),cids=allIds.filter(isCardio);
  h+=`<div class="card"><h2 style="display:flex;gap:8px;align-items:center"><span style="color:var(--kj-gold)">${I('trophy')}</span> Személyes rekordok</h2>${ids.length?`<table class="tbl"><tr><th>Gyakorlat</th><th>Max súly</th><th>Becs. 1RM</th><th>Max ism.</th><th>Legjobb sorozat</th></tr>
  ${ids.map(id=>{const r=pr[id];return `<tr class="click" data-click="showStr('${id}')"><td>${esc(exName(id))}<small>${r.n} alkalom</small></td>
  <td>${r.w.v?fmt(r.w.v)+' kg<small>'+fmtDate(r.w.d)+'</small>':'–'}</td><td>${r.e.v?fmt(r.e.v,1)+' kg<small>'+fmtDate(r.e.d)+'</small>':'–'}</td>
  <td>${r.r.v}<small>${fmtDate(r.r.d)}</small></td><td>${r.v.v?setStr(r.v.s)+'<small>'+fmtDate(r.v.d)+'</small>':setStr(r.r.s)}</td></tr>`}).join('')}</table>
  ${cids.length?`<h3 style="margin-top:16px;color:var(--c-cardio)">Kardió</h3><table class="tbl"><tr><th>Gyakorlat</th><th>Leghosszabb táv</th><th>Leghosszabb idő</th><th>Összesen</th></tr>
  ${cids.map(id=>{const r=pr[id],tot=S.workouts.reduce((a,w)=>a+w.exercises.filter(e=>e.exId===id).reduce((b,e)=>b+e.sets.reduce((c,s)=>c+(s.w||0),0),0),0);
    return `<tr class="click" data-click="showStr('${id}')"><td>${esc(exName(id))}<small>${r.n} alkalom</small></td><td>${r.w.v?fmt(r.w.v,2)+' km<small>'+fmtDate(r.w.d)+'</small>':'–'}</td><td>${r.r.v?r.r.v+' perc<small>'+fmtDate(r.r.d)+'</small>':'–'}</td><td>${tot?fmt(tot,1)+' km':'–'}</td></tr>`}).join('')}</table>`:''}
  <div class="hint" style="margin-top:10px">Becsült 1RM: Epley-képlet (súly × (1 + ism./30)). Koppints egy sorra az erőtrendhez.</div>`:'<div class="empty">Még nincs rekord.</div>'}</div>`;
  return h;
}

/* ===== Összesítő trend: minden adatsor a saját átlagához mért eltérésként (z-pontszám), simítva ===== */
let trendRng=90;const trendHide=new Set();
const TRENDS=[
  {k:'weight',dash:'',name:'Testsúly',color:C.weight,win:7,unit:' kg',dec:1},
  {k:'fat',dash:'10 6',name:'Testzsír',color:C.fat,win:21,unit:' %',dec:1},
  {k:'kcal',dash:'1 6',name:'Étkezési energia',color:C.kcal,win:7,unit:' kcal',dec:0},
  {k:'steps',dash:'16 5 3 5',name:'Lépések',color:C.steps,win:7,unit:'',dec:0},
  {k:'wk',dash:'5 5',name:'Edzések / hét',color:C.workout,win:7,unit:'',dec:0}];
function trendData(n){
  const raw={weight:{},fat:{},kcal:{},steps:{},wk:{}},td=today();
  for(const b of S.body){if(b.weight!=null)raw.weight[b.date]=b.weight;if(b.fat!=null)raw.fat[b.date]=b.fat;if(b.steps!=null)raw.steps[b.date]=b.steps}
  for(const m of S.meals)if(m.date!==td)raw.kcal[m.date]=(raw.kcal[m.date]||0)+m.kcal; // a mai, még tartó nap kimarad
  for(const w of S.workouts){const d=ymd(new Date(w.start));raw.wk[d]=(raw.wk[d]||0)+1}
  const pre=35,N=n+pre,days=[...Array(N)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(N-1)+i);return ymd(d)});
  const sm={};
  for(const T of TRENDS){const m=raw[T.k];
    sm[T.k]=days.map((d,i)=>{
      if(T.k==='wk'){if(i<6||!S.workouts.length)return null;let c=0;for(let j=i-6;j<=i;j++)c+=m[days[j]]||0;return c} // gördülő 7 napos edzésszám
      let s=0,c=0;for(let j=Math.max(0,i-T.win+1);j<=i;j++)if(m[days[j]]!=null){s+=m[days[j]];c++}return c?s/c:null})}
  const chg=(a,lag)=>a.map((v,i)=>i>=lag&&v!=null&&a[i-lag]!=null?v-a[i-lag]:null);
  const wch=chg(sm.weight,7),fch=chg(sm.fat,14),cut=a=>a.slice(pre);
  const o={days:cut(days),sm:{},wch:cut(wch),fch:cut(fch)};for(const k in sm)o.sm[k]=cut(sm[k]);return o;
}
function zNorm(a){const v=a.filter(x=>x!=null);if(v.length<5)return null;const m=v.reduce((x,y)=>x+y,0)/v.length,sd=Math.sqrt(v.reduce((x,y)=>x+(y-m)**2,0)/v.length);
  if(sd<1e-9)return null;return a.map(x=>x==null?null:Math.max(-2.5,Math.min(2.5,(x-m)/sd)))}
function pearson(a,b){const xs=[],ys=[];for(let i=0;i<a.length;i++)if(a[i]!=null&&b[i]!=null){xs.push(a[i]);ys.push(b[i])}
  const n=xs.length;if(n<20)return{n,r:null};const mx=xs.reduce((p,q)=>p+q,0)/n,my=ys.reduce((p,q)=>p+q,0)/n;let sxy=0,sxx=0,syy=0;
  for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2}return{n,r:sxx&&syy?sxy/Math.sqrt(sxx*syy):null}}
const rWord=r=>{const a=Math.abs(r);return a<.2?'elhanyagolható':a<.4?'gyenge':a<.6?'közepes':'erős'};
function setTrendRng(n){trendRng=[30,90,120].includes(n)?n:90;render()}
function toggleTrend(k){trendHide.has(k)?trendHide.delete(k):trendHide.add(k);render()}
/* Testösszetétel: a tartomány első és utolsó testzsír-mérésénél a testsúllyal együtt -> zsírtömeg / zsírmentes tömeg */
function composition(n){
  const from=ymd(new Date(Date.now()-n*DAY)),fats=bodySorted().filter(b=>b.fat!=null&&b.date>=from);if(fats.length<2)return null;
  const ws=series('weight'),wAt=d=>{const t=pYmd(d).getTime();let best=null;for(const p of ws)if(Math.abs(p.x-t)<=3*DAY&&(!best||Math.abs(p.x-t)<Math.abs(best.x-t)))best=p;return best?.y??null};
  const a=fats[0],b=fats[fats.length-1],w0=a.weight??wAt(a.date),w1=b.weight??wAt(b.date);if(w0==null||w1==null||a.date===b.date)return null;
  const fm0=w0*a.fat/100,fm1=w1*b.fat/100;return{d0:a.date,d1:b.date,dw:w1-w0,dfm:fm1-fm0,dlean:(w1-fm1)-(w0-fm0),f0:a.fat,f1:b.fat};
}
function vTrend(){
  const n=trendRng,D=trendData(n),xs=D.days.map(d=>pYmd(d).getTime());
  const series=[],chips=[];
  for(const T of TRENDS){const z=zNorm(D.sm[T.k]),off=trendHide.has(T.k);
    chips.push(`<button class="chip ${off||!z?'':'on'}" style="${off||!z?'':`background:${T.color};border-color:${T.color};color:var(--kj-bg)`}" data-click="toggleTrend('${T.k}')" ${z?'':'disabled'} title="${z?'':'Kevés adat'}"><svg width="22" height="8" aria-hidden="true" style="vertical-align:1px;margin-right:5px"><line x1="2" y1="4" x2="20" y2="4" style="stroke:currentColor;stroke-width:2.6;stroke-linecap:round${T.dash?';stroke-dasharray:'+T.dash.split(' ').map(x=>x/2).join(' '):''}"/></svg>${T.name}</button>`);
    if(!z||off)continue;
    const pts=[];let prev=false;z.forEach((v,i)=>{if(v==null){prev=false;return}pts.push({x:xs[i],y:v,gap:false,t:fmt(D.sm[T.k][i],T.dec)+T.unit});prev=true});
    series.push({name:T.name,color:T.color,points:pts,w:T.k==='kcal'?3.6:T.k==='weight'?3:2.6,dash:T.dash});}
  let h=`<div class="card"><h2>Összesítő trend</h2>
  <div class="chips" style="margin-bottom:8px">${[30,90,120].map(v=>`<button class="chip ${n===v?'on':''}" data-click="setTrendRng(${v})">${v} nap</button>`).join('')}</div>
  <div class="chips" style="margin-bottom:6px">${chips.join('')}</div>
  ${lineChart(series,{h:250,yMin:-2.5,yMax:2.5,ticks:[-2,-1,0,1,2],yFmt:t=>t===0?'átl.':(t>0?'+':'−')+Math.abs(t),noLegend:true})}
  <div class="hint">Minden vonal a saját átlagához képest mutatja a le-fel mozgást (0 = az időszak átlaga, ±1 = egy szórásnyi eltérés), simítva: testsúly, étkezés, lépés 7 napos, testzsír 21 napos átlag, edzés: az előző 7 nap edzésszáma. Mérés nélküli napokon a vonal a következő értékig összeköt. Így a különböző mértékegységű adatok egy grafikonon összevethetők; a pontos értéket koppintásra mutatja. A gombokkal ki-be kapcsolhatod az adatsorokat.</div>`;
  // összefüggések
  const drv=[['kcal','Étkezési energia (7 napos átlag)'],['steps','Lépések (7 napos átlag)'],['wk','Edzések az előző 7 napban']];
  const rows=drv.map(([k,l])=>({k,l,w:pearson(D.sm[k],D.wch),f:pearson(D.sm[k],D.fch)}));
  const cell=x=>x.r==null?`<td class="mut">kevés adat</td>`:`<td><b style="color:${Math.abs(x.r)<.2?'var(--kj-muted)':'var(--kj-text)'}">${sgn(x.r,2)}</b><small>${rWord(x.r)}</small></td>`;
  const best=rows.filter(r=>r.w.r!=null).sort((a,b)=>Math.abs(b.w.r)-Math.abs(a.w.r))[0];
  h+=`<h3 style="margin-top:16px">Összefüggések (${n} nap)</h3>
  <table class="tbl"><tr><th>Tényező</th><th>Testsúly heti változása</th><th>Testzsír 2 heti változása</th></tr>${rows.map(r=>`<tr><td>${r.l}</td>${cell(r.w)}${cell(r.f)}</tr>`).join('')}</table>
  ${best&&Math.abs(best.w.r)>=.2?`<div class="small" style="margin-top:10px">Ebben az időszakban a testsúly változásával leginkább a(z) <b>${best.l.split(' (')[0].toLowerCase()}</b> mozgott együtt (r = ${sgn(best.w.r,2)}, ${rWord(best.w.r)}${best.w.r>0?' – ha nőtt, a testsúly is inkább nőtt':' – ha nőtt, a testsúly inkább csökkent'}).</div>`:''}
  <div class="hint">Korrelációs együttható (r, −1…+1): az adott tényező szintje és az ugyanarra az időszakra eső súly-, illetve zsírváltozás együttmozgása. Pozitív: együtt nőnek; negatív: ellentétesen mozognak. Legalább 20 közös nap kell hozzá, és az együttmozgás nem bizonyít ok-okozatot – egy-egy rendhagyó hét (betegség, utazás) is erősen befolyásolhatja. A testzsír-mérés (főleg otthoni mérlegnél) zajos, ott a jelzés óvatosabban értelmezendő.</div>`;
  // testösszetétel
  const c=composition(n);
  if(c){const share=Math.abs(c.dw)>=.5?Math.round(c.dfm/c.dw*100):null;
    let msg='';
    if(c.dw<=-.5)msg=share>100?`A zsírtömeg többel csökkent, mint a testsúly – a zsírmentes tömeg (izom, víz) közben nőtt.`:share<0?`A testsúly csökkent, de a zsírtömeg nem – a fogyás zsírmentes tömegből (izom, víz) származott.`:`A fogyás kb. <b>${share}%-a</b> zsírból származott${share<60?' – ez arra utalhat, hogy izom is fogyott; a fehérjebevitel és az erőedzés segít megőrizni.':'.'}`;
    else if(c.dw>=.5)msg=share<0?`A testsúly nőtt, a zsírtömeg csökkent – a gyarapodás zsírmentes tömeg.`:`A gyarapodás kb. <b>${100-Math.min(100,share)}%-a</b> zsírmentes tömeg (izom, víz), ${Math.min(100,share)}%-a zsír.`;
    else msg=c.dfm<-.3?`A testsúly alig változott, a zsírtömeg csökkent – testösszetétel-javulás.`:c.dfm>.3?`A testsúly alig változott, a zsírtömeg nőtt.`:`A testösszetétel érdemben nem változott.`;
    h+=`<h3 style="margin-top:16px">Testösszetétel változása</h3><div class="hint" style="margin:0 0 8px">${fmtDate(c.d0)} → ${fmtDate(c.d1)} · testzsír ${fmt(c.f0)}% → ${fmt(c.f1)}%</div>
    <div class="grid3">${stat('Testsúly',sgn(c.dw)+' kg',dcls(c.dw))}${stat('Zsírtömeg',sgn(c.dfm)+' kg',dcls(c.dfm))}${stat('Zsírmentes tömeg',sgn(c.dlean)+' kg')}</div><div class="small" style="margin-top:8px">${msg}</div>`}
  else h+=`<div class="hint" style="margin-top:12px">A testösszetétel-változáshoz legalább két testzsír-mérés kell az időszakban.</div>`;
  return h+`</div>`;
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
  if(o.yMin!=null){y0=o.yMin;y1=o.yMax}
  const tk=o.ticks||niceTicks(y0,y1,4);if(o.yMin==null){y0=tk[0];y1=tk[tk.length-1]}
  const sx=x=>pl+(x-x0)/(x1-x0)*(W-pl-pr),sy=y=>pt+(1-(y-y0)/(y1-y0))*(H-pt-pb);
  let g='';
  tk.forEach(t=>g+=`<line x1="${pl}" x2="${W-pr}" y1="${sy(t)}" y2="${sy(t)}" class="gl"/><text x="${pl-8}" y="${sy(t)+5}" text-anchor="end" class="ax">${o.yFmt?o.yFmt(t):Math.abs(t)>=1000?fmtShort(t):fmt(t,1)}</text>`);
  for(let i=0;i<=4;i++){const x=x0+(x1-x0)*i/4;g+=`<text x="${sx(x)}" y="${H-8}" text-anchor="${i===0?'start':i===4?'end':'middle'}" class="ax">${xLbl(x,x1-x0)}</text>`}
  series.forEach(s=>{const d=s.points.map((p,i)=>(i&&!p.gap?'L':'M')+sx(p.x).toFixed(1)+' '+sy(p.y).toFixed(1)).join('');
    g+=`<path d="${d}" style="fill:none;stroke:${s.color};stroke-width:${s.w||2.5};stroke-linejoin:round;stroke-linecap:round${s.dash?';stroke-dasharray:'+s.dash:''}"/>`;
    if(s.dots&&s.points.length<=120)s.points.forEach(p=>g+=`<circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="${s.points.length>50?2.2:3.4}" style="fill:${s.color}"/>`)});
  const id='c'+(chN++);CH[id]={series,sx,sy,x0,x1,W,H,pl,pr,pt,pb,unit:o.unit||''};
  const legend=series.length>1&&!o.noLegend?`<div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`:'';
  return `${legend}<svg class="chart" data-ch="${id}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map(s=>s.name).join(', '))} grafikon">${g}<g class="tt"></g></svg>`;
}
function attachCharts(){
  document.querySelectorAll('svg.chart[data-ch]').forEach(svg=>{const c=CH[svg.dataset.ch];if(!c)return;const tt=svg.querySelector('.tt');
    const show=ev=>{const r=svg.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*c.W,xv=c.x0+(x-c.pl)/(c.W-c.pl-c.pr)*(c.x1-c.x0);
      const near=(pts,t)=>{let q=null;for(const p of pts)if(!q||Math.abs(p.x-t)<Math.abs(q.x-t))q=p;return q};
      const b=near(c.series.reduce((a,s)=>a.length>=s.points.length?a:s.points,[]),xv);if(!b)return;const px=c.sx(b.x);
      const lines=[fmtDate(b.x)];c.series.forEach(s=>{const q=near(s.points,b.x);if(q&&Math.abs(q.x-b.x)<DAY*1.5)lines.push((c.series.length>1?s.name+': ':'')+(q.t??fmt(q.y,1)+c.unit))});
      const bw=Math.max(...lines.map(l=>l.length))*9.2+20,bh=lines.length*21+12;let bx=px+12;if(bx+bw>c.W-c.pr)bx=px-12-bw;
      tt.innerHTML=`<line x1="${px}" x2="${px}" y1="${c.pt}" y2="${c.H-c.pb}" style="stroke:var(--kj-muted);stroke-dasharray:3 3"/><circle cx="${px}" cy="${c.sy(b.y)}" r="6" style="fill:${c.series[0].color};stroke:var(--kj-tt);stroke-width:2.5"/><rect x="${bx}" y="${c.pt}" width="${bw}" height="${bh}" rx="9" style="fill:var(--kj-tt);stroke:var(--kj-border-strong)"/>`+lines.map((l,i)=>`<text x="${bx+10}" y="${c.pt+24+i*21}" class="ttx">${esc(l)}</text>`).join('')};
    svg.addEventListener('pointermove',show);svg.addEventListener('pointerdown',show);svg.addEventListener('pointerleave',()=>tt.innerHTML='')});
}
function barChart(labels,vals,o={}){
  const W=600,H=o.h||180,pl=48,pr=8,pt=o.sub?42:22,pb=28,max=Math.max(...vals,0,...(o.avgLine||[]).filter(x=>x!=null));
  if(!max)return `<div class="empty">${o.empty||'Az elmúlt 12 hétben nincs edzés'}</div>`;
  const step=vals.length<=8?1:Math.max(2,Math.ceil(vals.length/6)),dense=vals.length>16;
  const tk=niceTicks(0,Math.max(max,o.goal||0),3),top=tk[tk.length-1],bw=(W-pl-pr)/vals.length,ih=H-pt-pb;let g='',sb;
  tk.forEach(t=>{const y=pt+(1-t/top)*ih;g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" class="gl"/><text x="${pl-8}" y="${y+5}" text-anchor="end" class="ax">${fmtShort(t)}</text>`});
  if(o.goal){const y=pt+(1-o.goal/top)*ih;g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" style="stroke:${o.goalColor};stroke-width:2;stroke-dasharray:6 5"/>${o.goalLabel===false?'':`<text x="${W-pr}" y="${y-6}" text-anchor="end" class="bv" style="fill:${o.goalColor}">cél ${fmtShort(o.goal)}</text>`}`}
  vals.forEach((v,i)=>{const h=v/top*ih,x=pl+i*bw+bw*.18,cx=x+bw*.32;
    if(v)g+=`<rect x="${x}" y="${H-pb-h}" width="${bw*.64}" height="${h}" rx="${dense?3:5}" style="fill:${o.colorFn?o.colorFn(v):o.color};opacity:${o.opFn?o.opFn(v):1}"/>`+(dense?'':`<text x="${cx}" y="${H-pb-h-6}" text-anchor="middle" class="bv">${fmtShort(v)}</text>`)+(o.sub&&!dense&&(sb=o.sub(v))?`<text x="${cx}" y="${H-pb-h-24}" text-anchor="middle" class="bv" style="fill:${sb.color};font-weight:700">${esc(sb.text)}</text>`:'');
    if((vals.length-1-i)%step===0){const edge=cx+28>W-pr;g+=`<text x="${edge?W-pr:cx}" y="${H-8}" text-anchor="${edge?'end':'middle'}" class="ax">${labels[i]}</text>`}});
  if(o.avgLine){let d='';o.avgLine.forEach((a,i)=>{if(a==null)return;const x=pl+i*bw+bw*.5,y=pt+(1-a/top)*ih;d+=(d?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)});if(d)g+=`<path d="${d}" style="fill:none;stroke:${o.avgColor};stroke-width:3;stroke-linejoin:round;stroke-linecap:round"/>`}
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

/* ===== Import a Strong appból (CSV export) =====
   Oszlopok név szerint: Date, Workout Name, Duration, Exercise Name, Set Order, Weight, Reps, Distance, Seconds, (Weight Unit), RPE.
   Elválasztó: vessző vagy pontosvessző. A gyakorlatneveket a meglévő magyar gyakorlatokhoz rendeli, ismeretlennél újat hoz létre. */
const STRONG_MAP={
'Pull Up':'Húzódzkodás','Pull Up (Assisted)':'Húzódzkodás','Chin Up':['Húzódzkodás (fordított fogás)','Hát'],'Push Up':'Fekvőtámasz',
'Lateral Raise (Dumbbell)':'Oldalemelés (kézisúlyzó)','Hammer Curl (Dumbbell)':'Kalapács hajlítás','Bent Over Row (Dumbbell)':'Evezés (kézisúlyzó)',
'Bent Over Row (Barbell)':'Evezés (rúd)','Floor Press (Barbell)':['Padlón nyomás (rúd)','Mell'],'Floor Press (Dumbbell)':'Padlón nyomás (kézisúlyzó)',
'Concentration Curl (Dumbbell)':'Koncentrált bicepszhajlítás (kézisúlyzó)','Squat (Dumbbell)':['Guggolás (kézisúlyzó)','Láb'],'Squat (Barbell)':'Guggolás (rúd)',
'Squat (Bodyweight)':'Guggolás (saját testsúly)','Bulgarian Split Squat':'Bolgár guggolás (kézisúlyzó)','Goblet Squat (Kettlebell)':'KB goblet guggolás',
'Goblet Squat (Dumbbell)':'Goblet guggolás (kézisúlyzó)','Romanian Deadlift (Dumbbell)':'Román felhúzás (kézisúlyzó)','Romanian Deadlift (Barbell)':'Román felhúzás (rúd)',
'Deadlift (Barbell)':'Felhúzás (rúd)','Lunge (Dumbbell)':'Kitörés (kézisúlyzó)','Lunge (Bodyweight)':'Kitörés (saját testsúly)',
'Upright Row (Barbell)':['Állig húzás (rúd)','Váll'],'Upright Row (Dumbbell)':['Állig húzás (kézisúlyzó)','Váll'],
'Bicep Curl (Dumbbell)':'Bicepsz hajlítás (kézisúlyzó)','Bicep Curl (Barbell)':'Bicepsz hajlítás (rúd)','Incline Bench Press (Dumbbell)':'Ferde fekvenyomás (kézisúlyzó)',
'Bench Press (Barbell)':'Fekvenyomás (rúd)','Bench Press (Dumbbell)':'Fekvenyomás (kézisúlyzó)','Overhead Press (Barbell)':'Katonai nyomás (rúd)',
'Shoulder Press (Dumbbell)':'Vállból nyomás (kézisúlyzó)','Arnold Press (Dumbbell)':['Arnold-nyomás (kézisúlyzó)','Váll'],'Front Raise (Dumbbell)':['Előreemelés (kézisúlyzó)','Váll'],
'Incline Curl (Dumbbell)':['Ferde pados bicepszhajlítás (kézisúlyzó)','Kar'],'Triceps Extension (Barbell)':['Tricepsz nyújtás (rúd)','Kar'],
'Triceps Extension (Dumbbell)':['Tricepsz nyújtás (kézisúlyzó)','Kar'],'Triceps Pushdown (Cable - Straight Bar)':'Tricepsz letolás (kábel)',
'Standing Calf Raise (Dumbbell)':['Vádliemelés állva (kézisúlyzó)','Láb'],'Calf Press on Leg Press':'Vádliemelés (gép)','Leg Press':'Lábtolás (gép)',
'Lat Pulldown (Cable)':'Mellhez húzás (kábel)','Seated Row (Cable)':'Evezés ülve (kábel)','Face Pull (Cable)':'Face pull (kábel)','Chest Fly (Cable)':'Tárogatás (kábel)',
'Hip Thrust (Barbell)':'Csípőemelés (rúd)','Glute Bridge':'Csípőemelés (saját testsúly)','Leg Extension (Machine)':'Lábnyújtás (gép)','Lying Leg Curl (Machine)':'Lábhajlítás (gép)',
'Plank':'Plank (mp)','Crunch':'Hasprés','Hanging Leg Raise':'Lábemelés függésben','Ab Wheel':'Hasgörgő','Burpee':'Burpee','Mountain Climber':'Hegymászó',
'Kettlebell Swing':'KB swing (kétkezes)','Kettlebell Turkish Get Up':'KB török felállás (get-up)','Dips':'Tolódzkodás','Inverted Row':'Ausztrál húzódzkodás',
'Running':'Futás (aszfalt)','Running (Outdoor)':'Futás (aszfalt)','Trail Running':'Futás (terep)','Running (Treadmill)':'Futópad','Treadmill':'Futópad',
'Cycling':'Kerékpár (kültéri)','Cycling (Outdoor)':'Kerékpár (kültéri)','Cycling (Indoor)':'Terembicikli','Stationary Bike':'Terembicikli','Rowing (Machine)':'Evezőgép',
'Elliptical Trainer':'Elliptikus tréner','Stair Stepper':'Lépcsőzőgép','Walking':'Gyaloglás','Hiking':'Túrázás','Swimming':'Úszás','Jump Rope':'Ugrókötél'};
const STRONG_GENERIC=['Workout','Morning Workout','Afternoon Workout','Evening Workout','Night Workout','Extra Workout','Quick Workout','New Workout'];
function csvParse(text){
  text=text.replace(/^﻿/,'');const first=text.slice(0,text.indexOf('\n')),sep=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
  const rows=[];let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}
    else if(ch==='"')q=true;else if(ch===sep){row.push(cur);cur=''}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur=''}else cur+=ch}
  if(cur||row.length){row.push(cur);rows.push(row)}
  return rows.filter(r=>r.some(c=>c.trim()!==''));
}
const strongDur=t=>{const h=/(\d+)\s*h/.exec(t||''),m=/(\d+)\s*m/.exec(t||'');return((h?+h[1]*60:0)+(m?+m[1]:0))*60000};
function parseStrong(text,lbs){
  const rows=csvParse(text);if(rows.length<2)throw new Error('üres');
  const hd=rows[0].map(h=>h.trim().toLowerCase()),col=n=>hd.indexOf(n);
  const C={date:col('date'),name:col('workout name'),dur:col('duration'),ex:col('exercise name'),ord:col('set order'),w:col('weight'),r:col('reps'),sec:col('seconds'),dist:col('distance'),unit:col('weight unit')};
  if(C.date<0||C.ex<0||C.w<0||C.r<0)throw new Error('nem Strong-formátum');
  const num=v=>{const x=parseFloat(String(v??'').replace(',','.'));return isFinite(x)?x:0};
  const wk=new Map();let sets=0,skipped=0;
  for(const r of rows.slice(1)){
    const m=/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/.exec((r[C.date]||'').trim());if(!m){skipped++;continue}
    const ord=(r[C.ord]||'').trim();if(/rest/i.test(ord)){continue} // „Rest Timer” sorok
    const exName=(r[C.ex]||'').trim().slice(0,100);if(!exName){skipped++;continue}
    let w=num(r[C.w]),reps=Math.round(num(r[C.r]));const sec=Math.round(num(r[C.sec]));
    const dist=C.dist>=0?num(r[C.dist]):0;
    if(!reps&&sec)reps=sec; // időre végzett gyakorlat: a másodperc kerül az ismétlés helyére
    if(!reps&&!dist){skipped++;continue}
    const unitLbs=C.unit>=0?/lb/i.test(r[C.unit]||''):lbs;if(unitLbs)w=Math.round(w*0.45359237*2)/2;
    const key=r[C.date].trim()+'|'+(r[C.name]||'');
    if(!wk.has(key)){const start=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)).getTime();
      wk.set(key,{name:((r[C.name]||'').trim()||'Edzés').slice(0,100),start,end:start+(strongDur(r[C.dur])||3600000),ex:new Map()})}
    const W=wk.get(key);if(!W.ex.has(exName))W.ex.set(exName,[]);W.ex.get(exName).push({w:Math.max(0,Math.min(2000,w)),r:Math.min(10000,reps),dist,sec});sets++;
  }
  return{workouts:[...wk.values()].sort((a,b)=>a.start-b.start),sets,skipped};
}
function strongExId(name,created){
  const target=STRONG_MAP[name],hu=Array.isArray(target)?target[0]:target,cat=Array.isArray(target)?target[1]:null;
  const find=n=>S.exercises.find(e=>e.name.toLowerCase()===n.toLowerCase());
  let e=hu?find(hu):find(name);
  if(!e){const nm=hu||name,eq=/\((Barbell|Machine|Cable)/i.test(name)?'Egyéb':'Egyéb';e={id:uid(),name:nm,cat:cat||(hu?'Egyéb':eq)};S.exercises.push(e);created.add(nm)}
  return e.id;
}
async function importStrong(inp){
  const f=inp.files[0];inp.value='';if(!f)return;
  let text;try{if(f.size>20e6)throw 0;text=await f.text()}catch(e){toast('A fájl nem olvasható');return}
  let P;try{P=parseStrong(text,false)}catch(e){toast('Ez nem Strong CSV-exportnak tűnik');return}
  if(!P.workouts.length){toast('Nem találtam edzést a fájlban');return}
  const have=new Set(S.workouts.map(w=>Math.floor(w.start/60000))),fresh=P.workouts.filter(w=>!have.has(Math.floor(w.start/60000)));
  const exNames=[...new Set(P.workouts.flatMap(w=>[...w.ex.keys()]))],known=exNames.filter(n=>{const t=STRONG_MAP[n],hu=(Array.isArray(t)?t[0]:t)||n;return S.exercises.some(e=>e.name.toLowerCase()===hu.toLowerCase())}).length;
  if(!fresh.length){toast(`Mind a(z) ${P.workouts.length} edzés szerepel már – nincs mit importálni`);return}
  const fd=ts=>new Date(ts).toLocaleDateString('hu-HU',{year:'numeric',month:'short',day:'numeric'});
  const hasUnitCol=/weight unit/i.test(text.slice(0,300));
  const r=await form('Import a Strong appból',hasUnitCol?[]:[{id:'unit',label:'A súlyok mértékegysége az exportban',type:'select',value:'kg',options:[['kg','kg'],['lbs','font (lbs) – átváltom kg-ra']]}],
    {ok:'Importálás',intro:`<b>${P.workouts.length}</b> edzés (${fd(P.workouts[0].start)} – ${fd(P.workouts[P.workouts.length-1].start)}), <b>${P.sets}</b> sorozat, <b>${exNames.length}</b> gyakorlat – ebből ${known} a meglévőkhöz rendelve, ${exNames.length-known} új lesz.${fresh.length<P.workouts.length?`<br>${P.workouts.length-fresh.length} edzés már szerepel (azonos kezdési idő), ezeket kihagyom.`:''}${P.skipped?`<br>${P.skipped} üres sort (0 ismétlés) kihagyok.`:''}`});
  if(!r)return;
  if(r.unit==='lbs')P=parseStrong(text,true);
  const keep=new Set(fresh.map(w=>w.start)),created=new Set(),cnt={};
  const list=P.workouts.filter(w=>keep.has(w.start));list.forEach(w=>{if(!STRONG_GENERIC.includes(w.name))cnt[w.name]=(cnt[w.name]||0)+1});
  const out=list.map(w=>({id:uid(),name:w.name,start:w.start,end:w.end,tplId:null,exercises:[...w.ex.entries()].map(([n,sets])=>{const id=strongExId(n,created),cd=isCardio(id);return{exId:id,sets:sets.map(x=>cd?{w:Math.round((x.dist||0)*100)/100,r:Math.max(1,Math.round((x.sec||x.r*60||0)/60))}:{w:x.w,r:x.r}).filter(x=>x.r>0)}}).filter(e=>e.sets.length)}));
  // sablon a legalább 3-szor használt, nem általános nevű edzésekből (a legutóbbi felépítéssel); azonos nevű meglévő sablonhoz kapcsol
  let tplNew=0;
  for(const[name,c]of Object.entries(cnt)){if(c<3)continue;const last=out.filter(w=>w.name===name).at(-1);
    let t=S.templates.find(x=>x.name===name);if(!t){t={id:uid(),name,items:last.exercises.map(e=>({exId:e.exId,sets:e.sets.length}))};S.templates.push(t);tplNew++}
    out.forEach(w=>{if(w.name===name)w.tplId=t.id})}
  S.workouts.push(...out);
  for(const w of wSorted())w.prs=detectPRs(w); // rekordok újraszámolása időrendben
  save();go('workout');
  dlg(`<h2>${I('check','sm')} Import kész</h2><p><b>${out.length}</b> edzés és <b>${out.reduce((a,w)=>a+w.exercises.reduce((b,e)=>b+e.sets.length,0),0)}</b> sorozat importálva.${tplNew?`<br>${tplNew} sablon jött létre a gyakran használt edzésnevekből (az Edzéseim között).`:''}${created.size?`<br>Új gyakorlatok: ${[...created].map(esc).join(', ')}.`:''}</p><p class="hint">Az új gyakorlatokat a Beállítások → Gyakorlatok listában átnevezheted, kategorizálhatod.</p><div class="row end"><button class="btn p" data-click="dlgBackdrop()">Rendben</button></div>`,null);
}

/* ===== Beállítások: gyakorlatok, adatok ===== */
function vPrivacy(){
  const inst=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const off=!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
  const li=(ic,t)=>`<li class="privli"><span class="privic">${I(ic,'sm')}</span><span>${t}</span></li>`;
  return `<div class="card"><h2>${I('shield-check','sm')} Adatvédelem és offline működés</h2>
  <div class="row" style="gap:6px;margin-bottom:10px"><span class="chip ${inst?'on':''}" style="cursor:default">${I(inst?'check':'smartphone','sm')} ${inst?'Főképernyős appként fut':'Böngészőben fut'}</span><span class="chip ${off?'on':''}" style="cursor:default">${I(off?'check':'wifi-off','sm')} ${off?'Offline is elérhető':'Offline mód még nem aktív'}</span></div>
  <ul class="privlist small">
  ${li('hard-drive','<b>Minden adat csak ezen az eszközön van.</b> Nincs regisztráció, fiók, szerver, analitika, süti vagy követés. Az edzések, testadatok, étkezések és a profil a böngésző helyi tárhelyén maradnak; az app semmit nem küld el sehova.')}
  ${li('wifi-off','<b>Internet nélkül is működik.</b> Az első megnyitás után a teljes app a telefonon tárolódik, edzőteremben, térerő nélkül is használható. Ha van net, a frissítés automatikusan letöltődik.')}
  ${li('square-plus','<b>Natív appként is használható.</b> iPhone-on Safariban: <b>Megosztás</b> '+I('share','sm')+' → <b>Főképernyőhöz adás</b>. Androidon Chrome-ban: menü → <b>Alkalmazás telepítése</b>. Utána saját ikonról, teljes képernyőn, címsor nélkül indul, mint egy letöltött app.')}
  ${li('smartphone','<b>iPhone-on érdemes telepíteni.</b> A Safari a sokáig nem látogatott oldalak helyi adatait törölheti, a főképernyős appokra ez nem vonatkozik. A főképernyős app és a Safari <b>külön tárhelyet</b> használ: ami az egyikben van, az a másikban nem látszik – áthozni Mentés + Import segítségével lehet.')}
  ${li('save','<b>A mentés a te kezedben van.</b> Mivel nincs szerver, eszközcsere vagy az app törlése esetén csak a saját mentésedből állítható vissza minden. A <b>Mentés / megosztás</b> fájlt a Drive-ra, iCloudba vagy a Fájlokba teheted.')}
  ${li('external-link','<b>Étkezésnaplózás Claude-dal:</b> a gomb a Claude appot nyitja meg; amit ott leírsz vagy lefényképezel, az Anthropic szolgáltatásához kerül. Az Edzésnaplóba csak az kerül, amit vágólapról beillesztesz.')}
  </ul></div>`;
}
function vMore(){
  const cats=[...new Set(S.exercises.map(e=>e.cat))].sort(catSort);
  const usage={};for(const w of S.workouts)for(const e of w.exercises)usage[e.exId]=(usage[e.exId]||0)+1;
  return vProfile()+vPrivacy()+`<div class="card"><h2>Beállítások</h2>
  <label for="defrest">Alapértelmezett pihenőidő (mp)</label>
  <input id="defrest" type="number" min="0" max="1800" step="15" value="${S.settings.rest??90}" data-change="setDefRest(this.value)">
  <div class="hint">Pipálás után indul. Gyakorlatonként felülírható (edzés közben a gyakorlat neve alatti időre koppintva, vagy lent a listában). 0 = kikapcsolva.</div>
  <label>Hangjelzés a pihenő végén</label>
  <div class="row" style="gap:6px">${[[0,'Ki'],[1,'Halk'],[2,'Közepes'],[3,'Hangos']].map(([v,l])=>`<button class="chip ${(S.settings.sound??3)===v?'on':''}" data-click="setSound(${v})">${l}</button>`).join('')}<button class="btn sm" data-click="testSound()">Teszt</button></div>
  <div class="hint">iPhone-on a némító kapcsoló (csengő ki) a hangot is elnémítja. Lezárt képernyőnél vagy háttérben a böngésző szünetelteti az időzítőt – ezt a lenti ébren tartás megelőzi.</div>
  <label>Képernyő ébren tartása edzés közben</label>
  ${wakeSupported()?`<div class="chips" style="margin:0">${[[true,'Be'],[false,'Ki']].map(([v,l])=>`<button class="chip ${(S.settings.wakeLock!==false)===v?'on':''}" data-click="setWake(${v})">${l}</button>`).join('')}</div>
  <div class="hint">Futó edzés alatt a képernyő nem sötétül el és nem zár le, így a pihenő-visszaszámlálás és a hangjelzés is működik. Az edzés befejezésekor automatikusan kikapcsol. Több akkumulátort fogyaszt.</div>`
  :`<div class="hint">Ez a böngésző nem támogatja (iPhone-on iOS 16.4 vagy újabb kell).</div>`}
  <label for="claudeurl">Claude-projekt linkje (étkezésnapló)</label>
  <input id="claudeurl" type="url" inputmode="url" autocomplete="off" value="${esc(S.settings.claudeUrl||'')}" placeholder="https://claude.ai/project/…" data-change="setClaudeUrl(this.value)">
  <div class="hint">A claude.ai-on nyisd meg a projektet, és másold be a címsorból. Az Étkezés fülön a „Claude” gomb ezt nyitja meg új böngészőlapon.</div>
  <label for="stepgoal">Napi lépéscél</label>
  <input id="stepgoal" type="number" min="0" max="100000" step="500" inputmode="numeric" value="${S.settings.stepGoal||''}" placeholder="nincs cél" data-change="setStepGoal(this.value)">
  <div class="hint">A statisztikában szaggatott vonal jelzi, a célt elérő napok zöldek. Üresen hagyva nincs cél.</div>
  <label>Megjelenés</label>
  <div class="chips" style="margin:0">${[[null,'Rendszer szerint'],['light','Világos'],['dark','Sötét']].map(([v,l])=>`<button class="chip ${S.settings.theme===v?'on':''}" data-click="setTheme(${v?`'${v}'`:'null'})">${l}</button>`).join('')}</div></div>
  <div class="card"><h2>Mentés</h2><div class="hint" style="margin:0 0 12px">Minden adat csak ezen az eszközön, a böngésző helyi tárhelyén van – semmi nem kerül szerverre. A <b>Mentés / megosztás</b> a telefon megosztás menüjét nyitja meg: innen menthetsz Google Drive-ra, a Fájlok appba vagy iCloud Drive-ra. Visszatöltés: <b>Import</b>, majd a fájl kiválasztása (a Drive is megjelenik a fájlválasztóban, ha telepítve van).</div>
  <div class="stat" style="margin-bottom:12px"><b style="font-size:16px">${S.settings.lastBackup?fmtDate(S.settings.lastBackup)+' · '+fmtTime(S.settings.lastBackup):'Még nem volt'}</b><span>Utolsó mentés</span></div>
  <div class="row"><button class="btn p" data-click="exportData()">${I(canShareFiles()?'share':'download','sm')} Mentés / megosztás</button><button class="btn" data-click="openImport()">${I('folder-open','sm')} Import</button><input type="file" id="imp" accept=".json,application/json" style="display:none" data-change="importData(this)"></div>
  <h3 style="margin-top:16px">Export CSV-ben</h3>
  <div class="csvgrid">${[['workouts','Edzések','Strong-formátum'],['body','Testadatok','napi'],['steps','Lépések','napi'],['meals','Étkezés – tételek','makrók, rost'],['mealdays','Étkezés – napi','összesítő']].map(([k,l,h])=>`<button class="btn sm" data-click="exportCsv('${k}')">${I('download','sm')} <span style="text-align:left">${l}<br><small class="mut">${h}</small></span></button>`).join('')}</div>
  <div class="hint">A magyar táblázatok pontosvesszővel és tizedesvesszővel készülnek (Excel, Numbers közvetlenül megnyitja). Az edzések a Strong app CSV-formátumában, így ide vagy más appba vissza is importálhatók.</div>
  <h3 style="margin-top:16px">Import</h3>
  <div class="row" style="margin-top:6px"><button class="btn" data-click="openStrong()">${I('upload','sm')} Import Strong appból (CSV)</button><input type="file" id="impStrong" accept=".csv,text/csv,text/comma-separated-values" style="display:none" data-change="importStrong(this)"></div>
  <div class="hint">Strong app → Profil → Beállítások → Adatok exportálása. Az edzéseket hozzáadja a meglévőkhöz; az újraimportált (azonos kezdési idejű) edzéseket kihagyja.</div>
  <div class="row" style="margin-top:10px"><button class="btn gold" data-click="demoData()">Mintaadatok</button><span class="sp"></span><button class="btn d" data-click="resetAll()">${I('trash-2','sm')} Minden törlése</button></div></div>
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
/* ===== CSV-export =====
   Magyar táblázatok: pontosvessző, tizedesvessző, UTF-8 BOM (Excel/Numbers helyesen nyitja).
   Edzések: a Strong app formátumában (vessző, tizedespont, angol fejléc) – ugyanígy vissza is importálható. */
function csvCell(v,sep){if(v==null)return'';let s=String(v);if(/^[=+\-@\t\r]/.test(s)&&isNaN(+s))s="'"+s; // képletbefecskendezés ellen
  return /["\n\r]/.test(s)||s.includes(sep)?'"'+s.replace(/"/g,'""')+'"':s}
function csvBuild(head,rows,sep=';'){return'﻿'+[head,...rows].map(r=>r.map(c=>csvCell(c,sep)).join(sep)).join('\r\n')}
const hu=(v,d=1)=>v==null||v===''||isNaN(v)?'':String(Math.round(v*10**d)/10**d).replace('.',',');
const csvName=n=>`edzesnaplo-${n}-${today()}.csv`;
function csvWorkouts(){
  const z=n=>String(n).padStart(2,'0'),dt=ts=>{const d=new Date(ts);return`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`};
  const durS=w=>{const m=Math.max(1,Math.round((w.end-w.start)/60000)),h=Math.floor(m/60);return(h?h+'h ':'')+(m%60)+'m'};
  const rows=[];for(const w of wSorted())for(const e of w.exercises){const cd=isCardio(e.exId);e.sets.forEach((s,i)=>rows.push([dt(w.start),w.name,durS(w),exName(e.exId),i+1,cd?0:s.w,cd?0:s.r,cd?s.w||0:0,cd?(s.r||0)*60:0,'','','']))}
  return csvBuild(['Date','Workout Name','Duration','Exercise Name','Set Order','Weight','Reps','Distance','Seconds','Notes','Workout Notes','RPE'],rows,',');
}
function csvBody(){const rows=bodySorted().filter(hasMeas).map(b=>{const fm=b.weight!=null&&b.fat!=null?b.weight*b.fat/100:null;return[b.date,hu(b.weight),hu(b.fat),hu(fm),fm==null?'':hu(b.weight-fm),hu(b.waist)]});
  return csvBuild(['datum','testsuly_kg','testzsir_szazalek','zsirtomeg_kg','zsirmentes_tomeg_kg','derekboseg_cm'],rows)}
function csvSteps(){return csvBuild(['datum','lepes'],bodySorted().filter(b=>b.steps!=null).map(b=>[b.date,b.steps]))}
function csvMealItems(){const ord=k=>MEALS.findIndex(m=>m[0]===k);
  const rows=[...S.meals].sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:ord(a.meal)-ord(b.meal)).map(m=>[m.date,mealLbl(m.meal),m.name,m.kcal,hu(m.p),hu(m.c),hu(m.f),hu(m.fib)]);
  return csvBuild(['datum','etkezes','megnevezes','energia_kcal','feherje_g','szenhidrat_g','zsir_g','rost_g'],rows)}
function csvMealDays(){const by={};for(const m of S.meals)(by[m.date]=by[m.date]||[]).push(m);const t=targets();
  const rows=Object.keys(by).sort().map(d=>{const s=sumMeals(by[d]);return[d,by[d].length,Math.round(s.kcal),hu(s.p),hu(s.c),hu(s.f),hu(s.fib),t.kcal||'',t.kcal?Math.round(s.kcal-t.kcal):'']});
  return csvBuild(['datum','tetelek','energia_kcal','feherje_g','szenhidrat_g','zsir_g','rost_g','javasolt_kcal','elteres_kcal'],rows)}
const CSV_EXP={workouts:['edzesek',csvWorkouts,()=>S.workouts.length],body:['testadatok',csvBody,()=>S.body.filter(hasMeas).length],steps:['lepesek',csvSteps,()=>S.body.filter(b=>b.steps!=null).length],
  meals:['etkezes-tetelek',csvMealItems,()=>S.meals.length],mealdays:['etkezes-napi',csvMealDays,()=>new Set(S.meals.map(m=>m.date)).size]};
async function exportCsv(k){const x=CSV_EXP[k];if(!x)return;if(!x[2]()){toast('Ehhez még nincs adat');return}
  if(await shareOrDownload(csvName(x[0]),x[1](),'text/csv','Edzésnapló – '+x[0]))toast('CSV elkészült')}

async function importData(inp){const f=inp.files[0];inp.value='';if(!f)return;
  let d;try{if(f.size>20e6)throw 0;d=sanitizeState(JSON.parse(await f.text()))}catch(e){toast('Hibás vagy nem támogatott fájl');return}
  if(!await ask(`A fájlban ${d.workouts.length} edzés és ${d.body.length} mérés van. Felülírja a jelenlegi adatokat?`,{title:'Importálás',ok:'Felülírás',danger:true}))return;
  if(d.v<DATA_V){addDefaults(d);d.v=DATA_V}S=d;save();applyTheme();render();toast('Importálva')}
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
    {let b=S.body.find(x=>x.date===key);if(!b){b={date:key};S.body.push(b)}if(b.steps==null)b.steps=Math.round(4500+Math.random()*9500)}
    if(tpls.length&&[1,2,4,6].includes(d.getDay())&&Math.random()<.85){const t=tpls[k++%tpls.length],prog=1+(120-i)*.0011;
      const st=new Date(d);st.setHours(17,30+Math.floor(Math.random()*40));
      const w={id:uid(),name:t.name,tplId:t.id,start:st.getTime(),end:st.getTime()+(45+Math.random()*30)*60000,exercises:t.items.map(it=>{const n=exName(it.exId),b=base[n]??20;
        return{exId:it.exId,sets:Array.from({length:it.sets},(_,j)=>isCardio(it.exId)?{w:Math.round((4+Math.random()*6+(120-i)/40)*10)/10,r:Math.round(25+Math.random()*25)}:kb(n)?{w:b+(i<50?4:0),r:n.includes('get-up')?1:n.includes('halo')||n.includes('windmill')?5:10}:b?{w:Math.round(b*prog*(Math.random()<.15?1.03:1)/2.5)*2.5,r:Math.max(3,8-j-Math.floor(Math.random()*2))}:{w:0,r:Math.round(6+(120-i)/30+Math.random()*2-j)})}})};
      w.prs=detectPRs(w);S.workouts.push(w)}}
  {const F=[['reggeli','Zabkása 60 g tejjel, banán',420,16,68,9,8],['reggeli','Rántotta 3 tojásból, kenyér',480,26,30,27,3],['tizorai','Görög joghurt 200 g',190,18,8,9,0],['ebed','Csirkemell 150 g, rizs 180 g',490,51,52,7,2],['ebed','Bolognai spagetti',680,34,82,22,7],['uzsonna','Alma, mandula 30 g',260,7,27,15,8],['vacsora','Lazac 150 g, zöldség',430,34,12,27,6],['vacsora','Túrós tészta',620,30,80,19,3],['nasi','Fehérjeszelet',210,20,22,7,4]];
   const t0=new Date();t0.setHours(0,0,0,0);
   for(let i=60;i>=1;i--){if(Math.random()<.15)continue;const d=new Date(t0);d.setDate(d.getDate()-i);const key=ymd(d);if(S.meals.some(m=>m.date===key))continue;
     for(const mk of['reggeli','ebed','uzsonna','vacsora']){if(mk==='uzsonna'&&Math.random()<.4)continue;const o=F.filter(x=>x[0]===mk||(mk==='uzsonna'&&x[0]==='tizorai')),x=o[Math.floor(Math.random()*o.length)],k=.85+Math.random()*.3;
       S.meals.push({id:uid(),date:key,meal:mk,name:x[1],kcal:Math.round(x[2]*k),p:Math.round(x[3]*k),c:Math.round(x[4]*k),f:Math.round(x[5]*k),fib:Math.round(x[6]*k)})}}}
  save();toast('Mintaadatok betöltve');render();
}

S=load();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
  const had=!!navigator.serviceWorker.controller;
  addEventListener('load',()=>navigator.serviceWorker.register('edzesnaplo-sw.js',{scope:'edzesnaplo.html'}).catch(e=>console.warn('Service worker:',e)));
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)toast('Új verzió telepítve – a következő indításkor aktív')});
}
applyTheme();render();
