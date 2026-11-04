import { firebaseConfig } from './config.js';

/* ================= Estado ================= */
const COLS = ['vehicles', 'maint', 'plans', 'docs', 'fuel'];
const data = { vehicles: [], maint: [], plans: [], docs: [], fuel: [] };
const ui = { tab: 'home', veh: 'all', maintSeg: 'hist', docSeg: 'pend', year: new Date().getFullYear() };
let backend = null;

const MAINT_TYPES = ['Troca de óleo', 'Filtro de óleo', 'Filtro de ar', 'Filtro de combustível', 'Filtro de cabine',
  'Alinhamento e balanceamento', 'Rodízio de pneus', 'Troca de pneus', 'Pastilhas de freio', 'Discos de freio',
  'Fluido de freio', 'Bateria', 'Correia dentada', 'Correia do alternador', 'Líquido de arrefecimento', 'Velas',
  'Revisão geral', 'Relação (corrente/coroa/pinhão)', 'Lubrificação da corrente', 'Embreagem', 'Suspensão',
  'Ar-condicionado', 'Elétrica', 'Funilaria/pintura', 'Lavagem', 'Outro'];
const DOC_TYPES = ['Licenciamento (CRLV)', 'IPVA', 'Seguro', 'Multa', 'Vistoria', 'Outro'];
const FUELS = ['Gasolina', 'Etanol', 'Diesel', 'GNV'];
const DEFAULT_PLANS = {
  carro: [['Troca de óleo', 10000, 12], ['Filtro de ar', 20000, 24], ['Filtro de cabine', 15000, 12],
    ['Alinhamento e balanceamento', 10000, 12], ['Fluido de freio', null, 24], ['Velas', 30000, 36],
    ['Correia dentada', 50000, 48], ['Líquido de arrefecimento', 40000, 24]],
  moto: [['Troca de óleo', 4000, 6], ['Filtro de ar', 12000, 12], ['Relação (corrente/coroa/pinhão)', 20000, null],
    ['Fluido de freio', null, 24], ['Velas', 10000, 12], ['Pastilhas de freio', 10000, null]]
};

/* ================= Ícones ================= */
const P = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  fuel: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  chart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  gear: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  carro: '<path d="M4 16.5V12l2.2-5.2A2 2 0 0 1 8 5.5h8a2 2 0 0 1 1.8 1.3L20 12v4.5"/><path d="M3 12h18v4.5H3z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
  moto: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5l4-6h5.5l3.5 6"/><path d="M14 10.5l-2-4h3.5"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  gauge: '<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
};
const ico = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

/* ================= Utilidades ================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = (v) => BRL.format(v || 0);
const int = (v) => (v == null || v === '' || isNaN(v)) ? '—' : Math.round(v).toLocaleString('pt-BR');
const dec = (v, d = 1) => (v == null || isNaN(v)) ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fdate = (s) => s ? s.split('-').reverse().join('/') : '—';
const parseD = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysUntil = (s) => Math.round((parseD(s) - parseD(today())) / 86400000);
const addMonths = (s, n) => { const d = parseD(s); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return toISO(d); };
const norm = (s) => String(s || '').trim().toLowerCase();
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
function parseNum(v, kind) {
  if (v == null) return null;
  let s = String(v).trim();
  if (!s) return null;
  if (kind === 'int') { s = s.replace(/\D/g, ''); return s ? parseInt(s, 10) : null; }
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s.replace(/[^\d.-]/g, ''));
  return isNaN(n) ? null : n;
}
function toast(msg) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
}
const vehById = (id) => data.vehicles.find((v) => v.id === id);
const vehName = (id) => vehById(id)?.nome || 'Veículo removido';
const sortedVehicles = () => [...data.vehicles].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || norm(a.nome).localeCompare(norm(b.nome)));
const inFilter = (o) => ui.veh === 'all' || o.vid === ui.veh;
function kmAtual(vid) {
  const v = vehById(vid); let km = v?.km || 0;
  for (const c of ['maint', 'fuel']) for (const o of data[c]) if (o.vid === vid && o.km > km) km = o.km;
  return km;
}
const defaultVid = () => ui.veh !== 'all' ? ui.veh : sortedVehicles()[0]?.id;

/* ================= Regras de negócio ================= */
function planStatus(p) {
  const km = kmAtual(p.vid);
  let kmLeft = null, daysLeft = null, frac = 0, dueDate = null, dueKm = null;
  if (p.intervaloKm && p.ultimoKm != null) { dueKm = p.ultimoKm + p.intervaloKm; kmLeft = dueKm - km; frac = Math.max(frac, (km - p.ultimoKm) / p.intervaloKm); }
  if (p.intervaloMeses && p.ultimaData) { dueDate = addMonths(p.ultimaData, p.intervaloMeses); daysLeft = daysUntil(dueDate); const tot = daysUntil(dueDate) - daysUntil(p.ultimaData); frac = Math.max(frac, tot ? (tot - daysLeft) / tot : 1); }
  if (kmLeft == null && daysLeft == null) return { st: 'nd', label: 'Informe a última realização', frac: 0 };
  const kmWarn = Math.max(500, (p.intervaloKm || 0) * 0.1);
  let st = 'ok';
  if ((kmLeft != null && kmLeft <= 0) || (daysLeft != null && daysLeft <= 0)) st = 'danger';
  else if ((kmLeft != null && kmLeft <= kmWarn) || (daysLeft != null && daysLeft <= 30)) st = 'warn';
  const parts = [];
  if (kmLeft != null) parts.push(kmLeft > 0 ? `faltam ${int(kmLeft)} km` : `passou ${int(-kmLeft)} km`);
  if (daysLeft != null) parts.push(daysLeft > 0 ? `até ${fdate(dueDate)}` : `venceu em ${fdate(dueDate)}`);
  return { st, label: parts.join(' · '), frac: Math.min(1, Math.max(0, frac)), dueKm, dueDate };
}
function docStatus(d) {
  if (d.pago) return { st: 'ok', label: 'Pago' };
  if (!d.vencimento) return { st: 'nd', label: 'Sem data' };
  const n = daysUntil(d.vencimento);
  if (n < 0) return { st: 'danger', label: `Venceu há ${-n} dia${n === -1 ? '' : 's'}` };
  if (n === 0) return { st: 'danger', label: 'Vence hoje' };
  if (n <= 30) return { st: 'warn', label: `Vence em ${n} dia${n === 1 ? '' : 's'}` };
  return { st: 'nd', label: `Vence em ${fdate(d.vencimento)}` };
}
function computeAlerts() {
  const out = [];
  for (const p of data.plans) {
    const s = planStatus(p);
    if (s.st === 'danger' || s.st === 'warn') out.push({ sev: s.st === 'danger' ? 2 : 1, st: s.st, vid: p.vid, icon: 'tool', title: p.tipo, sub: s.label, act: 'edit-plan', id: p.id });
  }
  for (const d of data.docs) {
    const s = docStatus(d);
    if (s.st === 'danger' || s.st === 'warn') out.push({ sev: s.st === 'danger' ? 2 : 1, st: s.st, vid: d.vid, icon: 'doc', title: d.tipo + (d.descricao ? ' · ' + d.descricao : ''), sub: s.label + (d.valor ? ' · ' + money(d.valor) : ''), act: 'edit-doc', id: d.id });
  }
  return out.sort((a, b) => b.sev - a.sev);
}
function fuelStats(vid) {
  const list = data.fuel.filter((f) => f.vid === vid && f.km).sort((a, b) => a.km - b.km || (a.data || '').localeCompare(b.data || ''));
  const per = {}; let lastFull = null, acc = 0, totKm = 0, totL = 0, last = null;
  for (const f of list) {
    if (lastFull === null) { if (f.cheio) lastFull = f.km; continue; }
    acc += f.litros || 0;
    if (f.cheio) {
      const d = f.km - lastFull;
      if (d > 0 && acc > 0) { per[f.id] = d / acc; totKm += d; totL += acc; last = d / acc; }
      lastFull = f.km; acc = 0;
    }
  }
  return { per, avg: totL ? totKm / totL : null, last };
}
function costEntries() {
  const e = [];
  for (const m of data.maint) if (m.custo) e.push({ vid: m.vid, data: m.data, valor: m.custo, cat: 'Manutenção' });
  for (const f of data.fuel) if (f.valor) e.push({ vid: f.vid, data: f.data, valor: f.valor, cat: 'Combustível' });
  for (const d of data.docs) if (d.pago && d.valor) e.push({ vid: d.vid, data: d.dataPagamento || d.vencimento, valor: d.valor, cat: 'Documentos e impostos' });
  return e.filter((x) => x.data);
}
function syncPlansFromMaint(m) {
  for (const p of data.plans) {
    if (p.vid !== m.vid || norm(p.tipo) !== norm(m.tipo)) continue;
    if (!p.ultimaData || (m.data && m.data >= p.ultimaData)) {
      backend.save('plans', { ...p, ultimaData: m.data || p.ultimaData, ultimoKm: m.km ?? p.ultimoKm });
    }
  }
}

/* ================= Render ================= */
let renderQueued = false;
function render() {
  if (renderQueued) return; renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; doRender(); });
}
const TABS = [['home', 'Início', 'home'], ['maint', 'Manutenção', 'tool'], ['docs', 'Vencimentos', 'doc'], ['fuel', 'Combustível', 'fuel'], ['costs', 'Custos', 'chart']];
function doRender() {
  if (ui.veh !== 'all' && !vehById(ui.veh)) ui.veh = 'all';
  const alerts = computeAlerts();
  const nDanger = alerts.filter((a) => a.sev === 2).length || alerts.length;
  $('#nav-wrap').innerHTML = TABS.map(([k, l, i]) => `<button data-act="tab" data-tab="${k}" class="${ui.tab === k ? 'on' : ''}">${ico(i)}<span>${l}</span>${k === 'home' && alerts.length ? `<em class="dot">${nDanger}</em>` : ''}</button>`).join('');
  const titles = { home: 'Minha Garagem', maint: 'Manutenção', docs: 'Vencimentos', fuel: 'Combustível', costs: 'Custos', settings: 'Configurações' };
  $('#title').textContent = titles[ui.tab];
  const showChips = ui.tab !== 'settings' && data.vehicles.length > 1;
  $('#chips').hidden = !showChips;
  if (showChips) $('#chips').innerHTML = `<button class="chip ${ui.veh === 'all' ? 'on' : ''}" data-act="veh" data-id="all">Todos</button>` +
    sortedVehicles().map((v) => `<button class="chip ${ui.veh === v.id ? 'on' : ''}" data-act="veh" data-id="${v.id}">${ico(v.tipo === 'moto' ? 'moto' : 'carro')}${esc(v.nome)}</button>`).join('');
  $('#banner').innerHTML = backend?.demo ? `<div class="banner"><b>Modo demonstração:</b> os dados ficam só neste aparelho. Configure o Firebase (veja o LEIA-ME) para sincronizar.</div>` : '';
  const views = { home: viewHome, maint: viewMaint, docs: viewDocs, fuel: viewFuel, costs: viewCosts, settings: viewSettings };
  $('#view').innerHTML = views[ui.tab]();
  $('#fab').hidden = ui.tab === 'settings' || ui.tab === 'costs' || !data.vehicles.length;
}

function emptyBox(msg, btn) { return `<div class="empty card"><div>${msg}</div>${btn || ''}</div>`; }

function viewHome() {
  if (!data.vehicles.length) {
    return `<div class="card" style="margin-top:12px"><h3 style="margin:0 0 6px">Bem-vindo!</h3>
      <p class="muted" style="margin:0 0 14px">Comece cadastrando seus veículos. Depois é só registrar manutenções, vencimentos e abastecimentos pelo celular.</p>
      <button class="btn primary block" data-act="new-veh">${ico('plus')} Cadastrar veículo</button></div>`;
  }
  const alerts = computeAlerts().filter(inFilter);
  let h = `<h2 class="sec">Atenção</h2>`;
  if (!alerts.length) h += `<div class="item" style="cursor:default"><div class="badge-ico ok">${ico('check')}</div><div class="grow"><div class="t">Tudo em dia</div><div class="small muted">Nenhum vencimento ou manutenção próxima.</div></div></div>`;
  else h += alerts.map((a) => `<button class="item" data-act="${a.act}" data-id="${a.id}"><div class="badge-ico ${a.st}">${ico(a.icon)}</div>
      <div class="grow"><div class="t ellip">${esc(a.title)}</div><div class="small muted ellip">${ui.veh === 'all' ? esc(vehName(a.vid)) + ' · ' : ''}${esc(a.sub)}</div></div></button>`).join('');
  h += `<h2 class="sec">Veículos</h2>`;
  const year = new Date().getFullYear();
  const costs = costEntries();
  for (const v of sortedVehicles().filter((v) => ui.veh === 'all' || v.id === ui.veh)) {
    const fs = fuelStats(v.id);
    const gasto = costs.filter((c) => c.vid === v.id && c.data.startsWith(String(year))).reduce((s, c) => s + c.valor, 0);
    const lastM = data.maint.filter((m) => m.vid === v.id).sort((a, b) => (b.data || '').localeCompare(a.data || ''))[0];
    h += `<div class="card">
      <div class="veh-head"><div class="badge-ico">${ico(v.tipo === 'moto' ? 'moto' : 'carro')}</div>
        <div class="grow"><div class="name ellip">${esc(v.nome)}</div><div class="small muted ellip">${esc([v.marca, v.modelo, v.ano].filter(Boolean).join(' '))}${v.placa ? ' · ' + esc(v.placa) : ''}</div></div></div>
      <div class="km-big">${int(kmAtual(v.id))} km</div>
      <div class="stats">
        <div class="stat"><span class="small muted">Gasto em ${year}</span><b>${money(gasto)}</b></div>
        <div class="stat"><span class="small muted">Consumo médio</span><b>${fs.avg ? dec(fs.avg) + ' km/l' : '—'}</b></div>
        <div class="stat" style="grid-column:span 2"><span class="small muted">Última manutenção</span><b class="ellip">${lastM ? esc(lastM.tipo) + ' · ' + fdate(lastM.data) : '—'}</b></div>
      </div>
      <div class="actions">
        <button class="btn sm" data-act="km" data-id="${v.id}">${ico('gauge')} Atualizar km</button>
        <button class="btn sm" data-act="new-maint" data-vid="${v.id}">${ico('tool')} Manutenção</button>
        <button class="btn sm" data-act="new-fuel" data-vid="${v.id}">${ico('fuel')} Abastecer</button>
      </div></div>`;
  }
  return h;
}

function viewMaint() {
  let h = `<div class="seg"><button data-act="seg" data-k="maintSeg" data-v="hist" class="${ui.maintSeg === 'hist' ? 'on' : ''}">Histórico</button><button data-act="seg" data-k="maintSeg" data-v="plans" class="${ui.maintSeg === 'plans' ? 'on' : ''}">Planos e lembretes</button></div>`;
  if (ui.maintSeg === 'hist') {
    const list = data.maint.filter(inFilter).sort((a, b) => (b.data || '').localeCompare(a.data || '') || (b.km || 0) - (a.km || 0));
    if (!list.length) return h + emptyBox('Nenhuma manutenção registrada.', `<button class="btn primary" data-act="new-maint">${ico('plus')} Registrar manutenção</button>`);
    const tot = list.reduce((s, m) => s + (m.custo || 0), 0);
    h += `<div class="small muted" style="margin:0 4px 8px">${list.length} registro${list.length > 1 ? 's' : ''} · total ${money(tot)}</div>`;
    h += list.map((m) => `<button class="item" data-act="edit-maint" data-id="${m.id}"><div class="badge-ico">${ico('tool')}</div>
      <div class="grow"><div class="t ellip">${esc(m.tipo)}</div><div class="small muted ellip">${ui.veh === 'all' ? esc(vehName(m.vid)) + ' · ' : ''}${fdate(m.data)}${m.km ? ' · ' + int(m.km) + ' km' : ''}${m.oficina ? ' · ' + esc(m.oficina) : ''}</div></div>
      <div class="r"><b>${m.custo ? money(m.custo) : ''}</b></div></button>`).join('');
    return h;
  }
  const plans = data.plans.filter(inFilter).map((p) => ({ p, s: planStatus(p) }))
    .sort((a, b) => ({ danger: 0, warn: 1, ok: 2, nd: 3 }[a.s.st] - { danger: 0, warn: 1, ok: 2, nd: 3 }[b.s.st]) || b.s.frac - a.s.frac);
  h += `<p class="hint" style="margin:0 4px 12px">Defina de quanto em quanto tempo/km cada item deve ser feito. Ao registrar uma manutenção do mesmo tipo, o plano é atualizado sozinho.</p>`;
  if (!plans.length) {
    const btn = ui.veh !== 'all' ? `<button class="btn primary" data-act="suggest" data-id="${ui.veh}">Sugerir planos padrão</button> ` : '';
    return h + emptyBox('Nenhum plano de manutenção.' + (ui.veh === 'all' ? '<br><span class="small">Selecione um veículo acima para receber sugestões.</span>' : ''), `${btn}<button class="btn" data-act="new-plan">${ico('plus')} Novo plano</button>`);
  }
  h += plans.map(({ p, s }) => `<button class="item" data-act="edit-plan" data-id="${p.id}" style="display:block">
    <div class="row"><div class="grow"><div class="t ellip">${esc(p.tipo)}</div>
      <div class="small muted ellip">${ui.veh === 'all' ? esc(vehName(p.vid)) + ' · ' : ''}a cada ${[p.intervaloKm ? int(p.intervaloKm) + ' km' : '', p.intervaloMeses ? p.intervaloMeses + ' meses' : ''].filter(Boolean).join(' ou ')}</div></div>
      <span class="pill ${s.st}">${{ danger: 'Vencido', warn: 'Próximo', ok: 'Em dia', nd: 'Sem dados' }[s.st]}</span></div>
    <div class="small" style="margin-top:6px">${esc(s.label)}</div>
    ${s.st !== 'nd' ? `<div class="progress ${s.st}"><span style="width:${Math.round(s.frac * 100)}%"></span></div>` : ''}</button>`).join('');
  if (ui.veh !== 'all') h += `<button class="btn ghost block" data-act="suggest" data-id="${ui.veh}">Adicionar planos padrão que faltam</button>`;
  return h;
}

function viewDocs() {
  let h = `<div class="seg"><button data-act="seg" data-k="docSeg" data-v="pend" class="${ui.docSeg === 'pend' ? 'on' : ''}">A pagar</button><button data-act="seg" data-k="docSeg" data-v="pago" class="${ui.docSeg === 'pago' ? 'on' : ''}">Pagos</button></div>`;
  const pend = ui.docSeg === 'pend';
  const list = data.docs.filter(inFilter).filter((d) => !!d.pago !== pend)
    .sort((a, b) => pend ? (a.vencimento || '9').localeCompare(b.vencimento || '9') : (b.dataPagamento || b.vencimento || '').localeCompare(a.dataPagamento || a.vencimento || ''));
  if (!list.length) return h + emptyBox(pend ? 'Nada a pagar. Cadastre licenciamento, IPVA, seguro e multas para receber alertas.' : 'Nenhum pagamento registrado.', pend ? `<button class="btn primary" data-act="new-doc">${ico('plus')} Novo vencimento</button>` : '');
  if (pend) h += `<div class="small muted" style="margin:0 4px 8px">Total pendente: ${money(list.reduce((s, d) => s + (d.valor || 0), 0))}</div>`;
  h += list.map((d) => {
    const s = docStatus(d);
    return `<div class="item" data-act="edit-doc" data-id="${d.id}" style="display:block">
      <div class="row"><div class="badge-ico ${s.st === 'nd' ? '' : s.st}">${ico('doc')}</div>
        <div class="grow"><div class="t ellip">${esc(d.tipo)}${d.descricao ? ' · ' + esc(d.descricao) : ''}</div>
        <div class="small muted ellip">${ui.veh === 'all' ? esc(vehName(d.vid)) + ' · ' : ''}${pend ? 'vence ' + fdate(d.vencimento) : 'pago em ' + fdate(d.dataPagamento || d.vencimento)}</div>
        <div style="margin-top:4px"><span class="pill ${s.st}">${esc(s.label)}</span></div></div>
        <div class="r"><b>${d.valor ? money(d.valor) : ''}</b></div></div>
      ${pend ? `<div class="actions"><button class="btn sm" data-act="pay" data-id="${d.id}">${ico('check')} Marcar como pago</button>${d.vencimento ? `<button class="btn sm ghost" data-act="ics" data-id="${d.id}">${ico('cal')} Agenda</button>` : ''}</div>` : ''}</div>`;
  }).join('');
  return h;
}

function viewFuel() {
  const list = data.fuel.filter(inFilter).sort((a, b) => (b.data || '').localeCompare(a.data || '') || (b.km || 0) - (a.km || 0));
  if (!list.length) return emptyBox('Nenhum abastecimento registrado.<br><span class="small">Marque “tanque cheio” para o app calcular o consumo (km/l).</span>', `<button class="btn primary" data-act="new-fuel">${ico('plus')} Registrar abastecimento</button>`);
  let h = '';
  const stats = {};
  const vids = [...new Set(list.map((f) => f.vid))];
  for (const vid of vids) stats[vid] = fuelStats(vid);
  h += `<div class="stats" style="margin-top:4px">` + vids.map((vid) => {
    const s = stats[vid];
    const yr = data.fuel.filter((f) => f.vid === vid && (f.data || '').startsWith(String(ui.year))).reduce((t, f) => t + (f.valor || 0), 0);
    return `<div class="card" style="margin:0;grid-column:span ${vids.length === 1 ? 2 : 1}"><div class="small muted ellip">${esc(vehName(vid))}</div>
      <div style="font-size:22px;font-weight:700">${s.avg ? dec(s.avg) : '—'} <span class="small muted">km/l</span></div>
      <div class="small muted">último: ${s.last ? dec(s.last) + ' km/l' : '—'}<br>${ui.year}: ${money(yr)}</div></div>`;
  }).join('') + `</div><h2 class="sec">Abastecimentos</h2>`;
  h += list.map((f) => {
    const c = stats[f.vid]?.per[f.id];
    const pl = f.valor && f.litros ? f.valor / f.litros : null;
    return `<button class="item" data-act="edit-fuel" data-id="${f.id}"><div class="badge-ico">${ico('fuel')}</div>
      <div class="grow"><div class="t ellip">${dec(f.litros, 2)} L ${esc(f.combustivel || '')}</div>
      <div class="small muted ellip">${ui.veh === 'all' ? esc(vehName(f.vid)) + ' · ' : ''}${fdate(f.data)} · ${int(f.km)} km${pl ? ' · ' + money(pl) + '/L' : ''}${f.cheio ? '' : ' · parcial'}</div></div>
      <div class="r"><b>${money(f.valor)}</b>${c ? `<div class="small" style="color:var(--accent);font-weight:600">${dec(c)} km/l</div>` : ''}</div></button>`;
  }).join('');
  return h;
}

function viewCosts() {
  const all = costEntries().filter(inFilter);
  const years = [...new Set([new Date().getFullYear(), ...all.map((e) => +e.data.slice(0, 4))])].sort((a, b) => b - a);
  const list = all.filter((e) => e.data.startsWith(String(ui.year)));
  const total = list.reduce((s, e) => s + e.valor, 0);
  let h = `<div class="chips" style="padding-top:0">${years.map((y) => `<button class="chip ${ui.year === y ? 'on' : ''}" data-act="year" data-y="${y}">${y}</button>`).join('')}</div>`;
  h += `<div class="card"><div class="small muted">Total em ${ui.year}</div><div class="total">${money(total)}</div>
    <div class="small muted">média de ${money(total / (ui.year === new Date().getFullYear() ? new Date().getMonth() + 1 : 12))} por mês</div></div>`;
  if (!list.length) return h + emptyBox('Sem gastos registrados neste ano.');
  const by = (key) => { const m = {}; for (const e of list) m[key(e)] = (m[key(e)] || 0) + e.valor; return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const bars = (rows) => { const mx = Math.max(...rows.map((r) => r[1])); return rows.map(([k, v]) => `<div class="bar-row"><div class="lbl ellip">${esc(k)}</div><div class="track"><span style="width:${(v / mx * 100).toFixed(1)}%"></span></div><div class="val">${money(v)}</div></div>`).join(''); };
  h += `<h2 class="sec">Por categoria</h2><div class="card">${bars(by((e) => e.cat))}</div>`;
  if (ui.veh === 'all') h += `<h2 class="sec">Por veículo</h2><div class="card">${bars(by((e) => vehName(e.vid)))}</div>`;
  const months = Array(12).fill(0); for (const e of list) months[+e.data.slice(5, 7) - 1] += e.valor;
  const mx = Math.max(...months, 1);
  h += `<h2 class="sec">Por mês</h2><div class="card"><div class="months">${months.map((v, i) => `<div title="${MESES[i]}: ${money(v)}"><i style="height:${(v / mx * 100).toFixed(1)}%"></i><small>${MESES[i][0]}</small></div>`).join('')}</div></div>`;
  const maintTypes = by((e) => e.cat).length && list.filter((e) => e.cat === 'Manutenção').length;
  if (maintTypes) {
    const m = {}; for (const x of data.maint.filter(inFilter).filter((x) => (x.data || '').startsWith(String(ui.year)) && x.custo)) m[x.tipo] = (m[x.tipo] || 0) + x.custo;
    h += `<h2 class="sec">Manutenção por tipo</h2><div class="card">${bars(Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8))}</div>`;
  }
  return h;
}

function viewSettings() {
  let h = `<h2 class="sec">Veículos</h2><div class="menu-list">`;
  h += sortedVehicles().map((v) => `<button class="item" data-act="edit-veh" data-id="${v.id}"><div class="badge-ico">${ico(v.tipo === 'moto' ? 'moto' : 'carro')}</div>
    <div class="grow"><div class="t">${esc(v.nome)}</div><div class="small muted">${esc([v.marca, v.modelo, v.ano, v.placa].filter(Boolean).join(' · ')) || '—'}</div></div></button>`).join('');
  h += `</div><button class="btn block" data-act="new-veh">${ico('plus')} Adicionar veículo</button>`;
  h += `<h2 class="sec">Backup</h2><div class="card"><p class="small muted" style="margin-top:0">Baixe uma cópia de todos os seus dados (arquivo .json). Recomendado de tempos em tempos.</p>
    <div class="actions"><button class="btn" data-act="export">Exportar backup</button><button class="btn ghost" data-act="import">Importar backup</button></div></div>`;
  h += `<h2 class="sec">Conta</h2><div class="card">${backend.demo ? '<p class="small muted" style="margin-top:0">Modo demonstração (sem login). Os dados estão só neste navegador.</p><button class="btn danger block" data-act="reset-demo">Apagar dados de demonstração</button>' : `<p class="small muted" style="margin-top:0">Conectado como <b>${esc(backend.email || '')}</b></p><button class="btn danger block" data-act="logout">Sair</button>`}</div>
    <p class="small muted" style="text-align:center;margin:20px 0">Minha Garagem · v1.0</p>`;
  return h;
}

/* ================= Formulários ================= */
const vehOptions = () => sortedVehicles().map((v) => [v.id, v.nome]);
function fieldHTML(f, val) {
  const id = 'f_' + f.name;
  const req = f.required ? 'required' : '';
  if (f.type === 'check') return `<label class="field check"><input type="checkbox" name="${f.name}" ${val ? 'checked' : ''}><span>${esc(f.label)}</span></label>`;
  let input;
  if (f.type === 'select') {
    const opts = typeof f.options === 'function' ? f.options() : f.options;
    input = `<select name="${f.name}" id="${id}" ${req}>${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(val ?? '') === String(v) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
  } else if (f.type === 'textarea') {
    input = `<textarea name="${f.name}" id="${id}" rows="2">${esc(val)}</textarea>`;
  } else {
    let type = f.type || 'text', extra = '';
    let v = val ?? '';
    if (f.num === 'int') { type = 'text'; extra = 'inputmode="numeric" pattern="[0-9.]*"'; v = v === '' ? '' : Number(v).toLocaleString('pt-BR'); }
    if (f.num === 'dec') { type = 'text'; extra = 'inputmode="decimal"'; v = v === '' ? '' : String(v).replace('.', ','); }
    if (f.list) extra += ` list="${id}_l"`;
    input = `<input type="${type}" name="${f.name}" id="${id}" value="${esc(v)}" ${extra} ${req} placeholder="${esc(f.ph || '')}" autocomplete="off">` +
      (f.list ? `<datalist id="${id}_l">${f.list.map((o) => `<option value="${esc(o)}">`).join('')}</datalist>` : '');
  }
  return `<label class="field"><span>${esc(f.label)}${f.required ? ' *' : ''}</span>${input}</label>`;
}
function closeSheet() { document.querySelectorAll('.overlay').forEach((o) => o.remove()); }
function openSheet(inner, onMount) {
  closeSheet();
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${inner}</div>`;
  ov.addEventListener('click', (e) => { if (e.target === ov) closeSheet(); });
  document.body.appendChild(ov);
  onMount && onMount(ov);
  return ov;
}
function openForm({ title, fields, values = {}, onSave, onDelete, extraButtons = '', hint = '', onMount }) {
  const rows = []; let i = 0;
  while (i < fields.length) {
    const f = fields[i];
    if (f.half && fields[i + 1]?.half) { rows.push(`<div class="grid2">${fieldHTML(f, values[f.name])}${fieldHTML(fields[i + 1], values[fields[i + 1].name])}</div>`); i += 2; }
    else { rows.push(fieldHTML(f, values[f.name])); i++; }
  }
  const ov = openSheet(`<h3>${esc(title)}</h3>${hint ? `<p class="hint" style="margin-top:-8px">${hint}</p>` : ''}<form novalidate>${rows.join('')}
    <div class="sheet-actions"><button type="button" class="btn ghost" data-close>Cancelar</button><button type="submit" class="btn primary">Salvar</button></div>
    ${onDelete || extraButtons ? `<div class="sheet-actions" style="margin-top:10px">${extraButtons}${onDelete ? '<button type="button" class="btn danger" data-del>Excluir</button>' : ''}</div>` : ''}</form>`);
  const form = $('form', ov);
  $('[data-close]', ov).onclick = closeSheet;
  if (onDelete) $('[data-del]', ov).onclick = async () => { if (confirm('Excluir este registro?')) { try { await onDelete(); closeSheet(); toast('Excluído'); } catch { } } };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const out = {};
    for (const f of fields) {
      const el = form.elements[f.name];
      let v;
      if (f.type === 'check') v = el.checked;
      else if (f.num) v = parseNum(el.value, f.num);
      else v = el.value.trim();
      if (f.required && (v === '' || v == null)) { el.focus(); toast(`Preencha: ${f.label}`); return; }
      out[f.name] = v === '' ? null : v;
    }
    const err = await onSave(out, form);
    if (err) { toast(err); return; }
    closeSheet(); toast('Salvo');
  };
  onMount && onMount(ov, form);
  return ov;
}
const withId = (col, obj, values) => ({ ...values, ...obj, id: values.id || backend.newId(), updatedAt: Date.now() });

function formVehicle(v = {}) {
  openForm({
    title: v.id ? 'Editar veículo' : 'Novo veículo', values: { tipo: 'carro', combustivel: 'Flex', ...v },
    fields: [
      { name: 'nome', label: 'Apelido', required: true, ph: 'Ex.: Corolla, Moto' },
      { name: 'tipo', label: 'Tipo', type: 'select', options: [['carro', 'Carro'], ['moto', 'Moto']], half: true },
      { name: 'combustivel', label: 'Combustível', type: 'select', options: ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Elétrico', 'Híbrido'], half: true },
      { name: 'marca', label: 'Marca', half: true }, { name: 'modelo', label: 'Modelo', half: true },
      { name: 'ano', label: 'Ano', num: 'int', half: true }, { name: 'placa', label: 'Placa', half: true, ph: 'ABC1D23' },
      { name: 'renavam', label: 'Renavam', num: 'int', half: true }, { name: 'km', label: 'Km atual', num: 'int', half: true },
      { name: 'obs', label: 'Observações', type: 'textarea' }
    ],
    onSave: async (o) => {
      if (o.placa) o.placa = o.placa.toUpperCase();
      if (o.renavam != null) o.renavam = String(o.renavam);
      const isNew = !v.id;
      const rec = withId('vehicles', o, v);
      if (isNew) rec.ordem = data.vehicles.length;
      await backend.save('vehicles', rec);
      if (isNew) setTimeout(() => { if (confirm(`Quer criar os planos de manutenção padrão para ${rec.nome}? (você pode ajustar depois)`)) suggestPlans(rec.id); }, 300);
    },
    onDelete: v.id ? async () => {
      const n = COLS.slice(1).reduce((s, c) => s + data[c].filter((x) => x.vid === v.id).length, 0);
      if (n && !confirm(`Isso também apagará ${n} registro(s) ligados a este veículo. Continuar?`)) throw new Error('cancel');
      for (const c of COLS.slice(1)) for (const x of data[c].filter((x) => x.vid === v.id)) await backend.remove(c, x.id);
      await backend.remove('vehicles', v.id);
    } : null
  });
}
function formKm(vid) {
  const v = vehById(vid);
  openForm({
    title: `Atualizar km · ${v.nome}`, values: { km: kmAtual(vid) }, hint: 'Informe a quilometragem que está no painel agora.',
    fields: [{ name: 'km', label: 'Km atual', num: 'int', required: true }],
    onSave: async (o) => { await backend.save('vehicles', { ...v, km: o.km, kmData: today(), updatedAt: Date.now() }); },
    onMount: (ov, form) => setTimeout(() => form.elements.km.select(), 250)
  });
}
function formMaint(m = {}) {
  openForm({
    title: m.id ? 'Editar manutenção' : 'Nova manutenção', values: { data: today(), vid: defaultVid(), ...m },
    fields: [
      { name: 'vid', label: 'Veículo', type: 'select', options: vehOptions, required: true },
      { name: 'tipo', label: 'Serviço', list: MAINT_TYPES, required: true, ph: 'Ex.: Troca de óleo' },
      { name: 'data', label: 'Data', type: 'date', required: true, half: true }, { name: 'km', label: 'Km', num: 'int', half: true },
      { name: 'custo', label: 'Custo (R$)', num: 'dec', half: true }, { name: 'oficina', label: 'Oficina', half: true },
      { name: 'obs', label: 'Detalhes / peças', type: 'textarea' }
    ],
    onSave: async (o) => { const rec = withId('maint', o, m); await backend.save('maint', rec); syncPlansFromMaint(rec); },
    onDelete: m.id ? () => backend.remove('maint', m.id) : null
  });
}
function formPlan(p = {}) {
  const st = p.id ? planStatus(p) : null;
  openForm({
    title: p.id ? 'Editar plano' : 'Novo plano de manutenção', values: { vid: defaultVid(), ...p },
    hint: st && st.st !== 'nd' ? `Status: ${esc(st.label)}` : 'Preencha km, meses ou ambos (vale o que vencer primeiro).',
    fields: [
      { name: 'vid', label: 'Veículo', type: 'select', options: vehOptions, required: true },
      { name: 'tipo', label: 'Serviço', list: MAINT_TYPES, required: true },
      { name: 'intervaloKm', label: 'A cada (km)', num: 'int', half: true }, { name: 'intervaloMeses', label: 'A cada (meses)', num: 'int', half: true },
      { name: 'ultimaData', label: 'Última vez (data)', type: 'date', half: true }, { name: 'ultimoKm', label: 'Última vez (km)', num: 'int', half: true }
    ],
    onSave: async (o) => {
      if (!o.intervaloKm && !o.intervaloMeses) return 'Informe o intervalo em km ou em meses';
      await backend.save('plans', withId('plans', o, p));
    },
    extraButtons: p.id ? '<button type="button" class="btn" data-done>Fiz hoje</button>' : '',
    onDelete: p.id ? () => backend.remove('plans', p.id) : null,
    onMount: (ov) => { const b = $('[data-done]', ov); if (b) b.onclick = () => { closeSheet(); formMaint({ vid: p.vid, tipo: p.tipo, km: kmAtual(p.vid) }); }; }
  });
}
function formDoc(d = {}) {
  openForm({
    title: d.id ? 'Editar vencimento' : 'Novo vencimento', values: { vid: defaultVid(), tipo: 'Licenciamento (CRLV)', ...d },
    fields: [
      { name: 'vid', label: 'Veículo', type: 'select', options: vehOptions, required: true },
      { name: 'tipo', label: 'Tipo', type: 'select', options: DOC_TYPES },
      { name: 'descricao', label: 'Descrição', ph: 'Ex.: 2027, parcela 1/3, apólice…' },
      { name: 'vencimento', label: 'Vencimento', type: 'date', required: true, half: true }, { name: 'valor', label: 'Valor (R$)', num: 'dec', half: true },
      { name: 'pago', label: 'Já foi pago', type: 'check' },
      { name: 'dataPagamento', label: 'Data do pagamento', type: 'date' },
      { name: 'obs', label: 'Observações', type: 'textarea' }
    ],
    onSave: async (o) => { if (o.pago && !o.dataPagamento) o.dataPagamento = today(); if (!o.pago) o.dataPagamento = null; await backend.save('docs', withId('docs', o, d)); },
    extraButtons: d.id ? '<button type="button" class="btn" data-next>Criar p/ próximo ano</button>' : '',
    onDelete: d.id ? () => backend.remove('docs', d.id) : null,
    onMount: (ov) => {
      const b = $('[data-next]', ov);
      if (b) b.onclick = async () => {
        const nv = d.vencimento ? addMonths(d.vencimento, 12) : null;
        const desc = (d.descricao || '').replace(/\b(20\d\d)\b/, (y) => String(+y + 1));
        await backend.save('docs', { vid: d.vid, tipo: d.tipo, descricao: desc, vencimento: nv, valor: d.valor, pago: false, obs: d.obs || null, id: backend.newId(), updatedAt: Date.now() });
        closeSheet(); toast(`Criado: vence ${fdate(nv)}`);
      };
    }
  });
}
function formFuel(f = {}) {
  const v = vehById(f.vid || defaultVid());
  openForm({
    title: f.id ? 'Editar abastecimento' : 'Novo abastecimento',
    values: { data: today(), cheio: true, vid: v?.id, combustivel: ['Gasolina', 'Etanol', 'Diesel'].includes(v?.combustivel) ? v.combustivel : 'Gasolina', ...f },
    fields: [
      { name: 'vid', label: 'Veículo', type: 'select', options: vehOptions, required: true },
      { name: 'data', label: 'Data', type: 'date', required: true, half: true }, { name: 'km', label: 'Km no painel', num: 'int', required: true, half: true },
      { name: 'litros', label: 'Litros', num: 'dec', required: true, half: true }, { name: 'valor', label: 'Valor total (R$)', num: 'dec', required: true, half: true },
      { name: 'combustivel', label: 'Combustível', type: 'select', options: FUELS, half: true }, { name: 'posto', label: 'Posto', half: true },
      { name: 'cheio', label: 'Encheu o tanque', type: 'check' }
    ],
    hint: f.id ? '' : `Último km registrado: ${int(kmAtual(v?.id))}`,
    onSave: async (o) => {
      const prev = kmAtual(o.vid);
      if (!f.id && o.km < prev && !confirm(`O km informado (${int(o.km)}) é menor que o último registrado (${int(prev)}). Salvar mesmo assim?`)) return 'Revise o km';
      await backend.save('fuel', withId('fuel', o, f));
    },
    onDelete: f.id ? () => backend.remove('fuel', f.id) : null,
    onMount: (ov, form) => {
      const upd = () => { const l = parseNum(form.elements.litros.value, 'dec'), t = parseNum(form.elements.valor.value, 'dec'); const h = $('.hint', ov); if (h && l && t) h.textContent = `Preço por litro: ${money(t / l)}`; };
      form.elements.litros.addEventListener('input', upd); form.elements.valor.addEventListener('input', upd);
    }
  });
}
async function suggestPlans(vid) {
  const v = vehById(vid); if (!v) return;
  const have = new Set(data.plans.filter((p) => p.vid === vid).map((p) => norm(p.tipo)));
  const list = (DEFAULT_PLANS[v.tipo] || DEFAULT_PLANS.carro).filter(([t]) => !have.has(norm(t)));
  if (!list.length) { toast('Todos os planos padrão já existem'); return; }
  for (const [tipo, km, meses] of list) {
    const last = data.maint.filter((m) => m.vid === vid && norm(m.tipo) === norm(tipo)).sort((a, b) => (b.data || '').localeCompare(a.data || ''))[0];
    await backend.save('plans', { id: backend.newId(), vid, tipo, intervaloKm: km, intervaloMeses: meses, ultimaData: last?.data || null, ultimoKm: last?.km ?? null, updatedAt: Date.now() });
  }
  ui.tab = 'maint'; ui.maintSeg = 'plans'; ui.veh = vid; render();
  toast(`${list.length} planos criados — informe a última realização de cada um`);
}
function addMenu() {
  const opts = [['new-maint', 'tool', 'Manutenção'], ['new-fuel', 'fuel', 'Abastecimento'], ['new-doc', 'doc', 'Vencimento (IPVA, licenciamento…)'], ['new-plan', 'clock', 'Plano / lembrete de manutenção'], ['km', 'gauge', 'Atualizar km']];
  openSheet(`<h3>Adicionar</h3><div class="menu-list">${opts.map(([a, i, l]) => `<button class="item" data-act="${a}" data-id="${a === 'km' ? defaultVid() : ''}"><div class="badge-ico">${ico(i)}</div><div class="t">${l}</div></button>`).join('')}</div>`);
}
function downloadFile(name, content, type) {
  const blob = new Blob([content], { type }); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function exportICS(d) {
  const dt = d.vencimento.replace(/-/g, ''); const end = addMonths(d.vencimento, 0); const e2 = toISO(new Date(parseD(end).getTime() + 86400000)).replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const sum = `${d.tipo}${d.descricao ? ' ' + d.descricao : ''} - ${vehName(d.vid)}`.replace(/[,;]/g, ' ');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MinhaGaragem//PT-BR', 'BEGIN:VEVENT', `UID:${d.id}@minhagaragem`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt}`, `DTEND;VALUE=DATE:${e2}`, `SUMMARY:Vence: ${sum}`, `DESCRIPTION:${d.valor ? 'Valor: ' + money(d.valor) : ''}`,
    'BEGIN:VALARM', 'TRIGGER:-P7D', 'ACTION:DISPLAY', `DESCRIPTION:${sum}`, 'END:VALARM',
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${sum}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  downloadFile(`vencimento-${dt}.ics`, ics, 'text/calendar');
}
async function importBackup() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = async () => {
    try {
      const j = JSON.parse(await inp.files[0].text());
      const src = j.data || j; let n = 0;
      if (!COLS.some((c) => Array.isArray(src[c]))) throw new Error('formato');
      if (!confirm('Importar este backup? Registros com o mesmo ID serão substituídos.')) return;
      for (const c of COLS) for (const o of (src[c] || [])) { if (o && o.id) { await backend.save(c, o); n++; } }
      toast(`${n} registros importados`);
    } catch { toast('Arquivo de backup inválido'); }
  };
  inp.click();
}

/* ================= Eventos ================= */
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const { act, id } = el.dataset;
  const find = (c) => data[c].find((x) => x.id === id);
  switch (act) {
    case 'tab': ui.tab = el.dataset.tab; closeSheet(); render(); window.scrollTo(0, 0); break;
    case 'veh': ui.veh = id; render(); break;
    case 'seg': ui[el.dataset.k] = el.dataset.v; render(); break;
    case 'year': ui.year = +el.dataset.y; render(); break;
    case 'new-veh': formVehicle(); break;
    case 'edit-veh': formVehicle(find('vehicles')); break;
    case 'km': if (id && vehById(id)) formKm(id); break;
    case 'new-maint': formMaint(el.dataset.vid ? { vid: el.dataset.vid } : {}); break;
    case 'edit-maint': formMaint(find('maint')); break;
    case 'new-plan': formPlan(); break;
    case 'edit-plan': formPlan(find('plans')); break;
    case 'new-doc': formDoc(); break;
    case 'edit-doc': if (e.target.closest('[data-act="pay"],[data-act="ics"]') !== el && e.target.closest('.actions')) return; formDoc(find('docs')); break;
    case 'pay': e.stopPropagation(); { const d = find('docs'); await backend.save('docs', { ...d, pago: true, dataPagamento: today(), updatedAt: Date.now() }); toast('Marcado como pago'); } break;
    case 'ics': e.stopPropagation(); exportICS(find('docs')); break;
    case 'new-fuel': formFuel(el.dataset.vid ? { vid: el.dataset.vid } : {}); break;
    case 'edit-fuel': formFuel(find('fuel')); break;
    case 'suggest': suggestPlans(id); break;
    case 'export': downloadFile(`minha-garagem-backup-${today()}.json`, JSON.stringify({ app: 'minha-garagem', exportadoEm: new Date().toISOString(), data }, null, 2), 'application/json'); break;
    case 'import': importBackup(); break;
    case 'logout': if (confirm('Sair da conta?')) backend.signOut(); break;
    case 'reset-demo': if (confirm('Apagar todos os dados de demonstração?')) { try { localStorage.removeItem(DEMO_KEY); } catch { } location.reload(); } break;
  }
});
$('#fab').addEventListener('click', () => {
  if (ui.tab === 'maint') ui.maintSeg === 'plans' ? formPlan() : formMaint();
  else if (ui.tab === 'docs') formDoc();
  else if (ui.tab === 'fuel') formFuel();
  else addMenu();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

/* ================= Backends ================= */
const DEMO_KEY = 'minha-garagem-demo';
function seedDemo() {
  const y = new Date().getFullYear(), t = today();
  const back = (days) => toISO(new Date(parseD(t).getTime() - days * 86400000));
  const ahead = (days) => toISO(new Date(parseD(t).getTime() + days * 86400000));
  data.vehicles = [
    { id: 'v1', nome: 'Carro 1', tipo: 'carro', marca: 'Toyota', modelo: 'Corolla', ano: 2020, placa: 'ABC1D23', km: 61200, combustivel: 'Flex', ordem: 0 },
    { id: 'v2', nome: 'Carro 2', tipo: 'carro', marca: 'Fiat', modelo: 'Argo', ano: 2022, placa: 'XYZ4E56', km: 30500, combustivel: 'Flex', ordem: 1 },
    { id: 'v3', nome: 'Moto', tipo: 'moto', marca: 'Honda', modelo: 'CG 160', ano: 2021, placa: 'MOT0A12', km: 18900, combustivel: 'Gasolina', ordem: 2 }];
  data.maint = [
    { id: 'm1', vid: 'v1', tipo: 'Troca de óleo', data: back(200), km: 51800, custo: 320, oficina: 'Auto Center' },
    { id: 'm2', vid: 'v1', tipo: 'Alinhamento e balanceamento', data: back(90), km: 58000, custo: 150 },
    { id: 'm3', vid: 'v3', tipo: 'Troca de óleo', data: back(120), km: 15500, custo: 85 },
    { id: 'm4', vid: 'v2', tipo: 'Revisão geral', data: back(40), km: 30000, custo: 890, oficina: 'Concessionária' }];
  data.plans = [
    { id: 'p1', vid: 'v1', tipo: 'Troca de óleo', intervaloKm: 10000, intervaloMeses: 12, ultimaData: back(200), ultimoKm: 51800 },
    { id: 'p2', vid: 'v3', tipo: 'Troca de óleo', intervaloKm: 4000, intervaloMeses: 6, ultimaData: back(120), ultimoKm: 15500 },
    { id: 'p3', vid: 'v2', tipo: 'Fluido de freio', intervaloKm: null, intervaloMeses: 24, ultimaData: back(300), ultimoKm: 22000 }];
  data.docs = [
    { id: 'd1', vid: 'v1', tipo: 'Licenciamento (CRLV)', descricao: String(y), vencimento: ahead(18), valor: 160.22, pago: false },
    { id: 'd2', vid: 'v3', tipo: 'IPVA', descricao: `${y} parcela 3/3`, vencimento: back(3), valor: 120, pago: false },
    { id: 'd3', vid: 'v2', tipo: 'Seguro', descricao: 'Apólice anual', vencimento: ahead(140), valor: 2800, pago: false },
    { id: 'd4', vid: 'v1', tipo: 'IPVA', descricao: `${y} cota única`, vencimento: `${y}-01-20`, valor: 2950, pago: true, dataPagamento: `${y}-01-15` }];
  data.fuel = [
    { id: 'f1', vid: 'v1', data: back(30), km: 60300, litros: 40, valor: 240, combustivel: 'Gasolina', cheio: true },
    { id: 'f2', vid: 'v1', data: back(12), km: 60820, litros: 42.5, valor: 258.4, combustivel: 'Gasolina', cheio: true },
    { id: 'f3', vid: 'v3', data: back(20), km: 18500, litros: 9.8, valor: 60.5, combustivel: 'Gasolina', cheio: true },
    { id: 'f4', vid: 'v3', data: back(5), km: 18890, litros: 9.1, valor: 56.8, combustivel: 'Gasolina', cheio: true }];
}
function demoBackend() {
  let saved = null; try { saved = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); } catch { }
  if (saved) COLS.forEach((c) => (data[c] = saved[c] || [])); else seedDemo();
  const persist = () => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(data)); } catch { } };
  persist();
  return {
    demo: true,
    newId: () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
    async save(col, obj) { const i = data[col].findIndex((x) => x.id === obj.id); if (i >= 0) data[col][i] = { ...data[col][i], ...obj }; else data[col].push(obj); persist(); render(); },
    async remove(col, id) { data[col] = data[col].filter((x) => x.id !== id); persist(); render(); },
    signOut() { }
  };
}
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
async function firebaseBackend() {
  const B = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const [{ initializeApp }, A, F] = await Promise.all([import(B + 'firebase-app.js'), import(B + 'firebase-auth.js'), import(B + 'firebase-firestore.js')]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  let db;
  try { db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
  catch { db = F.getFirestore(app); }
  let uid = null, unsubs = [];
  const fail = (err) => toast('Erro ao salvar: ' + (err.code || err.message));
  const be = {
    demo: false, email: '',
    newId: () => F.doc(F.collection(db, '_ids')).id,
    save(col, obj) { F.setDoc(F.doc(db, 'users', uid, col, obj.id), clean(obj)).catch(fail); },
    remove(col, id) { F.deleteDoc(F.doc(db, 'users', uid, col, id)).catch(fail); },
    signOut: () => A.signOut(auth),
    login: (e, p) => A.signInWithEmailAndPassword(auth, e, p),
    reset: (e) => A.sendPasswordResetEmail(auth, e)
  };
  A.onAuthStateChanged(auth, (user) => {
    unsubs.forEach((u) => u()); unsubs = [];
    COLS.forEach((c) => (data[c] = []));
    $('#loading').hidden = true;
    if (!user) { uid = null; showApp(false); return; }
    uid = user.uid; be.email = user.email; showApp(true);
    for (const c of COLS) {
      unsubs.push(F.onSnapshot(F.collection(db, 'users', uid, c), (snap) => {
        data[c] = snap.docs.map((d) => ({ ...d.data(), id: d.id })); render();
      }, (err) => toast('Erro ao ler dados: ' + err.code)));
    }
    render();
  });
  return be;
}
function showApp(on) {
  $('#app').hidden = !on; $('#nav').hidden = !on; $('#login').hidden = on;
  if (!on) { $('#fab').hidden = true; closeSheet(); }
}

/* ================= Inicialização ================= */
$('#btn-settings').innerHTML = ico('gear');
$('#fab').innerHTML = ico('plus');
$('#login-logo').innerHTML = ico('carro');
const configured = firebaseConfig && firebaseConfig.apiKey && !/COLE/i.test(firebaseConfig.apiKey);
(async () => {
  if (!configured) {
    backend = demoBackend(); $('#loading').hidden = true; showApp(true); render(); return;
  }
  try { backend = await firebaseBackend(); }
  catch (err) { $('#loading').textContent = 'Não foi possível carregar o Firebase. Verifique a conexão e o config.js.'; console.error(err); return; }
  const ERR = { 'auth/invalid-credential': 'E-mail ou senha incorretos.', 'auth/invalid-email': 'E-mail inválido.', 'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.', 'auth/network-request-failed': 'Sem conexão com a internet.' };
  $('#login-form').onsubmit = async (e) => {
    e.preventDefault(); const f = e.target; $('#login-err').textContent = '';
    try { await backend.login(f.email.value.trim(), f.senha.value); }
    catch (err) { $('#login-err').textContent = ERR[err.code] || 'Erro: ' + err.code; }
  };
  $('#btn-reset').onclick = async () => {
    const email = $('#login-form').email.value.trim();
    if (!email) { $('#login-err').textContent = 'Digite seu e-mail acima primeiro.'; return; }
    try { await backend.reset(email); $('#login-err').textContent = ''; toast('Enviamos um link de redefinição para seu e-mail'); }
    catch (err) { $('#login-err').textContent = ERR[err.code] || 'Erro: ' + err.code; }
  };
})();
