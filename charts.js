/* ==========================================================================
   OEE demo — SVG charts (no library). Colours come from CSS variables so
   every chart follows the light/dark theme.
   ========================================================================== */
'use strict';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const Charts = {
  levelVar(v) { return v == null ? '--idle' : v >= 0.85 ? '--good' : v >= 0.6 ? '--warn' : '--crit'; },

  gauge(v, label, text) {
    const r = 42, c = 2 * Math.PI * r;
    const pct = v == null ? 0 : Math.max(0, Math.min(1, v));
    const col = this.levelVar(v);
    return `<div class="gauge" role="img" aria-label="${esc(label)} ${v == null ? 'no data' : (v * 100).toFixed(1) + '%'}">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="${r}" style="fill:none;stroke:var(--line);stroke-width:7"/>
        <circle cx="50" cy="50" r="${r}" transform="rotate(-90 50 50)" style="fill:none;stroke:var(${col});stroke-width:7;stroke-linecap:round;stroke-dasharray:${(pct * c).toFixed(1)} ${c.toFixed(1)};transition:stroke-dasharray .6s"/>
      </svg>
      <div class="val"><b style="color:var(${col})">${text ?? (v == null ? '–' : (v * 100).toFixed(1) + '%')}</b><span>${esc(label)}</span></div>
    </div>`;
  },

  timeLabel(t, size) {
    const d = new Date(t);
    if (size < 6 * HOUR) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (size < DAY) return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}h`;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  },

  /* multi-series area / line chart. series: [{key,label,color}] ; pts: [{t, key: value}] */
  area(pts, series, { W = 700, H = 240, yMax = 1.2, pct = true, fill = true, size = HOUR, fmt } = {}) {
    if (!pts.length) return `<div class="chart-empty">No data in this period.</div>`;
    const L = 46, R = 12, T = 10, B = 26, w = W - L - R, h = H - T - B;
    const x = i => L + (pts.length === 1 ? w / 2 : i * w / (pts.length - 1));
    const y = v => T + h - Math.max(0, Math.min(v, yMax)) / yMax * h;
    const ticks = 4; let g = '';
    for (let i = 0; i <= ticks; i++) {
      const v = yMax * i / ticks, yy = y(v);
      g += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 8}" y="${yy + 3.5}" text-anchor="end">${fmt ? fmt(v) : pct ? Math.round(v * 100) + '%' : fmtNum(v)}</text>`;
    }
    const step = Math.max(1, Math.ceil(pts.length / Math.max(2, Math.floor(w / 90))));
    pts.forEach((p, i) => { if (i % step === 0) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${this.timeLabel(p.t, size)}</text>`; });
    let body = '';
    series.forEach(s => {
      const pp = pts.map((p, i) => [x(i), p[s.key] == null ? null : y(p[s.key])]).filter(q => q[1] != null);
      if (!pp.length) return;
      const line = pp.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join('');
      if (fill) body += `<path d="${line}L${pp[pp.length - 1][0]},${T + h}L${pp[0][0]},${T + h}Z" style="fill:var(${s.color});opacity:.13"/>`;
      body += `<path d="${line}" style="fill:none;stroke:var(${s.color});stroke-width:2;stroke-linejoin:round${s.dash ? ';stroke-dasharray:5 4' : ''}"/>`;
      const lp = pp[pp.length - 1];
      body += `<circle cx="${lp[0]}" cy="${lp[1]}" r="3.5" style="fill:var(${s.color});stroke:var(--bg);stroke-width:2"/>`;
    });
    // hover targets
    let hov = '';
    pts.forEach((p, i) => {
      const tip = `${fmtDT(p.t)}\n` + series.map(s => `${s.label}: ${p[s.key] == null ? '–' : pct ? (p[s.key] * 100).toFixed(1) + '%' : fmtNum(p[s.key], 1)}`).join('\n');
      const bw = pts.length === 1 ? w : w / (pts.length - 1);
      hov += `<rect x="${x(i) - bw / 2}" y="${T}" width="${bw}" height="${h}" style="fill:transparent"><title>${esc(tip)}</title></rect>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}${body}${hov}</svg>`;
  },

  legend(series) { return `<div class="legend">${series.map(s => `<span><i style="background:var(${s.color})"></i>${esc(s.label)}</span>`).join('')}</div>`; },

  /* vertical bars. items: [{label, value, color, tip}] */
  bars(items, { W = 500, H = 220, fmt = v => fmtNum(v), color = '--accent' } = {}) {
    if (!items.length) return `<div class="chart-empty">Nothing recorded in this period.</div>`;
    const L = 44, R = 8, T = 16, B = 34, w = W - L - R, h = H - T - B;
    const max = Math.max(...items.map(i => i.value), 1) * 1.12;
    const bw = Math.min(70, w / items.length * 0.62), gap = w / items.length;
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = max * i / 4, yy = T + h - v / max * h; g += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 8}" y="${yy + 3.5}" text-anchor="end">${fmt(v)}</text>`; }
    items.forEach((it, i) => {
      const bh = it.value / max * h, cx = L + gap * i + gap / 2;
      const lbl = it.label.length > 16 ? it.label.slice(0, 15) + '…' : it.label;
      g += `<rect x="${cx - bw / 2}" y="${T + h - bh}" width="${bw}" height="${Math.max(0, bh)}" rx="6" style="fill:var(${it.color || color})"><title>${esc(it.tip || `${it.label}: ${fmt(it.value)}`)}</title></rect>
        <text x="${cx}" y="${T + h - bh - 5}" text-anchor="middle" style="fill:var(--muted)">${fmt(it.value)}</text>
        <text class="lbl" x="${cx}" y="${H - 12}" text-anchor="middle">${esc(lbl)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
  },

  /* stacked bars good/bad. items: [{label, good, bad}] */
  stacked(items, { W = 500, H = 230 } = {}) {
    if (!items.length) return `<div class="chart-empty">No machines in scope.</div>`;
    const L = 46, R = 8, T = 12, B = 34, w = W - L - R, h = H - T - B;
    const max = Math.max(...items.map(i => i.good + i.bad), 1) * 1.08;
    const gap = w / items.length, bw = Math.min(54, gap * 0.6);
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = max * i / 4, yy = T + h - v / max * h; g += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 8}" y="${yy + 3.5}" text-anchor="end">${fmtNum(v)}</text>`; }
    items.forEach((it, i) => {
      const cx = L + gap * i + gap / 2, gh = it.good / max * h, bh = it.bad / max * h;
      const lbl = it.label.length > 14 ? it.label.slice(0, 13) + '…' : it.label;
      const tip = `${it.label}\nGood: ${fmtNum(it.good)}\nBad: ${fmtNum(it.bad)}`;
      g += `<g><title>${esc(tip)}</title><rect x="${cx - bw / 2}" y="${T + h - gh}" width="${bw}" height="${gh}" style="fill:var(--good);opacity:.85"/>
        <rect x="${cx - bw / 2}" y="${T + h - gh - bh}" width="${bw}" height="${bh}" rx="5" style="fill:var(--crit);opacity:.85"/></g>
        <text class="lbl" x="${cx}" y="${H - 12}" text-anchor="middle">${esc(lbl)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
  },

  /* Gantt-like availability timeline */
  timeline(rows, from, to, { W = 900 } = {}) {
    if (!rows.length) return `<div class="chart-empty">No machines in scope.</div>`;
    to = Math.min(to, Date.now());
    const L = Math.min(190, W * 0.3), R = 10, T = 6, rh = 24, B = 24, w = W - L - R, H = T + rows.length * rh + B;
    const x = t => L + (t - from) / (to - from) * w;
    const col = { run: '--good', warn: '--warn', crit: '--crit' };
    let g = '';
    const n = Math.max(2, Math.floor(w / 110));
    for (let i = 0; i <= n; i++) {
      const t = from + (to - from) * i / n, xx = x(t);
      g += `<line class="grid-line" x1="${xx}" x2="${xx}" y1="${T}" y2="${T + rows.length * rh}"/><text x="${xx}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === n ? 'end' : 'middle'}">${this.timeLabel(t, (to - from) / n)}</text>`;
    }
    rows.forEach((r, i) => {
      const y = T + i * rh;
      const lbl = r.label.length > 26 ? r.label.slice(0, 25) + '…' : r.label;
      g += `<text class="lbl" x="${L - 10}" y="${y + rh / 2 + 4}" text-anchor="end">${esc(lbl)}</text>`;
      g += `<rect x="${L}" y="${y + 4}" width="${w}" height="${rh - 8}" rx="4" style="fill:var(--line)"/>`;
      r.segs.forEach(s => {
        const x0 = x(s.s), x1 = x(s.e); if (x1 - x0 < 0.3) return;
        g += `<rect x="${x0}" y="${y + 4}" width="${Math.max(0.6, x1 - x0)}" height="${rh - 8}" style="fill:var(${col[s.state]})"><title>${esc(`${r.label}\n${s.reason}\n${fmtDT(s.s)} → ${fmtDT(s.e)} (${fmtHMS((s.e - s.s) / 1000)})`)}</title></rect>`;
      });
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
  },

  /* sensor trend with shaded warning / critical zones. pts: [{t, v}], s: sensor {warn, crit, dir, unit, dec} */
  trend(pts, s, { W = 520, H = 190 } = {}) {
    const vals = pts.map(p => p.v).filter(v => v != null);
    if (!vals.length) return `<div class="chart-empty">No readings in this period.</div>`;
    const lims = [s.warn, s.crit].filter(v => v != null);
    let lo = Math.min(...vals, ...lims), hi = Math.max(...vals, ...lims);
    const padY = (hi - lo) * 0.08 || 1; lo -= padY; hi += padY;
    const L = 52, R = 12, T = 10, B = 24, w = W - L - R, h = H - T - B;
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const x = t => L + (t1 === t0 ? w / 2 : (t - t0) / (t1 - t0) * w);
    const y = v => T + h - (v - lo) / (hi - lo) * h;
    const dec = hi - lo < 2 ? 2 : hi - lo < 20 ? 1 : 0;
    let g = '';
    if (s.warn != null && s.crit != null) {
      const zone = (a, b, c) => { const ya = y(a), yb = y(b); g += `<rect x="${L}" y="${Math.min(ya, yb)}" width="${w}" height="${Math.abs(ya - yb)}" style="fill:var(${c})"/>`; };
      if (s.dir === 'lo') { zone(s.warn, s.crit, '--warn-soft'); zone(s.crit, lo, '--crit-soft'); } else { zone(s.warn, s.crit, '--warn-soft'); zone(s.crit, hi, '--crit-soft'); }
    }
    for (let i = 0; i <= 4; i++) { const v = lo + (hi - lo) * i / 4, yy = y(v); g += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 8}" y="${yy + 3.5}" text-anchor="end">${fmtNum(v, dec)}</text>`; }
    const n = Math.max(2, Math.floor(w / 100));
    for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; g += `<text x="${x(t)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === n ? 'end' : 'middle'}">${this.timeLabel(t, (t1 - t0) / n)}</text>`; }
    [[s.warn, '--warn', 'Warning'], [s.crit, '--crit', 'Critical']].forEach(([v, c, l]) => { if (v == null) return; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" style="stroke:var(${c});stroke-dasharray:5 4;stroke-width:1.2"/><text x="${W - R - 4}" y="${y(v) - 4}" text-anchor="end" style="fill:var(${c})">${l} ${fmtNum(v, s.dec)}</text>`; });
    let d = '', pen = false;
    pts.forEach(p => { if (p.v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`; pen = true; });
    g += `<path d="${d}" style="fill:none;stroke:var(--accent);stroke-width:1.8;stroke-linejoin:round"/>`;
    const last = [...pts].reverse().find(p => p.v != null);
    g += `<circle cx="${x(last.t)}" cy="${y(last.v)}" r="3.5" style="fill:var(--accent);stroke:var(--bg);stroke-width:2"/>`;
    const bw = w / Math.max(1, pts.length - 1);
    pts.forEach(p => { g += `<rect x="${x(p.t) - bw / 2}" y="${T}" width="${bw}" height="${h}" style="fill:transparent"><title>${esc(`${fmtDT(p.t)}\n${s.name}: ${p.v == null ? '–' : fmtNum(p.v, s.dec) + ' ' + s.unit}`)}</title></rect>`; });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.name)} trend">${g}</svg>`;
  },

  /* SPC control chart. gs: [{t, [key]}]; lines at cl/ucl/lcl (+ optional spec); bad(g) marks out-of-control points */
  control(gs, key, { cl, ucl, lcl, spec = null, dec = 2, W = 900, H = 230, bad = () => false } = {}) {
    if (!gs.length) return `<div class="chart-empty">No steady running data in this period.</div>`;
    const vals = gs.map(g => g[key]); const lines = [cl, ucl, lcl, spec].filter(v => v != null);
    let lo = Math.min(...vals, ...lines), hi = Math.max(...vals, ...lines);
    const padY = (hi - lo) * 0.08 || 1; lo -= padY; hi += padY;
    const L = 56, R = 70, T = 10, B = 24, w = W - L - R, h = H - T - B;
    const x = i => L + (gs.length === 1 ? w / 2 : i * w / (gs.length - 1));
    const y = v => T + h - (v - lo) / (hi - lo) * h;
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = lo + (hi - lo) * i / 4, yy = y(v); g += `<line class="grid-line" x1="${L}" x2="${L + w}" y1="${yy}" y2="${yy}"/><text x="${L - 8}" y="${yy + 3.5}" text-anchor="end">${fmtNum(v, dec)}</text>`; }
    const step = Math.max(1, Math.ceil(gs.length / Math.max(2, Math.floor(w / 90))));
    gs.forEach((p, i) => { if (i % step === 0) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${this.timeLabel(p.t, HOUR)}</text>`; });
    [[ucl, '--crit', 'UCL', '5 4'], [cl, '--muted', 'CL', ''], [lcl, '--crit', 'LCL', '5 4'], [spec, '--warn', 'Limit', '2 3']].forEach(([v, c, l, d]) => {
      if (v == null) return;
      g += `<line x1="${L}" x2="${L + w}" y1="${y(v)}" y2="${y(v)}" style="stroke:var(${c});stroke-width:1.2${d ? `;stroke-dasharray:${d}` : ''}"/><text x="${L + w + 6}" y="${y(v) + 3.5}" style="fill:var(${c})">${l} ${fmtNum(v, dec)}</text>`;
    });
    g += `<path d="${gs.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join('')}" style="fill:none;stroke:var(--accent);stroke-width:1.6"/>`;
    gs.forEach((p, i) => { const b = bad(p); g += `<circle cx="${x(i)}" cy="${y(p[key])}" r="${b ? 4.5 : 2.8}" style="fill:var(${b ? '--crit' : '--accent'});stroke:var(--bg);stroke-width:1.5"><title>${esc(`${fmtDT(p.t)}\n${fmtNum(p[key], dec)}${p.flags.length ? '\n' + p.flags.join('\n') : ''}`)}</title></circle>`; });
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
  },

  spark(values, color, { W = 220, H = 44 } = {}) {
    const v = values.filter(x => x != null);
    if (v.length < 2) return '';
    const max = Math.max(...v, 0.0001), min = Math.min(...v, 0);
    const x = i => 2 + i * (W - 4) / (values.length - 1);
    const y = val => H - 3 - (val - min) / (max - min || 1) * (H - 8);
    const pts = values.map((val, i) => val == null ? null : [x(i), y(val)]).filter(Boolean);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:${H}px" aria-hidden="true">
      <path d="${d}L${last[0]},${H}L${pts[0][0]},${H}Z" style="fill:var(${color});opacity:.16"/>
      <path d="${d}" style="fill:none;stroke:var(${color});stroke-width:1.8" vector-effect="non-scaling-stroke"/></svg>`;
  },
};
