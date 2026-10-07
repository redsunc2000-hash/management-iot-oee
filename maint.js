/* ==========================================================================
   OEE demo — maintenance & operations add-ons
   Work orders (CMMS) with MTBF/MTTR, spare parts, energy with TOU cost,
   SPC (X̄-R charts) on process sensors, and the shift log (checklist +
   handover). Logic only; the pages are in ops.js.
   ========================================================================== */
'use strict';

const WO_TYPE = { corrective: 'Corrective', preventive: 'Preventive', predictive: 'Predictive', inspection: 'Inspection' };
const WO_LOG = { corrective: 'repair', preventive: 'pm', predictive: 'repair', inspection: 'inspect' };
const WO_STATUS = { open: ['Open', 'warn'], assigned: ['Assigned', 'accent'], in_progress: ['In progress', 'accent'], done: ['Done', 'good'], cancelled: ['Cancelled', 'idle'] };
const WO_PRIO = { low: ['Low', 'idle'], normal: ['Normal', 'idle'], high: ['High', 'warn'], urgent: ['Urgent', 'crit'] };
const TOOL_PART = { Cutting: 'pt5', Pleating: 'pt6', 'Ultrasonic welding': 'pt7', 'Leak testing': 'pt8', Lamination: 'pt9', Extrusion: 'pt10', Assembly: 'pt11' };
const CHECK_COMMON = ['Safety guards and emergency stop work', 'Area clean and tidy (5S)', 'No air, oil or water leaks', 'No abnormal noise, smell or vibration'];
const CHECK_KIND = {
  'Injection molding': ['Mold surface clean, no flash on parts', 'Hydraulic oil level in the green band', 'Mold cooling water flowing'],
  Pleating: ['Pleat blade clean, no media build-up', 'Media roll aligned on the unwind'],
  Lamination: ['Glue tank above minimum level', 'Nip rollers clean'],
  Cutting: ['Blade sharp, no chips', 'Dust extraction running'],
  'Ultrasonic welding': ['Horn and anvil clean, no cracks', 'First weld passes the peel test'],
  Extrusion: ['Carbon and binder hopper filled and dry', 'Die face clean'],
  Winding: ['Membrane guide rollers clean', 'Tension reading in range'],
  'Sintering oven': ['Oven door seals intact', 'Exhaust fan running'],
  'Leak testing': ['Master leak part check passes', 'Fixture seals undamaged'],
  Assembly: ['Gripper pads intact', 'Torque tool inside calibration date'],
};
const checkItems = mid => [...CHECK_COMMON, ...(CHECK_KIND[machineKind(DB.asset(mid)).kind] || [])];

/* Day 08:00–20:00, Night 20:00–08:00 */
function shiftAt(t) {
  const sod = startOfDay(t), h = new Date(t).getHours();
  const day = h >= 8 && h < 20;
  const start = day ? sod + 8 * HOUR : h >= 20 ? sod + 20 * HOUR : sod - 4 * HOUR;
  return { key: `${fmtDate(start)}-${day ? 'D' : 'N'}`, name: day ? 'Day' : 'Night', start, end: start + 12 * HOUR };
}
const shiftLabel = sh => `${sh.name} shift · ${fmtDate(sh.start)} ${fmtTime(sh.start, false)}–${fmtTime(sh.end, false)}`;
function shiftByKey(key) { const [y, m, d, k] = key.split('-'); const sod = new Date(+y, +m - 1, +d).getTime(); return shiftAt(sod + (k === 'D' ? 9 : 21) * HOUR); }

const Maint = {
  seed(assets) {
    const now = Date.now(); const ago = h => now - h * HOUR;
    const P = (id, code, name, unit, stock, min, cost, kinds, location) => ({ id, code, name, unit, stock, min, cost, kinds, location });
    const parts = [
      P('pt1', 'BRG-6205-2RS', 'Ball bearing 6205-2RS', 'pcs', 6, 4, 180, ['*'], 'Store A-01'),
      P('pt2', 'OIL-GBX-220', 'Gear oil ISO VG 220', 'L', 18, 20, 210, ['Extrusion'], 'Oil room'),
      P('pt3', 'FLT-HYD-10', 'Hydraulic return filter 10 µm', 'pcs', 3, 2, 950, ['Injection molding'], 'Store A-04'),
      P('pt4', 'OIL-HYD-46', 'Hydraulic oil ISO VG 46', 'L', 60, 40, 95, ['Injection molding'], 'Oil room'),
      P('pt5', 'BLD-CUT-300', 'Cutting blade 300 mm', 'pcs', 1, 2, 2400, ['Cutting'], 'Store B-02'),
      P('pt6', 'BLD-PLT-01', 'Pleating knife set', 'set', 2, 1, 5800, ['Pleating'], 'Store B-02'),
      P('pt7', 'HRN-US-20K', 'Ultrasonic horn 20 kHz, titanium', 'pcs', 0, 1, 38000, ['Ultrasonic welding'], 'Store B-05'),
      P('pt8', 'SEAL-FX-40', 'Fixture O-ring seal kit', 'kit', 5, 3, 650, ['Leak testing'], 'Store C-01'),
      P('pt9', 'NZL-HM-08', 'Hot-melt nozzle 0.8 mm', 'pcs', 4, 2, 1200, ['Lamination'], 'Store B-03'),
      P('pt10', 'SCR-PK-80', 'Screen pack 80 mesh', 'pcs', 12, 10, 150, ['Extrusion'], 'Store C-03'),
      P('pt11', 'GRP-PAD-S', 'Gripper suction pad', 'pcs', 24, 10, 85, ['Assembly'], 'Store C-02'),
      P('pt12', 'BLT-V-A42', 'V-belt A42', 'pcs', 3, 2, 320, ['*'], 'Store A-02'),
      P('pt13', 'HTR-BND-60', 'Heater band 60 mm 400 W', 'pcs', 4, 2, 1450, ['Injection molding', 'Extrusion'], 'Store A-05'),
      P('pt14', 'FLT-AIR-01', 'Compressed air filter element', 'pcs', 6, 4, 540, ['*'], 'Store A-03'),
    ];
    const W = o => ({ id: uid('wo'), parts: [], assignee: 'maint.tech', alarmId: null, startedAt: null, doneAt: null, result: '', createdBy: 'manager', dueAt: null, ...o });
    const workOrders = [
      W({ mid: 'm9', title: 'Gearbox vibration rising', type: 'predictive', priority: 'high', status: 'assigned', createdAt: ago(50), dueAt: ago(-30), desc: 'Gearbox vibration keeps rising (bearing wear suspected). Replace the input shaft bearings and change the gear oil at the next planned stop.', parts: [{ id: 'pt1', qty: 2 }, { id: 'pt2', qty: 6 }] }),
      W({ mid: 'm4', title: 'Blade change, cut count over limit', type: 'preventive', priority: 'high', status: 'in_progress', createdAt: ago(5), startedAt: ago(0.6), dueAt: ago(-3), desc: 'Blade cut counter passed the limit. Change the blade and check the cut edge on the first 20 pieces.', parts: [{ id: 'pt5', qty: 1 }] }),
      W({ mid: 'm13', title: '400 h preventive maintenance', type: 'preventive', priority: 'normal', status: 'open', assignee: null, createdAt: ago(20), dueAt: ago(4), desc: 'Lubrication, hydraulic filter, heater bands and thermocouples.', parts: [{ id: 'pt3', qty: 1 }] }),
      W({ mid: 'm7', title: 'Ultrasonic frequency drifting low', type: 'predictive', priority: 'normal', status: 'open', assignee: null, createdAt: ago(9), dueAt: ago(-72), desc: 'Generator frequency is trending down. Inspect the horn for cracks. No spare horn in store, raise a purchase request.' }),
    ];
    [['m2', 'corrective', 'Pleat knife jammed', 'Cleared the jam and reset the knife gap.', 480, 45, null, 0],
      ['m5', 'corrective', 'Heater band failure, zone 2', 'Replaced the zone 2 heater band and checked the thermocouple.', 360, 95, 'pt13', 1],
      ['m10', 'inspection', 'Monthly inspection', 'All OK. Guide rollers cleaned.', 290, 40, null, 0],
      ['m14', 'corrective', 'Fixture seal leaking', 'Replaced the O-ring kit. Master leak check passed.', 215, 35, 'pt8', 1],
      ['m8', 'preventive', 'Gripper pad replacement', 'Replaced 8 suction pads.', 140, 50, 'pt11', 8],
      ['m12', 'corrective', 'Hydraulic hose weeping', 'Tightened the fitting, cleaned the spill, topped up oil.', 75, 70, 'pt4', 10],
      ['m3', 'preventive', 'Glue nozzle cleaning', 'Nozzles cleaned, one replaced.', 30, 30, 'pt9', 1]]
      .forEach(([mid, type, title, result, h, dur, pid, qty]) => workOrders.push(W({ mid, type, title, result, priority: 'normal', status: 'done', createdAt: ago(h + 2), startedAt: ago(h), doneAt: ago(h) + dur * MIN, dueAt: ago(h - 24), desc: title + '.', parts: pid ? [{ id: pid, qty }] : [] })));
    workOrders.sort((a, b) => a.createdAt - b.createdAt);
    const seq = {}; workOrders.forEach(w => { const tag = woTag(w.createdAt); seq[tag] = (seq[tag] || 0) + 1; w.no = `WO-${tag}-${String(seq[tag]).padStart(3, '0')}`; });

    const checks = [];
    const machines = assets.filter(a => a.isMachine);
    const ng = { m9: ['No abnormal noise, smell or vibration', 'Gearbox louder than last week.'], m14: ['Fixture seals undamaged', 'Small cut on the upper seal.'] };
    const prev = shiftAt(now - 12 * HOUR), cur = shiftAt(now);
    machines.forEach((m, i) => {
      const mk = (sh, at) => ({ id: uid('ck'), mid: m.id, shift: sh.key, at, by: DB_isAir(m, assets) ? 'operator' : 'qc.lead', items: [...CHECK_COMMON, ...(CHECK_KIND[machineKind(m).kind] || [])].map(text => ({ text, ok: !(ng[m.id] && ng[m.id][0] === text) })), note: ng[m.id]?.[1] || '' });
      checks.push(mk(prev, prev.start + (20 + i * 4) * MIN));
      if (i % 2 === 0 && now - cur.start > HOUR) checks.push(mk(cur, cur.start + (15 + i * 3) * MIN));
    });
    const notes = [
      ['Line ran steady. Extruder gearbox is louder than usual, maintenance has a work order.', 'Watch the extruder gearbox vibration.'],
      ['Media cutting blade close to its limit and only 1 spare blade in store.', 'Purchasing to order cutting blades.'],
      ['Cartridge assembly stopped twice for work piece stuck, cleared by operator.', ''],
      ['Leak tester gave 3 false rejects. Master part check OK after seal check.', 'Re-check leak tester seals at start of shift.'],
    ];
    const handovers = notes.map(([note, issues], k) => { const sh = shiftAt(now - 12 * HOUR * (k + 1)); return { id: uid('ho'), shift: sh.key, at: sh.end - 12 * MIN, by: k % 2 ? 'qc.lead' : 'manager', scopeId: 'p1', note, issues }; });
    return { parts, workOrders, checks, handovers, tariff: { on: 4.18, off: 2.6, ef: 0.5 } };
  },

  part(id) { return DB.cfg.parts.find(p => p.id === id); },
  partsFor(mid) { const k = machineKind(DB.asset(mid)).kind; return DB.cfg.parts.filter(p => p.kinds.includes('*') || p.kinds.includes(k)); },
  toolPartNote(mid) {
    const p = this.part(TOOL_PART[machineKind(DB.asset(mid)).kind]);
    return p ? ` Spare ${p.name}: ${fmtNum(p.stock)} ${p.unit} in store${p.stock <= 0 ? ', order now' : p.stock <= p.min ? ' (low)' : ''}.` : '';
  },
  lowParts() { return DB.cfg.parts.filter(p => p.stock <= p.min); },
  active(w) { return w.status !== 'done' && w.status !== 'cancelled'; },
  openFor(mid) { return DB.cfg.workOrders.filter(w => w.mid === mid && this.active(w)); },
  create(o, by) {
    const now = Date.now();
    const w = { id: uid('wo'), no: '', parts: [], startedAt: null, doneAt: null, result: '', createdAt: now, createdBy: by, alarmId: null, ...o };
    w.status = w.assignee ? 'assigned' : 'open';
    const tag = woTag(now); w.no = `WO-${tag}-${String(DB.cfg.workOrders.filter(x => x.no.startsWith(`WO-${tag}`)).length + 1).padStart(3, '0')}`;
    DB.cfg.workOrders.push(w);
    if (w.alarmId) { const a = Sim.alarms.find(x => x.id === w.alarmId); if (a) a.woId = w.id; }
    DB.save();
    return w;
  },
  complete(w, { result, parts, logAs }, by) {
    const now = Date.now();
    parts.forEach(u => { const p = this.part(u.id); if (p) p.stock = Math.max(0, p.stock - u.qty); });
    Object.assign(w, { result, parts, status: 'done', doneAt: now, startedAt: w.startedAt || now });
    if (logAs && DB.cfg.maint[w.mid]) Health.record(w.mid, logAs, `${w.no}: ${result}`, by);
    DB.save();
  },
  /* breakdown = a stop with a reason flagged "repair" (Machine Breakdown) */
  reliability(mid, from, to) {
    const now = Date.now(); to = Math.min(to, now);
    let run = 0, down = 0, n = 0;
    (Sim.data.get(mid)?.segs || []).forEach(sg => {
      const ov = overlap(sg.s, sg.e ?? now, from, to); if (!ov) return;
      if (sg.on) run += ov;
      else if (DB.reason(sg.reasonId)?.repair && sg.s >= from) { n++; down += (sg.e ?? now) - sg.s; }
    });
    return { n, runH: run / HOUR, downMin: down / MIN, mtbf: n ? run / HOUR / n : null, mttr: n ? down / MIN / n : null };
  },
};
function woTag(t) { const d = new Date(t); return `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}`; }
function DB_isAir(m, assets) { let a = m; while (a) { if (a.id === 'zn') return true; a = assets.find(x => x.id === a.parentId); } return false; }

/* ---------- energy (from each machine's power sensor) ---------- */
const Energy = {
  onPeak(t) { const d = new Date(t); const w = d.getDay(), h = d.getHours(); return w >= 1 && w <= 5 && h >= 9 && h < 22; },
  calc(mids, from, to, bucket) {
    from = Math.max(from, Health.start); to = Math.min(to, Date.now());
    const i0 = Health.idx(from), len = Math.max(0, Health.idx(to - 1) - i0 + 1);
    const tot = new Float64Array(len), idle = new Float64Array(len), peakFlag = new Uint8Array(len);
    let lastH = -1, flag = 0;
    for (let i = 0; i < len; i++) { const t = Health.start + (i0 + i) * MIN; const hh = Math.floor(t / HOUR); if (hh !== lastH) { lastH = hh; flag = this.onPeak(t) ? 1 : 0; } peakFlag[i] = flag; }
    const per = mids.map(mid => {
      const r = { mid, kwh: 0, on: 0, idle: 0, peakKW: 0 };
      const s = Health.sensors(mid).find(x => x.type === 'pwr'); if (!s) return r;
      const v = Health.gen(s).v; const runs = Health.run.get(mid);
      for (let i = 0; i < len; i++) {
        const x = v[i0 + i]; if (isNaN(x)) continue;
        r.kwh += x / 60; if (peakFlag[i]) r.on += x / 60;
        if (runs && !runs[i0 + i]) { r.idle += x / 60; idle[i] += x; }
        tot[i] += x; if (x > r.peakKW) r.peakKW = x;
      }
      return r;
    });
    const step = Math.max(1, Math.round(bucket / MIN)); const buckets = [];
    for (let i = 0; i < len; i += step) {
      let k = 0, id = 0;
      for (let j = i; j < Math.min(i + step, len); j++) { k += tot[j] / 60; id += idle[j] / 60; }
      const hrs = (Math.min(i + step, len) - i) / 60;
      buckets.push({ t: Health.start + (i0 + i) * MIN, kwh: k, idle: id, kw: k / hrs, idleKw: id / hrs });
    }
    let plantPeak = 0; for (let i = 0; i < len; i++) if (tot[i] > plantPeak) plantPeak = tot[i];
    const sum = k => per.reduce((a, r) => a + r[k], 0);
    return { per, buckets, kwh: sum('kwh'), on: sum('on'), idle: sum('idle'), plantPeak };
  },
};

/* ---------- SPC: X̄-R chart, subgroups of 5 running readings ---------- */
const SPC_N = 5, SPC_A2 = 0.577, SPC_D4 = 2.114, SPC_D2 = 2.326;
const SPC = {
  groups(s, from, to, minutes = 30) {
    const d = Health.gen(s); const runs = Health.runFlags(s.assetId);
    const i0 = Math.max(0, Health.idx(from)), i1 = Math.min(Health.idx(to), d.ai);
    const steady = new Uint8Array(i1 - i0 + 1); let streak = 0;
    for (let i = Math.max(0, i0 - 20); i <= i1; i++) { streak = runs[i] ? streak + 1 : 0; if (i >= i0) steady[i - i0] = streak >= 15 ? 1 : 0; }
    const out = [];
    for (let g = i0; g + minutes - 1 <= i1; g += minutes) {
      const ok = []; for (let i = g; i < g + minutes; i++) if (steady[i - i0] && !isNaN(d.v[i])) ok.push(d.v[i]);
      if (ok.length < SPC_N) continue;
      const pick = Array.from({ length: SPC_N }, (_, k) => ok[Math.floor(k * ok.length / SPC_N)]);
      const x = pick.reduce((a, b) => a + b) / SPC_N;
      out.push({ t: Health.start + g * MIN, x, r: Math.max(...pick) - Math.min(...pick), flags: [] });
    }
    return out;
  },
  analyze(s, from, to) {
    const base = this.groups(s, Health.start, Health.start + 3 * DAY);
    if (base.length < 10) return null;
    const xbb = base.reduce((a, g) => a + g.x, 0) / base.length, rbar = base.reduce((a, g) => a + g.r, 0) / base.length;
    const lim = { cl: xbb, ucl: xbb + SPC_A2 * rbar, lcl: xbb - SPC_A2 * rbar, rcl: rbar, rucl: SPC_D4 * rbar, sigma: rbar / SPC_D2 };
    const gs = this.groups(s, from, to);
    gs.forEach((g, i) => {
      if (g.x > lim.ucl || g.x < lim.lcl) g.flags.push('Beyond control limit');
      if (g.r > lim.rucl) g.flags.push('Range too wide');
      if (i >= 8) { const side = gs.slice(i - 8, i + 1).map(z => Math.sign(z.x - lim.cl)); if (side.every(v => v === side[0] && v !== 0)) g.flags.push('9 in a row on one side'); }
      if (i >= 5) { const w = gs.slice(i - 5, i + 1); const up = w.every((z, k) => !k || z.x > w[k - 1].x), dn = w.every((z, k) => !k || z.x < w[k - 1].x); if (up || dn) g.flags.push(`6 in a row ${up ? 'rising' : 'falling'}`); }
    });
    const mean = gs.length ? gs.reduce((a, g) => a + g.x, 0) / gs.length : null;
    const cpk = m => m == null || !lim.sigma ? null : (s.dir === 'lo' ? m - s.warn : s.warn - m) / (3 * lim.sigma);
    return { lim, gs, mean, cpk: cpk(mean), cpkBase: cpk(xbb) };
  },
};
