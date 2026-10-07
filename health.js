/* ==========================================================================
   OEE demo — machine health (condition monitoring)
   - Every machine gets the sensors that fit its type (injection, pleating…),
     every line gets room sensors (temperature, humidity, PM2.5).
   - 7 days of per-minute history is generated from the machine's run/stop
     history, then the live loop adds a reading every second.
   - A few machines carry slow wear (bearing, oil cooler, horn, seals) so the
     trend, the time-to-limit prediction and the alarms have a story to show.
   ========================================================================== */
'use strict';

const MIN = 60e3, SENSOR_DAYS = 7;

/* nom = normal running value, idle = value when stopped, tau = thermal lag (minutes),
   dir = which side is bad ('hi' or 'lo'), warn/crit = limits, fix = what maintenance should do */
const SENSOR_TYPES = {
  vib: { name: 'Motor vibration', unit: 'mm/s', nom: 1.8, idle: 0.08, noise: 0.18, warn: 4.5, crit: 7.1, dir: 'hi', dec: 2, fix: 'Check bearings, coupling alignment and mounting bolts, then run a vibration spectrum check.' },
  mtemp: { name: 'Motor temperature', unit: '°C', nom: 58, idle: 31, noise: 0.5, tau: 25, warn: 80, crit: 95, dir: 'hi', dec: 1, fix: 'Clean the motor fan cover, check ventilation and load current.' },
  cur: { name: 'Motor current', unit: 'A', nom: 12, idle: 0.3, noise: 0.45, warn: 16, crit: 19, dir: 'hi', dec: 1, fix: 'Look for mechanical binding, a worn drive or overload.' },
  pwr: { name: 'Power', unit: 'kW', nom: 7.5, idle: 0.6, noise: 0.25, warn: null, crit: null, dir: 'hi', dec: 1 },
  barrel: { name: 'Barrel temperature', unit: '°C', nom: 230, idle: 205, noise: 1.2, tau: 8, warn: 245, crit: 255, dir: 'hi', dec: 0, fix: 'Check heater bands, thermocouples and the temperature controller.' },
  mold: { name: 'Mold temperature', unit: '°C', nom: 50, idle: 34, noise: 0.6, tau: 15, warn: 60, crit: 68, dir: 'hi', dec: 1, fix: 'Check the mold temperature controller and descale the cooling channels.' },
  oil: { name: 'Hydraulic oil temperature', unit: '°C', nom: 45, idle: 33, noise: 0.35, tau: 40, warn: 55, crit: 62, dir: 'hi', dec: 1, fix: 'Clean the oil cooler, check cooling water flow and oil level.' },
  hyd: { name: 'Hydraulic pressure', unit: 'bar', nom: 140, idle: 4, noise: 3, warn: 165, crit: 180, dir: 'hi', dec: 0, fix: 'Check the relief valve setting and the pump condition.' },
  air: { name: 'Compressed air pressure', unit: 'bar', nom: 6.2, idle: 6.4, noise: 0.06, warn: 5.5, crit: 5.0, dir: 'lo', dec: 2, fix: 'Check the compressor, air dryer, filter regulator and leaks on the line.' },
  heat: { name: 'Pleat blade temperature', unit: '°C', nom: 120, idle: 112, noise: 0.8, tau: 6, warn: 135, crit: 145, dir: 'hi', dec: 0, fix: 'Check the blade heater and its controller.' },
  tension: { name: 'Web tension', unit: 'N', nom: 45, idle: 2, noise: 0.9, warn: 36, crit: 30, dir: 'lo', dec: 1, fix: 'Check the unwind brake, dancer arm and load cell calibration.' },
  glue: { name: 'Hot-melt glue temperature', unit: '°C', nom: 175, idle: 165, noise: 0.9, tau: 6, warn: 188, crit: 196, dir: 'hi', dec: 0, fix: 'Check the glue tank heater and hose thermostats.' },
  freq: { name: 'Ultrasonic frequency', unit: 'kHz', nom: 20, idle: 20, noise: 0.012, warn: 19.8, crit: 19.65, dir: 'lo', dec: 2, fix: 'Inspect the horn for cracks or wear and re-tune the generator.' },
  horn: { name: 'Horn temperature', unit: '°C', nom: 42, idle: 29, noise: 0.5, tau: 12, warn: 60, crit: 70, dir: 'hi', dec: 1, fix: 'Check horn cooling air and booster tightening torque.' },
  torque: { name: 'Screw torque', unit: '%', nom: 62, idle: 0, noise: 1.6, warn: 85, crit: 95, dir: 'hi', dec: 0, fix: 'Check carbon and binder moisture, feed rate and screw wear.' },
  die: { name: 'Die pressure', unit: 'bar', nom: 85, idle: 3, noise: 2, warn: 110, crit: 125, dir: 'hi', dec: 0, fix: 'Check the die for blockage and change the screen pack.' },
  oven: { name: 'Oven temperature', unit: '°C', nom: 230, idle: 210, noise: 1.1, tau: 30, warn: 245, crit: 255, dir: 'hi', dec: 0, fix: 'Check heater elements, the circulation fan and door seals.' },
  testp: { name: 'Test pressure', unit: 'bar', nom: 8, idle: 0, noise: 0.03, warn: 7.7, crit: 7.4, dir: 'lo', dec: 2, fix: 'Check the pressure regulator and the supply line.' },
  decay: { name: 'Pressure decay', unit: 'Pa/min', nom: 12, idle: 0, noise: 1.2, warn: 25, crit: 40, dir: 'hi', dec: 1, fix: 'Replace the fixture seals and re-verify with the master leak part.' },
  rt: { name: 'Room temperature', unit: '°C', nom: 27, noise: 0.15, env: true, wave: 2.5, warn: 32, crit: 35, dir: 'hi', dec: 1, fix: 'Check the air conditioning of the production room.' },
  rh: { name: 'Room humidity', unit: '%RH', nom: 55, noise: 0.6, env: true, wave: 6, warn: 65, crit: 75, dir: 'hi', dec: 0, fix: 'Check the dehumidifier and keep filter media and carbon sealed.' },
  pm25: { name: 'Dust PM2.5', unit: 'µg/m³', nom: 12, noise: 1.5, env: true, wave: 3, warn: 25, crit: 35, dir: 'hi', dec: 0, fix: 'Check room pressure, door discipline and the fan filter units.' },
};

/* sensors and wear counters per machine type; tool.days = calendar days one tool life lasts */
const MACHINE_KINDS = [
  { re: /injection/i, kind: 'Injection molding', pmHours: 400, sensors: { vib: { name: 'Pump motor vibration' }, oil: {}, hyd: {}, barrel: {}, mold: {}, pwr: { nom: 18, idle: 3 } }, tool: { name: 'Mold shots', event: 'Mold service', days: 20 } },
  { re: /pleat/i, kind: 'Pleating', pmHours: 400, sensors: { vib: {}, mtemp: {}, heat: {}, tension: {}, air: {}, pwr: { nom: 5.5 } }, tool: { name: 'Blade strokes', event: 'Blade change', days: 14 } },
  { re: /laminat/i, kind: 'Lamination', pmHours: 400, sensors: { vib: {}, mtemp: {}, glue: {}, tension: {}, pwr: { nom: 9, idle: 2 } }, tool: { name: 'Laminated pieces', event: 'Glue nozzle cleaning', days: 10 } },
  { re: /cutting/i, kind: 'Cutting', pmHours: 400, sensors: { vib: { name: 'Spindle vibration' }, cur: {}, mtemp: {}, air: {}, pwr: { nom: 4 } }, tool: { name: 'Blade cuts', event: 'Blade change', days: 8 } },
  { re: /ultrasonic/i, kind: 'Ultrasonic welding', pmHours: 400, sensors: { freq: {}, horn: {}, air: {}, pwr: { nom: 3.2, idle: 0.3 } }, tool: { name: 'Weld cycles', event: 'Horn service', days: 18 } },
  { re: /extrud/i, kind: 'Extrusion', pmHours: 400, sensors: { vib: { name: 'Gearbox vibration' }, barrel: { nom: 205, idle: 185, warn: 220, crit: 230 }, torque: {}, die: {}, mtemp: {}, pwr: { nom: 22, idle: 4 } }, tool: { name: 'Extruded blocks', event: 'Screen pack change', days: 12 } },
  { re: /winding/i, kind: 'Winding', pmHours: 400, sensors: { tension: { nom: 38, warn: 31, crit: 26 }, vib: {}, cur: { nom: 8, warn: 11, crit: 13 }, mtemp: {}, pwr: { nom: 4.5 } }, tool: { name: 'Wound elements', event: 'Guide roller cleaning', days: 15 } },
  { re: /sinter/i, kind: 'Sintering oven', pmHours: 450, sensors: { oven: {}, vib: { name: 'Exhaust fan vibration' }, cur: { name: 'Fan motor current', nom: 9, warn: 12, crit: 14 }, pwr: { nom: 35, idle: 20 } }, tool: null },
  { re: /leak/i, kind: 'Leak testing', pmHours: 400, sensors: { testp: {}, decay: {}, air: {}, pwr: { nom: 1.5, idle: 0.4 } }, tool: { name: 'Test cycles', event: 'Fixture seal change', days: 12 } },
  { re: /assembl/i, kind: 'Assembly', pmHours: 400, sensors: { air: {}, vib: { name: 'Conveyor vibration' }, cur: {}, mtemp: {}, pwr: { nom: 6 } }, tool: { name: 'Assembly cycles', event: 'Gripper service', days: 21 } },
];
const GENERIC_KIND = { kind: 'General machine', pmHours: 400, sensors: { vib: {}, mtemp: {}, cur: {}, pwr: {} }, tool: null };
const ENV_SENSORS = { rt: {}, rh: {}, pm25: {} };
const ENV_OVERRIDES = { ls: { rh: { nom: 59, wave: 7 } } }; // water line: humid afternoons push humidity over the limit
/* slow wear for the demo story: value moves by `amount` over `days`, curved by `pow` */
const DRIFTS = {
  'm9-vib': { amount: 3.4, days: 7, pow: 1.6 },     // extruder gearbox bearing wear
  'm6-oil': { amount: 10.5, days: 4, pow: 1.2 },    // injection oil cooler fouling
  'm14-decay': { amount: 11, days: 6, pow: 1 },     // leak tester fixture seal wear
  'm7-freq': { amount: -0.23, days: 7, pow: 1.3 },  // ultrasonic horn wear
};
/* [PM fraction, tool fraction] used so some machines are due or overdue */
const MAINT_STORY = { m13: [1.12, 0.5], m5: [0.55, 0.96], m4: [0.4, 1.05] };

function machineKind(m) { return MACHINE_KINDS.find(k => k.re.test(m.name)) || GENERIC_KIND; }
function makeSensors(asset, spec, over = {}) {
  return Object.entries(spec).map(([type, o]) => {
    const t = SENSOR_TYPES[type];
    return { id: `${asset.id}-${type}`, assetId: asset.id, type, name: t.name, unit: t.unit, nom: t.nom, idle: t.idle ?? t.nom, warn: t.warn, crit: t.crit, dir: t.dir, dec: t.dec, alarm: t.warn != null, ...o, ...(over[type] || {}) };
  });
}
function seedMaint(m, now) {
  const k = machineKind(m); const rnd = mulberry32(hashStr('maint' + m.id));
  const [pf, tf] = MAINT_STORY[m.id] || [0.12 + rnd() * 0.72, 0.12 + rnd() * 0.72];
  const pmDays = k.pmHours / 24 / 0.72;
  return {
    pmHours: k.pmHours, lastPM: Math.max(now - pf * pmDays * DAY, now - 29.5 * DAY),
    toolName: k.tool?.name || null, toolEvent: k.tool?.event || null,
    toolLimit: k.tool ? Math.max(5000, Math.round(m.rate * 24 * 0.62 * k.tool.days / 5000) * 5000) : null,
    lastTool: k.tool ? now - tf * k.tool.days * DAY : null,
  };
}
const gaussR = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;
const gaussS = rnd => (rnd() + rnd() + rnd() - 1.5) * 2;
const TZ = new Date().getTimezoneOffset() * MIN;

const Health = {
  t0: Date.now(),
  start: 0,
  data: new Map(),   // sensorId -> { v: Float32Array per minute, x, n, ema, cur, lvl, last }
  run: new Map(),    // machineId -> Uint8Array per minute, 1 = running

  seed(assets) {
    const now = Date.now(); const sensors = [], maint = {}, maintLog = [];
    assets.forEach(a => {
      if (a.isMachine) {
        sensors.push(...makeSensors(a, machineKind(a).sensors));
        const mt = maint[a.id] = seedMaint(a, now);
        maintLog.push({ id: uid('mx'), mid: a.id, at: mt.lastPM, kind: 'pm', note: 'Preventive maintenance as planned.', by: 'maint.tech' });
        if (mt.lastTool) maintLog.push({ id: uid('mx'), mid: a.id, at: mt.lastTool, kind: 'tool', note: `${mt.toolEvent}.`, by: 'maint.tech' });
      } else if (/line/i.test(a.name)) sensors.push(...makeSensors(a, ENV_SENSORS, ENV_OVERRIDES[a.id]));
    });
    maintLog.push({ id: uid('mx'), mid: 'm9', at: now - 2 * DAY - 3 * HOUR, kind: 'inspect', note: 'Gearbox noise reported by operator. Oil level OK. Watch vibration trend.', by: 'maint.tech' });
    return { sensors, maint, maintLog };
  },

  idx(t) { return Math.floor((t - this.start) / MIN); },
  init() {
    this.start = Math.floor(Date.now() / MIN) * MIN - SENSOR_DAYS * DAY;
    this.ensureCfg();
    this.sensors().forEach(s => this.gen(s));
    this.seedAlarms();
  },
  ensureCfg() {
    const c = DB.cfg; let changed = false;
    if (!c.sensors) { Object.assign(c, { sensors: [], maint: {}, maintLog: [] }); changed = true; }
    c.assets.filter(a => a.isMachine).forEach(m => {
      if (!c.sensors.some(s => s.assetId === m.id)) { c.sensors.push(...makeSensors(m, machineKind(m).sensors)); changed = true; }
      if (!c.maint[m.id]) { c.maint[m.id] = seedMaint(m, Date.now()); changed = true; }
    });
    this.na = c.assets.length;
    if (changed) DB.save();
  },
  sensors(assetId) { return DB.cfg.sensors.filter(s => DB.asset(s.assetId) && (!assetId || s.assetId === assetId)); },
  type(s) { return SENSOR_TYPES[s.type] || SENSOR_TYPES.vib; },
  isEnv(s) { return !!this.type(s).env; },

  /* ---------- simulation ---------- */
  runFlags(mid) {
    if (this.run.has(mid)) return this.run.get(mid);
    const n = this.idx(Date.now()) + 1;
    const r = new Uint8Array(n + 2 * 1440); const segs = Sim.data.get(mid)?.segs || [];
    let j = 0;
    for (let i = 0; i < n; i++) {
      const at = this.start + i * MIN + MIN / 2;
      while (j < segs.length - 1 && (segs[j].e ?? Infinity) <= at) j++;
      r[i] = segs[j] && segs[j].s <= at && segs[j].on ? 1 : 0;
    }
    this.run.set(mid, r);
    return r;
  },
  drift(s, at) {
    const dr = DRIFTS[s.id]; if (!dr) return 0;
    const fixAt = this.data.get(s.id)?.fixAt; if (fixAt && at >= fixAt) return 0;
    const p = Math.max(0, (at - (this.t0 - dr.days * DAY)) / (dr.days * DAY));
    return dr.amount * Math.pow(p, dr.pow || 1);
  },
  value(s, at, x, g) {
    const t = this.type(s);
    if (t.env) return s.nom + (s.wave ?? t.wave ?? 0) * Math.sin((((at - TZ) % DAY) / HOUR - 9) / 24 * 2 * Math.PI) + this.drift(s, at) + g * t.noise;
    return s.idle + (s.nom + this.drift(s, at) - s.idle) * x + g * t.noise * (0.25 + 0.75 * x);
  },
  gen(s) {
    if (this.data.has(s.id)) return this.data.get(s.id);
    const t = this.type(s); const n = this.idx(Date.now()) + 1;
    const v = new Float32Array(n + 2 * 1440).fill(NaN);
    const rnd = mulberry32(hashStr(s.id));
    const runs = t.env ? null : this.runFlags(s.assetId);
    const k = t.tau ? 1 - Math.exp(-1 / t.tau) : 1;
    let x = runs?.[0] ?? 1;
    for (let i = 0; i < n; i++) {
      if (runs) x += (runs[i] - x) * k;
      v[i] = this.value(s, this.start + i * MIN, x, gaussS(rnd) * 0.6);
    }
    const d = { v, x, n: 0, ema: v[n - 1], cur: v[n - 1], lvl: 0, last: {}, ai: n - 1, acc: v[n - 1], cnt: 1, lt: Date.now() };
    d.lvl = this.levelOf(s, this.eff(s, d.ema, t.env || x > 0.8));
    this.data.set(s.id, d);
    return d;
  },
  grow(arr, i) { if (i < arr.length) return arr; const a = new arr.constructor(i + 2 * 1440); if (a instanceof Float32Array) a.fill(NaN); a.set(arr); return a; },
  tick() {
    if (DB.cfg.assets.length !== this.na) this.ensureCfg();
    const now = Date.now(); const i = this.idx(now);
    const runNow = new Map();
    this.sensors().forEach(s => {
      const t = this.type(s); const d = this.gen(s);
      d.v = this.grow(d.v, i);
      let x = 1;
      if (!t.env) {
        if (!runNow.has(s.assetId)) {
          const on = Sim.data.has(s.assetId) && Sim.current(s.assetId)?.on ? 1 : 0;
          const r = this.grow(this.runFlags(s.assetId), i); r[i] = on; this.run.set(s.assetId, r);
          runNow.set(s.assetId, on);
        }
        const on = runNow.get(s.assetId);
        const dtMin = Math.min(5, (now - d.lt) / 1000) / 60;
        d.x += (on - d.x) * (t.tau ? 1 - Math.exp(-dtMin / t.tau) : 1); x = d.x;
      }
      d.lt = now;
      d.n = 0.97 * d.n + 0.24 * gaussR();
      const val = this.value(s, now, x, d.n);
      if (d.ai !== i) { d.ai = i; d.acc = 0; d.cnt = 0; }
      d.acc += val; d.cnt++; d.v[i] = d.acc / d.cnt;
      d.cur = val;
      d.ema = isFinite(d.ema) ? d.ema * 0.85 + val * 0.15 : val;
      this.check(s, d, now, false, t.env || d.x > 0.8);
    });
  },

  /* ---------- limits, score, alarms ---------- */
  /* 0 at normal, 1 at the warning limit, 2 at the critical limit */
  pos(s, v) {
    if (s.warn == null || s.crit == null || v == null || !isFinite(v)) return 0;
    const sg = s.dir === 'lo' ? -1 : 1;
    const a = (v - s.nom) * sg, w = (s.warn - s.nom) * sg, c = (s.crit - s.nom) * sg;
    if (w <= 0 || c <= w) return 0;
    return a <= w ? a / w : 1 + (a - w) / (c - w);
  },
  levelOf(s, v, prev = 0) {
    const p = this.pos(s, v);
    if (p >= 2 || (prev === 2 && p > 1.85)) return 2;
    if (p >= 1 || (prev >= 1 && p > 0.85)) return 1;
    return 0;
  },
  /* low-side process sensors (tension, test pressure) read near zero when the machine stops; that is not a fault */
  eff(s, v, running) { return !running && s.dir === 'lo' && !this.isEnv(s) ? s.nom : v; },
  now(s) { const d = this.gen(s); return this.eff(s, d.ema, this.isEnv(s) || d.x > 0.8); },
  score(p) { return p <= 0.5 ? 100 : p <= 1 ? 100 - 16 * (p - 0.5) / 0.5 : p <= 2 ? 84 - 25 * (p - 1) : Math.max(5, 59 - 30 * (p - 2)); },
  check(s, d, at, silent, running = true) {
    const v = this.eff(s, d.ema, running);
    const lvl = this.levelOf(s, v, d.lvl);
    if (lvl > d.lvl && s.alarm && at - (d.last[lvl] || 0) > 2 * HOUR) { d.last[lvl] = at; this.raise(s, lvl, v, at, silent); }
    d.lvl = lvl;
  },
  raise(s, lvl, v, at, silent) {
    const sev = lvl === 2 ? 'critical' : 'warning'; const lim = lvl === 2 ? s.crit : s.warn;
    const al = { id: uid('a'), at, ruleId: 'sensor:' + s.id, name: `${s.name} ${s.dir === 'lo' ? 'low' : 'high'}`, severity: sev, type: 'sensor', assetId: s.assetId,
      desc: `${s.name} ${fmtNum(v, s.dec)} ${s.unit}, ${sev} limit ${s.dir === 'lo' ? '≤' : '≥'} ${fmtNum(lim, s.dec)} ${s.unit}`, ackBy: null, ackAt: null, channels: lvl === 2 ? ['Email', 'LINE'] : ['LINE'] };
    Sim.alarms.push(al);
    if (!silent) Sim.listeners.forEach(fn => fn('alarm', al, DB.asset(s.assetId)));
  },
  seedAlarms() {
    const now = Date.now();
    this.sensors().filter(s => s.alarm && s.warn != null).forEach(s => {
      const d = this.data.get(s.id); const end = d.ai;
      const runs = this.isEnv(s) ? null : this.run.get(s.assetId);
      const live = { ema: d.v[0], lvl: 0, last: {} };
      for (let i = 1; i < end; i++) { live.ema = live.ema * 0.7 + d.v[i] * 0.3; this.check(s, live, this.start + i * MIN, true, !runs || !!runs[i]); }
      live.ema = d.ema; this.check(s, live, now, true, this.isEnv(s) || d.x > 0.8);
      Object.assign(d, { lvl: live.lvl, last: live.last });
    });
    Sim.alarms.sort((a, b) => a.at - b.at);
    Sim.alarms.forEach((a, i) => { if (a.type === 'sensor' && !a.ackBy && a.at < now - 5 * HOUR) { a.ackBy = i % 2 ? 'maint.tech' : 'manager'; a.ackAt = a.at + (6 + (i % 40)) * MIN; } });
  },

  /* ---------- views over the data ---------- */
  series(s, from, to) {
    const d = this.gen(s); const span = to - from;
    const step = span <= 2 * HOUR ? 1 : span <= 26 * HOUR ? 5 : 30;
    const i0 = Math.max(0, this.idx(from)), i1 = Math.min(this.idx(to), d.v.length - 1);
    const pts = [];
    for (let i = i0; i <= i1; i += step) {
      let sum = 0, c = 0;
      for (let j = i; j < Math.min(i + step, i1 + 1); j++) if (!isNaN(d.v[j])) { sum += d.v[j]; c++; }
      pts.push({ t: this.start + i * MIN, v: c ? sum / c : null });
    }
    return { pts, size: step * MIN };
  },
  /* linear trend of hourly running averages over 72 h → time until the next limit */
  predict(s) {
    if (s.warn == null || s.crit == null) return null;
    const d = this.gen(s); const runs = this.isEnv(s) ? null : this.run.get(s.assetId);
    const i1 = d.ai; const xs = [], ys = [];
    for (let h = 0; h < 72; h++) {
      let sum = 0, c = 0;
      for (let i = i1 - (h + 1) * 60 + 1; i <= i1 - h * 60; i++) if (i >= 0 && !isNaN(d.v[i]) && (!runs || runs[i])) { sum += d.v[i]; c++; }
      if (c >= 20) { xs.push(-h); ys.push(sum / c); }
    }
    if (xs.length < 24) return null;
    const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
    let sxy = 0, sxx = 0, syy = 0;
    xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
    const b = sxy / sxx, a = my - b * mx, r2 = syy ? sxy * sxy / (sxx * syy) : 0;
    const sg = s.dir === 'lo' ? -1 : 1;
    if (b * sg <= 0 || r2 < 0.6) return null;
    const p = this.pos(s, a); if (p >= 2) return null;
    const target = p < 1 ? s.warn : s.crit;
    const hours = (target - a) / b;
    if (hours > 24 * 30) return null;
    return { hours: Math.max(0, hours), to: target === s.warn ? 'warning' : 'critical', perDay: b * 24 };
  },
  runHoursSince(mid, t) {
    const now = Date.now(); let ms = 0;
    (Sim.data.get(mid)?.segs || []).forEach(sg => { if (sg.on) ms += overlap(sg.s, sg.e ?? now, t, now); });
    return ms / HOUR;
  },
  unitsSince(mid, t) {
    const d = Sim.data.get(mid); if (!d) return 0;
    const h0 = Math.max(0, Sim.hourIdx(t)); let u = 0;
    for (let h = h0; h < d.tot.length; h++) u += d.tot[h] * (h === h0 ? 1 - ((t - Sim.start) % HOUR) / HOUR : 1);
    return u;
  },
  maint(mid) {
    const mt = DB.cfg.maint[mid]; if (!mt) return null;
    const runH = this.runHoursSince(mid, mt.lastPM);
    const out = { ...mt, runH, pmPct: runH / mt.pmHours };
    if (mt.toolLimit) { out.toolCount = this.unitsSince(mid, mt.lastTool); out.toolPct = out.toolCount / mt.toolLimit; }
    return out;
  },
  energy(mid, from, to) {
    const s = this.sensors(mid).find(x => x.type === 'pwr'); if (!s) return null;
    const d = this.gen(s); let kwh = 0;
    for (let i = Math.max(0, this.idx(from)); i <= Math.min(this.idx(to), d.v.length - 1); i++) if (!isNaN(d.v[i])) kwh += d.v[i] / 60;
    return kwh;
  },
  machine(mid) {
    const list = this.sensors(mid).filter(s => s.warn != null);
    let minS = 100, sum = 0, worst = null;
    list.forEach(s => { const sc = this.score(this.pos(s, this.now(s))); sum += sc; if (sc < minS) { minS = sc; worst = s; } });
    const avg = list.length ? sum / list.length : 100;
    let h = minS - (100 - avg) * 0.2;
    const mt = this.maint(mid);
    if (mt && (mt.pmPct >= 1 || mt.toolPct >= 1)) h = Math.min(h, 80);
    h = Math.max(0, Math.round(h));
    const preds = list.map(s => ({ s, p: this.predict(s) })).filter(x => x.p).sort((a, b) => a.p.hours - b.p.hours);
    return { score: h, st: h >= 85 ? 'good' : h >= 60 ? 'warn' : 'crit', worst: minS < 92 ? worst : null, maint: mt, preds, kind: machineKind(DB.asset(mid)).kind };
  },
  actions(mid) {
    const out = []; const H = this.machine(mid);
    this.sensors(mid).forEach(s => { const d = this.gen(s); if (d.lvl) out.push({ sev: d.lvl === 2 ? 'crit' : 'warn', text: `${s.name} is ${fmtNum(d.ema, s.dec)} ${s.unit}. ${this.type(s).fix}` }); });
    H.preds.filter(x => x.p.hours < 14 * 24 && !this.gen(x.s).lvl).forEach(({ s, p }) => out.push({ sev: 'warn', text: `${s.name} reaches its ${p.to} limit in ${fmtETA(p.hours)}. Plan it at the next stop: ${this.type(s).fix}` }));
    const mt = H.maint;
    if (mt) {
      if (mt.pmPct >= 1) out.push({ sev: 'crit', text: `Preventive maintenance is overdue by ${fmtNum(mt.runH - mt.pmHours)} running hours. Schedule it at the next planned stop.` });
      else if (mt.pmPct >= 0.9) out.push({ sev: 'warn', text: `Preventive maintenance is due in ${fmtNum(mt.pmHours - mt.runH)} running hours. Book a slot with the planner.` });
      if (mt.toolPct >= 1) out.push({ sev: 'crit', text: `${mt.toolName} passed the limit (${fmtNum(mt.toolCount)} of ${fmtNum(mt.toolLimit)}). Do the ${mt.toolEvent.toLowerCase()} now to protect quality.${Maint.toolPartNote(mid)}` });
      else if (mt.toolPct >= 0.9) out.push({ sev: 'warn', text: `${mt.toolName} at ${Math.round(mt.toolPct * 100)}% of limit. Prepare parts for the ${mt.toolEvent.toLowerCase()}.${Maint.toolPartNote(mid)}` });
    }
    return out;
  },
  record(mid, kind, note, by) {
    const now = Date.now(); const mt = DB.cfg.maint[mid];
    if (kind === 'pm') mt.lastPM = now;
    if (kind === 'tool' && mt.toolLimit) mt.lastTool = now;
    if (kind === 'pm' || kind === 'repair') this.sensors(mid).forEach(s => { const d = this.gen(s); if (DRIFTS[s.id] && this.drift(s, now)) d.fixAt = now; });
    DB.cfg.maintLog.push({ id: uid('mx'), mid, at: now, kind, note, by });
    DB.save();
  },
};
const MAINT_KIND = { pm: 'Preventive maintenance', tool: 'Tool change', repair: 'Repair', inspect: 'Inspection' };
function fmtETA(h) { return h < 1 ? 'less than 1 hour' : h < 48 ? `about ${Math.round(h)} hours` : `about ${fmtNum(h / 24, 1)} days`; }
