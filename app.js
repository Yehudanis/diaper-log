(() => {
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS = { get(k){try{return localStorage.getItem(k)}catch(e){return null}}, set(k,v){try{localStorage.setItem(k,v); return true}catch(e){return false}} };

const BRISTOL = [
  {n:1,lbl:'גושים קשים נפרדים',sub:'כמו אגוזים, קשה להוציא'},
  {n:2,lbl:'נקניק גושי',sub:'בצורת נקניק אך גושי'},
  {n:3,lbl:'נקניק עם סדקים',sub:'סדקים על פני השטח'},
  {n:4,lbl:'נקניק חלק ורך',sub:'כמו נחש, חלק — תקין'},
  {n:5,lbl:'חתיכות רכות',sub:'שוליים ברורים, יוצא בקלות'},
  {n:6,lbl:'עיסתי',sub:'חתיכות רכות, שוליים מרופטים'},
  {n:7,lbl:'מימי לגמרי',sub:'ללא חלקים מוצקים'},
];
const bColor = n => n<=2 ? 'var(--warn)' : n<=4 ? 'var(--ok)' : n===5 ? 'var(--warn)' : 'var(--bad)';
const TYPES = { dry:{full:'יבש לגמרי'}, urine:{full:'שתן בלבד'}, stool:{full:'שתן ויציאה'} };

function bristolSvg(n){
  const c='var(--brown)';
  const g = {
    1:`<circle cx="14" cy="22" r="7"/><circle cx="32" cy="16" r="6"/><circle cx="48" cy="25" r="7"/><circle cx="64" cy="17" r="5.5"/><circle cx="80" cy="23" r="6.5"/>`,
    2:`<path d="M8 20c0-7 8-10 14-8 4-5 12-5 16 0 5-4 13-4 17 1 5-4 13-3 17 2 6-1 13 3 13 9s-7 10-13 9c-4 5-12 5-17 1-5 4-12 4-17 0-5 4-12 4-16-1-7 2-14-3-14-9z"/>`,
    3:`<rect x="8" y="12" width="80" height="17" rx="8.5"/><path d="M26 12v6M42 29v-6M58 12v5M72 29v-6" stroke="var(--surface)" stroke-width="2" fill="none"/>`,
    4:`<path d="M10 24c10-14 22 4 38-4s26-8 38 0" stroke="${c}" stroke-width="11" fill="none" stroke-linecap="round"/>`,
    5:`<ellipse cx="18" cy="22" rx="11" ry="7"/><ellipse cx="44" cy="18" rx="10" ry="7"/><ellipse cx="70" cy="23" rx="12" ry="7"/>`,
    6:`<path d="M10 26c2-8 9-9 13-6 2-7 11-8 15-3 4-6 13-5 16 1 4-4 12-3 15 2 5-2 11 1 12 6 1 6-5 9-10 8-4 3-10 3-13-1-5 3-12 3-15-1-5 3-12 2-15-2-6 2-12-1-18-4z"/>`,
    7:`<path d="M6 28c6-9 18-12 30-8 10-6 26-6 36 0 8-2 16 1 18 8-6 5-18 6-28 4-10 3-24 3-34 0-9 2-17 0-22-4z" opacity=".75"/><circle cx="30" cy="14" r="2.5"/><circle cx="62" cy="12" r="2"/>`,
  }[n];
  return `<svg viewBox="0 0 96 40" aria-hidden="true" fill="${c}">${g}</svg>`;
}
const typeIcon = (t,s=40) => ({
  dry:`<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><path d="M6 10h28l-3 18c-1 4-5 6-11 6S10 32 9 28z" fill="none" stroke="var(--muted)" stroke-width="2.5"/></svg>`,
  urine:`<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 5c6 9 10 14 10 20a10 10 0 0 1-20 0c0-6 4-11 10-20z" fill="#e2b93b"/></svg>`,
  stool:`<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4c2 3 1 5-1 6 6 0 9 3 8 7 5 1 7 4 6 8 4 2 5 5 4 8H3c-1-3 0-6 4-8-1-4 1-7 6-8-1-4 3-7 7-7z" fill="var(--brown)"/></svg>`,
}[t]);

const AV_COLORS = ['#1f7a6c','#6b5aa6','#a65a3c','#3c6aa6','#7a6a1f','#a63c6b'];
function avatar(p, size){
  const ini = (p.name||'?').split(' ').map(w=>w[0]).slice(0,2).join('');
  const col = AV_COLORS[[...(p.id||'x')].reduce((a,c)=>a+c.charCodeAt(0),0)%AV_COLORS.length];
  const inner = p.photoUrl ? `<img src="${esc(p.photoUrl)}" alt="">` : esc(ini);
  return `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${size*.38}px;background:${col}">${inner}</div>`;
}

const fmtTime = ts => new Date(ts).toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'});
const fmtDay = ts => { const d=new Date(ts), t=new Date(), y=new Date(); y.setDate(t.getDate()-1);
  if(d.toDateString()===t.toDateString()) return 'היום'; if(d.toDateString()===y.toDateString()) return 'אתמול';
  return d.toLocaleDateString('he-IL',{day:'numeric',month:'numeric'}); };
function ago(ts){ const m=Math.round((Date.now()-ts)/60000); if(m<1) return 'עכשיו'; if(m<60) return `לפני ${m} דק׳`;
  const h=Math.floor(m/60), mm=m%60; return `לפני ${h}:${String(mm).padStart(2,'0')} ש׳`; }
const startOfToday = () => { const d=new Date(); d.setHours(0,0,0,0); return d.getTime(); };
const lines = s => String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);

/* ---------- local store ---------- */
const KEY='diaperlog.v1';
function seed(){
  const H=3600000, n=Date.now();
  const cg=[{id:'c1',name:'נועה (הדגמה)',role:'אחות'},{id:'c2',name:'אבי (הדגמה)',role:'מטפל'},{id:'c3',name:'מרים (הדגמה)',role:'כוח עזר'}];
  const patients={
    P001:{id:'P001',name:'משה לוי (הדגמה)',age:84,room:'12א',idTail:'4821',intervalHours:4,conditions:['דמנציה בינונית','סוכרת סוג 2','אי-שליטה כפולה'],allergies:['לטקס'],alerts:['פצע לחץ בעכוז – דרגה 2'],instructions:['להשתמש בכפפות ניטריל בלבד','למרוח משחת הגנה בכל החלפה','שינוי תנוחה כל שעתיים']},
    P002:{id:'P002',name:'רחל כהן (הדגמה)',age:91,room:'12ב',idTail:'0377',intervalHours:3,conditions:['אחרי שבץ – המיפלגיה שמאלית','יתר לחץ דם'],allergies:[],alerts:['סיכון נפילה גבוה'],instructions:['העברה עם שני מטפלים','מעקב יציאות – נוטה לעצירות']},
    P003:{id:'P003',name:'יוסף מזרחי (הדגמה)',age:78,room:'14',idTail:'9152',intervalHours:4,conditions:['פרקינסון','אי-שליטה במתן שתן'],allergies:['פניצילין'],alerts:[],instructions:['לעודד שתייה – יעד 1.5 ליטר ביום']},
    P004:{id:'P004',name:'שרה אברהם (הדגמה)',age:87,room:'15',idTail:'6604',intervalHours:4,conditions:['אי-ספיקת לב','מקבלת משתנים'],allergies:[],alerts:['שלשולים ב-24 השעות האחרונות – לדווח לאחות'],instructions:['לתעד כל יציאה מימית','לבדוק אדמומיות בעור']},
  };
  const raw=[['P001',1.5,'urine',null,'','c1'],['P001',5,'stool',4,'','c2'],['P001',9,'urine',null,'אדמומיות קלה','c2'],['P001',26,'stool',3,'','c3'],['P001',30,'dry',null,'','c1'],
    ['P002',3.2,'urine',null,'','c1'],['P002',7,'urine',null,'','c3'],['P002',49,'stool',1,'מאמץ ביציאה','c2'],
    ['P003',0.8,'dry',null,'','c2'],['P003',4.5,'urine',null,'','c1'],['P003',25,'stool',4,'','c3'],
    ['P004',2.1,'stool',6,'','c1'],['P004',6,'stool',7,'הודע לאחות','c2'],['P004',22,'stool',5,'','c3']];
  const changes=raw.map((r,i)=>({id:'d'+i,patientId:r[0],ts:n-Math.round(r[1]*H),type:r[2],bristol:r[3],note:r[4],caregiverId:r[5],caregiverName:cg.find(c=>c.id===r[5]).name}));
  return {patients,caregivers:cg,changes};
}
function load(){ try{ const d=JSON.parse(LS.get(KEY)); if(d&&d.patients) return d; }catch(e){} const d=seed(); LS.set(KEY,JSON.stringify(d)); return d; }
const DATA = load();
function persist(){ if(DATA.changes.length>5000) DATA.changes=DATA.changes.sort((a,b)=>b.ts-a.ts).slice(0,5000);
  if(!LS.set(KEY,JSON.stringify(DATA))) flash('השמירה בזיכרון הטלפון נכשלה – ייתכן שאין מקום פנוי'); }
const uid = p => p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);

/* ---------- state ---------- */
const S = { view:'list', pid:null, q:'', cg: LS.get('caregiver'), flow:null, toast:null, scanMsg:null, edit:null, confirmDel:false };
const cgName = id => (DATA.caregivers.find(c=>c.id===id)||{}).name;
const forPatient = pid => DATA.changes.filter(c=>c.patientId===pid).sort((a,b)=>b.ts-a.ts);
function status(pid){
  const p=DATA.patients[pid]; const last=forPatient(pid)[0]; const limitH=(p&&p.intervalHours)||4;
  if(!last) return {cls:'neutral',txt:'אין רישום'};
  const h=(Date.now()-last.ts)/3600000;
  if(h>=limitH) return {cls:'bad',txt:'הגיע זמן החלפה'};
  if(h>=limitH-1) return {cls:'warn',txt:'בקרוב'};
  return {cls:'ok',txt:'תקין'};
}
function go(view,pid){ S.view=view; S.pid=pid??S.pid; S.confirmDel=false; render(); window.scrollTo(0,0); }

/* Android back button: returns true when handled inside the app */
window.appBack = () => {
  if(CAM.on){ stopCam(); return true; }
  if(S.flow){ S.flow=null; render(); return true; }
  if(S.view==='edit'){ go(S.edit&&S.edit.isNew?'list':'patient'); return true; }
  if(S.view!=='list'){ go('list'); return true; }
  return false;
};

/* ---------- render ---------- */
function render(){
  const app=$('#app');
  let h = `<div class="topbar">
    <button class="link" id="homeBtn">${S.view==='list'?'':'→ כל המטופלים'}</button>
    <button class="who" id="whoBtn">מטפל/ת: <b>${esc(cgName(S.cg)||'בחר/י')}</b></button></div>`;
  h += ({list:viewList,patient:viewPatient,qr:viewQr,cg:viewCaregivers,edit:viewEdit}[S.view]||viewList)();
  app.innerHTML = h;
  if(S.flow) app.insertAdjacentHTML('beforeend', viewFlow());
  if(S.toast) app.insertAdjacentHTML('beforeend', `<div class="toast" role="status">${esc(S.toast)}</div>`);
  bind();
}
const camIcon = () => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3"/><path d="M7 8v8M10 8v8M13 8v8M16 8v8"/></svg>`;

function viewList(){
  const ids=Object.keys(DATA.patients).sort((a,b)=>(DATA.patients[a].name||'').localeCompare(DATA.patients[b].name||'','he'));
  const q=S.q.trim();
  const rows = ids.filter(id=>{const p=DATA.patients[id]; return !q || (p.name||'').includes(q) || String(p.room||'').includes(q) || id.includes(q);}).map(id=>{
    const p=DATA.patients[id]; const st=status(id); const last=forPatient(id)[0];
    return `<button class="prow" data-open="${esc(id)}">${avatar(p,48)}
      <div class="grow"><div class="nm">${esc(p.name)}</div><div class="small muted">חדר ${esc(p.room||'—')} · ${last?('החלפה אחרונה '+ago(last.ts)):'אין רישום'}</div></div>
      <span class="chip ${st.cls}">${st.txt}</span></button>`;
  }).join('');
  return `<div style="display:flex;flex-direction:column;gap:4px"><h1>יומן טיטולים</h1>
      <p class="muted" style="margin:0">סרקו את הברקוד שעל הצמיד או על כיסא הגלגלים כדי לפתוח את כרטיס המטופל.</p></div>
    <button class="btn big" id="scanBtn">${camIcon()} סריקת ברקוד</button>
    ${S.scanMsg?`<div class="banner">${esc(S.scanMsg)}</div>`:''}
    <input class="search" id="search" type="search" placeholder="חיפוש לפי שם או חדר" value="${esc(S.q)}">
    <div class="plist">${rows || '<p class="muted">אין מטופלים. הוסיפו מטופל ראשון בכפתור למטה.</p>'}</div>
    <button class="btn ghost" id="addPatient">+ הוספת מטופל</button>
    <div class="row2"><button class="btn ghost" data-go="qr">ברקודים להדפסה</button><button class="btn ghost" data-go="cg">ניהול מטפלים</button></div>`;
}

function viewPatient(){
  const p=DATA.patients[S.pid];
  if(!p) return `<div class="panel"><h2>לא נמצא מטופל עם הקוד ${esc(S.pid)}</h2><p class="muted" style="margin:0">ייתכן שהברקוד שייך למחלקה אחרת. נסו לסרוק שוב או לבחור מהרשימה.</p></div>`;
  const list=forPatient(S.pid); const last=list[0]; const today=list.filter(c=>c.ts>=startOfToday());
  const lastStool=list.find(c=>c.type==='stool'); const st=status(S.pid);
  const sinceCls = st.cls==='bad'?'bad':st.cls==='warn'?'warn':'';
  const stools=list.filter(c=>c.type==='stool').slice(0,7).reverse();
  const hist=list.slice(0,10).map(c=>`<div class="hrow">
      <div><div class="t">${fmtTime(c.ts)}</div><div class="small muted">${fmtDay(c.ts)}</div></div>
      <div style="min-width:0"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><b>${TYPES[c.type]?.full||''}</b>${c.bristol?`<span class="chip" style="background:${bColor(c.bristol)};color:#fff">בריסטול ${c.bristol}</span>`:''}</div>
        ${c.note?`<div class="small">${esc(c.note)}</div>`:''}<div class="cg">${esc(cgName(c.caregiverId)||c.caregiverName||'')}</div></div>
      <div>${c.bristol?`<div style="width:56px">${bristolSvg(c.bristol)}</div>`:typeIcon(c.type,28)}</div></div>`).join('');
  return `<section class="panel"><div class="idcard">${avatar(p,84)}
      <div class="grow"><h1>${esc(p.name)}</h1>
        <div class="verify">גיל ${esc(p.age||'—')} · חדר ${esc(p.room||'—')} · ת״ז ${esc(p.idTail?('…'+p.idTail):'—')}</div>
        <div><span class="chip ${st.cls}">${st.txt}</span></div></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="small muted">אמתו זהות מול התמונה והצמיד.</span><button class="link" id="editPatient">עריכת פרטים</button></div></section>
    <div class="stats">
      <div class="stat ${sinceCls}"><span class="l">מאז ההחלפה האחרונה</span><span class="v">${last?ago(last.ts).replace('לפני ',''):'—'}</span><span class="l">${last?fmtTime(last.ts):''}</span></div>
      <div class="stat"><span class="l">החלפות היום</span><span class="v">${today.length}</span><span class="l">${today.filter(c=>c.type==='stool').length} עם יציאה</span></div>
      <div class="stat"><span class="l">יציאה אחרונה</span><span class="v">${lastStool?fmtDay(lastStool.ts):'—'}</span><span class="l">${lastStool?('בריסטול '+lastStool.bristol):''}</span></div>
    </div>
    ${(p.allergies||[]).length||(p.alerts||[]).length?`<section class="panel"><h2>התראות</h2><div class="tags">${(p.alerts||[]).map(a=>`<span class="tag alert">${esc(a)}</span>`).join('')}${(p.allergies||[]).map(a=>`<span class="tag alert">אלרגיה: ${esc(a)}</span>`).join('')}</div></section>`:''}
    <section class="panel"><h2>מצב רפואי</h2><div class="tags">${(p.conditions||[]).map(c=>`<span class="tag">${esc(c)}</span>`).join('')||'<span class="muted">—</span>'}</div></section>
    <section class="panel"><h2>הנחיות טיפול</h2>${(p.instructions||[]).length?`<ul class="instr">${p.instructions.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:'<span class="muted">—</span>'}
      <div class="small muted">תדירות החלפה מומלצת: כל ${esc(p.intervalHours||4)} שעות</div></section>
    ${stools.length?`<section class="panel"><h2>מגמת יציאות (סולם בריסטול)</h2><div class="trend">${stools.map(c=>`<div class="d"><div class="n" style="background:${bColor(c.bristol)}">${c.bristol}</div>${fmtDay(c.ts)}</div>`).join('')}</div></section>`:''}
    <section class="panel"><h2>החלפות אחרונות</h2><div class="hist">${hist||'<p class="muted" style="margin:0">עדיין אין רישומים. החלפה ראשונה תופיע כאן.</p>'}</div></section>
    <div class="sticky-cta"><div class="inner"><button class="btn big" id="startFlow">התחלת החלפת טיטול</button></div></div>`;
}

function viewFlow(){
  const f=S.flow; const p=DATA.patients[S.pid]||{};
  const stepsN = f.type==='stool'?3:2; const cur = f.step==='type'?1:f.step==='bristol'?2:stepsN;
  let body='';
  if(f.step==='cg'){
    body=`<h2>מי מבצע/ת את ההחלפה?</h2><div class="cglist">${DATA.caregivers.map(c=>`<button class="choice" data-cg="${esc(c.id)}">${esc(c.name)}<small>${esc(c.role||'')}</small></button>`).join('')||'<p class="muted">אין מטפלים ברשימה. הוסיפו ב״ניהול מטפלים״.</p>'}</div>`;
  } else if(f.step==='type'){
    body=`<h2>מה היה בטיטול?</h2>
      ${['dry','urine','stool'].map(t=>`<button class="choice ${f.type===t?'sel':''}" data-type="${t}">${typeIcon(t)}<span>${TYPES[t].full}${t==='stool'?'<small>תתבקשו לסמן את סוג היציאה</small>':''}</span></button>`).join('')}`;
  } else if(f.step==='bristol'){
    body=`<h2>סוג היציאה לפי סולם בריסטול</h2><div class="scale-ends"><span>1 · יבש וקשה</span><span>7 · מימי לגמרי</span></div>
      <div class="bristol">${BRISTOL.map(b=>`<button class="bopt ${f.bristol===b.n?'sel':''}" data-b="${b.n}">
        <span class="num" style="background:${bColor(b.n)}">${b.n}</span>${bristolSvg(b.n)}<span><span class="lbl">${b.lbl}</span><br><span class="sub">${b.sub}</span></span></button>`).join('')}</div>`;
  } else if(f.step==='confirm'){
    const b=f.bristol&&BRISTOL[f.bristol-1];
    body=`<h2>אישור ושמירה</h2><div class="summary">
        <div><b>${esc(p.name)}</b> · ${fmtTime(Date.now())}</div>
        <div>${TYPES[f.type].full}${b?` · בריסטול ${b.n} (${b.lbl})`:''}</div>
        <div class="small muted">מטפל/ת: ${esc(cgName(S.cg))}</div></div>
      <label for="note" class="small muted">הערה (לא חובה) — למשל אדמומיות בעור, דם, ריח חריג</label>
      <textarea id="note">${esc(f.note||'')}</textarea>
      <button class="btn big" id="save">שמירת ההחלפה</button>`;
  }
  const back = f.step==='bristol'||f.step==='confirm' ? `<button class="link" id="flowBack">→ חזרה</button>` : '';
  return `<div class="scrim" id="scrim"><div class="sheet" role="dialog" aria-modal="true">
    <div class="sheet-head"><div style="display:flex;align-items:center;gap:10px">${avatar(p,36)}<b>${esc(p.name||'')}</b></div>
      <button class="link" id="flowClose">ביטול</button></div>
    ${f.step!=='cg'?`<div class="steps">${Array.from({length:stepsN},(_,i)=>`<i class="${i<cur?'on':''}"></i>`).join('')}</div>`:''}
    ${body}${back}</div></div>`;
}

function viewQr(){
  const ids=Object.keys(DATA.patients).sort();
  const cards=ids.map(id=>{ const qr=qrcode(0,'M'); qr.addData(id); qr.make();
    return `<div class="qrcard"><img src="${qr.createDataURL(8,2)}" alt=""><div class="nm">${esc(DATA.patients[id].name)}</div><div class="small">חדר ${esc(DATA.patients[id].room||'—')} · ${esc(id)}</div></div>`; }).join('');
  return `<div style="display:flex;flex-direction:column;gap:4px"><h1>ברקודים לצמידים ולכיסאות</h1>
    <p class="muted" style="margin:0">כל ברקוד מכיל את קוד המטופל. צלמו מסך והדפיסו, או הדביקו על הצמיד ועל הכיסא.</p></div>
    <div class="qrgrid">${cards||'<p class="muted">אין מטופלים עדיין.</p>'}</div>`;
}

function viewCaregivers(){
  return `<h1>ניהול מטפלים</h1><div class="panel"><div class="cglist">${DATA.caregivers.map(c=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <span><b>${esc(c.name)}</b> <span class="small muted">${esc(c.role||'')}</span></span>
      <span style="display:flex;gap:12px;align-items:center">${S.cg===c.id?'<span class="chip ok">את/ה</span>':`<button class="link" data-pickcg="${esc(c.id)}">זה/זו אני</button>`}<button class="link danger" data-delcg="${esc(c.id)}">הסרה</button></span></div>`).join('')||'<span class="muted">אין מטפלים עדיין.</span>'}</div></div>
    <div class="panel form"><h2>הוספת מטפל/ת</h2><input id="cgName" placeholder="שם מלא"><input id="cgRole" placeholder="תפקיד (לא חובה)"><button class="btn" id="cgAdd">הוספה</button></div>`;
}

function viewEdit(){
  const e=S.edit;
  return `<h1>${e.isNew?'מטופל חדש':'עריכת פרטי מטופל'}</h1>
  <div class="panel form">
    <div class="photo-row">${avatar(e,84)}<div style="display:flex;flex-direction:column;gap:6px"><button class="btn ghost" id="takePhoto">${e.photoUrl?'צילום מחדש':'צילום תמונה'}</button>${e.photoUrl?'<button class="link danger" id="rmPhoto">הסרת תמונה</button>':''}</div></div>
    <label>שם מלא<input id="f_name" value="${esc(e.name)}"></label>
    <div class="grid2"><label>גיל<input id="f_age" inputmode="numeric" value="${esc(e.age)}"></label><label>חדר<input id="f_room" value="${esc(e.room)}"></label></div>
    <div class="grid2"><label>4 ספרות אחרונות ת״ז<input id="f_idTail" inputmode="numeric" maxlength="4" value="${esc(e.idTail)}"></label><label>החלפה כל (שעות)<input id="f_interval" inputmode="numeric" value="${esc(e.intervalHours||4)}"></label></div>
    <label>מצב רפואי (שורה לכל פריט)<textarea id="f_conditions">${esc((e.conditions||[]).join('\n'))}</textarea></label>
    <label>אלרגיות (שורה לכל פריט)<textarea id="f_allergies">${esc((e.allergies||[]).join('\n'))}</textarea></label>
    <label>התראות חשובות (שורה לכל פריט)<textarea id="f_alerts">${esc((e.alerts||[]).join('\n'))}</textarea></label>
    <label>הנחיות טיפול (שורה לכל פריט)<textarea id="f_instructions">${esc((e.instructions||[]).join('\n'))}</textarea></label>
    ${e.err?`<div class="banner">${esc(e.err)}</div>`:''}
    <button class="btn big" id="savePatient">שמירה</button>
    ${e.isNew?'':(S.confirmDel?`<div class="confirm"><b>למחוק את ${esc(e.name)} וכל היסטוריית ההחלפות שלו/ה?</b><div class="row2"><button class="btn" style="background:var(--bad)" id="delYes">מחיקה</button><button class="btn ghost" id="delNo">ביטול</button></div></div>`:'<button class="link danger" id="delPatient">מחיקת מטופל</button>')}
  </div>`;
}

/* ---------- events ---------- */
function readEdit(){
  const v=id=>($('#'+id)||{}).value||'';
  Object.assign(S.edit,{name:v('f_name').trim(),age:v('f_age').trim(),room:v('f_room').trim(),idTail:v('f_idTail').trim(),intervalHours:+v('f_interval')||4,
    conditions:lines(v('f_conditions')),allergies:lines(v('f_allergies')),alerts:lines(v('f_alerts')),instructions:lines(v('f_instructions'))});
}
function nextPid(){ let n=1; while(DATA.patients['P'+String(n).padStart(3,'0')]) n++; return 'P'+String(n).padStart(3,'0'); }
function bind(){
  const on=(sel,fn)=>{const el=$(sel); if(el) el.onclick=fn;};
  on('#homeBtn',()=>go('list'));
  on('#whoBtn',()=>go('cg'));
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>go('patient',b.dataset.open));
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
  const s=$('#search'); if(s){ s.oninput=e=>{ S.q=e.target.value; const pos=e.target.selectionStart; render(); const n=$('#search'); n.focus(); try{n.setSelectionRange(pos,pos)}catch(_){} }; }
  on('#scanBtn',()=>{ S.scanMsg=null; startCam('scan'); });
  on('#startFlow',()=>{ S.flow={step: cgName(S.cg)?'type':'cg'}; render(); });
  on('#flowClose',()=>{ S.flow=null; render(); });
  const sc=$('#scrim'); if(sc) sc.addEventListener('click',e=>{ if(e.target.id==='scrim'){ S.flow=null; render(); } });
  on('#flowBack',()=>{ const f=S.flow; f.step = f.step==='confirm' && f.type==='stool' ? 'bristol' : 'type'; render(); });
  document.querySelectorAll('[data-cg]').forEach(b=>b.onclick=()=>{ S.cg=b.dataset.cg; LS.set('caregiver',S.cg); S.flow.step='type'; render(); });
  document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{ const f=S.flow; f.type=b.dataset.type; if(f.type!=='stool') f.bristol=null; f.step = f.type==='stool'?'bristol':'confirm'; render(); });
  document.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{ S.flow.bristol=+b.dataset.b; S.flow.step='confirm'; render(); });
  const note=$('#note'); if(note) note.oninput=e=>{ S.flow.note=e.target.value; };
  on('#save',()=>{ const f=S.flow;
    DATA.changes.push({id:uid('x'),patientId:S.pid,ts:Date.now(),type:f.type,bristol:f.type==='stool'?f.bristol:null,note:(f.note||'').trim(),caregiverId:S.cg,caregiverName:cgName(S.cg)||''});
    persist(); S.flow=null; flash('ההחלפה נשמרה'); });
  document.querySelectorAll('[data-pickcg]').forEach(b=>b.onclick=()=>{ S.cg=b.dataset.pickcg; LS.set('caregiver',S.cg); render(); });
  document.querySelectorAll('[data-delcg]').forEach(b=>b.onclick=()=>{ DATA.caregivers=DATA.caregivers.filter(c=>c.id!==b.dataset.delcg); if(S.cg===b.dataset.delcg){S.cg=null; LS.set('caregiver','');} persist(); render(); });
  on('#cgAdd',()=>{ const name=$('#cgName').value.trim(); if(!name) return; const id=uid('c'); DATA.caregivers.push({id,name,role:$('#cgRole').value.trim()}); S.cg=id; LS.set('caregiver',id); persist(); flash('נוסף/ה'); });
  on('#addPatient',()=>{ S.edit={isNew:true,id:nextPid(),name:'',intervalHours:4}; go('edit'); });
  on('#editPatient',()=>{ S.edit=JSON.parse(JSON.stringify(DATA.patients[S.pid])); go('edit'); });
  on('#takePhoto',()=>{ readEdit(); startCam('photo'); });
  on('#rmPhoto',()=>{ readEdit(); S.edit.photoUrl=null; render(); });
  on('#savePatient',()=>{ readEdit(); const e=S.edit; if(!e.name){ e.err='יש להזין שם.'; render(); return; }
    const {isNew,err,...p}=e; DATA.patients[p.id]=p; persist(); S.edit=null; flash('נשמר'); go('patient',p.id); });
  on('#delPatient',()=>{ readEdit(); S.confirmDel=true; render(); });
  on('#delNo',()=>{ S.confirmDel=false; render(); });
  on('#delYes',()=>{ const id=S.edit.id; delete DATA.patients[id]; DATA.changes=DATA.changes.filter(c=>c.patientId!==id); persist(); S.edit=null; flash('המטופל נמחק'); go('list',null); });
}
let toastT; function flash(t){ S.toast=t; render(); clearTimeout(toastT); toastT=setTimeout(()=>{S.toast=null; render();},2200); }

/* ---------- live camera: scan QR / take photo ---------- */
const CAM={on:false,stream:null,mode:null,raf:0,det:null,busy:false};
async function startCam(mode){
  CAM.mode=mode; CAM.on=true;
  const el=document.createElement('div'); el.className='cam'; el.id='cam';
  el.innerHTML=`<video id="camVideo" playsinline muted autoplay></video>${mode==='scan'?'<div class="frame"></div>':''}
    <div class="bar"><div class="msg" id="camMsg">${mode==='scan'?'כוונו את המצלמה לברקוד':'מקמו את פני המטופל במרכז'}</div>
    ${mode==='photo'?'<button class="btn" id="camShot">צילום</button>':''}<button class="btn ghost" id="camClose">ביטול</button></div>`;
  document.body.appendChild(el);
  $('#camClose').onclick=stopCam;
  try{
    CAM.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}},audio:false});
  }catch(e){ stopCam(); S.scanMsg='אין גישה למצלמה. אשרו הרשאת מצלמה לאפליקציה בהגדרות הטלפון.'; render(); return; }
  if(!CAM.on){ CAM.stream.getTracks().forEach(t=>t.stop()); return; }
  const v=$('#camVideo'); v.srcObject=CAM.stream; await v.play().catch(()=>{});
  if(mode==='photo'){ $('#camShot').onclick=()=>{ const c=document.createElement('canvas'); const s=Math.min(v.videoWidth,v.videoHeight); c.width=c.height=320;
      c.getContext('2d').drawImage(v,(v.videoWidth-s)/2,(v.videoHeight-s)/2,s,s,0,0,320,320); S.edit.photoUrl=c.toDataURL('image/jpeg',.8); stopCam(); render(); }; return; }
  if('BarcodeDetector' in window){ try{ CAM.det=new BarcodeDetector({formats:['qr_code','code_128','ean_13']}); }catch(_){ CAM.det=null; } }
  const cv=document.createElement('canvas'); const ctx=cv.getContext('2d',{willReadFrequently:true});
  const tick=async()=>{
    if(!CAM.on) return;
    if(!CAM.busy && v.readyState>=2){
      CAM.busy=true; let text=null;
      try{
        if(CAM.det){ const r=await CAM.det.detect(v); if(r[0]) text=r[0].rawValue; }
        else { const sc=Math.min(1,640/Math.max(v.videoWidth,v.videoHeight)); cv.width=v.videoWidth*sc|0; cv.height=v.videoHeight*sc|0;
          ctx.drawImage(v,0,0,cv.width,cv.height); const r=jsQR(ctx.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height,{inversionAttempts:'dontInvert'}); if(r) text=r.data; }
      }catch(_){}
      CAM.busy=false;
      if(text){ handleCode(text); return; }
    }
    CAM.raf=requestAnimationFrame(tick);
  };
  CAM.tick=tick; tick();
}
function stopCam(){ CAM.on=false; cancelAnimationFrame(CAM.raf); if(CAM.stream) CAM.stream.getTracks().forEach(t=>t.stop()); CAM.stream=null; const el=$('#cam'); if(el) el.remove(); }
function handleCode(text){
  const m = text.trim().match(/#?([A-Za-z0-9_-]+)\s*$/); const id=m&&m[1];
  if(id && DATA.patients[id]){ try{navigator.vibrate&&navigator.vibrate(60)}catch(_){} stopCam(); S.scanMsg=null; go('patient',id); }
  else { const msg=$('#camMsg'); if(msg) msg.textContent=`הברקוד (${text.slice(0,30)}) לא שייך למטופל ברשימה`; setTimeout(()=>{ if(CAM.on) CAM.raf=requestAnimationFrame(CAM.tick); },1500); }
}

render();
setInterval(()=>{ const a=document.activeElement; if(!S.flow && !CAM.on && S.view!=='edit' && !(a && /INPUT|TEXTAREA/.test(a.tagName))) render(); },60000);
})();
