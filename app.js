(function () {
'use strict';
const $ = id => document.getElementById(id);
const Q = window.AnnuQuote, E = window.AnnuEngine, I = window.AnnuI18n, t = I.t, fmt = E.fmtNum;
const LS = { hist: 'annu_hist_v1', set: 'annu_set_v1' };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { alert(t('m.saveFail')); } };
let settings = Object.assign({ lumpPct: 0.11, gpA: 1, gpB: 10, agent: '', livingMin: {} }, load(LS.set, {}));
if (!settings.lang) { const nl = (navigator.language || 'ru').slice(0, 2); settings.lang = nl === 'kk' ? 'kk' : (nl === 'en' ? 'en' : 'ru'); }
I.setLang(settings.lang);
let cur = null; // текущий расчёт {q, form}

const dmy = (d, tm) => { const p = n => String(n).padStart(2, '0'); return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + (tm ? ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) : ''); };
const num = s => +(String(s || '').replace(/[^\d.]/g, '')) || 0;
// форматирование ввода денег пробелами
['enpf', 'own', 'contract', 'surr'].forEach(id => $(id).addEventListener('input', e => { const v = e.target.value.replace(/\D/g, ''); e.target.value = v ? fmt(+v) : ''; }));
const todayISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function fillGp(sel, val) { sel.innerHTML = ''; for (let i = 0; i <= 30; i++) { const o = document.createElement('option'); o.value = i; o.textContent = i === 0 ? t('gp.none') : i; sel.appendChild(o); } sel.value = val; }
fillGp($('gpA'), settings.gpA); fillGp($('sGpA'), settings.gpA);
$('sign').value = todayISO();
$('transfer').addEventListener('change', () => { $('transferWrap').hidden = !$('transfer').checked; $('lumpWrap').hidden = $('transfer').checked; });
$('mode').addEventListener('change', () => { $('contractWrap').hidden = $('mode').value !== 'custom'; });

// вкладки
document.querySelectorAll('nav button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('nav button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === b.dataset.tab));
  if (b.dataset.tab === 'tab-hist') renderHist();
}));

function readForm() {
  return { name: $('name').value.trim(), dob: $('dob').value, sign: $('sign').value, gender: $('gender').value, oppv: $('oppv').value,
    disability: $('disability').value, enpf: num($('enpf').value), own: num($('own').value), lumpPct: +$('lumpPct').value, reserve: +$('reserve').value,
    transfer: $('transfer').checked, oldDate: $('oldDate').value, surrender: num($('surr').value),
    mode: $('mode').value, contract: num($('contract').value), gps: [+$('gpA').value] };
}
function writeForm(f) {
  $('name').value = f.name || ''; $('dob').value = f.dob; $('sign').value = f.sign; $('gender').value = f.gender; $('oppv').value = f.oppv;
  $('disability').value = f.disability; $('enpf').value = f.enpf ? fmt(f.enpf) : ''; $('own').value = f.own ? fmt(f.own) : '';
  $('lumpPct').value = String(+f.lumpPct === 0.06 ? 0.06 : 0.08); $('reserve').value = String([0.005, 0.01, 0.015, 0.02].includes(+f.reserve) ? +f.reserve : 0); $('lumpWrap').hidden = !!f.transfer; $('mode').value = f.mode; $('contract').value = f.contract ? fmt(f.contract) : '';
  $('contractWrap').hidden = f.mode !== 'custom'; $('transfer').checked = !!f.transfer; $('transferWrap').hidden = !f.transfer; $('oldDate').value = f.oldDate || ''; $('surr').value = f.surrender ? fmt(f.surrender) : ''; $('gpA').value = f.gps[0];
}

$('f').addEventListener('submit', e => { e.preventDefault(); run(readForm()); });

function run(form, noScroll) {
  const warn = $('warn'); warn.hidden = true;
  try {
    if (form.transfer) {
      if (!form.oldDate) throw new Error(t('e.needOld'));
      const od = new Date(form.oldDate + 'T00:00:00Z'), ok = new Date(Date.UTC(od.getUTCFullYear() + 2, od.getUTCMonth(), od.getUTCDate()));
      if (new Date(form.sign + 'T00:00:00Z') < ok) { const d = ok.toISOString().slice(0, 10).split('-').reverse().join('.'); warn.innerHTML = t('e.twoYears', d); warn.hidden = false; $('result').hidden = true; return; }
    }
    const q = Q.quote(form, settings);
    cur = { q, form };
    render(q);
    const msgs = [];
    if (q.common.livingMinMissing) msgs.push(t('e.lmMissing', form.sign.slice(0, 4)));
    q.variants.forEach(v => { if (v.status !== 'ok') msgs.push(v.title + ': ' + I.statusText(v.status) + (v.status === 'накоплений не достаточно' ? t('e.need', fmt(v.minSum)) : '')); });
    if (form.mode === 'max' && q.variants[0].contract < q.variants[0].minSum) msgs.push(t('e.maxLess', fmt(q.variants[0].minSum)));
    if (msgs.length) { warn.innerHTML = msgs.join('<br>'); warn.hidden = false; }
    $('result').hidden = false; if (!noScroll) $('result').scrollIntoView({ behavior: 'smooth' });
  } catch (err) { warn.textContent = t('e.calc') + err.message; warn.hidden = false; $('result').hidden = true; }
}

function kv(a, b) { return `<div class="kv"><span>${a}</span><b>${b}</b></div>`; }
function render(q) {
  const c = q.common;
  $('cards').innerHTML = q.variants.map(v => {
    if (v.status !== 'ok') return `<div class="card"><h3>${v.title}</h3>${kv(t('c.status'), I.statusText(v.status))}</div>`;
    const r = v.result;
    return `<div class="card"><h3>${v.title}</h3>
      <div class="big">${Q.money(v.monthlyStart)}${t('c.perMonth')}</div>
      ${kv(t('c.type'), c.type)}${kv(t('c.start'), r.startDateRu + ' (' + t('c.ageSuffix', r.startAge) + ')')}
      ${q.form.transfer ? kv(t('c.surrIn'), Q.money(v.surrIn)) : ''}${kv(t('c.enpfIn'), Q.money(v.enpfIn))}${(q.form.transfer || v.enpfLeft > 0) ? kv(t('c.left'), Q.money(v.enpfLeft)) : ''}${v.reserve > 0 ? kv(t('c.reserve'), String(v.reserve * 100).replace('.', ',') + '%') : ''}${q.form.transfer ? '' : kv(t('c.lumpIn'), Q.money(v.lumpIn))}
      ${kv(t('c.own'), Q.money(v.own))}${kv(t('c.contract'), Q.money(v.contract))}
      ${kv(t('c.gp'), v.gp === 0 ? t('gp.none') : Q.yearsWord(v.gp) + t('c.until', r.gpEndRu))}
      ${q.form.transfer ? '' : kv(t('c.lumpAll'), Q.money(v.lumpTotal) + ' / ' + Q.money(v.toCard))}
      ${kv(t('c.minSum'), Q.money(v.minSum))}</div>`;
  }).join('');
  $('pdfVar').innerHTML = q.variants.map((v, i) => `<option value="${i}">${v.title}</option>`).join('');
  const ok = q.variants.find(v => v.status === 'ok');
  $('yearly').innerHTML = ok ? '<table><tr><th>' + t('tb.period') + '</th><th>' + t('tb.month') + '</th><th>' + t('tb.year') + '</th></tr>' + ok.result.yearly.map(y => `<tr><td>${y.from} – ${y.to}</td><td>${fmt(y.monthly)}</td><td>${fmt(y.year)}</td></tr>`).join('') + '</table>' : '';
  $('monthly').innerHTML = ok ? monthlyTable(ok.result) : '';
  $('txt').textContent = Q.textReport(q);
}
function monthlyTable(r) {
  return '<table><tr><th>' + t('tb.date') + '</th><th>' + t('tb.pay') + '</th><th>' + t('tb.death') + '</th><th>' + t('tb.surr') + '</th></tr>' +
    r.schedule.map(s => `<tr><td>${s.dateRu}</td><td>${fmt(s.payment)}</td><td>${fmt(s.deathGuarantee)}</td><td>${fmt(s.surrender)}</td></tr>`).join('') + '</table>';
}

// ---- действия ----
async function copyText(tx) { try { await navigator.clipboard.writeText(tx); toast(t('m.copied')); } catch (e) { const ta = document.createElement('textarea'); ta.value = tx; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(t('m.copied')); } }
function toast(m) { const d = document.createElement('div'); d.textContent = m; d.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#18222a;color:#fff;padding:10px 16px;border-radius:20px;z-index:20'; document.body.appendChild(d); setTimeout(() => d.remove(), 1800); }
$('bCopy').onclick = () => cur && copyText(Q.textReport(cur.q));
$('bShareTxt').onclick = async () => { if (!cur) return; const tx = Q.textReport(cur.q); if (navigator.share) { try { await navigator.share({ text: tx }); } catch (e) {} } else copyText(tx); };
$('bSave').onclick = () => {
  if (!cur) return; const h = load(LS.hist, []);
  const rec = { id: Date.now(), savedAt: new Date().toISOString(), form: cur.form };
  h.unshift(rec); save(LS.hist, h.slice(0, 500)); toast(t('h.saved'));
};
$('bPdf').onclick = async () => {
  if (!cur) return;
  try {
    const blob = await makePdf(cur.q, { monthly: $('pdfMonthly').checked, variant: +$('pdfVar').value || 0 });
    const nm = t('p.file') + '_' + (cur.form.name ? cur.form.name.replace(/[^\wа-яёәғқңөұүһі]+/gi, '_') + '_' : '') + cur.form.sign + '.pdf';
    const file = new File([blob], nm, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: nm }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); a.remove();
  } catch (e) { alert(t('m.pdfFail') + e.message); }
};

function logoPng() {
  return new Promise(res => { const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'); c.width = 1000; c.height = 276; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 1000, 276); x.drawImage(im, 0, 0, 1000, 276); res(c.toDataURL('image/png')); } catch (e) { res(null); } }; im.onerror = () => res(null); im.src = $('logo').src; });
}
async function makePdf(q, o) {
  const logo = await logoPng();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.addFileToVFS('DV.ttf', window.FONT_REG); doc.addFont('DV.ttf', 'DV', 'normal');
  doc.addFileToVFS('DVB.ttf', window.FONT_BOLD); doc.addFont('DVB.ttf', 'DV', 'bold');
  doc.setFont('DV', 'normal');
  const f = q.form, W = 210, M = 14;
  let y = 16;
  if (logo) { doc.addImage(logo, 'PNG', M, 10, 52, 14.4); y = 34; doc.setDrawColor(56, 170, 52); doc.setLineWidth(0.6); doc.line(M, 27, W - M, 27); }
  doc.setFont('DV', 'bold'); doc.setFontSize(16); doc.setTextColor(56, 170, 52);
  doc.text(t('p.title'), M, y); y += 7;
  doc.setFontSize(9); doc.setTextColor(90); doc.setFont('DV', 'normal');
  doc.text(t('p.date', dmy(new Date()), f.sign.split('-').reverse().join('.')), M, y); y += 6;
  doc.setTextColor(0); doc.setFontSize(11);
  if (f.name) { doc.setFont('DV', 'bold'); doc.text(t('p.client', f.name), M, y); doc.setFont('DV', 'normal'); y += 6; }
  const lines = doc.splitTextToSize(Q.headerLine(f, q.variants[0].result).replace(/^./, c => c.toUpperCase()), W - 2 * M);
  doc.text(lines, M, y); y += lines.length * 5 + 2;
  const c = q.common;
  const info = [[t('p.type'), c.type], [t('p.ageSign'), c.ageAtSign], [t('p.startDate'), c.startDateRu + ' (' + t('c.ageSuffix', c.startAge) + ')'],
    [t('p.minPay'), Q.money(c.minPayment || 0)]].concat(f.transfer ? [[t('p.transfer'), t('p.transferVal', f.oldDate.split('-').reverse().join('.'), Q.money(f.surrender || 0))]] : []);
  doc.autoTable({ startY: y, body: info, theme: 'plain', styles: { font: 'DV', fontSize: 10, cellPadding: 1.2 }, columnStyles: { 0: { textColor: 90, cellWidth: 70 }, 1: { fontStyle: 'bold' } }, margin: { left: M, right: M } });
  y = doc.lastAutoTable.finalY + 4;
  q.variants.forEach(v => {
    let body;
    if (v.status !== 'ok') body = [[t('c.status'), I.statusText(v.status)]];
    else {
      const tr = !!q.form.transfer;
      body = [[t('p.monthlyStart'), t('p.monthlyVal', Q.money(v.monthlyStart), Math.round(v.result.rates.j * 100))]];
      if (tr) body.push([t('p.surrIn'), Q.money(v.surrIn)]);
      body.push([t('p.enpfIn'), Q.money(v.enpfIn)]);
      if (!tr) body.push([t('p.lumpIn'), Q.money(v.lumpIn)]);
      body.push([t('p.own'), Q.money(v.own)], [t('p.contract'), Q.money(v.contract)]);
      if (tr || v.enpfLeft > 0) body.push([t('p.left'), Q.money(v.enpfLeft)]);
      if (v.reserve > 0) body.push([t('p.reserve'), t('p.reserveVal', String(v.reserve * 100).replace('.', ','))]);
      body.push(
        [t('p.gp'), v.gp === 0 ? t('gp.none') : Q.yearsWord(v.gp) + t('c.until', v.result.gpEndRu)]);
      if (!tr) body.push([t('p.lumpAll', Math.round(q.form.lumpPct * 100)), Q.money(v.lumpTotal)], [t('p.toCard'), Q.money(v.toCard)]);
    }
    doc.autoTable({ startY: y, head: [[{ content: v.title, colSpan: 2 }]], body, theme: 'grid', headStyles: { fillColor: [56, 170, 52], font: 'DV', fontStyle: 'bold' },
      styles: { font: 'DV', fontSize: 10, cellPadding: 1.8 }, columnStyles: { 0: { cellWidth: 75 }, 1: { fontStyle: 'bold' } }, margin: { left: M, right: M } });
    y = doc.lastAutoTable.finalY + 5;
  });
  const v = q.variants[o.variant] && q.variants[o.variant].status === 'ok' ? q.variants[o.variant] : q.variants.find(x => x.status === 'ok');
  if (v) {
    doc.addPage();
    doc.setFont('DV', 'bold'); doc.setFontSize(13); doc.setTextColor(56, 170, 52); doc.text(t('p.yearlyTitle'), M, 16);
    doc.autoTable({ startY: 20, head: [['№', t('p.thPeriod'), t('p.thMonth'), t('p.thYear')]], body: v.result.yearly.map((r, i) => [i + 1, r.from + ' – ' + r.to, fmt(r.monthly), fmt(r.year)]),
      theme: 'striped', headStyles: { fillColor: [56, 170, 52], font: 'DV', fontStyle: 'bold' }, styles: { font: 'DV', fontSize: 9, cellPadding: 1.4 }, columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } }, margin: { left: M, right: M } });
    if (o.monthly) {
      doc.addPage();
      doc.setFont('DV', 'bold'); doc.setFontSize(13); doc.setTextColor(56, 170, 52);
      doc.text(t('p.monthlyTitle', v.title), M, 16);
      doc.autoTable({ startY: 20, head: [['№', t('p.thDate'), t('p.thPay'), t('p.thDeath'), t('p.thSurr')]],
        body: v.result.schedule.map(s => [s.n + 1, s.dateRu, fmt(s.payment), fmt(s.deathGuarantee), fmt(s.surrender)]),
        theme: 'striped', headStyles: { fillColor: [56, 170, 52], font: 'DV', fontStyle: 'bold', fontSize: 8 }, styles: { font: 'DV', fontSize: 8, cellPadding: 1 },
        columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }, margin: { left: M, right: M } });
    }
  }
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFont('DV', 'normal'); doc.setFontSize(8); doc.setTextColor(120);
    doc.text(t('p.disc') + (settings.agent ? ' ' + settings.agent : ''), M, 289);
    doc.text(t('p.page', i, n), W - M, 289, { align: 'right' });
  }
  return doc.output('blob');
}

// ---- история ----
function renderHist() {
  const h = load(LS.hist, []), s = $('search').value.trim().toLowerCase();
  const list = h.filter(r => !s || (r.form.name || '').toLowerCase().includes(s));
  $('hist').innerHTML = list.length ? list.map(r => `<div class="h"><div><b>${r.form.name || t('h.noname')}</b><small>${dmy(new Date(r.savedAt), true)} · ${I.genderText(r.form.gender)}, ${r.form.dob.split('-').reverse().join('.')} · ${t('h.enpf')} ${fmt(r.form.enpf)} ₸</small></div><div><button data-o="${r.id}">${t('h.open')}</button> <button data-d="${r.id}">✕</button></div></div>`).join('') : '<p class="hint">' + t('h.empty') + '</p>';
}
$('search').addEventListener('input', renderHist);
$('hist').addEventListener('click', e => {
  const o = e.target.dataset.o, d = e.target.dataset.d; let h = load(LS.hist, []);
  if (d && confirm(t('h.confirmDel'))) { h = h.filter(r => String(r.id) !== d); save(LS.hist, h); renderHist(); }
  if (o) { const r = h.find(x => String(x.id) === o); if (r) { writeForm(r.form); document.querySelector('nav button[data-tab="tab-calc"]').click(); run(r.form); } }
});
$('bExport').onclick = () => { const b = new Blob([JSON.stringify(load(LS.hist, []), null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'annu_history.json'; a.click(); };
$('imp').onchange = e => { const fl = e.target.files[0]; if (!fl) return; fl.text().then(t => { try { const inc = JSON.parse(t), h = load(LS.hist, []), ids = new Set(h.map(x => x.id)); inc.forEach(x => { if (!ids.has(x.id)) h.push(x); }); h.sort((a, b) => b.id - a.id); save(LS.hist, h); renderHist(); toast(t('h.imported')); } catch (er) { alert(t('h.badfile')); } }); };

// ---- настройки ----
function renderSettings() {
  $('sAgent').value = settings.agent || '';
  const years = []; for (let y = 2023; y <= 2035; y++) years.push(y);
  const lm = Object.assign({}, E.LIVING_MIN, settings.livingMin || {});
  $('lmTable').innerHTML = years.map(y => `<div class="row" style="margin:4px 0;align-items:center"><span>${y}</span><input data-y="${y}" inputmode="numeric" value="${lm[y] ? fmt(lm[y]) : ''}" placeholder="${t('s.notset')}"></div>`).join('');
  $('ver').textContent = t('s.ver');
}
$('sSave').onclick = () => {
  settings.gpA = +$('sGpA').value; settings.agent = $('sAgent').value.trim();
  const lm = {}; document.querySelectorAll('#lmTable input').forEach(i => { const v = num(i.value); if (v) lm[i.dataset.y] = v; });
  settings.livingMin = lm; save(LS.set, settings); $('gpA').value = settings.gpA; toast(t('s.saved'));
};
function applyLang() {
  document.documentElement.lang = I.getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.title = t('app.title');
  const g = $('gpA').value, sg = $('sGpA').value; fillGp($('gpA'), g); fillGp($('sGpA'), sg);
  renderSettings(); renderHist();
  if (cur) { run(cur.form, true); }
}
$('lang').value = settings.lang;
$('lang').addEventListener('change', () => { settings.lang = I.setLang($('lang').value); save(LS.set, settings); applyLang(); });
renderSettings(); applyLang();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
