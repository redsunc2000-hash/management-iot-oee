/* ==========================================================================
   OEE demo — UI (vanilla JS). Pages follow the Superapp IoT manual:
   View mode (11 pages), Operation mode (4), Admin mode (10).
   ========================================================================== */
'use strict';

/* ---------- icons ---------- */
const ICON = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  layout: '<rect x="9" y="2" width="6" height="5" rx="1.5"/><rect x="2" y="17" width="6" height="5" rx="1.5"/><rect x="16" y="17" width="6" height="5" rx="1.5"/><path d="M12 7v5M5 17v-3h14v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gauge: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 13l4-5"/><circle cx="12" cy="14" r="1.5"/>',
  quality: '<path d="M12 3l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z"/><path d="M9 12l2 2 4-4"/>',
  bench: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  job: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3"/>',
  loss: '<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  report: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
  msg: '<path d="M4 5h16v11H9l-5 4z"/>',
  log: '<path d="M4 4h16v16H4zM8 9h8M8 13h8M8 17h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  warn: '<path d="M12 3L2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
  print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
  dl: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
  ul: '<path d="M12 20V9M7 14l5-5 5 5M4 4h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 15A8 8 0 1 1 9 4a7 7 0 0 0 11 11z"/>',
  auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  reset: '<path d="M4 12a8 8 0 1 0 3-6.2L4 8"/><path d="M4 3v5h5"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  factory: '<path d="M3 21V10l6 4V10l6 4V6l6 4v11z"/>',
};
const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ''}</svg>`;

/* ---------- pages registry ---------- */
const PAGES = {
  overview: { mode: 'view', label: 'Overview', icon: 'grid' },
  plant_layout: { mode: 'view', label: 'Plant Layout', icon: 'layout' },
  availability: { mode: 'view', label: 'Availability', icon: 'clock' },
  performance: { mode: 'view', label: 'Performance', icon: 'gauge' },
  quality: { mode: 'view', label: 'Quality', icon: 'quality' },
  benchmark: { mode: 'view', label: 'Benchmark', icon: 'bench' },
  job_tracking: { mode: 'view', label: 'Job Tracking', icon: 'job' },
  loss: { mode: 'view', label: 'Loss', icon: 'loss' },
  alarm: { mode: 'view', label: 'Alarm', icon: 'bell' },
  machine_detail: { mode: 'view', label: 'Machine Detail', icon: 'cpu' },
  daily_report: { mode: 'view', label: 'Daily Report', icon: 'report' },
  operation_input: { mode: 'operation', label: 'Operation Input', icon: 'sliders' },
  availability_history: { mode: 'operation', label: 'Availability History', icon: 'clock' },
  performance_history: { mode: 'operation', label: 'Performance History', icon: 'gauge' },
  quality_history: { mode: 'operation', label: 'Quality History', icon: 'quality' },
  asset: { mode: 'admin', label: 'Asset', icon: 'box' },
  role: { mode: 'admin', label: 'Role', icon: 'shield' },
  user: { mode: 'admin', label: 'User', icon: 'user' },
  plan_production: { mode: 'admin', label: 'Plan Production', icon: 'cal' },
  reason: { mode: 'admin', label: 'Reason', icon: 'tag' },
  job: { mode: 'admin', label: 'Job', icon: 'job' },
  alarm_setup: { mode: 'admin', label: 'Alarm', icon: 'bell' },
  banner: { mode: 'admin', label: 'Banner', icon: 'image' },
  line_notify: { mode: 'admin', label: 'Line Notify', icon: 'msg' },
  access_log: { mode: 'admin', label: 'Access Log', icon: 'log' },
};
const MODE_LABEL = { view: 'View mode', operation: 'Operation mode', admin: 'Admin mode' };

/* ---------- state ---------- */
const now0 = Date.now();
const S = {
  user: null, picked: false, mode: 'view', page: 'overview', assetId: 'p1',
  preset: 'today', from: startOfDay(now0) - DAY, to: now0, onlyJob: false, refresh: 5,
  tables: {}, sel: {}, closed: new Set(), menuOpen: false, sideOpen: false,
  layoutFull: true, lossType: 'overall', lossBy: 'machine', lossTop: 5,
  opMachine: null, opQty: 1, opMode: 'pq', benchIds: null,
  planAsset: 'p1', planMonth: startOfDay(now0), clip: null, search: {},
  theme: (() => { try { return localStorage.getItem('oee-demo-theme') || 'system'; } catch (e) { return 'system'; } })(),
};
const app = document.getElementById('app');

/* ---------- permissions ---------- */
function myRole() { return DB.cfg.roles.find(r => r.id === S.user?.roleId); }
function menuLevel(key) {
  const r = myRole(); if (!r) return 'deny';
  if (r.superAdmin) return 'edit';
  const p = r.parentId ? DB.cfg.roles.find(x => x.id === r.parentId) : r;
  return p?.menu?.[key] || 'deny';
}
function assetLevel(aid) {
  const r = myRole(); if (!r) return 'deny';
  if (r.superAdmin) return 'edit';
  for (const a of DB.ancestors(aid)) if (r.assets?.[a.id]) return r.assets[a.id];
  return 'deny';
}
function assetVisible(a) { return assetLevel(a.id) !== 'deny' || DB.kids(a.id).some(assetVisible); }
const canEdit = key => menuLevel(key) === 'edit';
function pagesOf(mode) { return Object.keys(PAGES).filter(k => PAGES[k].mode === mode && menuLevel(k) !== 'deny'); }
function firstScope() {
  const walk = a => assetLevel(a.id) !== 'deny' ? a : DB.kids(a.id).map(walk).find(Boolean);
  return walk(DB.asset('p1'))?.id || 'p1';
}

/* ---------- range ---------- */
function range() {
  const now = Date.now(), sod = startOfDay(now);
  switch (S.preset) {
    case 'today': return [sod, now];
    case 'yesterday': return [sod - DAY, sod];
    case '7d': return [now - 7 * DAY, now];
    case '30d': return [now - 30 * DAY, now];
    default: return [Math.max(S.from, Sim.start), Math.max(S.from + 60e3, S.to)];
  }
}
const scope = () => DB.asset(S.assetId) || DB.asset('p1');

/* ---------- chart mounting ---------- */
let CHARTS = [];
function chart(builder, cls = '') { const id = 'ch' + CHARTS.length; CHARTS.push({ id, builder }); return `<div class="chart ${cls}" id="${id}"></div>`; }
function mountCharts() {
  CHARTS.forEach(c => { const el = document.getElementById(c.id); if (el) el.innerHTML = c.builder(Math.max(260, Math.round(el.clientWidth))); });
}
let resizeT; window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(mountCharts, 150); });

/* ---------- toasts ---------- */
let lastToast = 0;
function toast(msg, kind = '', force = true) {
  if (!force && Date.now() - lastToast < 5000) return;
  lastToast = Date.now();
  let box = document.querySelector('.toasts');
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = msg;
  box.appendChild(t);
  while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => t.remove(), 5200);
}

/* ---------- modal ---------- */
let MODAL = null;
function openModal({ title, body, foot, wide = false, onSave, saveLabel = 'Save', onOpen }) {
  closeModal();
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><h2>${esc(title)}</h2><button class="btn icon" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
    <form class="modal-body" id="modal-form" novalidate>${body}</form>
    <div class="modal-foot">${foot ?? `<button class="btn" data-act="modal-close" type="button">Cancel</button>${onSave ? `<button class="btn primary" data-act="modal-save" type="button">${esc(saveLabel)}</button>` : ''}`}</div></div>`;
  document.body.appendChild(ov);
  MODAL = { el: ov, onSave };
  ov.addEventListener('mousedown', e => { if (e.target === ov) closeModal(); });
  ov.querySelector('form').addEventListener('submit', e => { e.preventDefault(); MODAL?.onSave?.(); });
  onOpen?.(ov);
  setTimeout(() => ov.querySelector('input:not([disabled]):not([type=hidden]),select:not([disabled]),.btn.primary')?.focus(), 30);
  return ov;
}
function closeModal() { MODAL?.el.remove(); MODAL = null; }
const fv = id => document.getElementById(id)?.value?.trim() ?? '';
function setErr(id, msg) { const e = document.getElementById(id + '-err'); if (e) e.textContent = msg || ''; return !msg; }
function row(label, input, id, req) { return `<div class="form-row"><label for="${id || ''}">${esc(label)}${req ? ' <span style="color:var(--crit)">*</span>' : ''}</label><div>${input}</div>${id ? `<div class="err" id="${id}-err"></div>` : ''}</div>`; }
function confirmBox(title, text, onYes, yes = 'Delete') {
  openModal({ title, body: `<p style="margin:0;color:var(--muted)">${text}</p>`, foot: `<button class="btn" data-act="modal-close" type="button">Cancel</button><button class="btn primary" data-act="modal-save" type="button">${esc(yes)}</button>`, onSave: () => { closeModal(); onYes(); } });
}

/* ---------- CSV ---------- */
function exportCSV(name, headers, rows) {
  const q = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = '﻿' + [headers, ...rows].map(r => r.map(q).join(',')).join('\n');
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = name.replace(/\s+/g, '_') + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(`Exported <b>${esc(a.download)}</b> (${rows.length} rows)`, 'good');
  } catch (e) { toast('This viewer blocks downloads. Open index.html locally to export.', 'warn'); }
}
function parseCSV(text) {
  const rows = []; let cur = [''], q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cur[cur.length - 1] += '"'; i++; } else if (c === '"') q = false; else cur[cur.length - 1] += c; }
    else if (c === '"') q = true; else if (c === ',') cur.push(''); else if (c === '\n') { rows.push(cur); cur = ['']; } else if (c !== '\r') cur[cur.length - 1] += c;
  }
  if (cur.length > 1 || cur[0]) rows.push(cur);
  return rows.map(r => r.map(s => s.replace(/^﻿/, '').trim()));
}
function doPrint() { try { window.print(); } catch (e) { toast('Printing is blocked here. Open the page locally to print.', 'warn'); } }

/* ---------- generic table ---------- */
function table(id, cols, rows, { pageSize = 10, select = false, empty = 'No records in this period.', rowCls } = {}) {
  const st = S.tables[id] || (S.tables[id] = { page: 1 });
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  st.page = Math.min(st.page, pages);
  const slice = rows.slice((st.page - 1) * pageSize, st.page * pageSize);
  const sel = S.sel[id] || (S.sel[id] = new Set());
  const allOn = slice.length && slice.every(r => sel.has(r.id));
  const head = `${select ? `<th style="width:34px"><label class="check"><input type="checkbox" data-act="sel-all" data-arg="${id}" ${allOn ? 'checked' : ''} aria-label="Select all on this page"></label></th>` : ''}${cols.map(c => `<th class="${c.cls || ''}">${esc(c.h)}</th>`).join('')}`;
  const body = slice.length ? slice.map(r => `<tr class="${sel.has(r.id) ? 'sel' : ''} ${rowCls ? rowCls(r) : ''}">${select ? `<td><label class="check"><input type="checkbox" data-act="sel-one" data-arg="${id}" data-id="${esc(r.id)}" ${sel.has(r.id) ? 'checked' : ''} aria-label="Select row"></label></td>` : ''}${cols.map(c => `<td class="${c.cls || ''}">${c.f(r)}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${cols.length + (select ? 1 : 0)}" class="empty">${empty}</td></tr>`;
  window.__rowsById = window.__rowsById || {}; window.__rowsById[id] = slice.map(r => r.id);
  let pager = `<span>${rows.length ? `${(st.page - 1) * pageSize + 1}–${Math.min(rows.length, st.page * pageSize)} of ${fmtNum(rows.length)} items` : '0 items'}</span>`;
  if (pages > 1) {
    const nums = new Set([1, pages, st.page - 1, st.page, st.page + 1].filter(n => n >= 1 && n <= pages));
    let prev = 0;
    pager += `<button class="btn" data-act="page" data-arg="${id}" data-p="${st.page - 1}" ${st.page === 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>`;
    [...nums].sort((a, b) => a - b).forEach(n => { if (n - prev > 1) pager += '<span>…</span>'; pager += `<button class="btn ${n === st.page ? 'on' : ''}" data-act="page" data-arg="${id}" data-p="${n}">${n}</button>`; prev = n; });
    pager += `<button class="btn" data-act="page" data-arg="${id}" data-p="${st.page + 1}" ${st.page === pages ? 'disabled' : ''} aria-label="Next page">›</button>`;
  }
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div><div class="pager">${pager}</div>`;
}
const pill = (kind, text) => `<span class="pill ${kind}">${esc(text)}</span>`;
const statusPill = st => ({ run: pill('good', 'On'), warn: pill('warn', 'Warning'), crit: pill('crit', 'Critical'), idle: pill('idle', 'Off') }[st]);
const sevPill = s => pill(s === 'critical' ? 'crit' : s === 'bad' ? 'crit' : 'warn', s[0].toUpperCase() + s.slice(1));
const audit = r => [r.createdBy || '', fmtDT(r.createdAt), r.updatedBy || '', fmtDT(r.updatedAt)];
const auditCols = [{ h: 'Created By', f: r => esc(r.createdBy || '') }, { h: 'Created Date', f: r => `<span class="mono">${fmtDT(r.createdAt)}</span>` }, { h: 'Updated By', f: r => esc(r.updatedBy || '') }, { h: 'Updated Date', f: r => `<span class="mono">${fmtDT(r.updatedAt)}</span>` }];
function stamp(obj, isNew) { const t = Date.now(); if (isNew) { obj.createdBy = S.user.username; obj.createdAt = t; } obj.updatedBy = S.user.username; obj.updatedAt = t; return obj; }
const hrs = sec => fmtHMS(sec);

/* ==========================================================================
   LOGIN
   ========================================================================== */
function renderLogin(err) {
  let remembered = ''; try { remembered = localStorage.getItem('oee-demo-remember') || ''; } catch (e) { }
  const [f, t] = [startOfDay(Date.now()), Date.now()];
  const c = calc('p1', f, t, false);
  const b = DB.cfg.banners;
  app.innerHTML = `<main class="login"><div class="login-card raise">
    <section class="login-hero" style="background:radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, hsl(${b[0]?.hue || 214} 70% 55%) 16%, transparent), transparent 60%)">
      <div class="brand"><span class="brand-mark">${ic('factory')}</span><span>Management IoT<small>Production Monitoring</small></span></div>
      <div style="display:grid;gap:12px"><h1>Every machine, every minute, measured as OEE.</h1>
      <p>IIoT monitoring for Kankyo Solution: availability, performance and quality from the line to the plant, with alarms when a machine needs attention.</p></div>
      <div class="hero-gauges" aria-label="Plant OEE today">
        ${[['OEE', c.OEE], ['Avail.', c.A], ['Perf.', c.P], ['Quality', c.Q]].map(([l, v]) => `<div class="mini"><div><b style="color:var(${Charts.levelVar(v)})">${fmtPct(v)}</b><span>${l}</span></div></div>`).join('')}
      </div>
      <div class="banner-dots" aria-hidden="true">${b.map((x, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
    </section>
    <form class="login-form" id="login-form" novalidate>
      <div><h2>Please login to your account</h2><p style="margin:4px 0 0;color:var(--muted);font-size:13px">Use the account your administrator gave you.</p></div>
      <div class="field"><label for="lg-user">Username</label><input class="input" id="lg-user" autocomplete="username" value="${esc(remembered || 'admin')}"><div class="err" id="lg-user-err"></div></div>
      <div class="field"><label for="lg-pass">Password</label><input class="input" id="lg-pass" type="password" autocomplete="current-password" value="${remembered ? '' : 'admin'}"><div class="err" id="lg-pass-err">${err ? esc(err) : ''}</div></div>
      <label class="check"><input type="checkbox" id="lg-rem" ${remembered ? 'checked' : ''}> Remember me</label>
      <button class="btn primary" type="submit" style="padding:12px">Login</button>
      <p style="margin:0;font-size:12px;color:var(--faint)">Demo accounts: <span class="mono">admin/admin</span> · <span class="mono">manager/manager</span> · <span class="mono">operator/operator</span></p>
    </form></div></main>`;
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const u = fv('lg-user'), p = document.getElementById('lg-pass').value;
    let ok = setErr('lg-user', u ? '' : 'Please input your username!');
    ok = setErr('lg-pass', p ? '' : 'Please input your password!') && ok;
    if (!ok) return;
    const user = DB.cfg.users.find(x => x.username === u);
    if (!user || user.password !== p) return setErr('lg-pass', 'Username or password is incorrect.');
    if (!user.active) return setErr('lg-pass', 'This account is inactive. Ask an administrator to activate it.');
    try { document.getElementById('lg-rem').checked ? localStorage.setItem('oee-demo-remember', u) : localStorage.removeItem('oee-demo-remember'); } catch (e2) { }
    S.user = user; S.picked = false;
    Sim.accessLog.push({ username: u, type: 'login', at: Date.now() });
    render();
  });
  let bi = 0; clearInterval(window.__bannerT);
  window.__bannerT = setInterval(() => {
    const hero = document.querySelector('.login-hero'); if (!hero) return clearInterval(window.__bannerT);
    bi = (bi + 1) % b.length;
    hero.style.background = `radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, hsl(${b[bi].hue} 70% 55%) 16%, transparent), transparent 60%)`;
    hero.querySelectorAll('.banner-dots i').forEach((d, i) => d.classList.toggle('on', i === bi));
  }, 4000);
}
function renderPicker() {
  app.innerHTML = `<main class="login"><div class="raise" style="padding:36px 32px;max-width:560px;width:100%;display:grid;gap:22px;text-align:center">
    <div class="brand" style="justify-content:center"><span class="brand-mark">${ic('factory')}</span><span>Management IoT</span></div>
    <p style="margin:0;color:var(--muted)">Please select application</p>
    <div class="app-pick">
      <button class="app-tile" data-act="pick" data-arg="pe">${ic('bench')}Production Monitoring</button>
      <button class="app-tile muted" data-act="pick" data-arg="ai">${ic('loss')}Asset Insight</button>
      <button class="app-tile muted" data-act="pick" data-arg="sc">${ic('sliders')}System Config</button>
    </div></div></main>`;
}

/* ==========================================================================
   SHELL
   ========================================================================== */
function render() {
  CHARTS = [];
  applyTheme();
  if (!S.user) return renderLogin();
  if (!S.picked) return renderPicker();
  if (menuLevel(S.page) === 'deny') { const p = pagesOf(S.mode)[0] || pagesOf('view')[0] || pagesOf('operation')[0] || pagesOf('admin')[0]; S.page = p; S.mode = PAGES[p].mode; }
  const scrollTop = document.querySelector('.content')?.scrollTop || 0;
  app.innerHTML = `<div class="shell">
    <aside class="side ${S.sideOpen ? 'open' : ''}" aria-label="Navigation"><div class="side-inner raise">${sideHTML()}</div></aside>
    <div class="main">
      <div class="topbar">
        <nav class="tabs raise" aria-label="${MODE_LABEL[S.mode]}">
          <button class="burger" data-act="side" aria-label="Open menu">${ic('menu')}</button>
          ${S.mode === 'admin' ? `<button class="on" disabled>${ic('sliders')}Admin mode</button>` : pagesOf(S.mode).map(k => `<button class="${S.page === k ? 'on' : ''}" data-act="go" data-arg="${k}">${ic(PAGES[k].icon)}${PAGES[k].label}</button>`).join('')}
          <span style="flex:1"></span>
          <button data-act="theme" title="Theme: ${S.theme}" aria-label="Switch theme (now ${S.theme})">${ic(S.theme === 'dark' ? 'moon' : S.theme === 'light' ? 'sun' : 'auto')}</button>
        </nav>
        ${S.mode !== 'admin' ? `<div class="ticker" data-act="go" data-arg="alarm" role="button" tabindex="0" aria-label="Open Alarm page">${tickerHTML()}</div>` : ''}
      </div>
      <main class="content" id="content">${pageHTML()}</main>
    </div></div>`;
  const c = document.getElementById('content'); if (c) c.scrollTop = scrollTop;
  mountCharts();
}
function applyTheme() {
  const r = document.documentElement;
  if (S.theme !== 'system') r.setAttribute('data-theme', S.theme);
  else if (S.themeTouched) r.removeAttribute('data-theme'); // leave a host-provided theme alone until the user toggles
}
function refreshContent() {
  if (!S.user || !S.picked) return;
  if (MODAL) return;
  const a = document.activeElement;
  const typing = a && a.closest('#content') && (a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || (a.tagName === 'INPUT' && !/checkbox|radio|button/.test(a.type)));
  if (typing) return;
  CHARTS = [];
  const c = document.getElementById('content'); if (!c) return render();
  const top = c.scrollTop; c.innerHTML = pageHTML(); c.scrollTop = top;
  const tk = document.querySelector('.ticker'); if (tk) tk.innerHTML = tickerHTML();
  const tree = document.querySelector('.tree'); if (tree) { const st = tree.scrollTop; tree.innerHTML = treeHTML(); tree.scrollTop = st; }
  mountCharts();
}

function sideHTML() {
  const u = S.user;
  const initials = u.fullName.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const modes = ['view', 'operation', 'admin'].filter(m => pagesOf(m).length);
  const menu = S.menuOpen ? `<div class="menu raise" role="menu">
      ${modes.map(m => `<button role="menuitem" class="${S.mode === m ? 'on' : ''}" data-act="mode" data-arg="${m}">${ic(m === 'view' ? 'grid' : m === 'operation' ? 'sliders' : 'shield')}${MODE_LABEL[m]}</button>`).join('')}
      <hr><button role="menuitem" data-act="chpass">${ic('key')}Change Password</button>
      <button role="menuitem" data-act="reg-line">${ic('msg')}Register Line Notify</button>
      ${myRole()?.superAdmin ? `<button role="menuitem" data-act="reset-demo">${ic('reset')}Reset demo data</button>` : ''}
      <hr><button role="menuitem" data-act="logout">${ic('out')}Logout</button></div>` : '';
  const body = S.mode === 'admin'
    ? `<nav class="side-admin" aria-label="Admin menu">${pagesOf('admin').map(k => `<button class="${S.page === k ? 'on' : ''}" data-act="go" data-arg="${k}">${ic(PAGES[k].icon)}${PAGES[k].label}</button>`).join('')}</nav>`
    : `<label class="field" style="gap:0"><span class="sr" hidden>Search assets</span><div style="position:relative"><input class="input" id="tree-search" placeholder="Search assets" value="${esc(S.search.tree || '')}" style="padding-right:34px" aria-label="Search assets"><span style="position:absolute;right:10px;top:9px;width:16px;height:16px;color:var(--faint)">${ic('search')}</span></div></label>
       <div class="tree" role="tree">${treeHTML()}</div>`;
  return `<div class="brand">${ic('factory').replace('<svg', '<svg style="width:22px;height:22px;color:var(--accent)"')}<span>Management IoT<small>Production Monitoring</small></span></div>
    <div class="profile"><span class="avatar">${esc(initials)}</span>
      <button class="profile-btn" data-act="menu" aria-haspopup="menu" aria-expanded="${S.menuOpen}"><b>${esc(u.fullName)}</b><span>${esc(myRole()?.name || '')} ${ic('down').replace('<svg', '<svg style="width:12px;height:12px"')}</span><div class="mode-chip">${MODE_LABEL[S.mode]}</div></button>${menu}</div>${body}`;
}
function treeHTML() {
  const q = (S.search.tree || '').toLowerCase();
  const match = a => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || DB.kids(a.id).some(match);
  const node = (a, depth) => {
    if (!assetVisible(a) || (q && !match(a))) return '';
    const kids = DB.kids(a.id);
    const open = q || !S.closed.has(a.id);
    const lvl = assetLevel(a.id);
    let warn = '';
    if (a.isMachine && Sim.data.has(a.id)) { const st = Sim.status(a.id); if (st === 'warn' || st === 'crit') warn = `<span class="warn-ico" style="color:var(--${st})" title="${st === 'crit' ? 'Critical' : 'Warning'}: ${esc(DB.reason(Sim.current(a.id).reasonId)?.name || '')}">${ic('warn')}</span>`; }
    return `<div role="treeitem" aria-expanded="${kids.length ? open : ''}"><button class="tree-node ${S.assetId === a.id ? 'sel' : ''}" style="padding-left:${8 + depth * 13}px" data-act="${lvl === 'deny' ? 'noop' : 'scope'}" data-arg="${a.id}" ${lvl === 'deny' ? 'aria-disabled="true" title="No access"' : ''}>
      <span class="tw ${open ? 'open' : ''}" data-act="${kids.length ? 'twist' : 'noop'}" data-arg="${a.id}">${kids.length ? ic('chev') : ''}</span>
      ${warn}<span class="nm" title="${esc(a.name)} (${esc(a.code)})">${esc(a.name)}</span></button>
      ${kids.length && open ? kids.map(k => node(k, depth + 1)).join('') : ''}</div>`;
  };
  return `<button class="tree-node ${S.assetId === firstScope() && S.assetId === 'p1' ? '' : ''}" data-act="scope" data-arg="${firstScope()}" style="font-weight:600">${ic('box').replace('<svg', '<svg style="width:15px;height:15px"')}All Assets</button>` + node(DB.asset('p1'), 0);
}
function tickerHTML() {
  const list = Sim.alarms.filter(a => DB.asset(a.assetId) && assetLevel(a.assetId) !== 'deny').slice(-14).reverse();
  if (!list.length) return `<span class="ticker-label">${ic('bell').replace('<svg', '<svg style="width:14px;height:14px"')}Alarms</span><span style="color:var(--muted);font-size:12.5px">No alarms.</span>`;
  const item = a => `<span><time>${fmtDT(a.at)}</time> ${esc(a.name)} ${sevPill(a.severity)} ${esc(DB.asset(a.assetId)?.name)} · ${esc(a.desc)}</span>`;
  const items = list.map(item).join('');
  return `<span class="ticker-label">${ic('bell').replace('<svg', '<svg style="width:14px;height:14px"')}${Sim.alarms.filter(a => !a.ackBy).length} open</span><div class="ticker-track"><div class="ticker-run">${items}${items}</div></div>`;
}

/* ---------- page dispatcher ---------- */
function pageHTML() {
  const fn = { overview: pOverview, plant_layout: pLayout, availability: pAvail, performance: pPerf, quality: pQuality, benchmark: pBench, job_tracking: pJobTrack, loss: pLoss, alarm: pAlarm, machine_detail: pMachine, daily_report: pDaily, operation_input: pOpInput, availability_history: pAvailHist, performance_history: pPerfHist, quality_history: pQualHist, asset: pAsset, role: pRole, user: pUser, plan_production: pPlan, reason: pReason, job: pJob, alarm_setup: pAlarmSetup, banner: pBanner, line_notify: pLineNotify, access_log: pAccessLog }[S.page];
  try { return fn ? fn() : ''; } catch (e) { console.error(e); return `<div class="card">Something went wrong on this page: ${esc(e.message)}</div>`; }
}
function head(title, extra = '', sub = '') {
  return `<div class="page-head"><div><h1>${esc(title)} <span class="scope">· ${esc(scope().name)}</span></h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div><div class="toolbar">${extra}</div></div>`;
}
function filters({ print = true, extra = '' } = {}) {
  const P = [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['custom', 'Custom']];
  return `<div class="filters raise">
    <div class="seg" role="group" aria-label="Date range">${P.map(([k, l]) => `<button class="${S.preset === k ? 'on' : ''}" data-act="preset" data-arg="${k}">${l}</button>`).join('')}</div>
    ${S.preset === 'custom' ? `<input class="input" type="datetime-local" id="f-from" value="${toLocalInput(S.from)}" min="${toLocalInput(Sim.start)}" aria-label="From"><span style="color:var(--faint)">→</span><input class="input" type="datetime-local" id="f-to" value="${toLocalInput(S.to)}" aria-label="To">` : ''}
    <label class="check"><input type="checkbox" id="f-onlyjob" ${S.onlyJob ? 'checked' : ''}> Only ON Job</label>
    ${extra}<span class="grow"></span>
    <span class="live"><span class="dot good"></span>Live</span>
    <select class="input" id="f-refresh" aria-label="Refresh interval">${[[5, 'Refresh every 5 seconds'], [10, 'Refresh every 10 seconds'], [30, 'Refresh every 30 seconds'], [60, 'Refresh every 1 minute'], [300, 'Refresh every 5 minutes'], [0, 'Refresh off']].map(([v, l]) => `<option value="${v}" ${S.refresh === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    ${print ? `<button class="btn" data-act="print">${ic('print')}Print Screen</button>` : ''}
  </div>`;
}
const csvBtn = (act, arg = '') => `<button class="btn sm" data-act="${act}" data-arg="${arg}">${ic('dl')}CSV</button>`;
function gaugeCard(title, v, meta) { return `<div class="card gauge-card"><h3>${esc(title)}</h3>${Charts.gauge(v, title)}<div class="gauge-meta">${meta}</div></div>`; }
const SERIES = [{ key: 'OEE', label: 'OEE', color: '--s-oee' }, { key: 'A', label: 'Availability', color: '--s-a' }, { key: 'P', label: 'Performance', color: '--s-p' }, { key: 'Q', label: 'Quality', color: '--s-q' }];
let EXPORTS = {};

/* ==========================================================================
   VIEW MODE
   ========================================================================== */
function kpiGauges(c) {
  return `<div class="grid g4" style="margin-bottom:20px">
    ${gaugeCard('Overall OEE', c.OEE, `A × P × Q`)}
    ${gaugeCard('Availability', c.A, `Run <b>${hrs(c.run)}</b> of <b>${hrs(c.planned)}</b>`)}
    ${gaugeCard('Performance', c.P, `Actual <b>${fmtNum(c.total)}</b> / Target <b>${fmtNum(c.target)}</b>`)}
    ${gaugeCard('Quality', c.Q, `Good <b>${fmtNum(c.good)}</b> / Total <b>${fmtNum(c.total)}</b>`)}</div>`;
}
function pOverview() {
  const [f, t] = range(); const c = calc(S.assetId, f, t, S.onlyJob);
  const pts = history(S.assetId, f, t, S.onlyJob); const size = bucketSize(f, t);
  EXPORTS.oee = () => exportCSV(`OEE_History_${scope().name}`, ['Datetime', 'OEE %', 'Availability %', 'Performance %', 'Quality %'], pts.map(p => [fmtDT(p.t), ...['OEE', 'A', 'P', 'Q'].map(k => p[k] == null ? '' : (p[k] * 100).toFixed(2))]));
  return head('Overview Dashboard') + filters() + kpiGauges(c) +
    `<div class="card"><div class="card-head"><h3>OEE History</h3>${Charts.legend(SERIES)}${csvBtn('export', 'oee')}</div>${chart(W => Charts.area(pts, SERIES, { W, H: 260, size }))}</div>`;
}

function pLayout() {
  const [f, t] = range();
  const node = a => {
    if (!assetVisible(a)) return '';
    const c = calc(a.id, f, t, S.onlyJob);
    const st = a.isMachine ? Sim.status(a.id) : null;
    const hdColor = a.isMachine ? (st === 'run' ? (c.OEE != null && c.OEE < 0.6 ? '--warn' : '--good') : `--${st}`) : '--accent';
    const kids = DB.kids(a.id).filter(assetVisible);
    return `<div class="lay-row"><button class="lay-node ${S.layoutFull ? '' : 'min'}" data-act="scope" data-arg="${a.id}" title="${esc(DB.path(a.id))}">
        <div class="hd"><span class="dot" style="background:var(${hdColor})"></span><span class="nm">${esc(a.name)}</span></div>
        <div class="kv"><span>OEE <b style="color:var(${Charts.levelVar(c.OEE)})">${fmtPct(c.OEE)}</b></span><span>Avail. <b>${fmtPct(c.A)}</b></span><span>Perf. <b>${fmtPct(c.P)}</b></span><span>Quality <b>${fmtPct(c.Q)}</b></span></div>
        <div class="bar"><i style="width:${Math.min(100, (c.OEE || 0) * 100)}%;background:var(${Charts.levelVar(c.OEE)})"></i></div></button>
      ${kids.length ? `<div class="lay-children">${kids.map(node).join('')}</div>` : ''}</div>`;
  };
  return head('Plant Layout', `<div class="seg"><button class="${S.layoutFull ? 'on' : ''}" data-act="layout" data-arg="full">Full</button><button class="${S.layoutFull ? '' : 'on'}" data-act="layout" data-arg="min">Minimize</button></div>`, 'Click a box to focus the layout on that line.') + filters() +
    `<div class="card"><div class="card-head"><h3>${esc(DB.path(S.assetId))}</h3><div class="legend"><span><i style="background:var(--accent)"></i>Group</span><span><i style="background:var(--good)"></i>Running</span><span><i style="background:var(--warn)"></i>Warning / OEE &lt; 60%</span><span><i style="background:var(--crit)"></i>Critical</span></div></div><div class="layout-canvas">${node(scope())}</div></div>`;
}

function reasonBars(map, status) {
  return DB.reasons('availability').filter(r => r.status === status).map(r => ({ label: r.name, value: (map[r.id]?.sec || 0) / 60, color: status === 'critical' ? '--crit' : '--warn', tip: `${r.name}: ${fmtNum((map[r.id]?.sec || 0) / 60, 1)} min, ${map[r.id]?.count || 0} times` }));
}
function pAvail() {
  const [f, t] = range(); const c = calc(S.assetId, f, t, S.onlyJob);
  const pts = history(S.assetId, f, t, S.onlyJob); const size = bucketSize(f, t);
  const tl = timeline(S.assetId, f, t); const dr = downByReason(S.assetId, f, t);
  const warn = reasonBars(dr, 'warning'), crit = reasonBars(dr, 'critical');
  EXPORTS.ah = () => exportCSV('Availability_History', ['Datetime', 'Availability %', 'Run time (s)'], pts.map(p => [fmtDT(p.t), p.A == null ? '' : (p.A * 100).toFixed(2), Math.round(p.run)]));
  EXPORTS.tl = () => exportCSV('Availability_Timeline', ['Machine', 'State', 'Reason', 'Start', 'End', 'Duration (s)'], tl.flatMap(r => r.segs.map(s => [r.label, s.state, s.reason, fmtDT(s.s), fmtDT(s.e), Math.round((s.e - s.s) / 1000)])));
  EXPORTS.wm = () => exportCSV('Total_Warning_Minutes', ['Reason', 'Minutes', 'Times'], warn.map(w => [w.label, w.value.toFixed(1), dr[DB.cfg.reasons.find(r => r.name === w.label)?.id]?.count || 0]));
  EXPORTS.cm = () => exportCSV('Total_Critical_Minutes', ['Reason', 'Minutes', 'Times'], crit.map(w => [w.label, w.value.toFixed(1), dr[DB.cfg.reasons.find(r => r.name === w.label)?.id]?.count || 0]));
  return head('Availability Dashboard') + filters() +
    `<div class="grid g-1-2" style="margin-bottom:20px">${gaugeCard('Availability', c.A, `Run <b>${hrs(c.run)}</b> · Down <b>${hrs(c.down)}</b>`)}
      <div class="card"><div class="card-head"><h3>Availability History</h3>${csvBtn('export', 'ah')}</div>${chart(W => Charts.area(pts, [{ key: 'A', label: 'Availability', color: '--s-a' }], { W, H: 220, size }))}</div></div>
    <div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Availability Timeline</h3><div class="legend"><span><i style="background:var(--good)"></i>On plan</span><span><i style="background:var(--warn)"></i>Warning</span><span><i style="background:var(--crit)"></i>Critical</span></div>${csvBtn('export', 'tl')}</div>${chart(W => Charts.timeline(tl, f, t, { W }))}</div>
    <div class="grid g2"><div class="card"><div class="card-head"><h3>Total Warning Minutes by Reason</h3>${csvBtn('export', 'wm')}</div>${chart(W => Charts.bars(warn, { W, fmt: v => fmtNum(v, 0) }))}</div>
      <div class="card"><div class="card-head"><h3>Total Critical Minutes by Reason</h3>${csvBtn('export', 'cm')}</div>${chart(W => Charts.bars(crit, { W, fmt: v => fmtNum(v, 0) }))}</div></div>`;
}

function jobRows(f, t) {
  const now = Date.now(); const ms = new Set(DB.machinesUnder(S.assetId).map(m => m.id));
  const rows = [];
  DB.cfg.jobs.forEach(j => {
    if (j.end <= f || j.start >= Math.min(t, now)) return;
    const mids = j.machines.filter(id => ms.has(id)); if (!mids.length) return;
    const fg = DB.asset(j.finishGood) || DB.asset(mids[0]); if (!fg) return;
    const s = Math.max(j.start, f), e = Math.min(j.end, t, now);
    const r = finish(calcMachine(fg, s, e, false));
    const per = { second: 1, minute: 60, hour: 3600 }[j.idealUnit] * j.idealPer;
    rows.push({ id: j.id, j, m: fg, r, totalTime: (e - s) / 1000, st: Sim.status(fg.id), avg: r.total ? r.run / r.total : null, ideal: `${j.idealQty} unit per ${j.idealPer} ${j.idealUnit}`, per });
  });
  return rows.sort((a, b) => b.j.start - a.j.start);
}
const jobCols = [
  { h: 'Job Name', f: r => `<b>${esc(r.j.name)}</b> ${pill('accent', r.j.type === 'auto' ? 'Auto' : 'Manual')}` },
  { h: 'Machine Name', f: r => esc(r.m.name) }, { h: 'Machine Status', f: r => statusPill(r.st) },
  { h: 'OEE', cls: 'num', f: r => `<span style="color:var(${Charts.levelVar(r.r.OEE)})">${fmtPct(r.r.OEE)}</span>` },
  { h: 'Availability', cls: 'num', f: r => fmtPct(r.r.A) }, { h: 'Performance', cls: 'num', f: r => fmtPct(r.r.P) }, { h: 'Quality', cls: 'num', f: r => fmtPct(r.r.Q) },
  { h: 'Plan Time', f: r => `<span class="mono" style="color:var(--good)">${fmtDT(r.j.start)} – ${fmtDT(r.j.end)}</span>` },
  { h: 'Total Time', cls: 'num', f: r => `<span class="mono">${hrs(r.totalTime)}</span>` }, { h: 'Run Time', cls: 'num', f: r => `<span class="mono">${hrs(r.r.run)}</span>` },
  { h: 'Down Time', cls: 'num', f: r => `<span class="mono">${hrs(r.r.down)}</span>` }, { h: 'Target', cls: 'num', f: r => fmtNum(r.j.target) },
  { h: 'Actual', cls: 'num', f: r => `${fmtNum(r.r.total)} <span style="color:var(--muted)">(${(r.r.total / r.j.target * 100).toFixed(1)}%)</span>` },
  { h: 'Diff', cls: 'num', f: r => fmtNum(r.j.target - r.r.total) },
  { h: 'Time Average per pcs', cls: 'num', f: r => r.avg == null ? '–' : `${r.avg.toFixed(1)} s` }, { h: 'Ideal Cycle Time', f: r => esc(r.ideal) },
];
const jobCSV = rows => [jobCols.map(c => c.h), rows.map(r => [r.j.name, r.m.name, r.st, fmtPct(r.r.OEE), fmtPct(r.r.A), fmtPct(r.r.P), fmtPct(r.r.Q), `${fmtDT(r.j.start)} - ${fmtDT(r.j.end)}`, hrs(r.totalTime), hrs(r.r.run), hrs(r.r.down), r.j.target, Math.round(r.r.total), Math.round(r.j.target - r.r.total), r.avg?.toFixed(1) ?? '', r.ideal])];

function pPerf() {
  const [f, t] = range(); const c = calc(S.assetId, f, t, S.onlyJob);
  const pts = history(S.assetId, f, t, S.onlyJob); const size = bucketSize(f, t);
  const rp = pts.map(p => ({ t: p.t, ideal: p.run ? p.target / (p.run / 3600) : null, actual: p.run ? p.total / (p.run / 3600) : null }));
  const avg = c.run ? c.total / (c.run / 3600) : null; rp.forEach(p => p.avg = avg);
  const yMax = Math.max(10, ...rp.map(p => Math.max(p.ideal || 0, p.actual || 0))) * 1.15;
  const jobs = jobRows(f, t);
  EXPORTS.ph = () => exportCSV('Performance_History', ['Datetime', 'Performance %', 'Actual', 'Target'], pts.map(p => [fmtDT(p.t), p.P == null ? '' : (p.P * 100).toFixed(2), Math.round(p.total), Math.round(p.target)]));
  EXPORTS.rc = () => exportCSV('Ideal_and_Actual_Rate', ['Datetime', 'Ideal rate (pcs/h)', 'Actual rate (pcs/h)'], rp.map(p => [fmtDT(p.t), p.ideal?.toFixed(1) ?? '', p.actual?.toFixed(1) ?? '']));
  EXPORTS.ji = () => { const [h, r] = jobCSV(jobs); exportCSV('Job_Information', h, r); };
  const RS = [{ key: 'ideal', label: 'Ideal rate', color: '--good' }, { key: 'actual', label: 'Actual rate', color: '--warn' }, { key: 'avg', label: 'Overall actual average', color: '--accent', dash: true }];
  return head('Performance Dashboard') + filters() +
    `<div class="grid g-1-2" style="margin-bottom:20px">${gaugeCard('Performance', c.P, `Runtime <b>${hrs(c.run)}</b>`)}
      <div class="card"><div class="card-head"><h3>Performance History</h3>${csvBtn('export', 'ph')}</div>${chart(W => Charts.area(pts, [{ key: 'P', label: 'Performance', color: '--s-p' }], { W, H: 220, size }))}</div></div>
    <div class="grid g3" style="margin-bottom:20px">
      <div class="card kpi"><span class="ico" style="color:var(--good)">${ic('gauge')}</span><div><label>Target</label><b>${fmtNum(c.target, 2)}</b></div></div>
      <div class="card kpi"><span class="ico" style="color:var(--warn)">${ic('check')}</span><div><label>Actual</label><b>${fmtNum(c.total, 2)}</b></div></div>
      <div class="card kpi"><span class="ico" style="color:var(--s-p)">${ic('loss')}</span><div><label>Diff</label><b>${fmtNum(c.target - c.total, 2)}</b></div></div></div>
    <div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Ideal and Actual Rate Compare <span class="hint">pcs / hour</span></h3>${Charts.legend(RS)}${csvBtn('export', 'rc')}</div>${chart(W => Charts.area(rp, RS, { W, H: 240, size, yMax, pct: false, fill: false, fmt: v => fmtNum(v) }))}</div>
    <div class="card"><div class="card-head"><h3>Job Information</h3>${csvBtn('export', 'ji')}</div>${table('perf-jobs', jobCols, jobs, { pageSize: 8 })}</div>`;
}

function pQuality() {
  const [f, t] = range(); const c = calc(S.assetId, f, t, S.onlyJob);
  const pts = history(S.assetId, f, t, S.onlyJob); const size = bucketSize(f, t);
  const byM = c.machines.map(m => ({ label: m.name, good: m.good, bad: m.bad }));
  const br = badByReason(S.assetId, f, t);
  const reasons = DB.reasons('quality').map(r => ({ label: r.name, value: br[r.id] || 0, color: '--crit' }));
  EXPORTS.qh = () => exportCSV('Quality_History', ['Datetime', 'Quality %'], pts.map(p => [fmtDT(p.t), p.Q == null ? '' : (p.Q * 100).toFixed(2)]));
  EXPORTS.qm = () => exportCSV('Quality_by_Machine', ['Machine', 'Good', 'Bad', 'Quality %'], c.machines.map(m => [m.name, Math.round(m.good), Math.round(m.bad), m.Q == null ? '' : (m.Q * 100).toFixed(2)]));
  EXPORTS.qr = () => exportCSV('Bad_Quality_by_Reason', ['Reason', 'Bad quantity'], reasons.map(r => [r.label, Math.round(r.value)]));
  return head('Quality Dashboard') + filters() +
    `<div class="grid g-1-2" style="margin-bottom:20px">${gaugeCard('Quality', c.Q, `Bad rate <b>${c.total ? (c.bad / c.total * 100).toFixed(1) : '0.0'}%</b>`)}
      <div class="card"><div class="card-head"><h3>Quality History</h3>${csvBtn('export', 'qh')}</div>${chart(W => Charts.area(pts, [{ key: 'Q', label: 'Quality', color: '--s-q' }], { W, H: 220, size }))}</div></div>
    <div class="grid g3" style="margin-bottom:20px">
      <div class="card kpi"><span class="ico" style="color:var(--accent)">${ic('report')}</span><div><label>Total</label><b>${fmtNum(c.total, 2)}</b></div></div>
      <div class="card kpi"><span class="ico" style="color:var(--good)">${ic('check')}</span><div><label>Good</label><b>${fmtNum(c.good, 2)}</b></div></div>
      <div class="card kpi"><span class="ico" style="color:var(--crit)">${ic('x')}</span><div><label>Bad</label><b>${fmtNum(c.bad, 2)}</b></div></div></div>
    <div class="grid g2"><div class="card"><div class="card-head"><h3>Quality by Machine</h3><div class="legend"><span><i style="background:var(--good)"></i>Good</span><span><i style="background:var(--crit)"></i>Bad</span></div>${csvBtn('export', 'qm')}</div>${chart(W => Charts.stacked(byM, { W }))}</div>
      <div class="card"><div class="card-head"><h3>Bad Quality by Reason</h3>${csvBtn('export', 'qr')}</div>${chart(W => Charts.bars(reasons, { W }))}</div></div>`;
}

function pBench() {
  const [f, t] = range();
  const options = DB.cfg.assets.filter(a => assetLevel(a.id) !== 'deny');
  if (!S.benchIds || !S.benchIds.every(id => DB.asset(id))) {
    const k = DB.kids(S.assetId).filter(assetVisible); S.benchIds = (k.length ? k : DB.machinesUnder(S.assetId)).slice(0, 5).map(a => a.id);
    if (!S.benchIds.length) S.benchIds = [S.assetId];
  }
  const cards = S.benchIds.map((id, i) => {
    const a = DB.asset(id); const c = calc(id, f, t, S.onlyJob);
    return `<div class="card">
      <div class="inline" style="flex-wrap:nowrap"><select class="input" id="bench-${i}" data-bench="${i}" aria-label="Compare asset ${i + 1}">${options.map(o => `<option value="${o.id}" ${o.id === id ? 'selected' : ''}>${esc(o.name)} (${esc(o.code)})</option>`).join('')}</select>
      <button class="btn icon" data-act="bench-del" data-arg="${i}" aria-label="Remove column" ${S.benchIds.length < 2 ? 'disabled' : ''}>${ic('x')}</button></div>
      ${Charts.gauge(c.OEE, 'OEE')}
      <dl><dt><span>Asset name</span></dt><dd><b>${esc(a.name)}</b></dd>
        <dt style="color:var(--s-oee)"><span>OEE</span><span>${fmtPct(c.OEE)}</span></dt>
        <dt style="color:var(--s-a)"><span>Availability</span><span>${fmtPct(c.A)}</span></dt>
        <dd>Planned Production Time <b>${fmtNum(c.planned / 60)} min</b></dd><dd>Runtime <b>${fmtNum(c.run / 60)} min</b></dd>
        <dt style="color:var(--s-p)"><span>Performance</span><span>${fmtPct(c.P)}</span></dt>
        <dd>Target <b>${fmtNum(c.target)}</b></dd><dd>Actual <b>${fmtNum(c.total)}</b></dd><dd>Runtime <b>${fmtNum(c.run / 60)} min</b></dd>
        <dt style="color:var(--s-q)"><span>Quality</span><span>${fmtPct(c.Q)}</span></dt>
        <dd>Total Parts <b>${fmtNum(c.total)}</b></dd><dd>Good Parts <b>${fmtNum(c.good)}</b></dd><dd>Bad Parts <b>${fmtNum(c.bad)}</b></dd></dl></div>`;
  }).join('');
  return head('Benchmark Compare', `<button class="btn" data-act="bench-add" ${S.benchIds.length >= 8 ? 'disabled' : ''}>${ic('plus')}Add asset</button>`) + filters() + `<div class="bench">${cards}</div>`;
}

function pJobTrack() {
  const [f, t] = range(); const rows = jobRows(f, t);
  EXPORTS.jt = () => { const [h, r] = jobCSV(rows); exportCSV('Job_Tracking', h, r); };
  return head('Job Tracking', csvBtn('export', 'jt')) + filters() + `<div class="card">${table('jobtrack', jobCols, rows, { pageSize: 10 })}</div>`;
}

function pLoss() {
  const [f, t] = range();
  const ms = DB.machinesUnder(S.assetId);
  let units = ms.map(m => { const L = lossFor(m, f, t, S.onlyJob); return { id: m.id, name: m.name, mids: [m.id], ...L }; });
  if (S.lossBy === 'line') {
    const g = {};
    units.forEach(u => { const p = DB.asset(DB.asset(u.id).parentId); const k = p?.id || u.id; g[k] = g[k] || { id: k, name: p?.name || u.name, mids: [], aLoss: 0, pLoss: 0, qLoss: 0, total: 0 }; ['aLoss', 'pLoss', 'qLoss', 'total'].forEach(x => g[k][x] += u[x]); g[k].mids.push(u.id); });
    units = Object.values(g);
  }
  const key = { overall: 'total', availability: 'aLoss', performance: 'pLoss', quality: 'qLoss' }[S.lossType];
  const sum = units.reduce((a, u) => a + u[key], 0) || 1;
  units.sort((a, b) => b[key] - a[key]);
  const top = units.slice(0, S.lossTop);
  const c = calc(S.assetId, f, t, S.onlyJob);
  const tot = units.reduce((a, u) => ({ a: a.a + u.aLoss, p: a.p + u.pLoss, q: a.q + u.qLoss }), { a: 0, p: 0, q: 0 });
  const pts = history(S.assetId, f, t, S.onlyJob);
  const tiles = [
    ['OEE loss', fmtPct(c.OEE == null ? null : 1 - c.OEE), pts.map(p => p.OEE == null ? null : 1 - p.OEE), '--s-oee'],
    ['Availability', `${hrs(tot.a)} hrs`, pts.map(p => p.A == null ? null : 1 - p.A), '--s-a'],
    ['Performance', `${hrs(tot.p)} hrs`, pts.map(p => p.P == null ? null : Math.max(0, 1 - p.P)), '--s-p'],
    ['Quality', `${hrs(tot.q)} hrs`, pts.map(p => p.Q == null ? null : 1 - p.Q), '--s-q'],
  ];
  const colors = ['--crit', '--warn', '--s-p', '--s-oee', '--s-a', '--s-q', '--accent', '--good', '--idle', '--warn'];
  const rows = top.map((u, i) => {
    const dr = {}; u.mids.forEach(mid => Object.entries(downByReason(mid, f, t)).forEach(([k, v]) => { dr[k] = dr[k] || { sec: 0, count: 0 }; dr[k].sec += v.sec; dr[k].count += v.count; }));
    const bq = {}; let rate = 0; u.mids.forEach(mid => { Object.entries(badByReason(mid, f, t)).forEach(([k, v]) => bq[k] = (bq[k] || 0) + v); rate += idealRate(DB.asset(mid), Math.min(t, Date.now()) - 1) / 3600; });
    rate = rate / u.mids.length || 1;
    let reasons = [];
    if (S.lossType !== 'quality' && S.lossType !== 'performance') reasons = reasons.concat(Object.entries(dr).map(([k, v]) => ({ name: DB.reason(k)?.name || 'Stopped', sec: v.sec, n: v.count, col: DB.reason(k)?.status === 'critical' ? '--crit' : '--warn' })));
    if (S.lossType === 'quality' || S.lossType === 'overall') reasons = reasons.concat(Object.entries(bq).map(([k, v]) => ({ name: DB.reason(k)?.name || 'Bad', sec: v / rate, n: Math.round(v), col: '--s-q', unit: 'pcs' })));
    if (S.lossType === 'performance') reasons = [{ name: 'Speed loss (slow cycles, minor stops)', sec: u.pLoss, n: null, col: '--s-p' }];
    reasons.sort((a, b) => b.sec - a.sec);
    const hp = history(u.mids.length === 1 ? u.mids[0] : DB.asset(u.mids[0]).parentId, f, t, S.onlyJob).map(p => p.OEE == null ? null : 1 - p.OEE);
    return `<div class="card loss-row" style="margin-bottom:14px"><span class="rank" style="color:var(${colors[i]})">${i + 1}</span>
      <div class="who"><span>${esc(u.name)} · ${(u[key] / sum * 100).toFixed(1)} %</span><b>${hrs(u[key])} hrs</b></div>
      <ul>${reasons.slice(0, 3).map(r => `<li><span class="dot" style="background:var(${r.col})"></span>${esc(r.name)} <span class="mono">${hrs(r.sec)} hrs${r.n != null ? ` / ${r.n} ${r.unit || 'times'}` : ''}</span></li>`).join('') || '<li style="color:var(--muted)">No loss recorded.</li>'}
        ${reasons.length > 3 ? `<li><button class="link" data-act="scope-go" data-arg="${u.mids.length === 1 ? u.mids[0] : DB.asset(u.mids[0]).parentId}" data-page="machine_detail">Show more</button></li>` : ''}</ul>
      <div class="spark">${Charts.spark(hp, colors[i])}</div></div>`;
  }).join('');
  const sel = (id, val, opts) => `<select class="input" id="${id}" aria-label="${id}">${opts.map(([v, l]) => `<option value="${v}" ${val == v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  return head('Loss') + filters({ extra: sel('loss-type', S.lossType, [['overall', 'Overall'], ['availability', 'Availability'], ['performance', 'Performance'], ['quality', 'Quality']]) + sel('loss-by', S.lossBy, [['machine', 'By Machine'], ['line', 'By Line']]) + sel('loss-top', S.lossTop, [[3, 'Top 3'], [5, 'Top 5'], [10, 'Top 10']]) }) +
    `<div class="grid g4" style="margin-bottom:20px">${tiles.map(([l, v, s, col]) => `<div class="card"><div class="card-head" style="margin-bottom:4px"><h3>${l}</h3></div><b class="num" style="font-size:20px">${v}</b>${Charts.spark(s, col)}</div>`).join('')}</div>
    ${rows || '<div class="card empty">No machines in scope.</div>'}`;
}

function alarmScoped() { return Sim.alarms.filter(a => DB.asset(a.assetId) && DB.isUnder(a.assetId, S.assetId) && assetLevel(a.assetId) !== 'deny'); }
function pAlarm() {
  const [f, t] = range();
  const all = alarmScoped();
  const open = all.filter(a => !a.ackBy).sort((a, b) => b.at - a.at);
  const hist = all.filter(a => a.at >= f && a.at < t).sort((a, b) => b.at - a.at);
  const sum = list => `${pill('warn', `Warning ${list.filter(a => a.severity === 'warning').length}`)} ${pill('crit', `Critical ${list.filter(a => a.severity === 'critical').length}`)} ${pill('idle', `Job ${list.filter(a => a.type === 'job').length}`)} ${pill('idle', `Machine ${list.filter(a => a.type === 'machine').length}`)}`;
  const cols = [{ h: 'Datetime', f: a => `<span class="mono">${fmtDT(a.at)}</span>` }, { h: 'Alarm Name', f: a => esc(a.name) }, { h: 'Severity', f: a => sevPill(a.severity) }, { h: 'Type', f: a => esc(a.type) }, { h: 'Asset / Job Name', f: a => esc(DB.asset(a.assetId)?.name) }, { h: 'Description', f: a => esc(a.desc) }];
  const canAck = canEdit('alarm');
  const ackCol = { h: 'Action', cls: 'num', f: a => canAck ? `<button class="btn sm" data-act="ack" data-arg="${a.id}">Acknowledge</button>` : '' };
  const histCols = cols.concat([{ h: 'Acknowledge By', f: a => esc(a.ackBy || '–') }, { h: 'Acknowledge Date', f: a => `<span class="mono">${fmtDT(a.ackAt)}</span>` }]);
  const toRow = a => [fmtDT(a.at), a.name, a.severity, a.type, DB.asset(a.assetId)?.name, a.desc, a.ackBy || '', fmtDT(a.ackAt)];
  const H = ['Datetime', 'Alarm Name', 'Severity', 'Type', 'Asset/Job Name', 'Description', 'Acknowledge By', 'Acknowledge Date'];
  EXPORTS.ac = () => exportCSV('Current_Alarm', H, open.map(toRow));
  EXPORTS.ahist = () => exportCSV('Alarm_History', H, hist.map(toRow));
  return head('Alarm') +
    `<div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Current Alarm Summary <span style="margin-left:8px">${sum(open)}</span></h3><div class="toolbar">${csvBtn('export', 'ac')}${canAck ? `<button class="btn" data-act="ack-all" ${open.length ? '' : 'disabled'}>${ic('check')}Acknowledge All</button>` : ''}</div></div>
      ${table('alarm-open', cols.concat([ackCol]), open, { empty: 'No open alarms. Everything is acknowledged.' })}</div>` +
    filters({ print: false }) +
    `<div class="card"><div class="card-head"><h3>Alarm History <span style="margin-left:8px">${sum(hist)}</span></h3>${csvBtn('export', 'ahist')}</div>${table('alarm-hist', histCols, hist)}</div>`;
}

function pMachine() {
  const [f, t] = range(); const c = calc(S.assetId, f, t, S.onlyJob);
  const pts = history(S.assetId, f, t, S.onlyJob); const size = bucketSize(f, t);
  const tl = timeline(S.assetId, f, t); const dr = downByReason(S.assetId, f, t); const br = badByReason(S.assetId, f, t);
  const ar = Object.entries(dr).map(([k, v]) => ({ label: DB.reason(k)?.name || 'Stopped', value: v.sec / 60, color: DB.reason(k)?.status === 'critical' ? '--crit' : '--warn' })).sort((a, b) => b.value - a.value).slice(0, 6);
  const qr = Object.entries(br).map(([k, v]) => ({ label: DB.reason(k)?.name || 'Bad', value: v, color: '--crit' })).sort((a, b) => b.value - a.value).slice(0, 6);
  const mrows = c.machines.map(m => ({ ...m, st: Sim.status(m.id) }));
  EXPORTS.mo = () => exportCSV('Overall_OEE_History', ['Datetime', 'OEE %', 'A %', 'P %', 'Q %'], pts.map(p => [fmtDT(p.t), ...['OEE', 'A', 'P', 'Q'].map(k => p[k] == null ? '' : (p[k] * 100).toFixed(2))]));
  EXPORTS.mt = () => exportCSV('Availability_Timeline', ['Machine', 'State', 'Reason', 'Start', 'End'], tl.flatMap(r => r.segs.map(s => [r.label, s.state, s.reason, fmtDT(s.s), fmtDT(s.e)])));
  EXPORTS.mar = () => exportCSV('Availability_Top_Reason', ['Reason', 'Minutes'], ar.map(r => [r.label, r.value.toFixed(1)]));
  EXPORTS.mqr = () => exportCSV('Quality_Top_Reason', ['Reason', 'Bad quantity'], qr.map(r => [r.label, Math.round(r.value)]));
  return head('Machine Detail') + filters() +
    `<div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Machine Information</h3></div>${table('mach-info', [
      { h: 'Machine Name', f: m => `<button class="link" data-act="scope" data-arg="${m.id}">${esc(m.name)}</button>` }, { h: 'Status', f: m => statusPill(m.st) },
      { h: 'OEE', cls: 'num', f: m => `<span style="color:var(${Charts.levelVar(m.OEE)})">${fmtPct(m.OEE)}</span>` }, { h: 'Availability', cls: 'num', f: m => fmtPct(m.A) }, { h: 'Performance', cls: 'num', f: m => fmtPct(m.P) }, { h: 'Quality', cls: 'num', f: m => fmtPct(m.Q) }], mrows, { pageSize: 8 })}</div>
    <div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Overall OEE History</h3>${Charts.legend(SERIES)}${csvBtn('export', 'mo')}</div>${chart(W => Charts.area(pts, SERIES, { W, H: 230, size }))}</div>
    <div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Availability Timeline</h3>${csvBtn('export', 'mt')}</div>${chart(W => Charts.timeline(tl, f, t, { W }))}</div>
    <div class="grid g2"><div class="card"><div class="card-head"><h3>Availability Top Reason <span class="hint">minutes</span></h3>${csvBtn('export', 'mar')}</div>${chart(W => Charts.bars(ar, { W, fmt: v => fmtNum(v, 0) }))}</div>
      <div class="card"><div class="card-head"><h3>Quality Top Reason <span class="hint">pcs</span></h3>${csvBtn('export', 'mqr')}</div>${chart(W => Charts.bars(qr, { W }))}</div></div>`;
}

function pDaily() {
  const now = Date.now(); const rows = [];
  for (let d = startOfDay(now); d >= Sim.start; d -= DAY) { const created = d + 20 * HOUR; if (created <= now) rows.push({ id: 'd' + d, d, created: created + 3000 }); }
  return head('Daily Report', '', 'Reports are generated every day at 20:00 for the selected scope.') +
    `<div class="card">${table('daily', [{ h: 'Date', f: r => `<span class="mono">${fmtDate(r.d)}</span>` }, { h: 'Created Date', f: r => `<span class="mono">${fmtDT(r.created)}</span>` },
      { h: 'Actions', cls: 'num', f: r => `<div class="acts"><button class="btn sm" data-act="report" data-arg="${r.d}" data-kind="full">${ic('print')}Print Report</button><button class="btn sm" data-act="report" data-arg="${r.d}" data-kind="one">${ic('report')}One Page Report</button></div>` }], rows)}</div>`;
}
function openReport(d, kind) {
  const f = d, t = Math.min(d + DAY, Date.now()); const c = calc(S.assetId, f, t, false);
  const dr = downByReason(S.assetId, f, t);
  const top = Object.entries(dr).sort((a, b) => b[1].sec - a[1].sec).slice(0, 5);
  const mt = `<table><thead><tr><th>Machine</th><th class="num">OEE</th><th class="num">A</th><th class="num">P</th><th class="num">Q</th><th class="num">Actual</th><th class="num">Bad</th></tr></thead><tbody>${c.machines.map(m => `<tr><td>${esc(m.name)}</td><td class="num">${fmtPct(m.OEE)}</td><td class="num">${fmtPct(m.A)}</td><td class="num">${fmtPct(m.P)}</td><td class="num">${fmtPct(m.Q)}</td><td class="num">${fmtNum(m.total)}</td><td class="num">${fmtNum(m.bad)}</td></tr>`).join('')}</tbody></table>`;
  openModal({
    title: `${kind === 'one' ? 'One Page Report' : 'Daily Report'} · ${fmtDate(d)}`, wide: true,
    body: `<div class="inline" style="justify-content:space-between"><div><b>${esc(scope().name)}</b><div style="color:var(--muted);font-size:12.5px">${fmtDT(f)} – ${fmtDT(t)}</div></div><div class="inline">${['OEE', 'A', 'P', 'Q'].map(k => `<span class="pill ${c[k] >= .85 ? 'good' : c[k] >= .6 ? 'warn' : 'crit'}">${k} ${fmtPct(c[k])}</span>`).join('')}</div></div>
      <div class="counter-row"><div class="counter"><label>Planned</label><b>${hrs(c.planned)}</b></div><div class="counter"><label>Run</label><b>${hrs(c.run)}</b></div><div class="counter"><label>Down</label><b>${hrs(c.down)}</b></div></div>
      <div class="counter-row"><div class="counter"><label>Target</label><b>${fmtNum(c.target)}</b></div><div class="counter"><label>Actual</label><b>${fmtNum(c.total)}</b></div><div class="counter"><label>Bad</label><b>${fmtNum(c.bad)}</b></div></div>
      ${kind === 'one' ? '' : `<div><h3 style="font-size:14px;margin-bottom:8px">By machine</h3><div class="table-wrap">${mt}</div></div>`}
      <div><h3 style="font-size:14px;margin-bottom:8px">Top downtime reasons</h3><ul style="margin:0;padding-left:18px">${top.map(([k, v]) => `<li>${esc(DB.reason(k)?.name || 'Stopped')}: <span class="mono">${hrs(v.sec)}</span> (${v.count} times)</li>`).join('') || '<li>No downtime.</li>'}</ul></div>`,
    foot: `<button class="btn" data-act="modal-close" type="button">Close</button><button class="btn primary" data-act="print" type="button">${ic('print')}Print PDF</button>`,
  });
}

/* ==========================================================================
   OPERATION MODE
   ========================================================================== */
function opMachines() { return DB.machinesUnder(S.assetId).filter(m => assetLevel(m.id) !== 'deny'); }
function pOpInput() {
  const ms = opMachines();
  if (!ms.length) return head('Operation Input') + `<div class="card empty">No machines under this asset. Pick a line or machine in the sidebar.</div>`;
  if (!ms.some(m => m.id === S.opMachine)) S.opMachine = ms[0].id;
  const m = DB.asset(S.opMachine); const cur = Sim.current(m.id); const st = Sim.status(m.id);
  const editable = canEdit('operation_input') && assetLevel(m.id) === 'edit';
  const h = new Date().getHours(); const greet = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  const sod = startOfDay(Date.now()); const c = finish(calcMachine(m, sod, Date.now(), false));
  const jobs = (DB.jobsByMachine.get(m.id) || []).filter(j => j.end > sod - DAY && j.start < sod + 2 * DAY).sort((a, b) => b.start - a.start);
  const jobRowsOp = jobs.map(j => {
    const now = Date.now(); const r = j.start < now ? finish(calcMachine(m, j.start, Math.min(j.end, now), false)) : { total: 0, good: 0, bad: 0 };
    const state = now < j.start ? pill('idle', 'Planned') : now < j.end ? pill('good', 'Running') : pill('accent', 'Done');
    return { id: j.id, j, r, state };
  });
  return `<div class="card op-head" style="margin-bottom:20px"><div><h2>${greet}, ${esc(S.user.fullName)}</h2><span style="color:var(--muted);font-size:13px">Have a nice shift. Every entry here is written to the machine's history.</span></div>
      <div class="clock"><b id="op-clock">${fmtTime(Date.now())}</b><span id="op-date">${new Date().toLocaleDateString('en-GB', { weekday: 'long' })} ${fmtDate(Date.now())}</span></div></div>
    <div class="grid g2" style="margin-bottom:20px">
      <div class="card op-panel"><div class="card-head" style="margin:0"><h3>Machine</h3>${editable ? '' : pill('idle', 'View only')}</div>
        <select class="input" id="op-machine" aria-label="Machine">${ms.map(x => `<option value="${x.id}" ${x.id === m.id ? 'selected' : ''}>${esc(x.name)} (${esc(x.code)})</option>`).join('')}</select>
        <div class="state-big"><span style="font-size:12px;color:var(--muted)">OFF</span>
          <button class="switch big" role="switch" aria-checked="${cur.on}" aria-label="Machine power" data-act="op-toggle" ${editable ? '' : 'disabled'}></button><span style="font-size:12px;color:var(--muted)">ON</span>
          <div class="state-text"><b style="color:var(--${st === 'run' ? 'good' : st})">${cur.on ? 'Running' : esc(DB.reason(cur.reasonId)?.name || 'Stopped')}</b><span>since ${fmtDT(cur.s)} · by ${esc(cur.by)}${!cur.on && !cur.manual ? ' · auto-resume when cleared' : ''}</span></div></div>
        <div class="counter-row"><div class="counter"><label>Actual today</label><b>${fmtNum(c.total)}</b></div><div class="counter"><label>Good</label><b style="color:var(--good)">${fmtNum(c.good)}</b></div><div class="counter"><label>Bad</label><b style="color:var(--crit)">${fmtNum(c.bad)}</b></div></div></div>
      <div class="card op-panel"><div class="card-head" style="margin:0"><h3>Count production</h3><span class="hint">OEE today <b style="color:var(${Charts.levelVar(c.OEE)})">${fmtPct(c.OEE)}</b></span></div>
        <div class="inline" style="justify-content:space-between"><span style="font-size:12.5px;color:var(--muted)">Quantity</span>
          <div class="qty"><button class="btn icon" data-act="qty" data-arg="-1" aria-label="Decrease">−</button><input class="input" id="op-qty" type="number" min="1" value="${S.opQty}" aria-label="Quantity"><button class="btn icon" data-act="qty" data-arg="1" aria-label="Increase">+</button></div></div>
        <div class="radio-group" role="radiogroup" aria-label="Counting mode">${[['p', 'Performance'], ['pq', 'Performance + Quality'], ['q', 'Quality']].map(([v, l]) => `<label><input type="radio" name="op-mode" value="${v}" ${S.opMode === v ? 'checked' : ''}>${l}</label>`).join('')}</div>
        <div class="gb"><button class="btn good" data-act="op-good" ${editable ? '' : 'disabled'}>${S.opMode === 'p' ? 'Add count' : 'Good'}</button>${S.opMode === 'p' ? '' : `<button class="btn danger" data-act="op-bad" ${editable ? '' : 'disabled'}>Bad</button>`}</div>
        <p style="margin:0;font-size:12px;color:var(--faint)">${S.opMode === 'p' ? 'Adds pieces to Actual (Performance).' : S.opMode === 'pq' ? 'Adds pieces to Actual and records them as good or bad.' : 'Inspects pieces already counted: records good or bad only.'}</p></div></div>
    <div class="card"><div class="card-head"><h3>Machine Job List</h3></div>${table('op-jobs', [
      { h: 'Job Name', f: r => `${esc(r.j.name)} ${pill('accent', r.j.type === 'auto' ? 'Auto' : 'Manual')}` }, { h: 'Job Date', f: r => `<span class="mono">${fmtDT(r.j.start)} – ${fmtTime(r.j.end, false)}</span>` },
      { h: 'Action', f: r => r.state }, { h: 'Actual', cls: 'num', f: r => `${fmtNum(r.r.total)} <span style="color:var(--muted)">(${(r.r.total / r.j.target * 100).toFixed(1)}%)</span>` },
      { h: 'Target', cls: 'num', f: r => fmtNum(r.j.target) }, { h: 'Good', cls: 'num', f: r => fmtNum(r.r.good) }, { h: 'Bad', cls: 'num', f: r => fmtNum(r.r.bad) }], jobRowsOp, { pageSize: 5 })}</div>`;
}
function reasonPicker(section, title, onPick, allowNone) {
  const groups = section === 'availability' ? [['warning', 'Warning', 'warn'], ['critical', 'Critical', 'crit']] : [['bad', 'Bad reason', 'crit']];
  openModal({
    title, body: `<div class="reason-grid">${groups.map(([s, l, k]) => `<div><h4 style="color:var(--${k})">${l}</h4><div class="opts">${DB.cfg.reasons.filter(r => r.section === section && r.status === s).map(r => `<button type="button" class="btn" data-act="pick-reason" data-arg="${r.id}">${esc(r.name)}</button>`).join('')}</div></div>`).join('')}
      ${allowNone ? `<div><button type="button" class="btn" data-act="pick-reason" data-arg="">No reason</button></div>` : ''}</div>`,
    foot: `<button class="btn" data-act="modal-close" type="button">Cancel</button>`,
  });
  MODAL.onPick = onPick;
}
function opCount(kind) {
  const qty = Math.max(1, parseInt(document.getElementById('op-qty')?.value || S.opQty, 10) || 1); S.opQty = qty;
  const mid = S.opMachine; const by = S.user.username; const at = Date.now();
  const write = reasonId => {
    if (S.opMode !== 'q') Sim.manualPerf.push({ id: uid('mp'), mid, at, qty, by });
    if (S.opMode !== 'p') Sim.manualQual.push({ id: uid('mq'), mid, at, type: kind, qty, reasonId: reasonId || null, by });
    if (kind === 'bad' && reasonId) Sim.raiseReasonAlarms(mid, reasonId, at, 'Quality');
    toast(`${kind === 'bad' ? 'Recorded' : 'Added'} <b>${qty}</b> ${kind === 'bad' ? 'bad' : S.opMode === 'p' ? '' : 'good'} pcs on ${esc(DB.asset(mid).name)}${reasonId ? ` · ${esc(DB.reason(reasonId).name)}` : ''}`, kind === 'bad' ? 'crit' : 'good');
    refreshContent();
  };
  if (kind === 'bad') reasonPicker('quality', 'Bad reason', id => { closeModal(); write(id); }, true); else write(null);
}

/* ---------- availability history ---------- */
function pAvailHist() {
  const [f, t] = range(); const ms = opMachines().map(m => m.id);
  const rows = Sim.availEvents(ms, f, t);
  const ed = canEdit('availability_history');
  EXPORTS.avh = () => exportCSV('Availability_History', ['Status', 'Asset', 'Datetime', 'Reason', 'Created By', 'Updated By'], rows.map(r => [r.type, DB.asset(r.mid).name, fmtDT(r.at), DB.reason(r.reasonId)?.name || '', r.by, r.upd]));
  return head('Availability History', `${csvBtn('export', 'avh')}${ed ? `<button class="btn primary" data-act="avh-add">${ic('plus')}Add</button>` : ''}`) + filters({ print: false }) +
    `<div class="card">${table('avh', [
      { h: 'Status', f: r => r.type === 'on' ? pill('good', 'On') : pill('idle', 'Off') }, { h: 'Asset', f: r => esc(DB.asset(r.mid).name) }, { h: 'Datetime', f: r => `<span class="mono">${fmtDT(r.at)}</span>` },
      { h: 'Reason', f: r => r.reasonId ? `${esc(DB.reason(r.reasonId)?.name || '')} ${sevPill(DB.reason(r.reasonId)?.status || 'warning')}` : '' }, { h: 'Created By', f: r => esc(r.by) }, { h: 'Updated By', f: r => esc(r.upd) },
      { h: 'Action', cls: 'num', f: r => ed ? `<div class="acts"><button class="btn sm" data-act="avh-edit" data-arg="${r.id}">Edit</button><button class="btn sm danger" data-act="avh-del" data-arg="${r.id}">Delete</button></div>` : '' }], rows)}</div>`;
}
function availForm(ev) {
  const ms = opMachines().filter(m => assetLevel(m.id) === 'edit');
  const at = ev ? ev.at : Date.now();
  const on = ev ? ev.type === 'on' : true;
  openModal({
    title: ev ? 'Edit Operation History' : 'New Operation History',
    body: row('Asset', `<select class="input" id="fa-asset" ${ev ? 'disabled' : ''}><option value="">Please select machine</option>${ms.map(m => `<option value="${m.id}" ${ev?.mid === m.id ? 'selected' : ''}>${esc(m.name)} (${esc(m.code)})</option>`).join('')}</select>`, 'fa-asset', true) +
      row('Type', `<div class="radio-group"><label><input type="radio" name="fa-type" value="on" ${on ? 'checked' : ''}>${pill('good', 'On')}</label><label><input type="radio" name="fa-type" value="off" ${on ? '' : 'checked'}>${pill('idle', 'Off')}</label></div>`) +
      row('Datetime', `<input class="input" type="datetime-local" step="1" id="fa-at" value="${toLocalInput(at)}:${pad(new Date(at).getSeconds())}">`, 'fa-at', true) +
      row('Reason', `<select class="input" id="fa-reason"><option value="">–</option>${DB.reasons('availability').map(r => `<option value="${r.id}" ${ev?.reasonId === r.id ? 'selected' : ''}>${esc(r.name)} (${r.status})</option>`).join('')}</select>`, 'fa-reason'),
    onSave: () => {
      const mid = ev ? ev.mid : fv('fa-asset'); const type = document.querySelector('input[name=fa-type]:checked').value; const t = new Date(fv('fa-at')).getTime(); const reasonId = fv('fa-reason');
      let ok = setErr('fa-asset', mid ? '' : 'Please select a machine.');
      ok = setErr('fa-at', isFinite(t) && t <= Date.now() && t >= Sim.start ? '' : `Pick a time between ${fmtDate(Sim.start)} and now.`) && ok;
      ok = setErr('fa-reason', type === 'off' && !reasonId ? 'An Off event needs a reason.' : '') && ok;
      if (!ok) return;
      if (ev) { const err = Sim.editAvailEvent(mid, ev.i, t, type === 'on', reasonId || null, S.user.username); if (err) return setErr('fa-at', err); toast('Operation history updated.', 'good'); }
      else { Sim.addAvailEvent(mid, t, type === 'on', reasonId || null, S.user.username); toast('Operation history added.', 'good'); }
      closeModal(); refreshContent();
    },
  });
}

/* ---------- performance & quality history ---------- */
function perfRows(f, t) {
  const now = Date.now(); const rows = [];
  opMachines().forEach(m => {
    const d = Sim.data.get(m.id); if (!d) return;
    for (let h = Math.max(0, Sim.hourIdx(f)); h <= Sim.hourIdx(Math.min(t, now) - 1); h++) if (d.tot[h] >= 0.5) rows.push({ id: `h:${m.id}:${h}`, mid: m.id, h, at: Sim.start + h * HOUR, qty: d.tot[h], by: 'system', upd: d.updP?.[h] || '', sys: true });
  });
  Sim.manualPerf.forEach(e => { if (e.at >= f && e.at < t && opMachines().some(m => m.id === e.mid)) rows.push({ ...e, upd: e.upd || '' }); });
  return rows.sort((a, b) => b.at - a.at);
}
function pPerfHist() {
  const [f, t] = range(); const rows = perfRows(f, t); const ed = canEdit('performance_history');
  EXPORTS.pfh = () => exportCSV('Performance_History', ['Asset', 'Datetime', 'Quantity', 'Uom', 'Created By', 'Updated By'], rows.map(r => [DB.asset(r.mid).name, fmtDT(r.at), Math.round(r.qty), 'ea', r.by, r.upd]));
  return head('Performance History', `${csvBtn('export', 'pfh')}${ed ? `<button class="btn primary" data-act="pf-add">${ic('plus')}Add</button>` : ''}`, 'Signals from machines are grouped per hour; manual entries appear one by one.') + filters({ print: false }) +
    `<div class="card">${table('pfh', [{ h: 'Asset', f: r => esc(DB.asset(r.mid).name) }, { h: 'Datetime', f: r => `<span class="mono">${fmtDT(r.at)}</span>${r.sys ? ' <span class="pill idle">hourly</span>' : ''}` },
      { h: 'Quantity', cls: 'num', f: r => fmtNum(r.qty) }, { h: 'Uom', f: () => 'ea' }, { h: 'Created By', f: r => esc(r.by) }, { h: 'Updated By', f: r => esc(r.upd) },
      { h: 'Action', cls: 'num', f: r => ed ? `<div class="acts"><button class="btn sm" data-act="pf-edit" data-arg="${r.id}">Edit</button><button class="btn sm danger" data-act="pf-del" data-arg="${r.id}">Delete</button></div>` : '' }], rows)}</div>`;
}
function findPerf(id) { const [f, t] = range(); return perfRows(f, t).find(r => r.id === id); }
function perfForm(r) {
  const ms = opMachines().filter(m => assetLevel(m.id) === 'edit');
  openModal({
    title: r ? 'Edit Performance History' : 'New Performance History',
    body: row('Asset', `<select class="input" id="fp-asset" ${r ? 'disabled' : ''}><option value="">Please select machine</option>${ms.map(m => `<option value="${m.id}" ${r?.mid === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>`, 'fp-asset', true) +
      row('Datetime', `<input class="input" type="datetime-local" id="fp-at" value="${toLocalInput(r ? r.at : Date.now())}" ${r?.sys ? 'disabled' : ''}>`, 'fp-at', true) +
      row('Quantity', `<input class="input" type="number" min="0" step="1" id="fp-qty" value="${r ? Math.round(r.qty) : ''}">`, 'fp-qty', true),
    onSave: () => {
      const mid = r ? r.mid : fv('fp-asset'); const at = new Date(fv('fp-at')).getTime(); const qty = Number(fv('fp-qty'));
      let ok = setErr('fp-asset', mid ? '' : 'Please select a machine.');
      ok = setErr('fp-at', r?.sys || (isFinite(at) && at <= Date.now() && at >= Sim.start) ? '' : 'Pick a time within the last 31 days.') && ok;
      ok = setErr('fp-qty', fv('fp-qty') !== '' && qty >= 0 ? '' : 'Enter a quantity of 0 or more.') && ok;
      if (!ok) return;
      if (r?.sys) { const d = Sim.data.get(mid); d.tot[r.h] = qty; (d.updP = d.updP || {})[r.h] = S.user.username; }
      else if (r) { const e = Sim.manualPerf.find(x => x.id === r.id); Object.assign(e, { at, qty, upd: S.user.username }); }
      else Sim.manualPerf.push({ id: uid('mp'), mid, at, qty, by: S.user.username });
      closeModal(); toast(r ? 'Performance history updated.' : 'Performance history added.', 'good'); refreshContent();
    },
  });
}
function qualRows(f, t) {
  const now = Date.now(); const rows = [];
  opMachines().forEach(m => {
    const d = Sim.data.get(m.id); if (!d) return;
    for (let h = Math.max(0, Sim.hourIdx(f)); h <= Sim.hourIdx(Math.min(t, now) - 1); h++) {
      const at = Sim.start + h * HOUR; const good = d.tot[h] - d.bad[h];
      if (good >= 0.5) rows.push({ id: `g:${m.id}:${h}`, mid: m.id, h, at, type: 'good', qty: good, reasonId: null, by: 'system', upd: d.updQ?.[h] || '', sys: true });
      Object.entries(d.br[h]).forEach(([k, v]) => { if (v >= 0.5) rows.push({ id: `b:${m.id}:${h}:${k}`, mid: m.id, h, at: at + 1, type: 'bad', qty: v, reasonId: k, by: 'system', upd: d.updQ?.[h] || '', sys: true }); });
    }
  });
  Sim.manualQual.forEach(e => { if (e.at >= f && e.at < t && opMachines().some(m => m.id === e.mid)) rows.push({ ...e, upd: e.upd || '' }); });
  return rows.sort((a, b) => b.at - a.at);
}
function pQualHist() {
  const [f, t] = range(); const rows = qualRows(f, t); const ed = canEdit('quality_history');
  EXPORTS.qlh = () => exportCSV('Quality_History', ['Quality', 'Asset', 'Datetime', 'Quantity', 'Uom', 'Reason', 'Created By', 'Updated By'], rows.map(r => [r.type, DB.asset(r.mid).name, fmtDT(r.at), Math.round(r.qty), 'ea', DB.reason(r.reasonId)?.name || '', r.by, r.upd]));
  return head('Quality History', `${csvBtn('export', 'qlh')}${ed ? `<button class="btn primary" data-act="ql-add">${ic('plus')}Add</button>` : ''}`) + filters({ print: false }) +
    `<div class="card">${table('qlh', [{ h: 'Quality', f: r => r.type === 'good' ? pill('good', 'Good') : pill('crit', 'Bad') }, { h: 'Asset', f: r => esc(DB.asset(r.mid).name) },
      { h: 'Datetime', f: r => `<span class="mono">${fmtDT(r.at)}</span>${r.sys ? ' <span class="pill idle">hourly</span>' : ''}` }, { h: 'Quantity', cls: 'num', f: r => fmtNum(r.qty) }, { h: 'Uom', f: () => 'ea' },
      { h: 'Reason', f: r => esc(DB.reason(r.reasonId)?.name || '') }, { h: 'Created By', f: r => esc(r.by) }, { h: 'Updated By', f: r => esc(r.upd) },
      { h: 'Action', cls: 'num', f: r => ed ? `<div class="acts"><button class="btn sm" data-act="ql-edit" data-arg="${r.id}">Edit</button><button class="btn sm danger" data-act="ql-del" data-arg="${r.id}">Delete</button></div>` : '' }], rows)}</div>`;
}
function findQual(id) { const [f, t] = range(); return qualRows(f, t).find(r => r.id === id); }
function setSysQual(r, qty) {
  const d = Sim.data.get(r.mid); const h = r.h;
  if (r.type === 'good') d.tot[h] = d.bad[h] + qty;
  else { d.br[h][r.reasonId] = qty; d.bad[h] = Object.values(d.br[h]).reduce((a, b) => a + b, 0); if (d.tot[h] < d.bad[h]) d.tot[h] = d.bad[h]; }
  (d.updQ = d.updQ || {})[h] = S.user.username;
}
function qualForm(r) {
  const ms = opMachines().filter(m => assetLevel(m.id) === 'edit');
  const type = r ? r.type : 'good';
  openModal({
    title: r ? 'Edit Quality History' : 'New Quality History',
    body: row('Asset', `<select class="input" id="fq-asset" ${r ? 'disabled' : ''}><option value="">Please select machine</option>${ms.map(m => `<option value="${m.id}" ${r?.mid === m.id ? 'selected' : ''}>${esc(m.name)} (${esc(m.code)})</option>`).join('')}</select>`, 'fq-asset', true) +
      row('Type', `<div class="radio-group"><label><input type="radio" name="fq-type" value="good" ${type === 'good' ? 'checked' : ''} ${r?.sys ? 'disabled' : ''}>${pill('good', 'Good')}</label><label><input type="radio" name="fq-type" value="bad" ${type === 'bad' ? 'checked' : ''} ${r?.sys ? 'disabled' : ''}>${pill('crit', 'Bad')}</label></div>`) +
      row('Datetime', `<input class="input" type="datetime-local" id="fq-at" value="${toLocalInput(r ? r.at : Date.now())}" ${r?.sys ? 'disabled' : ''}>`, 'fq-at', true) +
      row('Quantity', `<input class="input" type="number" min="0" id="fq-qty" value="${r ? Math.round(r.qty) : ''}">`, 'fq-qty', true) +
      row('Reason', `<select class="input" id="fq-reason" ${r?.sys ? 'disabled' : ''}><option value="">–</option>${DB.reasons('quality').map(x => `<option value="${x.id}" ${r?.reasonId === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>`, 'fq-reason'),
    onSave: () => {
      const mid = r ? r.mid : fv('fq-asset'); const tp = document.querySelector('input[name=fq-type]:checked').value; const at = new Date(fv('fq-at')).getTime(); const qty = Number(fv('fq-qty')); const reasonId = fv('fq-reason') || null;
      let ok = setErr('fq-asset', mid ? '' : 'Please select a machine.');
      ok = setErr('fq-at', r?.sys || (isFinite(at) && at <= Date.now() && at >= Sim.start) ? '' : 'Pick a time within the last 31 days.') && ok;
      ok = setErr('fq-qty', fv('fq-qty') !== '' && qty >= 0 ? '' : 'Enter a quantity of 0 or more.') && ok;
      ok = setErr('fq-reason', tp === 'bad' && !reasonId && !r?.sys ? 'A bad entry needs a reason.' : '') && ok;
      if (!ok) return;
      if (r?.sys) setSysQual(r, qty);
      else if (r) Object.assign(Sim.manualQual.find(x => x.id === r.id), { type: tp, at, qty, reasonId, upd: S.user.username });
      else Sim.manualQual.push({ id: uid('mq'), mid, at, type: tp, qty, reasonId, by: S.user.username });
      closeModal(); toast(r ? 'Quality history updated.' : 'Quality history added.', 'good'); refreshContent();
    },
  });
}

/* ==========================================================================
   ADMIN MODE
   ========================================================================== */
function adminHead(title, tools, sub = '') { return `<div class="page-head"><div><h1>${esc(title)}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div><div class="toolbar">${tools}</div></div>`; }
const btnAdd = (act, label = 'Add') => `<button class="btn primary" data-act="${act}">${ic('plus')}${label}</button>`;
const btnEx = arg => `<button class="btn" data-act="export" data-arg="${arg}">${ic('dl')}Export</button>`;
const btnIm = arg => `<button class="btn" data-act="import" data-arg="${arg}">${ic('ul')}Import</button>`;

/* ---------- asset ---------- */
function pAsset() {
  const ed = canEdit('asset'); const q = (S.search.asset || '').toLowerCase();
  const rows = [];
  const walk = (a, depth) => { if (!q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)) rows.push({ ...a, depth: q ? 0 : depth }); DB.kids(a.id).forEach(k => walk(k, depth + 1)); };
  DB.kids(null).forEach(a => walk(a, 0));
  EXPORTS.assets = () => exportCSV('Assets', ['Name', 'Asset Code', 'Parent Code', 'Is Machine', 'Ideal rate (pcs/h)'], DB.cfg.assets.map(a => [a.name, a.code, DB.asset(a.parentId)?.code || '', a.isMachine ? 'Y' : 'N', a.rate || '']));
  return adminHead('Asset Setting', `<input class="input" id="asset-search" placeholder="Search name or code" value="${esc(S.search.asset || '')}" style="width:220px" aria-label="Search assets">${btnEx('assets')}${ed ? btnIm('assets') + btnAdd('asset-add') : ''}`, `${DB.cfg.assets.filter(a => a.isMachine).length} machines · ${DB.cfg.assets.length} assets`) +
    `<div class="card">${table('assets', [
      { h: 'Name', f: a => `<span class="indent" style="width:${a.depth * 18}px"></span>${ed ? `<button class="link" data-act="asset-edit" data-arg="${a.id}">${esc(a.name)}</button>` : esc(a.name)} ${a.isMachine ? pill('good', 'Machine') : ''}` },
      { h: 'Asset Code', f: a => `<span class="mono">${esc(a.code)}</span>` }, { h: 'Ideal rate', cls: 'num', f: a => a.isMachine ? `${fmtNum(a.rate)} pcs/h` : '' },
      { h: 'Add child', f: a => ed && !a.isMachine ? `<button class="link" data-act="asset-add" data-arg="${a.id}">Add child</button>` : '' },
      ...auditCols, { h: '', cls: 'num', f: a => ed && a.parentId ? `<button class="btn sm danger" data-act="asset-del" data-arg="${a.id}" aria-label="Delete ${esc(a.name)}">${ic('trash')}</button>` : '' }], rows, { pageSize: 25 })}</div>`;
}
function assetForm(a, parentId) {
  const parents = DB.cfg.assets.filter(x => !x.isMachine && x.id !== a?.id && !(a && DB.isUnder(x.id, a.id)));
  const isM = a ? a.isMachine : !!parentId && DB.kids(parentId).some(k => k.isMachine);
  openModal({
    title: a ? 'Edit Asset' : 'New Asset',
    body: row('Name', `<input class="input" id="fa-name" value="${esc(a?.name || '')}">`, 'fa-name', true) +
      row('Asset Code', `<input class="input mono" id="fa-code" value="${esc(a?.code || '')}" placeholder="e.g. 001_2_1_3_m">`, 'fa-code', true) +
      row('Parent', `<select class="input" id="fa-parent" ${a && !a.parentId ? 'disabled' : ''}><option value="">Please select parent asset</option>${parents.map(p => `<option value="${p.id}" ${(a?.parentId || parentId) === p.id ? 'selected' : ''}>${esc(DB.path(p.id))}</option>`).join('')}</select>`, 'fa-parent', !!a?.parentId || !a) +
      row('Is Machine', `<button type="button" class="switch" role="switch" id="fa-machine" aria-checked="${isM}" data-act="switch" ${a && DB.kids(a.id).length ? 'disabled' : ''}></button>`) +
      row('Ideal rate (pcs/h)', `<input class="input" type="number" min="1" id="fa-rate" value="${a?.rate || 200}">`, 'fa-rate'),
    onSave: () => {
      const name = fv('fa-name'), code = fv('fa-code'), parentId2 = a && !a.parentId ? null : fv('fa-parent'), isMachine = document.getElementById('fa-machine').getAttribute('aria-checked') === 'true', rate = Number(fv('fa-rate'));
      let ok = setErr('fa-name', name ? '' : 'Name is required.');
      ok = setErr('fa-code', !code ? 'Asset Code is required.' : DB.cfg.assets.some(x => x.code === code && x.id !== a?.id) ? 'This Asset Code is already used. Codes must be unique.' : '') && ok;
      ok = setErr('fa-parent', a && !a.parentId ? '' : parentId2 ? '' : 'Choose a parent (plant or line).') && ok;
      ok = setErr('fa-rate', !isMachine || rate > 0 ? '' : 'Ideal rate must be above 0.') && ok;
      if (!ok) return;
      if (a) { Object.assign(a, { name, code, parentId: parentId2 ?? a.parentId, isMachine, rate: isMachine ? rate : undefined }); stamp(a); }
      else { const n = stamp({ id: uid('as'), name, code, parentId: parentId2, isMachine, rate: isMachine ? rate : undefined, uom: 'ea' }, true); DB.cfg.assets.push(n); }
      DB.save(); DB.cfg.assets.filter(x => x.isMachine).forEach(m => Sim.ensure(m));
      closeModal(); toast(a ? `Saved ${esc(name)}.` : `Created ${esc(name)}.`, 'good'); render();
    },
  });
}
function importDialog(kind) {
  const spec = {
    assets: { title: 'Import Asset', head: ['Name', 'Asset Code', 'Parent Code', 'Is Machine', 'Ideal rate (pcs/h)'], sample: [['Station 11', '001_1_1_2_4_m', '001_1_1_2', 'Y', '220']] },
    reasons: { title: 'Import Reason', head: ['Reason Name', 'Reason Code', 'Section', 'Status', 'Repair'], sample: [['Material shortage', 'MS01', 'availability', 'warning', 'N']] },
    jobs: { title: 'Import Job', head: ['Job Name', 'Machine Code', 'Target', 'Formula Name', 'Ideal qty per hour', 'Start', 'End', 'Type'], sample: [['PO-EXTRA-01', '001_2_1_m', '2880', 'Final Assembly std', '180', fmtDT(startOfDay(Date.now()) + DAY + 6 * HOUR), fmtDT(startOfDay(Date.now()) + DAY + 22 * HOUR), 'auto']] },
  }[kind];
  openModal({
    title: spec.title, wide: true,
    body: `<div class="import-drop">${ic('ul').replace('<svg', '<svg style="width:28px;height:28px"')}<span>Choose a CSV file saved from the template (Excel → Save As → CSV UTF-8).</span>
        <div class="inline"><button type="button" class="btn" data-act="tpl" data-arg="${kind}">${ic('dl')}Download Template</button><label class="btn">${ic('ul')}Choose file<input type="file" id="imp-file" accept=".csv,text/csv" hidden></label></div></div>
      <div id="imp-preview"></div>`,
    foot: `<button class="btn" data-act="modal-close" type="button">Cancel</button><button class="btn primary" data-act="imp-go" type="button" disabled id="imp-go">Import</button>`,
    onOpen: ov => {
      ov.querySelector('#imp-file').addEventListener('change', async e => {
        const file = e.target.files[0]; if (!file) return;
        const rows = parseCSV(await file.text()).filter(r => r.some(Boolean));
        const body = rows[0] && rows[0][0] === spec.head[0] ? rows.slice(1) : rows;
        MODAL.importRows = body.map(r => importCheck(kind, r));
        const ok = MODAL.importRows.filter(r => r.result !== 'Failed').length;
        document.getElementById('imp-preview').innerHTML = `<div class="table-wrap"><table><thead><tr><th>Import Result</th>${spec.head.map(h => `<th>${esc(h)}</th>`).join('')}<th>Error Reason</th></tr></thead><tbody>${MODAL.importRows.map(r => `<tr><td>${pill(r.result === 'Failed' ? 'crit' : r.result === 'Updated' ? 'warn' : 'good', r.result)}</td>${spec.head.map((_, i) => `<td>${esc(r.cells[i] || '')}</td>`).join('')}<td style="color:var(--crit)">${esc(r.error || '')}</td></tr>`).join('')}</tbody></table></div><p style="margin:8px 0 0;color:var(--muted);font-size:12.5px">Ready: ${ok} of ${MODAL.importRows.length} items. Failed rows are skipped.</p>`;
        document.getElementById('imp-go').disabled = !ok;
      });
    },
  });
  MODAL.importKind = kind; MODAL.importSpec = spec;
}
function importCheck(kind, c) {
  const res = (result, error, apply) => ({ cells: c, result, error, apply });
  if (kind === 'assets') {
    const [name, code, pcode, ism, rate] = c;
    if (!name || !code) return res('Failed', 'Name and Asset Code are required.');
    const parent = DB.cfg.assets.find(a => a.code === pcode || a.name === pcode);
    if (!parent) return res('Failed', `No parent asset with code "${pcode}".`);
    if (parent.isMachine) return res('Failed', 'A machine cannot be a parent.');
    const ex = DB.cfg.assets.find(a => a.code === code);
    const data = { name, code, parentId: parent.id, isMachine: /^y|true|1/i.test(ism || ''), rate: Number(rate) || 200 };
    return ex ? res('Updated', '', () => Object.assign(stamp(ex), data)) : res('Created', '', () => DB.cfg.assets.push(stamp({ id: uid('as'), uom: 'ea', ...data }, true)));
  }
  if (kind === 'reasons') {
    const [name, code, section, status, repair] = c;
    if (!name || !code) return res('Failed', 'Reason Name and Reason Code are required.');
    if (!['availability', 'quality'].includes(section)) return res('Failed', 'Section must be availability or quality.');
    const okStatus = section === 'availability' ? ['warning', 'critical'] : ['bad'];
    if (!okStatus.includes(status)) return res('Failed', `Status must be ${okStatus.join(' or ')}.`);
    const ex = DB.cfg.reasons.find(r => r.code === code && r.section === section);
    const data = { name, code, section, status, repair: /^y|true|1/i.test(repair || '') };
    return ex ? res('Updated', '', () => Object.assign(stamp(ex), data)) : res('Created', '', () => DB.cfg.reasons.push(stamp({ id: uid('r'), ...data }, true)));
  }
  const [name, mcode, target, formula, qty, s, e, type] = c;
  const m = DB.cfg.assets.find(a => a.code === mcode && a.isMachine);
  if (!name) return res('Failed', 'Job Name is required.');
  if (!m) return res('Failed', `No machine with code "${mcode}".`);
  const st = new Date(s.replace(' ', 'T')).getTime(), en = new Date(e.replace(' ', 'T')).getTime();
  if (!isFinite(st) || !isFinite(en) || en <= st) return res('Failed', 'Start and End must be valid and End after Start.');
  const ex = DB.cfg.jobs.find(j => j.name === name);
  const data = { name, machines: [m.id], finishGood: m.id, target: Number(target) || 0, formula: formula || 'Demo', idealQty: Number(qty) || m.rate, idealPer: 1, idealUnit: 'hour', start: st, end: en, type: type === 'manual' ? 'manual' : 'auto', priority: 'normal', cavity: 1 };
  return ex ? res('Updated', '', () => Object.assign(stamp(ex), data)) : res('Created', '', () => DB.cfg.jobs.push(stamp({ id: uid('j'), ...data }, true)));
}

/* ---------- role ---------- */
function pRole() {
  const ed = canEdit('role'); const rows = [];
  DB.cfg.roles.filter(r => !r.parentId).forEach(p => { rows.push({ ...p, depth: 0 }); DB.cfg.roles.filter(c => c.parentId === p.id).forEach(c => rows.push({ ...c, depth: 1 })); });
  EXPORTS.roles = () => exportCSV('Roles', ['Name', 'Parent', 'Users', ...MENU_KEYS.flatMap(g => g.items.map(i => i.label))], DB.cfg.roles.map(r => [r.name, DB.cfg.roles.find(p => p.id === r.parentId)?.name || '', DB.cfg.users.filter(u => u.roleId === r.id).length, ...MENU_KEYS.flatMap(g => g.items.map(i => r.parentId ? '' : r.superAdmin ? 'edit' : r.menu[i.key] || 'deny'))]));
  return adminHead('Role Setting', `${btnEx('roles')}${ed ? btnAdd('role-add', 'Add Parent') : ''}`, 'Parent roles set which menus a person can use. Child roles set which assets they can see or edit.') +
    `<div class="card">${table('roles', [
      { h: 'Name', f: r => `<span class="indent" style="width:${r.depth * 22}px"></span>${ed && !r.superAdmin ? `<button class="link" data-act="role-edit" data-arg="${r.id}">${esc(r.name)}</button>` : `<b>${esc(r.name)}</b>`} ${r.superAdmin ? pill('good', 'Super Admin') : r.parentId ? pill('idle', 'Asset access') : pill('accent', 'Menu access')}` },
      { h: 'Users', cls: 'num', f: r => DB.cfg.users.filter(u => u.roleId === r.id).length || '' },
      { h: 'Add child', f: r => ed && !r.parentId && !r.superAdmin ? `<button class="link" data-act="role-child" data-arg="${r.id}">Add child</button>` : '' },
      ...auditCols, { h: '', cls: 'num', f: r => ed && !r.superAdmin ? `<button class="btn sm danger" data-act="role-del" data-arg="${r.id}" aria-label="Delete role">${ic('trash')}</button>` : '' }], rows, { pageSize: 20 })}</div>`;
}
function radio3(name, val, allowInherit) {
  return `${allowInherit ? `<td><input type="radio" name="${name}" value="" ${!val ? 'checked' : ''} aria-label="inherit"></td>` : ''}${['deny', 'view', 'edit'].map(v => `<td><input type="radio" name="${name}" value="${v}" ${val === v ? 'checked' : ''} aria-label="${v}"></td>`).join('')}`;
}
function roleParentForm(r) {
  openModal({
    title: r ? 'Edit Parent Role' : 'New Parent Role', wide: true,
    body: row('Name', `<input class="input" id="fr-name" value="${esc(r?.name || '')}">`, 'fr-name', true) +
      `<div class="table-wrap"><table class="matrix"><thead><tr><th>Menu Access</th><th>deny</th><th>view</th><th>edit</th></tr></thead><tbody>
      ${MENU_KEYS.map(g => `<tr class="grp"><td colspan="4">${g.group}</td></tr>` + g.items.map(i => `<tr><td>${i.label}</td>${radio3('m-' + i.key, r?.menu?.[i.key] || 'deny')}</tr>`).join('')).join('')}</tbody></table></div>`,
    onSave: () => {
      const name = fv('fr-name'); if (!setErr('fr-name', name ? (DB.cfg.roles.some(x => x.name === name && x.id !== r?.id) ? 'A role with this name exists.' : '') : 'Name is required.')) return;
      const menu = {}; MENU_KEYS.forEach(g => g.items.forEach(i => menu[i.key] = document.querySelector(`input[name="m-${i.key}"]:checked`)?.value || 'deny'));
      if (r) Object.assign(stamp(r), { name, menu }); else DB.cfg.roles.push(stamp({ id: uid('ro'), name, parentId: null, menu, assets: {} }, true));
      DB.save(); closeModal(); toast('Role saved.', 'good'); render();
    },
  });
}
function roleChildForm(r, parentId) {
  const parents = DB.cfg.roles.filter(x => !x.parentId && !x.superAdmin);
  const rowsA = []; const walk = (a, d) => { rowsA.push({ a, d }); DB.kids(a.id).forEach(k => walk(k, d + 1)); }; walk(DB.asset('p1'), 0);
  openModal({
    title: r ? 'Edit Role' : 'New Role', wide: true,
    body: row('Name', `<input class="input" id="fr-name" value="${esc(r?.name || '')}">`, 'fr-name', true) +
      row('Parent', `<select class="input" id="fr-parent">${parents.map(p => `<option value="${p.id}" ${(r?.parentId || parentId) === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`, 'fr-parent', true) +
      `<div class="table-wrap" style="max-height:360px;overflow:auto"><table class="matrix"><thead><tr><th>Asset Access</th><th>inherit</th><th>deny</th><th>view</th><th>edit</th></tr></thead><tbody>
      ${rowsA.map(({ a, d }) => `<tr><td><span class="indent" style="width:${d * 16}px"></span>${esc(a.name)}</td>${radio3('a-' + a.id, r?.assets?.[a.id] || (a.id === 'p1' && !r ? 'deny' : ''), a.id !== 'p1')}</tr>`).join('')}</tbody></table></div>
      <p style="margin:0;font-size:12px;color:var(--muted)">"inherit" takes the level of the nearest parent asset. Deny hides the asset, View shows it, Edit allows changes in Operation mode.</p>`,
    onSave: () => {
      const name = fv('fr-name'); if (!setErr('fr-name', name ? '' : 'Name is required.')) return;
      const assets = {}; rowsA.forEach(({ a }) => { const v = document.querySelector(`input[name="a-${a.id}"]:checked`)?.value; if (v) assets[a.id] = v; });
      const pid = fv('fr-parent');
      if (r) Object.assign(stamp(r), { name, parentId: pid, assets }); else DB.cfg.roles.push(stamp({ id: uid('ro'), name, parentId: pid, menu: {}, assets }, true));
      DB.save(); closeModal(); toast('Role saved.', 'good'); render();
    },
  });
}

/* ---------- user ---------- */
function pUser() {
  const ed = canEdit('user');
  EXPORTS.users = () => exportCSV('Users', ['Username', 'Role', 'Full Name', 'Email', 'Status'], DB.cfg.users.map(u => [u.username, DB.cfg.roles.find(r => r.id === u.roleId)?.name || '', u.fullName, u.email, u.active ? 'Active' : 'Inactive']));
  return adminHead('User Setting', btnEx('users'), `${DB.cfg.users.length} users · accounts are created in System Config; here you assign roles.`) +
    `<div class="card">${table('users', [{ h: 'Username', f: u => ed ? `<button class="link" data-act="user-edit" data-arg="${u.id}">${esc(u.username)}</button>` : esc(u.username) },
      { h: 'Role', f: u => esc(DB.cfg.roles.find(r => r.id === u.roleId)?.name || '–') }, { h: 'Full Name', f: u => esc(u.fullName) }, { h: 'Email', f: u => esc(u.email) },
      { h: 'Status', f: u => u.active ? pill('good', 'Active') : pill('idle', 'Inactive') }, ...auditCols], DB.cfg.users)}</div>`;
}
function userForm(u) {
  const roles = DB.cfg.roles.filter(r => r.parentId || r.superAdmin);
  openModal({
    title: 'Edit User',
    body: row('Username', `<input class="input" value="${esc(u.username)}" disabled>`) + row('Role', `<select class="input" id="fu-role">${roles.map(r => `<option value="${r.id}" ${u.roleId === r.id ? 'selected' : ''}>${esc(r.name)}${r.parentId ? ` (${esc(DB.cfg.roles.find(p => p.id === r.parentId)?.name)})` : ''}</option>`).join('')}</select>`, 'fu-role', true) +
      row('Full Name', `<input class="input" value="${esc(u.fullName)}" disabled>`) + row('Email', `<input class="input" value="${esc(u.email)}" disabled>`) +
      row('Active', `<button type="button" class="switch" role="switch" id="fu-active" aria-checked="${u.active}" data-act="switch" ${u.id === S.user.id ? 'disabled' : ''}></button>`),
    onSave: () => { Object.assign(stamp(u), { roleId: fv('fu-role'), active: document.getElementById('fu-active').getAttribute('aria-checked') === 'true' }); DB.save(); closeModal(); toast(`Saved ${esc(u.username)}.`, 'good'); render(); },
  });
}

/* ---------- plan production ---------- */
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function pPlan() {
  const ed = canEdit('plan_production');
  const a = DB.asset(S.planAsset) || DB.asset('p1'); const owner = planOwner(a.id); const plan = DB.cfg.plans[owner];
  const m0 = new Date(S.planMonth); m0.setDate(1); const first = m0.getTime();
  const startCell = first - m0.getDay() * DAY; const month = m0.getMonth();
  let cells = '';
  for (let i = 0; i < 42; i++) {
    const d = startOfDay(startCell + i * DAY + 2 * HOUR); const dd = new Date(d);
    const ov = plan.overrides[fmtDate(d)]; const list = ov ?? plan.week[dd.getDay()] ?? [];
    cells += `<button class="${dd.getMonth() !== month ? 'out' : ''} ${d === startOfDay(Date.now()) ? 'today' : ''} ${ov ? 'ovr' : ''}" data-act="${ed ? 'plan-day' : 'noop'}" data-arg="${d}" aria-label="${fmtDate(d)}${ov ? ' override' : ''}"><span class="d">${dd.getDate()}</span>${list.slice(0, 3).map(r => `<span class="r"><span class="dot ${ov ? 'warn' : 'good'}"></span>${r.s}–${r.e}</span>`).join('')}${list.length ? '' : '<span class="r">no plan</span>'}</button>`;
  }
  const treeRows = []; const walk = (x, d) => { treeRows.push(`<button class="tree-node ${x.id === a.id ? 'sel' : ''}" style="padding-left:${8 + d * 13}px" data-act="plan-asset" data-arg="${x.id}"><span class="nm">${esc(x.name)}</span>${DB.cfg.plans[x.id] ? '<span class="dot accent" style="background:var(--accent)" title="Has its own plan"></span>' : ''}</button>`); DB.kids(x.id).forEach(k => walk(k, d + 1)); }; walk(DB.asset('p1'), 0);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const draft = S.planDraft && S.planDraft.asset === a.id ? S.planDraft.week : JSON.parse(JSON.stringify(plan.week));
  S.planDraft = { asset: a.id, week: draft };
  const order = [1, 2, 3, 4, 5, 6, 0];
  return adminHead(`Plan Production · ${a.name} (${a.code})`, '', owner === a.id ? 'This asset has its own plan.' : `Inherits the plan of <b>${esc(DB.asset(owner).name)}</b>. Saving here creates a plan for this asset.`) +
    `<div class="grid plan-grid"><div class="card" style="padding:12px;max-height:760px;overflow:auto">${treeRows.join('')}</div>
    <div class="grid"><div class="card"><div class="card-head"><h3>Calendar <span class="hint" style="margin-left:6px"><span class="dot good"></span> Normal <span class="dot warn" style="margin-left:8px"></span> Override</span></h3>
      <div class="toolbar"><button class="btn sm" data-act="plan-month" data-arg="-1">Previous month</button><button class="btn sm" data-act="plan-month" data-arg="1">Next month</button>
      <select class="input" id="plan-m" style="width:auto" aria-label="Month">${months.map((x, i) => `<option value="${i}" ${i === month ? 'selected' : ''}>${x}</option>`).join('')}</select>
      <select class="input" id="plan-y" style="width:auto" aria-label="Year">${[-1, 0, 1].map(o => { const y = new Date().getFullYear() + o; return `<option ${y === m0.getFullYear() ? 'selected' : ''}>${y}</option>`; }).join('')}</select></div></div>
      <div class="cal">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(x => `<div class="dow">${x}</div>`).join('')}${cells}</div></div>
    <div class="card"><div class="card-head"><h3>Normal Shift</h3>${ed ? `<button class="btn primary" data-act="plan-save">${ic('check')}Save normal shift</button>` : ''}</div>
      <div class="shift-grid">${order.map(d => `<div class="shift-day"><div class="hd"><span>${DOW[d]}</span>${ed ? `<span class="toolbar"><button class="btn sm" data-act="plan-copy" data-arg="${d}">Copy</button><button class="btn sm" data-act="plan-paste" data-arg="${d}" ${S.clip ? '' : 'disabled'}>Paste</button></span>` : ''}</div>
        ${(draft[d] || []).map((r, i) => `<div class="range-row"><input class="input" type="time" value="${r.s}" data-plan="${d}:${i}:s" aria-label="${DOW[d]} start" ${ed ? '' : 'disabled'}><span>→</span><input class="input" type="time" value="${r.e}" data-plan="${d}:${i}:e" aria-label="${DOW[d]} end" ${ed ? '' : 'disabled'}>${ed ? `<button class="btn icon" data-act="plan-rm" data-arg="${d}:${i}" aria-label="Remove range">${ic('x')}</button>` : ''}</div>`).join('') || '<span style="color:var(--muted);font-size:12.5px">No production planned.</span>'}
        ${ed ? `<button class="btn sm" data-act="plan-addr" data-arg="${d}">${ic('plus')}Add Plan</button>` : ''}</div>`).join('')}</div></div></div></div>`;
}
function rangesEditor(list) {
  return `<div id="ovr-list" style="display:grid;gap:8px">${list.map((r, i) => `<div class="range-row"><input class="input" type="time" value="${r.s}" data-ovr="${i}:s" aria-label="Start"><span>→</span><input class="input" type="time" value="${r.e}" data-ovr="${i}:e" aria-label="End"><button type="button" class="btn icon" data-act="ovr-rm" data-arg="${i}" aria-label="Remove">${ic('x')}</button></div>`).join('') || '<span style="color:var(--muted)">No production on this day.</span>'}</div>`;
}
function overrideForm(d) {
  const a = DB.asset(S.planAsset); const owner = planOwner(a.id); const plan = DB.cfg.plans[owner];
  const date = fmtDate(d); const list = JSON.parse(JSON.stringify(plan.overrides[date] ?? plan.week[new Date(d).getDay()] ?? []));
  const draw = () => { document.getElementById('ovr-wrap').innerHTML = rangesEditor(MODAL.ovr); };
  openModal({
    title: 'Override plan',
    body: `<div class="inline" style="justify-content:space-between"><b class="mono">${date}</b><span class="toolbar"><button type="button" class="btn sm" data-act="ovr-copy">Copy</button><button type="button" class="btn sm" data-act="ovr-paste" ${S.clip ? '' : 'disabled'}>Paste</button></span></div>
      <div id="ovr-wrap">${rangesEditor(list)}</div>
      <div class="inline"><button type="button" class="btn" data-act="ovr-add">${ic('plus')}Add Plan</button><button type="button" class="btn" data-act="ovr-sort">Auto sort</button>${plan.overrides[date] ? `<button type="button" class="btn danger" data-act="ovr-clear">Use normal shift</button>` : ''}</div>`,
    foot: `<button class="btn" data-act="modal-close" type="button">Cancel</button><button class="btn" data-act="ovr-save" data-arg="children" type="button">Save to children</button><button class="btn primary" data-act="ovr-save" type="button">Save</button>`,
  });
  Object.assign(MODAL, { ovr: list, ovrDate: date, draw, ownerFor: a.id });
}
function readOvr() { document.querySelectorAll('[data-ovr]').forEach(inp => { const [i, k] = inp.dataset.ovr.split(':'); MODAL.ovr[i][k] = inp.value; }); }
function validRanges(list) { return list.every(r => r.s && r.e && hm2ms(r.e) > hm2ms(r.s)); }
function ensurePlan(aid) { if (!DB.cfg.plans[aid]) { const src = DB.cfg.plans[planOwner(aid)]; DB.cfg.plans[aid] = JSON.parse(JSON.stringify(src)); } return DB.cfg.plans[aid]; }

/* ---------- reason ---------- */
function pReason() {
  const ed = canEdit('reason');
  const tbl = section => table('reason-' + section, [
    { h: 'Reason Name', f: r => ed ? `<button class="link" data-act="reason-edit" data-arg="${r.id}">${esc(r.name)}</button>` : esc(r.name) }, { h: 'Reason Code', f: r => `<span class="mono">${esc(r.code)}</span>` },
    { h: 'Section', f: r => esc(r.section) }, { h: 'Status', f: r => sevPill(r.status) }, { h: 'Repair', f: r => r.repair ? pill('warn', 'Repair') : '' }, ...auditCols,
    { h: '', cls: 'num', f: r => ed ? `<button class="btn sm danger" data-act="reason-del" data-arg="${r.id}" aria-label="Delete reason">${ic('trash')}</button>` : '' }], DB.reasons(section));
  EXPORTS.reasons = () => exportCSV('Reasons', ['Reason Name', 'Reason Code', 'Section', 'Status', 'Repair'], DB.cfg.reasons.map(r => [r.name, r.code, r.section, r.status, r.repair ? 'Y' : 'N']));
  return adminHead('Reason Setting', `${btnEx('reasons')}${ed ? btnIm('reasons') : ''}`, 'Reasons explain lost time (Availability) and bad parts (Quality). Status decides the alarm colour.') +
    `<div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Availability Reason Setting</h3>${ed ? btnAdd('reason-add" data-arg="availability') : ''}</div>${tbl('availability')}</div>
     <div class="card"><div class="card-head"><h3>Quality Reason Setting</h3>${ed ? btnAdd('reason-add" data-arg="quality') : ''}</div>${tbl('quality')}</div>`;
}
function reasonForm(r, section) {
  section = r?.section || section;
  const statuses = section === 'availability' ? ['warning', 'critical'] : ['bad'];
  openModal({
    title: r ? 'Edit Reason' : 'New Reason',
    body: row('Reason Name', `<input class="input" id="fn-name" value="${esc(r?.name || '')}">`, 'fn-name', true) + row('Reason Code', `<input class="input mono" id="fn-code" value="${esc(r?.code || '')}">`, 'fn-code', true) +
      row('Section', `<select class="input" disabled><option>${section}</option></select>`, '', true) +
      row('Status', `<select class="input" id="fn-status"><option value="">Select status</option>${statuses.map(s => `<option value="${s}" ${r?.status === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select>`, 'fn-status', true) +
      row('Repair', `<button type="button" class="switch" role="switch" id="fn-repair" aria-checked="${!!r?.repair}" data-act="switch"></button>`),
    onSave: () => {
      const name = fv('fn-name'), code = fv('fn-code'), status = fv('fn-status');
      let ok = setErr('fn-name', name ? '' : 'Reason Name is required.');
      ok = setErr('fn-code', !code ? 'Reason Code is required.' : DB.cfg.reasons.some(x => x.code === code && x.section === section && x.id !== r?.id) ? 'This code is already used in this section.' : '') && ok;
      ok = setErr('fn-status', status ? '' : 'Choose a status.') && ok;
      if (!ok) return;
      const data = { name, code, status, section, repair: document.getElementById('fn-repair').getAttribute('aria-checked') === 'true' };
      if (r) Object.assign(stamp(r), data); else DB.cfg.reasons.push(stamp({ id: uid('r'), ...data }, true));
      DB.save(); closeModal(); toast('Reason saved.', 'good'); render();
    },
  });
}

/* ---------- job ---------- */
function pJob() {
  const ed = canEdit('job'); const q = (S.search.job || '').toLowerCase();
  const rows = DB.cfg.jobs.filter(j => !q || j.name.toLowerCase().includes(q) || j.machines.some(id => DB.asset(id)?.name.toLowerCase().includes(q))).sort((a, b) => b.start - a.start);
  const sel = S.sel.jobs || new Set();
  EXPORTS.jobs = () => exportCSV('Jobs', ['Job Name', 'Machine Code', 'Target', 'Formula Name', 'Ideal qty per hour', 'Start', 'End', 'Type'], DB.cfg.jobs.map(j => [j.name, DB.asset(j.machines[0])?.code, j.target, j.formula, j.idealQty / ({ second: 1, minute: 60, hour: 3600 }[j.idealUnit] * j.idealPer) * 3600, fmtDT(j.start), fmtDT(j.end), j.type]));
  return adminHead('Job Setting', `<input class="input" id="job-search" placeholder="Search job or machine" value="${esc(S.search.job || '')}" style="width:220px" aria-label="Search jobs">${btnEx('jobs')}${ed ? btnIm('jobs') : ''}${ed && sel.size ? `<button class="btn danger" data-act="job-del">${ic('trash')}Delete (${sel.size})</button>` : ''}${ed ? btnAdd('job-add') : ''}`) +
    `<div class="card">${table('jobs', [
      { h: 'Job Name', f: j => ed ? `<button class="link" data-act="job-edit" data-arg="${j.id}">${esc(j.name)}</button>` : esc(j.name) }, { h: 'Machines', f: j => esc(j.machines.map(id => DB.asset(id)?.name).join(', ')) },
      { h: 'Target', cls: 'num', f: j => fmtNum(j.target) }, { h: 'Formula Name', f: j => esc(j.formula) }, { h: 'Priority', f: j => j.priority === 'high' ? pill('warn', 'High') : pill('idle', j.priority) },
      { h: 'Job Type', f: j => pill('accent', j.type) }, { h: 'Job Schedule', f: j => `<span class="mono">${fmtDT(j.start)} – ${fmtDT(j.end)}</span>` }, ...auditCols], rows, { select: ed })}</div>`;
}
function jobForm(j) {
  const ms = DB.cfg.assets.filter(a => a.isMachine);
  const sel = j?.machines || [];
  openModal({
    title: j ? 'Edit Job' : 'New Job', wide: true,
    body: row('Job Name', `<input class="input" id="fj-name" value="${esc(j?.name || '')}">`, 'fj-name', true) +
      row('Target', `<input class="input" type="number" min="1" id="fj-target" value="${j?.target ?? ''}">`, 'fj-target', true) +
      row('Formula Name', `<input class="input" id="fj-formula" list="formulas" value="${esc(j?.formula || '')}"><datalist id="formulas">${[...new Set(DB.cfg.jobs.map(x => x.formula))].slice(0, 30).map(x => `<option value="${esc(x)}">`).join('')}</datalist>`, 'fj-formula', true) +
      row('Ideal Cycle Time', `<div class="inline"><input class="input" type="number" min="0.01" step="any" id="fj-iq" value="${j?.idealQty ?? ''}" style="width:110px" aria-label="Units"><span>unit per</span><input class="input" type="number" min="1" id="fj-ip" value="${j?.idealPer ?? 1}" style="width:80px" aria-label="Per"><select class="input" id="fj-iu" style="width:auto" aria-label="Time unit">${['second', 'minute', 'hour'].map(u => `<option ${(j?.idealUnit || 'hour') === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>`, 'fj-iq', true) +
      row('Machines', `<select class="input" id="fj-machines" multiple size="6">${ms.map(m => `<option value="${m.id}" ${sel.includes(m.id) ? 'selected' : ''}>${esc(m.name)} (${esc(m.code)})</option>`).join('')}</select>`, 'fj-machines', true) +
      row('Finish Good Machine', `<select class="input" id="fj-fg">${ms.map(m => `<option value="${m.id}" ${j?.finishGood === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>`, 'fj-fg') +
      row('Priority', `<select class="input" id="fj-pr">${['high', 'normal', 'low'].map(p => `<option ${(j?.priority || 'normal') === p ? 'selected' : ''}>${p}</option>`).join('')}</select>`, '', true) +
      row('Type', `<div class="radio-group"><label><input type="radio" name="fj-type" value="auto" ${(j?.type || 'auto') === 'auto' ? 'checked' : ''}>auto</label><label><input type="radio" name="fj-type" value="manual" ${j?.type === 'manual' ? 'checked' : ''}>manual</label></div>`) +
      row('Job Schedule', `<div class="inline"><input class="input" type="datetime-local" id="fj-s" value="${toLocalInput(j?.start ?? startOfDay(Date.now()) + DAY + 6 * HOUR)}" style="width:auto" aria-label="Start"><span>→</span><input class="input" type="datetime-local" id="fj-e" value="${toLocalInput(j?.end ?? startOfDay(Date.now()) + DAY + 22 * HOUR)}" style="width:auto" aria-label="End"></div>`, 'fj-s', true) +
      row('Cavity', `<input class="input" type="number" min="1" id="fj-cav" value="${j?.cavity ?? 1}" style="width:110px">`, 'fj-cav') +
      row('Product Picture', `<input class="input" type="file" accept="image/*" id="fj-pic">`) +
      `<p style="margin:0;font-size:12px;color:var(--muted)">auto starts the job at its scheduled time. manual waits for an operator to start it. Cavity is the number of pieces each machine signal stands for.</p>`,
    onSave: () => {
      const name = fv('fj-name'), target = Number(fv('fj-target')), formula = fv('fj-formula'), iq = Number(fv('fj-iq')), ip = Number(fv('fj-ip')) || 1, iu = fv('fj-iu');
      const machines = [...document.getElementById('fj-machines').selectedOptions].map(o => o.value);
      const st = new Date(fv('fj-s')).getTime(), en = new Date(fv('fj-e')).getTime(), cav = Math.max(1, parseInt(fv('fj-cav'), 10) || 1);
      let fg = fv('fj-fg'); if (!machines.includes(fg)) fg = machines[machines.length - 1];
      let ok = setErr('fj-name', name ? (DB.cfg.jobs.some(x => x.name === name && x.id !== j?.id) ? 'Another job already has this name.' : '') : 'Job Name is required.');
      ok = setErr('fj-target', target > 0 ? '' : 'Target must be above 0.') && ok;
      ok = setErr('fj-formula', formula ? '' : 'Formula Name is required.') && ok;
      ok = setErr('fj-iq', iq > 0 ? '' : 'Enter how many units the machine makes per time unit.') && ok;
      ok = setErr('fj-machines', machines.length ? '' : 'Select at least one machine.') && ok;
      ok = setErr('fj-s', isFinite(st) && isFinite(en) && en > st ? '' : 'End must be after Start.') && ok;
      if (!ok) return;
      const data = { name, target, formula, idealQty: iq, idealPer: ip, idealUnit: iu, machines, finishGood: fg, priority: fv('fj-pr'), type: document.querySelector('input[name=fj-type]:checked').value, start: st, end: en, cavity: cav };
      if (j) Object.assign(stamp(j), data); else DB.cfg.jobs.push(stamp({ id: uid('j'), ...data }, true));
      DB.save(); closeModal(); toast(`Job ${esc(name)} saved.`, 'good'); render();
    },
  });
}

/* ---------- alarm setup ---------- */
function pAlarmSetup() {
  const ed = canEdit('alarm_setup'); const sel = S.sel.rules || new Set();
  const rn = ids => ids.map(id => DB.reason(id)?.name).filter(Boolean).join(', ');
  EXPORTS.rules = () => exportCSV('Alarm_Setting', ['Alarm Name', 'Severity', 'Type', 'Asset Name', 'A Target', 'P Target', 'Q Target', 'A Reasons', 'Q Reasons', 'Send Email', 'Email List', 'Send Line', 'Line List'], DB.cfg.alarmRules.map(r => [r.name, r.severity, r.type, DB.asset(r.assetId)?.name, r.aTarget ?? '', r.pTarget ?? '', r.qTarget ?? '', rn(r.aReasons), rn(r.qReasons), r.sendEmail ? 'Y' : 'N', r.emails.join(' '), r.sendLine ? 'Y' : 'N', r.lines.map(id => DB.cfg.lineNotify.find(l => l.id === id)?.name).join(' ')]));
  return adminHead('Alarm Setting', `${btnEx('rules')}${ed && sel.size ? `<button class="btn danger" data-act="rule-del">${ic('trash')}Delete (${sel.size})</button>` : ''}${ed ? btnAdd('rule-add') : ''}`, 'An alarm fires when a selected reason happens, or when today’s A, P or Q drops below its target.') +
    `<div class="card">${table('rules', [
      { h: 'Alarm Name', f: r => ed ? `<button class="link" data-act="rule-edit" data-arg="${r.id}">${esc(r.name)}</button>` : esc(r.name) }, { h: 'Severity', f: r => sevPill(r.severity) }, { h: 'Type', f: r => esc(r.type) },
      { h: 'Asset Name', f: r => esc(DB.asset(r.assetId)?.name || '–') }, { h: 'A Target', cls: 'num', f: r => r.aTarget ? r.aTarget + '%' : '' }, { h: 'P Target', cls: 'num', f: r => r.pTarget ? r.pTarget + '%' : '' }, { h: 'Q Target', cls: 'num', f: r => r.qTarget ? r.qTarget + '%' : '' },
      { h: 'A Reasons', f: r => esc(rn(r.aReasons)) }, { h: 'Q Reasons', f: r => esc(rn(r.qReasons)) },
      { h: 'Send Email', f: r => r.sendEmail ? pill('good', 'Yes') : '' }, { h: 'Email List', f: r => esc(r.emails.join(', ')) }, { h: 'Send Line', f: r => r.sendLine ? pill('good', 'Yes') : '' },
      { h: 'Line List', f: r => esc(r.lines.map(id => DB.cfg.lineNotify.find(l => l.id === id)?.name).join(', ')) }, ...auditCols], DB.cfg.alarmRules, { select: ed })}</div>`;
}
function ruleForm(r) {
  const opts = (sec, chosen) => DB.reasons(sec).map(x => `<option value="${x.id}" ${chosen?.includes(x.id) ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  openModal({
    title: r ? 'Edit Alarm' : 'New Alarm', wide: true,
    body: row('Alarm Name', `<input class="input" id="fl-name" value="${esc(r?.name || '')}">`, 'fl-name', true) +
      row('Severity', `<select class="input" id="fl-sev"><option value="">Select severity</option>${['warning', 'critical'].map(s => `<option ${r?.severity === s ? 'selected' : ''}>${s}</option>`).join('')}</select>`, 'fl-sev', true) +
      row('Type', `<div class="radio-group"><label><input type="radio" name="fl-type" value="job" ${r?.type === 'job' ? 'checked' : ''}>job</label><label><input type="radio" name="fl-type" value="machine" ${r?.type !== 'job' ? 'checked' : ''}>machine</label></div>`) +
      row('Asset Name', `<select class="input" id="fl-asset"><option value="">Please select asset</option>${DB.cfg.assets.map(a => `<option value="${a.id}" ${r?.assetId === a.id ? 'selected' : ''}>${esc(DB.path(a.id))}</option>`).join('')}</select>`, 'fl-asset', true) +
      row('Availability target', `<div class="inline"><input class="input" type="number" min="0" max="100" id="fl-a" value="${r?.aTarget ?? ''}" style="width:100px"> %</div>`, 'fl-a') +
      row('Performance target', `<div class="inline"><input class="input" type="number" min="0" max="200" id="fl-p" value="${r?.pTarget ?? ''}" style="width:100px"> %</div>`, 'fl-p') +
      row('Quality target', `<div class="inline"><input class="input" type="number" min="0" max="100" id="fl-q" value="${r?.qTarget ?? ''}" style="width:100px"> %</div>`, 'fl-q') +
      row('Availability reasons', `<select class="input" id="fl-ar" multiple size="5">${opts('availability', r?.aReasons)}</select>`) +
      row('Quality reasons', `<select class="input" id="fl-qr" multiple size="4">${opts('quality', r?.qReasons)}</select>`, 'fl-qr') +
      row('Send email', `<button type="button" class="switch" role="switch" id="fl-se" aria-checked="${!!r?.sendEmail}" data-act="switch"></button>`) +
      row('Email', `<input class="input" id="fl-emails" placeholder="name@company.com, other@company.com" value="${esc(r?.emails.join(', ') || '')}">`, 'fl-emails') +
      row('Send line', `<button type="button" class="switch" role="switch" id="fl-sl" aria-checked="${!!r?.sendLine}" data-act="switch"></button>`) +
      row('Line', `<select class="input" id="fl-lines" multiple size="3">${DB.cfg.lineNotify.map(l => `<option value="${l.id}" ${r?.lines.includes(l.id) ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select>`, 'fl-lines'),
    onSave: () => {
      const num = id => fv(id) === '' ? null : Number(fv(id));
      const data = { name: fv('fl-name'), severity: fv('fl-sev'), type: document.querySelector('input[name=fl-type]:checked').value, assetId: fv('fl-asset'), aTarget: num('fl-a'), pTarget: num('fl-p'), qTarget: num('fl-q'),
        aReasons: [...document.getElementById('fl-ar').selectedOptions].map(o => o.value), qReasons: [...document.getElementById('fl-qr').selectedOptions].map(o => o.value),
        sendEmail: document.getElementById('fl-se').getAttribute('aria-checked') === 'true', emails: fv('fl-emails').split(/[,\s]+/).filter(Boolean),
        sendLine: document.getElementById('fl-sl').getAttribute('aria-checked') === 'true', lines: [...document.getElementById('fl-lines').selectedOptions].map(o => o.value) };
      let ok = setErr('fl-name', data.name ? '' : 'Alarm Name is required.');
      ok = setErr('fl-sev', data.severity ? '' : 'Choose a severity.') && ok;
      ok = setErr('fl-asset', data.assetId ? '' : 'Choose the asset to watch.') && ok;
      ok = setErr('fl-qr', data.aTarget != null || data.pTarget != null || data.qTarget != null || data.aReasons.length || data.qReasons.length ? '' : 'Set at least one target or reason, otherwise the alarm never fires.') && ok;
      ok = setErr('fl-emails', !data.sendEmail || (data.emails.length && data.emails.every(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))) ? '' : 'Enter valid email addresses, separated by commas.') && ok;
      ok = setErr('fl-lines', !data.sendLine || data.lines.length ? '' : 'Choose at least one Line Notify target.') && ok;
      if (!ok) return;
      if (r) Object.assign(stamp(r), data); else DB.cfg.alarmRules.push(stamp({ id: uid('al'), ...data }, true));
      DB.save(); closeModal(); toast('Alarm saved.', 'good'); render();
    },
  });
}

/* ---------- banner ---------- */
function pBanner() {
  const ed = canEdit('banner'); const list = S.bannerDraft || DB.cfg.banners;
  return adminHead('Banner Setting', `<button class="btn" data-act="banner-preview">Preview</button>${ed ? `<button class="btn" data-act="banner-order" ${S.bannerDraft ? '' : 'disabled'}>Save Order</button>${btnAdd('banner-add')}` : ''}`, 'Images rotate on the left side of the login page, in this order.') +
    `<div class="card">${table('banners', [
      { h: 'Sorting', f: b => ed ? `<div class="inline"><button class="btn icon" data-act="banner-move" data-arg="${b.id}" data-d="-1" aria-label="Move up">${ic('up')}</button><button class="btn icon" data-act="banner-move" data-arg="${b.id}" data-d="1" aria-label="Move down">${ic('down')}</button></div>` : '' },
      { h: 'Image', f: b => `<span style="display:block;width:120px;height:62px;border-radius:10px;box-shadow:var(--inset-sm);background:${b.img ? `center/cover url(${b.img})` : `linear-gradient(135deg,hsl(${b.hue} 60% 45%),hsl(${b.hue + 40} 60% 30%))`}"></span>` },
      { h: 'File Name', f: b => esc(b.fileName) }, ...auditCols, { h: 'Delete', cls: 'num', f: b => ed ? `<button class="btn sm danger" data-act="banner-del" data-arg="${b.id}">Delete</button>` : '' }], list)}</div>`;
}

/* ---------- line notify ---------- */
function pLineNotify() {
  const ed = canEdit('line_notify'); const sel = S.sel.lines || new Set();
  EXPORTS.lines = () => exportCSV('Line_Notify', ['Line Notify Name', 'User Name', 'Created Date', 'Updated Date'], DB.cfg.lineNotify.map(l => [l.name, l.username, fmtDT(l.createdAt), fmtDT(l.updatedAt)]));
  return adminHead('Line Notify List', `<button class="btn" data-act="test-email">${ic('msg')}Test Email</button>${btnEx('lines')}${ed && sel.size ? `<button class="btn danger" data-act="line-del">${ic('trash')}Delete (${sel.size})</button>` : ''}`,
    'Note for the new build: LINE Notify ended service on 31 March 2025. Plan to send through the LINE Messaging API or another channel.') +
    `<div class="card">${table('lines', [{ h: 'Line Notify Name', f: l => esc(l.name) }, { h: 'User Name', f: l => esc(l.username) },
      { h: 'Action', f: l => `<button class="btn sm" data-act="line-test" data-arg="${l.id}">Send Test</button>` }, { h: 'Created Date', f: l => `<span class="mono">${fmtDT(l.createdAt)}</span>` }, { h: 'Updated Date', f: l => `<span class="mono">${fmtDT(l.updatedAt)}</span>` }], DB.cfg.lineNotify, { select: ed })}</div>`;
}
function pAccessLog() {
  const rows = [...Sim.accessLog].reverse().map((r, i) => ({ id: 'l' + i, ...r }));
  EXPORTS.log = () => exportCSV('Access_Log', ['User Name', 'Type', 'Datetime'], rows.map(r => [r.username, r.type, fmtDT(r.at)]));
  return adminHead('Access Log', btnEx('log')) + `<div class="card">${table('log', [{ h: 'User Name', f: r => esc(r.username) }, { h: 'Type', f: r => pill(r.type === 'login' ? 'good' : 'idle', r.type) }, { h: 'Datetime', f: r => `<span class="mono">${fmtDT(r.at)}</span>` }], rows)}</div>`;
}

/* ---------- user menu dialogs ---------- */
function changePassword() {
  openModal({
    title: 'Change Password',
    body: row('Current password', `<input class="input" type="password" id="cp-old" autocomplete="current-password">`, 'cp-old', true) + row('New password', `<input class="input" type="password" id="cp-new" autocomplete="new-password">`, 'cp-new', true) + row('Confirm new password', `<input class="input" type="password" id="cp-cf" autocomplete="new-password">`, 'cp-cf', true),
    onSave: () => {
      const o = document.getElementById('cp-old').value, n = document.getElementById('cp-new').value, c = document.getElementById('cp-cf').value;
      let ok = setErr('cp-old', o === S.user.password ? '' : 'Current password is incorrect.');
      ok = setErr('cp-new', n.length >= 4 ? '' : 'Use at least 4 characters.') && ok;
      ok = setErr('cp-cf', n === c ? '' : 'The two new passwords do not match.') && ok;
      if (!ok) return;
      S.user.password = n; DB.save(); closeModal(); toast('Password changed.', 'good');
    },
  });
}
function registerLine(step = 1) {
  const mine = DB.cfg.lineNotify.filter(l => l.username === S.user.username);
  if (step === 1) {
    openModal({
      title: 'Register Line Notify',
      body: (mine.map(l => `<div class="counter" style="display:flex;gap:10px;align-items:center;justify-content:space-between"><div style="flex:1"><input class="input" data-line-name="${l.id}" value="${esc(l.name)}" aria-label="Connection name"><span style="font-size:12px;color:var(--muted)">Updated on ${fmtDT(l.updatedAt)}</span></div><button type="button" class="btn sm" data-act="line-rename" data-arg="${l.id}">Save</button></div>`).join('') || `<p style="margin:0;color:var(--muted)">You have no LINE connections yet.</p>`) +
        `<p style="margin:0;font-size:12px;color:var(--faint)">To notify a LINE group, create the group in LINE first, then add LINE Notify to it.</p>`,
      foot: `<button class="btn" data-act="modal-close" type="button">Close</button><button class="btn primary" data-act="line-connect" type="button">Add Line Notify</button>`,
    });
  } else {
    openModal({
      title: 'LINE Notify · Select a chat',
      body: `<p style="margin:0;color:var(--muted);font-size:13px">Choose where Management IoT should send notifications. (Simulated LINE consent screen.)</p>
        <div class="radio-group" style="display:grid">${['1-on-1 chat with LINE Notify', 'GroupAdmin', 'GroupAdmin1', 'Maintenance shift B'].map((g, i) => `<label><input type="radio" name="lg" value="${esc(g)}" ${i === 0 ? 'checked' : ''}>${esc(g)}</label>`).join('')}</div>`,
      foot: `<button class="btn" data-act="modal-close" type="button">Cancel</button><button class="btn primary" data-act="line-agree" type="button">Agree and connect</button>`,
    });
  }
}

/* ==========================================================================
   EVENTS
   ========================================================================== */
const ACT = {
  noop() { },
  pick(el) { if (el.dataset.arg !== 'pe') return toast('Asset Insight and System Config are not part of this demo.', 'warn'); S.picked = true; S.assetId = firstScope(); S.mode = pagesOf('view').length ? 'view' : pagesOf('operation').length ? 'operation' : 'admin'; S.page = pagesOf(S.mode)[0]; render(); },
  go(el) { const p = el.dataset.arg; if (menuLevel(p) === 'deny') return toast('You do not have access to that page.', 'warn'); S.page = p; S.mode = PAGES[p].mode; S.sideOpen = false; S.menuOpen = false; render(); },
  side() { S.sideOpen = !S.sideOpen; document.querySelector('.side')?.classList.toggle('open', S.sideOpen); },
  menu() { S.menuOpen = !S.menuOpen; render(); },
  mode(el) { S.mode = el.dataset.arg; S.page = pagesOf(S.mode)[0]; S.menuOpen = false; render(); },
  logout() { Sim.accessLog.push({ username: S.user.username, type: 'logout', at: Date.now() }); S.user = null; S.menuOpen = false; render(); },
  chpass() { S.menuOpen = false; render(); changePassword(); },
  'reg-line'() { S.menuOpen = false; render(); registerLine(1); },
  'reset-demo'() { S.menuOpen = false; render(); confirmBox('Reset demo data', 'This restores the original assets, roles, reasons, jobs, alarms and plans, and logs you out.', () => { DB.reset(); location.reload(); }, 'Reset'); },
  theme() { S.themeTouched = true; S.theme ={ system: 'light', light: 'dark', dark: 'system' }[S.theme]; try { localStorage.setItem('oee-demo-theme', S.theme); } catch (e) { } render(); },
  scope(el) { S.assetId = el.dataset.arg; S.benchIds = null; S.sideOpen = false; Object.values(S.tables).forEach(t => t.page = 1); render(); },
  'scope-go'(el) { S.assetId = el.dataset.arg; S.page = el.dataset.page; render(); },
  twist(el, e) { e.stopPropagation(); const id = el.dataset.arg; S.closed.has(id) ? S.closed.delete(id) : S.closed.add(id); const t = document.querySelector('.tree'); if (t) t.innerHTML = treeHTML(); },
  preset(el) { S.preset = el.dataset.arg; Object.values(S.tables).forEach(t => t.page = 1); refreshContent(); },
  print() { doPrint(); },
  export(el) { EXPORTS[el.dataset.arg]?.(); },
  page(el) { const st = S.tables[el.dataset.arg]; st.page = +el.dataset.p; refreshContent(); },
  'sel-one'(el) { const s = S.sel[el.dataset.arg]; el.checked ? s.add(el.dataset.id) : s.delete(el.dataset.id); refreshContent(); },
  'sel-all'(el) { const s = S.sel[el.dataset.arg]; (window.__rowsById[el.dataset.arg] || []).forEach(id => el.checked ? s.add(id) : s.delete(id)); refreshContent(); },
  layout(el) { S.layoutFull = el.dataset.arg === 'full'; refreshContent(); },
  'bench-add'() { const opts = DB.cfg.assets.filter(a => assetLevel(a.id) !== 'deny' && !S.benchIds.includes(a.id)); if (opts[0]) S.benchIds.push(opts[0].id); refreshContent(); },
  'bench-del'(el) { S.benchIds.splice(+el.dataset.arg, 1); refreshContent(); },
  ack(el) { const a = Sim.alarms.find(x => x.id === el.dataset.arg); if (a) { a.ackBy = S.user.username; a.ackAt = Date.now(); toast(`Acknowledged ${esc(a.name)}.`, 'good'); } refreshContent(); },
  'ack-all'() { const list = alarmScoped().filter(a => !a.ackBy); confirmBox('Acknowledge all alarms', `Mark ${list.length} open alarms in ${esc(scope().name)} as acknowledged by you?`, () => { list.forEach(a => { a.ackBy = S.user.username; a.ackAt = Date.now(); }); toast(`Acknowledged ${list.length} alarms.`, 'good'); refreshContent(); }, 'Acknowledge all'); },
  report(el) { openReport(+el.dataset.arg, el.dataset.kind); },
  'modal-close'() { closeModal(); },
  'modal-save'() { MODAL?.onSave?.(); },
  switch(el) { el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true'); },
  /* operation input */
  'op-toggle'() {
    const mid = S.opMachine; const cur = Sim.current(mid);
    if (cur.on) reasonPicker('availability', 'Turn off machine reason', id => { closeModal(); Sim.setState(mid, false, id, S.user.username, true); toast(`${esc(DB.asset(mid).name)} turned off · ${esc(DB.reason(id).name)}`, DB.reason(id).status === 'critical' ? 'crit' : 'warn'); refreshContent(); });
    else { Sim.setState(mid, true, null, S.user.username, true); toast(`${esc(DB.asset(mid).name)} is running.`, 'good'); refreshContent(); }
  },
  'pick-reason'(el) { MODAL?.onPick?.(el.dataset.arg); },
  qty(el) { const i = document.getElementById('op-qty'); S.opQty = Math.max(1, (parseInt(i.value, 10) || 1) + +el.dataset.arg); i.value = S.opQty; },
  'op-good'() { opCount('good'); }, 'op-bad'() { opCount('bad'); },
  /* history */
  'avh-add'() { availForm(null); },
  'avh-edit'(el) { const [mid, i] = el.dataset.arg.split(':'); const sg = Sim.data.get(mid).segs[+i]; availForm({ mid, i: +i, at: sg.s, type: sg.on ? 'on' : 'off', reasonId: sg.reasonId }); },
  'avh-del'(el) { const [mid, i] = el.dataset.arg.split(':'); confirmBox('Delete event', `Delete this ${Sim.data.get(mid).segs[+i].on ? 'On' : 'Off'} event? The previous state will continue until the next event.`, () => { const err = Sim.deleteAvailEvent(mid, +i); err ? toast(err, 'warn') : toast('Event deleted.', 'good'); refreshContent(); }); },
  'pf-add'() { perfForm(null); }, 'pf-edit'(el) { perfForm(findPerf(el.dataset.arg)); },
  'pf-del'(el) { const r = findPerf(el.dataset.arg); confirmBox('Delete record', `Delete ${fmtNum(r.qty)} pcs on ${esc(DB.asset(r.mid).name)} at ${fmtDT(r.at)}?`, () => { if (r.sys) { const d = Sim.data.get(r.mid); d.tot[r.h] = 0; (d.updP = d.updP || {})[r.h] = S.user.username; } else Sim.manualPerf = Sim.manualPerf.filter(x => x.id !== r.id); toast('Record deleted.', 'good'); refreshContent(); }); },
  'ql-add'() { qualForm(null); }, 'ql-edit'(el) { qualForm(findQual(el.dataset.arg)); },
  'ql-del'(el) { const r = findQual(el.dataset.arg); confirmBox('Delete record', `Delete ${fmtNum(r.qty)} ${r.type} pcs on ${esc(DB.asset(r.mid).name)}?`, () => { if (r.sys) setSysQual(r, 0); else Sim.manualQual = Sim.manualQual.filter(x => x.id !== r.id); toast('Record deleted.', 'good'); refreshContent(); }); },
  /* admin */
  'asset-add'(el) { assetForm(null, el.dataset.arg); }, 'asset-edit'(el) { assetForm(DB.asset(el.dataset.arg)); },
  'asset-del'(el) { const a = DB.asset(el.dataset.arg); if (DB.kids(a.id).length) return toast(`Remove the ${DB.kids(a.id).length} child assets of ${esc(a.name)} first.`, 'warn'); confirmBox('Delete asset', `Delete <b>${esc(a.name)}</b> (${esc(a.code)})? Its history disappears from dashboards.`, () => { DB.cfg.assets = DB.cfg.assets.filter(x => x.id !== a.id); DB.cfg.jobs.forEach(j => j.machines = j.machines.filter(m => m !== a.id)); DB.cfg.jobs = DB.cfg.jobs.filter(j => j.machines.length); Sim.data.delete(a.id); if (S.assetId === a.id) S.assetId = 'p1'; DB.save(); toast('Asset deleted.', 'good'); render(); }); },
  import(el) { importDialog(el.dataset.arg); },
  tpl(el) { const sp = MODAL.importSpec; exportCSV(`Template_${el.dataset.arg}`, sp.head, sp.sample); },
  'imp-go'() { const rows = MODAL.importRows.filter(r => r.result !== 'Failed'); rows.forEach(r => r.apply()); DB.save(); DB.cfg.assets.filter(a => a.isMachine).forEach(m => Sim.ensure(m)); closeModal(); toast(`Success ${rows.length} items imported.`, 'good'); render(); },
  'role-add'() { roleParentForm(null); }, 'role-child'(el) { roleChildForm(null, el.dataset.arg); },
  'role-edit'(el) { const r = DB.cfg.roles.find(x => x.id === el.dataset.arg); r.parentId ? roleChildForm(r) : roleParentForm(r); },
  'role-del'(el) { const r = DB.cfg.roles.find(x => x.id === el.dataset.arg); const n = DB.cfg.users.filter(u => u.roleId === r.id).length; const k = DB.cfg.roles.filter(x => x.parentId === r.id).length; if (n || k) return toast(`${esc(r.name)} still has ${n} users and ${k} child roles. Move them first.`, 'warn'); confirmBox('Delete role', `Delete role <b>${esc(r.name)}</b>?`, () => { DB.cfg.roles = DB.cfg.roles.filter(x => x.id !== r.id); DB.save(); toast('Role deleted.', 'good'); render(); }); },
  'user-edit'(el) { userForm(DB.cfg.users.find(u => u.id === el.dataset.arg)); },
  'plan-asset'(el) { S.planAsset = el.dataset.arg; S.planDraft = null; render(); },
  'plan-month'(el) { const d = new Date(S.planMonth); d.setDate(1); d.setMonth(d.getMonth() + +el.dataset.arg); S.planMonth = d.getTime(); render(); },
  'plan-day'(el) { overrideForm(+el.dataset.arg); },
  'plan-copy'(el) { S.clip = JSON.parse(JSON.stringify(S.planDraft.week[el.dataset.arg] || [])); toast(`Copied ${DOW[el.dataset.arg]} (${S.clip.length} ranges).`); render(); },
  'plan-paste'(el) { S.planDraft.week[el.dataset.arg] = JSON.parse(JSON.stringify(S.clip)); render(); },
  'plan-addr'(el) { (S.planDraft.week[el.dataset.arg] = S.planDraft.week[el.dataset.arg] || []).push({ s: '08:00', e: '17:00' }); render(); },
  'plan-rm'(el) { const [d, i] = el.dataset.arg.split(':'); S.planDraft.week[d].splice(+i, 1); render(); },
  'plan-save'() { const w = S.planDraft.week; if (!Object.values(w).every(validRanges)) return toast('Each range needs an end time after its start time.', 'warn'); const p = ensurePlan(S.planAsset); p.week = JSON.parse(JSON.stringify(w)); DB.save(); toast('Normal shift saved. Dashboards now use the new planned time.', 'good'); render(); },
  'ovr-add'() { readOvr(); MODAL.ovr.push({ s: '08:00', e: '17:00' }); MODAL.draw(); },
  'ovr-rm'(el) { readOvr(); MODAL.ovr.splice(+el.dataset.arg, 1); MODAL.draw(); },
  'ovr-sort'() { readOvr(); MODAL.ovr.sort((a, b) => hm2ms(a.s) - hm2ms(b.s)); MODAL.draw(); },
  'ovr-copy'() { readOvr(); S.clip = JSON.parse(JSON.stringify(MODAL.ovr)); toast(`Copied ${S.clip.length} ranges.`); },
  'ovr-paste'() { if (S.clip) { MODAL.ovr = JSON.parse(JSON.stringify(S.clip)); MODAL.draw(); } },
  'ovr-clear'() { const p = ensurePlan(MODAL.ownerFor); delete p.overrides[MODAL.ovrDate]; DB.save(); closeModal(); toast('This day follows the normal shift again.', 'good'); render(); },
  'ovr-save'(el) {
    readOvr(); if (!validRanges(MODAL.ovr)) return toast('Each range needs an end time after its start time.', 'warn');
    const targets = [MODAL.ownerFor]; if (el.dataset.arg === 'children') { const walk = id => DB.kids(id).forEach(k => { targets.push(k.id); walk(k.id); }); walk(MODAL.ownerFor); }
    targets.forEach(id => { ensurePlan(id).overrides[MODAL.ovrDate] = JSON.parse(JSON.stringify(MODAL.ovr)); });
    DB.save(); const n = targets.length; closeModal(); toast(`Override saved for ${n} asset${n > 1 ? 's' : ''}.`, 'good'); render();
  },
  'reason-add'(el) { reasonForm(null, el.dataset.arg); }, 'reason-edit'(el) { reasonForm(DB.reason(el.dataset.arg)); },
  'reason-del'(el) { const r = DB.reason(el.dataset.arg); confirmBox('Delete reason', `Delete <b>${esc(r.name)}</b>? Past events keep their records but show no reason name.`, () => { DB.cfg.reasons = DB.cfg.reasons.filter(x => x.id !== r.id); DB.cfg.alarmRules.forEach(a => { a.aReasons = a.aReasons.filter(i => i !== r.id); a.qReasons = a.qReasons.filter(i => i !== r.id); }); DB.save(); toast('Reason deleted.', 'good'); render(); }); },
  'job-add'() { jobForm(null); }, 'job-edit'(el) { jobForm(DB.cfg.jobs.find(j => j.id === el.dataset.arg)); },
  'job-del'() { const s = S.sel.jobs; confirmBox('Delete jobs', `Delete ${s.size} selected jobs?`, () => { DB.cfg.jobs = DB.cfg.jobs.filter(j => !s.has(j.id)); s.clear(); DB.save(); toast('Jobs deleted.', 'good'); render(); }); },
  'rule-add'() { ruleForm(null); }, 'rule-edit'(el) { ruleForm(DB.cfg.alarmRules.find(r => r.id === el.dataset.arg)); },
  'rule-del'() { const s = S.sel.rules; confirmBox('Delete alarms', `Delete ${s.size} selected alarm rules?`, () => { DB.cfg.alarmRules = DB.cfg.alarmRules.filter(r => !s.has(r.id)); s.clear(); DB.save(); toast('Alarm rules deleted.', 'good'); render(); }); },
  'banner-move'(el) { const l = S.bannerDraft || (S.bannerDraft = [...DB.cfg.banners]); const i = l.findIndex(b => b.id === el.dataset.arg); const j = i + +el.dataset.d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; render(); },
  'banner-order'() { DB.cfg.banners = S.bannerDraft; S.bannerDraft = null; DB.save(); toast('Banner order saved.', 'good'); render(); },
  'banner-del'(el) { confirmBox('Delete banner', 'Remove this image from the login page?', () => { DB.cfg.banners = DB.cfg.banners.filter(b => b.id !== el.dataset.arg); S.bannerDraft = null; DB.save(); render(); }); },
  'banner-add'() {
    openModal({ title: 'Add banner', body: row('Image', `<input class="input" type="file" accept="image/*" id="fb-file">`, 'fb-file', true), onSave: () => {
      const f = document.getElementById('fb-file').files[0]; if (!setErr('fb-file', f ? '' : 'Choose an image.')) return;
      const rd = new FileReader(); rd.onload = () => { const b = stamp({ id: uid('b'), fileName: f.name, hue: Math.floor(Math.random() * 360), img: f.size < 400e3 ? rd.result : undefined }, true); DB.cfg.banners.push(b); DB.save(); closeModal(); toast(f.size < 400e3 ? 'Banner added.' : 'Banner added. Images over 400 KB show as a placeholder in this demo.', 'good'); render(); }; rd.readAsDataURL(f);
    } });
  },
  'banner-preview'() { const b = S.bannerDraft || DB.cfg.banners; openModal({ title: 'Login page preview', wide: true, body: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">${b.map((x, i) => `<div><span style="display:block;aspect-ratio:16/9;border-radius:12px;background:${x.img ? `center/cover url(${x.img})` : `linear-gradient(135deg,hsl(${x.hue} 60% 45%),hsl(${x.hue + 40} 60% 30%))`}"></span><small class="mono">${i + 1}. ${esc(x.fileName)}</small></div>`).join('')}</div>`, foot: '<button class="btn" data-act="modal-close" type="button">Close</button>' }); },
  'line-test'(el) { const l = DB.cfg.lineNotify.find(x => x.id === el.dataset.arg); toast(`Test message sent to <b>${esc(l.name)}</b> (simulated).`, 'good'); },
  'test-email'() { openModal({ title: 'Test Email', body: row('Send to', `<input class="input" type="email" id="te-to" value="${esc(S.user.email)}">`, 'te-to', true), saveLabel: 'Send test', onSave: () => { const v = fv('te-to'); if (!setErr('te-to', /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? '' : 'Enter a valid email address.')) return; closeModal(); toast(`Test email sent to ${esc(v)} (simulated).`, 'good'); } }); },
  'line-del'() { const s = S.sel.lines; confirmBox('Delete Line Notify', `Delete ${s.size} selected connections? Alarms that use them stop sending to LINE.`, () => { DB.cfg.lineNotify = DB.cfg.lineNotify.filter(l => !s.has(l.id)); DB.cfg.alarmRules.forEach(r => r.lines = r.lines.filter(id => !s.has(id))); s.clear(); DB.save(); render(); }); },
  'line-rename'(el) { const l = DB.cfg.lineNotify.find(x => x.id === el.dataset.arg); const v = document.querySelector(`[data-line-name="${l.id}"]`).value.trim(); if (!v) return toast('Name cannot be empty.', 'warn'); l.name = v; l.updatedAt = Date.now(); DB.save(); toast('Name saved.', 'good'); registerLine(1); },
  'line-connect'() { registerLine(2); },
  'line-agree'() { const g = document.querySelector('input[name=lg]:checked').value; const t = Date.now(); DB.cfg.lineNotify.push({ id: uid('ln'), name: `notify_${fmtDate(t)} ${fmtTime(t, false)} · ${g}`, username: S.user.username, createdAt: t, updatedAt: t }); DB.save(); toast(`Connected LINE: ${esc(g)}.`, 'good'); registerLine(1); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (S.menuOpen && !e.target.closest('.profile')) { S.menuOpen = false; render(); if (!el) return; }
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') e.preventDefault();
  fn(el, e);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (MODAL) closeModal(); else if (S.menuOpen) { S.menuOpen = false; render(); } }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-act]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'f-onlyjob') { S.onlyJob = t.checked; refreshContent(); }
  else if (t.id === 'f-refresh') { S.refresh = +t.value; setupRefresh(); t.blur(); }
  else if (t.id === 'f-from' || t.id === 'f-to') { const v = new Date(t.value).getTime(); if (isFinite(v)) { S[t.id === 'f-from' ? 'from' : 'to'] = v; t.blur(); refreshContent(); } }
  else if (t.id === 'op-machine') { S.opMachine = t.value; t.blur(); refreshContent(); }
  else if (t.name === 'op-mode') { S.opMode = t.value; refreshContent(); }
  else if (t.id === 'op-qty') { S.opQty = Math.max(1, parseInt(t.value, 10) || 1); }
  else if (t.dataset.bench != null) { S.benchIds[+t.dataset.bench] = t.value; t.blur(); refreshContent(); }
  else if (t.id === 'loss-type') { S.lossType = t.value; t.blur(); refreshContent(); }
  else if (t.id === 'loss-by') { S.lossBy = t.value; t.blur(); refreshContent(); }
  else if (t.id === 'loss-top') { S.lossTop = +t.value; t.blur(); refreshContent(); }
  else if (t.dataset.plan) { const [d, i, k] = t.dataset.plan.split(':'); S.planDraft.week[d][i][k] = t.value; }
  else if (t.id === 'plan-m' || t.id === 'plan-y') { const d = new Date(+fv('plan-y'), +fv('plan-m'), 1); S.planMonth = d.getTime(); render(); }
});
let searchT;
document.addEventListener('input', e => {
  const t = e.target;
  const key = { 'tree-search': 'tree', 'asset-search': 'asset', 'job-search': 'job' }[t.id]; if (!key) return;
  S.search[key] = t.value; clearTimeout(searchT);
  searchT = setTimeout(() => {
    if (key === 'tree') { document.querySelector('.tree').innerHTML = treeHTML(); return; }
    S.tables[key === 'asset' ? 'assets' : 'jobs'] = { page: 1 };
    const pos = t.selectionStart; render(); const n = document.getElementById(t.id); if (n) { n.focus(); n.setSelectionRange(pos, pos); }
  }, 220);
});

/* ---------- live loop ---------- */
let refreshTimer;
function setupRefresh() { clearInterval(refreshTimer); if (S.refresh) refreshTimer = setInterval(() => { if (S.mode !== 'admin') refreshContent(); }, S.refresh * 1000); }
Sim.listeners.add((kind, al, asset) => {
  if (kind !== 'alarm' || !S.user || !asset || assetLevel(asset.id) === 'deny') return;
  toast(`${sevPill(al.severity)} <span><b>${esc(al.name)}</b> · ${esc(asset.name)}<br><span style="color:var(--muted);font-size:12px">${esc(al.desc)}${al.channels?.length ? ` · sent by ${al.channels.join(' + ')}` : ''}</span></span>`, al.severity === 'critical' ? 'crit' : 'warn', false);
});
setInterval(() => {
  Sim.tick();
  const c = document.getElementById('op-clock'); if (c) c.textContent = fmtTime(Date.now());
}, 1000);
setInterval(() => {
  if (!S.user || !S.picked || S.mode === 'admin') return;
  const tk = document.querySelector('.ticker'); if (tk && !tk.matches(':hover')) tk.innerHTML = tickerHTML();
  const tree = document.querySelector('.tree'); if (tree && document.activeElement?.id !== 'tree-search') { const st = tree.scrollTop; tree.innerHTML = treeHTML(); tree.scrollTop = st; }
}, 4000);

/* ---------- boot ---------- */
DB.load();
Sim.init();
setupRefresh();
render();
