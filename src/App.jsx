import { useState, useRef, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const USERS = [
  { id:1, username:"admin",      password:"Onr!Adm7429",  role:"admin",     name:"Διοίκηση",   initials:"Δ" },
  { id:2, username:"grammateia", password:"Onr!Grm5183",  role:"secretary", name:"Γραμματεία", initials:"Γ" },
  { id:3, username:"vrefikoA",   password:"Onr!VrA2967",  role:"teacher",   name:"Δασκάλα Βρεφικού Α", initials:"ΒΑ", tmima_id:"vr-a", tmima:"Βρεφικό Α" },
  { id:4, username:"vrefikoB",   password:"Onr!VrB4058",  role:"teacher",   name:"Δασκάλα Βρεφικού Β", initials:"ΒΒ", tmima_id:"vr-b", tmima:"Βρεφικό Β" },
  { id:5, username:"vrefikoC",   password:"Onr!VrC6392",  role:"teacher",   name:"Δασκάλα Βρεφικού Γ", initials:"ΒΓ", tmima_id:"vr-c", tmima:"Βρεφικό Γ" },
  { id:6, username:"paidikoA",   password:"Onr!PaA8514",  role:"teacher",   name:"Δασκάλα Παιδικού Α", initials:"ΠΑ", tmima_id:"pa-a", tmima:"Παιδικό Α" },
  { id:7, username:"paidikoB",   password:"Onr!PaB3720",  role:"teacher",   name:"Δασκάλα Παιδικού Β", initials:"ΠΒ", tmima_id:"pa-b", tmima:"Παιδικό Β" },
];
// Σημείωση: Οι λογαριασμοί γονέων ΔΕΝ δημιουργούνται εδώ.
// Κάθε γονέας παίρνει username/κωδικό όταν καταχωρείτε το παιδί του στο Μητρώο (Βήμα 3 της φόρμας).



const TMIMATA = [
  { id:"vr-a", name:"Βρεφικό Α", type:"vrefiko", capacity:12, teacher:"Μαρία Παπαδοπούλου", color:"#7CB9A0" },
  { id:"vr-b", name:"Βρεφικό Β", type:"vrefiko", capacity:12, teacher:"Ελένη Γεωργίου",     color:"#9BBDD4" },
  { id:"vr-c", name:"Βρεφικό Γ", type:"vrefiko", capacity:12, teacher:"Σοφία Νικολάου",     color:"#C4A882" },
  { id:"pa-a", name:"Παιδικό Α", type:"paidiko", capacity:20, teacher:"Άννα Κωστοπούλου",   color:"#A8C5A0" },
  { id:"pa-b", name:"Παιδικό Β", type:"paidiko", capacity:20, teacher:"Δήμητρα Αλεξίου",    color:"#C9B8A8" },
];

const TODAY = new Date().toISOString().split("T")[0];
const todayGR = new Date().toLocaleDateString("el-GR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

// Τα παιδιά προστίθενται από το Μητρώο (κενό μέχρι να καταχωρηθούν πραγματικά)
const genKids = () => [];

const KIDS0 = genKids();

const GALLERY_ITEMS = [];

const EVENTS = [];

const ACADEMY = [];

const SEC_MSGS = [];

const ROUTES = [];

// ─── SHARED PARENT↔TEACHER MESSAGES (admin sees all) ─────────────────────────
// Simple module-level store with subscribers so any component can react to new messages.
const PT_MESSAGES = {
  list: [],
  subs: [],
  add(msg){
    this.list = [{...msg, id:Date.now()}, ...this.list];
    this.subs.forEach(fn=>{ try{ fn(); }catch(e){} });
  },
  subscribe(fn){ this.subs.push(fn); return ()=>{ this.subs = this.subs.filter(f=>f!==fn); }; },
};

// ─── ΠΡΩΤΟΚΟΛΛΑ ΕΠΙΧΕΙΡΗΣΗΣ (υπογεγραμμένα από προσωπικό) ─────────────────────
// ⚠️ PLACEHOLDER — θα αντικατασταθεί με τα πραγματικά κείμενα όταν ανεβούν.
const PROTOCOLS = [
  { id:1, title:"Πρωτόκολλο Υγιεινής & Ασφάλειας", short:"Κανόνες καθαριότητας, απολύμανσης χώρων και ατομικής υγιεινής.", signed:true, date:"2025-09-01" },
  { id:2, title:"Πρωτόκολλο Διαχείρισης Ατυχημάτων", short:"Διαδικασία πρώτων βοηθειών και ειδοποίησης γονέων σε περίπτωση ατυχήματος.", signed:true, date:"2025-09-01" },
  { id:3, title:"Πρωτόκολλο Προστασίας Προσωπικών Δεδομένων (GDPR)", short:"Χειρισμός φωτογραφιών, αρχείων και δεδομένων παιδιών βάσει Ν. 4624/2019.", signed:true, date:"2025-09-01" },
  { id:4, title:"Πρωτόκολλο Παράδοσης & Παραλαβής Παιδιών", short:"Εξουσιοδοτημένα άτομα, ταυτοποίηση και ασφαλής παράδοση.", signed:true, date:"2025-09-01" },
  { id:5, title:"Πρωτόκολλο Χορήγησης Φαρμάκων", short:"Προϋποθέσεις και καταγραφή χορήγησης φαρμακευτικής αγωγής.", signed:false, date:null },
];

function playNotifSound(){
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const now = ctx.currentTime;
    // Two-tone pleasant chime
    [ [880, 0], [1318.5, 0.12] ].forEach(([freq,delay])=>{
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now+delay);
      gain.gain.linearRampToValueAtTime(0.18, now+delay+0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now+delay+0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now+delay); osc.stop(now+delay+0.4);
    });
    setTimeout(()=>{ try{ctx.close();}catch(e){} }, 800);
  } catch(e){}
}


// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html { font-size:16px; }
body { font-family:'DM Sans',sans-serif; background:#F5F1EA; color:#2A2A2A; -webkit-font-smoothing:antialiased; }

:root {
  /* Ονειροχώρα brand colors from logo */
  --green:   #2D6A2D;   /* logo border green - primary */
  --green2:  #3A8A3A;   /* lighter green */
  --green3:  #E8F4E8;   /* very light green tint */
  --red:     #CC2929;   /* logo red */
  --red2:    #FFF0F0;   /* light red tint */
  --yellow:  #F5B800;   /* logo gold/yellow */
  --yellow2: #FFF9E0;   /* light yellow tint */
  --blue:    #3AAED8;   /* logo light blue */
  --blue2:   #EDF6FB;   /* light blue tint */
  --beige:   #F8F5F0;   /* warm background */
  --beige2:  #EEE9E0;
  --beige3:  #E2DBD0;
  --burg:    #CC2929;   /* use red as accent */
  --burg2:   #FFF0F0;
  --gray:    #ECE8E1;
  --gray2:   #D6D0C8;
  --text:    #1A2E1A;   /* dark green-tinted text */
  --text2:   #5A6A5A;
  --text3:   #96A096;
  --white:   #FDFCFA;
  --shadow:  0 1px 3px rgba(45,106,45,.07), 0 4px 16px rgba(45,106,45,.09);
  --shadow2: 0 2px 8px rgba(45,106,45,.09), 0 12px 40px rgba(45,106,45,.14);
  --radius:  14px;
  --radius2: 8px;
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-track { background:var(--beige2); }
::-webkit-scrollbar-thumb { background:var(--gray2); border-radius:3px; }

/* ── LAYOUT ── */
.shell { display:flex; height:100vh; overflow:hidden; }
.sidebar {
  width:248px; flex-shrink:0;
  background:#1A3A1A;
  display:flex; flex-direction:column;
  position:relative; overflow:hidden;
  transition:width .25s cubic-bezier(.4,0,.2,1);
}
.sidebar.collapsed { width:68px; }
.sidebar.collapsed .sb-brand h2,
.sidebar.collapsed .sb-brand span,
.sidebar.collapsed .sb-uname,
.sidebar.collapsed .sb-urole,
.sidebar.collapsed .nav-item span:not(.nav-ico):not(.nav-badge),
.sidebar.collapsed .sb-section,
.sidebar.collapsed .sb-logout span,
.sidebar.collapsed .nav-label { display:none; }
.sidebar.collapsed .nav-item { justify-content:center; padding:11px 0; }
.sidebar.collapsed .nav-ico { width:auto; }
.sidebar.collapsed .sb-user { justify-content:center; padding:14px 0; }
.sidebar.collapsed .sb-brand { justify-content:center; }
.sidebar.collapsed .sb-logout { padding:9px 0; }
.sidebar.collapsed .nav-badge { position:absolute; top:4px; right:10px; }
.sb-toggle {
  position:absolute; top:24px; right:-12px; z-index:20;
  width:24px; height:24px; border-radius:50%;
  background:var(--green); color:#fff; border:2px solid #1A3A1A;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; font-size:11px; transition:all .2s;
  box-shadow:0 2px 6px rgba(0,0,0,.2);
}
.sb-toggle:hover { background:var(--green2); transform:scale(1.1); }
.mobile-menu-btn { display:none; }
.sidebar::before {
  content:''; position:absolute; inset:0;
  background: radial-gradient(ellipse at 20% 80%, rgba(255,255,255,.04) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 10%, rgba(255,255,255,.03) 0%, transparent 50%);
  pointer-events:none;
}
.main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

/* ── LOGIN ── */
.login-wrap {
  min-height:100vh; width:100%;
  background: linear-gradient(160deg, #1A3A1A 0%, #0F240F 60%, #1A2D0F 100%);
  display:flex; align-items:center; justify-content:center; padding:24px;
  position:relative; overflow:hidden;
}
.login-wrap::before {
  content:''; position:absolute; inset:0;
  background:
    radial-gradient(ellipse 60% 50% at 15% 85%, rgba(124,185,160,.15) 0%, transparent 60%),
    radial-gradient(ellipse 40% 60% at 85% 15%, rgba(196,168,130,.1) 0%, transparent 55%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
}
.login-card {
  background:var(--white); border-radius:24px;
  padding:48px 44px; width:100%; max-width:420px;
  box-shadow:0 32px 80px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.1);
  position:relative; animation:rise .5s cubic-bezier(.22,1,.36,1);
}
@keyframes rise { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.login-brand { text-align:center; margin-bottom:36px; }
.login-mark {
  width:120px; height:120px;
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 14px;
}
.login-brand h1 { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:#CC2929; margin-bottom:4px; }
.login-brand p { font-size:13px; color:var(--text3); font-weight:400; }
.lfield { margin-bottom:16px; }
.lfield label { display:block; font-size:12px; font-weight:600; color:var(--text2); margin-bottom:6px; letter-spacing:.03em; text-transform:uppercase; }
.lfield input {
  width:100%; padding:12px 16px;
  border:1.5px solid var(--beige3); border-radius:var(--radius2);
  font-family:'DM Sans',sans-serif; font-size:15px; color:var(--text);
  background:var(--beige); outline:none; transition:all .2s;
}
.lfield input:focus { border-color:var(--green); background:var(--white); box-shadow:0 0 0 3px rgba(47,79,62,.1); }
.lerr { background:#FEF2F2; border:1px solid #FECACA; color:#DC2626; padding:10px 14px; border-radius:var(--radius2); font-size:13px; margin-bottom:14px; }
.lbtn {
  width:100%; padding:13px; background:linear-gradient(135deg,#CC2929,#E53030); color:var(--white);
  border:none; border-radius:var(--radius2); font-family:'DM Sans',sans-serif;
  font-size:15px; font-weight:600; cursor:pointer; transition:all .2s; letter-spacing:.01em;
}
.lbtn:hover { background:linear-gradient(135deg,#B52222,#CC2929); box-shadow:0 4px 16px rgba(204,41,41,.35); transform:translateY(-1px); }
.ldemos { margin-top:24px; padding-top:20px; border-top:1px solid var(--beige3); }
.ldemos p { font-size:11px; font-weight:600; color:var(--text3); margin-bottom:10px; letter-spacing:.05em; text-transform:uppercase; }
.demo-chips { display:flex; flex-wrap:wrap; gap:6px; }
.chip {
  padding:5px 11px; border-radius:20px; font-size:12px; font-weight:500;
  background:var(--green3); color:var(--green); cursor:pointer;
  border:1px solid rgba(47,79,62,.15); transition:all .15s;
}
.chip:hover { background:#CC2929; color:var(--white); }

/* ── SIDEBAR ── */
.sb-head { padding:20px 20px 14px; border-bottom:1px solid rgba(255,255,255,.08); position:relative; }
.sb-brand { display:flex; align-items:center; gap:11px; }
.sb-icon { width:44px; height:44px; border-radius:10px; background:transparent; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
.sb-brand h2 { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#fff; line-height:1.15; }
.sb-brand span { font-size:10px; color:rgba(255,255,255,.4); font-weight:400; display:block; margin-top:1px; }
.sb-user { padding:14px 20px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; gap:10px; }
.sb-av {
  width:34px; height:34px; border-radius:10px;
  background:rgba(255,255,255,.15); color:#fff;
  display:flex; align-items:center; justify-content:center;
  font-size:11px; font-weight:700; flex-shrink:0; letter-spacing:.02em;
}
.sb-uname { font-size:13px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px; }
.sb-urole { font-size:11px; color:rgba(255,255,255,.4); font-weight:400; margin-top:1px; }
.sb-nav { flex:1; padding:10px 12px; overflow-y:auto; }
.sb-section { font-size:10px; font-weight:600; color:rgba(255,255,255,.28); letter-spacing:.1em; text-transform:uppercase; padding:14px 8px 6px; }
.nav-item {
  display:flex; align-items:center; gap:10px; padding:9px 10px;
  border-radius:10px; cursor:pointer; transition:all .15s;
  font-size:13px; font-weight:500; color:rgba(255,255,255,.58);
  position:relative; margin-bottom:1px;
}
.nav-item:hover { background:rgba(255,255,255,.08); color:rgba(255,255,255,.9); }
.nav-item.active { background:rgba(255,255,255,.13); color:#fff; font-weight:600; }
.nav-item.active::before {
  content:''; position:absolute; left:-12px; top:50%; transform:translateY(-50%);
  width:3px; height:50%; background:#F5B800; border-radius:0 2px 2px 0;
}
.nav-ico { font-size:16px; width:20px; text-align:center; opacity:.85; }
.nav-badge { margin-left:auto; background:var(--red); color:#fff; font-size:10px; font-weight:700; padding:1px 7px; border-radius:10px; }
.sb-foot { padding:12px; border-top:1px solid rgba(255,255,255,.08); }
.sb-logout {
  width:100%; padding:9px; background:rgba(255,255,255,.06); color:rgba(255,255,255,.6);
  border:1px solid rgba(255,255,255,.1); border-radius:10px; cursor:pointer;
  font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; transition:all .15s;
}
.sb-logout:hover { background:rgba(255,100,100,.15); color:rgba(255,160,160,.9); border-color:rgba(255,100,100,.2); }

/* ── TOPBAR ── */
.topbar {
  height:60px; background:var(--white); border-bottom:1px solid var(--beige3);
  padding:0 28px; display:flex; align-items:center; justify-content:space-between;
  flex-shrink:0; box-shadow:0 1px 0 var(--beige3);
}
.topbar-l h1 { font-family:'Playfair Display',serif; font-size:19px; font-weight:600; color:var(--green); }
.topbar-l p { font-size:12px; color:var(--text3); margin-top:1px; }
.topbar-r { display:flex; align-items:center; gap:10px; }
.top-date { background:var(--green3); color:var(--green); padding:5px 13px; border-radius:20px; font-size:12px; font-weight:600; border:1px solid rgba(45,106,45,.15); }
.top-notif { width:36px; height:36px; border-radius:10px; background:var(--beige2); border:none; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; position:relative; transition:all .15s; }
.top-notif:hover { background:var(--green3); }
.notif-dot { position:absolute; top:7px; right:7px; width:7px; height:7px; background:var(--red); border-radius:50%; border:2px solid var(--white); }
.content { flex:1; overflow-y:auto; padding:28px; }

/* ── CARDS & GRID ── */
.stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
.stat-card {
  background:var(--white); border-radius:var(--radius); padding:20px;
  box-shadow:var(--shadow); border:1px solid var(--beige3); transition:all .2s;
}
.stat-card:hover { box-shadow:var(--shadow2); transform:translateY(-1px); }
.stat-ico { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:12px; }
.stat-val { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--text); line-height:1; }
.stat-lbl { font-size:12px; color:var(--text3); font-weight:500; margin-top:4px; }
.stat-trend { display:inline-block; font-size:11px; font-weight:600; padding:2px 8px; border-radius:10px; margin-top:8px; }
.trend-up { background:#ECFDF5; color:#059669; }
.trend-dn { background:#FEF2F2; color:#DC2626; }
.g2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
.g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:20px; }
.card { background:var(--white); border-radius:var(--radius); padding:22px; box-shadow:var(--shadow); border:1px solid var(--beige3); }
.card-title { font-family:'Playfair Display',serif; font-size:15px; font-weight:600; color:var(--green); margin-bottom:16px; display:flex; align-items:center; gap:8px; }

/* ── TABLE ── */
.tbl-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th { text-align:left; padding:9px 12px; font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:.06em; border-bottom:1.5px solid var(--beige3); white-space:nowrap; }
td { padding:11px 12px; border-bottom:1px solid var(--beige3); vertical-align:middle; }
tr:last-child td { border-bottom:none; }
tbody tr { transition:background .1s; cursor:pointer; }
tbody tr:hover td { background:var(--beige); }
.av { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
.badge { display:inline-block; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; }
.b-green { background:#ECFDF5; color:#059669; }
.b-red   { background:#FEF2F2; color:#DC2626; }
.b-blue  { background:#EFF6FF; color:#2563EB; }
.b-amber { background:#FFFBEB; color:#D97706; }
.b-gray  { background:var(--beige2); color:var(--text2); }
.b-earth { background:var(--green3); color:var(--green); }

/* ── FORMS & INPUTS ── */
.search-row { display:flex; gap:10px; margin-bottom:16px; align-items:center; }
.search-box { position:relative; flex:1; }
.search-box::before { content:'🔍'; position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:13px; pointer-events:none; }
.sinput {
  width:100%; padding:9px 14px 9px 38px;
  border:1.5px solid var(--beige3); border-radius:var(--radius2);
  font-family:'DM Sans',sans-serif; font-size:13px; color:var(--text);
  background:var(--white); outline:none; transition:all .2s;
}
.sinput:focus { border-color:var(--green); box-shadow:0 0 0 3px rgba(47,79,62,.08); }
.select {
  padding:9px 13px; border:1.5px solid var(--beige3); border-radius:var(--radius2);
  font-family:'DM Sans',sans-serif; font-size:13px; color:var(--text);
  background:var(--white); outline:none; cursor:pointer; font-weight:500;
}
.select:focus { border-color:var(--green); }
.finput {
  width:100%; padding:9px 13px; border:1.5px solid var(--beige3); border-radius:var(--radius2);
  font-family:'DM Sans',sans-serif; font-size:13px; color:var(--text);
  background:var(--beige); outline:none; transition:all .2s;
}
.finput:focus { border-color:var(--green); background:var(--white); box-shadow:0 0 0 3px rgba(47,79,62,.08); }
.fgroup { margin-bottom:14px; }
.flabel { display:block; font-size:12px; font-weight:600; color:var(--text2); margin-bottom:6px; letter-spacing:.03em; }
.f2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.f3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
.section-hd { font-size:11px; font-weight:700; color:var(--green); letter-spacing:.08em; text-transform:uppercase; padding:14px 0 8px; border-bottom:1px solid var(--green3); margin-bottom:12px; }

/* ── BUTTONS ── */
.btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:var(--radius2); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all .15s; }
.btn-primary { background:var(--green); color:var(--white); }
.btn-primary:hover { background:var(--green2); box-shadow:0 3px 12px rgba(47,79,62,.25); }
.btn-ghost { background:var(--beige2); color:var(--text2); }
.btn-ghost:hover { background:var(--beige3); color:var(--text); }
.btn-danger { background:var(--burg2); color:var(--burg); }
.btn-sm { padding:6px 12px; font-size:12px; }
.btn-xs { padding:4px 9px; font-size:11px; border-radius:6px; }

/* ── MODAL ── */
.modal-bg { position:fixed; inset:0; background:rgba(42,42,42,.4); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); animation:fi .2s; }
@keyframes fi { from{opacity:0} to{opacity:1} }
.modal { background:var(--white); border-radius:20px; padding:28px; width:100%; max-width:640px; max-height:88vh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,.2); animation:rise .3s cubic-bezier(.22,1,.36,1); }
.modal-lg { max-width:780px; }
.modal-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:600; color:var(--green); margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
.modal-close { background:var(--beige2); border:none; width:30px; height:30px; border-radius:8px; font-size:14px; cursor:pointer; color:var(--text2); display:flex; align-items:center; justify-content:center; }
.modal-close:hover { background:var(--beige3); }

/* ── TABS ── */
.tabs { display:flex; gap:4px; margin-bottom:16px; border-bottom:1.5px solid var(--beige3); }
.tab { padding:9px 16px; border:none; background:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; color:var(--text3); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1.5px; transition:all .15s; }
.tab.active { color:var(--green); font-weight:600; border-bottom-color:var(--green); }
.tab:hover:not(.active) { color:var(--text); }

/* ── TMIMATA CARDS ── */
.tmima-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:22px; }
.tmima-card { border-radius:var(--radius); padding:16px; cursor:pointer; transition:all .2s; border:1.5px solid transparent; background:var(--white); box-shadow:var(--shadow); }
.tmima-card:hover { transform:translateY(-2px); box-shadow:var(--shadow2); }
.tm-name { font-weight:700; font-size:13px; margin-bottom:2px; color:var(--text); }
.tm-teacher { font-size:11px; color:var(--text3); margin-bottom:10px; }
.tm-count { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; }
.pbar { height:4px; border-radius:2px; background:var(--beige3); margin-top:8px; overflow:hidden; }
.pbar-fill { height:100%; border-radius:2px; transition:width .5s; }

/* ── ATTENDANCE ── */
.att-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:9px; }
.att-item { background:var(--white); border-radius:12px; padding:12px; text-align:center; border:1.5px solid var(--beige3); cursor:pointer; transition:all .15s; }
.att-item.present { border-color:#34D399; background:#F0FDF4; }
.att-item.absent  { border-color:#FCA5A5; background:#FEF2F2; }
.att-item:hover { transform:scale(1.02); }
.att-name { font-size:12px; font-weight:600; margin-top:7px; color:var(--text); }

/* ── DAILY REPORT ── */
.pill-row { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:4px; }
.pill { padding:5px 13px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:1.5px solid var(--beige3); background:var(--beige2); color:var(--text2); transition:all .15s; }
.pill.sel { background:var(--green); color:#fff; border-color:var(--green); }
.toggle-btn { width:40px; height:22px; border-radius:11px; border:none; cursor:pointer; position:relative; transition:background .2s; background:var(--gray2); }
.toggle-btn.on { background:var(--green); }
.toggle-btn::after { content:''; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .2s; box-shadow:0 1px 3px rgba(0,0,0,.15); }
.toggle-btn.on::after { left:21px; }
.media-drop { border:2px dashed var(--beige3); border-radius:12px; padding:20px; text-align:center; cursor:pointer; transition:all .2s; background:var(--beige); }
.media-drop:hover { border-color:var(--green); background:var(--green3); }
.media-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:10px; }
.media-thumb {
  aspect-ratio:1; border-radius:10px; background:var(--beige2);
  display:flex; align-items:center; justify-content:center;
  font-size:24px; position:relative; overflow:hidden;
  user-select:none; -webkit-user-select:none;
  pointer-events:auto;
}
.media-thumb img {
  width:100%; height:100%; object-fit:cover;
  pointer-events:none;
  -webkit-user-drag:none; user-drag:none;
  -webkit-touch-callout:none;
}
.media-thumb-parent img {
  filter:blur(0px);
}
.media-thumb-parent:hover img {
  filter:blur(0px);
}
/* Invisible always-on top layer to block right-click save */
.media-protect {
  position:absolute; inset:0; z-index:2;
  background:transparent;
  cursor:default;
  -webkit-user-select:none; user-select:none;
}
.no-dl {
  position:absolute; bottom:0; left:0; right:0; z-index:3;
  background:linear-gradient(transparent,rgba(0,0,0,.65));
  display:flex; align-items:flex-end; justify-content:center;
  padding:6px 4px 5px;
  opacity:1; font-size:9px; color:rgba(255,255,255,.85);
  font-weight:600; text-align:center; letter-spacing:.02em;
  pointer-events:none;
}
.media-thumb .no-dl-hover {
  position:absolute; inset:0; background:rgba(0,0,0,0);
  display:flex; align-items:center; justify-content:center;
  opacity:0; transition:all .2s; font-size:10px; color:#fff;
  font-weight:600; text-align:center; padding:4px; z-index:4;
}
.media-thumb:hover .no-dl-hover { background:rgba(0,0,0,.5); opacity:1; }

/* ── GALLERY ── */
.gallery-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; }
.gallery-item { border-radius:var(--radius); overflow:hidden; background:var(--beige2); aspect-ratio:4/3; position:relative; cursor:pointer; box-shadow:var(--shadow); transition:all .2s; }
.gallery-item:hover { transform:scale(1.02); box-shadow:var(--shadow2); }
.gallery-emoji { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:48px; }
.gallery-overlay { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent,rgba(42,42,42,.75)); padding:10px 12px; }
.gallery-caption { font-size:12px; font-weight:600; color:#fff; }
.gallery-meta { font-size:10px; color:rgba(255,255,255,.7); margin-top:2px; }
.gallery-badge { position:absolute; top:10px; right:10px; font-size:9px; font-weight:700; padding:3px 7px; border-radius:10px; }

/* ── CALENDAR ── */
.cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
.cal-day-name { text-align:center; font-size:11px; font-weight:600; color:var(--text3); padding:8px 0; letter-spacing:.04em; text-transform:uppercase; }
.cal-cell { min-height:72px; border-radius:8px; padding:6px; background:var(--white); border:1px solid var(--beige3); position:relative; cursor:pointer; transition:background .15s; }
.cal-cell:hover { background:var(--beige); }
.cal-cell.today { border-color:var(--green); background:var(--green3); }
.cal-cell.other-month { background:transparent; border-color:transparent; opacity:.4; }
.cal-num { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:4px; }
.cal-cell.today .cal-num { color:var(--green); font-weight:700; }
.cal-event { font-size:10px; padding:2px 5px; border-radius:4px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500; color:#fff; }

/* ── ACADEMY ── */
.academy-grid { display:grid; grid-template-columns:1fr 2.2fr; gap:20px; }
.academy-list { display:flex; flex-direction:column; gap:6px; }
.academy-item { padding:12px 14px; border-radius:10px; cursor:pointer; transition:all .15s; background:var(--white); border:1.5px solid var(--beige3); display:flex; align-items:center; gap:10px; }
.academy-item:hover { background:var(--beige); }
.academy-item.active { background:var(--green3); border-color:var(--green); }
.academy-item.active .ai-title { color:var(--green); font-weight:600; }
.ai-icon { font-size:18px; width:24px; text-align:center; flex-shrink:0; }
.ai-title { font-size:13px; font-weight:500; color:var(--text); }
.ai-cat { font-size:10px; color:var(--text3); margin-top:1px; }
.academy-content { background:var(--white); border-radius:var(--radius); padding:28px; box-shadow:var(--shadow); border:1px solid var(--beige3); min-height:400px; }
.ac-header { margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--beige3); }
.ac-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:600; color:var(--green); margin-bottom:6px; }
.ac-body { font-size:14px; line-height:1.8; color:var(--text2); white-space:pre-wrap; }

/* ── MESSAGES ── */
.msg-item { padding:14px 16px; border-radius:12px; border:1.5px solid var(--beige3); margin-bottom:8px; cursor:pointer; transition:all .15s; background:var(--white); }
.msg-item:hover { border-color:var(--green); background:var(--green3); }
.msg-item.unread { border-left:3px solid var(--green); }
.msg-from { font-weight:700; font-size:13px; color:var(--text); }
.msg-subject { font-size:13px; font-weight:500; color:var(--text); margin-top:2px; }
.msg-preview { font-size:12px; color:var(--text3); margin-top:2px; }

/* ── ROUTES ── */
.route-item { display:flex; align-items:center; gap:13px; padding:13px 15px; border-radius:12px; border:1.5px solid var(--beige3); margin-bottom:9px; background:var(--white); transition:all .15s; }
.route-item:hover { border-color:var(--green); }
.route-ico { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }

/* ── PARENT PORTAL ── */
.parent-hero { background:linear-gradient(135deg,var(--green),var(--green2)); border-radius:var(--radius); padding:28px; color:#fff; margin-bottom:20px; }
.parent-tabs { display:flex; gap:8px; margin-bottom:18px; }
.parent-tab { padding:8px 16px; border-radius:10px; font-weight:600; font-size:13px; cursor:pointer; border:1.5px solid var(--beige3); background:var(--white); color:var(--text2); transition:all .15s; }
.parent-tab.active { border-color:var(--green); color:var(--green); background:var(--green3); }
.report-block { background:var(--beige); border-radius:12px; padding:14px; margin-bottom:10px; }
.report-block.highlight { background:var(--green3); border:1px solid rgba(47,79,62,.15); }
.report-key { font-size:11px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
.report-val { font-size:14px; font-weight:600; color:var(--text); display:flex; align-items:center; gap:8px; }

/* ── FINANCE ── */
.fin-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:8px; align-items:center; padding:11px 12px; border-radius:8px; transition:background .1s; }
.fin-row:hover { background:var(--beige); }

/* ── INVOICE LINK ── */
.inv-link { background:linear-gradient(135deg,var(--burg),#8B3A3A); border-radius:var(--radius); padding:16px 20px; color:#fff; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:14px; margin-bottom:20px; }
.inv-link:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(107,46,46,.3); }

/* ── GLOBAL SEARCH ── */
.gsearch-wrap { position:relative; }
.gsearch-input {
  width:280px; padding:9px 16px 9px 38px;
  border:1.5px solid var(--beige3); border-radius:20px;
  font-family:'DM Sans',sans-serif; font-size:13px; color:var(--text);
  background:var(--beige); outline:none; transition:all .2s;
}
.gsearch-input:focus { border-color:var(--green); background:var(--white); width:340px; box-shadow:0 0 0 3px rgba(45,106,45,.1); }
.gsearch-input::placeholder { color:var(--text3); }
.gsearch-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; }
.gsearch-results {
  position:absolute; top:calc(100% + 8px); right:0;
  width:420px; background:var(--white); border-radius:16px;
  box-shadow:0 8px 40px rgba(0,0,0,.18), 0 0 0 1px var(--beige3);
  z-index:500; max-height:480px; overflow-y:auto;
  animation:rise .2s cubic-bezier(.22,1,.36,1);
}
.gsr-header { padding:12px 16px 8px; font-size:11px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:.06em; border-bottom:1px solid var(--beige3); }
.gsr-item { display:flex; align-items:center; gap:12px; padding:11px 16px; cursor:pointer; transition:background .1s; border-bottom:1px solid var(--beige3); }
.gsr-item:last-child { border-bottom:none; }
.gsr-item:hover { background:var(--beige); }
.gsr-av { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff; flex-shrink:0; }
.gsr-name { font-weight:700; font-size:13px; color:var(--text); }
.gsr-meta { font-size:11px; color:var(--text3); margin-top:2px; }
.gsr-match { font-size:11px; color:var(--green); font-weight:600; margin-top:2px; }
.gsr-empty { padding:32px 16px; text-align:center; color:var(--text3); font-size:13px; }
.gsearch-overlay { position:fixed; inset:0; z-index:499; }

/* ── DASHBOARD SEARCH ── */
.dash-search-hero {
  background:linear-gradient(135deg,var(--green),#3A8A3A);
  border-radius:20px; padding:28px 32px; margin-bottom:24px;
  position:relative; overflow:hidden;
}
.dash-search-hero::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse at 80% 50%,rgba(255,255,255,.08),transparent 60%);
}
.dash-search-hero h2 { font-family:'Playfair Display',serif; font-size:20px; font-weight:600; color:#fff; margin-bottom:4px; }
.dash-search-hero p { font-size:13px; color:rgba(255,255,255,.7); margin-bottom:18px; }
.dash-search-bar { display:flex; gap:0; position:relative; }
.dash-search-bar input {
  flex:1; padding:14px 20px 14px 48px;
  border:none; border-radius:12px 0 0 12px;
  font-family:'DM Sans',sans-serif; font-size:15px; color:var(--text);
  background:#fff; outline:none;
}
.dash-search-bar button {
  padding:14px 24px; background:#CC2929; color:#fff; border:none;
  border-radius:0 12px 12px 0; font-family:'DM Sans',sans-serif;
  font-size:14px; font-weight:700; cursor:pointer; white-space:nowrap;
  transition:background .15s;
}
.dash-search-bar button:hover { background:#B52222; }
.dash-search-ico { position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:18px; pointer-events:none; z-index:1; }

/* ── MOBILE RESPONSIVE ── */
@media (max-width: 820px) {
  .sidebar:not(.collapsed) { width:248px; }
  .sidebar.collapsed { width:0; overflow:visible; }
  .sidebar.collapsed .sb-toggle { right:-42px; }
  .mobile-overlay { display:block; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:199; animation:fi .2s; }
  .content { padding:16px; }
  .topbar { padding:0 14px; }
  .gsearch-input { width:130px; }
  .gsearch-input:focus { width:170px; }
  .gsearch-results { width:290px; right:-50px; }
  .stats-row { grid-template-columns:1fr 1fr; }
  .tmima-grid { grid-template-columns:1fr 1fr; }
  .g2, .g3 { grid-template-columns:1fr; }
  .top-date { display:none; }
}

/* ── PRINT (κάρτα στοιχείων προσωπικού) ── */
@media print {
  body * { visibility:hidden; }
  #cred-card-print, #cred-card-print * { visibility:visible; }
  #cred-card-print { position:absolute; left:0; top:0; width:100%; }
}

.notif-center { position:fixed; top:70px; right:20px; width:340px; z-index:999; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
.push-notif {
  background:var(--white); border-radius:14px; padding:14px 16px;
  box-shadow:0 8px 32px rgba(0,0,0,.18), 0 0 0 1px var(--beige3);
  display:flex; gap:12px; align-items:flex-start; pointer-events:all;
  animation:slideInRight .35s cubic-bezier(.22,1,.36,1);
}
@keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
.push-icon { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.push-title { font-weight:700; font-size:13px; color:var(--text); margin-bottom:2px; }
.push-body { font-size:12px; color:var(--text3); line-height:1.4; }
.push-time { font-size:10px; color:var(--text3); margin-top:4px; }
.push-close { margin-left:auto; background:none; border:none; color:var(--text3); cursor:pointer; font-size:14px; flex-shrink:0; padding:2px; }

.page-in { animation:rise .3s cubic-bezier(.22,1,.36,1); }
.fade-in { animation:fi .25s ease; }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const mkColor = (name) => {
  const palette = ["#7CB9A0","#9BBDD4","#C4A882","#A8C5A0","#C9B8A8","#B8A9C9","#C9A8A8","#A8B8C9"];
  let h=0; for(const c of name) h=(h<<5)-h+c.charCodeAt(0);
  return palette[Math.abs(h)%palette.length];
};

const MEAL_OPTS = ["Έφαγε κανονικά","Έφαγε λίγο","Δεν έφαγε","Έφαγε πολύ καλά"];
const SLEEP_OPTS = ["15 λεπτά","30 λεπτά","45 λεπτά","1 ώρα","1:15","1:30","1:45","2 ώρες","2:15","2:30","2:45","3 ώρες","Δεν κοιμήθηκε"];
const MOOD_OPTS = ["😊 Χαρούμενο","😄 Πολύ χαρούμενο","😐 Ουδέτερο","😴 Κουρασμένο"];

function StatCard({icon, bg, value, label, trend, up}) {
  return (
    <div className="stat-card">
      <div className="stat-ico" style={{background:bg}}>{icon}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-lbl">{label}</div>
      {trend && <div className={`stat-trend ${up?"trend-up":"trend-dn"}`}>{trend}</div>}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({onLogin, users}) {
  // Safe storage helpers — won't crash if localStorage unavailable (e.g. preview)
  const safeGet = (k) => { try { return window.localStorage.getItem(k); } catch { return null; } };
  const safeSet = (k,v) => { try { window.localStorage.setItem(k,v); } catch {} };
  const safeDel = (k) => { try { window.localStorage.removeItem(k); } catch {} };

  const [u,setU] = useState(()=>safeGet("oneiro_user")||"");
  const [p,setP] = useState(()=>safeGet("oneiro_pass")||"");
  const [err,setErr] = useState("");
  const [remember,setRemember] = useState(()=>safeGet("oneiro_remember")==="1");

  const go = () => {
    const usr = users.find(x=>x.username===u&&x.password===p);
    if(usr) {
      setErr("");
      if(remember){
        safeSet("oneiro_user",u);
        safeSet("oneiro_pass",p);
        safeSet("oneiro_remember","1");
      } else {
        safeDel("oneiro_user");
        safeDel("oneiro_pass");
        safeDel("oneiro_remember");
      }
      onLogin(usr);
    }
    else setErr("Λάθος στοιχεία σύνδεσης.");
  };
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark"><img src="data:image/jpeg;base64,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kHuACbARjDHmUCoU2uAIOid6bqh/lng0wCn4EwvMsKhpFAOoKakibHEGkWqOGxiTAAeF0rkQiAcHcFwQai/eaKoRqqIuprjUpERgN1Yyyt7dYN1ItTx8o1zjYpYruZT9WFAEyagKSoKI61ot2NgmjXmkms/5sgZGajrBEWzFraLMqky1EJBeqOiHYMdiKQoVk2MWuGnjvERCAgRMCJRaFRo7dYN1ItTx8jOX2FpKjS9quqQFlmNFTtK6ZT3gKVoqCgW6GaHBgUD/AEH+/wCi45TlgZUkCsvSyS5Wn4U+vVExvqXR3+PWDdSLU8fH/fM3CpNMAAn5JRzikg0PGoOUwZzGmHm5UkA3+lFEFBpBrBoTxlPTCrk1CZivVN4zumn6+RMtHIin9yoNBuInx8OsG6kWp4+F7InQXlfyDXV4qkxQMSwqtKas0bWbhs0QOEWZzwqH+qQ6eGZtArmiVyfSNTRFdQWvmv6EzpBTq+EYtynHVHMgJCYIIja/frBupFqeO8Ra3dMXrE6lDAAsMyo7T0KuCl7FOgUoor1CwISCASA/2LiAaRcRJGB1jNrhgtGibLzpm/lmhziqDPOkXpzBZJ7gvD4d2sG6kWp47o81sqsCkwekU06B/aiZYo2FMW3u8yzFyjoVpzwoA/3HkBYqTaOZoHABnHDSXtim8YK1SwRT+AezLRI7rVBmxqxzPZrBupFqeOyhwVpe54LUClgEIcNSYrginRbCJvIQDEXpqNuttZQAYQA/3ggxDgzBTkf2IVeyRh/7qXBHBAaamFkKd7xDV4MnCPajiqx6awbqRelZ0q6rS/qaDiJZeU8guAyCcXjUc9i8vgiDtzNzk+khom8LD3X/AII2CJQQ4UeOikSz5gTiI1nZJizQyETSUmBT0Rt5MfBkLEwqkg9IRGyCCIwHAKKSovivCdAWgU4CZwRB2SZEHK43L3BNxHod/EM7gmIG1SbzT/wzURKCHUaPiRC24NUVfjgOAONSgLF2wCnB06kSDUjkCLuha2jIXxRh1cDgGQYOmwGsaTeZn/ihJCJQQCp+lZzmmNU3O20GbU1juhTB4GJROiAsRsDZ14/8c3/pP//aAAwDAQMCEAMQAAAQ88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888884wwwwwwww088888888888888888888888884+wIFlEH5Z0FVwLMH4w8888888888888888884wGcc+fQhxzjjhRxBx1ruJTEw888888888888844XPFRilO//AP8A/wD/AP8A/wD/APxQAcaBiZcNPPPPPPPPPPFo9ExQv/0gSTSzQTCTiWGf/wD/APBibPU8888888888IDAiwuKeMD7C6TkimZSWDeAB/8A/wAH1TzzzzzzzzzygMUILK4CdcMZVIoKJLM38LJ6s4kGlTzzzzzzzzzygNE8gIFEHEFIr9AACx/JF5s+ZPkGlTzzzzzzzzzygMAEGFL3cEQUlEPEEE0sPIObGUEGlTzzzzzzzzzygP8A9+CVCYAcs9sRgTTDx1PRAEA/BpU8888888888oBNQVVs8999998XDCGCHAizhcQOCpU8888888888pnq889w0998898XDCBjwJAAAAD1wrU8888888888oD8999ZU38Y098XDAQ+GBLAAAAAUiU8888888888oD8989+ZcJH998XDAATGyCIAAAA+DU8888888888oD898HQYE8Y998XDAAARLiHAAAA+DU8888888888oD899YXs98c998XDAAAAmClIAAA+DU8888888888oD8999M2oTx498XDAAAAAoy4AAA+DU8888888888oD8999otl8c998XDAAAAADKQLAA+DU8888888888oB899998999998XLCAAAAAALjAAW/U8888888888la8wwwwwwwwww4YihBBBBBBxhBB2hU8888888888GnBNNBBBBBNNJBqFC2GACyCCCCCdhU8888888888Bu8/wD/AKsZYb//AP8AalAx0JKLzNwwwwhnPPPPPPPPPPKAYP8A/wD2TLW//wD/AOpQN1Vc4ABwMP6ODzzzzzzzzzzyy0X/APKWKXq//wD/AOpSjJrEIWwcMN4R7zzzzzzzzzzzyyMn9BJZYI7/AP8A6lKHuzAig8wwiYXPPPPPPPPPPPPLIXFv/wCScX//AP8A6lBnoww7D3vhBEvPPPPPPPPPPPPPPGxP/wBr7sn/AP8A6lGDAAgUKwQsMPPPPPPPPPPPPPPPPB7yQv8A8E/7/wDqUHfqeJAIa6cM8888888888888888s2yC2/8AxTf/AOpQ7Io8woOihzzzzzzzzzzzzzzzzzzyyCFMn/8AEB/qUDD+SDIzIc888888888888888888888sR6h//e/qUDDDKHRwc8888888888888888888888888TdKm9qUDDGM5ac8888888888888888888888888sMivpJqRCZ+M888888888888888888888888888888s1KrIrg8M888888888888888888888888888888888s9dYM8888888888888888888840288888888888808w084604081k04w0408888/9oACAEDEwE/EP8A1UHonJGne7befpbhN6QJD9cEyj6f2doKcYiA4B0JP65Sbsmnik0VPWqkQxRPSpkRKhWm8FSEJRQPolCCiZUYxEZ20kTr4oIx8xrigbLoVv1mjniOhO+VgI70laMNMrlE5ygXg6uE+jyp/Si/fTLigR8OpFX4aCxF8nUdhrdBzHyxwRqjwUDGOF/aMYEiyvO1Cd8sDXlQytPtCZKc3Oind7J4Q+JFvCfCPOds6cDplHrSJTxdQUEC4Zi2qyTzOtXhE2tLK4zVCd4CbEfM+nrZEGqfI06DwUwvtVcD+Yo1boOAJWy6Ems0Ld6oCpzMIFUFF2oalOSCcs10hLyy5HfX0aK6j+IO+qdBThlCGkcdIOZ9DSaF05Jt+hYgdKf/AL4b6HveI1ZPhUppKeYKcZBWaHbaUBIJRR0MRVZBskmzYkLVO5jPqZRTJ0Ag0PI6oUFNy5/V7ZlUEnTiiqvGfP4jVugRcJLoCJ2OhbT0eK1XRQfRCF6Lqjz/AIvSeuwCSivh0NqgzohCTRV9+gvW6HQj5/Eat1dlsAoViYKUJ3HFVx7RBWQO1CwwATF9dlIN5QPbKRioFliTB9DxGvIakzc8FsmjiHwBApE0nQSDww69bftOmHdwy1QPPRHKS/zRAepqKvjvYSRohdQhMhD6iRNJ0IKkzY1giN3lgfHbJCjSE26Jqy+cgwdpHHUAAUQ3PVImk6vfVrQNvKTPYD3Yb6W4InUgdNO5MyRNJ2Q8zlwnC2rawr/+x9fEEDQ46DyHkBR72mkTSdgGiiklgekCijQfr4gidE8Ox7zJE0naX2iEwesFMfa8yH9gMQR5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" alt="Ονειροχώρα" style={{width:"110px",height:"110px",objectFit:"contain"}}/></div>
          <h1>Ονειροχώρα</h1>
          <p>«Η κάθε μέρα του παιδιού δεν γυρνάει πίσω.»</p>
        </div>
        {err && <div className="lerr">⚠️ {err}</div>}
        <div className="lfield"><label>Όνομα χρήστη</label><input value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="username"/></div>
        <div className="lfield"><label>Κωδικός</label><input type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="••••••••"/></div>
        <div onClick={()=>setRemember(!remember)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:18,userSelect:"none"}}>
          <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${remember?"var(--green)":"var(--beige3)"}`,background:remember?"var(--green)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
            {remember&&<span style={{color:"#fff",fontSize:12,fontWeight:900,lineHeight:1}}>✓</span>}
          </div>
          <span style={{fontSize:13,fontWeight:500,color:"var(--text2)"}}>Να με θυμάσαι σε αυτή τη συσκευή</span>
        </div>
        <button className="lbtn" onClick={go}>Σύνδεση</button>
      </div>
    </div>
  );
}

// ─── GLOBAL SEARCH ───────────────────────────────────────────────────────────
function GlobalSearch({kids, setPage, inline=false}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef();

  // Search engine — looks in ALL fields
  const search = (query) => {
    if(!query||query.trim().length<2) return [];
    const s = query.toLowerCase().trim();
    const results = [];

    kids.forEach(child => {
      const matches = [];
      const t = TMIMATA.find(t=>t.id===child.tmima);

      // Helper to check field and record match label
      const chk = (val, label) => {
        if(val && val.toString().toLowerCase().includes(s))
          matches.push({label, val: val.toString()});
      };

      chk(child.name,            "Όνομα παιδιού");
      chk(child.pat_name||child.goneas1, "Πατέρας");
      chk(child.mit_name||child.goneas2, "Μητέρα");
      chk(child.pat_kinito||child.phone_babas, "Τηλ. Μπαμπά");
      chk(child.mit_kinito||child.phone_mama,  "Τηλ. Μαμάς");
      chk(child.phone_spiti||child.tilefono_oikias, "Σταθερό σπιτιού");
      chk(child.pat_ergasia,     "Τηλ. εργασίας Πατέρα");
      chk(child.mit_ergasia,     "Τηλ. εργασίας Μητέρας");
      chk(child.pat_afm,         "ΑΦΜ Πατέρα");
      chk(child.mit_afm,         "ΑΦΜ Μητέρας");
      chk(child.pat_email,       "Email Πατέρα");
      chk(child.mit_email,       "Email Μητέρας");
      chk(child.address||([child.odos,child.arithmos,child.topos_katoikias].filter(Boolean).join(" ")), "Διεύθυνση");
      chk(child.allergies,       "Αλλεργίες");
      chk(child.iatrika,         "Ιατρικό");

      // Extra members
      (child.extra_members||[]).forEach(m=>{
        chk(m.name,  `Επαφή (${m.relation})`);
        chk(m.phone, `Τηλ. ${m.name}`);
      });

      if(matches.length>0) {
        results.push({ child, tmima:t, matches });
      }
    });

    return results.slice(0,12);
  };

  const results = search(q);
  const showDropdown = open && q.trim().length>=2;

  const handleSelect = () => {
    setOpen(false);
    setQ("");
    setPage("mitroo");
  };

  // highlight matching text
  const highlight = (text, query) => {
    if(!text||!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if(idx===-1) return text;
    return (
      <>
        {text.slice(0,idx)}
        <mark style={{background:"#FFF9C4",color:"#92400E",borderRadius:2,padding:"0 1px"}}>{text.slice(idx,idx+query.length)}</mark>
        {text.slice(idx+query.length)}
      </>
    );
  };

  if(inline) {
    // Dashboard hero version
    return (
      <div className="dash-search-hero">
        <h2>🔍 Γρήγορη Αναζήτηση</h2>
        <p>Αναζήτηση σε παιδιά, γονείς, τηλέφωνα, ΑΦΜ, διευθύνσεις...</p>
        <div className="dash-search-bar" style={{position:"relative"}}>
          <span className="dash-search-ico">🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={e=>{setQ(e.target.value);setOpen(true);}}
            onFocus={()=>setOpen(true)}
            placeholder='π.χ. "Παπαδόπουλος", "6944...", "ΑΦΜ 123..."'
            autoComplete="off"
          />
          <button onClick={()=>inputRef.current?.focus()}>Αναζήτηση</button>
          {showDropdown&&(
            <>
              <div className="gsearch-overlay" onClick={()=>setOpen(false)}/>
              <div className="gsearch-results" style={{top:"calc(100% + 10px)",left:0,right:0,width:"auto",borderRadius:"0 0 16px 16px"}}>
                {results.length===0?(
                  <div className="gsr-empty">
                    <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                    <div style={{fontWeight:600,marginBottom:4}}>Δεν βρέθηκαν αποτελέσματα</div>
                    <div style={{fontSize:12}}>Δοκιμάστε τηλέφωνο, ΑΦΜ, επίθετο ή διεύθυνση</div>
                  </div>
                ):(
                  <>
                    <div className="gsr-header">{results.length} αποτέλεσμ{results.length===1?"α":"ατα"} για «{q}»</div>
                    {results.map(({child,tmima,matches})=>(
                      <div key={child.id} className="gsr-item" onClick={handleSelect}>
                        <div className="gsr-av" style={{background:mkColor(child.name)}}>{child.name.charAt(0)}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="gsr-name">{highlight(child.name,q)}</div>
                          <div className="gsr-meta">{tmima?.name}{child.pat_name?` · ${child.pat_name}`:""}</div>
                          {matches.slice(0,2).map((m,i)=>(
                            <div key={i} className="gsr-match">
                              {m.label}: {highlight(m.val,q)}
                            </div>
                          ))}
                          {matches.length>2&&<div style={{fontSize:10,color:"var(--text3)"}}>+{matches.length-2} ακόμα αντιστοιχίες</div>}
                        </div>
                        <span style={{fontSize:11,color:"var(--text3)",flexShrink:0}}>→ Μητρώο</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Topbar compact version
  return (
    <div className="gsearch-wrap">
      <span className="gsearch-ico">🔍</span>
      <input
        className="gsearch-input"
        value={q}
        onChange={e=>{setQ(e.target.value);setOpen(true);}}
        onFocus={()=>setOpen(true)}
        placeholder="Αναζήτηση παιδιού, τηλεφώνου, ΑΦΜ..."
        autoComplete="off"
      />
      {showDropdown&&(
        <>
          <div className="gsearch-overlay" onClick={()=>setOpen(false)}/>
          <div className="gsearch-results">
            {results.length===0?(
              <div className="gsr-empty">
                <div style={{fontSize:28,marginBottom:6}}>🔍</div>
                <div style={{fontWeight:600,marginBottom:3}}>Δεν βρέθηκαν αποτελέσματα</div>
                <div style={{fontSize:12}}>Δοκιμάστε τηλέφωνο, ΑΦΜ ή επίθετο</div>
              </div>
            ):(
              <>
                <div className="gsr-header">{results.length} αποτελέσματα για «{q}»</div>
                {results.map(({child,tmima,matches})=>(
                  <div key={child.id} className="gsr-item" onClick={handleSelect}>
                    <div className="gsr-av" style={{background:mkColor(child.name)}}>{child.name.charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="gsr-name">{highlight(child.name,q)}</div>
                      <div className="gsr-meta">{tmima?.name}{child.pat_name?` · ${child.pat_name}`:""}</div>
                      {matches.slice(0,2).map((m,i)=>(
                        <div key={i} className="gsr-match">{m.label}: {highlight(m.val,q)}</div>
                      ))}
                      {matches.length>2&&<div style={{fontSize:10,color:"var(--text3)"}}>+{matches.length-2} ακόμα</div>}
                    </div>
                    <span style={{fontSize:10,color:"var(--text3)",flexShrink:0}}>→ Μητρώο</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}


// ─── ΔΙΑΧΕΙΡΙΣΗ ΧΡΗΣΤΩΝ (μόνο Διοίκηση) ───────────────────────────────────────
function Xristes({users, setUsers, currentUser}) {
  const [search,setSearch] = useState("");
  const [roleFilter,setRoleFilter] = useState("all");
  const [showAdd,setShowAdd] = useState(false);
  const [editUser,setEditUser] = useState(null);
  const [showPass,setShowPass] = useState({});
  const [confirmDel,setConfirmDel] = useState(null);
  const [showCredCard,setShowCredCard] = useState(false);

  const emptyForm = { username:"", password:"", role:"teacher", name:"", tmima_id:"", child_id:"" };
  const [form,setForm] = useState(emptyForm);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const ROLE_LABEL = { admin:"👑 Διοίκηση", secretary:"📋 Γραμματεία", teacher:"👩‍🏫 Δασκάλα", parent:"👪 Γονέας" };
  const ROLE_COLOR = { admin:"#CC2929", secretary:"#3AAED8", teacher:"var(--green)", parent:"#F5B800" };

  const mkInitials = (name) => {
    const parts = (name||"").trim().split(" ").filter(Boolean);
    if(parts.length===0) return "?";
    if(parts.length===1) return parts[0].charAt(0);
    return parts[0].charAt(0)+parts[parts.length-1].charAt(0);
  };

  const genPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let pass = "";
    for(let i=0;i<8;i++) pass += chars.charAt(Math.floor(Math.random()*chars.length));
    return pass;
  };

  const filt = users.filter(u=>{
    const s = search.toLowerCase();
    const matchS = u.name.toLowerCase().includes(s) || u.username.toLowerCase().includes(s);
    const matchR = roleFilter==="all" || u.role===roleFilter;
    return matchS && matchR;
  });

  const openAdd = () => { setForm({...emptyForm, password:genPassword()}); setEditUser(null); setShowAdd(true); };
  const openEdit = (u) => { setForm({username:u.username, password:u.password, role:u.role, name:u.name, tmima_id:u.tmima_id||"", child_id:u.child_id||""}); setEditUser(u); setShowAdd(true); };

  const saveUser = () => {
    if(!form.username.trim()||!form.password.trim()||!form.name.trim()){
      alert("Συμπληρώστε όνομα χρήστη, κωδικό και ονοματεπώνυμο.");
      return;
    }
    // Check username uniqueness (except when editing same user)
    const dup = users.find(u=>u.username===form.username && (!editUser||u.id!==editUser.id));
    if(dup){ alert("Αυτό το όνομα χρήστη υπάρχει ήδη. Επιλέξτε άλλο."); return; }

    const tmimaObj = TMIMATA.find(t=>t.id===form.tmima_id);
    const payload = {
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      name: form.name.trim(),
      initials: mkInitials(form.name),
      ...(form.role==="teacher" ? { tmima_id: form.tmima_id, tmima: tmimaObj?.name||"" } : {}),
      ...(form.role==="parent" ? { child_id: form.child_id?Number(form.child_id):undefined } : {}),
    };

    if(editUser){
      setUsers(users.map(u=>u.id===editUser.id?{...u,...payload}:u));
    } else {
      const newId = Math.max(0,...users.map(u=>u.id))+1;
      setUsers([...users, {id:newId, ...payload}]);
    }
    setShowAdd(false); setEditUser(null); setForm(emptyForm);
  };

  const deleteUser = (u) => {
    if(u.id===currentUser.id){ alert("Δεν μπορείτε να διαγράψετε τον δικό σας λογαριασμό."); return; }
    setUsers(users.filter(x=>x.id!==u.id));
    setConfirmDel(null);
  };

  const togglePass = (id) => setShowPass(p=>({...p,[id]:!p[id]}));

  const counts = {
    admin: users.filter(u=>u.role==="admin").length,
    secretary: users.filter(u=>u.role==="secretary").length,
    teacher: users.filter(u=>u.role==="teacher").length,
    parent: users.filter(u=>u.role==="parent").length,
  };

  return (
    <div className="page-in">
      {/* STATS */}
      <div className="g3" style={{marginBottom:20, gridTemplateColumns:"repeat(4,1fr)"}}>
        <StatCard icon="👑" bg="#FFF0F0" value={counts.admin} label="Διοίκηση"/>
        <StatCard icon="📋" bg="#EDF6FB" value={counts.secretary} label="Γραμματεία"/>
        <StatCard icon="👩‍🏫" bg="#E8F4E8" value={counts.teacher} label="Δασκάλες"/>
        <StatCard icon="👪" bg="#FFF9E0" value={counts.parent} label="Γονείς"/>
      </div>

      {/* TOOLBAR */}
      <div className="search-row">
        <div className="search-box">
          <input className="sinput" placeholder="Αναζήτηση ονόματος ή username..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="select" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
          <option value="all">Όλοι οι ρόλοι</option>
          <option value="admin">Διοίκηση</option>
          <option value="secretary">Γραμματεία</option>
          <option value="teacher">Δασκάλες</option>
          <option value="parent">Γονείς</option>
        </select>
        <button className="btn btn-primary" onClick={openAdd}>+ Νέος χρήστης</button>
        <button className="btn btn-ghost" onClick={()=>setShowCredCard(true)}>🖨️ Κάρτα στοιχείων προσωπικού</button>
      </div>

      {/* SECURITY NOTICE */}
      <div style={{background:"#FFF8E7",border:"1.5px solid #F5B800",borderRadius:12,padding:"12px 15px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
        <div style={{fontSize:12,color:"#78350F",lineHeight:1.6}}>
          Οι κωδικοί εδώ αποθηκεύονται προσωρινά στη συνεδρία (session) — <strong>χάνονται όταν κλείσετε τη σελίδα</strong>.
          Για μόνιμη & ασφαλή αποθήκευση χρειάζεται σύνδεση με βάση δεδομένων.
        </div>
      </div>

      {/* ΚΑΡΤΑ ΣΤΟΙΧΕΙΩΝ ΠΡΟΣΩΠΙΚΟΥ — για εκτύπωση/παράδοση */}
      {showCredCard && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowCredCard(false)}>
          <div className="modal modal-lg" style={{maxWidth:640}}>
            <div className="modal-title">
              🖨️ Στοιχεία σύνδεσης προσωπικού
              <button className="modal-close" onClick={()=>setShowCredCard(false)}>✕</button>
            </div>
            <div style={{fontSize:12,color:"var(--text3)",marginBottom:16}}>
              Δώστε προσωπικά σε κάθε άτομο τη γραμμή που του αντιστοιχεί. Δεν περιλαμβάνονται γονείς —
              οι λογαριασμοί τους δημιουργούνται από το Μητρώο.
            </div>

            <div id="cred-card-print" style={{border:"1px solid var(--beige3)",borderRadius:12,overflow:"hidden"}}>
              <div style={{background:"var(--green)",color:"#fff",padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>🛡️</span>
                <div>
                  <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:16}}>Ονειροχώρα</div>
                  <div style={{fontSize:11,opacity:.85}}>Στοιχεία σύνδεσης προσωπικού — εμπιστευτικό</div>
                </div>
              </div>
              {users.filter(u=>u.role!=="parent").map((u,i)=>(
                <div key={u.id} style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr",gap:10,padding:"12px 18px",background:i%2===0?"var(--beige)":"var(--white)",borderTop:i===0?"none":"1px solid var(--beige3)"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{u.name}</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>{u.tmima || (u.role==="admin"?"Διοίκηση":u.role==="secretary"?"Γραμματεία":"")}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".04em"}}>Username</div>
                    <div style={{fontFamily:"monospace",fontWeight:700,fontSize:13}}>{u.username}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".04em"}}>Κωδικός</div>
                    <div style={{fontFamily:"monospace",fontWeight:700,fontSize:13,color:"var(--burg)"}}>{u.password}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={()=>window.print()}>🖨️ Εκτύπωση</button>
              <button className="btn btn-ghost" onClick={()=>setShowCredCard(false)}>Κλείσιμο</button>
            </div>
          </div>
        </div>
      )}

      {/* USER LIST */}
      <div className="card">
        {filt.length===0 && (
          <div style={{textAlign:"center",padding:"40px 16px",color:"var(--text3)"}}>
            <div style={{fontSize:32,marginBottom:8}}>👥</div>
            <div>Δεν βρέθηκαν χρήστες</div>
          </div>
        )}
        {filt.map(u=>(
          <div key={u.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 14px",borderRadius:12,border:"1.5px solid var(--beige3)",marginBottom:8,background:"var(--white)"}}>
            <div className="av" style={{background:mkColor(u.name),width:42,height:42,fontSize:15,borderRadius:12,flexShrink:0}}>{u.initials}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,fontSize:14}}>{u.name}</span>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:20,background:ROLE_COLOR[u.role]+"18",color:ROLE_COLOR[u.role]}}>{ROLE_LABEL[u.role]}</span>
                {u.tmima && <span className="badge b-earth" style={{fontSize:10}}>{u.tmima}</span>}
              </div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:3,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <span>👤 {u.username}</span>
                <span style={{display:"flex",alignItems:"center",gap:5}}>
                  🔑 {showPass[u.id] ? u.password : "••••••••"}
                  <button onClick={()=>togglePass(u.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"var(--green)",fontWeight:600,padding:0}}>
                    {showPass[u.id]?"Απόκρυψη":"Εμφάνιση"}
                  </button>
                </span>
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button className="btn btn-ghost btn-xs" onClick={()=>openEdit(u)}>✏️ Επεξεργασία</button>
              {confirmDel===u.id ? (
                <>
                  <button className="btn btn-xs" style={{background:"#CC2929",color:"#fff",border:"none"}} onClick={()=>deleteUser(u)}>Επιβεβαίωση</button>
                  <button className="btn btn-ghost btn-xs" onClick={()=>setConfirmDel(null)}>Άκυρο</button>
                </>
              ) : (
                <button className="btn btn-ghost btn-xs" onClick={()=>setConfirmDel(u.id)}>🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {showAdd && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal">
            <div className="modal-title">
              {editUser?"Επεξεργασία χρήστη":"Νέος χρήστης"}
              <button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button>
            </div>

            <div className="fgroup">
              <label className="flabel">Ρόλος *</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["admin","👑 Διοίκηση"],["secretary","📋 Γραμματεία"],["teacher","👩‍🏫 Δασκάλα"],["parent","👪 Γονέας"]].map(([v,l])=>(
                  <button key={v} onClick={()=>f("role",v)}
                    className="btn" style={{justifyContent:"center",background:form.role===v?"var(--green)":"var(--beige2)",color:form.role===v?"#fff":"var(--text2)",border:`1.5px solid ${form.role===v?"var(--green)":"var(--beige3)"}`}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="fgroup">
              <label className="flabel">Ονοματεπώνυμο *</label>
              <input className="finput" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="π.χ. Κατερίνα Ιωάννου"/>
            </div>

            <div className="f2">
              <div className="fgroup">
                <label className="flabel">Όνομα χρήστη (username) *</label>
                <input className="finput" value={form.username} onChange={e=>f("username",e.target.value.toLowerCase().replace(/\s/g,""))} placeholder="π.χ. katerina"/>
              </div>
              <div className="fgroup">
                <label className="flabel">Κωδικός πρόσβασης *</label>
                <div style={{display:"flex",gap:6}}>
                  <input className="finput" value={form.password} onChange={e=>f("password",e.target.value)} placeholder="Κωδικός"/>
                  <button className="btn btn-ghost btn-sm" style={{flexShrink:0}} onClick={()=>f("password",genPassword())} title="Δημιουργία τυχαίου κωδικού">🎲</button>
                </div>
              </div>
            </div>

            {form.role==="teacher" && (
              <div className="fgroup">
                <label className="flabel">Τμήμα</label>
                <select className="finput" value={form.tmima_id} onChange={e=>f("tmima_id",e.target.value)}>
                  <option value="">Επιλέξτε τμήμα...</option>
                  {TMIMATA.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            {form.role==="parent" && (
              <div className="fgroup">
                <label className="flabel">ID Παιδιού (από το Μητρώο)</label>
                <input className="finput" type="number" value={form.child_id} onChange={e=>f("child_id",e.target.value)} placeholder="π.χ. 3"/>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>Βρείτε το ID του παιδιού ανοίγοντας την καρτέλα του στο Μητρώο.</div>
              </div>
            )}

            <div style={{display:"flex",gap:10,marginTop:6}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={saveUser}>💾 Αποθήκευση</button>
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Ακύρωση</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({user, kids, setPage}) {
  const pres = kids.filter(c=>c.present).length;
  const pend = kids.filter(c=>c.didaktra==="pending").length;
  const today_events = EVENTS.filter(e=>e.date===TODAY);
  return (
    <div className="page-in">
      {/* GLOBAL SEARCH HERO */}
      <GlobalSearch kids={kids} setPage={setPage} inline={true}/>

      {/* ΠΡΩΤΟΚΟΛΛΑ — μόνο για δασκάλες */}
      {user.role==="teacher" && (
        <div className="card" style={{marginBottom:20,borderLeft:"4px solid var(--green)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:22}}>📜</span>
            <div>
              <div className="card-title" style={{margin:0}}>Πρωτόκολλα Επιχείρησης</div>
              <div style={{fontSize:12,color:"var(--text3)"}}>Τα πρωτόκολλα που έχετε υπογράψει</div>
            </div>
            <span className="badge b-green" style={{marginLeft:"auto",fontSize:11}}>
              {PROTOCOLS.filter(p=>p.signed).length}/{PROTOCOLS.length} υπογεγραμμένα
            </span>
          </div>

          <div style={{marginTop:12}}>
            {PROTOCOLS.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",borderRadius:11,border:`1.5px solid ${p.signed?"var(--beige3)":"#F5B800"}`,background:p.signed?"var(--white)":"#FFFBEB",marginBottom:8}}>
                <div style={{width:34,height:34,borderRadius:9,background:p.signed?"var(--green3)":"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                  {p.signed?"✅":"⏳"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13.5}}>{p.title}</div>
                  <div style={{fontSize:12,color:"var(--text2)",marginTop:2,lineHeight:1.5}}>{p.short}</div>
                  {p.signed
                    ? <div style={{fontSize:11,color:"var(--green)",fontWeight:600,marginTop:4}}>Υπεγράφη {new Date(p.date).toLocaleDateString("el-GR")}</div>
                    : <div style={{fontSize:11,color:"#B45309",fontWeight:600,marginTop:4}}>Εκκρεμεί υπογραφή</div>}
                </div>
                <button className="btn btn-ghost btn-xs" style={{flexShrink:0}}>Προβολή</button>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:"var(--text3)",marginTop:8,fontStyle:"italic"}}>
            ℹ️ Τα πλήρη κείμενα των πρωτοκόλλων θα προστεθούν σύντομα.
          </div>
        </div>
      )}

      {(user.role==="admin"||user.role==="secretary") && (
        <div className="inv-link" onClick={()=>alert("🔗 Σύνδεση με πρόγραμμα τιμολογίων — θα ενεργοποιηθεί με τον σύνδεσμό σας")}>
          <span style={{fontSize:28}}>🧾</span>
          <div><div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:15}}>Πρόγραμμα Αποδείξεων & Τιμολογίων</div>
          <div style={{fontSize:12,opacity:.8,marginTop:2}}>Κλικ για άνοιγμα → Σύνδεσμος θα ενεργοποιηθεί</div></div>
          <div style={{marginLeft:"auto",fontSize:20}}>→</div>
        </div>
      )}

      <div className="stats-row">
        <StatCard icon="👶" bg="#E8F4E8" value={kids.length} label="Σύνολο παιδιών" trend="+2 αυτόν τον μήνα" up/>
        <StatCard icon="✓" bg="#ECFDF5" value={pres} label="Παρόντες σήμερα" trend={Math.round(pres/kids.length*100)+"%"} up/>
        <StatCard icon="€" bg="#FFFBEB" value={pend} label="Εκκρεμείς πληρωμές" trend={pend>5?"Χρειάζεται προσοχή":""} up={false}/>
        <StatCard icon="✉" bg="#F5EDEC" value="3" label="Νέα μηνύματα"/>
      </div>

      <div className="card-title" style={{fontFamily:"Playfair Display,serif",fontSize:15,color:"var(--green)",marginBottom:12}}>
        🏡 Τμήματα σήμερα
      </div>
      <div className="tmima-grid" style={{marginBottom:24}}>
        {TMIMATA.map(t=>{
          const tk=kids.filter(c=>c.tmima===t.id);
          const p=tk.filter(c=>c.present).length;
          return (
            <div key={t.id} className="tmima-card" style={{borderColor:t.color+"55"}} onClick={()=>setPage("parousies")}>
              <div className="tm-name">{t.name}</div>
              <div className="tm-teacher">{t.teacher.split(" ")[0]}</div>
              <div className="tm-count" style={{color:t.color}}>{p}<span style={{fontSize:14,color:"var(--text3)",fontFamily:"DM Sans",fontWeight:500}}>/{t.capacity}</span></div>
              <div className="pbar"><div className="pbar-fill" style={{width:`${p/t.capacity*100}%`,background:t.color}}/></div>
            </div>
          );
        })}
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-title">🚌 Δρομολόγια σήμερα</div>
          {ROUTES.map(r=>(
            <div key={r.id} className="route-item">
              <div className="route-ico" style={{background:r.status==="active"?"#ECFDF5":"#FFFBEB"}}>{r.status==="active"?"🚌":"⏳"}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13}}>{r.name}</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{r.driver} · {r.plate} · {r.kids} παιδιά</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:16}}>{r.time}</div>
                <span className={`badge ${r.status==="active"?"b-green":"b-amber"}`} style={{fontSize:10}}>
                  {r.status==="active"?"Σε κίνηση":"Καθυστέρηση"}
                </span>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{width:"100%",marginTop:6,justifyContent:"center"}} onClick={()=>setPage("dromologia")}>Διαχείριση δρομολογίων</button>
        </div>

        <div className="card">
          <div className="card-title">📅 Σήμερα & Επόμενα</div>
          {today_events.length===0 && <div style={{fontSize:13,color:"var(--text3)",padding:"8px 0"}}>Δεν υπάρχουν εκδηλώσεις σήμερα</div>}
          {EVENTS.slice(0,4).map(e=>(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderBottom:"1px solid var(--beige3)"}}>
              <div style={{width:36,height:36,borderRadius:10,background:e.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{e.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13}}>{e.title}</div>
                <div style={{fontSize:11,color:"var(--text3)"}}>{new Date(e.date).toLocaleDateString("el-GR",{day:"numeric",month:"short"})}{e.tmima?" · "+TMIMATA.find(t=>t.id===e.tmima)?.name:""}</div>
              </div>
              <span className="badge b-earth" style={{fontSize:10,flexShrink:0}}>{e.date===TODAY?"Σήμερα":""}</span>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{width:"100%",marginTop:8,justifyContent:"center"}} onClick={()=>setPage("calendar")}>Άνοιγμα ημερολογίου</button>
        </div>
      </div>
    </div>
  );
}

// ─── PARASTATIKO COMPONENT ───────────────────────────────────────────────────
function ParastatikoPar({label, icon, color, colorLight, user, selId, subcats, sel, setKids, kids}) {
  const canEdit = user.role==="admin"||user.role==="secretary";
  const allChecked = subcats.every(s=>sel[s.key]);
  const anyChecked = subcats.some(s=>sel[s.key]);

  const toggle = (key) => {
    if(!canEdit) return;
    const now = new Date().toLocaleDateString("el-GR",{day:"2-digit",month:"2-digit",year:"numeric"});
    const time = new Date().toLocaleTimeString("el-GR",{hour:"2-digit",minute:"2-digit"});
    const wasChecked = sel[key];
    // Build history entry
    const histKey = key+"_hist";
    const hist = sel[histKey]||[];
    const newHist = wasChecked
      ? [{action:"Αποεπιλογή",date:now,time,by:user.name,...(sel[key+"_date"]&&{prev:sel[key+"_date"]})},...hist]
      : [{action:"Εκδόθηκε",date:now,time,by:user.name},...hist];
    // Update child
    setKids(kids.map(c=>c.id===selId?{
      ...c,
      [key]:!wasChecked,
      [key+"_date"]:!wasChecked?`${now} ${time}`:null,
      [histKey]:newHist,
    }:c));
  };

  const borderColor = anyChecked ? color : "var(--beige3)";
  const bg = anyChecked ? colorLight : "var(--white)";

  return (
    <div style={{border:`1.5px solid ${borderColor}`,borderRadius:14,marginBottom:12,overflow:"hidden",transition:"all .2s"}}>
      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:bg,borderBottom:`1px solid ${anyChecked?color+"33":"var(--beige3)"}`}}>
        <span style={{fontSize:20}}>{icon}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13,color:anyChecked?color:"var(--text)"}}>{label}</div>
          <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>
            {allChecked?"✓ Ολοκληρωμένο":anyChecked?"Μερικώς εκδοθέν":"Εκκρεμεί"}
          </div>
        </div>
        <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:allChecked?"#ECFDF5":anyChecked?colorLight:"var(--beige2)",color:allChecked?"#059669":anyChecked?color:"var(--text3)",border:`1px solid ${allChecked?"#34D399":anyChecked?color+"44":"var(--beige3)"}`}}>
          {subcats.filter(s=>sel[s.key]).length}/{subcats.length}
        </span>
      </div>

      {/* SUBCATEGORIES */}
      <div style={{padding:"10px 16px 4px",background:bg}}>
        {subcats.map(s=>{
          const checked = sel[s.key]||false;
          const dateStr = sel[s.key+"_date"];
          const hist = sel[s.key+"_hist"]||[];
          return (
            <div key={s.key}>
              {/* Subcat row */}
              <div
                onClick={()=>toggle(s.key)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${checked?color+"66":"var(--beige3)"}`,background:checked?colorLight+"99":"var(--white)",marginBottom:6,cursor:canEdit?"pointer":"default",transition:"all .15s"}}>
                {/* Checkbox */}
                <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${checked?color:"var(--gray2)"}`,background:checked?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  {checked&&<span style={{color:"#fff",fontSize:11,fontWeight:900,lineHeight:1}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13,color:checked?color:"var(--text)"}}>{s.label}</div>
                  {s.af&&<div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>ΑΦΜ: {s.af}</div>}
                </div>
                {checked&&dateStr&&(
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:color,fontWeight:600}}>{dateStr}</div>
                    <div style={{fontSize:10,color:"var(--text3)"}}>από {hist[0]?.by||"—"}</div>
                  </div>
                )}
                {!checked&&<span style={{fontSize:10,color:"var(--text3)",fontWeight:600}}>Εκκρεμεί</span>}
              </div>

              {/* ΙΣΤΟΡΙΚΟ */}
              {hist.length>0&&(
                <div style={{marginLeft:20,marginBottom:8,borderLeft:`2px solid ${color}33`,paddingLeft:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:5}}>Ιστορικό</div>
                  {hist.slice(0,3).map((h,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:h.action==="Εκδόθηκε"?color:"var(--gray2)",flexShrink:0}}/>
                      <div style={{fontSize:11,color:"var(--text2)"}}>
                        <span style={{fontWeight:600,color:h.action==="Εκδόθηκε"?color:"var(--text3)"}}>{h.action}</span>
                        {" · "}{h.date} {h.time}
                        {" · "}<span style={{color:"var(--text3)"}}>{h.by}</span>
                      </div>
                    </div>
                  ))}
                  {hist.length>3&&<div style={{fontSize:10,color:"var(--text3)",paddingLeft:14}}>+{hist.length-3} παλαιότερες εγγραφές</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ΠΑΙΔΙΑ & ΦΑΚΕΛΟΙ ───────────────────────────────────────────────────────
function Paidia({user, kids, setKids}) {
  const [search,setSearch] = useState("");
  const [ft,setFt] = useState("all");
  const [showAdd,setShowAdd] = useState(false);
  const [sel,setSel] = useState(null);
  const [ctab,setCtab] = useState("paidiko");
  const [addStep,setAddStep] = useState(1); // multi-step form

  const emptyForm = {
    // ΣΤΟΙΧΕΙΑ ΠΑΙΔΙΟΥ
    name:"", birthdate:"", topos_katoikias:"", odos:"", arithmos:"", tk:"", tilefono_oikias:"",
    tmima:"vr-a",
    // ΠΑΤΕΡΑΣ
    pat_name:"", pat_kinito:"", pat_epaggelma:"", pat_ergasia:"",
    pat_afm:"", pat_doy:"", pat_email:"",
    // ΜΗΤΕΡΑ
    mit_name:"", mit_kinito:"", mit_epaggelma:"", mit_ergasia:"",
    mit_afm:"", mit_doy:"", mit_email:"",
    // ΠΑΠΠΟΥΣ / ΓΙΑΓΙΑ
    pappous_name:"", pappous_kinito:"",
    giagia_name:"", giagia_kinito:"",
    // ΑΛΛΑ ΑΤΟΜΑ (4 slots)
    ep1_name:"", ep1_kinito:"",
    ep2_name:"", ep2_kinito:"",
    ep3_name:"", ep3_kinito:"",
    ep4_name:"", ep4_kinito:"",
    // ΙΑΤΡΙΚΟ
    iatrika:"ΟΥΔΕΝ",
    // ΜΕΤΑΦΟΡΑ
    scholiko:"no", ora_afixis:"", ora_anaxorisis:"",
    // ΜΕΣΗΜΕΡΙΑΝΟ
    mesimeri:"yes",
    // PORTAL
    parent_username:"", parent_password:"",
    // Παραστατικά — υποκατηγορίες
    par_espa_baba:false, par_espa_baba_date:null, par_espa_baba_hist:[],
    par_espa_mama:false, par_espa_mama_date:null, par_espa_mama_hist:[],
    par_did_baba:false,  par_did_baba_date:null,  par_did_baba_hist:[],
    par_did_mama:false,  par_did_mama_date:null,  par_did_mama_hist:[],
    par_erg_apodeixi:false, par_erg_apodeixi_date:null, par_erg_apodeixi_hist:[],
    par_erg_timolog:false,  par_erg_timolog_date:null,  par_erg_timolog_hist:[],
    // computed
    present:false, didaktra:"pending", amount:350,
    daily_reports:[], messages:[], docs:[],
  };
  const [form,setForm] = useState(emptyForm);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const getSurname = (name) => (name||"").trim().split(" ").slice(1).join(" ") || name;

  const filt = kids.filter(c=>{
    const s=search.toLowerCase();
    return (c.name.toLowerCase().includes(s)||(c.pat_name||"").toLowerCase().includes(s)||(c.mit_name||"").toLowerCase().includes(s))
      && (ft==="all"||c.tmima===ft);
  }).sort((a,b)=>getSurname(a.name).localeCompare(getSurname(b.name),"el"));

  const saveKid = () => {
    const t = TMIMATA.find(t=>t.id===form.tmima);
    setKids([...kids,{...form, id:Date.now(), amount:t?.type==="vrefiko"?350:280}]);
    setShowAdd(false); setAddStep(1); setForm(emptyForm);
  };

  const DOC_TYPES=[
    {label:"Πιστοποιητικό Οικογενειακής Κατάστασης", icon:"📋"},
    {label:"Ληξιαρχική Πράξη Γέννησης", icon:"📄"},
    {label:"Ταυτότητα Πατέρα", icon:"🪪"},
    {label:"Ταυτότητα Μητέρας", icon:"🪪"},
    {label:"Χαρτί Γιατρού / Ιατρικό", icon:"🏥"},
    {label:"Εμβόλια", icon:"💉"},
    {label:"Άλλο έγγραφο", icon:"📝"},
  ];

  // Field row helper for detail view
  const Row = ({label, value}) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 0",borderBottom:"1px solid var(--beige3)"}}>
      <span style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",flexShrink:0,marginRight:12}}>{label}</span>
      <span style={{fontWeight:500,fontSize:13,textAlign:"right",color:value&&value!=="—"?"var(--text)":"var(--text3)"}}>{value||"—"}</span>
    </div>
  );

  const STEPS = ["Στοιχεία Παιδιού","Οικογένεια","Ιατρικό & Λοιπά","Οικονομικά"];

  return (
    <div className="page-in">
      {/* TOOLBAR */}
      <div className="search-row">
        <div className="search-box">
          <input className="sinput" placeholder="Αναζήτηση παιδιού, πατέρα ή μητέρας..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="select" value={ft} onChange={e=>setFt(e.target.value)}>
          <option value="all">Όλα τα τμήματα</option>
          {TMIMATA.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {(user.role==="admin"||user.role==="secretary")&&(
          <button className="btn btn-primary" onClick={()=>{setShowAdd(true);setAddStep(1);setForm(emptyForm);}}>+ Νέο παιδί</button>
        )}
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr>
              <th>Παιδί</th><th>Τμήμα</th><th>Ημ/νία γέν.</th>
              <th>Πατέρας</th><th>Μητέρα</th>
              <th>Κινητό Πατέρα</th><th>Κινητό Μητέρας</th>
              <th>Σχολικό</th><th>Δίδακτρα</th><th>Παρουσία</th>
            </tr></thead>
            <tbody>
              {filt.map(c=>{
                const t=TMIMATA.find(t=>t.id===c.tmima);
                return (
                  <tr key={c.id} onClick={()=>{setSel(c);setCtab("paidiko");}}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <div className="av" style={{background:mkColor(c.name)}}>{c.name.charAt(0)}</div>
                        <span style={{fontWeight:600}}>{c.name}</span>
                      </div>
                    </td>
                    <td><span className="badge b-earth">{t?.name}</span></td>
                    <td style={{fontSize:12,color:"var(--text2)"}}>{c.birthdate||c.age||"—"}</td>
                    <td style={{fontSize:12}}>{c.pat_name||c.goneas1||"—"}</td>
                    <td style={{fontSize:12,color:"var(--text2)"}}>{c.mit_name||c.goneas2||"—"}</td>
                    <td style={{fontSize:12}}>{c.pat_kinito||c.phone_babas||"—"}</td>
                    <td style={{fontSize:12}}>{c.mit_kinito||c.phone_mama||"—"}</td>
                    <td>
                      <span className={`badge ${c.scholiko==="yes"?"b-earth":"b-gray"}`}>
                        {c.scholiko==="yes"?"✓ Ναι":"Όχι"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.didaktra==="paid"?"b-green":"b-amber"}`}>
                        {c.didaktra==="paid"?"✓ Εξοφλημένο":"Εκκρεμεί"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.present?"b-green":"b-red"}`}>
                        {c.present?"Παρών":"Απών"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filt.length===0&&(
                <tr><td colSpan={10} style={{textAlign:"center",padding:"32px",color:"var(--text3)"}}>Δεν βρέθηκαν παιδιά</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{padding:"10px 0 0",fontSize:12,color:"var(--text3)"}}>
          Εμφάνιση {filt.length} από {kids.length} παιδιά
        </div>
      </div>

      {/* ── ADD MODAL (multi-step) ── */}
      {showAdd&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal modal-lg" style={{maxWidth:820}}>

            {/* Header */}
            <div className="modal-title" style={{marginBottom:10}}>
              Αίτηση Εγγραφής — {STEPS[addStep-1]}
              <button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button>
            </div>

            {/* Step indicators */}
            <div style={{display:"flex",gap:6,marginBottom:22}}>
              {STEPS.map((s,i)=>(
                <div key={i} style={{flex:1,height:4,borderRadius:2,background:addStep>i?"var(--green)":"var(--beige3)",transition:"background .3s"}}/>
              ))}
            </div>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:18,fontWeight:600}}>
              Βήμα {addStep} από {STEPS.length} — {STEPS[addStep-1]}
            </div>

            {/* ── STEP 1: ΣΤΟΙΧΕΙΑ ΠΑΙΔΙΟΥ ── */}
            {addStep===1&&(
              <div>
                <div className="section-hd">👶 Στοιχεία Μαθητή/Μαθήτριας</div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Ονοματεπώνυμο παιδιού *</label>
                    <input className="finput" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="π.χ. Αλέξης Παπαδόπουλος"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Ημερομηνία γέννησης *</label>
                    <input className="finput" type="date" value={form.birthdate} onChange={e=>f("birthdate",e.target.value)}/>
                  </div>
                </div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Τμήμα εγγραφής *</label>
                    <select className="finput" value={form.tmima} onChange={e=>f("tmima",e.target.value)}>
                      {TMIMATA.map(t=><option key={t.id} value={t.id}>{t.name} ({t.type==="vrefiko"?"Βρεφικό":"Παιδικό"} — {t.capacity} θέσεις)</option>)}
                    </select>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Τηλέφωνο οικίας</label>
                    <input className="finput" value={form.tilefono_oikias} onChange={e=>f("tilefono_oikias",e.target.value)} placeholder="231xxxxxxx"/>
                  </div>
                </div>

                <div className="section-hd">📍 Τόπος Κατοικίας</div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr",gap:10}}>
                  <div className="fgroup">
                    <label className="flabel">Τόπος κατοικίας</label>
                    <input className="finput" value={form.topos_katoikias} onChange={e=>f("topos_katoikias",e.target.value)} placeholder="π.χ. Θεσσαλονίκη"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Οδός</label>
                    <input className="finput" value={form.odos} onChange={e=>f("odos",e.target.value)} placeholder="π.χ. Εγνατία"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Αριθμός</label>
                    <input className="finput" value={form.arithmos} onChange={e=>f("arithmos",e.target.value)} placeholder="45"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Τ.Κ.</label>
                    <input className="finput" value={form.tk} onChange={e=>f("tk",e.target.value)} placeholder="54xxx"/>
                  </div>
                </div>

                <div className="section-hd">🚌 Μεταφορά με Σχολικό</div>
                <div style={{display:"flex",gap:10,marginBottom:14}}>
                  {[["yes","✓ ΝΑΙ"],["no","✕ ΟΧΙ"]].map(([v,l])=>(
                    <button key={v} onClick={()=>f("scholiko",v)}
                      className="btn" style={{flex:1,justifyContent:"center",background:form.scholiko===v?"var(--green)":"var(--beige2)",color:form.scholiko===v?"#fff":"var(--text2)",border:`1.5px solid ${form.scholiko===v?"var(--green)":"var(--beige3)"}`}}>
                      {l}
                    </button>
                  ))}
                </div>
                {form.scholiko==="yes"&&(
                  <div className="f2">
                    <div className="fgroup">
                      <label className="flabel">Προτεινόμενη ώρα άφιξης</label>
                      <input className="finput" type="time" value={form.ora_afixis} onChange={e=>f("ora_afixis",e.target.value)}/>
                    </div>
                    <div className="fgroup">
                      <label className="flabel">Προτεινόμενη ώρα αναχώρησης</label>
                      <input className="finput" type="time" value={form.ora_anaxorisis} onChange={e=>f("ora_anaxorisis",e.target.value)}/>
                    </div>
                  </div>
                )}

                <div className="section-hd">🍽️ Μεσημεριανό</div>
                <div style={{display:"flex",gap:10,marginBottom:6}}>
                  {[["yes","Επιθυμώ σίτιση"],["no","Δεν επιθυμώ σίτιση"]].map(([v,l])=>(
                    <button key={v} onClick={()=>f("mesimeri",v)}
                      className="btn" style={{flex:1,justifyContent:"center",background:form.mesimeri===v?"var(--green)":"var(--beige2)",color:form.mesimeri===v?"#fff":"var(--text2)",border:`1.5px solid ${form.mesimeri===v?"var(--green)":"var(--beige3)"}`}}>
                      {l}
                    </button>
                  ))}
                </div>
                <div style={{fontSize:12,color:"var(--text3)",marginBottom:14}}>Έχω ενημερωθεί για τα γεύματα και έχω λάβει το πρόγραμμα.</div>
              </div>
            )}

            {/* ── STEP 2: ΟΙΚΟΓΕΝΕΙΑ ── */}
            {addStep===2&&(
              <div>
                <div className="section-hd">👨 Στοιχεία Πατέρα</div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Ονοματεπώνυμο Πατέρα *</label>
                    <input className="finput" value={form.pat_name} onChange={e=>f("pat_name",e.target.value)} placeholder="Πλήρες ονοματεπώνυμο"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Κινητό τηλέφωνο *</label>
                    <input className="finput" value={form.pat_kinito} onChange={e=>f("pat_kinito",e.target.value)} placeholder="69xxxxxxxx"/>
                  </div>
                </div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Επάγγελμα</label>
                    <input className="finput" value={form.pat_epaggelma} onChange={e=>f("pat_epaggelma",e.target.value)} placeholder="π.χ. Μηχανικός"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Τηλέφωνο εργασίας</label>
                    <input className="finput" value={form.pat_ergasia} onChange={e=>f("pat_ergasia",e.target.value)} placeholder="231xxxxxxx"/>
                  </div>
                </div>

                <div className="section-hd">👩 Στοιχεία Μητέρας</div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Ονοματεπώνυμο Μητέρας *</label>
                    <input className="finput" value={form.mit_name} onChange={e=>f("mit_name",e.target.value)} placeholder="Πλήρες ονοματεπώνυμο"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Κινητό τηλέφωνο *</label>
                    <input className="finput" value={form.mit_kinito} onChange={e=>f("mit_kinito",e.target.value)} placeholder="69xxxxxxxx"/>
                  </div>
                </div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Επάγγελμα</label>
                    <input className="finput" value={form.mit_epaggelma} onChange={e=>f("mit_epaggelma",e.target.value)} placeholder="π.χ. Εκπαιδευτικός"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Τηλέφωνο εργασίας</label>
                    <input className="finput" value={form.mit_ergasia} onChange={e=>f("mit_ergasia",e.target.value)} placeholder="231xxxxxxx"/>
                  </div>
                </div>

                <div className="section-hd">👴👵 Παππούς & Γιαγιά</div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Ονοματεπώνυμο Παππού</label>
                    <input className="finput" value={form.pappous_name} onChange={e=>f("pappous_name",e.target.value)}/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Κινητό Παππού</label>
                    <input className="finput" value={form.pappous_kinito} onChange={e=>f("pappous_kinito",e.target.value)} placeholder="69xxxxxxxx"/>
                  </div>
                </div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Ονοματεπώνυμο Γιαγιάς</label>
                    <input className="finput" value={form.giagia_name} onChange={e=>f("giagia_name",e.target.value)}/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Κινητό Γιαγιάς</label>
                    <input className="finput" value={form.giagia_kinito} onChange={e=>f("giagia_kinito",e.target.value)} placeholder="69xxxxxxxx"/>
                  </div>
                </div>

                <div className="section-hd">👤 Άλλα άτομα επικοινωνίας</div>
                {[[1,"ep1"],[2,"ep2"],[3,"ep3"],[4,"ep4"]].map(([n,k])=>(
                  <div key={k} className="f2" style={{marginBottom:4}}>
                    <div className="fgroup" style={{marginBottom:8}}>
                      <label className="flabel">Ονοματεπώνυμο {n}</label>
                      <input className="finput" value={form[k+"_name"]} onChange={e=>f(k+"_name",e.target.value)} placeholder="Προαιρετικό"/>
                    </div>
                    <div className="fgroup" style={{marginBottom:8}}>
                      <label className="flabel">Κινητό {n}</label>
                      <input className="finput" value={form[k+"_kinito"]} onChange={e=>f(k+"_kinito",e.target.value)} placeholder="69xxxxxxxx"/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 3: ΙΑΤΡΙΚΟ & ΛΟΙΠΑ ── */}
            {addStep===3&&(
              <div>
                <div className="section-hd">🏥 Ιατρικό Ιστορικό</div>
                <div style={{background:"var(--beige)",borderRadius:12,padding:"12px 14px",marginBottom:12,fontSize:13,color:"var(--text2)"}}>
                  Αν υπάρχει κάποιο θέμα υγείας (π.χ. αλλεργία) να καταγραφεί, ή <strong>«ΟΥΔΕΝ»</strong> αν δεν υπάρχει.
                </div>
                <div className="fgroup">
                  <label className="flabel">Ιατρικές πληροφορίες *</label>
                  <textarea className="finput" rows={5} value={form.iatrika} onChange={e=>f("iatrika",e.target.value)}
                    placeholder="π.χ. Αλλεργία στη γλουτένη — απαγορεύεται η κατανάλωση ψωμιού, ζυμαρικών&#10;ή γράψτε: ΟΥΔΕΝ"/>
                </div>

                <div className="section-hd">🔑 Portal Γονέα (Πρόσβαση στην εφαρμογή)</div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Username γονέα</label>
                    <input className="finput" value={form.parent_username} onChange={e=>f("parent_username",e.target.value)} placeholder="π.χ. papadopoulos2026"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Κωδικός πρόσβασης</label>
                    <input className="finput" type="password" value={form.parent_password} onChange={e=>f("parent_password",e.target.value)} placeholder="Τουλάχιστον 8 χαρακτήρες"/>
                  </div>
                </div>
                <div style={{background:"var(--green3)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"var(--green)",fontWeight:500}}>
                  ℹ️ Ο γονέας θα χρησιμοποιεί αυτά τα στοιχεία για να συνδεθεί στην εφαρμογή και να βλέπει το ημερήσιο δελτίο του παιδιού.
                </div>

                <div className="section-hd" style={{marginTop:18}}>📋 Έγγραφα Εγγραφής</div>
                <div style={{fontSize:13,color:"var(--text2)",marginBottom:12}}>Ελέγξτε ποια δικαιολογητικά έχουν κατατεθεί:</div>
                {DOC_TYPES.map((dt,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",border:"1.5px solid var(--beige3)",borderRadius:10,marginBottom:7,background:"var(--white)"}}>
                    <span style={{fontSize:20}}>{dt.icon}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:500}}>{dt.label}</span>
                    <label style={{display:"flex",alignItems:"center",gap:6,background:"var(--green3)",color:"var(--green)",padding:"5px 11px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid rgba(47,79,62,.2)",whiteSpace:"nowrap"}}>
                      📎 Ανέβασμα αρχείου
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>{if(e.target.files[0])alert(`✅ Αρχείο "${e.target.files[0].name}" επιλέχθηκε για: ${dt.label}`);}}/>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 4: ΟΙΚΟΝΟΜΙΚΑ ── */}
            {addStep===4&&(
              <div>
                <div className="section-hd">💼 Οικονομικά Στοιχεία Πατέρα <span style={{color:"var(--burg)",fontSize:11}}>(υποχρεωτική συμπλήρωση)</span></div>
                <div className="fgroup">
                  <label className="flabel">Ονοματεπώνυμο (όπως στην ταυτότητα) *</label>
                  <input className="finput" value={form.pat_name} onChange={e=>f("pat_name",e.target.value)} placeholder="Ακριβώς όπως αναγράφεται στην ταυτότητα"/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:10}}>
                  <div className="fgroup">
                    <label className="flabel">Α.Φ.Μ. *</label>
                    <input className="finput" value={form.pat_afm} onChange={e=>f("pat_afm",e.target.value)} placeholder="xxxxxxxxx"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Δ.Ο.Υ. *</label>
                    <input className="finput" value={form.pat_doy} onChange={e=>f("pat_doy",e.target.value)} placeholder="π.χ. Α' Θεσσαλονίκης"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Email *</label>
                    <input className="finput" type="email" value={form.pat_email} onChange={e=>f("pat_email",e.target.value)} placeholder="email@example.gr"/>
                  </div>
                </div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Επάγγελμα</label>
                    <input className="finput" value={form.pat_epaggelma} onChange={e=>f("pat_epaggelma",e.target.value)}/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Κινητό τηλέφωνο</label>
                    <input className="finput" value={form.pat_kinito} onChange={e=>f("pat_kinito",e.target.value)}/>
                  </div>
                </div>

                <div className="section-hd">💼 Οικονομικά Στοιχεία Μητέρας <span style={{color:"var(--burg)",fontSize:11}}>(υποχρεωτική συμπλήρωση)</span></div>
                <div className="fgroup">
                  <label className="flabel">Ονοματεπώνυμο (όπως στην ταυτότητα) *</label>
                  <input className="finput" value={form.mit_name} onChange={e=>f("mit_name",e.target.value)} placeholder="Ακριβώς όπως αναγράφεται στην ταυτότητα"/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:10}}>
                  <div className="fgroup">
                    <label className="flabel">Α.Φ.Μ. *</label>
                    <input className="finput" value={form.mit_afm} onChange={e=>f("mit_afm",e.target.value)} placeholder="xxxxxxxxx"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Δ.Ο.Υ. *</label>
                    <input className="finput" value={form.mit_doy} onChange={e=>f("mit_doy",e.target.value)} placeholder="π.χ. Α' Θεσσαλονίκης"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Email *</label>
                    <input className="finput" type="email" value={form.mit_email} onChange={e=>f("mit_email",e.target.value)} placeholder="email@example.gr"/>
                  </div>
                </div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Επάγγελμα</label>
                    <input className="finput" value={form.mit_epaggelma} onChange={e=>f("mit_epaggelma",e.target.value)}/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Κινητό τηλέφωνο</label>
                    <input className="finput" value={form.mit_kinito} onChange={e=>f("mit_kinito",e.target.value)}/>
                  </div>
                </div>

                <div style={{background:"var(--beige)",borderRadius:12,padding:"14px 16px",marginTop:6,fontSize:12,color:"var(--text2)",lineHeight:1.7}}>
                  <div style={{fontWeight:700,marginBottom:6,color:"var(--text)"}}>📌 Γενικοί Όροι Καταβολής Διδάκτρων</div>
                  <div>• Τα δίδακτρα προκαταβάλλονται κάθε 1η–5η του μήνα.</div>
                  <div>• Η προκαταβολή σε καμία περίπτωση δεν επιστρέφεται.</div>
                  <div>• Εκπτώσεις παρέχονται μόνο για φοίτηση δύο ή τριών αδελφών.</div>
                  <div>• Αποδοχή πληρωμής: μετρητά, κάρτα Visa/Mastercard, τράπεζα.</div>
                </div>
                <div style={{display:"flex",alignItems:"flex-start",gap:10,marginTop:14,padding:"12px 14px",background:"var(--green3)",borderRadius:10}}>
                  <span style={{fontSize:16,flexShrink:0}}>✅</span>
                  <span style={{fontSize:12,color:"var(--green)",fontWeight:500}}>
                    Με την αποθήκευση επιβεβαιώνετε ότι έχετε διαβάσει και αποδεχτεί τους όρους εγγραφής και την πολιτική προστασίας προσωπικών δεδομένων της Ονειροχώρας.
                  </span>
                </div>

                <div className="section-hd" style={{marginTop:18}}>📄 Παραστατικά</div>
                <div style={{fontSize:13,color:"var(--text2)",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span>Επισημάνετε τα παραστατικά που εκδόθηκαν:</span>
                  <button onClick={()=>window.open("https://www.prosvasisgo.gr","_blank")}
                    style={{display:"flex",alignItems:"center",gap:5,background:"#1A3A6E",color:"#fff",border:"none",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    ProsvasisGo
                  </button>
                </div>

                {[
                  {label:"Παραστατικό ΕΣΠΑ", icon:"🏛️", color:"#1A3A6E", light:"#EEF2FF",
                   subs:[{key:"par_espa_baba",label:"Στον Μπαμπά"},{key:"par_espa_mama",label:"Στη Μαμά"}]},
                  {label:"Παραστατικό Διδάκτρων", icon:"🧾", color:"#065F46", light:"#ECFDF5",
                   subs:[{key:"par_did_baba",label:"Στον Μπαμπά"},{key:"par_did_mama",label:"Στη Μαμά"}]},
                  {label:"Παραστατικό μέσω Εργάσιας", icon:"💼", color:"#92400E", light:"#FFFBEB",
                   subs:[{key:"par_erg_apodeixi",label:"Απόδειξη"},{key:"par_erg_timolog",label:"Τιμολόγιο"}]},
                ].map(p=>{
                  const anyChecked = p.subs.some(s=>form[s.key]);
                  return (
                    <div key={p.label} style={{border:`1.5px solid ${anyChecked?p.color+"66":"var(--beige3)"}`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                      <div style={{padding:"10px 14px",background:anyChecked?p.light:"var(--beige)",borderBottom:`1px solid ${anyChecked?p.color+"22":"var(--beige3)"}`,display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:18}}>{p.icon}</span>
                        <span style={{fontWeight:700,fontSize:13,color:anyChecked?p.color:"var(--text)"}}>{p.label}</span>
                        <span style={{marginLeft:"auto",fontSize:10,fontWeight:700,color:"var(--text3)"}}>{p.subs.filter(s=>form[s.key]).length}/{p.subs.length}</span>
                      </div>
                      <div style={{padding:"8px 14px 10px",background:anyChecked?p.light+"88":"var(--white)",display:"flex",gap:10}}>
                        {p.subs.map(s=>(
                          <div key={s.key} onClick={()=>f(s.key,!form[s.key])}
                            style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:9,border:`1.5px solid ${form[s.key]?p.color:"var(--beige3)"}`,background:form[s.key]?p.light:"var(--white)",cursor:"pointer",transition:"all .15s"}}>
                            <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${form[s.key]?p.color:"var(--gray2)"}`,background:form[s.key]?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              {form[s.key]&&<span style={{color:"#fff",fontSize:10,fontWeight:900}}>✓</span>}
                            </div>
                            <span style={{fontSize:12,fontWeight:600,color:form[s.key]?p.color:"var(--text2)"}}>{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{display:"flex",gap:10,marginTop:22,paddingTop:16,borderTop:"1px solid var(--beige3)"}}>
              {addStep>1&&(
                <button className="btn btn-ghost" onClick={()=>setAddStep(s=>s-1)}>← Πίσω</button>
              )}
              <div style={{flex:1}}/>
              {addStep<4?(
                <button className="btn btn-primary" onClick={()=>setAddStep(s=>s+1)}
                  disabled={addStep===1&&!form.name}>
                  Επόμενο →
                </button>
              ):(
                <button className="btn btn-primary" onClick={saveKid}
                  style={{background:"var(--green)",padding:"10px 24px"}}>
                  💾 Αποθήκευση εγγραφής
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {sel&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
          <div className="modal modal-lg" style={{maxWidth:820}}>
            {/* Header */}
            <div className="modal-title">
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div className="av" style={{background:mkColor(sel.name),width:46,height:46,fontSize:17,borderRadius:13,flexShrink:0}}>{sel.name.charAt(0)}</div>
                <div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:18}}>{sel.name}</div>
                  <div style={{fontSize:12,fontWeight:400,color:"var(--text3)",marginTop:2}}>
                    {TMIMATA.find(t=>t.id===sel.tmima)?.name}
                    {sel.birthdate&&" · "+sel.birthdate}
                    {sel.scholiko==="yes"&&" · 🚌 Σχολικό"}
                    {sel.mesimeri==="yes"&&" · 🍽️ Μεσημεριανό"}
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={()=>setSel(null)}>✕</button>
            </div>

            {/* Tabs */}
            <div className="tabs">
              {[
                {k:"paidiko", l:"👶 Παιδί"},
                {k:"pateras", l:"👨 Πατέρας"},
                {k:"mitera",  l:"👩 Μητέρα"},
                {k:"epafes",  l:"📞 Επαφές"},
                {k:"iatrika", l:"🏥 Ιατρικό"},
                {k:"oikon",   l:"💼 Οικονομικά"},
                {k:"eggrafa", l:"📁 Έγγραφα"},
              ].map(({k,l})=>(
                <button key={k} className={`tab ${ctab===k?"active":""}`} onClick={()=>setCtab(k)}>{l}</button>
              ))}
            </div>

            {/* Tab: ΠΑΙΔΙ */}
            {ctab==="paidiko"&&(
              <div>
                <Row label="Ονοματεπώνυμο"      value={sel.name}/>
                <Row label="Ημ/νία γέννησης"    value={sel.birthdate||sel.age}/>
                <Row label="Τμήμα"              value={TMIMATA.find(t=>t.id===sel.tmima)?.name}/>
                <Row label="Τόπος κατοικίας"    value={[sel.odos,sel.arithmos,sel.topos_katoikias,sel.tk].filter(Boolean).join(", ")||sel.address}/>
                <Row label="Τηλέφωνο οικίας"    value={sel.tilefono_oikias||sel.phone_spiti}/>
                <Row label="Σχολικό"            value={sel.scholiko==="yes"?`Ναι — Άφιξη ${sel.ora_afixis||"—"}, Αναχώρηση ${sel.ora_anaxorisis||"—"}`:"Όχι"}/>
                <Row label="Μεσημεριανό"        value={sel.mesimeri==="yes"?"Επιθυμεί σίτιση":"Δεν επιθυμεί σίτιση"}/>
                <div style={{marginTop:12}}>
                  {sel.address&&<button className="btn btn-ghost btn-sm" onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sel.address||[sel.odos,sel.arithmos,sel.topos_katoikias].join(" "))}`)}>🗺️ Άνοιγμα στο Google Maps</button>}
                </div>
              </div>
            )}

            {/* Tab: ΠΑΤΕΡΑΣ */}
            {ctab==="pateras"&&(
              <div>
                <Row label="Ονοματεπώνυμο"    value={sel.pat_name||sel.goneas1}/>
                <Row label="Κινητό τηλέφωνο"  value={sel.pat_kinito||sel.phone_babas}/>
                <Row label="Επάγγελμα"         value={sel.pat_epaggelma}/>
                <Row label="Τηλ. εργασίας"    value={sel.pat_ergasia}/>
                <Row label="Email"             value={sel.pat_email||sel.goneas1_email}/>
                <Row label="Α.Φ.Μ."            value={sel.pat_afm}/>
                <Row label="Δ.Ο.Υ."            value={sel.pat_doy}/>
                {(sel.pat_kinito||sel.phone_babas)&&(
                  <button className="btn btn-ghost btn-sm" style={{marginTop:12}} onClick={()=>window.location.href=`tel:${sel.pat_kinito||sel.phone_babas}`}>📞 Κλήση</button>
                )}
              </div>
            )}

            {/* Tab: ΜΗΤΕΡΑ */}
            {ctab==="mitera"&&(
              <div>
                <Row label="Ονοματεπώνυμο"    value={sel.mit_name||sel.goneas2}/>
                <Row label="Κινητό τηλέφωνο"  value={sel.mit_kinito||sel.phone_mama}/>
                <Row label="Επάγγελμα"         value={sel.mit_epaggelma}/>
                <Row label="Τηλ. εργασίας"    value={sel.mit_ergasia}/>
                <Row label="Email"             value={sel.mit_email||sel.goneas2_email}/>
                <Row label="Α.Φ.Μ."            value={sel.mit_afm}/>
                <Row label="Δ.Ο.Υ."            value={sel.mit_doy}/>
                {(sel.mit_kinito||sel.phone_mama)&&(
                  <button className="btn btn-ghost btn-sm" style={{marginTop:12}} onClick={()=>window.location.href=`tel:${sel.mit_kinito||sel.phone_mama}`}>📞 Κλήση</button>
                )}
              </div>
            )}

            {/* Tab: ΕΠΑΦΕΣ */}
            {ctab==="epafes"&&(
              <div>
                {sel.pappous_name&&<><div style={{fontWeight:700,fontSize:12,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",padding:"12px 0 4px"}}>ΠΑΠΠΟΥΣ</div><Row label="Ονοματεπώνυμο" value={sel.pappous_name}/><Row label="Κινητό" value={sel.pappous_kinito}/></>}
                {sel.giagia_name&&<><div style={{fontWeight:700,fontSize:12,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",padding:"12px 0 4px"}}>ΓΙΑΓΙΑ</div><Row label="Ονοματεπώνυμο" value={sel.giagia_name}/><Row label="Κινητό" value={sel.giagia_kinito}/></>}
                {[[1,"ep1"],[2,"ep2"],[3,"ep3"],[4,"ep4"]].map(([n,k])=>sel[k+"_name"]?(
                  <div key={k}>
                    <div style={{fontWeight:700,fontSize:12,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",padding:"12px 0 4px"}}>ΕΠΑΦΗ {n}</div>
                    <Row label="Ονοματεπώνυμο" value={sel[k+"_name"]}/>
                    <Row label="Κινητό"        value={sel[k+"_kinito"]}/>
                  </div>
                ):null)}
                {!sel.pappous_name&&!sel.giagia_name&&!sel.ep1_name&&(
                  <div style={{textAlign:"center",padding:"24px",color:"var(--text3)",fontSize:13}}>Δεν έχουν καταχωρηθεί επιπλέον επαφές</div>
                )}
              </div>
            )}

            {/* Tab: ΙΑΤΡΙΚΟ */}
            {ctab==="iatrika"&&(
              <div>
                <div style={{background:sel.iatrika&&sel.iatrika!=="ΟΥΔΕΝ"?"#FEF2F2":"var(--green3)",borderRadius:12,padding:"16px",marginBottom:14,borderLeft:`3px solid ${sel.iatrika&&sel.iatrika!=="ΟΥΔΕΝ"?"#FCA5A5":"var(--green)"}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>Ιατρικό Ιστορικό</div>
                  <div style={{fontSize:14,fontWeight:500,color:"var(--text)",whiteSpace:"pre-wrap",lineHeight:1.6}}>{sel.iatrika||"ΟΥΔΕΝ"}</div>
                </div>
                <Row label="Διατροφή"   value={sel.diatrofi||"Κανονική"}/>
                <Row label="Μεσημεριανό" value={sel.mesimeri==="yes"?"Επιθυμεί σίτιση":"Δεν επιθυμεί"}/>
              </div>
            )}

            {/* Tab: ΟΙΚΟΝΟΜΙΚΑ */}
            {ctab==="oikon"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <div style={{padding:"14px 16px",background:"var(--beige)",borderRadius:12,textAlign:"center"}}>
                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Μηνιαία δίδακτρα</div>
                    <div style={{fontFamily:"Playfair Display,serif",fontSize:26,fontWeight:700,color:"var(--green)"}}>{sel.amount||"—"}€</div>
                  </div>
                  <div style={{padding:"14px 16px",background:sel.didaktra==="paid"?"#ECFDF5":"#FFFBEB",borderRadius:12,textAlign:"center"}}>
                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Κατάσταση</div>
                    <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:sel.didaktra==="paid"?"#059669":"#D97706"}}>{sel.didaktra==="paid"?"✓ Εξοφλημένο":"⏳ Εκκρεμεί"}</div>
                  </div>
                </div>

                {/* ΠΑΡΑΣΤΑΤΙΚΑ */}
                <div style={{fontWeight:700,fontSize:12,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",padding:"8px 0 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span>📄 Παραστατικά</span>
                  <button
                    onClick={()=>window.open("https://www.prosvasisgo.gr","_blank")}
                    style={{display:"flex",alignItems:"center",gap:6,background:"#1A3A6E",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:".02em"}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Άνοιγμα ProsvasisGo
                  </button>
                </div>

                {/* 1. ΕΣΠΑ */}
                <ParastatikoPar
                  label="Παραστατικό ΕΣΠΑ"
                  icon="🏛️"
                  color="#1A3A6E"
                  colorLight="#EEF2FF"
                  user={user}
                  selId={sel.id}
                  subcats={[
                    {key:"par_espa_baba", label:"Στον Μπαμπά", af: sel.pat_afm},
                    {key:"par_espa_mama", label:"Στη Μαμά",    af: sel.mit_afm},
                  ]}
                  sel={sel}
                  setKids={setKids}
                  kids={kids}
                />

                {/* 2. ΔΙΔΑΚΤΡΑ */}
                <ParastatikoPar
                  label="Παραστατικό Διδάκτρων"
                  icon="🧾"
                  color="#065F46"
                  colorLight="#ECFDF5"
                  user={user}
                  selId={sel.id}
                  subcats={[
                    {key:"par_did_baba", label:"Στον Μπαμπά", af: sel.pat_afm},
                    {key:"par_did_mama", label:"Στη Μαμά",    af: sel.mit_afm},
                  ]}
                  sel={sel}
                  setKids={setKids}
                  kids={kids}
                />

                {/* 3. ΕΡΓΑΣΙΑ */}
                <ParastatikoPar
                  label="Παραστατικό μέσω Εργάσιας"
                  icon="💼"
                  color="#92400E"
                  colorLight="#FFFBEB"
                  user={user}
                  selId={sel.id}
                  subcats={[
                    {key:"par_erg_apodeixi", label:"Απόδειξη",   af:""},
                    {key:"par_erg_timolog",  label:"Τιμολόγιο",  af:""},
                  ]}
                  sel={sel}
                  setKids={setKids}
                  kids={kids}
                />

                <div style={{fontWeight:700,fontSize:12,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",padding:"14px 0 6px"}}>Στοιχεία τιμολόγησης — Πατέρας</div>
                <Row label="Α.Φ.Μ." value={sel.pat_afm}/>
                <Row label="Δ.Ο.Υ." value={sel.pat_doy}/>
                <Row label="Email"   value={sel.pat_email}/>
                <div style={{fontWeight:700,fontSize:12,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",padding:"14px 0 6px"}}>Στοιχεία τιμολόγησης — Μητέρα</div>
                <Row label="Α.Φ.Μ." value={sel.mit_afm}/>
                <Row label="Δ.Ο.Υ." value={sel.mit_doy}/>
                <Row label="Email"   value={sel.mit_email}/>
              </div>
            )}

            {/* Tab: ΕΓΓΡΑΦΑ */}
            {ctab==="eggrafa"&&(
              <div>
                {DOC_TYPES.map((dt,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",border:`1.5px solid ${i<1?"#34D399":"var(--beige3)"}`,borderRadius:11,marginBottom:8,background:i<1?"#F0FDF4":"var(--white)"}}>
                    <span style={{fontSize:22}}>{dt.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13}}>{dt.label}</div>
                      <div style={{fontSize:11,color:i<1?"#059669":"var(--text3)",marginTop:1}}>
                        {i<1?"✓ Κατατέθηκε 10/1/2026":"Δεν έχει ανεβεί ακόμα"}
                      </div>
                    </div>
                    {(user.role==="admin"||user.role==="secretary") ? (
                      <label style={{display:"flex",alignItems:"center",gap:5,background:i<1?"var(--green3)":"var(--beige2)",color:i<1?"var(--green)":"var(--text2)",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${i<1?"rgba(47,79,62,.2)":"var(--beige3)"}`,whiteSpace:"nowrap",transition:"all .15s"}}>
                        {i<1?"🔄 Αντικατάσταση":"📎 Ανέβασμα αρχείου"}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>{if(e.target.files[0])alert(`✅ "${e.target.files[0].name}" → ${dt.label}`);}}/>
                      </label>
                    ) : (
                      <span className={`badge ${i<1?"b-green":"b-gray"}`}>{i<1?"✓ Υπάρχει":"Λείπει"}</span>
                    )}
                  </div>
                ))}
                {(user.role==="admin"||user.role==="secretary")&&(
                  <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:"2px dashed var(--beige3)",borderRadius:11,padding:14,cursor:"pointer",color:"var(--text3)",fontWeight:500,fontSize:13,marginTop:4,transition:"all .15s",background:"var(--beige)"}}>
                    + Ανέβασμα πρόσθετου εγγράφου
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>{if(e.target.files[0])alert(`✅ Πρόσθετο έγγραφο: "${e.target.files[0].name}"`)}}/>
                  </label>
                )}
                <div style={{background:"var(--beige)",borderRadius:10,padding:"10px 14px",marginTop:12,fontSize:12,color:"var(--text3)"}}>
                  ℹ️ Τα αρχεία ανεβαίνουν μόνο από τη Γραμματεία ή τη Διοίκηση. Οι γονείς δεν έχουν δικαίωμα ανεβάσματος.
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:8,marginTop:16,paddingTop:14,borderTop:"1px solid var(--beige3)"}}>
              {(user.role==="admin"||user.role==="secretary")&&(
                <button className="btn btn-primary btn-sm">✉️ Μήνυμα γονέα</button>
              )}
              <button className="btn btn-ghost btn-sm">✏️ Επεξεργασία</button>
              <div style={{flex:1}}/>
              <button className="modal-close" style={{width:"auto",padding:"6px 12px",borderRadius:8,fontSize:13}} onClick={()=>setSel(null)}>Κλείσιμο</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ΠΑΡΟΥΣΙΕΣ ───────────────────────────────────────────────────────────────
function Parousies({user, kids, setKids}) {
  const def = user.role==="teacher"?(TMIMATA.find(t=>t.name===user.tmima)?.id||"vr-a"):"vr-a";
  const [st,setSt] = useState(def);
  const t = TMIMATA.find(t=>t.id===st);
  const tk = kids.filter(c=>c.tmima===st);
  const pres = tk.filter(c=>c.present).length;
  const tog = (id) => setKids(kids.map(c=>c.id===id?{...c,present:!c.present}:c));

  return (
    <div className="page-in">
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {TMIMATA.map(t=>(
          <button key={t.id} className={`btn ${st===t.id?"btn-primary":"btn-ghost"}`}
            onClick={()=>setSt(t.id)}
            disabled={user.role==="teacher"&&user.tmima!==t.name}
          >{t.name}</button>
        ))}
      </div>
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div className="card-title" style={{marginBottom:2}}>{t?.name} — Παρουσίες</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>{t?.teacher} · {todayGR}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:32,fontWeight:700,color:"var(--green)"}}>{pres}<span style={{fontSize:16,color:"var(--text3)",fontFamily:"DM Sans"}}>/{tk.length}</span></div>
            <div style={{fontSize:11,color:"var(--text3)"}}>παρόντες</div>
          </div>
        </div>
        <div className="pbar" style={{height:6}}>
          <div className="pbar-fill" style={{width:`${pres/Math.max(tk.length,1)*100}%`,background:t?.color||"var(--green)"}}/>
        </div>
      </div>
      <div className="att-grid">
        {tk.map(c=>(
          <div key={c.id} className={`att-item ${c.present?"present":"absent"}`} onClick={()=>tog(c.id)}>
            <div style={{fontSize:26}}>{c.present?"✅":"❌"}</div>
            <div className="att-name">{c.name}</div>
            <div style={{fontSize:11,fontWeight:600,marginTop:3,color:c.present?"#059669":"#DC2626"}}>{c.present?"Παρών":"Απών"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ΗΜΕΡΗΣΙΟ ΔΕΛΤΙΟ ─────────────────────────────────────────────────────────
function Deltion({user, kids, setKids}) {
  const myT = user.tmima_id||"vr-a";
  const [sk,setSk] = useState(null);
  const [form,setForm] = useState({prwino:"Έφαγε κανονικά",mesimeri:"Έφαγε λίγο",apogeyma:"Έφαγε κανονικά",ypnos:"2 ώρες",drastiriotita:true,proaulismos:true,mood:"😊 Χαρούμενο",notes:""});
  const [ml,setMl] = useState([]);
  const fr = useRef();
  const myKids = kids.filter(c=>c.tmima===myT);

  const save=()=>{
    const rep={date:TODAY,...form,media:ml};
    setKids(kids.map(c=>c.id===sk.id?{...c,daily_reports:[rep,...(c.daily_reports||[]).filter(r=>r.date!==TODAY)]}:c));
    alert("✅ Δελτίο αποθηκεύτηκε!");setSk(null);
  };
  const hf=(e)=>{const f=e.target.files[0];if(f){const url=URL.createObjectURL(f);setMl([...ml,{url,name:f.name,type:f.type.startsWith("video")?"video":"image"}]);}};

  return (
    <div className="page-in">
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title">📝 Ημερήσιο Δελτίο — {user.tmima}</div>
        <p style={{fontSize:13,color:"var(--text3)",marginBottom:14}}>Επιλέξτε παιδί για συμπλήρωση δελτίου {new Date().toLocaleDateString("el-GR",{day:"numeric",month:"long"})}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
          {myKids.map(c=>{
            const has=(c.daily_reports||[]).some(r=>r.date===TODAY);
            return (
              <div key={c.id} onClick={()=>{setSk(c);const r=(c.daily_reports||[]).find(r=>r.date===TODAY);setForm(r||{prwino:"Έφαγε κανονικά",mesimeri:"Έφαγε λίγο",apogeyma:"Έφαγε κανονικά",ypnos:"2 ώρες",drastiriotita:true,proaulismos:true,mood:"😊 Χαρούμενο",notes:""});setMl([]);}}
                style={{padding:14,borderRadius:12,border:`1.5px solid ${has?"#34D399":"var(--beige3)"}`,background:has?"#F0FDF4":"var(--white)",cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                <div style={{fontSize:26}}>{has?"✅":"📝"}</div>
                <div style={{fontWeight:600,fontSize:12,marginTop:7}}>{c.name}</div>
                <div style={{fontSize:11,marginTop:2,color:has?"#059669":"var(--text3)"}}>{has?"Συμπληρώθηκε":"Εκκρεμεί"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {sk&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSk(null)}>
          <div className="modal modal-lg">
            <div className="modal-title">📝 Δελτίο — {sk.name}<button className="modal-close" onClick={()=>setSk(null)}>✕</button></div>
            <div style={{fontSize:12,color:"var(--text3)",marginBottom:16}}>📅 {todayGR}</div>

            <div className="section-hd">🍽️ Φαγητό</div>
            {[["prwino","Πρωινό 🌅"],["mesimeri","Μεσημεριανό ☀️"],["apogeyma","Απογευματινό 🌇"]].map(([k,l])=>(
              <div key={k} style={{marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--text2)",marginBottom:7}}>{l}</div>
                <div className="pill-row">{MEAL_OPTS.map(o=><div key={o} className={`pill ${form[k]===o?"sel":""}`} onClick={()=>setForm({...form,[k]:o})}>{o}</div>)}</div>
              </div>
            ))}

            <div className="section-hd">😴 Ύπνος</div>
            <div className="pill-row" style={{marginBottom:16}}>{SLEEP_OPTS.map(o=><div key={o} className={`pill ${form.ypnos===o?"sel":""}`} onClick={()=>setForm({...form,ypnos:o})}>{o}</div>)}</div>

            <div className="section-hd">🎨 Δραστηριότητα · Προαύλιο</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--beige)",borderRadius:10}}>
                <span style={{fontSize:13,fontWeight:600,color:"var(--text2)",width:180,flexShrink:0}}>🎨 Δραστηριότητα</span>
                <button className={`toggle-btn ${form.drastiriotita?"on":""}`} onClick={()=>setForm({...form,drastiriotita:!form.drastiriotita})}/>
                <span style={{fontSize:13,fontWeight:500,color:form.drastiriotita?"var(--green)":"var(--text3)"}}>{form.drastiriotita?"Συμμετείχε κανονικά":"Δεν συμμετείχε"}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--beige)",borderRadius:10}}>
                <span style={{fontSize:13,fontWeight:600,color:"var(--text2)",width:180,flexShrink:0}}>🌤️ Προαύλιο</span>
                <button className={`toggle-btn ${form.proaulismos?"on":""}`} onClick={()=>setForm({...form,proaulismos:!form.proaulismos})}/>
                <span style={{fontSize:13,fontWeight:500,color:form.proaulismos?"var(--green)":"var(--text3)"}}>{form.proaulismos?"Βγήκε στο προαύλιο":"Δεν βγήκε στο προαύλιο"}</span>
              </div>
            </div>
            <div className="section-hd" style={{marginTop:4}}>😊 Διάθεση παιδιού</div>
            <div className="pill-row" style={{marginBottom:16}}>{MOOD_OPTS.map(o=><div key={o} className={`pill ${form.mood===o?"sel":""}`} onClick={()=>setForm({...form,mood:o})}>{o}</div>)}</div>

            <div className="section-hd">📌 Σημειώσεις</div>
            <textarea className="finput" rows={4} placeholder="π.χ. Τελειώνουν οι πάνες, Καλή διάθεση σήμερα, Έχει κρυολόγημα..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{marginBottom:16,resize:"vertical",width:"100%"}}/>

            <div className="section-hd">📸 Φωτογραφίες & Βίντεο</div>
            <div className="media-drop" onClick={()=>fr.current.click()}>
              <div style={{fontSize:28,marginBottom:6}}>📷</div>
              <div style={{fontWeight:600,fontSize:13}}>Κλικ για ανέβασμα</div>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:3}}>⚠️ Οι γονείς μπορούν μόνο να τα βλέπουν</div>
              <input ref={fr} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={hf}/>
            </div>
            {ml.length>0&&(
              <div className="media-grid" style={{marginTop:10}}
                onContextMenu={e=>e.preventDefault()}>
                {ml.map((m,i)=>(
                  <div key={i} className="media-thumb" onContextMenu={e=>e.preventDefault()}>
                    {m.type==="image"?<img src={m.url} alt="" draggable="false"/>:<div style={{fontSize:32}}>🎬</div>}
                    <div className="media-protect" onContextMenu={e=>e.preventDefault()}/>
                    <div className="no-dl">🔒 Μόνο ιδ. προβολή</div>
                    <div className="no-dl-hover">🚫 Χωρίς λήψη</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={save}>💾 Αποθήκευση δελτίου</button>
              <button className="btn btn-ghost" onClick={()=>setSk(null)}>Ακύρωση</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────
function Gallery({user}) {
  const [ft,setFt] = useState("all"), [showUp,setShowUp] = useState(false);
  const [items,setItems] = useState(GALLERY_ITEMS);
  const [caption,setCaption] = useState(""), [tmima,setTmima] = useState("vr-a");
  const [selEmoji,setSelEmoji] = useState("📷");

  const filt = items.filter(i=>ft==="all"||(ft==="my"&&(i.child_id===1||i.shared))||i.tmima===ft);

  const addItem=()=>{
    setItems([...items,{id:Date.now(),tmima,date:TODAY,caption:caption||"Νέα φωτογραφία",type:"photo",emoji:selEmoji,shared:true}]);
    setShowUp(false);setCaption("");
  };

  const EMOJIS=["📷","🎨","🌿","🏃","🎵","📚","🍳","🎭","🌳","🎪","🌈","⚽"];

  return (
    <div className="page-in">
      <div className="search-row">
        <select className="select" value={ft} onChange={e=>setFt(e.target.value)}>
          <option value="all">Όλα τα τμήματα</option>
          {user.role==="parent"&&<option value="my">Το παιδί μου</option>}
          {TMIMATA.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {(user.role==="teacher"||user.role==="admin"||user.role==="secretary")&&(
          <button className="btn btn-primary" style={{marginLeft:"auto"}} onClick={()=>setShowUp(true)}>📷 Νέα φωτογραφία</button>
        )}
      </div>

      {filt.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:"var(--text3)"}}>
          <div style={{fontSize:48,marginBottom:12}}>📷</div>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:600,marginBottom:6}}>Δεν υπάρχουν φωτογραφίες</div>
          <div style={{fontSize:13}}>Επιλέξτε διαφορετικό φίλτρο ή ανεβάστε νέες.</div>
        </div>
      ):(
        <div className="gallery-grid">
          {filt.map(item=>{
            const t=TMIMATA.find(t=>t.id===item.tmima);
            return (
              <div key={item.id} className="gallery-item" style={{background:t?.color+"33"}}>
                <div className="gallery-emoji">{item.emoji}</div>
                <div className="gallery-overlay">
                  <div className="gallery-caption">{item.caption}</div>
                  <div className="gallery-meta">{t?.name} · {new Date(item.date).toLocaleDateString("el-GR",{day:"numeric",month:"short"})}</div>
                </div>
                {item.shared&&<span className="gallery-badge b-earth" style={{background:"rgba(47,79,62,.8)",color:"#fff"}}>Κοινό</span>}
                {user.role==="parent"&&(
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"flex-start",justifyContent:"flex-start",padding:8,pointerEvents:"none"}}>
                    <span style={{fontSize:10,background:"rgba(0,0,0,.45)",color:"#fff",padding:"2px 6px",borderRadius:4,fontWeight:600}}>🔒 Χωρίς λήψη</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUp&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowUp(false)}>
          <div className="modal">
            <div className="modal-title">📷 Νέα φωτογραφία<button className="modal-close" onClick={()=>setShowUp(false)}>✕</button></div>
            <div className="media-drop" onClick={()=>alert("Επιλογή αρχείου — ενεργοποιείται με backend")}>
              <div style={{fontSize:36,marginBottom:8}}>📷</div>
              <div style={{fontWeight:600,fontSize:14}}>Κλικ για επιλογή αρχείου</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>JPG, PNG, MP4 — μέχρι 50MB</div>
            </div>
            <div className="fgroup" style={{marginTop:14}}><label className="flabel">Επιλογή emoji (αντί εικόνας στο demo)</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
                {EMOJIS.map(e=><button key={e} onClick={()=>setSelEmoji(e)} style={{width:36,height:36,borderRadius:8,border:`2px solid ${selEmoji===e?"var(--green)":"var(--beige3)"}`,background:selEmoji===e?"var(--green3)":"var(--white)",fontSize:18,cursor:"pointer"}}>{e}</button>)}
              </div>
            </div>
            <div className="f2">
              <div className="fgroup"><label className="flabel">Τμήμα</label><select className="finput" value={tmima} onChange={e=>setTmima(e.target.value)}>{TMIMATA.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <div className="fgroup"><label className="flabel">Λεζάντα</label><input className="finput" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="π.χ. Ζωγραφική με νερομπογιές"/></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={addItem}>Αποθήκευση</button>
              <button className="btn btn-ghost" onClick={()=>setShowUp(false)}>Ακύρωση</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ΗΜΕΡΟΛΟΓΙΟ ──────────────────────────────────────────────────────────────
function Calendar({user}) {
  const [view,setView] = useState("month");
  const [current,setCurrent] = useState(new Date(2026,4,1)); // May 2026
  const [showAdd,setShowAdd] = useState(false);
  const [events,setEvents] = useState(EVENTS);
  const [ne,setNe] = useState({title:"",date:"",type:"activity",emoji:"📅",desc:"",author:"",visibility:"all",tmima:"",sendPush:true});

  const daysInMonth=(y,m)=>new Date(y,m+1,0).getDate();
  const firstDay=(y,m)=>new Date(y,m,1).getDay();
  const y=current.getFullYear(), m=current.getMonth();
  const dim=daysInMonth(y,m);
  const fd=(firstDay(y,m)+6)%7; // Monday first

  const dayNames=["Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ","Κυρ"];
  const monthNames=["Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μάιος","Ιούνιος","Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος"];

  const cells = [];
  for(let i=0;i<fd;i++) cells.push(null);
  for(let d=1;d<=dim;d++) cells.push(d);

  const eventsOnDay=(d)=>{
    const dateStr=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return events.filter(e=>e.date===dateStr);
  };

  const addEvent=()=>{
    if(!ne.title||!ne.date) return;
    const ev={id:Date.now(),...ne,color:ne.type==="holiday"?"#C4A882":ne.type==="birthday"?"#C9B8A8":ne.type==="party"?"#C9785A":"#7CB9A0"};
    setEvents([...events,ev]);
    if(ne.sendPush) alert("🔔 Push notification εστάλη!\n\n\""+ne.title+"\"\n"+new Date(ne.date).toLocaleDateString("el-GR")+"\n\nΠαραλήπτες: "+(ne.visibility==="all"?"Όλοι":ne.visibility==="staff"?"Μόνο προσωπικό":ne.visibility==="parents"?"Μόνο γονείς":"Συγκεκριμένο τμήμα"));
    setShowAdd(false);setNe({title:"",date:"",type:"activity",emoji:"📅",desc:"",author:"",visibility:"all",tmima:"",sendPush:true});
  };

  const upcomingEvents=[...events].filter(e=>e.date>=TODAY).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);

  return (
    <div className="page-in">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6}}>
          {["month","agenda"].map(v=><button key={v} className={`btn ${view===v?"btn-primary":"btn-ghost"}`} onClick={()=>setView(v)}>{v==="month"?"Μήνας":"Agenda"}</button>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>setCurrent(new Date(y,m-1,1))}>←</button>
          <span style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:600,minWidth:160,textAlign:"center"}}>{monthNames[m]} {y}</span>
          <button className="btn btn-ghost btn-sm" onClick={()=>setCurrent(new Date(y,m+1,1))}>→</button>
        </div>
        {(user.role==="admin"||user.role==="secretary")&&<button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}>+ Εκδήλωση</button>}
      </div>

      {view==="month"&&(
        <div className="card" style={{padding:16}}>
          <div className="cal-grid" style={{marginBottom:8}}>
            {dayNames.map(d=><div key={d} className="cal-day-name">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((d,i)=>{
              if(!d) return <div key={i} style={{minHeight:72}}/>;
              const dateStr=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              const isToday=dateStr===TODAY;
              const evs=eventsOnDay(d);
              return (
                <div key={i} className={`cal-cell${isToday?" today":""}`}>
                  <div className="cal-num">{d}</div>
                  {evs.slice(0,2).map(e=>(
                    <div key={e.id} className="cal-event" style={{background:e.color}} title={e.desc}>
                      {e.emoji} {e.title}
                    </div>
                  ))}
                  {evs.length>2&&<div style={{fontSize:9,color:"var(--text3)"}}>+{evs.length-2}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view==="agenda"&&(
        <div className="card">
          <div className="card-title">📋 Επερχόμενες εκδηλώσεις</div>
          {upcomingEvents.map(e=>(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:"1px solid var(--beige3)"}}>
              <div style={{width:40,height:40,borderRadius:10,background:e.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{e.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>{e.title}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{e.desc}</div>
                {e.author&&<div style={{fontSize:11,color:"var(--text3)",marginTop:3,fontStyle:"italic"}}>✏️ {e.author}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontWeight:600,fontSize:13}}>{new Date(e.date).toLocaleDateString("el-GR",{day:"numeric",month:"short"})}</div>
                {e.tmima&&<div style={{fontSize:11,color:"var(--text3)"}}>{TMIMATA.find(t=>t.id===e.tmima)?.name}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {showAdd&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal">
            <div className="modal-title">Νέα εκδήλωση<button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button></div>
            <div className="f2">
              <div className="fgroup"><label className="flabel">Τίτλος *</label><input className="finput" value={ne.title} onChange={e=>setNe({...ne,title:e.target.value})}/></div>
              <div className="fgroup"><label className="flabel">Ημερομηνία *</label><input className="finput" type="date" value={ne.date} onChange={e=>setNe({...ne,date:e.target.value})}/></div>
            </div>
            <div className="f2">
              <div className="fgroup"><label className="flabel">Τύπος</label>
                <select className="finput" value={ne.type} onChange={e=>setNe({...ne,type:e.target.value})}>
                  <option value="activity">Δραστηριότητα</option>
                  <option value="party">Γιορτή</option>
                  <option value="holiday">Αργία</option>
                  <option value="birthday">Γενέθλια</option>
                  <option value="trip">Εκδρομή</option>
                  <option value="event">Weekend Event</option>
                </select>
              </div>
              <div className="fgroup"><label className="flabel">Emoji</label>
                <select className="finput" value={ne.emoji} onChange={e=>setNe({...ne,emoji:e.target.value})}>
                  {["📅","🎉","🎂","🚌","🏖️","🎭","🍳","🌿","🎪","👥"].map(em=><option key={em} value={em}>{em} {em}</option>)}
                </select>
              </div>
            </div>
            <div className="fgroup"><label className="flabel">Περιγραφή</label><textarea className="finput" rows={3} value={ne.desc} onChange={e=>setNe({...ne,desc:e.target.value})}/></div>
            <div className="fgroup">
              <label className="flabel">👤 Καταχωρήθηκε από</label>
              <input className="finput" value={ne.author} onChange={e=>setNe({...ne,author:e.target.value})} placeholder="π.χ. Διοίκηση — Πέτρος, Τζο, Γιώτα"/>
            </div>

            {/* VISIBILITY */}
            <div className="fgroup">
              <label className="flabel">👁️ Ποιος βλέπει αυτό το γεγονός; *</label>
              <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:4}}>
                {[
                  {val:"all",    label:"📢 Όλοι (γονείς + προσωπικό)", desc:"Εμφανίζεται σε όλους"},
                  {val:"staff",  label:"👩‍🏫 Μόνο προσωπικό",             desc:"Γονείς δεν το βλέπουν"},
                  {val:"parents",label:"👨‍👩‍👧 Μόνο γονείς",                desc:"Προσωπικό & γονείς"},
                  {val:"tmima",  label:"🏫 Συγκεκριμένο τμήμα",          desc:"Επιλέξτε παρακάτω"},
                ].map(v=>(
                  <div key={v.val} onClick={()=>setNe({...ne,visibility:v.val})}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${ne.visibility===v.val?"var(--green)":"var(--beige3)"}`,background:ne.visibility===v.val?"var(--green3)":"var(--white)",cursor:"pointer",transition:"all .15s"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${ne.visibility===v.val?"var(--green)":"var(--beige3)"}`,background:ne.visibility===v.val?"var(--green)":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {ne.visibility===v.val&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                    </div>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{v.label}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {ne.visibility==="tmima"&&(
              <div className="fgroup">
                <label className="flabel">Επιλογή τμήματος</label>
                <select className="finput" value={ne.tmima||""} onChange={e=>setNe({...ne,tmima:e.target.value})}>
                  <option value="">Επιλέξτε τμήμα...</option>
                  {TMIMATA.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            {/* PUSH NOTIFICATION */}
            <div style={{background:"var(--green3)",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button className={`toggle-btn ${ne.sendPush?"on":""}`} onClick={()=>setNe({...ne,sendPush:!ne.sendPush})}/>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>🔔 Αποστολή push notification</div>
                  <div style={{fontSize:11,color:"var(--text3)"}}>Ειδοποίηση στις συσκευές των παραληπτών αμέσως</div>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={addEvent}>Αποθήκευση</button>
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Ακύρωση</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ΑΚΑΔΗΜΙΑ ────────────────────────────────────────────────────────────────
function Academy() {
  const [sel,setSel] = useState(ACADEMY[0]);
  const [search,setSearch] = useState("");
  const cats = {philosophy:"Φιλοσοφία",montessori:"Montessori",reggio:"Reggio Emilia",outdoor:"Υπαίθρια",safety:"Ασφάλεια",infant:"Βρεφικά",checklist:"Checklists",environment:"Περιβάλλον"};
  const filt = ACADEMY.filter(a=>a.title.toLowerCase().includes(search.toLowerCase())||a.cat.includes(search.toLowerCase()));

  return (
    <div className="page-in">
      <div className="search-row" style={{marginBottom:20}}>
        <div className="search-box"><input className="sinput" placeholder="Αναζήτηση θέματος..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      </div>
      <div className="academy-grid">
        <div>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:14,fontWeight:600,color:"var(--green)",marginBottom:12}}>Θεματικές ενότητες</div>
          <div className="academy-list">
            {filt.map(a=>(
              <div key={a.id} className={`academy-item ${sel?.id===a.id?"active":""}`} onClick={()=>setSel(a)}>
                <span className="ai-icon">{a.icon}</span>
                <div>
                  <div className="ai-title">{a.title}</div>
                  <div className="ai-cat">{cats[a.cat]||a.cat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          {sel?(
            <div className="academy-content">
              <div className="ac-header">
                <div style={{fontSize:32,marginBottom:10}}>{sel.icon}</div>
                <div className="ac-title">{sel.title}</div>
                <span className="badge b-earth" style={{fontSize:11}}>{cats[sel.cat]||sel.cat}</span>
              </div>
              <div className="ac-body">{sel.content}</div>
            </div>
          ):(
            <div style={{textAlign:"center",padding:"60px 20px",color:"var(--text3)"}}>
              <div style={{fontSize:48,marginBottom:12}}>🎓</div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:18}}>Επιλέξτε θέμα</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ΕΠΙΚΟΙΝΩΝΙΑ ─────────────────────────────────────────────────────────────
function Epikoinonia({user, onNewParentMsg}) {
  const [tab,setTab]=useState(user.role==="teacher"?"parent":"inbox"), [sc,setSc]=useState(false);
  const [nm,setNm]=useState({to:"",subject:"",body:"",type:"general"});
  const [msgs,setMsgs]=useState(SEC_MSGS);
  const [ptMsgs,setPtMsgs]=useState(PT_MESSAGES.list);

  // Subscribe to live parent→teacher messages
  useEffect(()=>{
    const unsub = PT_MESSAGES.subscribe(()=>setPtMsgs([...PT_MESSAGES.list]));
    return unsub;
  },[]);

  const send=()=>{setMsgs([...msgs,{id:Date.now(),from:user.name,subject:nm.subject,body:nm.body,date:TODAY,type:nm.type,read:true}]);setSc(false);setNm({to:"",subject:"",body:"",type:"general"});};
  const nc={financial:"#FFFBEB",route:"#F0FDF4",thematic:"#EFF6FF",general:"#F9FAFB"};
  const ni={financial:"💰",route:"🚌",thematic:"📚",general:"📢"};

  // Filter parent messages: teachers see only their tmima, admin/secretary see all
  const myTmima = user.tmima_id || user.tmima;
  const visiblePtMsgs = ptMsgs.filter(m=>{
    if(user.role==="admin"||user.role==="secretary") return true;
    if(user.role==="teacher") return m.tmima===myTmima || m.to_teacher===user.name;
    return false;
  });

  const tmName = (id)=>TMIMATA.find(t=>t.id===id)?.name||id;

  return (
    <div className="page-in">
      <div style={{display:"flex",gap:8,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
        <button className={`btn ${tab==="parent"?"btn-primary":"btn-ghost"}`} onClick={()=>setTab("parent")}>
          👨‍👩‍👧 Μηνύματα Γονέων {visiblePtMsgs.filter(m=>!m.read).length>0&&<span className="badge b-red" style={{marginLeft:6,fontSize:9}}>{visiblePtMsgs.filter(m=>!m.read).length}</span>}
        </button>
        {(user.role==="admin"||user.role==="secretary")&&<>
          <button className={`btn ${tab==="inbox"?"btn-primary":"btn-ghost"}`} onClick={()=>setTab("inbox")}>📥 Ανακοινώσεις</button>
          <button className="btn btn-primary" style={{marginLeft:"auto"}} onClick={()=>setSc(true)}>✉️ Νέο μήνυμα</button>
        </>}
      </div>

      {/* ── ΜΗΝΥΜΑΤΑ ΓΟΝΕΩΝ ── */}
      {tab==="parent"&&(
        <div>
          {(user.role==="admin"||user.role==="secretary")&&(
            <div style={{background:"var(--blue2)",border:"1px solid var(--blue)",borderRadius:12,padding:"11px 15px",marginBottom:14,fontSize:12,color:"#0E5A75",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>👁️</span>
              <span>Ως Διοίκηση βλέπετε <strong>όλη</strong> την επικοινωνία γονέων με τις δασκάλες, για εποπτεία.</span>
            </div>
          )}
          <div className="card">
            {visiblePtMsgs.length===0?(
              <div style={{textAlign:"center",padding:"40px 16px",color:"var(--text3)"}}>
                <div style={{fontSize:36,marginBottom:10}}>📭</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Κανένα μήνυμα ακόμα</div>
                <div style={{fontSize:12}}>Τα μηνύματα των γονέων θα εμφανίζονται εδώ</div>
              </div>
            ):visiblePtMsgs.map(m=>(
              <div key={m.id} style={{padding:"14px 16px",borderRadius:12,border:`1.5px solid ${m.read?"var(--beige3)":"var(--green)"}`,marginBottom:9,background:m.read?"var(--white)":"var(--green3)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div className="av" style={{background:mkColor(m.from_name),width:38,height:38,fontSize:15,borderRadius:11}}>{m.from_name.charAt(0)}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{m.from_name}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>
                        Γονέας του/της <strong>{m.child_name}</strong>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:11,color:"var(--text3)"}}>{m.date}</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>{m.time}</div>
                  </div>
                </div>
                <div style={{fontSize:13,color:"var(--text)",lineHeight:1.6,marginBottom:8,paddingLeft:48}}>{m.text}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,paddingLeft:48,flexWrap:"wrap"}}>
                  <span className="badge b-earth" style={{fontSize:10}}>📚 {tmName(m.tmima)}</span>
                  {m.to_teacher&&<span className="badge b-gray" style={{fontSize:10}}>➡️ {m.to_teacher}</span>}
                  {!m.read&&<span className="badge b-red" style={{fontSize:10}}>Μη αναγνωσμένο</span>}
                  <button className="btn btn-ghost btn-xs" style={{marginLeft:"auto"}}
                    onClick={()=>{PT_MESSAGES.list=PT_MESSAGES.list.map(x=>x.id===m.id?{...x,read:true}:x);setPtMsgs([...PT_MESSAGES.list]);}}>
                    {m.read?"✓ Διαβάστηκε":"Σήμανση ως διαβασμένο"}
                  </button>
                  <button className="btn btn-primary btn-xs">↩️ Απάντηση</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ΑΝΑΚΟΙΝΩΣΕΙΣ (admin/secretary) ── */}
      {tab==="inbox"&&(user.role==="admin"||user.role==="secretary")&&(
      <div className="card">
        {msgs.map(m=>(
          <div key={m.id} style={{padding:"14px 16px",borderRadius:12,border:`1.5px solid ${nc[m.type]||"var(--beige3)"}`,marginBottom:9,background:nc[m.type]||"var(--white)",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>{ni[m.type]||"📢"}</span>
                <span style={{fontFamily:"Playfair Display,serif",fontWeight:600,fontSize:14}}>{m.subject}</span>
                {!m.read&&<span className="badge b-green" style={{fontSize:9}}>Νέο</span>}
              </div>
              <span style={{fontSize:11,color:"var(--text3)"}}>{m.date}</span>
            </div>
            <div style={{fontSize:13,color:"var(--text2)",marginBottom:4}}>{m.body}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>Από: {m.from}</div>
          </div>
        ))}
      </div>
      )}
      {sc&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSc(false)}>
          <div className="modal">
            <div className="modal-title">Νέο μήνυμα<button className="modal-close" onClick={()=>setSc(false)}>✕</button></div>
            <div className="fgroup"><label className="flabel">Προς</label>
              <select className="finput" value={nm.to} onChange={e=>setNm({...nm,to:e.target.value})}>
                <option value="">Επιλέξτε...</option>
                <option value="all">📢 Όλοι οι γονείς</option>
                {TMIMATA.map(t=><option key={t.id} value={t.id}>Γονείς {t.name}</option>)}
              </select>
            </div>
            <div className="fgroup"><label className="flabel">Κατηγορία</label>
              <select className="finput" value={nm.type} onChange={e=>setNm({...nm,type:e.target.value})}>
                <option value="general">📢 Γενική</option><option value="financial">💰 Οικονομικά</option><option value="route">🚌 Δρομολόγιο</option><option value="thematic">📚 Θεματική</option>
              </select>
            </div>
            <div className="fgroup"><label className="flabel">Θέμα</label><input className="finput" value={nm.subject} onChange={e=>setNm({...nm,subject:e.target.value})}/></div>
            <div className="fgroup"><label className="flabel">Μήνυμα</label><textarea className="finput" rows={5} value={nm.body} onChange={e=>setNm({...nm,body:e.target.value})} style={{resize:"vertical",width:"100%"}}/></div>
            <div style={{display:"flex",gap:10}}><button className="btn btn-primary" style={{flex:1}} onClick={send}>📤 Αποστολή</button><button className="btn btn-ghost" onClick={()=>setSc(false)}>Ακύρωση</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PORTAL ΓΟΝΕΑ ────────────────────────────────────────────────────────────
function ParentPortal({user, kids}) {
  const child = kids.find(c=>c.id===user.child_id)||kids[0];
  const [tab,setTab] = useState("deltion");
  const [msg,setMsg] = useState(""), [sent,setSent] = useState([]);
  if(!child) return <div className="card"><p>Δεν βρέθηκε παιδί.</p></div>;
  const rep=(child.daily_reports||[]).find(r=>r.date===TODAY);
  const t=TMIMATA.find(t=>t.id===child.tmima);
  const fe=(v)=>!v?"❓":v.includes("κανονικά")||v.includes("πολύ")?"😊":v.includes("λίγο")?"😐":"😞";
  const sendMsg=()=>{
    if(!msg.trim())return;
    const t2=TMIMATA.find(x=>x.id===child.tmima);
    const entry={
      from_role:"parent", from_name:user.name, child_id:child.id, child_name:child.name,
      to_teacher:t2?.teacher||"", tmima:child.tmima,
      text:msg, date:TODAY, time:new Date().toLocaleTimeString("el-GR",{hour:"2-digit",minute:"2-digit"}), read:false,
    };
    PT_MESSAGES.add(entry);     // goes to teacher + admin automatically
    playNotifSound();
    setSent([...sent,{text:msg,date:TODAY,time:entry.time}]);
    setMsg("");
  };

  return (
    <div className="page-in">
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div className="parent-hero">
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:56,height:56,borderRadius:16,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700}}>{child.name.charAt(0)}</div>
            <div>
              <div style={{fontSize:11,opacity:.7,marginBottom:3,letterSpacing:".05em",textTransform:"uppercase"}}>Το παιδί μου</div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:24,fontWeight:700}}>{child.name}</div>
              <div style={{fontSize:12,opacity:.75,marginTop:3}}>🏡 {t?.name} · {t?.teacher}</div>
            </div>
          </div>
        </div>

        <div className="parent-tabs" style={{flexWrap:"wrap"}}>
          {["deltion","anakoinoseis","gallery","paroxes","epikoinonia"].map(tb=>(
            <button key={tb} className={`parent-tab ${tab===tb?"active":""}`} onClick={()=>setTab(tb)}>
              {tb==="deltion"?"📋 Δελτίο":tb==="anakoinoseis"?"📢 Ανακοινώσεις":tb==="gallery"?"📸 Gallery":tb==="paroxes"?"⭐ Παροχές":"✉️ Επικοινωνία"}
            </button>
          ))}
        </div>

        {tab==="deltion"&&(rep?(
          <div className="card">
            <div style={{fontFamily:"Playfair Display,serif",fontWeight:600,fontSize:16,color:"var(--green)",marginBottom:16}}>📅 Δελτίο {new Date().toLocaleDateString("el-GR",{day:"numeric",month:"long"})}</div>
            <div className="g2" style={{marginBottom:12}}>
              {[["🌅 Πρωινό",rep.prwino],["☀️ Μεσημεριανό",rep.mesimeri],["🌇 Απογευματινό",rep.apogeyma],["😴 Ύπνος",rep.ypnos]].map(([l,v])=>(
                <div key={l} className="report-block">
                  <div className="report-key">{l}</div>
                  <div className="report-val"><span style={{fontSize:22}}>{fe(v)}</span>{v}</div>
                </div>
              ))}
            </div>
            <div className="report-block" style={{marginBottom:10}}>
              <div className="report-key">🎨 Δραστηριότητα</div>
              <div className="report-val"><span style={{fontSize:22}}>{rep.drastiriotita?"✅":"❌"}</span>{rep.drastiriotita?"Συμμετείχε κανονικά":"Δεν συμμετείχε"}</div>
            </div>
            <div className="report-block" style={{marginBottom:10}}>
              <div className="report-key">🌤️ Προαύλιο</div>
              <div className="report-val"><span style={{fontSize:22}}>{rep.proaulismos?"✅":"❌"}</span>{rep.proaulismos?"Βγήκε στο προαύλιο":"Δεν βγήκε στο προαύλιο"}</div>
            </div>
            <div className="report-block" style={{marginBottom:10}}>
              <div className="report-key">😊 Διάθεση</div>
              <div className="report-val">{rep.mood||"—"}</div>
            </div>
            {rep.notes&&<div className="report-block highlight"><div className="report-key">📌 Σημειώσεις δασκάλας</div><div style={{fontSize:14,fontWeight:500,color:"var(--green)"}}>{rep.notes}</div></div>}
            {(rep.media||[]).length>0&&(
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"var(--text3)",margin:"14px 0 8px",textTransform:"uppercase",letterSpacing:".05em"}}>📸 Φωτογραφίες</div>

                {/* ΝΟΜΙΚΗ ΣΗΜΕΙΩΣΗ */}
                <div style={{background:"#FFF8E7",border:"1.5px solid #F5B800",borderRadius:12,padding:"12px 14px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>⚖️</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:12,color:"#92400E",marginBottom:4}}>
                      ΙΔΙΩΤΙΚΗ ΠΡΟΒΟΛΗ ΜΟΝΟ — GDPR / Ν. 4624/2019
                    </div>
                    <div style={{fontSize:11,color:"#78350F",lineHeight:1.7}}>
                      Οι φωτογραφίες αυτές προορίζονται <strong>αποκλειστικά για ιδιωτική χρήση</strong> του δικαιούχου γονέα.
                      Απαγορεύεται ρητά κάθε μορφή αναπαραγωγής, κοινοποίησης, δημοσίευσης ή ανάρτησης σε μέσα κοινωνικής δικτύωσης
                      ή οποιοδήποτε άλλο μέσο χωρίς έγγραφη άδεια της Ονειροχώρας.
                      Η παραβίαση αποτελεί παράβαση της νομοθεσίας περί προστασίας προσωπικών δεδομένων.
                    </div>
                  </div>
                </div>

                {/* ΦΩΤΟΓΡΑΦΙΕΣ — protected */}
                <div className="media-grid"
                  onContextMenu={e=>e.preventDefault()}
                  style={{WebkitUserSelect:"none",userSelect:"none"}}>
                  {rep.media.map((m,i)=>(
                    <div key={i} className="media-thumb media-thumb-parent"
                      onContextMenu={e=>e.preventDefault()}
                      onDragStart={e=>e.preventDefault()}>
                      {m.type==="image"
                        ? <img src={m.url} alt="" draggable="false" onContextMenu={e=>e.preventDefault()}/>
                        : <div style={{fontSize:28}}>🎬</div>}
                      {/* Always-on transparent blocker layer */}
                      <div className="media-protect" onContextMenu={e=>e.preventDefault()}/>
                      {/* Bottom label always visible */}
                      <div className="no-dl">🔒 Μόνο ιδιωτική προβολή</div>
                      {/* Hover info */}
                      <div className="no-dl-hover">🚫 Απαγορεύεται η λήψη & κοινοποίηση</div>
                    </div>
                  ))}
                </div>

                {/* Footer note */}
                <div style={{fontSize:10,color:"var(--text3)",marginTop:8,textAlign:"center",fontStyle:"italic"}}>
                  Βάσει GDPR · Ν. 4624/2019 · Προστασία Προσωπικών Δεδομένων Ανηλίκων
                </div>
              </div>
            )}
          </div>
        ):(
          <div style={{textAlign:"center",padding:"44px 20px",background:"var(--white)",borderRadius:"var(--radius)",border:"1.5px dashed var(--beige3)"}}>
            <div style={{fontSize:44,marginBottom:12}}>⏳</div>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:17,fontWeight:600,marginBottom:6}}>Το δελτίο δεν έχει ετοιμαστεί ακόμα</div>
            <div style={{fontSize:13,color:"var(--text3)"}}>Η δασκάλα θα το συμπληρώσει στη διάρκεια της ημέρας</div>
          </div>
        ))}

        {tab==="anakoinoseis"&&(
          <div>
            {SEC_MSGS.map(m=>(
              <div key={m.id} style={{padding:"14px 16px",borderRadius:12,border:"1.5px solid var(--beige3)",marginBottom:9,background:"var(--white)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{fontSize:16}}>{m.type==="financial"?"💰":m.type==="route"?"🚌":"📚"}</span>
                  <span style={{fontFamily:"Playfair Display,serif",fontWeight:600,fontSize:14}}>{m.subject}</span>
                </div>
                <div style={{fontSize:13,color:"var(--text2)",marginBottom:4}}>{m.body}</div>
                <div style={{fontSize:11,color:"var(--text3)"}}>{m.date}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="gallery"&&(
          <div>
            {/* ΝΟΜΙΚΗ ΣΗΜΕΙΩΣΗ */}
            <div style={{background:"#FFF8E7",border:"1.5px solid #F5B800",borderRadius:12,padding:"13px 15px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:20,flexShrink:0}}>⚖️</span>
              <div>
                <div style={{fontWeight:700,fontSize:12,color:"#92400E",marginBottom:4}}>
                  ΙΔΙΩΤΙΚΗ ΠΡΟΒΟΛΗ ΜΟΝΟ — GDPR / Ν. 4624/2019
                </div>
                <div style={{fontSize:11,color:"#78350F",lineHeight:1.7}}>
                  Οι φωτογραφίες αυτές προορίζονται <strong>αποκλειστικά για ιδιωτική χρήση</strong> του δικαιούχου γονέα.
                  Απαγορεύεται ρητά κάθε μορφή αναπαραγωγής, κοινοποίησης, δημοσίευσης ή ανάρτησης σε μέσα κοινωνικής δικτύωσης
                  ή οποιοδήποτε άλλο μέσο, χωρίς έγγραφη άδεια της Ονειροχώρας.
                  Η παραβίαση αποτελεί παράβαση της νομοθεσίας περί προστασίας προσωπικών δεδομένων ανηλίκων.
                </div>
              </div>
            </div>

            <div className="gallery-grid"
              onContextMenu={e=>e.preventDefault()}
              style={{WebkitUserSelect:"none",userSelect:"none"}}>
              {GALLERY_ITEMS.filter(i=>i.child_id===child.id||i.shared).map(item=>{
                const t=TMIMATA.find(t=>t.id===item.tmima);
                return (
                  <div key={item.id} className="gallery-item" style={{background:t?.color+"33"}}
                    onContextMenu={e=>e.preventDefault()}
                    onDragStart={e=>e.preventDefault()}>
                    <div className="gallery-emoji">{item.emoji}</div>
                    <div className="gallery-overlay"><div className="gallery-caption">{item.caption}</div></div>
                    {/* Transparent protection layer */}
                    <div style={{position:"absolute",inset:0,zIndex:2}} onContextMenu={e=>e.preventDefault()}/>
                    <div style={{position:"absolute",top:8,left:8,fontSize:9,background:"rgba(0,0,0,.55)",color:"#fff",padding:"2px 7px",borderRadius:4,fontWeight:700,zIndex:3,letterSpacing:".02em"}}>🔒 Μόνο ιδ. προβολή</div>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:10,color:"var(--text3)",marginTop:10,textAlign:"center",fontStyle:"italic"}}>
              Βάσει GDPR · Ν. 4624/2019 · Προστασία Προσωπικών Δεδομένων Ανηλίκων
            </div>
          </div>
        )}

        {tab==="paroxes"&&(
          <div>
            {/* INTRO */}
            <div style={{background:"linear-gradient(135deg,var(--green),var(--green2))",borderRadius:16,padding:"20px 22px",marginBottom:20,color:"#fff"}}>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,marginBottom:6}}>Οι Παροχές μας</div>
              <div style={{fontSize:13,opacity:.85,lineHeight:1.6}}>Η Ονειροχώρα προσφέρει ένα πλούσιο πρόγραμμα δραστηριοτήτων και εξειδικευμένων παροχών που στηρίζουν την ολόπλευρη ανάπτυξη του παιδιού σας.</div>
            </div>

            {/* GRID ΚΑΡΤΕΣ */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

              {/* MESSY PLAY */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)"}}>
                <div style={{background:"linear-gradient(135deg,#c8e6c9,#a5d6a7)",padding:"18px 18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:6}}>🎨</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#2E7D32"}}>Messy Play</div>
                  <div style={{fontSize:11,color:"#388E3C",marginTop:3}}>Αισθητηριακή εξερεύνηση</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}>
                    Εκπαιδευτικό παιχνίδι που βοηθά τα παιδιά να αναπτύξουν σημαντικές δεξιότητες μέσα από τη διαδραστική και αισθητηριακή εξερεύνηση.
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Οφέλη</div>
                  {["Σωματική ανάπτυξη","Γλωσσική επικοινωνία","Συναισθηματική ευημερία","Δημιουργικότητα & ανεξαρτησία","Μνήμη & προσοχή"].map((b,i)=>(
                    <div key={i} style={{fontSize:12,color:"var(--text2)",display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                      <span style={{color:"var(--green)",fontWeight:700,flexShrink:0}}>✓</span>{b}
                    </div>
                  ))}
                </div>
              </div>

              {/* MINI TENNIS */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)"}}>
                <div style={{background:"linear-gradient(135deg,#FFE0B2,#FFCC80)",padding:"18px 18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:6}}>🎾</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#E65100"}}>Mini Tennis</div>
                  <div style={{fontSize:11,color:"#F57C00",marginTop:3}}>Γιαμούκογλου Νικολέτα · Προπονήτρια Τέννις</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}>
                    Το τέννις βοηθά στην προσωπικότητα του παιδιού καθώς μεγαλώνει, αναπτύσσοντας αυτοέλεγχο, αυτοσυγκέντρωση και αυτοεκτίμηση.
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Οφέλη</div>
                  {["Αντοχή οστών","Συντονισμός όρασης-χεριών","Ευκαμψία & ευκινησία","Ισορροπία","Αερόβια άσκηση"].map((b,i)=>(
                    <div key={i} style={{fontSize:12,color:"var(--text2)",display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                      <span style={{color:"var(--green)",fontWeight:700,flexShrink:0}}>✓</span>{b}
                    </div>
                  ))}
                </div>
              </div>

              {/* ΑΙΣΘΗΤΗΡΙΑΚΟ ΠΑΙΧΝΙΔΙ */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)"}}>
                <div style={{background:"linear-gradient(135deg,#F8BBD0,#F48FB1)",padding:"18px 18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:6}}>🌈</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#880E4F"}}>Αισθητηριακό Παιχνίδι</div>
                  <div style={{fontSize:11,color:"#AD1457",marginTop:3}}>Εξερεύνηση των 5 αισθήσεων</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}>
                    Αισθητηριακά ονομάζονται τα παιχνίδια που έχουν σχέση με τις πέντε αισθήσεις — όραση, αφή, ακοή, γεύση, όσφρηση.
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Συμβάλλει</div>
                  {["Γλωσσική ανάπτυξη","Ανάπτυξη λεπτής κινητικότητας","Ανάπτυξη εγκεφάλου","Επεξεργασία ερεθισμάτων"].map((b,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:"#F8BBD0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#880E4F",flexShrink:0}}>{i+1}</div>
                      <span style={{fontSize:12,color:"var(--text2)"}}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ΒΡΕΦΙΚΟ ΜΑΣΑΖ */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)"}}>
                <div style={{background:"linear-gradient(135deg,#FCE4EC,#F8BBD0)",padding:"18px 18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:6}}>👶</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#880E4F"}}>Βρεφικό Μασάζ</div>
                  <div style={{fontSize:11,color:"#AD1457",marginTop:3}}>Αλληλεπίδραση · Διέγερση · Χαλάρωση</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}>
                    Τα οφέλη του βρεφικού μασάζ αφορούν την αλληλεπίδραση, τη διέγερση, την ανακούφιση και τη χαλάρωση.
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Περιλαμβάνει</div>
                  {["Αύξηση χαλάρωσης","Βελτίωση ύπνου","Ανακούφιση από τον πόνο","Προώθηση εγκεφαλικής ανάπτυξης","Ανάπτυξη κινητικότητας"].map((b,i)=>(
                    <div key={i} style={{fontSize:12,color:"var(--text2)",display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                      <span style={{color:"#E91E8C",fontWeight:700,flexShrink:0}}>♡</span>{b}
                    </div>
                  ))}
                </div>
              </div>

              {/* ΔΙΑΤΡΟΦΙΚΟ ΕΡΓΑΣΤΗΡΙΟ */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)"}}>
                <div style={{background:"linear-gradient(135deg,#B3E5FC,#81D4FA)",padding:"18px 18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:6}}>🥗</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#01579B"}}>Διατροφικό Εργαστήριο</div>
                  <div style={{fontSize:11,color:"#0277BD",marginTop:3}}>Μπαϊρακτάρη Μαρκέλλα · Διαιτολόγος-Διατροφολόγος</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}>
                    «Τρώω, παίζω, μαθαίνω!» Μαθαίνουμε τα μυστικά της ισορροπημένης διατροφής και τις σωστές διατροφικές συνήθειες με διαδραστικό τρόπο, μέσα από το παιχνίδι!
                  </div>
                  <div style={{fontSize:12,color:"#01579B",fontStyle:"italic",borderLeft:"3px solid #81D4FA",paddingLeft:10,lineHeight:1.6}}>
                    «Όσο πιο νωρίς ένα παιδί αποκτήσει σωστές διατροφικές συνήθειες, τόσο πιο γερές βάσεις θέτει για μια υγιή ενήλικη ζωή.»
                  </div>
                </div>
              </div>

              {/* ΘΕΑΤΡΙΚΟ ΠΑΙΧΝΙΔΙ */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)"}}>
                <div style={{background:"linear-gradient(135deg,#D7CCC8,#BCAAA4)",padding:"18px 18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:6}}>🎭</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#3E2723"}}>Θεατρικό Παιχνίδι</div>
                  <div style={{fontSize:11,color:"#4E342E",marginTop:3}}>Λιάπη Πελαγία · Καθηγήτρια χορού & θεάτρου</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}>
                    «Είμαι ό,τι... ΦΑΝΤAΣΤΩ!!!» — 5 λόγοι που καθιστούν το θεατρικό παιχνίδι ιδανική δραστηριότητα για τα παιδιά.
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>5 Λόγοι</div>
                  {["Άμεση χαρά & εκτόνωση","Πραγματοποίηση ονείρων","Μοιρασιά ιδεών σε ομάδα","Σεβασμός & διεκδίκηση θέσης","Ενίσχυση αυτοέκφρασης"].map((b,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:"#D7CCC8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#3E2723",flexShrink:0}}>{i+1}</div>
                      <span style={{fontSize:12,color:"var(--text2)"}}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ΜΟΥΣΙΚΟΚΙΝΗΤΙΚΗ */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)"}}>
                <div style={{background:"linear-gradient(135deg,#FFF9C4,#FFF176)",padding:"18px 18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:6}}>🎵</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#F57F17"}}>Μουσικοκινητική Αγωγή</div>
                  <div style={{fontSize:11,color:"#FF8F00",marginTop:3}}>Λιάπη Πελαγία · Χορογράφος</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}>
                    Ο χορός επιτρέπει τη σωματική, πνευματική & κοινωνικογνωστική ωρίμανση. Τα παιδιά χαλαρώνουν, εκτονώνονται και μαθαίνουν να αυτοπειθαρχούνται.
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Αποτελέσματα</div>
                  {["Σωματική ωρίμανση","Πνευματική ανάπτυξη","Κοινωνικογνωστική ωρίμανση","Αυτοπειθαρχία","Συντονισμός κινήσεων & ήχων"].map((b,i)=>(
                    <div key={i} style={{fontSize:12,color:"var(--text2)",display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                      <span style={{color:"#F57F17",fontWeight:700,flexShrink:0}}>♪</span>{b}
                    </div>
                  ))}
                </div>
              </div>

              {/* ΜΠΑΛΕΤΟ */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)"}}>
                <div style={{background:"linear-gradient(135deg,#F8BBD0,#FCE4EC)",padding:"18px 18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:6}}>🩰</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#880E4F"}}>Μπαλέτο</div>
                  <div style={{fontSize:11,color:"#AD1457",marginTop:3}}>Λιάπη Πελαγία · Καθηγήτρια χορού</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:10}}>
                    Το μπαλέτο αναπτύσσει τη συγκέντρωση, την πειθαρχία και την αυτοπεποίθηση μέσα από την ομορφιά της κίνησης.
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Οφέλη</div>
                  {["Αύξηση συγκέντρωσης","Μυϊκή ενδυνάμωση","Βελτίωση στάσης σώματος","Τόνωση αυτοπεποίθησης","Ομαδικότητα & συνεργασία"].map((b,i)=>(
                    <div key={i} style={{fontSize:12,color:"var(--text2)",display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                      <span style={{color:"#E91E63",fontWeight:700,flexShrink:0}}>✦</span>{b}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ΕΙΔΙΚΟΙ — full width */}
            <div style={{marginTop:16,fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:600,color:"var(--green)",marginBottom:14}}>👩‍⚕️ Εξειδικευμένοι Επιστήμονες</div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* ΠΑΙΔΙΑΤΡΟΣ */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)",display:"flex"}}>
                <div style={{width:6,background:"#1565C0",flexShrink:0,borderRadius:"16px 0 0 16px"}}/>
                <div style={{padding:"18px 20px",flex:1}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                    <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#BBDEFB,#90CAF9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🩺</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Playfair Display,serif",fontSize:15,fontWeight:700,color:"#0D47A1",marginBottom:2}}>Παιδίατρος</div>
                      <div style={{fontSize:12,color:"#1565C0",fontWeight:600,marginBottom:10}}>Dr. Βικελούδα Αικατερίνη</div>
                      <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.75,background:"#EFF6FF",borderRadius:10,padding:"12px 14px"}}>
                        «Εξετάζω κάθε μήνα όλα τα παιδάκια & ενημερώνω τις καρτέλες υγείας τους. Μετά την επίσκεψή μου στην τσάντα του παιδιού θα υπάρχει το φύλλο επίσκεψης και τυχόν παρατηρήσεις αν προκύψουν.»
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ΨΥΧΟΛΟΓΟΣ */}
              <div style={{background:"var(--white)",borderRadius:16,overflow:"hidden",boxShadow:"var(--shadow)",border:"1px solid var(--beige3)",display:"flex"}}>
                <div style={{width:6,background:"#2E7D32",flexShrink:0,borderRadius:"16px 0 0 16px"}}/>
                <div style={{padding:"18px 20px",flex:1}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                    <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#C8E6C9,#A5D6A7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🧠</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Playfair Display,serif",fontSize:15,fontWeight:700,color:"#1B5E20",marginBottom:2}}>Ψυχολόγος - Ψυχοθεραπεύτρια</div>
                      <div style={{fontSize:12,color:"#2E7D32",fontWeight:600,marginBottom:10}}>Κοκκάρα Πολυτίμη Γεωργία</div>
                      <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.75,background:"#F1F8E9",borderRadius:10,padding:"12px 14px"}}>
                        «Επισκέπτομαι κάθε μήνα τη δομή, ενσωματώνομαι στο καθημερινό πρόγραμμα των παιδιών, παρατηρώ & συζητώ με τις παιδαγωγούς και ενημερώνω το φύλλο αξιολόγησης του κάθε παιδιού.»
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {tab==="epikoinonia"&&(
          <div>
            <div className="card" style={{marginBottom:12}}>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:600,fontSize:14,marginBottom:12}}>Τα μηνύματά μου</div>
              {sent.length===0?<div style={{textAlign:"center",color:"var(--text3)",fontSize:13,padding:"20px 0"}}>Δεν έχετε στείλει μηνύματα ακόμα</div>:
                sent.map((m,i)=><div key={i} style={{background:"var(--green3)",borderRadius:12,padding:"10px 13px",marginBottom:8}}><div style={{fontWeight:500,fontSize:13}}>{m.text}</div><div style={{fontSize:11,color:"var(--text3)",marginTop:3}}>{m.date} {m.time}</div></div>)
              }
            </div>
            <div style={{background:"var(--beige2)",borderRadius:12,padding:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>✍️ Νέο μήνυμα</div>
              <textarea style={{width:"100%",padding:11,border:"1.5px solid var(--beige3)",borderRadius:10,fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none",resize:"vertical",minHeight:75,background:"var(--white)"}} placeholder="Γράψτε μήνυμα προς τη δασκάλα ή γραμματεία..." value={msg} onChange={e=>setMsg(e.target.value)}/>
              <button className="btn btn-primary" style={{marginTop:10}} onClick={sendMsg}>📤 Αποστολή</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ΔΡΟΜΟΛΟΓΙΑ ──────────────────────────────────────────────────────────────
function Dromologia() {
  return (
    <div className="page-in">
      <div className="g3" style={{marginBottom:20}}>
        <StatCard icon="🚌" bg="#EBF0EC" value={ROUTES.length} label="Συνολικά δρομολόγια"/>
        <StatCard icon="👶" bg="#ECFDF5" value={ROUTES.reduce((s,r)=>s+r.kids,0)} label="Παιδιά σε σχολικό"/>
        <StatCard icon="⏳" bg="#FFFBEB" value={ROUTES.filter(r=>r.status==="delayed").length} label="Καθυστερήσεις"/>
      </div>
      <div className="card" style={{marginBottom:16}}>
        <div className="card-title">🚌 Ενεργά δρομολόγια</div>
        {ROUTES.map(r=>(
          <div key={r.id} className="route-item">
            <div className="route-ico" style={{background:r.status==="active"?"#ECFDF5":"#FFFBEB"}}>{r.status==="active"?"🚌":"⏳"}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14}}>{r.name}</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Οδηγός: {r.driver} · {r.plate} · {r.kids} παιδιά</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:18}}>{r.time}</div>
              <span className={`badge ${r.status==="active"?"b-green":"b-amber"}`} style={{fontSize:10}}>{r.status==="active"?"● Σε κίνηση":"⏳ Καθ/ση"}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={()=>window.open("https://www.google.com/maps")}>🗺️</button>
          </div>
        ))}
        <button className="btn btn-primary btn-sm" style={{marginTop:12}}>+ Νέο δρομολόγιο</button>
      </div>
      <div className="card">
        <div className="card-title">📢 Ειδοποίηση αλλαγής δρομολογίου</div>
        <textarea className="finput" rows={3} placeholder="π.χ. Αύριο το δρομολόγιο Β καθυστερεί 15 λεπτά..." style={{marginBottom:10}}/>
        <button className="btn btn-primary">🚨 Αποστολή σε όλους τους γονείς</button>
      </div>
    </div>
  );
}

// ─── ΟΙΚΟΝΟΜΙΚΑ ──────────────────────────────────────────────────────────────
const EXODA_CATEGORIES = [
  "ΑΠΔ","ΚΕΑΟ","ΦΜΥ","ΤΕΚΑ","ΕΝΦΙΑ","ΕΦΚΑ","ΕΦΟΡΙΑ","ΑΣΦΑΛΕΙΕΣ","ΑΣΦΑΛΕΙΑ ΣΧΟΛΙΚΟΥ",
  "ΛΟΓΙΣΤΗΣ","ΡΕΥΜΑ","ΝΕΡΟ","ΑΕΡΙΟ","ΤΡΟΦΙΜΑ","ΚΑΘΑΡΙΣΤΙΚΑ","ΕΝΟΙΚΙΟ",
  "AYVENS","ΚΑΥΣΙΜΑ","ΤΗΛΕΦΩΝΙΑ","ΚΟΜΒΟΣ","ΝΟΜΙΚΟΣ","ΔΙΑΦΟΡΑ"
];

const SAMPLE_EXODA = [];

function Oikonomika({user, kids}) {
  const [oikTab, setOikTab] = useState("didaktra");
  const [fs,setFs] = useState("all"), [ft,setFt] = useState("all");
  const [exoda, setExoda] = useState(SAMPLE_EXODA);
  const [selMonth, setSelMonth] = useState("2026-09");
  const [showAddExodo, setShowAddExodo] = useState(false);
  const [newEx, setNewEx] = useState({aitia:"ΑΠΔ", poso:"", date:"", notes:""});

  const filt = kids.filter(c=>(fs==="all"||c.didaktra===fs)&&(ft==="all"||c.tmima===ft));
  const paid = kids.filter(c=>c.didaktra==="paid").reduce((s,c)=>s+c.amount,0);
  const pend = kids.filter(c=>c.didaktra==="pending").reduce((s,c)=>s+c.amount,0);

  const monthExoda = exoda.filter(e=>e.month===selMonth);
  const totalExoda = monthExoda.reduce((s,e)=>s+Number(e.poso),0);

  const addExodo = () => {
    if(!newEx.poso||!newEx.date) return;
    setExoda([...exoda,{...newEx,id:Date.now(),month:selMonth,poso:Number(newEx.poso)}]);
    setShowAddExodo(false); setNewEx({aitia:"ΑΠΔ",poso:"",date:"",notes:""});
  };

  // Group expenses by category for summary
  const catSummary = EXODA_CATEGORIES.map(cat=>({
    cat, total: monthExoda.filter(e=>e.aitia===cat).reduce((s,e)=>s+Number(e.poso),0)
  })).filter(c=>c.total>0);

  const MONTHS = [
    {val:"2026-09",label:"Σεπτέμβριος 2025-26"},
    {val:"2026-10",label:"Οκτώβριος 2025-26"},
    {val:"2026-11",label:"Νοέμβριος 2025-26"},
    {val:"2026-12",label:"Δεκέμβριος 2025-26"},
    {val:"2027-01",label:"Ιανουάριος 2025-26"},
    {val:"2027-02",label:"Φεβρουάριος 2025-26"},
    {val:"2027-03",label:"Μάρτιος 2025-26"},
    {val:"2027-04",label:"Απρίλιος 2025-26"},
    {val:"2027-05",label:"Μάιος 2025-26"},
    {val:"2027-06",label:"Ιούνιος 2025-26"},
  ];

  return (
    <div className="page-in">
      {/* TABS */}
      <div className="tabs" style={{marginBottom:20}}>
        <button className={`tab ${oikTab==="didaktra"?"active":""}`} onClick={()=>setOikTab("didaktra")}>💰 Δίδακτρα</button>
        {user.role==="admin" && <button className={`tab ${oikTab==="exoda"?"active":""}`} onClick={()=>setOikTab("exoda")}>📊 Έξοδα</button>}
        {user.role==="admin" && <button className={`tab ${oikTab==="synolo"?"active":""}`} onClick={()=>setOikTab("synolo")}>📈 Σύνολα</button>}
      </div>

      {/* ── ΔIΔΑΚΤΡΑ ── */}
      {oikTab==="didaktra"&&(
        <>
          <div className="g3" style={{marginBottom:20}}>
            <StatCard icon="€" bg="#ECFDF5" value={`${paid}€`} label="Εισπραχθέντα μήνα" trend="↑" up/>
            <StatCard icon="⏳" bg="#FFFBEB" value={`${pend}€`} label="Εκκρεμείς" trend={`${kids.filter(c=>c.didaktra==="pending").length} παιδιά`} up={false}/>
            <StatCard icon="%" bg="#EBF0EC" value={`${Math.round(paid/(paid+pend)*100)}%`} label="Ποσοστό είσπραξης" trend="↑" up/>
          </div>
          <div className="search-row">
            <select className="select" value={fs} onChange={e=>setFs(e.target.value)}>
              <option value="all">Όλες</option><option value="paid">Πληρωμένα</option><option value="pending">Εκκρεμεί</option>
            </select>
            <select className="select" value={ft} onChange={e=>setFt(e.target.value)}>
              <option value="all">Όλα τα τμήματα</option>
              {TMIMATA.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="btn btn-ghost" style={{marginLeft:"auto"}}>📊 Εξαγωγή Excel</button>
          </div>
          <div className="card">
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:8,padding:"6px 12px",marginBottom:4}}>
              {["Παιδί / Γονέας","Τμήμα","Ποσό","Κατάσταση",""].map(h=>(
                <div key={h} style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>
              ))}
            </div>
            {filt.map((c,i)=>{
              const t=TMIMATA.find(t=>t.id===c.tmima);
              return (
                <div key={c.id} className="fin-row" style={{background:i%2===0?"var(--beige)":"var(--white)"}}>
                  <div><div style={{fontWeight:600,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:"var(--text3)"}}>{c.pat_name||c.goneas1}</div></div>
                  <div><span className="badge b-earth" style={{fontSize:10}}>{t?.name}</span></div>
                  <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:15}}>{c.amount}€</div>
                  <div><span className={`badge ${c.didaktra==="paid"?"b-green":"b-amber"}`}>{c.didaktra==="paid"?"✓ Πληρωμένο":"Εκκρεμεί"}</span></div>
                  <div style={{display:"flex",gap:5}}>
                    {c.didaktra==="pending"&&<button className="btn btn-ghost btn-xs">✓</button>}
                    <button className="btn btn-ghost btn-xs">🖨️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── ΕΞΟΔΑ (admin only) ── */}
      {oikTab==="exoda"&&user.role==="admin"&&(
        <>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
            <select className="select" value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
              {MONTHS.map(m=><option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            <div style={{marginLeft:"auto",display:"flex",gap:10}}>
              <button className="btn btn-ghost">📊 Εξαγωγή Excel</button>
              <button className="btn btn-primary" onClick={()=>setShowAddExodo(true)}>+ Νέο έξοδο</button>
            </div>
          </div>

          {/* Summary bar */}
          <div style={{background:"linear-gradient(135deg,var(--green),var(--green2))",borderRadius:16,padding:"18px 24px",marginBottom:20,display:"flex",alignItems:"center",gap:20,color:"#fff",flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:11,opacity:.7,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Σύνολο εξόδων {MONTHS.find(m=>m.val===selMonth)?.label}</div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:32,fontWeight:700}}>{totalExoda.toFixed(2)}€</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:16,flexWrap:"wrap"}}>
              {catSummary.slice(0,4).map(c=>(
                <div key={c.cat} style={{textAlign:"center"}}>
                  <div style={{fontSize:11,opacity:.7,marginBottom:2}}>{c.cat}</div>
                  <div style={{fontWeight:700,fontSize:15}}>{c.total.toFixed(2)}€</div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense table */}
          <div className="card">
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1.2fr 2fr 80px",gap:8,padding:"6px 12px",marginBottom:4}}>
              {["Αιτιολογία","Ποσό","Ημ/νία","Σημείωση",""].map(h=>(
                <div key={h} style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</div>
              ))}
            </div>
            {monthExoda.length===0&&(
              <div style={{textAlign:"center",padding:"32px",color:"var(--text3)"}}>
                <div style={{fontSize:32,marginBottom:8}}>📊</div>
                <div style={{fontSize:13}}>Δεν υπάρχουν έξοδα για αυτόν τον μήνα</div>
              </div>
            )}
            {monthExoda.map((e,i)=>(
              <div key={e.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1.2fr 2fr 80px",gap:8,alignItems:"center",padding:"10px 12px",borderBottom:"1px solid var(--beige3)",background:i%2===0?"var(--beige)":"var(--white)",borderRadius:6}}>
                <div style={{fontWeight:600,fontSize:13}}>{e.aitia}</div>
                <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:15,color:"var(--burg)"}}>{Number(e.poso).toFixed(2)}€</div>
                <div style={{fontSize:12,color:"var(--text2)"}}>{e.date?new Date(e.date).toLocaleDateString("el-GR"):"-"}</div>
                <div style={{fontSize:12,color:"var(--text3)",fontStyle:e.notes?"normal":"italic"}}>{e.notes||"-"}</div>
                <div style={{display:"flex",gap:4}}>
                  <button className="btn btn-ghost btn-xs" onClick={()=>setExoda(exoda.filter(x=>x.id!==e.id))}>🗑️</button>
                </div>
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1.2fr 2fr 80px",gap:8,padding:"12px",background:"var(--green3)",borderRadius:"0 0 14px 14px",marginTop:4}}>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:14,color:"var(--green)"}}>ΣΥΝΟΛΟ</div>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:900,fontSize:16,color:"var(--green)"}}>{totalExoda.toFixed(2)}€</div>
              <div/><div/><div/>
            </div>
          </div>

          {/* Category breakdown */}
          {catSummary.length>0&&(
            <div className="card" style={{marginTop:16}}>
              <div className="card-title">📊 Ανάλυση ανά κατηγορία</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                {catSummary.map(c=>(
                  <div key={c.cat} style={{padding:"12px 14px",background:"var(--beige)",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:600,fontSize:13}}>{c.cat}</span>
                    <span style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:15,color:"var(--burg)"}}>{c.total.toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD EXODO MODAL */}
          {showAddExodo&&(
            <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddExodo(false)}>
              <div className="modal">
                <div className="modal-title">Νέο έξοδο — {MONTHS.find(m=>m.val===selMonth)?.label}<button className="modal-close" onClick={()=>setShowAddExodo(false)}>✕</button></div>
                <div className="fgroup">
                  <label className="flabel">Κατηγορία / Αιτιολογία *</label>
                  <select className="finput" value={newEx.aitia} onChange={e=>setNewEx({...newEx,aitia:e.target.value})}>
                    {EXODA_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="f2">
                  <div className="fgroup">
                    <label className="flabel">Ποσό (€) *</label>
                    <input className="finput" type="number" step="0.01" min="0" value={newEx.poso} onChange={e=>setNewEx({...newEx,poso:e.target.value})} placeholder="0.00"/>
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Ημερομηνία πληρωμής *</label>
                    <input className="finput" type="date" value={newEx.date} onChange={e=>setNewEx({...newEx,date:e.target.value})}/>
                  </div>
                </div>
                <div className="fgroup">
                  <label className="flabel">Σημείωση</label>
                  <input className="finput" value={newEx.notes} onChange={e=>setNewEx({...newEx,notes:e.target.value})} placeholder="π.χ. Γιώτα, Αυγούστου, κλπ"/>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="btn btn-primary" style={{flex:1}} onClick={addExodo}>💾 Αποθήκευση</button>
                  <button className="btn btn-ghost" onClick={()=>setShowAddExodo(false)}>Ακύρωση</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ΣΥΝΟΛΑ (admin only) ── */}
      {oikTab==="synolo"&&user.role==="admin"&&(
        <div className="card">
          <div className="card-title">📈 Ετήσια σύνοψη 2025-26</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12,marginBottom:20}}>
            {MONTHS.map(m=>{
              const mEx=exoda.filter(e=>e.month===m.val).reduce((s,e)=>s+Number(e.poso),0);
              const mIn=kids.reduce((s,c)=>s+(c.didaktra==="paid"?c.amount:0),0);
              return mEx>0||mIn>0?(
                <div key={m.val} style={{padding:"14px 16px",background:"var(--beige)",borderRadius:12}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:8}}>{m.label}</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:"var(--green)"}}>Έσοδα</span>
                    <span style={{fontWeight:700,fontSize:13,color:"var(--green)"}}>{mIn}€</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:12,color:"var(--burg)"}}>Έξοδα</span>
                    <span style={{fontWeight:700,fontSize:13,color:"var(--burg)"}}>{mEx.toFixed(2)}€</span>
                  </div>
                  <div style={{borderTop:"1px solid var(--beige3)",paddingTop:6,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,fontWeight:700}}>Αποτέλεσμα</span>
                    <span style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:14,color:mIn-mEx>=0?"var(--green)":"var(--burg)"}}>{(mIn-mEx).toFixed(2)}€</span>
                  </div>
                </div>
              ):null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ΑΝΑΦΟΡΕΣ ────────────────────────────────────────────────────────────────
function Anafores({kids}) {
  const p=kids.filter(c=>c.present).length;
  const paid=kids.filter(c=>c.didaktra==="paid").length;
  const rev=kids.filter(c=>c.didaktra==="paid").reduce((s,c)=>s+c.amount,0);
  return (
    <div className="page-in">
      <div className="g3" style={{marginBottom:22}}>
        <div style={{background:"var(--white)",borderRadius:"var(--radius)",padding:22,boxShadow:"var(--shadow)",textAlign:"center",border:"1px solid var(--beige3)"}}>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:36,fontWeight:700,color:"var(--green)"}}>{Math.round(p/kids.length*100)}%</div>
          <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>Μ.Ο. παρουσιών</div>
        </div>
        <div style={{background:"var(--white)",borderRadius:"var(--radius)",padding:22,boxShadow:"var(--shadow)",textAlign:"center",border:"1px solid var(--beige3)"}}>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:36,fontWeight:700,color:"var(--green)"}}>{Math.round(paid/kids.length*100)}%</div>
          <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>Ποσοστό είσπραξης</div>
        </div>
        <div style={{background:"var(--white)",borderRadius:"var(--radius)",padding:22,boxShadow:"var(--shadow)",textAlign:"center",border:"1px solid var(--beige3)"}}>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:36,fontWeight:700,color:"var(--green)"}}>{rev}€</div>
          <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>Έσοδα Μαΐου</div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-title">👶 Παρουσίες ανά τμήμα</div>
          {TMIMATA.map(t=>{const tk=kids.filter(c=>c.tmima===t.id);const pr=tk.filter(c=>c.present).length;const pct=Math.round(pr/tk.length*100);return(<div key={t.id} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:600,fontSize:13}}>{t.name}</span><span style={{fontSize:12,color:"var(--text3)"}}>{pr}/{tk.length} ({pct}%)</span></div><div className="pbar" style={{height:7}}><div className="pbar-fill" style={{width:`${pct}%`,background:t.color}}/></div></div>);})}
        </div>
        <div className="card">
          <div className="card-title">💰 Δίδακτρα ανά τμήμα</div>
          {TMIMATA.map(t=>{const tk=kids.filter(c=>c.tmima===t.id);const pa=tk.filter(c=>c.didaktra==="paid").length;const pct=Math.round(pa/tk.length*100);return(<div key={t.id} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:600,fontSize:13}}>{t.name}</span><span style={{fontSize:12,color:"var(--text3)"}}>{pa}/{tk.length}</span></div><div className="pbar" style={{height:7}}><div className="pbar-fill" style={{width:`${pct}%`,background:pct>70?"#34D399":"#FCD34D"}}/></div></div>);})}
          <div style={{marginTop:16,padding:14,background:"var(--green3)",borderRadius:12,textAlign:"center"}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:24,fontWeight:700,color:"var(--green)"}}>{rev}€</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>Σύνολο εισπράξεων</div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}><button className="btn btn-primary">📊 Εξαγωγή PDF</button><button className="btn btn-ghost">📋 Excel</button></div>
    </div>
  );
}

// ─── ΠΡΟΓΡΑΜΜΑ ───────────────────────────────────────────────────────────────
function Programma() {
  const PROG={"Δευτέρα":["Πρωινό 08:00","Ελεύθερο παιχνίδι 09:00","Κύκλος 10:00","Μεσημεριανό 12:00","Ύπνος 13:00","Απόγευμα 15:00"],"Τρίτη":["Πρωινό 08:00","Μουσική 09:30","Τέχνη 10:30","Μεσημεριανό 12:00","Ύπνος 13:00","Εξωτερικό 15:00"],"Τετάρτη":["Πρωινό 08:00","Γυμναστική 09:00","Παιχνίδι 10:30","Μεσημεριανό 12:00","Ύπνος 13:00","Ανάγνωση 15:30"],"Πέμπτη":["Πρωινό 08:00","Θέατρο 09:30","Αγγλικά 10:30","Μεσημεριανό 12:00","Ύπνος 13:00","Παιχνίδι 15:00"],"Παρασκευή":["Πρωινό 08:00","Ελεύθερο 09:00","Μαγειρική 10:00","Μεσημεριανό 12:00","Ύπνος 13:00","Εκδηλώσεις 15:00"]};
  return (
    <div className="page-in">
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title">📅 Εβδομαδιαίο πρόγραμμα</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {Object.entries(PROG).map(([day,items])=>(
            <div key={day} style={{background:"var(--beige)",borderRadius:12,padding:13}}>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:600,fontSize:12,color:"var(--green)",textAlign:"center",marginBottom:10,paddingBottom:8,borderBottom:"1px solid var(--beige3)"}}>{day}</div>
              {items.map((item,i)=><div key={i} style={{fontSize:11,padding:"5px 9px",borderRadius:7,marginBottom:5,background:"var(--green3)",color:"var(--green)",fontWeight:500}}>{item}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser] = useState(null);
  const [page,setPage] = useState("dashboard");
  const [sbCollapsed, setSbCollapsed] = useState(false);

  // Auto-collapse sidebar on small screens
  useEffect(()=>{
    const check = () => { if(window.innerWidth<=820) setSbCollapsed(true); };
    check();
    window.addEventListener("resize", check);
    return ()=>window.removeEventListener("resize", check);
  }, []);

  // Set app favicon to Ονειροχώρα logo
  useEffect(()=>{
    const LOGO = "data:image/jpeg;base64,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kHuACbARjDHmUCoU2uAIOid6bqh/lng0wCn4EwvMsKhpFAOoKakibHEGkWqOGxiTAAeF0rkQiAcHcFwQai/eaKoRqqIuprjUpERgN1Yyyt7dYN1ItTx8o1zjYpYruZT9WFAEyagKSoKI61ot2NgmjXmkms/5sgZGajrBEWzFraLMqky1EJBeqOiHYMdiKQoVk2MWuGnjvERCAgRMCJRaFRo7dYN1ItTx8jOX2FpKjS9quqQFlmNFTtK6ZT3gKVoqCgW6GaHBgUD/AEH+/wCi45TlgZUkCsvSyS5Wn4U+vVExvqXR3+PWDdSLU8fH/fM3CpNMAAn5JRzikg0PGoOUwZzGmHm5UkA3+lFEFBpBrBoTxlPTCrk1CZivVN4zumn6+RMtHIin9yoNBuInx8OsG6kWp4+F7InQXlfyDXV4qkxQMSwqtKas0bWbhs0QOEWZzwqH+qQ6eGZtArmiVyfSNTRFdQWvmv6EzpBTq+EYtynHVHMgJCYIIja/frBupFqeO8Ra3dMXrE6lDAAsMyo7T0KuCl7FOgUoor1CwISCASA/2LiAaRcRJGB1jNrhgtGibLzpm/lmhziqDPOkXpzBZJ7gvD4d2sG6kWp47o81sqsCkwekU06B/aiZYo2FMW3u8yzFyjoVpzwoA/3HkBYqTaOZoHABnHDSXtim8YK1SwRT+AezLRI7rVBmxqxzPZrBupFqeOyhwVpe54LUClgEIcNSYrginRbCJvIQDEXpqNuttZQAYQA/3ggxDgzBTkf2IVeyRh/7qXBHBAaamFkKd7xDV4MnCPajiqx6awbqRelZ0q6rS/qaDiJZeU8guAyCcXjUc9i8vgiDtzNzk+khom8LD3X/AII2CJQQ4UeOikSz5gTiI1nZJizQyETSUmBT0Rt5MfBkLEwqkg9IRGyCCIwHAKKSovivCdAWgU4CZwRB2SZEHK43L3BNxHod/EM7gmIG1SbzT/wzURKCHUaPiRC24NUVfjgOAONSgLF2wCnB06kSDUjkCLuha2jIXxRh1cDgGQYOmwGsaTeZn/ihJCJQQCp+lZzmmNU3O20GbU1juhTB4GJROiAsRsDZ14/8c3/pP//aAAwDAQMCEAMQAAAQ88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888884wwwwwwww088888888888888888888888884+wIFlEH5Z0FVwLMH4w8888888888888888884wGcc+fQhxzjjhRxBx1ruJTEw888888888888844XPFRilO//AP8A/wD/AP8A/wD/APxQAcaBiZcNPPPPPPPPPPFo9ExQv/0gSTSzQTCTiWGf/wD/APBibPU8888888888IDAiwuKeMD7C6TkimZSWDeAB/8A/wAH1TzzzzzzzzzygMUILK4CdcMZVIoKJLM38LJ6s4kGlTzzzzzzzzzygNE8gIFEHEFIr9AACx/JF5s+ZPkGlTzzzzzzzzzygMAEGFL3cEQUlEPEEE0sPIObGUEGlTzzzzzzzzzygP8A9+CVCYAcs9sRgTTDx1PRAEA/BpU8888888888oBNQVVs8999998XDCGCHAizhcQOCpU8888888888pnq889w0998898XDCBjwJAAAAD1wrU8888888888oD8999ZU38Y098XDAQ+GBLAAAAAUiU8888888888oD8989+ZcJH998XDAATGyCIAAAA+DU8888888888oD898HQYE8Y998XDAAARLiHAAAA+DU8888888888oD899YXs98c998XDAAAAmClIAAA+DU8888888888oD8999M2oTx498XDAAAAAoy4AAA+DU8888888888oD8999otl8c998XDAAAAADKQLAA+DU8888888888oB899998999998XLCAAAAAALjAAW/U8888888888la8wwwwwwwwww4YihBBBBBBxhBB2hU8888888888GnBNNBBBBBNNJBqFC2GACyCCCCCdhU8888888888Bu8/wD/AKsZYb//AP8AalAx0JKLzNwwwwhnPPPPPPPPPPKAYP8A/wD2TLW//wD/AOpQN1Vc4ABwMP6ODzzzzzzzzzzyy0X/APKWKXq//wD/AOpSjJrEIWwcMN4R7zzzzzzzzzzzyyMn9BJZYI7/AP8A6lKHuzAig8wwiYXPPPPPPPPPPPPLIXFv/wCScX//AP8A6lBnoww7D3vhBEvPPPPPPPPPPPPPPGxP/wBr7sn/AP8A6lGDAAgUKwQsMPPPPPPPPPPPPPPPPB7yQv8A8E/7/wDqUHfqeJAIa6cM8888888888888888s2yC2/8AxTf/AOpQ7Io8woOihzzzzzzzzzzzzzzzzzzyyCFMn/8AEB/qUDD+SDIzIc888888888888888888888sR6h//e/qUDDDKHRwc8888888888888888888888888TdKm9qUDDGM5ac8888888888888888888888888sMivpJqRCZ+M888888888888888888888888888888s1KrIrg8M888888888888888888888888888888888s9dYM8888888888888888888840288888888888808w084604081k04w0408888/9oACAEDEwE/EP8A1UHonJGne7befpbhN6QJD9cEyj6f2doKcYiA4B0JP65Sbsmnik0VPWqkQxRPSpkRKhWm8FSEJRQPolCCiZUYxEZ20kTr4oIx8xrigbLoVv1mjniOhO+VgI70laMNMrlE5ygXg6uE+jyp/Si/fTLigR8OpFX4aCxF8nUdhrdBzHyxwRqjwUDGOF/aMYEiyvO1Cd8sDXlQytPtCZKc3Oind7J4Q+JFvCfCPOds6cDplHrSJTxdQUEC4Zi2qyTzOtXhE2tLK4zVCd4CbEfM+nrZEGqfI06DwUwvtVcD+Yo1boOAJWy6Ems0Ld6oCpzMIFUFF2oalOSCcs10hLyy5HfX0aK6j+IO+qdBThlCGkcdIOZ9DSaF05Jt+hYgdKf/AL4b6HveI1ZPhUppKeYKcZBWaHbaUBIJRR0MRVZBskmzYkLVO5jPqZRTJ0Ag0PI6oUFNy5/V7ZlUEnTiiqvGfP4jVugRcJLoCJ2OhbT0eK1XRQfRCF6Lqjz/AIvSeuwCSivh0NqgzohCTRV9+gvW6HQj5/Eat1dlsAoViYKUJ3HFVx7RBWQO1CwwATF9dlIN5QPbKRioFliTB9DxGvIakzc8FsmjiHwBApE0nQSDww69bftOmHdwy1QPPRHKS/zRAepqKvjvYSRohdQhMhD6iRNJ0IKkzY1giN3lgfHbJCjSE26Jqy+cgwdpHHUAAUQ3PVImk6vfVrQNvKTPYD3Yb6W4InUgdNO5MyRNJ2Q8zlwnC2rawr/+x9fEEDQ46DyHkBR72mkTSdgGiiklgekCijQfr4gidE8Ox7zJE0naX2iEwesFMfa8yH9gMQR5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";
    try {
      let link = document.querySelector("link[rel~='icon']");
      if(!link){ link = document.createElement("link"); link.rel="icon"; document.head.appendChild(link); }
      link.href = LOGO;
      let apple = document.querySelector("link[rel='apple-touch-icon']");
      if(!apple){ apple = document.createElement("link"); apple.rel="apple-touch-icon"; document.head.appendChild(apple); }
      apple.href = LOGO;
      document.title = "Ονειροχώρα — Διαχείριση";
    } catch(e){}
  }, []);
  const [kids,setKids] = useState(KIDS0);
  const [users,setUsers] = useState(USERS);
  const [pushNotifs, setPushNotifs] = useState([]);

  const addPush = (icon, bg, title, body) => {
    const n = {id:Date.now(), icon, bg, title, body, time:"Μόλις τώρα"};
    setPushNotifs(p=>[n,...p.slice(0,4)]);
    setTimeout(()=>setPushNotifs(p=>p.filter(x=>x.id!==n.id)), 8000);
  };

  const dismissPush = (id) => setPushNotifs(p=>p.filter(x=>x.id!==id));

  // Notify admin/teachers when a new parent→teacher message arrives
  useEffect(()=>{
    if(!user) return;
    if(!(user.role==="admin"||user.role==="secretary"||user.role==="teacher")) return;
    let initial = true;
    const unsub = PT_MESSAGES.subscribe(()=>{
      if(initial) return;
      const latest = PT_MESSAGES.list[0];
      if(!latest) return;
      const myTmima = user.tmima_id || user.tmima;
      const forMe = user.role==="admin"||user.role==="secretary"
        || (user.role==="teacher" && (latest.tmima===myTmima || latest.to_teacher===user.name));
      if(forMe){
        addPush("✉️","#E8F4E8",`Νέο μήνυμα από ${latest.from_name}`, latest.text.slice(0,60)+(latest.text.length>60?"...":""));
        playNotifSound();
      }
    });
    initial = false;
    return unsub;
  },[user]);

  const logout = () => { setUser(null); setPage("dashboard"); };

  if(!user) return (
    <>
      <style>{CSS}</style>
      <Login users={users} onLogin={u=>{ setUser(u); setPage(u.role==="parent"?"parent_portal":"dashboard"); }}/>
    </>
  );

  if(user.role==="parent") return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",flexDirection:"column",height:"100vh"}}>
        <div className="topbar">
          <div className="topbar-l"><h1>Ονειροχώρα</h1><p>Καλωσήρθατε, {user.name}</p></div>
          <div className="topbar-r">
            <span className="top-date">📅 {new Date().toLocaleDateString("el-GR")}</span>
            <button className="sb-logout" style={{width:"auto",padding:"7px 14px",background:"var(--beige2)",color:"var(--text2)",border:"1px solid var(--beige3)"}} onClick={logout}>Έξοδος</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:28}}><ParentPortal user={user} kids={kids}/></div>
      </div>
    </>
  );

  const NAV = [
    { key:"dashboard",    ico:"⌂",  label:"Αρχική",             roles:["admin","secretary","teacher"] },
    { key:"mitroo",       ico:"📋",  label:"Μητρώο",              roles:["admin","secretary","teacher"] },
    { key:"parousies",    ico:"✓",   label:"Παρουσίες",           roles:["admin","secretary","teacher"] },
    { key:"deltion",      ico:"📝",  label:"Ημερήσιο Δελτίο",    roles:["teacher","admin"] },
    { key:"gallery",      ico:"📸",  label:"Gallery",             roles:["admin","secretary","teacher"] },
    { key:"epikoinonia",  ico:"✉",   label:"Επικοινωνία",         roles:["admin","secretary","teacher"] },
    { key:"calendar",     ico:"📅",  label:"Ημερολόγιο",          roles:["admin","secretary","teacher"] },
    { key:"dromologia",   ico:"🚌",  label:"Δρομολόγια",          roles:["admin","secretary"] },
    { key:"oikonomika",   ico:"€",   label:"Οικονομικά",          roles:["admin","secretary"] },
    { key:"programma",    ico:"📋",  label:"Πρόγραμμα",           roles:["admin","secretary","teacher"] },
    { key:"anafores",     ico:"📊",  label:"Αναφορές",            roles:["admin","secretary"] },
    { key:"xristes",      ico:"👥",  label:"Χρήστες",              roles:["admin"] },
  ];

  const TITLES = {
    dashboard:"Αρχική", mitroo:"Μητρώο", parousies:"Παρουσίες",
    deltion:"Ημερήσιο Δελτίο", gallery:"Gallery Φωτογραφιών", epikoinonia:"Επικοινωνία",
    calendar:"Ημερολόγιο", dromologia:"Δρομολόγια",
    oikonomika:"Οικονομικά", programma:"Πρόγραμμα", anafores:"Αναφορές",
    xristes:"Διαχείριση Χρηστών",
  };

  const SUBS = {
    dashboard:"Καλημέρα — "+todayGR, mitroo:`${kids.length} εγγεγραμμένα παιδιά — αλφαβητική σειρά`,
    parousies:"Παρουσίες "+new Date().toLocaleDateString("el-GR"),
    deltion:"Ενημέρωση γονέων σήμερα", gallery:"Φωτογραφίες & βίντεο",
    epikoinonia:"Μηνύματα προς γονείς", calendar:"Εκδηλώσεις & ημερολόγιο",
    academy:"Εκπαιδευτικό υλικό", dromologia:"Διαχείριση δρομολογίων",
    oikonomika:"Δίδακτρα & πληρωμές", programma:"Εβδομαδιαίο πρόγραμμα",
    anafores:"Στατιστικά & εξαγωγές",
    xristes:"Λογαριασμοί προσωπικού & γονέων",
  };

  const visNav = NAV.filter(n=>n.roles.includes(user.role));

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* Mobile overlay */}
        {!sbCollapsed && <div className="mobile-overlay" onClick={()=>setSbCollapsed(true)}/>}
        {/* SIDEBAR */}
        <div className={`sidebar ${sbCollapsed?"collapsed":""}`}>
          <button className="sb-toggle" onClick={()=>setSbCollapsed(!sbCollapsed)} title={sbCollapsed?"Άνοιγμα μενού":"Σύμπτυξη μενού"}>
            {sbCollapsed?"›":"‹"}
          </button>
          <div className="sb-head">
            <div className="sb-brand">
              <div className="sb-icon" style={{padding:4}}><img src="data:image/jpeg;base64,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kHuACbARjDHmUCoU2uAIOid6bqh/lng0wCn4EwvMsKhpFAOoKakibHEGkWqOGxiTAAeF0rkQiAcHcFwQai/eaKoRqqIuprjUpERgN1Yyyt7dYN1ItTx8o1zjYpYruZT9WFAEyagKSoKI61ot2NgmjXmkms/5sgZGajrBEWzFraLMqky1EJBeqOiHYMdiKQoVk2MWuGnjvERCAgRMCJRaFRo7dYN1ItTx8jOX2FpKjS9quqQFlmNFTtK6ZT3gKVoqCgW6GaHBgUD/AEH+/wCi45TlgZUkCsvSyS5Wn4U+vVExvqXR3+PWDdSLU8fH/fM3CpNMAAn5JRzikg0PGoOUwZzGmHm5UkA3+lFEFBpBrBoTxlPTCrk1CZivVN4zumn6+RMtHIin9yoNBuInx8OsG6kWp4+F7InQXlfyDXV4qkxQMSwqtKas0bWbhs0QOEWZzwqH+qQ6eGZtArmiVyfSNTRFdQWvmv6EzpBTq+EYtynHVHMgJCYIIja/frBupFqeO8Ra3dMXrE6lDAAsMyo7T0KuCl7FOgUoor1CwISCASA/2LiAaRcRJGB1jNrhgtGibLzpm/lmhziqDPOkXpzBZJ7gvD4d2sG6kWp47o81sqsCkwekU06B/aiZYo2FMW3u8yzFyjoVpzwoA/3HkBYqTaOZoHABnHDSXtim8YK1SwRT+AezLRI7rVBmxqxzPZrBupFqeOyhwVpe54LUClgEIcNSYrginRbCJvIQDEXpqNuttZQAYQA/3ggxDgzBTkf2IVeyRh/7qXBHBAaamFkKd7xDV4MnCPajiqx6awbqRelZ0q6rS/qaDiJZeU8guAyCcXjUc9i8vgiDtzNzk+khom8LD3X/AII2CJQQ4UeOikSz5gTiI1nZJizQyETSUmBT0Rt5MfBkLEwqkg9IRGyCCIwHAKKSovivCdAWgU4CZwRB2SZEHK43L3BNxHod/EM7gmIG1SbzT/wzURKCHUaPiRC24NUVfjgOAONSgLF2wCnB06kSDUjkCLuha2jIXxRh1cDgGQYOmwGsaTeZn/ihJCJQQCp+lZzmmNU3O20GbU1juhTB4GJROiAsRsDZ14/8c3/pP//aAAwDAQMCEAMQAAAQ88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888884wwwwwwww088888888888888888888888884+wIFlEH5Z0FVwLMH4w8888888888888888884wGcc+fQhxzjjhRxBx1ruJTEw888888888888844XPFRilO//AP8A/wD/AP8A/wD/APxQAcaBiZcNPPPPPPPPPPFo9ExQv/0gSTSzQTCTiWGf/wD/APBibPU8888888888IDAiwuKeMD7C6TkimZSWDeAB/8A/wAH1TzzzzzzzzzygMUILK4CdcMZVIoKJLM38LJ6s4kGlTzzzzzzzzzygNE8gIFEHEFIr9AACx/JF5s+ZPkGlTzzzzzzzzzygMAEGFL3cEQUlEPEEE0sPIObGUEGlTzzzzzzzzzygP8A9+CVCYAcs9sRgTTDx1PRAEA/BpU8888888888oBNQVVs8999998XDCGCHAizhcQOCpU8888888888pnq889w0998898XDCBjwJAAAAD1wrU8888888888oD8999ZU38Y098XDAQ+GBLAAAAAUiU8888888888oD8989+ZcJH998XDAATGyCIAAAA+DU8888888888oD898HQYE8Y998XDAAARLiHAAAA+DU8888888888oD899YXs98c998XDAAAAmClIAAA+DU8888888888oD8999M2oTx498XDAAAAAoy4AAA+DU8888888888oD8999otl8c998XDAAAAADKQLAA+DU8888888888oB899998999998XLCAAAAAALjAAW/U8888888888la8wwwwwwwwww4YihBBBBBBxhBB2hU8888888888GnBNNBBBBBNNJBqFC2GACyCCCCCdhU8888888888Bu8/wD/AKsZYb//AP8AalAx0JKLzNwwwwhnPPPPPPPPPPKAYP8A/wD2TLW//wD/AOpQN1Vc4ABwMP6ODzzzzzzzzzzyy0X/APKWKXq//wD/AOpSjJrEIWwcMN4R7zzzzzzzzzzzyyMn9BJZYI7/AP8A6lKHuzAig8wwiYXPPPPPPPPPPPPLIXFv/wCScX//AP8A6lBnoww7D3vhBEvPPPPPPPPPPPPPPGxP/wBr7sn/AP8A6lGDAAgUKwQsMPPPPPPPPPPPPPPPPB7yQv8A8E/7/wDqUHfqeJAIa6cM8888888888888888s2yC2/8AxTf/AOpQ7Io8woOihzzzzzzzzzzzzzzzzzzyyCFMn/8AEB/qUDD+SDIzIc888888888888888888888sR6h//e/qUDDDKHRwc8888888888888888888888888TdKm9qUDDGM5ac8888888888888888888888888sMivpJqRCZ+M888888888888888888888888888888s1KrIrg8M888888888888888888888888888888888s9dYM8888888888888888888840288888888888808w084604081k04w0408888/9oACAEDEwE/EP8A1UHonJGne7befpbhN6QJD9cEyj6f2doKcYiA4B0JP65Sbsmnik0VPWqkQxRPSpkRKhWm8FSEJRQPolCCiZUYxEZ20kTr4oIx8xrigbLoVv1mjniOhO+VgI70laMNMrlE5ygXg6uE+jyp/Si/fTLigR8OpFX4aCxF8nUdhrdBzHyxwRqjwUDGOF/aMYEiyvO1Cd8sDXlQytPtCZKc3Oind7J4Q+JFvCfCPOds6cDplHrSJTxdQUEC4Zi2qyTzOtXhE2tLK4zVCd4CbEfM+nrZEGqfI06DwUwvtVcD+Yo1boOAJWy6Ems0Ld6oCpzMIFUFF2oalOSCcs10hLyy5HfX0aK6j+IO+qdBThlCGkcdIOZ9DSaF05Jt+hYgdKf/AL4b6HveI1ZPhUppKeYKcZBWaHbaUBIJRR0MRVZBskmzYkLVO5jPqZRTJ0Ag0PI6oUFNy5/V7ZlUEnTiiqvGfP4jVugRcJLoCJ2OhbT0eK1XRQfRCF6Lqjz/AIvSeuwCSivh0NqgzohCTRV9+gvW6HQj5/Eat1dlsAoViYKUJ3HFVx7RBWQO1CwwATF9dlIN5QPbKRioFliTB9DxGvIakzc8FsmjiHwBApE0nQSDww69bftOmHdwy1QPPRHKS/zRAepqKvjvYSRohdQhMhD6iRNJ0IKkzY1giN3lgfHbJCjSE26Jqy+cgwdpHHUAAUQ3PVImk6vfVrQNvKTPYD3Yb6W4InUgdNO5MyRNJ2Q8zlwnC2rawr/+x9fEEDQ46DyHkBR72mkTSdgGiiklgekCijQfr4gidE8Ox7zJE0naX2iEwesFMfa8yH9gMQR5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" alt="Ονειροχώρα" style={{width:"100%",height:"100%",objectFit:"contain"}}/></div>
              <div><h2>Ονειροχώρα</h2><span>Βρεφονηπιακός Σταθμός</span></div>
            </div>
          </div>
          <div className="sb-user">
            <div className="sb-av">{user.initials}</div>
            <div><div className="sb-uname">{user.name}</div>
              <div className="sb-urole">{user.role==="admin"?"Διοίκηση":user.role==="secretary"?"Γραμματεία":`Εκπαιδευτικός${user.tmima?" · "+user.tmima:""}`}</div>
            </div>
          </div>
          <nav className="sb-nav">
            <div className="sb-section">Κύριο Μενού</div>
            {visNav.map(item=>(
              <div key={item.key} className={`nav-item ${page===item.key?"active":""}`} onClick={()=>{setPage(item.key); if(window.innerWidth<=820) setSbCollapsed(true);}} title={item.label}>
                <span className="nav-ico">{item.ico}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge?<span className="nav-badge">{item.badge}</span>:null}
              </div>
            ))}
            {user.role==="admin"&&(<>
              <div className="sb-section" style={{marginTop:8}}>Σύστημα</div>
              <div className="nav-item" title="Ρυθμίσεις"><span className="nav-ico">⚙</span><span className="nav-label">Ρυθμίσεις</span></div>
            </>)}
          </nav>
          <div className="sb-foot"><button className="sb-logout" onClick={logout} title="Αποσύνδεση"><span className="nav-ico" style={{display:"inline"}}>🚪</span> <span>Αποσύνδεση</span></button></div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-l">
              <h1>{TITLES[page]}</h1>
              <p>{SUBS[page]}</p>
            </div>
            <div className="topbar-r">
              <GlobalSearch kids={kids} setPage={setPage}/>
              <span className="top-date">📅 {new Date().toLocaleDateString("el-GR")}</span>
              <button className="top-notif" title="Ειδοποιήσεις">🔔<span className="notif-dot"/></button>
            </div>
          </div>
          {/* PUSH NOTIFICATION CENTER */}
          <div className="notif-center">
            {pushNotifs.map(n=>(
              <div key={n.id} className="push-notif">
                <div className="push-icon" style={{background:n.bg}}>{n.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="push-title">{n.title}</div>
                  <div className="push-body">{n.body}</div>
                  <div className="push-time">{n.time}</div>
                </div>
                <button className="push-close" onClick={()=>dismissPush(n.id)}>✕</button>
              </div>
            ))}
          </div>
          <div className="content">
            {page==="dashboard"   && <Dashboard   user={user} kids={kids} setPage={setPage}/>}
            {page==="mitroo"      && <Paidia      user={user} kids={kids} setKids={setKids}/>}
            {page==="parousies"   && <Parousies   user={user} kids={kids} setKids={setKids}/>}
            {page==="deltion"     && <Deltion     user={user} kids={kids} setKids={setKids}/>}
            {page==="gallery"     && <Gallery     user={user}/>}
            {page==="epikoinonia" && <Epikoinonia user={user}/>}
            {page==="calendar"    && <Calendar    user={user}/>}
            {page==="dromologia"  && <Dromologia/>}
            {page==="oikonomika"  && <Oikonomika  user={user} kids={kids}/>}
            {page==="programma"   && <Programma/>}
            {page==="anafores"    && <Anafores    kids={kids}/>}
            {page==="xristes"     && <Xristes     users={users} setUsers={setUsers} currentUser={user}/>}
          </div>
        </div>
      </div>
    </>
  );
}
