'use strict';
/* ABC Dating – Vanilla JS, kein Build-Schritt.
 * Daten liegen lokal (localStorage) und optional in einem privaten GitHub-Repo (dates.json),
 * damit beide Handys denselben Stand sehen. Zusammenführung pro Buchstabe: neuester Zeitstempel gewinnt. */

const APP_VERSION = '1.0.0';
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DEFAULT_PEOPLE = ['Raphaela', 'Satoshi'];
const DATA_FILE = 'dates.json';
const LS_DATA = 'abcdating:data';
const LS_CONN = 'abcdating:conn';

const IDEAS = {
A:['Aquarium','Achterbahn im Freizeitpark','Antikmarkt','Abendessen auf dem Balkon','Aussichtsturm','Asiatisch kochen','Ausritt zu Pferd','Autokino'],
B:['Bowling','Brunch','Botanischer Garten','Bootsfahrt','Barhopping','Burger-Battle zu Hause','Bouldern','Baumwipfelpfad'],
C:['Cocktailkurs','Camping','Comedy-Show','Café-Hopping','Crêpes backen','Canyoning','Cabrio-Tour','Chorkonzert'],
D:['Dinner in the Dark','Drachen steigen lassen','Discoabend','Dampferfahrt','Doku-Abend mit Snacks','Dart im Pub','Drive-in','Dachterrasse'],
E:['Escape Room','Eislaufen','Erdbeeren pflücken','Eis essen','Elektro-Roller-Tour','Eventkino','Erlebnisbad','Eselwanderung'],
F:['Fondue-Abend','Flohmarkt','Fahrradtour','Freiluftkino','Fotoshooting zu zweit','Frühstück im Bett','Fußballspiel','Floßfahrt'],
G:['Go-Kart','Grillen am See','Galerie','Gin-Tasting','Gesellschaftsspiele-Abend','Glühweinwanderung','Golf schnuppern','Gondelfahrt'],
H:['Hamam','Hüttenwanderung','Heißluftballon','Hochseilgarten','Hafenrundfahrt','Hausgemachte Pasta','Hörspielabend','Hundeschlittenfahrt'],
I:['Improtheater','Indisch kochen','Italienischer Abend','Inline-Skaten','Insel-Ausflug','Indoor-Skydiving','Ikebana-Kurs','Irish Pub'],
J:['Jazzbar','Japanisch essen','Joggen bei Sonnenaufgang','Jahrmarkt','Jacuzzi-Abend','Jumping-Fitness','Jugendfotos anschauen','Jodeln lernen'],
K:['Kino','Klettern','Kanu fahren','Karaoke','Kochkurs','Kunstmuseum','Käseverkostung','Kutschfahrt'],
L:['Lasertag','Lagerfeuer','Lesung','Lichterfest','Lieblingsrestaurant','Langlauf','Lego bauen','Live-Konzert'],
M:['Minigolf','Museum','Massage zu zweit','Mittelaltermarkt','Musical','Mondscheinspaziergang','Marmelade einkochen','Mountainbiken'],
N:['Nachtwanderung','Nudeln selbst machen','Naturbad','Nachtmarkt','Nostalgie-Abend','Nordic Walking','Neues Restaurant','Nacht im Baumhaus'],
O:['Open-Air-Kino','Oper','Obsthof','Oldtimer-Ausfahrt','Orientalisch kochen','Origami','Oktoberfest','Ostsee-Tagesausflug'],
P:['Picknick','Pizza backen','Planetarium','Paddeln','Poetry Slam','Pub-Quiz','Pralinen-Workshop','Paintball'],
Q:['Quizabend im Pub','Quad fahren','Quellwanderung','Quiche backen','Quartiersspaziergang','Querfeldein-Radtour','Quarkbällchen backen','Quality Time ohne Handy'],
R:['Rooftop-Bar','Rafting','Rollschuh fahren','Ruderboot','Radtour zum Biergarten','Rätselrallye','Restaurant-Roulette','Romantisches Dinner'],
S:['Sternegucken','Sauna','Sushi-Kurs','Stand-up-Paddling','Schlittschuh','Spieleabend','Sonnenuntergang am Berg','Streetfood-Markt'],
T:['Tanzkurs','Therme','Tapas','Theater','Töpferkurs','Tagesausflug','Trampolinhalle','Tee-Zeremonie'],
U:['Überraschungstrip ins Blaue','Ukulele lernen','Unterwasserwelt im Zoo','Urlaubsplanung bei Wein','Uferspaziergang','Ungewohnte Küche probieren','Unplugged-Konzert','Übernachtung im Hotel'],
V:['Varieté','Virtual Reality','Vegan kochen','Vinyl-Abend','Vogelpark','Volksfest','Video-Rückblick eurer Fotos','Vietnamesisch essen'],
W:['Weinprobe','Wellness-Tag','Wasserski','Wanderung','Waffeln backen','Wildpark','Weihnachtsmarkt','Wakeboarden'],
X:['X-Mas-Markt','XXL-Pizza & Filmabend','X-beliebig: Würfel entscheidet','XXL-Frühstück','Xylophon-Abend mit Musik','X-Box-Turnier','X-Fotos: 10 Bilder Challenge','Xtrem: Klettersteig'],
Y:['Yoga zu zweit','Yakitori essen','Yacht- oder Segeltörn','Yin-Yoga & Tee','YouTube-Kochvideo nachkochen','Yes-Day','Yoga im Park','Yuzu-Cocktails mixen'],
Z:['Zoo','Zirkus','Zelten','Zugfahrt ins Blaue','Zumba','Zaubershow','Zeitkapsel basteln','Zitronenkuchen backen'],
};

const $ = (id) => document.getElementById(id);
const now = () => Date.now();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// Datenmodell
// ============================================================
// doc = { v:1, letters:{ A:{idea,date,status,note,rating,planner,u} }, meta:{letter,planner,nextPlanner,u}, people:{names:[a,b],u} }
// u = Zeitstempel der letzten Änderung (für die Zusammenführung zwischen den Geräten)

function emptyDoc() { return { v: 1, letters: {}, meta: { u: 0 }, people: { names: DEFAULT_PEOPLE.slice(), u: 0 } }; }

let doc = emptyDoc();
let dirty = false;
let sha = null;

function loadLocal() {
  try {
    const o = JSON.parse(localStorage.getItem(LS_DATA));
    if (o && o.doc) { doc = normalize(o.doc); dirty = !!o.dirty; sha = o.sha || null; }
  } catch { /* leer starten */ }
}
function saveLocal() {
  try { localStorage.setItem(LS_DATA, JSON.stringify({ doc, dirty, sha })); } catch { /* privat-Modus */ }
}

function normalize(d) {
  const out = emptyDoc();
  if (!d || typeof d !== 'object') return out;
  for (const l of ABC) if (d.letters && d.letters[l] && typeof d.letters[l] === 'object') out.letters[l] = { ...d.letters[l] };
  if (d.meta && typeof d.meta === 'object') out.meta = { u: 0, ...d.meta };
  if (d.people && Array.isArray(d.people.names) && d.people.names.length === 2) out.people = { u: 0, ...d.people };
  return out;
}

/** Pro Buchstabe, Meta und Namen gewinnt der neuere Stand. */
function merge(a, b) {
  a = normalize(a); b = normalize(b);
  const out = emptyDoc();
  const newer = (x, y) => ((y && (y.u || 0) > ((x && x.u) || 0)) ? y : x);
  for (const l of ABC) { const r = newer(a.letters[l], b.letters[l]); if (r) out.letters[l] = r; }
  out.meta = newer(a.meta, b.meta);
  out.people = newer(a.people, b.people);
  return out;
}

/** JSON mit sortierten Schlüsseln, um Stände zu vergleichen. */
function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  return JSON.stringify(v);
}

const people = () => doc.people.names;
const rec = (l) => doc.letters[l] || {};
const statusOf = (l) => rec(l).status || 'open';
const openLetters = () => ABC.filter((l) => statusOf(l) !== 'done');
const nextPlanner = () => (people().includes(doc.meta.nextPlanner) ? doc.meta.nextPlanner : people()[0]);
const other = (p) => people().find((x) => x !== p) || people()[0];
const currentDrawn = () => (doc.meta.letter && statusOf(doc.meta.letter) !== 'done' ? doc.meta.letter : null);

function setLetter(l, data) {
  doc.letters[l] = { ...(data || {}), u: now() };
  changed();
}
function setMeta(m) {
  doc.meta = { ...m, u: now() };
  changed();
}
function changed() {
  dirty = true;
  saveLocal();
  render();
  Sync.schedule();
}

// ============================================================
// Darstellung
// ============================================================

function fmtDate(d) { if (!d) return ''; const [y, m, t] = d.split('-'); return `${t}.${m}.${y}`; }

let spinning = false;

function renderDraw(nx) {
  if (spinning) return;
  const left = openLetters().length;
  if (nx) {
    const s = rec(nx);
    $('drawL').textContent = nx;
    $('drawIdea').textContent = s.idea ? s.idea + (s.date ? ' · ' + fmtDate(s.date) : '') : 'Date mit ' + nx + ' — noch keine Idee';
    $('whoBtn').textContent = (s.planner || doc.meta.planner || nextPlanner()) + ' plant';
    $('planBtn').disabled = false;
    $('drawBtn').textContent = 'Neu ziehen';
  } else {
    $('drawL').textContent = left ? '?' : '♥';
    $('drawIdea').textContent = left ? left + ' Buchstaben übrig' : 'Alle 26 erlebt!';
    $('whoBtn').textContent = nextPlanner() + ' ist dran';
    $('planBtn').disabled = true;
    $('drawBtn').textContent = 'Buchstabe ziehen';
  }
  $('drawBtn').disabled = !left;
}

function render() {
  const [a, b] = people();
  $('couple').textContent = `${a} & ${b} — 26 Dates, von A bis Z.`;
  const done = ABC.filter((l) => statusOf(l) === 'done');
  $('count').textContent = done.length;
  $('barfill').style.width = (done.length / 26) * 100 + '%';
  const nx = currentDrawn();
  renderDraw(nx);

  const g = $('grid');
  g.innerHTML = '';
  for (const l of ABC) {
    const st = statusOf(l);
    const btn = document.createElement('button');
    btn.className = 'tile ' + (st !== 'open' ? st : '') + (l === nx ? ' current' : '');
    btn.textContent = l;
    btn.setAttribute('aria-label', `${l}: ${st === 'done' ? 'erlebt' : st === 'planned' ? 'geplant' : 'offen'}`);
    btn.onclick = () => openSheet(l);
    g.appendChild(btn);
  }

  const ml = $('memList');
  ml.innerHTML = '';
  if (!done.length) ml.innerHTML = '<p class="empty">Nach eurem ersten Date steht hier eure Erinnerung.</p>';
  // neueste Erinnerung zuerst
  done.slice().sort((x, y) => (rec(y).date || '').localeCompare(rec(x).date || '')).forEach((l) => {
    const s = rec(l);
    const d = document.createElement('div'); d.className = 'mem'; d.onclick = () => openSheet(l);
    const L = document.createElement('span'); L.className = 'l'; L.textContent = l;
    const box = document.createElement('div');
    const t = document.createElement('strong'); t.textContent = s.idea || 'Date mit ' + l;
    const p = document.createElement('p');
    p.textContent = [s.planner ? 'geplant von ' + s.planner : '', fmtDate(s.date), s.rating ? '♥'.repeat(s.rating) : '', s.note].filter(Boolean).join('  ·  ');
    box.append(t, p); d.append(L, box); ml.appendChild(d);
  });
  renderSyncState();
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ============================================================
// Sheets
// ============================================================

let openSheetEl = null;
function showSheet(el) {
  openSheetEl = el;
  $('scrim').classList.add('open');
  el.classList.add('open');
}
function closeSheet() {
  $('scrim').classList.remove('open');
  document.querySelectorAll('.sheet.open').forEach((s) => s.classList.remove('open'));
  openSheetEl = null;
  current = null;
}
$('scrim').onclick = closeSheet;
document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = closeSheet));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openSheetEl) closeSheet(); });

// ---------- Date bearbeiten ----------

let current = null;
let form = {};

function openSheet(l) {
  current = l;
  form = { status: 'open', rating: 0, ...rec(l) };
  $('sheetLetter').textContent = l;
  $('sheetHint').textContent = 'Date mit ' + l;
  $('sheetPlanner').textContent = form.planner ? form.planner + ' plant dieses Date' : '';
  $('fIdea').value = form.idea || '';
  $('fDate').value = form.date || '';
  $('fNote').value = form.note || '';
  renderChips(IDEAS[l]); paintSeg(); paintHearts();
  showSheet($('sheet'));
}
function pickIdea(i) {
  $('fIdea').value = i;
  if (form.status === 'open') { form.status = 'planned'; paintSeg(); }
}
function renderChips(list) {
  const c = $('chips'); c.innerHTML = '';
  list.forEach((i) => {
    const b = document.createElement('button'); b.className = 'chip'; b.textContent = i;
    b.onclick = () => pickIdea(i);
    c.appendChild(b);
  });
}
function paintSeg() {
  [...$('seg').children].forEach((b) => b.classList.toggle('on', b.dataset.s === form.status));
  $('doneFields').style.display = form.status === 'done' ? '' : 'none';
}
function paintHearts() {
  const h = $('hearts'); h.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button'); b.textContent = '♥'; b.className = i <= form.rating ? 'on' : '';
    b.setAttribute('aria-label', i + ' von 5');
    b.onclick = () => { form.rating = form.rating === i ? 0 : i; paintHearts(); };
    h.appendChild(b);
  }
}
$('seg').onclick = (e) => { const s = e.target.dataset && e.target.dataset.s; if (s) { form.status = s; paintSeg(); } };
$('moreBtn').onclick = () => {
  if (!current) return;
  const list = IDEAS[current].filter((i) => i !== $('fIdea').value);
  pickIdea(list[Math.floor(Math.random() * list.length)]);
};
$('saveBtn').onclick = () => {
  const l = current;
  const data = {
    idea: $('fIdea').value.trim(), date: $('fDate').value, status: form.status,
    note: $('fNote').value.trim(), rating: form.rating || 0,
  };
  if (form.planner) data.planner = form.planner;
  if (data.status === 'open' && data.idea && data.date) data.status = 'planned';
  closeSheet();
  setLetter(l, data);
};
$('resetBtn').onclick = () => {
  const l = current;
  if (rec(l).status === 'done' && !confirm(`Erinnerung an „${rec(l).idea || 'Date mit ' + l}“ wirklich löschen?`)) return;
  closeSheet();
  setLetter(l, null);
};

// ---------- Ziehen & Wer plant ----------

$('planBtn').onclick = () => { const c = currentDrawn(); if (c) openSheet(c); };

$('whoBtn').onclick = () => {
  const cur = currentDrawn();
  if (cur) {
    const s = { status: 'open', ...rec(cur) };
    const nowP = s.planner || doc.meta.planner || nextPlanner();
    s.planner = other(nowP);
    doc.meta = { letter: cur, planner: s.planner, nextPlanner: other(s.planner), u: now() };
    setLetter(cur, s);
  } else {
    setMeta({ ...doc.meta, nextPlanner: other(nextPlanner()) });
  }
};

$('drawBtn').onclick = async () => {
  if (spinning) return;
  const cur = currentDrawn();
  // Bei „Neu ziehen“ bleibt dieselbe Person dran; ein noch leerer Buchstabe wird wieder freigegeben.
  const planner = cur ? (rec(cur).planner || doc.meta.planner || nextPlanner()) : nextPlanner();
  if (cur && !rec(cur).idea && statusOf(cur) === 'open') doc.letters[cur] = { u: now() };

  let pool = openLetters().filter((l) => l !== cur && statusOf(l) !== 'planned');
  if (!pool.length) pool = openLetters().filter((l) => l !== cur);
  if (!pool.length) pool = openLetters();
  if (!pool.length) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];

  spinning = true;
  $('drawBtn').disabled = true;
  $('drawL').classList.add('spin');
  $('drawIdea').textContent = 'Wird gezogen …';
  $('whoBtn').textContent = planner + ' plant';
  if (!reduceMotion) {
    for (let i = 0; i < 16; i++) {
      $('drawL').textContent = pool[Math.floor(Math.random() * pool.length)];
      await new Promise((r) => setTimeout(r, 50 + i * i * 1.6));
    }
  }
  $('drawL').classList.remove('spin');
  spinning = false;
  try { navigator.vibrate && navigator.vibrate(12); } catch { /* iOS */ }
  doc.meta = { letter: pick, planner, nextPlanner: other(planner), u: now() };
  setLetter(pick, { status: 'open', ...rec(pick), planner });
};

// ============================================================
// GitHub Contents API (wie in der Lebensapp)
// ============================================================

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(String(b64).replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function httpMessage(status, body) {
  if (status === 401) return 'Token ungültig oder abgelaufen.';
  if (status === 403) return body && /rate limit/i.test(body.message || '') ? 'GitHub-Limit erreicht, bitte später erneut.' : 'Keine Berechtigung. Hat der Token „Contents: Read and write“ für das Daten-Repo?';
  if (status === 404) return 'Repo nicht gefunden (oder der Token hat keinen Zugriff darauf).';
  return `GitHub-Fehler ${status}${body && body.message ? ': ' + body.message : ''}`;
}

function getConn() { try { const c = JSON.parse(localStorage.getItem(LS_CONN)); return c && c.owner && c.repo && c.token ? c : null; } catch { return null; } }
function setConn(c) { try { if (c) localStorage.setItem(LS_CONN, JSON.stringify(c)); else localStorage.removeItem(LS_CONN); } catch { /* */ } }

const GH = {
  req(method, path, body, c = getConn()) {
    return fetch(`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}${path}`, {
      method,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${c.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  async fail(res) {
    let body = null;
    try { body = await res.json(); } catch { /* */ }
    throw new HttpError(res.status, httpMessage(res.status, body));
  },
  async repo(c) {
    const res = await GH.req('GET', '', null, c);
    if (!res.ok) await GH.fail(res);
    return res.json();
  },
  async getFile() {
    const res = await GH.req('GET', `/contents/${DATA_FILE}`);
    if (res.status === 404) return null;
    if (!res.ok) await GH.fail(res);
    const j = await res.json();
    let data = null;
    try { data = JSON.parse(b64decode(j.content)); } catch { data = null; }
    return { data, sha: j.sha };
  },
  async putFile(data, prevSha, message) {
    const body = { message, content: b64encode(JSON.stringify(data, null, 2) + '\n') };
    if (prevSha) body.sha = prevSha;
    const res = await GH.req('PUT', `/contents/${DATA_FILE}`, body);
    if (!res.ok) await GH.fail(res);
    return (await res.json()).content.sha;
  },
};

// ============================================================
// Synchronisation
// ============================================================

const Sync = {
  timer: null, running: false, again: false, state: 'off', error: '', last: 0,

  schedule(delay = 800) {
    if (!getConn()) return;
    clearTimeout(Sync.timer);
    Sync.timer = setTimeout(() => Sync.run(), delay);
    Sync.set('pending');
  },

  set(state, error = '') { Sync.state = state; Sync.error = error; renderSyncState(); },

  async run() {
    clearTimeout(Sync.timer);
    if (!getConn()) { Sync.set('off'); return; }
    if (Sync.running) { Sync.again = true; return; }
    if (!navigator.onLine) { Sync.set(dirty ? 'pending' : 'ok', 'Offline – wird übertragen, sobald wieder Netz da ist.'); return; }
    Sync.running = true;
    if (dirty) Sync.set('pending');
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const remote = await GH.getFile();
        const merged = remote && remote.data ? merge(doc, remote.data) : normalize(doc);
        const remoteSame = remote && remote.data && stable(normalize(remote.data)) === stable(merged);
        if (stable(merged) !== stable(doc)) { doc = merged; if (!spinning) render(); }
        sha = remote ? remote.sha : null;
        if (remoteSame) { dirty = false; break; }
        try {
          sha = await GH.putFile(doc, sha, commitMessage());
          dirty = false;
          break;
        } catch (e) {
          if (e.status === 409 || e.status === 422) continue; // jemand war schneller → neu lesen und mergen
          throw e;
        }
      }
      saveLocal();
      Sync.last = now();
      Sync.set(dirty ? 'pending' : 'ok');
    } catch (e) {
      saveLocal();
      Sync.set('err', e instanceof HttpError ? e.message : 'Keine Verbindung zu GitHub.');
    } finally {
      Sync.running = false;
      if (Sync.again) { Sync.again = false; Sync.run(); }
    }
  },
};

function commitMessage() {
  const done = ABC.filter((l) => statusOf(l) === 'done').length;
  return `update: ${done}/26 erlebt`;
}

function renderSyncState() {
  const dot = $('syncDot');
  dot.className = 'dot' + (Sync.state === 'off' ? '' : ' ' + Sync.state);
  const c = getConn();
  let msg;
  if (!c) msg = 'Nur auf diesem Gerät gespeichert. Unter ⚙︎ verbindet ihr beide Handys.';
  else if (Sync.state === 'err') msg = 'Sync-Fehler: ' + Sync.error;
  else if (Sync.error) msg = Sync.error;
  else if (Sync.state === 'pending') msg = 'Wird synchronisiert …';
  else msg = 'Synchronisiert — ihr seht beide denselben Stand.';
  $('status').textContent = msg;
  $('connInfo').textContent = c ? `Verbunden mit ${c.owner}/${c.repo}. ${Sync.state === 'err' ? 'Fehler: ' + Sync.error : ''}` :
    'Beide Handys speichern in dasselbe private GitHub-Repo. Einmal einrichten (siehe README), dann den Verbindungscode auf dem zweiten Handy einfügen.';
  $('connForm').hidden = !!c;
  $('connActions').hidden = !c;
}

// Beim Zurückkehren in die App und alle 30 s (solange sichtbar) abgleichen.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') Sync.run(); });
window.addEventListener('online', () => Sync.run());
setInterval(() => { if (document.visibilityState === 'visible' && !openSheetEl) Sync.run(); }, 30000);

// ============================================================
// Einstellungen
// ============================================================

const CODE_PREFIX = 'abc1.';
function makeCode(c) { return CODE_PREFIX + b64encode(JSON.stringify({ o: c.owner, r: c.repo, t: c.token })); }
function parseCode(s) {
  s = String(s || '').trim();
  if (!s.startsWith(CODE_PREFIX)) return null;
  try { const j = JSON.parse(b64decode(s.slice(CODE_PREFIX.length))); return j.o && j.r && j.t ? { owner: j.o, repo: j.r, token: j.t } : null; } catch { return null; }
}

$('settingsBtn').onclick = () => {
  $('p1').value = people()[0];
  $('p2').value = people()[1];
  $('version').textContent = 'Version ' + APP_VERSION;
  renderSyncState();
  showSheet($('settings'));
};

$('saveNames').onclick = () => {
  const a = $('p1').value.trim(), b = $('p2').value.trim();
  if (!a || !b || a === b) { toast('Bitte zwei verschiedene Namen eingeben.'); return; }
  const [oa, ob] = people();
  const rename = (p) => (p === oa ? a : p === ob ? b : p);
  doc.people = { names: [a, b], u: now() };
  if (doc.meta.planner || doc.meta.nextPlanner) {
    doc.meta = { ...doc.meta, planner: rename(doc.meta.planner), nextPlanner: rename(doc.meta.nextPlanner), u: now() };
  }
  for (const l of ABC) if (doc.letters[l] && doc.letters[l].planner && rename(doc.letters[l].planner) !== doc.letters[l].planner) {
    doc.letters[l] = { ...doc.letters[l], planner: rename(doc.letters[l].planner), u: now() };
  }
  changed();
  toast('Namen gespeichert.');
};

$('connectBtn').onclick = async () => {
  const fromCode = parseCode($('code').value);
  const c = fromCode || { owner: $('cOwner').value.trim(), repo: $('cRepo').value.trim(), token: $('cToken').value.trim() };
  if (!c.owner || !c.repo || !c.token) {
    toast($('code').value.trim() ? 'Der Verbindungscode ist ungültig.' : 'Bitte Code einfügen oder alle Felder ausfüllen.');
    return;
  }
  const btn = $('connectBtn');
  btn.disabled = true; btn.textContent = 'Prüfe …';
  try {
    const repo = await GH.repo(c);
    if (!repo.private && !confirm('Achtung: Dieses Repo ist öffentlich – eure Dates wären für alle sichtbar. Trotzdem verbinden?')) return;
    setConn(c);
    $('code').value = ''; $('cToken').value = '';
    dirty = true; // lokalen Stand einmal mit dem Repo zusammenführen
    await Sync.run();
    toast(Sync.state === 'err' ? Sync.error : 'Verbunden!');
  } catch (e) {
    toast(e instanceof HttpError ? e.message : 'Keine Verbindung zu GitHub.');
  } finally {
    btn.disabled = false; btn.textContent = 'Verbinden';
    renderSyncState();
  }
};

$('syncNow').onclick = async () => { await Sync.run(); toast(Sync.state === 'err' ? Sync.error : 'Aktuell.'); };

$('copyCode').onclick = async () => {
  const c = getConn(); if (!c) return;
  const code = makeCode(c);
  try {
    await navigator.clipboard.writeText(code);
    toast('Code kopiert – jetzt aufs andere Handy schicken.');
  } catch {
    prompt('Code kopieren:', code);
  }
};

$('disconnect').onclick = () => {
  if (!confirm('Verbindung auf diesem Gerät trennen? Eure Daten bleiben im Repo und auf dem anderen Handy erhalten.')) return;
  setConn(null);
  Sync.set('off');
  toast('Getrennt.');
};

$('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `abc-dating-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

// ============================================================
// Start
// ============================================================

loadLocal();
Sync.state = getConn() ? (dirty ? 'pending' : 'ok') : 'off';
render();
Sync.run();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* kein Offline-Cache */ });
}
