/* ==========================================================================
   OEE demo — pages for work orders, spare parts, energy, SPC and shift log.
   Logic lives in maint.js. These pages use app.js helpers (head, table,
   openModal…) that are looked up when a page renders, so this file loads
   before app.js.
   ========================================================================== */
'use strict';

const woPill = w => pill(WO_STATUS[w.status][1], WO_STATUS[w.status][0]);
const prioPill = p => pill(WO_PRIO[p][1], WO_PRIO[p][0]);
const userName = u => DB.cfg.users.find(x => x.username === u)?.fullName || u || '–';
const woById = id => DB.cfg.workOrders.find(w => w.id === id);
const statTile = (title, val, sub, col = '--text') => `<div class="card stat"><h3>${esc(title)}</h3><b style="color:var(${col})">${val}</b><span>${sub}</span></div>`;
const segBtns = (act, cur, opts) => `<div class="seg" role="group">${opts.map(([k, l]) => `<button class="${cur === k ? 'on' : ''}" data-act="${act}" data-arg="${k}">${l}</button>`).join('')}</div>`;
const kvrow = (l, v) => `<div class="kvrow"><span>${esc(l)}</span><div>${v}</div></div>`;

/* ---------- work order ---------- */
function pWorkOrder() {
  const ed = canEdit('work_order'); const now = Date.now();
  const all = DB.cfg.workOrders.filter(w => DB.asset(w.mid) && DB.isUnder(w.mid, S.assetId) && assetLevel(w.mid) !== 'deny').sort((a, b) => b.createdAt - a.createdAt);
  const act = all.filter(w => Maint.active(w));
  const late = act.filter(w => w.dueAt && w.dueAt < now);
  const done30 = all.filter(w => w.status === 'done' && w.doneAt >= now - 30 * DAY);
  const list = S.woFilter === 'active' ? act : S.woFilter === 'done' ? all.filter(w => !Maint.active(w)) : all;
  const rel = opMachines().map(m => ({ id: m.id, m, ...Maint.reliability(m.id, now - 30 * DAY, now), open: Maint.openFor(m.id).length })).sort((a, b) => b.n - a.n);
  const tot = rel.reduce((a, r) => ({ n: a.n + r.n, runH: a.runH + r.runH, downMin: a.downMin + r.downMin }), { n: 0, runH: 0, downMin: 0 });
  const btn = (a, w, l, cls = '') => `<button class="btn sm ${cls}" data-act="${a}" data-arg="${w.id}">${l}</button>`;
  const actions = w => !ed || !Maint.active(w) ? '' : `<div class="acts">${w.status === 'open' ? btn('wo-assign', w, 'Assign') : ''}${w.status !== 'in_progress' ? btn('wo-start', w, 'Start') : ''}${btn('wo-done', w, 'Complete', 'primary')}</div>`;
  EXPORTS.wo = () => exportCSV('Work_Orders', ['WO No', 'Machine', 'Title', 'Type', 'Priority', 'Status', 'Assignee', 'Created', 'Due', 'Started', 'Done', 'Result', 'Parts'], list.map(w => [w.no, DB.asset(w.mid).name, w.title, WO_TYPE[w.type], w.priority, WO_STATUS[w.status][0], w.assignee || '', fmtDT(w.createdAt), fmtDT(w.dueAt), fmtDT(w.startedAt), fmtDT(w.doneAt), w.result, w.parts.map(p => `${Maint.part(p.id)?.code} x${p.qty}`).join('; ')]));
  EXPORTS.rel = () => exportCSV('Reliability_30_days', ['Machine', 'Breakdowns', 'Downtime min', 'MTBF h', 'MTTR min', 'Open WO'], rel.map(r => [r.m.name, r.n, r.downMin.toFixed(0), r.mtbf?.toFixed(1) ?? '', r.mttr?.toFixed(1) ?? '', r.open]));
  return head('Work Order', `${segBtns('wo-filter', S.woFilter, [['active', 'Active'], ['done', 'Closed'], ['all', 'All']])}${ed ? `<button class="btn primary" data-act="wo-new">${ic('plus')}New work order</button>` : ''}`, 'Repair and maintenance jobs. Create them here, from an alarm, from Machine Health or from a checklist item that is not OK.') +
    `<div class="grid g4" style="margin-bottom:20px">
      ${statTile('Open', act.filter(w => w.status !== 'in_progress').length, `${act.filter(w => !w.assignee).length} not assigned yet`, '--warn')}
      ${statTile('In progress', act.filter(w => w.status === 'in_progress').length, 'being worked on now', '--accent')}
      ${statTile('Overdue', late.length, 'past the due date', late.length ? '--crit' : '--good')}
      ${statTile('Closed in 30 days', done30.length, `MTBF ${tot.n ? fmtNum(tot.runH / tot.n, 1) + ' h' : '–'} · MTTR ${tot.n ? fmtNum(tot.downMin / tot.n) + ' min' : '–'}`, '--good')}</div>
    <div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Work orders</h3>${csvBtn('export', 'wo')}</div>${table('wo', [
      { h: 'WO No', f: w => `<button class="link mono" data-act="wo-view" data-arg="${w.id}">${esc(w.no)}</button>` }, { h: 'Machine', f: w => esc(DB.asset(w.mid).name) }, { h: 'Title', f: w => esc(w.title) },
      { h: 'Type', f: w => esc(WO_TYPE[w.type]) }, { h: 'Priority', f: w => prioPill(w.priority) }, { h: 'Status', f: w => woPill(w) }, { h: 'Assignee', f: w => esc(userName(w.assignee)) },
      { h: 'Due', f: w => `<span class="mono" style="${Maint.active(w) && w.dueAt && w.dueAt < now ? 'color:var(--crit)' : ''}">${fmtDT(w.dueAt)}</span>` }, { h: 'Action', cls: 'num', f: actions }], list, { pageSize: 8, empty: 'No work orders here.' })}</div>
    <div class="card"><div class="card-head"><h3>Reliability <span class="hint">last 30 days · a breakdown is a stop with a repair reason</span></h3>${csvBtn('export', 'rel')}</div>${table('rel', [
      { h: 'Machine', f: r => esc(r.m.name) }, { h: 'Breakdowns', cls: 'num', f: r => fmtNum(r.n) }, { h: 'Downtime', cls: 'num', f: r => `${fmtNum(r.downMin)} min` },
      { h: 'MTBF', cls: 'num', f: r => r.mtbf == null ? '–' : `${fmtNum(r.mtbf, 1)} h` }, { h: 'MTTR', cls: 'num', f: r => r.mttr == null ? '–' : `${fmtNum(r.mttr)} min` },
      { h: 'Open WO', cls: 'num', f: r => r.open ? pill('warn', String(r.open)) : '0' }], rel, { pageSize: 8 })}</div>`;
}
function woForm(pre = {}) {
  const ms = DB.cfg.assets.filter(a => a.isMachine && assetLevel(a.id) !== 'deny');
  const mid0 = pre.mid || (scope().isMachine ? scope().id : '');
  const due = Date.now() + ({ urgent: 4, high: 24 }[pre.priority] || 72) * HOUR;
  openModal({
    title: 'New work order', wide: true, saveLabel: 'Create',
    body: row('Machine', `<select class="input" id="wo-mid"><option value="">Select machine</option>${ms.map(m => `<option value="${m.id}" ${m.id === mid0 ? 'selected' : ''}>${esc(DB.path(m.id))}</option>`).join('')}</select>`, 'wo-mid', true) +
      row('Title', `<input class="input" id="wo-title" value="${esc(pre.title || '')}">`, 'wo-title', true) +
      row('Type', `<select class="input" id="wo-type">${Object.entries(WO_TYPE).map(([k, l]) => `<option value="${k}" ${(pre.type || 'corrective') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>`) +
      row('Priority', `<select class="input" id="wo-prio">${Object.entries(WO_PRIO).map(([k, [l]]) => `<option value="${k}" ${(pre.priority || 'normal') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>`) +
      row('Assign to', `<select class="input" id="wo-user"><option value="">Not assigned yet</option>${DB.cfg.users.filter(u => u.active).map(u => `<option value="${u.username}">${esc(u.fullName)} (${esc(u.username)})</option>`).join('')}</select>`) +
      row('Due', `<input class="input" type="datetime-local" id="wo-due" value="${toLocalInput(due)}" style="width:auto">`, 'wo-due', true) +
      row('Description', `<textarea class="input" id="wo-desc" rows="3">${esc(pre.desc || '')}</textarea>`, 'wo-desc', true) +
      row('Planned parts', `<select class="input" id="wo-parts" multiple size="5">${DB.cfg.parts.map(p => `<option value="${p.id}">${esc(p.code)} · ${esc(p.name)} (in store ${fmtNum(p.stock)})</option>`).join('')}</select>`, 'wo-parts'),
    onSave: () => {
      const d = { mid: fv('wo-mid'), title: fv('wo-title'), type: fv('wo-type'), priority: fv('wo-prio'), assignee: fv('wo-user') || null, dueAt: new Date(fv('wo-due')).getTime(), desc: fv('wo-desc'), alarmId: pre.alarmId || null,
        parts: [...document.getElementById('wo-parts').selectedOptions].map(o => ({ id: o.value, qty: 1 })) };
      let ok = setErr('wo-mid', d.mid ? '' : 'Choose the machine.');
      ok = setErr('wo-title', d.title ? '' : 'Title is required.') && ok;
      ok = setErr('wo-due', isFinite(d.dueAt) ? '' : 'Choose a due date.') && ok;
      ok = setErr('wo-desc', d.desc ? '' : 'Describe the problem or the job.') && ok;
      if (!ok) return;
      const w = Maint.create(d, S.user.username); closeModal();
      toast(`${esc(w.no)} created${w.assignee ? ` and assigned to ${esc(userName(w.assignee))}` : ''}.`, 'good'); render();
    },
  });
}
function woView(w) {
  const mono = t => `<span class="mono">${fmtDT(t)}</span>`;
  const al = w.alarmId && Sim.alarms.find(a => a.id === w.alarmId);
  openModal({
    title: `${w.no} · ${w.title}`, wide: true,
    body: kvrow('Machine', esc(DB.path(w.mid))) + kvrow('Type and priority', `${esc(WO_TYPE[w.type])} ${prioPill(w.priority)}`) + kvrow('Status', woPill(w)) + kvrow('Assignee', esc(userName(w.assignee))) +
      kvrow('Created', `${mono(w.createdAt)} by ${esc(userName(w.createdBy))}`) + kvrow('Due', mono(w.dueAt)) +
      (w.startedAt ? kvrow('Started', mono(w.startedAt)) : '') + (w.doneAt ? kvrow(w.status === 'done' ? 'Done' : 'Cancelled', `${mono(w.doneAt)}${w.status === 'done' ? ` · ${fmtNum((w.doneAt - w.startedAt) / MIN)} min work` : ''}`) : '') +
      kvrow('Description', esc(w.desc)) + (w.result ? kvrow('Result', esc(w.result)) : '') +
      kvrow(w.status === 'done' ? 'Parts used' : 'Planned parts', w.parts.length ? w.parts.map(u => { const p = Maint.part(u.id); return p ? `<span class="mono">${esc(p.code)}</span> ${esc(p.name)} × ${fmtNum(u.qty)} ${esc(p.unit)}` : ''; }).join('<br>') : '–') +
      (al ? kvrow('From alarm', `${esc(al.name)} · ${mono(al.at)}`) : ''),
    foot: `<button class="btn" data-act="modal-close" type="button">Close</button>${canEdit('work_order') && Maint.active(w) ? `<button class="btn danger" data-act="wo-cancel" data-arg="${w.id}" type="button">Cancel work order</button><button class="btn primary" data-act="wo-done" data-arg="${w.id}" type="button">Complete</button>` : ''}`,
  });
}
function woAssign(w) {
  openModal({
    title: `Assign ${w.no}`, saveLabel: 'Assign',
    body: row('Technician', `<select class="input" id="wa-user">${DB.cfg.users.filter(u => u.active).map(u => `<option value="${u.username}" ${u.username === 'maint.tech' ? 'selected' : ''}>${esc(u.fullName)} (${esc(u.username)})</option>`).join('')}</select>`, 'wa-user', true),
    onSave: () => { w.assignee = fv('wa-user'); w.status = 'assigned'; DB.save(); closeModal(); toast(`${esc(w.no)} assigned to ${esc(userName(w.assignee))}.`, 'good'); render(); },
  });
}
function woComplete(w) {
  const mt = DB.cfg.maint[w.mid]; const planned = Object.fromEntries(w.parts.map(p => [p.id, p.qty]));
  const ps = [...new Set([...w.parts.map(p => p.id), ...Maint.partsFor(w.mid).map(p => p.id)])].map(id => Maint.part(id)).filter(Boolean);
  const opts = [['', 'Do not log'], ['pm', 'Preventive maintenance (resets PM hours)'], ['repair', 'Repair'], ['inspect', 'Inspection']].concat(mt?.toolLimit ? [['tool', `${mt.toolEvent} (resets ${mt.toolName.toLowerCase()})`]] : []);
  const def = mt?.toolEvent && w.title.toLowerCase().includes(mt.toolEvent.split(' ')[0].toLowerCase()) ? 'tool' : WO_LOG[w.type];
  openModal({
    title: `Complete ${w.no}`, wide: true, saveLabel: 'Complete',
    body: row('Result', `<textarea class="input" id="wo-res" rows="3" placeholder="What was found and what was done"></textarea>`, 'wo-res', true) +
      row('Machine history', `<select class="input" id="wo-log">${opts.map(([k, l]) => `<option value="${k}" ${k === def ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`) +
      `<div><h3 style="font-size:13.5px;margin:0 0 8px">Parts used <span style="font-weight:400;font-size:12px;color:var(--muted)">taken out of store when you complete</span></h3><div class="table-wrap"><table><thead><tr><th>Part</th><th class="num">In store</th><th class="num">Used</th></tr></thead><tbody>${ps.map(p => `<tr><td><span class="mono">${esc(p.code)}</span> ${esc(p.name)}</td><td class="num">${fmtNum(p.stock)} ${esc(p.unit)}</td><td class="num"><input class="input" type="number" min="0" step="1" data-wopart="${p.id}" value="${planned[p.id] || 0}" style="width:90px" aria-label="Quantity of ${esc(p.name)}"></td></tr>`).join('')}</tbody></table></div><div class="err" id="wo-used-err" style="color:var(--crit);font-size:12px;margin-top:6px"></div></div>`,
    onSave: () => {
      const result = fv('wo-res'); let ok = setErr('wo-res', result ? '' : 'Write what was done.');
      const parts = [...document.querySelectorAll('[data-wopart]')].map(i => ({ id: i.dataset.wopart, qty: Math.max(0, Math.round(+i.value || 0)) })).filter(p => p.qty > 0);
      const short = parts.map(p => ({ ...p, p: Maint.part(p.id) })).find(x => x.qty > x.p.stock);
      ok = setErr('wo-used', short ? `Only ${fmtNum(short.p.stock)} ${short.p.unit} of ${short.p.name} in store.` : '') && ok;
      if (!ok) return;
      Maint.complete(w, { result, parts, logAs: fv('wo-log') }, S.user.username); closeModal();
      const low = parts.map(u => Maint.part(u.id)).filter(p => p.stock <= p.min);
      toast(`${esc(w.no)} completed.${low.length ? ` Reorder ${low.map(p => esc(p.name)).join(', ')}.` : ''}`, low.length ? 'warn' : 'good'); render();
    },
  });
}

/* ---------- spare part ---------- */
function pParts() {
  const ed = canEdit('spare_part'); const low = Maint.lowParts();
  const reserved = id => DB.cfg.workOrders.filter(w => Maint.active(w)).reduce((a, w) => a + (w.parts.find(p => p.id === id)?.qty || 0), 0);
  const value = DB.cfg.parts.reduce((a, p) => a + p.stock * p.cost, 0);
  const list = [...DB.cfg.parts].sort((a, b) => (a.stock - a.min) - (b.stock - b.min));
  EXPORTS.parts = () => exportCSV('Spare_Parts', ['Code', 'Name', 'Unit', 'In store', 'Minimum', 'Reserved', 'Unit cost', 'Used for', 'Location'], list.map(p => [p.code, p.name, p.unit, p.stock, p.min, reserved(p.id), p.cost, p.kinds.join(' / '), p.location]));
  return adminHead('Spare Part', `${btnEx('parts')}${ed ? btnAdd('part-add') : ''}`, `${list.length} items · stock value ${fmtNum(value)} THB · ${low.length ? `<b style="color:var(--crit)">${low.length} at or below minimum</b>` : 'all above minimum'}. Work orders take parts out of store when they are completed.`) +
    `<div class="card">${table('parts', [
      { h: 'Code', f: p => ed ? `<button class="link mono" data-act="part-edit" data-arg="${p.id}">${esc(p.code)}</button>` : `<span class="mono">${esc(p.code)}</span>` }, { h: 'Name', f: p => esc(p.name) },
      { h: 'Used for', f: p => esc(p.kinds.includes('*') ? 'All machines' : p.kinds.join(', ')) }, { h: 'Location', f: p => esc(p.location) },
      { h: 'In store', cls: 'num', f: p => `<b style="color:var(${p.stock <= 0 ? '--crit' : p.stock <= p.min ? '--warn' : '--text'})">${fmtNum(p.stock)}</b> ${esc(p.unit)}` }, { h: 'Minimum', cls: 'num', f: p => fmtNum(p.min) },
      { h: 'Reserved', cls: 'num', f: p => fmtNum(reserved(p.id)) }, { h: 'Status', f: p => p.stock <= 0 ? pill('crit', 'Out of stock') : p.stock <= p.min ? pill('warn', 'Reorder') : pill('good', 'OK') },
      { h: 'Unit cost', cls: 'num', f: p => fmtNum(p.cost) }, { h: 'Action', cls: 'num', f: p => ed ? `<button class="btn sm" data-act="part-recv" data-arg="${p.id}">${ic('plus')}Receive</button>` : '' }], list, { pageSize: 15 })}</div>`;
}
function partForm(p) {
  const kinds = ['*', ...MACHINE_KINDS.map(k => k.kind)];
  openModal({
    title: p ? 'Edit spare part' : 'New spare part', wide: true,
    body: row('Code', `<input class="input" id="pt-code" value="${esc(p?.code || '')}">`, 'pt-code', true) + row('Name', `<input class="input" id="pt-name" value="${esc(p?.name || '')}">`, 'pt-name', true) +
      row('Unit', `<input class="input" id="pt-unit" value="${esc(p?.unit || 'pcs')}" style="width:120px">`, 'pt-unit', true) +
      row('In store', `<input class="input" type="number" min="0" id="pt-stock" value="${p?.stock ?? 0}" style="width:120px">`, 'pt-stock', true) +
      row('Minimum', `<input class="input" type="number" min="0" id="pt-min" value="${p?.min ?? 1}" style="width:120px">`, 'pt-min', true) +
      row('Unit cost (THB)', `<input class="input" type="number" min="0" id="pt-cost" value="${p?.cost ?? 0}" style="width:140px">`, 'pt-cost') +
      row('Location', `<input class="input" id="pt-loc" value="${esc(p?.location || '')}">`, 'pt-loc') +
      row('Used for', `<select class="input" id="pt-kinds" multiple size="6">${kinds.map(k => `<option value="${esc(k)}" ${(p?.kinds || ['*']).includes(k) ? 'selected' : ''}>${k === '*' ? 'All machines' : esc(k)}</option>`).join('')}</select>`, 'pt-kinds'),
    onSave: () => {
      const d = { code: fv('pt-code'), name: fv('pt-name'), unit: fv('pt-unit'), stock: Number(fv('pt-stock')), min: Number(fv('pt-min')), cost: Number(fv('pt-cost')) || 0, location: fv('pt-loc'), kinds: [...document.getElementById('pt-kinds').selectedOptions].map(o => o.value) };
      let ok = setErr('pt-code', !d.code ? 'Code is required.' : DB.cfg.parts.some(x => x.code === d.code && x !== p) ? 'This code is already used.' : '');
      ok = setErr('pt-name', d.name ? '' : 'Name is required.') && ok;
      ok = setErr('pt-unit', d.unit ? '' : 'Unit is required.') && ok;
      ok = setErr('pt-stock', fv('pt-stock') !== '' && d.stock >= 0 ? '' : 'Enter 0 or more.') && ok;
      ok = setErr('pt-min', fv('pt-min') !== '' && d.min >= 0 ? '' : 'Enter 0 or more.') && ok;
      ok = setErr('pt-kinds', d.kinds.length ? '' : 'Choose at least one machine type.') && ok;
      if (!ok) return;
      if (p) Object.assign(p, d); else DB.cfg.parts.push({ id: uid('pt'), ...d });
      DB.save(); closeModal(); toast('Spare part saved.', 'good'); render();
    },
  });
}
function partRecv(p) {
  openModal({
    title: `Receive · ${p.name}`, saveLabel: 'Receive',
    body: row('Quantity', `<div class="inline"><input class="input" type="number" min="1" step="1" id="pr-qty" value="${Math.max(1, p.min * 2 - p.stock)}" style="width:120px"> ${esc(p.unit)}</div>`, 'pr-qty', true) +
      `<p style="margin:0;font-size:12.5px;color:var(--muted)">In store now: ${fmtNum(p.stock)} ${esc(p.unit)}, minimum ${fmtNum(p.min)}.</p>`,
    onSave: () => { const q = Math.round(Number(fv('pr-qty'))); if (!setErr('pr-qty', q > 0 ? '' : 'Enter a quantity above 0.')) return; p.stock += q; DB.save(); closeModal(); toast(`Received ${fmtNum(q)} ${esc(p.unit)} of ${esc(p.name)}. In store: ${fmtNum(p.stock)}.`, 'good'); render(); },
  });
}

/* ---------- energy ---------- */
function pEnergy() {
  const now = Date.now(), sod = startOfDay(now);
  const [from, to, bucket] = { today: [sod, now, HOUR], yesterday: [sod - DAY, sod, HOUR], '7d': [now - 7 * DAY, now, 6 * HOUR] }[S.eRange];
  const ms = DB.machinesUnder(S.assetId).filter(m => assetLevel(m.id) !== 'deny');
  const e = Energy.calc(ms.map(m => m.id), from, to, bucket); const tf = DB.cfg.tariff;
  const rows = e.per.map(r => { const pcs = calc(r.mid, from, to, false).total; return { ...r, id: r.mid, m: DB.asset(r.mid), pcs, whpc: pcs > 0 ? r.kwh * 1000 / pcs : null, cost: r.on * tf.on + (r.kwh - r.on) * tf.off }; }).sort((a, b) => b.kwh - a.kwh);
  const pcs = rows.reduce((a, r) => a + r.pcs, 0); const cost = e.on * tf.on + (e.kwh - e.on) * tf.off;
  const idlePct = e.kwh ? e.idle / e.kwh : 0;
  const ser = [{ key: 'kw', label: 'Average load', color: '--s-oee' }, { key: 'idleKw', label: 'Load while stopped', color: '--warn' }];
  const yMax = Math.max(1, ...e.buckets.map(b => b.kw)) * 1.15;
  const short = n => n.replace(/ machine/i, '').replace('Injection', 'Inj.').replace('Assembly', 'Assy').replace('Lamination', 'Lam.').replace('Pressure ', '').replace('Carbon Block ', 'CB ');
  EXPORTS.en = () => exportCSV(`Energy_${scope().name}`, ['Machine', 'kWh', 'On-peak kWh', 'Off-peak kWh', 'kWh while stopped', 'Pieces', 'Wh per piece', 'Peak kW', 'Cost THB'], rows.map(r => [r.m.name, r.kwh.toFixed(2), r.on.toFixed(2), (r.kwh - r.on).toFixed(2), r.idle.toFixed(2), Math.round(r.pcs), r.whpc?.toFixed(1) ?? '', r.peakKW.toFixed(1), r.cost.toFixed(0)]));
  return head('Energy', segBtns('e-range', S.eRange, [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days']]) + (canEdit('energy') ? `<button class="btn" data-act="tariff">${ic('sliders')}Tariff</button>` : ''),
    `From each machine's power meter. TOU: on-peak Mon–Fri 09:00–22:00 at ${fmtNum(tf.on, 2)} THB/kWh, other times ${fmtNum(tf.off, 2)} THB/kWh.`) +
    `<div class="grid g4" style="margin-bottom:20px">
      ${statTile('Energy', fmtNum(e.kwh), `kWh · plant peak ${fmtNum(e.plantPeak)} kW`, '--accent')}
      ${statTile('Energy cost', fmtNum(cost), `THB · ${fmtNum(e.kwh ? e.on / e.kwh * 100 : 0)}% of kWh on-peak`)}
      ${statTile('Energy per piece', pcs > 0 ? fmtNum(e.kwh * 1000 / pcs, 1) : '–', `Wh per piece · ${fmtNum(pcs)} pieces`)}
      ${statTile('Used while stopped', fmtNum(e.idle), `kWh, ${fmtNum(idlePct * 100, 1)}% of total · CO₂ ${fmtNum(e.kwh * tf.ef)} kg`, idlePct > 0.1 ? '--warn' : '--good')}</div>
    <div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Load profile <span class="hint">average kW per ${bucket === HOUR ? 'hour' : '6 hours'}</span></h3>${Charts.legend(ser)}${csvBtn('export', 'en')}</div>${chart(W => Charts.area(e.buckets, ser, { W, H: 240, yMax, pct: false, size: bucket, fmt: v => fmtNum(v) }))}</div>
    <div class="grid g2" style="margin-bottom:20px">
      <div class="card"><div class="card-head"><h3>Top consumers <span class="hint">kWh</span></h3></div>${chart(W => Charts.bars(rows.slice(0, 6).map(r => ({ label: short(r.m.name), value: r.kwh, color: '--s-oee', tip: `${r.m.name}: ${fmtNum(r.kwh, 1)} kWh` })), { W, fmt: v => fmtNum(v) }))}</div>
      <div class="card"><div class="card-head"><h3>Energy per piece <span class="hint">Wh per piece</span></h3></div>${chart(W => Charts.bars(rows.filter(r => r.whpc != null).sort((a, b) => b.whpc - a.whpc).slice(0, 6).map(r => ({ label: short(r.m.name), value: r.whpc, color: '--s-p', tip: `${r.m.name}: ${fmtNum(r.whpc, 1)} Wh/pc` })), { W, fmt: v => fmtNum(v) }))}</div></div>
    <div class="card"><div class="card-head"><h3>By machine</h3></div>${table('energy', [
      { h: 'Machine', f: r => `<button class="link" data-act="scope-go" data-arg="${r.mid}" data-page="machine_health">${esc(r.m.name)}</button>` }, { h: 'kWh', cls: 'num', f: r => fmtNum(r.kwh, 1) },
      { h: 'On-peak', cls: 'num', f: r => fmtNum(r.on, 1) }, { h: 'Off-peak', cls: 'num', f: r => fmtNum(r.kwh - r.on, 1) },
      { h: 'While stopped', cls: 'num', f: r => `<span style="color:var(${r.kwh && r.idle / r.kwh > 0.15 ? '--warn' : '--text'})">${fmtNum(r.idle, 1)}</span>` },
      { h: 'Pieces', cls: 'num', f: r => fmtNum(r.pcs) }, { h: 'Wh/pc', cls: 'num', f: r => r.whpc == null ? '–' : fmtNum(r.whpc, 1) }, { h: 'Peak kW', cls: 'num', f: r => fmtNum(r.peakKW, 1) }, { h: 'Cost THB', cls: 'num', f: r => fmtNum(r.cost) }], rows, { pageSize: 8 })}</div>`;
}
function tariffForm() {
  const tf = DB.cfg.tariff;
  openModal({
    title: 'Electricity tariff',
    body: row('On-peak (THB/kWh)', `<input class="input" type="number" step="0.0001" min="0" id="tf-on" value="${tf.on}" style="width:140px">`, 'tf-on', true) +
      row('Off-peak (THB/kWh)', `<input class="input" type="number" step="0.0001" min="0" id="tf-off" value="${tf.off}" style="width:140px">`, 'tf-off', true) +
      row('CO₂ factor (kg/kWh)', `<input class="input" type="number" step="0.0001" min="0" id="tf-ef" value="${tf.ef}" style="width:140px">`, 'tf-ef', true) +
      `<p style="margin:0;font-size:12.5px;color:var(--muted)">These are example rates. Enter the rates from your electricity bill (energy charge plus Ft) and your grid emission factor.</p>`,
    onSave: () => {
      const d = { on: Number(fv('tf-on')), off: Number(fv('tf-off')), ef: Number(fv('tf-ef')) };
      let ok = true; ['on', 'off', 'ef'].forEach(k => { ok = setErr('tf-' + k, fv('tf-' + k) !== '' && d[k] >= 0 ? '' : 'Enter 0 or more.') && ok; });
      if (!ok) return; Object.assign(tf, d); DB.save(); closeModal(); toast('Tariff saved.', 'good'); render();
    },
  });
}

/* ---------- SPC ---------- */
function pSpc() {
  const ms = DB.machinesUnder(S.assetId).filter(m => assetLevel(m.id) !== 'deny');
  if (!ms.length) return head('SPC') + '<div class="card empty">No machines in scope.</div>';
  const proc = mid => Health.sensors(mid).filter(s => s.warn != null && !Health.isEnv(s));
  if (!ms.some(m => m.id === S.spcMid)) S.spcMid = (ms.find(m => proc(m.id).some(s => DRIFTS[s.id])) || ms[0]).id;
  const ss = proc(S.spcMid); const s = ss.find(x => x.id === S.spcSensor) || ss.find(x => DRIFTS[x.id]) || ss[0];
  const sel = `${ms.length > 1 ? `<select class="input" id="spc-m" aria-label="Machine" style="width:auto">${ms.map(m => `<option value="${m.id}" ${m.id === S.spcMid ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>` : ''}<select class="input" id="spc-s" aria-label="Sensor" style="width:auto">${ss.map(x => `<option value="${x.id}" ${x.id === s?.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>`;
  const tools = sel + segBtns('spc-range', S.spcRange, [['24h', 'Last 24 hours'], ['3d', 'Last 3 days']]);
  const sub = 'X̄-R chart of a process sensor. Each point is 5 readings taken in 30 minutes of steady running. Control limits come from the first 3 days of the 7-day history.';
  if (!s) return head('SPC', tools, sub) + '<div class="card empty">This machine has no process sensor with limits.</div>';
  const now = Date.now(); const a = SPC.analyze(s, now - (S.spcRange === '3d' ? 3 : 1) * DAY, now);
  if (!a) return head('SPC', tools, sub) + '<div class="card empty">Not enough steady running data to set control limits for this sensor yet.</div>';
  const viol = a.gs.filter(g => g.flags.length).reverse();
  const cpkCol = v => v == null ? '--idle' : v >= 1.33 ? '--good' : v >= 1 ? '--warn' : '--crit';
  const dd = s.dec + 1; const L = a.lim;
  EXPORTS.spc = () => exportCSV(`SPC_${DB.asset(s.assetId).name}_${s.name}`, ['Subgroup start', 'X-bar', 'Range', 'CL', 'UCL', 'LCL', 'Rules'], a.gs.map(g => [fmtDT(g.t), g.x.toFixed(dd + 1), g.r.toFixed(dd + 1), L.cl.toFixed(dd + 1), L.ucl.toFixed(dd + 1), L.lcl.toFixed(dd + 1), g.flags.join('; ')]));
  return head('SPC', tools, sub) +
    `<div class="grid g4" style="margin-bottom:20px">
      ${statTile('Process mean', fmtNum(a.mean, dd), `${esc(s.unit)} · baseline ${fmtNum(L.cl, dd)}`, Math.abs(a.mean - L.cl) > 3 * L.sigma ? '--warn' : '--text')}
      ${statTile('Within σ', fmtNum(L.sigma, dd + 1), `${esc(s.unit)} · average range R̄ ÷ d₂`)}
      ${statTile('Cpk', a.cpk == null ? '–' : fmtNum(a.cpk, 2), `vs ${s.dir === 'lo' ? 'lower' : 'upper'} limit ${fmtNum(s.warn, s.dec)} · baseline ${a.cpkBase == null ? '–' : fmtNum(a.cpkBase, 2)} · 1.33+ is capable`, cpkCol(a.cpk))}
      ${statTile('Out of control', viol.length, `of ${a.gs.length} subgroups`, viol.length ? '--crit' : '--good')}</div>
    <div class="card" style="margin-bottom:20px"><div class="card-head"><h3>X̄ chart · ${esc(s.name)} <span class="hint">${esc(DB.asset(s.assetId).name)}</span></h3>${csvBtn('export', 'spc')}</div>${chart(W => Charts.control(a.gs, 'x', { cl: L.cl, ucl: L.ucl, lcl: L.lcl, spec: s.warn, dec: dd, W, bad: g => g.flags.some(f => f !== 'Range too wide') }))}</div>
    <div class="grid g2"><div class="card"><div class="card-head"><h3>R chart <span class="hint">range inside each subgroup</span></h3></div>${chart(W => Charts.control(a.gs, 'r', { cl: L.rcl, ucl: L.rucl, lcl: 0, dec: dd, W, H: 200, bad: g => g.flags.includes('Range too wide') }))}</div>
      <div class="card"><div class="card-head"><h3>Rule violations</h3></div>${table('spc-v', [{ h: 'Subgroup', f: g => `<span class="mono">${fmtDT(g.t)}</span>` }, { h: 'X̄', cls: 'num', f: g => fmtNum(g.x, dd) }, { h: 'Rule', f: g => g.flags.map(f => pill('crit', f)).join(' ') }], viol, { pageSize: 6, empty: 'No rule violations. The process is in control.' })}</div></div>`;
}

/* ---------- shift log ---------- */
function shiftSummary(scopeId, from, to) {
  to = Math.min(to, Date.now());
  const c = calc(scopeId, from, to, false);
  const al = Sim.alarms.filter(a => a.at >= from && a.at < to && DB.asset(a.assetId) && DB.isUnder(a.assetId, scopeId)).length;
  const wo = DB.cfg.workOrders.filter(w => w.createdAt >= from && w.createdAt < to && DB.asset(w.mid) && DB.isUnder(w.mid, scopeId)).length;
  return `${pill(Charts.levelVar(c.OEE).slice(2), `OEE ${fmtPct(c.OEE)}`)} ${pill('idle', `${fmtNum(c.total)} pcs`)} ${pill('idle', `${al} alarms`)} ${pill('idle', `${wo} work orders`)}`;
}
function pShiftLog() {
  const now = Date.now(); const sh = shiftAt(now); const ed = canEdit('shift_log');
  const rows = opMachines().map(m => ({ id: m.id, m, c: DB.cfg.checks.filter(c => c.mid === m.id && c.shift === sh.key).sort((a, b) => b.at - a.at)[0] }));
  const done = rows.filter(r => r.c).length; const ng = rows.filter(r => r.c && r.c.items.some(i => !i.ok));
  const openAl = Sim.alarms.filter(a => !a.ackBy && DB.asset(a.assetId) && DB.isUnder(a.assetId, S.assetId)).length;
  const openWo = DB.cfg.workOrders.filter(w => Maint.active(w) && DB.asset(w.mid) && DB.isUnder(w.mid, S.assetId)).length;
  const hos = DB.cfg.handovers.filter(h => DB.asset(h.scopeId) && (DB.isUnder(S.assetId, h.scopeId) || DB.isUnder(h.scopeId, S.assetId))).sort((a, b) => b.at - a.at).slice(0, 6);
  return head('Shift Log', ed ? `<button class="btn primary" data-act="ho-new">${ic('edit')}Write handover</button>` : '', `${esc(shiftLabel(sh))} · ${fmtHMS((sh.end - now) / 1000).slice(0, 5)} left`) +
    `<div class="grid g4" style="margin-bottom:20px">
      ${statTile('Checklist done', `${done}/${rows.length}`, 'machines checked this shift', done === rows.length ? '--good' : '--warn')}
      ${statTile('Items not OK', ng.reduce((a, r) => a + r.c.items.filter(i => !i.ok).length, 0), `on ${ng.length} machines`, ng.length ? '--crit' : '--good')}
      ${statTile('Open alarms', openAl, 'not acknowledged yet', openAl ? '--warn' : '--good')}
      ${statTile('Active work orders', openWo, 'open or in progress', '--accent')}</div>
    <div class="card" style="margin-bottom:20px"><div class="card-head"><h3>Start-of-shift checklist</h3></div>${table('checks', [
      { h: 'Machine', f: r => esc(r.m.name) }, { h: 'Type', f: r => esc(machineKind(r.m).kind) }, { h: 'Status', f: r => r.c ? pill('good', 'Done') : pill('warn', 'Not done') },
      { h: 'Checked by', f: r => r.c ? `${esc(userName(r.c.by))} · <span class="mono">${fmtTime(r.c.at, false)}</span>` : '–' },
      { h: 'Result', f: r => !r.c ? '–' : r.c.items.every(i => i.ok) ? pill('good', `All ${r.c.items.length} OK`) : `${pill('crit', `${r.c.items.filter(i => !i.ok).length} not OK`)} <span style="color:var(--muted);font-size:12px">${esc(r.c.items.filter(i => !i.ok).map(i => i.text).join(', '))}${r.c.note ? ` · ${esc(r.c.note)}` : ''}</span>` },
      { h: 'Action', cls: 'num', f: r => ed ? `<button class="btn sm ${r.c ? '' : 'primary'}" data-act="chk" data-arg="${r.m.id}">${r.c ? 'Check again' : 'Start check'}</button>` : '' }], rows, { pageSize: 14, empty: 'No machines in scope.' })}</div>
    <h2 class="sec-title">${ic('msg')}Shift handover</h2>
    <div class="grid g2">${hos.map(h => { const s2 = shiftByKey(h.shift); return `<div class="card ho"><div class="card-head"><h3>${esc(shiftLabel(s2))}</h3><span class="hint">${esc(userName(h.by))} · ${fmtDT(h.at)}</span></div>
      <div class="inline" style="margin-bottom:10px">${shiftSummary(h.scopeId, s2.start, s2.end)}${h.scopeId !== 'p1' ? pill('accent', DB.asset(h.scopeId).name) : ''}</div>
      <p>${esc(h.note)}</p>${h.issues ? `<p class="ho-next">${ic('warn')}<span><b>For next shift:</b> ${esc(h.issues)}</span></p>` : ''}</div>`; }).join('') || '<div class="card empty">No handover notes yet.</div>'}</div>`;
}
function checkForm(mid) {
  const items = checkItems(mid); const sh = shiftAt(Date.now());
  openModal({
    title: `Checklist · ${DB.asset(mid).name}`, wide: true,
    body: `<p style="margin:0;color:var(--muted);font-size:12.5px">${esc(shiftLabel(sh))}. Mark each item OK or Not OK.</p>
      <div class="chk-list">${items.map((t, i) => `<div class="chk-row"><span>${esc(t)}</span><div class="radio-group"><label><input type="radio" name="ck${i}" value="1" checked>OK</label><label><input type="radio" name="ck${i}" value="0">Not OK</label></div></div>`).join('')}</div>` +
      row('Note', `<textarea class="input" id="ck-note" rows="2" placeholder="Needed when an item is not OK"></textarea>`, 'ck-note') +
      row('Work order', `<label class="check"><input type="checkbox" id="ck-wo" checked> Create a work order for items that are not OK</label>`),
    onSave: () => {
      const res = items.map((text, i) => ({ text, ok: document.querySelector(`input[name=ck${i}]:checked`).value === '1' }));
      const bad = res.filter(r => !r.ok); const note = fv('ck-note');
      if (!setErr('ck-note', bad.length && !note ? 'Describe what is not OK.' : '')) return;
      DB.cfg.checks.push({ id: uid('ck'), mid, shift: sh.key, at: Date.now(), by: S.user.username, items: res, note });
      let msg = `Checklist saved for ${esc(DB.asset(mid).name)}.`;
      if (bad.length && document.getElementById('ck-wo').checked) {
        const w = Maint.create({ mid, title: `Checklist: ${bad[0].text}${bad.length > 1 ? ` (+${bad.length - 1} more)` : ''}`, type: 'corrective', priority: 'high', assignee: null, dueAt: Date.now() + 8 * HOUR, desc: `Not OK at the start of the ${sh.name.toLowerCase()} shift: ${bad.map(b => b.text).join('; ')}. ${note}` }, S.user.username);
        msg += ` ${esc(w.no)} created.`;
      } else DB.save();
      closeModal(); toast(msg, bad.length ? 'warn' : 'good'); render();
    },
  });
}
function handoverForm() {
  const sh = shiftAt(Date.now());
  openModal({
    title: `Shift handover · ${scope().name}`, wide: true, saveLabel: 'Save handover',
    body: `<div><div style="font-size:12.5px;color:var(--muted);margin-bottom:6px">${esc(shiftLabel(sh))} so far</div><div class="inline">${shiftSummary(S.assetId, sh.start, sh.end)}</div></div>` +
      row('What happened', `<textarea class="input" id="ho-note" rows="4" placeholder="Production, stops, quality problems, what was fixed"></textarea>`, 'ho-note', true) +
      row('For next shift', `<textarea class="input" id="ho-issues" rows="2" placeholder="Things to watch or finish"></textarea>`, 'ho-issues'),
    onSave: () => {
      const note = fv('ho-note'); if (!setErr('ho-note', note ? '' : 'Write a short summary of the shift.')) return;
      DB.cfg.handovers.push({ id: uid('ho'), shift: sh.key, at: Date.now(), by: S.user.username, scopeId: S.assetId, note, issues: fv('ho-issues') });
      DB.save(); closeModal(); toast('Handover saved.', 'good'); render();
    },
  });
}

/* ---------- actions (merged into ACT in app.js) ---------- */
const OPS_ACT = {
  'wo-filter'(el) { S.woFilter = el.dataset.arg; S.tables.wo = { page: 1 }; refreshContent(); },
  'wo-new'() { woForm({}); },
  'wo-view'(el) { woView(woById(el.dataset.arg)); },
  'wo-assign'(el) { woAssign(woById(el.dataset.arg)); },
  'wo-start'(el) { const w = woById(el.dataset.arg); w.status = 'in_progress'; w.startedAt = Date.now(); w.assignee = w.assignee || S.user.username; DB.save(); toast(`${esc(w.no)} started.`, 'good'); refreshContent(); },
  'wo-done'(el) { woComplete(woById(el.dataset.arg)); },
  'wo-cancel'(el) { const w = woById(el.dataset.arg); confirmBox('Cancel work order', `Cancel <b>${esc(w.no)}</b> ${esc(w.title)}? It stays in the list as cancelled.`, () => { w.status = 'cancelled'; w.doneAt = Date.now(); DB.save(); toast(`${esc(w.no)} cancelled.`); render(); }, 'Cancel work order'); },
  'wo-alarm'(el) { const a = Sim.alarms.find(x => x.id === el.dataset.arg); woForm({ mid: DB.asset(a.assetId)?.isMachine ? a.assetId : '', title: a.name, desc: `${a.desc} (alarm at ${fmtDT(a.at)})`, type: a.type === 'sensor' ? 'predictive' : 'corrective', priority: a.severity === 'critical' ? 'high' : 'normal', alarmId: a.id }); },
  'wo-health'(el) { const mid = el.dataset.arg; const x = Health.actions(mid)[0]; woForm({ mid, title: x ? x.text.split('. ')[0] : 'Machine health check', desc: x?.text || '', type: 'predictive', priority: x?.sev === 'crit' ? 'high' : 'normal' }); },
  'part-add'() { partForm(null); }, 'part-edit'(el) { partForm(Maint.part(el.dataset.arg)); }, 'part-recv'(el) { partRecv(Maint.part(el.dataset.arg)); },
  'e-range'(el) { S.eRange = el.dataset.arg; refreshContent(); },
  tariff() { tariffForm(); },
  'spc-range'(el) { S.spcRange = el.dataset.arg; refreshContent(); },
  chk(el) { checkForm(el.dataset.arg); },
  'ho-new'() { handoverForm(); },
};
