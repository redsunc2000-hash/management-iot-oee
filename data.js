/* ==========================================================================
   OEE demo — data layer
   - Config (master data) is persisted in localStorage.
   - Machine history (31 days) is generated deterministically per machine,
     then a live simulation appends data every second.
   - OEE maths follows the oee-production-expert skill:
       A = RunTime / PlannedTime, P = Actual / Target, Q = Good / Actual
   ========================================================================== */
'use strict';

const HOUR = 3600e3, DAY = 864e5, HISTORY_DAYS = 31;
const STORE_KEY = 'oee-demo-config-v2';

/* ---------- small utils ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const pad = n => String(n).padStart(2, '0');
function startOfDay(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
function fmtDate(t) { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fmtTime(t, sec = true) { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}` + (sec ? `:${pad(d.getSeconds())}` : ''); }
function fmtDT(t) { return t == null ? '' : `${fmtDate(t)} ${fmtTime(t)}`; }
function fmtHMS(sec) { sec = Math.max(0, Math.round(sec)); return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec % 3600 / 60))}:${pad(sec % 60)}`; }
function fmtNum(n, d = 0) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function fmtPct(v) { return v == null || !isFinite(v) ? '–' : (v * 100).toFixed(1) + '%'; }
let _uid = Date.now() % 100000;
const uid = p => `${p}${(++_uid).toString(36)}`;
function toLocalInput(t) { const d = new Date(t); return `${fmtDate(t)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function hm2ms(s) { if (s === '23:59') return DAY; const [h, m] = s.split(':').map(Number); return (h * 60 + m) * 60e3; }

/* ---------- seed master data ---------- */
function seedConfig() {
  const A = (id, name, code, parentId) => ({ id, name, code, parentId, isMachine: false });
  const M = (id, name, code, parentId, rate) => ({ id, name, code, parentId, isMachine: true, rate, uom: 'ea' });
  const assets = [
    A('p1', 'Kankyo Solutions', '001', null),
    A('zn', 'Air Filter Zone', '001_2', 'p1'),
    A('ln', 'Air Purifier Filter line A', '001_2_1', 'zn'),
    M('m1', 'Filter Final Assembly machine', '001_2_1_m', 'ln', 180),
    A('lne', 'Filter media part', '001_2_1_1', 'ln'),
    M('m2', 'Media Pleating machine', '001_2_1_1_1_m', 'lne', 240),
    M('m3', 'HEPA Lamination machine', '001_2_1_1_2_m', 'lne', 220),
    M('m4', 'Media Cutting machine', '001_2_1_1_3_m', 'lne', 200),
    A('lnm', 'Filter frame part', '001_2_1_2', 'ln'),
    M('m5', 'Frame Injection machine A', '001_2_1_2_1_m', 'lnm', 300),
    M('m6', 'Frame Injection machine B', '001_2_1_2_2_m', 'lnm', 300),
    M('m7', 'Ultrasonic Welding machine', '001_2_1_2_3_m', 'lnm', 160),
    A('zs', 'Water Filter Zone', '001_1', 'p1'),
    A('ls', 'Water Cartridge line A', '001_1_1', 'zs'),
    M('m8', 'Cartridge Assembly machine', '001_1_1_m', 'ls', 180),
    A('lse', 'Filter core part', '001_1_1_1', 'ls'),
    M('m9', 'Carbon Block Extruder', '001_1_1_1_1_m', 'lse', 240),
    M('m10', 'Membrane Winding machine', '001_1_1_1_2_m', 'lse', 220),
    M('m11', 'Core Sintering machine', '001_1_1_1_3_m', 'lse', 200),
    A('lsm', 'Housing part', '001_1_1_2', 'ls'),
    M('m12', 'Housing Injection machine A', '001_1_1_2_1_m', 'lsm', 300),
    M('m13', 'Housing Injection machine B', '001_1_1_2_2_m', 'lsm', 300),
    M('m14', 'Pressure Leak Test machine', '001_1_1_2_3_m', 'lsm', 160),
  ];
  const reasons = [
    { id: 'r1', name: 'Downtime', code: 'DT01', section: 'availability', status: 'warning', repair: false },
    { id: 'r2', name: 'Setup Machine', code: 'ST01', section: 'availability', status: 'warning', repair: false },
    { id: 'r3', name: 'Work piece stuck', code: 'WS01', section: 'availability', status: 'warning', repair: false },
    { id: 'r4', name: 'Change Tool', code: 'CT01', section: 'availability', status: 'critical', repair: false },
    { id: 'r5', name: 'Machine Breakdown', code: 'MB01', section: 'availability', status: 'critical', repair: true },
    { id: 'q1', name: 'QC Reject', code: 'QC01', section: 'quality', status: 'bad', repair: false },
    { id: 'q2', name: 'Upper size', code: 'US01', section: 'quality', status: 'bad', repair: false },
    { id: 'q3', name: 'Lower size', code: 'LS01', section: 'quality', status: 'bad', repair: false },
    { id: 'q4', name: 'Top Scratched', code: 'TS01', section: 'quality', status: 'bad', repair: false },
  ];
  const MENU = MENU_KEYS.reduce((o, g) => { g.items.forEach(i => o[i.key] = 'edit'); return o; }, {});
  const roles = [
    { id: 'super', name: 'Super Admin', parentId: null, superAdmin: true, menu: { ...MENU }, assets: { p1: 'edit' } },
    { id: 'mgrp', name: 'Manager parent', parentId: null, menu: Object.fromEntries(Object.keys(MENU).map(k => [k, MENU_KEYS[2].items.some(i => i.key === k) ? 'view' : (MENU_KEYS[1].items.some(i => i.key === k) ? 'view' : 'edit')])), assets: {} },
    { id: 'mgr1', name: 'Manager plant 1.1', parentId: 'mgrp', menu: {}, assets: { p1: 'view' } },
    { id: 'opp', name: 'Operator parent', parentId: null, menu: Object.fromEntries(Object.keys(MENU).map(k => [k, MENU_KEYS[2].items.some(i => i.key === k) ? 'deny' : (MENU_KEYS[1].items.some(i => i.key === k) ? 'edit' : 'view')])), assets: {} },
    { id: 'opn', name: 'Air filter line operator', parentId: 'opp', menu: {}, assets: { p1: 'deny', zn: 'edit' } },
  ];
  const users = [
    { id: 'u1', username: 'admin', password: 'admin', fullName: 'Super Admin', email: 'admin@kankyo-solutions.example', roleId: 'super', active: true },
    { id: 'u2', username: 'manager', password: 'manager', fullName: 'Pimchanok S.', email: 'pimchanok@kankyo-solutions.example', roleId: 'mgr1', active: true },
    { id: 'u3', username: 'operator', password: 'operator', fullName: 'Arthit K.', email: 'arthit@kankyo-solutions.example', roleId: 'opn', active: true },
    { id: 'u4', username: 'qc.lead', password: 'qc.lead', fullName: 'Narumon P.', email: 'narumon@kankyo-solutions.example', roleId: 'mgr1', active: false },
  ];
  const week = {}; for (let d = 0; d < 7; d++) week[d] = [{ s: '00:00', e: '23:59' }];
  const plans = { p1: { week, overrides: {} } };

  const jobs = [];
  const today = startOfDay(Date.now());
  for (let d = -(HISTORY_DAYS - 1); d <= 3; d++) {
    const day = today + d * DAY;
    const dt = new Date(day);
    const tag = `${String(dt.getFullYear()).slice(2)}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}`;
    assets.filter(a => a.isMachine).forEach((m, i) => {
      jobs.push({
        id: `j${tag}${m.id}`, name: `PO-${tag}-${pad(i + 1)}`, target: m.rate * 16, formula: m.name.replace(/ machine$/, '') + ' std',
        idealQty: m.rate, idealPer: 1, idealUnit: 'hour', machines: [m.id], finishGood: m.id, priority: i % 4 === 0 ? 'high' : 'normal',
        type: 'auto', start: day + 6 * HOUR, end: day + 22 * HOUR, cavity: 1,
        createdBy: 'admin', createdAt: day - 2 * DAY, updatedBy: 'admin', updatedAt: day - 2 * DAY,
      });
    });
  }
  const alarmRules = [
    { id: 'al1', name: 'Machine Breakdown', severity: 'critical', type: 'machine', assetId: 'p1', aTarget: null, pTarget: null, qTarget: null, aReasons: ['r5'], qReasons: [], sendEmail: true, emails: ['maintenance@kankyo-solutions.example'], sendLine: true, lines: ['ln1'] },
    { id: 'al2', name: 'Change tool', severity: 'warning', type: 'machine', assetId: 'p1', aTarget: null, pTarget: null, qTarget: null, aReasons: ['r4'], qReasons: [], sendEmail: false, emails: [], sendLine: true, lines: ['ln1'] },
    { id: 'al3', name: 'Work piece stuck', severity: 'warning', type: 'machine', assetId: 'p1', aTarget: null, pTarget: null, qTarget: null, aReasons: ['r3'], qReasons: [], sendEmail: false, emails: [], sendLine: true, lines: ['ln1'] },
    { id: 'al4', name: 'MachineStop', severity: 'warning', type: 'machine', assetId: 'p1', aTarget: null, pTarget: null, qTarget: null, aReasons: ['r1', 'r2'], qReasons: [], sendEmail: false, emails: [], sendLine: false, lines: [] },
    { id: 'al5', name: 'Top scratched', severity: 'critical', type: 'machine', assetId: 'zn', aTarget: null, pTarget: null, qTarget: null, aReasons: [], qReasons: ['q4'], sendEmail: true, emails: ['qc@kankyo-solutions.example'], sendLine: false, lines: [] },
    { id: 'al6', name: 'Water Filter Zone OEE below target', severity: 'warning', type: 'machine', assetId: 'zs', aTarget: 85, pTarget: 85, qTarget: 90, aReasons: [], qReasons: [], sendEmail: true, emails: ['plant.manager@kankyo-solutions.example'], sendLine: false, lines: [] },
  ];
  const banners = [
    { id: 'b1', fileName: 'superapp-iot-smart-factory.jpg', hue: 214 },
    { id: 'b2', fileName: 'superapp-iot-line-monitoring.jpg', hue: 180 },
    { id: 'b3', fileName: 'superapp-iot-quality.jpg', hue: 262 },
  ];
  const lineNotify = [
    { id: 'ln1', name: 'Maintenance group', username: 'admin', createdAt: today - 40 * DAY, updatedAt: today - 12 * DAY },
    { id: 'ln2', name: 'notify_2023-03-21 11:10', username: 'manager', createdAt: today - 90 * DAY, updatedAt: today - 60 * DAY },
  ];
  const stamp = { createdBy: 'admin', createdAt: today - 120 * DAY, updatedBy: 'admin', updatedAt: today - 30 * DAY };
  [assets, reasons, roles, users, alarmRules, banners].forEach(list => list.forEach(x => Object.assign(x, { ...stamp, ...x })));
  return { version: 2, assets, reasons, roles, users, plans, jobs, alarmRules, banners, lineNotify };
}

const MENU_KEYS = [
  { group: 'View mode', mode: 'view', items: [
    { key: 'overview', label: 'Overview' }, { key: 'plant_layout', label: 'Plant Layout' }, { key: 'availability', label: 'Availability' },
    { key: 'performance', label: 'Performance' }, { key: 'quality', label: 'Quality' }, { key: 'benchmark', label: 'Benchmark' },
    { key: 'job_tracking', label: 'Job Tracking' }, { key: 'loss', label: 'Loss' }, { key: 'alarm', label: 'Alarm' },
    { key: 'machine_detail', label: 'Machine Detail' }, { key: 'daily_report', label: 'Daily Report' }] },
  { group: 'Operation mode', mode: 'operation', items: [
    { key: 'operation_input', label: 'Operation Input' }, { key: 'availability_history', label: 'Availability History' },
    { key: 'performance_history', label: 'Performance History' }, { key: 'quality_history', label: 'Quality History' }] },
  { group: 'Admin mode', mode: 'admin', items: [
    { key: 'asset', label: 'Asset' }, { key: 'role', label: 'Role' }, { key: 'user', label: 'User' },
    { key: 'plan_production', label: 'Plan Production' }, { key: 'reason', label: 'Reason' }, { key: 'job', label: 'Job' },
    { key: 'alarm_setup', label: 'Alarm' }, { key: 'banner', label: 'Banner' }, { key: 'line_notify', label: 'Line Notify' },
    { key: 'access_log', label: 'Access Log' }] },
];

/* ---------- config store ---------- */
const DB = {
  cfg: null,
  load() {
    try { const raw = localStorage.getItem(STORE_KEY); if (raw) { this.cfg = JSON.parse(raw); } } catch (e) { /* storage unavailable */ }
    if (!this.cfg || this.cfg.version !== 2) this.cfg = seedConfig();
    this.index();
  },
  save() { this.index(); try { localStorage.setItem(STORE_KEY, JSON.stringify(this.cfg)); } catch (e) { /* quota or blocked */ } },
  reset() { try { localStorage.removeItem(STORE_KEY); } catch (e) { } this.cfg = seedConfig(); this.index(); },
  index() {
    this.byId = new Map(this.cfg.assets.map(a => [a.id, a]));
    this.children = new Map();
    this.cfg.assets.forEach(a => { if (!this.children.has(a.parentId)) this.children.set(a.parentId, []); this.children.get(a.parentId).push(a); });
    this.reasonById = new Map(this.cfg.reasons.map(r => [r.id, r]));
    this.jobsByMachine = new Map();
    this.cfg.jobs.forEach(j => j.machines.forEach(mid => { if (!this.jobsByMachine.has(mid)) this.jobsByMachine.set(mid, []); this.jobsByMachine.get(mid).push(j); }));
    this.jobsByMachine.forEach(list => list.sort((a, b) => a.start - b.start));
    PLAN_CACHE.clear();
  },
  asset(id) { return this.byId.get(id); },
  kids(id) { return this.children.get(id) || []; },
  machinesUnder(id) {
    const a = this.asset(id); if (!a) return [];
    if (a.isMachine) return [a];
    return this.kids(id).flatMap(k => this.machinesUnder(k.id));
  },
  ancestors(id) { const out = []; let a = this.asset(id); while (a) { out.push(a); a = this.asset(a.parentId); } return out; },
  isUnder(id, ancestorId) { return this.ancestors(id).some(a => a.id === ancestorId); },
  reason(id) { return this.reasonById.get(id); },
  reasons(section) { return this.cfg.reasons.filter(r => r.section === section); },
  path(id) { return this.ancestors(id).reverse().map(a => a.name).join(' › '); },
};

/* ---------- plan production ---------- */
const PLAN_CACHE = new Map();
function planOwner(assetId) { return DB.ancestors(assetId).find(a => DB.cfg.plans[a.id])?.id || 'p1'; }
function planRanges(ownerId, dayStart) {
  const key = ownerId + '|' + dayStart;
  if (PLAN_CACHE.has(key)) return PLAN_CACHE.get(key);
  const plan = DB.cfg.plans[ownerId];
  const date = fmtDate(dayStart);
  const list = plan.overrides[date] ?? plan.week[new Date(dayStart).getDay()] ?? [];
  const r = list.map(x => [dayStart + hm2ms(x.s), dayStart + hm2ms(x.e)]).filter(x => x[1] > x[0]);
  PLAN_CACHE.set(key, r);
  return r;
}
function overlap(a0, a1, b0, b1) { return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0)); }
function planFraction(ownerId, hs) {
  const he = hs + HOUR;
  const ranges = planRanges(ownerId, startOfDay(hs));
  let ov = 0; ranges.forEach(([s, e]) => ov += overlap(hs, he, s, e));
  return Math.min(1, ov / HOUR);
}
function jobAt(mid, t) { return (DB.jobsByMachine.get(mid) || []).find(j => j.start <= t && t < j.end) || null; }
function jobFraction(mid, hs) {
  let ov = 0; for (const j of DB.jobsByMachine.get(mid) || []) { if (j.start >= hs + HOUR) break; ov += overlap(hs, hs + HOUR, j.start, j.end); }
  return Math.min(1, ov / HOUR);
}
function idealRate(m, t) {
  const j = jobAt(m.id, t);
  if (!j) return m.rate;
  const per = { second: 1, minute: 60, hour: 3600 }[j.idealUnit] * (j.idealPer || 1);
  return (j.idealQty / per) * 3600 * (j.cavity || 1);
}

/* ---------- simulation ---------- */
const Sim = {
  start: startOfDay(Date.now()) - (HISTORY_DAYS - 1) * DAY,
  data: new Map(),      // machineId -> { segs, on[], tot[], bad[], br[], prof }
  manualPerf: [],       // { id, mid, at, qty, by, upd }
  manualQual: [],       // { id, mid, at, type, qty, reasonId, by, upd }
  alarms: [],           // { id, at, ruleId, name, severity, type, assetId, desc, ackBy, ackAt }
  accessLog: [],
  listeners: new Set(),
  last: Date.now(),
  hourIdx(t) { return Math.floor((t - this.start) / HOUR); },

  init() {
    DB.cfg.assets.filter(a => a.isMachine).forEach(m => this.ensure(m));
    this.seedAlarms();
    this.seedAccessLog();
  },
  ensure(m) {
    if (this.data.has(m.id)) return this.data.get(m.id);
    const rnd = mulberry32(hashStr(m.id + m.code));
    const prof = { availBias: rnd(), perf: 0.8 + rnd() * 0.16, badRate: 0.015 + rnd() * 0.06, qw: [rnd(), rnd(), rnd(), rnd()] };
    const now = Date.now();
    const n = this.hourIdx(now) + 1;
    const d = { segs: [], on: new Float64Array(n + 48), tot: new Float64Array(n + 48), bad: new Float64Array(n + 48), br: Array.from({ length: n + 48 }, () => ({})), prof, rnd };
    const aReasons = DB.reasons('availability'); const qReasons = DB.reasons('quality');
    let t = this.start, on = true;
    while (t < now) {
      let dur, reasonId = null;
      if (on) dur = -Math.log(1 - rnd()) * (55 + prof.availBias * 130) * 60e3;
      else {
        const crit = rnd() < 0.28;
        const pool = aReasons.filter(r => r.status === (crit ? 'critical' : 'warning'));
        reasonId = pool[Math.floor(rnd() * pool.length)].id;
        dur = (crit ? 14 + rnd() * 55 : 3 + rnd() * 20) * 60e3;
      }
      const end = t + dur;
      const seg = { s: t, e: end >= now ? null : end, on, reasonId, by: 'system' };
      if (seg.e === null && !on) seg.autoEnd = Math.min(end, now + 40e3 + rnd() * 60e3);
      d.segs.push(seg);
      t = end; on = !on;
    }
    this.data.set(m.id, d);
    this.rebuildOn(m.id);
    // production per hour
    for (let h = 0; h < n; h++) {
      const hs = this.start + h * HOUR;
      const rate = idealRate(m, hs);
      const perf = Math.min(1.02, prof.perf * (0.9 + rnd() * 0.18));
      const tot = d.on[h] / 3600 * rate * perf;
      d.tot[h] = tot;
      const bad = tot * prof.badRate * (0.4 + rnd() * 1.2);
      d.bad[h] = bad;
      const wsum = prof.qw.reduce((a, b) => a + b, 0);
      qReasons.forEach((q, i) => { d.br[h][q.id] = bad * (prof.qw[i % 4] / wsum); });
    }
    return d;
  },
  ensureLen(d, n) {
    if (d.on.length >= n) return;
    const grow = (arr) => { const a = new Float64Array(n + 48); a.set(arr); return a; };
    d.on = grow(d.on); d.tot = grow(d.tot); d.bad = grow(d.bad);
    while (d.br.length < n + 48) d.br.push({});
  },
  rebuildOn(mid) {
    const d = this.data.get(mid); const now = Date.now();
    d.on.fill(0);
    d.segs.forEach(sg => {
      if (!sg.on) return;
      const e = sg.e ?? now;
      for (let h = Math.max(0, this.hourIdx(sg.s)); h <= this.hourIdx(e - 1); h++) {
        const hs = this.start + h * HOUR;
        d.on[h] += overlap(sg.s, e, hs, hs + HOUR) / 1000;
      }
    });
  },
  current(mid) { const d = this.data.get(mid); return d.segs[d.segs.length - 1]; },
  status(mid) {
    const s = this.current(mid); if (!s) return 'idle';
    if (s.on) return 'run';
    return DB.reason(s.reasonId)?.status === 'critical' ? 'crit' : 'warn';
  },
  setState(mid, on, reasonId, by, manual) {
    const d = this.data.get(mid); const now = Date.now();
    const cur = this.current(mid);
    if (cur && cur.on === on) return;
    if (cur) cur.e = now;
    const seg = { s: now, e: null, on, reasonId: on ? null : reasonId, by };
    if (!on && !manual) seg.autoEnd = now + (DB.reason(reasonId)?.status === 'critical' ? 45e3 + Math.random() * 75e3 : 15e3 + Math.random() * 40e3);
    if (!on && manual) seg.manual = true;
    d.segs.push(seg);
    if (!on) this.raiseReasonAlarms(mid, reasonId, now, 'Availability');
    this.emit();
  },

  /* ---------- alarms ---------- */
  rulesFor(mid, reasonId) {
    return DB.cfg.alarmRules.filter(r => (r.aReasons.includes(reasonId) || r.qReasons.includes(reasonId)) && DB.isUnder(mid, r.assetId));
  },
  raiseReasonAlarms(mid, reasonId, at, kind, silent) {
    const m = DB.asset(mid); const rs = DB.reason(reasonId);
    this.rulesFor(mid, reasonId).forEach(rule => {
      const al = { id: uid('a'), at, ruleId: rule.id, name: rule.name, severity: rule.severity, type: rule.type, assetId: mid, desc: `Found ${kind} Reason ${rs?.name}`, ackBy: null, ackAt: null, channels: [rule.sendEmail && 'Email', rule.sendLine && 'LINE'].filter(Boolean) };
      this.alarms.push(al);
      if (!silent) this.listeners.forEach(fn => fn('alarm', al, m));
    });
  },
  seedAlarms() {
    const now = Date.now();
    this.data.forEach((d, mid) => {
      d.segs.forEach(sg => { if (!sg.on && sg.reasonId) this.raiseReasonAlarms(mid, sg.reasonId, sg.s, 'Availability', true); });
      for (let h = 0; h < this.hourIdx(now); h += 1) {
        if (d.br[h].q4 > 1.2 && d.rnd() < 0.35) this.raiseReasonAlarms(mid, 'q4', this.start + h * HOUR + d.rnd() * HOUR, 'Quality', true);
      }
    });
    this.alarms.sort((a, b) => a.at - b.at);
    const users = ['admin', 'manager', 'qc.lead'];
    this.alarms.forEach((a, i) => { if (a.at < now - 5 * HOUR) { a.ackBy = users[i % 3]; a.ackAt = a.at + (4 + (i % 50)) * 60e3; } });
  },
  evaluateTargets() {
    const now = Date.now(); const from = startOfDay(now);
    DB.cfg.alarmRules.filter(r => r.aTarget || r.pTarget || r.qTarget).forEach(rule => {
      if (!DB.asset(rule.assetId)) return;
      const c = calc(rule.assetId, from, now, false);
      const misses = [];
      if (rule.aTarget && c.A * 100 < rule.aTarget) misses.push(`Availability ${fmtPct(c.A)} < ${rule.aTarget}%`);
      if (rule.pTarget && c.P * 100 < rule.pTarget) misses.push(`Performance ${fmtPct(c.P)} < ${rule.pTarget}%`);
      if (rule.qTarget && c.Q * 100 < rule.qTarget) misses.push(`Quality ${fmtPct(c.Q)} < ${rule.qTarget}%`);
      const open = this.alarms.find(a => a.ruleId === rule.id && !a.ackBy);
      if (misses.length && !open) {
        const al = { id: uid('a'), at: now, ruleId: rule.id, name: rule.name, severity: rule.severity, type: rule.type, assetId: rule.assetId, desc: misses.join(', '), ackBy: null, ackAt: null, channels: [rule.sendEmail && 'Email', rule.sendLine && 'LINE'].filter(Boolean) };
        this.alarms.push(al);
        this.listeners.forEach(fn => fn('alarm', al, DB.asset(rule.assetId)));
      }
    });
  },
  seedAccessLog() {
    const now = Date.now(); const rnd = mulberry32(7);
    const names = ['admin', 'manager', 'operator', 'admin', 'operator'];
    for (let t = now - 30 * DAY; t < now - HOUR; t += (2 + rnd() * 9) * HOUR) this.accessLog.push({ username: names[Math.floor(rnd() * names.length)], type: 'login', at: t });
  },

  /* ---------- live tick ---------- */
  tick() {
    const now = Date.now(); const dt = Math.min(5, (now - this.last) / 1000); this.last = now;
    const idx = this.hourIdx(now);
    const qReasons = DB.reasons('quality'); const aReasons = DB.reasons('availability');
    DB.cfg.assets.filter(a => a.isMachine).forEach(m => {
      const d = this.ensure(m); this.ensureLen(d, idx + 1);
      const cur = this.current(m.id);
      if (cur.on) {
        d.on[idx] += dt;
        const prod = dt * idealRate(m, now) / 3600 * d.prof.perf * (0.9 + Math.random() * 0.18);
        d.tot[idx] += prod;
        if (Math.random() < prod * d.prof.badRate * 1.4 && qReasons.length) {
          const q = qReasons[Math.floor(Math.random() * qReasons.length)];
          d.bad[idx] += 1; d.br[idx][q.id] = (d.br[idx][q.id] || 0) + 1;
          this.raiseReasonAlarms(m.id, q.id, now, 'Quality');
        }
        if (Math.random() < dt / 1500 && aReasons.length) {
          const crit = Math.random() < 0.3;
          const pool = aReasons.filter(r => r.status === (crit ? 'critical' : 'warning'));
          const r = (pool.length ? pool : aReasons)[Math.floor(Math.random() * (pool.length || aReasons.length))];
          this.setState(m.id, false, r.id, 'system', false);
        }
      } else if (!cur.manual && cur.autoEnd && now >= cur.autoEnd) {
        this.setState(m.id, true, null, 'system', false);
      }
    });
    if (!this._lastEval || now - this._lastEval > 30e3) { this._lastEval = now; this.evaluateTargets(); }
  },
  emit() { this.listeners.forEach(fn => fn('state')); },

  /* ---------- availability history (segments as events) ---------- */
  availEvents(assetIds, from, to) {
    const out = [];
    assetIds.forEach(mid => {
      const d = this.data.get(mid); if (!d) return;
      d.segs.forEach((sg, i) => { if (sg.s >= from && sg.s < to) out.push({ id: `${mid}:${i}`, mid, i, at: sg.s, type: sg.on ? 'on' : 'off', reasonId: sg.reasonId, by: sg.by, upd: sg.upd || '' }); });
    });
    return out.sort((a, b) => b.at - a.at);
  },
  addAvailEvent(mid, at, on, reasonId, by) {
    const d = this.data.get(mid); const segs = d.segs;
    const i = segs.findIndex(sg => sg.s <= at && (sg.e == null || at < sg.e));
    if (i < 0) return false;
    const sg = segs[i];
    if (sg.on === on) { sg.reasonId = on ? null : reasonId; sg.upd = by; this.rebuildOn(mid); return true; }
    const tail = { s: at, e: sg.e, on, reasonId: on ? null : reasonId, by, manual: !on && sg.e == null };
    sg.e = at;
    segs.splice(i + 1, 0, tail);
    // keep alternation: if the following segment has the same state, merge
    const nx = segs[i + 2];
    if (nx && nx.on === tail.on) { tail.e = nx.e; segs.splice(i + 2, 1); }
    this.rebuildOn(mid); this.emit();
    return true;
  },
  editAvailEvent(mid, i, at, on, reasonId, by) {
    const segs = this.data.get(mid).segs; const sg = segs[i];
    const lo = i > 0 ? segs[i - 1].s + 1000 : this.start;
    const hi = sg.e ?? Date.now();
    if (at < lo || at >= hi) return `Datetime must be between ${fmtDT(lo)} and ${fmtDT(hi)}.`;
    if (i > 0) segs[i - 1].e = at;
    sg.s = at; sg.reasonId = on ? null : reasonId; sg.upd = by;
    if (sg.on !== on) { sg.on = on; if (!on && sg.e == null) sg.manual = true; }
    this.mergeSame(mid); this.rebuildOn(mid); this.emit();
    return null;
  },
  deleteAvailEvent(mid, i) {
    const segs = this.data.get(mid).segs;
    if (i === 0) return 'The first event in history cannot be deleted.';
    segs[i - 1].e = segs[i].e; segs.splice(i, 1);
    this.mergeSame(mid); this.rebuildOn(mid); this.emit();
    return null;
  },
  mergeSame(mid) {
    const segs = this.data.get(mid).segs;
    for (let i = segs.length - 1; i > 0; i--) if (segs[i].on === segs[i - 1].on && segs[i].reasonId === segs[i - 1].reasonId) { segs[i - 1].e = segs[i].e; segs.splice(i, 1); }
  },
};

/* ---------- calculation ---------- */
function calcMachine(m, from, to, onlyJob) {
  const d = Sim.data.get(m.id);
  const r = { id: m.id, name: m.name, planned: 0, run: 0, target: 0, total: 0, bad: 0 };
  if (!d) return r;
  const now = Date.now(); to = Math.min(to, now);
  if (to <= from) return r;
  const owner = planOwner(m.id);
  const h0 = Math.max(0, Sim.hourIdx(from)), h1 = Sim.hourIdx(to - 1);
  for (let h = h0; h <= h1 && h < d.on.length; h++) {
    const hs = Sim.start + h * HOUR;
    const spanEnd = Math.min(hs + HOUR, now);
    const span = spanEnd - hs; if (span <= 0) continue;
    const ov = overlap(hs, spanEnd, from, to); if (!ov) continue;
    const ratio = ov / span;
    let pf = planFraction(owner, hs);
    if (onlyJob) pf *= jobFraction(m.id, hs);
    if (!pf) continue;
    const run = d.on[h] * ratio * pf;
    r.planned += ov / 1000 * pf;
    r.run += Math.min(run, ov / 1000 * pf);
    r.target += run * idealRate(m, hs) / 3600;
    r.total += d.tot[h] * ratio * pf;
    r.bad += d.bad[h] * ratio * pf;
  }
  Sim.manualPerf.forEach(e => { if (e.mid === m.id && e.at >= from && e.at < to) r.total += e.qty; });
  Sim.manualQual.forEach(e => { if (e.mid === m.id && e.at >= from && e.at < to && e.type === 'bad') r.bad += e.qty; });
  return r;
}
function finish(r) {
  r.down = Math.max(0, r.planned - r.run);
  r.good = Math.max(0, r.total - r.bad);
  r.A = r.planned ? r.run / r.planned : null;
  r.P = r.target ? r.total / r.target : null;
  r.Q = r.total ? r.good / r.total : null;
  r.OEE = r.A != null && r.P != null && r.Q != null ? r.A * r.P * r.Q : null;
  return r;
}
function calc(assetId, from, to, onlyJob) {
  const ms = DB.machinesUnder(assetId);
  const agg = { id: assetId, planned: 0, run: 0, target: 0, total: 0, bad: 0, machines: [] };
  ms.forEach(m => {
    const r = finish(calcMachine(m, from, to, onlyJob));
    agg.machines.push(r);
    ['planned', 'run', 'target', 'total', 'bad'].forEach(k => agg[k] += r[k]);
  });
  return finish(agg);
}
function bucketSize(from, to) { const span = to - from; return span <= 2 * DAY ? HOUR : span <= 8 * DAY ? 6 * HOUR : DAY; }
function history(assetId, from, to, onlyJob) {
  const size = bucketSize(from, to); const now = Date.now();
  const pts = [];
  for (let t = from; t < Math.min(to, now); t += size) {
    const c = calc(assetId, t, Math.min(t + size, to), onlyJob);
    pts.push({ t, OEE: c.OEE, A: c.A, P: c.P, Q: c.Q, total: c.total, target: c.target, run: c.run });
  }
  return pts;
}
function downByReason(assetId, from, to) {
  const out = {}; const now = Date.now();
  DB.machinesUnder(assetId).forEach(m => {
    const d = Sim.data.get(m.id); if (!d) return;
    d.segs.forEach(sg => {
      if (sg.on) return;
      const ov = overlap(sg.s, sg.e ?? now, from, Math.min(to, now)); if (!ov) return;
      const k = sg.reasonId || 'none';
      out[k] = out[k] || { sec: 0, count: 0 };
      out[k].sec += ov / 1000; out[k].count++;
    });
  });
  return out;
}
function badByReason(assetId, from, to) {
  const out = {}; const now = Date.now();
  DB.machinesUnder(assetId).forEach(m => {
    const d = Sim.data.get(m.id); if (!d) return;
    for (let h = Math.max(0, Sim.hourIdx(from)); h <= Sim.hourIdx(Math.min(to, now) - 1) && h < d.br.length; h++) {
      const hs = Sim.start + h * HOUR; const span = Math.min(hs + HOUR, now) - hs; if (span <= 0) continue;
      const ratio = overlap(hs, hs + span, from, to) / span;
      Object.entries(d.br[h]).forEach(([k, v]) => { out[k] = (out[k] || 0) + v * ratio; });
    }
  });
  Sim.manualQual.forEach(e => { if (e.type === 'bad' && e.at >= from && e.at < to && DB.isUnder(e.mid, assetId)) out[e.reasonId || 'none'] = (out[e.reasonId || 'none'] || 0) + e.qty; });
  return out;
}
function timeline(assetId, from, to) {
  const now = Date.now(); to = Math.min(to, now);
  return DB.machinesUnder(assetId).map(m => {
    const d = Sim.data.get(m.id);
    const segs = (d?.segs || []).filter(sg => (sg.e ?? now) > from && sg.s < to).map(sg => ({
      s: Math.max(sg.s, from), e: Math.min(sg.e ?? now, to),
      state: sg.on ? 'run' : (DB.reason(sg.reasonId)?.status === 'critical' ? 'crit' : 'warn'),
      reason: sg.on ? 'Running' : (DB.reason(sg.reasonId)?.name || 'Stopped'),
    }));
    return { id: m.id, label: m.name, segs };
  });
}
function lossFor(m, from, to, onlyJob) {
  const r = finish(calcMachine(m, from, to, onlyJob));
  const rate = idealRate(m, Math.min(to, Date.now()) - 1) / 3600;
  const aLoss = r.down;
  const pLoss = Math.max(0, r.run - (rate ? r.total / rate : 0));
  const qLoss = rate ? r.bad / rate : 0;
  return { m, r, aLoss, pLoss, qLoss, total: aLoss + pLoss + qLoss };
}
