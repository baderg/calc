(function () {
'use strict';
const $ = id => document.getElementById(id);
const Q = window.AnnuQuote, E = window.AnnuEngine, fmt = E.fmtNum;
const LS = { hist: 'annu_hist_v1', set: 'annu_set_v1' };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { alert('Не удалось сохранить данные на телефоне'); } };
let settings = Object.assign({ lumpPct: 0.11, gpA: 1, gpB: 10, agent: '', livingMin: {} }, load(LS.set, {}));
let cur = null; // текущий расчёт {q, form}

const num = s => +(String(s || '').replace(/[^\d.]/g, '')) || 0;
// форматирование ввода денег пробелами
['enpf', 'own', 'contract', 'surr'].forEach(id => $(id).addEventListener('input', e => { const v = e.target.value.replace(/\D/g, ''); e.target.value = v ? fmt(+v) : ''; }));
const todayISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function fillGp(sel, val) { sel.innerHTML = ''; for (let i = 0; i <= 20; i++) { const o = document.createElement('option'); o.value = i; o.textContent = i === 0 ? 'без' : i; sel.appendChild(o); } sel.value = val; }
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
    disability: $('disability').value, enpf: num($('enpf').value), own: num($('own').value), lumpPct: +$('lumpPct').value,
    transfer: $('transfer').checked, oldDate: $('oldDate').value, surrender: num($('surr').value),
    mode: $('mode').value, contract: num($('contract').value), gps: [+$('gpA').value] };
}
function writeForm(f) {
  $('name').value = f.name || ''; $('dob').value = f.dob; $('sign').value = f.sign; $('gender').value = f.gender; $('oppv').value = f.oppv;
  $('disability').value = f.disability; $('enpf').value = f.enpf ? fmt(f.enpf) : ''; $('own').value = f.own ? fmt(f.own) : '';
  $('lumpPct').value = String(+f.lumpPct === 0.06 ? 0.06 : 0.08); $('lumpWrap').hidden = !!f.transfer; $('mode').value = f.mode; $('contract').value = f.contract ? fmt(f.contract) : '';
  $('contractWrap').hidden = f.mode !== 'custom'; $('transfer').checked = !!f.transfer; $('transferWrap').hidden = !f.transfer; $('oldDate').value = f.oldDate || ''; $('surr').value = f.surrender ? fmt(f.surrender) : ''; $('gpA').value = f.gps[0];
}

$('f').addEventListener('submit', e => { e.preventDefault(); run(readForm()); });

function run(form) {
  const warn = $('warn'); warn.hidden = true;
  try {
    if (form.transfer) {
      if (!form.oldDate) throw new Error('Укажите дату действующего договора с другой КСЖ');
      const od = new Date(form.oldDate + 'T00:00:00Z'), ok = new Date(Date.UTC(od.getUTCFullYear() + 2, od.getUTCMonth(), od.getUTCDate()));
      if (new Date(form.sign + 'T00:00:00Z') < ok) { const d = ok.toISOString().slice(0, 10).split('-').reverse().join('.'); warn.innerHTML = 'Переоформление невозможно: с даты действующего договора не прошло 2 лет. Раньше ' + d + ' заключить новый договор нельзя.'; warn.hidden = false; $('result').hidden = true; return; }
    }
    const q = Q.quote(form, settings);
    cur = { q, form };
    render(q);
    const msgs = [];
    if (q.common.livingMinMissing) msgs.push('Для года ' + form.sign.slice(0, 4) + ' не задан прожиточный минимум (в файле для 2027+ стоят нули). Минимальная сумма договора считается как 0. Введите значение в «Настройки».');
    q.variants.forEach(v => { if (v.status !== 'ok') msgs.push(v.title + ': ' + v.status + (v.status === 'накоплений не достаточно' ? ' (нужно ' + fmt(v.minSum) + ' ₸)' : '')); });
    if (form.mode === 'max' && q.variants[0].contract < q.variants[0].minSum) msgs.push('Накоплений меньше минимальной суммы договора (' + fmt(q.variants[0].minSum) + ' ₸).');
    if (msgs.length) { warn.innerHTML = msgs.join('<br>'); warn.hidden = false; }
    $('result').hidden = false; $('result').scrollIntoView({ behavior: 'smooth' });
  } catch (err) { warn.textContent = 'Ошибка расчёта: ' + err.message; warn.hidden = false; $('result').hidden = true; }
}

function kv(a, b) { return `<div class="kv"><span>${a}</span><b>${b}</b></div>`; }
function render(q) {
  const c = q.common;
  $('cards').innerHTML = q.variants.map(v => {
    if (v.status !== 'ok') return `<div class="card"><h3>${v.title}</h3>${kv('Статус', v.status)}</div>`;
    const r = v.result;
    return `<div class="card"><h3>${v.title}</h3>
      <div class="big">${Q.money(v.monthlyStart)} / мес</div>
      ${kv('Вид', r.type)}${kv('Начало выплат', r.startDateRu + ' (' + r.startAge + ' лет)')}
      ${q.form.transfer ? kv('Выкупная сумма другой КСЖ в договор', Q.money(v.surrIn)) : ''}${kv('Накопления ЕНПФ в договор', Q.money(v.enpfIn))}${(q.form.transfer || v.enpfLeft > 0) ? kv('Останется в ЕНПФ', Q.money(v.enpfLeft)) : ''}${q.form.transfer ? '' : kv('Из единовременной в договор', Q.money(v.lumpIn))}
      ${kv('Собственные средства', Q.money(v.own))}${kv('Сумма договора', Q.money(v.contract))}
      ${kv('Гарантированный период', v.gp === 0 ? 'без' : Q.yearsWord(v.gp) + ' (до ' + r.gpEndRu + ')')}
      ${q.form.transfer ? '' : kv('Единовременная всего / на карту', Q.money(v.lumpTotal) + ' / ' + Q.money(v.toCard))}
      ${kv('Минимальная сумма договора', Q.money(v.minSum))}</div>`;
  }).join('');
  $('pdfVar').innerHTML = q.variants.map((v, i) => `<option value="${i}">${v.title}</option>`).join('');
  const ok = q.variants.find(v => v.status === 'ok');
  $('yearly').innerHTML = ok ? '<table><tr><th>Период</th><th>В месяц</th><th>За год</th></tr>' + ok.result.yearly.map(y => `<tr><td>${y.from} – ${y.to}</td><td>${fmt(y.monthly)}</td><td>${fmt(y.year)}</td></tr>`).join('') + '</table>' : '';
  $('monthly').innerHTML = ok ? monthlyTable(ok.result) : '';
  $('txt').textContent = Q.textReport(q);
}
function monthlyTable(r) {
  return '<table><tr><th>Дата</th><th>Выплата</th><th>Гарант. при смерти</th><th>Выкупная</th></tr>' +
    r.schedule.map(s => `<tr><td>${s.dateRu}</td><td>${fmt(s.payment)}</td><td>${fmt(s.deathGuarantee)}</td><td>${fmt(s.surrender)}</td></tr>`).join('') + '</table>';
}

// ---- действия ----
async function copyText(t) { try { await navigator.clipboard.writeText(t); toast('Скопировано'); } catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Скопировано'); } }
function toast(m) { const d = document.createElement('div'); d.textContent = m; d.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#18222a;color:#fff;padding:10px 16px;border-radius:20px;z-index:20'; document.body.appendChild(d); setTimeout(() => d.remove(), 1800); }
$('bCopy').onclick = () => cur && copyText(Q.textReport(cur.q));
$('bShareTxt').onclick = async () => { if (!cur) return; const t = Q.textReport(cur.q); if (navigator.share) { try { await navigator.share({ text: t }); } catch (e) {} } else copyText(t); };
$('bSave').onclick = () => {
  if (!cur) return; const h = load(LS.hist, []);
  const rec = { id: Date.now(), savedAt: new Date().toISOString(), form: cur.form };
  h.unshift(rec); save(LS.hist, h.slice(0, 500)); toast('Сохранено в историю');
};
$('bPdf').onclick = async () => {
  if (!cur) return;
  try {
    const blob = await makePdf(cur.q, { monthly: $('pdfMonthly').checked, variant: +$('pdfVar').value || 0 });
    const nm = 'Расчет_ПА_' + (cur.form.name ? cur.form.name.replace(/[^\wа-яё]+/gi, '_') + '_' : '') + cur.form.sign + '.pdf';
    const file = new File([blob], nm, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: nm }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); a.remove();
  } catch (e) { alert('Не удалось создать PDF: ' + e.message); }
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
  doc.text('Расчёт пенсионного аннуитета', M, y); y += 7;
  doc.setFontSize(9); doc.setTextColor(90); doc.setFont('DV', 'normal');
  doc.text('Дата расчёта: ' + new Date().toLocaleDateString('ru-RU') + ' · дата заключения: ' + f.sign.split('-').reverse().join('.'), M, y); y += 6;
  doc.setTextColor(0); doc.setFontSize(11);
  if (f.name) { doc.setFont('DV', 'bold'); doc.text('Клиент: ' + f.name, M, y); doc.setFont('DV', 'normal'); y += 6; }
  const lines = doc.splitTextToSize(Q.headerLine(f, q.variants[0].result).replace(/^./, c => c.toUpperCase()), W - 2 * M);
  doc.text(lines, M, y); y += lines.length * 5 + 2;
  const c = q.common;
  const info = [['Вид', c.type], ['Возраст на дату заключения', c.ageAtSign], ['Дата начала выплат', c.startDateRu + ' (' + c.startAge + ' лет)'],
    ['Минимальная периодичная выплата', Q.money(c.minPayment || 0)]].concat(f.transfer ? [['Переоформление из другой КСЖ', 'договор от ' + f.oldDate.split('-').reverse().join('.') + ', выкупная сумма ' + Q.money(f.surrender || 0)]] : []);
  doc.autoTable({ startY: y, body: info, theme: 'plain', styles: { font: 'DV', fontSize: 10, cellPadding: 1.2 }, columnStyles: { 0: { textColor: 90, cellWidth: 70 }, 1: { fontStyle: 'bold' } }, margin: { left: M, right: M } });
  y = doc.lastAutoTable.finalY + 4;
  q.variants.forEach(v => {
    let body;
    if (v.status !== 'ok') body = [['Статус', v.status]];
    else {
      const tr = !!q.form.transfer;
      body = [['Ежемесячная выплата на старте', Q.money(v.monthlyStart) + ', пожизненно, индексация ' + Math.round(v.result.rates.j * 100) + '% в год']];
      if (tr) body.push(['Выкупная сумма другой КСЖ в договор', Q.money(v.surrIn)]);
      body.push(['Накопления из ЕНПФ в договор', Q.money(v.enpfIn)]);
      if (!tr) body.push(['Из единовременной выплаты в договор', Q.money(v.lumpIn)]);
      body.push(['Собственные средства', Q.money(v.own)], ['Сумма договора', Q.money(v.contract)]);
      if (tr || v.enpfLeft > 0) body.push(['Останется в ЕНПФ после оформления', Q.money(v.enpfLeft)]);
      body.push(
        ['Гарантированный период', v.gp === 0 ? 'без' : Q.yearsWord(v.gp) + ' (до ' + v.result.gpEndRu + ')']);
      if (!tr) body.push(['Единовременная выплата всего (' + Math.round(q.form.lumpPct * 100) + '%)', Q.money(v.lumpTotal)], ['Единовременная выплата на карту', Q.money(v.toCard)]);
    }
    doc.autoTable({ startY: y, head: [[{ content: v.title, colSpan: 2 }]], body, theme: 'grid', headStyles: { fillColor: [56, 170, 52], font: 'DV', fontStyle: 'bold' },
      styles: { font: 'DV', fontSize: 10, cellPadding: 1.8 }, columnStyles: { 0: { cellWidth: 75 }, 1: { fontStyle: 'bold' } }, margin: { left: M, right: M } });
    y = doc.lastAutoTable.finalY + 5;
  });
  const v = q.variants[o.variant] && q.variants[o.variant].status === 'ok' ? q.variants[o.variant] : q.variants.find(x => x.status === 'ok');
  if (v) {
    doc.addPage();
    doc.setFont('DV', 'bold'); doc.setFontSize(13); doc.setTextColor(56, 170, 52); doc.text('График выплат по годам', M, 16);
    doc.autoTable({ startY: 20, head: [['№', 'Период выплат', 'В месяц, ₸', 'За год, ₸']], body: v.result.yearly.map((r, i) => [i + 1, r.from + ' – ' + r.to, fmt(r.monthly), fmt(r.year)]),
      theme: 'striped', headStyles: { fillColor: [56, 170, 52], font: 'DV', fontStyle: 'bold' }, styles: { font: 'DV', fontSize: 9, cellPadding: 1.4 }, columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } }, margin: { left: M, right: M } });
    if (o.monthly) {
      doc.addPage();
      doc.setFont('DV', 'bold'); doc.setFontSize(13); doc.setTextColor(56, 170, 52);
      doc.text('Помесячный график и выкупные суммы · ' + v.title, M, 16);
      doc.autoTable({ startY: 20, head: [['№', 'Дата выплаты', 'Выплата, ₸', 'Гарант. выплата при смерти, ₸', 'Выкупная сумма, ₸']],
        body: v.result.schedule.map(s => [s.n + 1, s.dateRu, fmt(s.payment), fmt(s.deathGuarantee), fmt(s.surrender)]),
        theme: 'striped', headStyles: { fillColor: [56, 170, 52], font: 'DV', fontStyle: 'bold', fontSize: 8 }, styles: { font: 'DV', fontSize: 8, cellPadding: 1 },
        columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }, margin: { left: M, right: M } });
    }
  }
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFont('DV', 'normal'); doc.setFontSize(8); doc.setTextColor(120);
    doc.text('Расчёт предварительный и ориентировочный, не является офертой.' + (settings.agent ? ' ' + settings.agent : ''), M, 289);
    doc.text('стр. ' + i + ' / ' + n, W - M, 289, { align: 'right' });
  }
  return doc.output('blob');
}

// ---- история ----
function renderHist() {
  const h = load(LS.hist, []), s = $('search').value.trim().toLowerCase();
  const list = h.filter(r => !s || (r.form.name || '').toLowerCase().includes(s));
  $('hist').innerHTML = list.length ? list.map(r => `<div class="h"><div><b>${r.form.name || 'Без имени'}</b><small>${new Date(r.savedAt).toLocaleString('ru-RU')} · ${r.form.gender}, ${r.form.dob.split('-').reverse().join('.')} · ЕНПФ ${fmt(r.form.enpf)} ₸</small></div><div><button data-o="${r.id}">Открыть</button> <button data-d="${r.id}">✕</button></div></div>`).join('') : '<p class="hint">Сохранённых расчётов пока нет.</p>';
}
$('search').addEventListener('input', renderHist);
$('hist').addEventListener('click', e => {
  const o = e.target.dataset.o, d = e.target.dataset.d; let h = load(LS.hist, []);
  if (d && confirm('Удалить расчёт?')) { h = h.filter(r => String(r.id) !== d); save(LS.hist, h); renderHist(); }
  if (o) { const r = h.find(x => String(x.id) === o); if (r) { writeForm(r.form); document.querySelector('nav button[data-tab="tab-calc"]').click(); run(r.form); } }
});
$('bExport').onclick = () => { const b = new Blob([JSON.stringify(load(LS.hist, []), null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'annu_history.json'; a.click(); };
$('imp').onchange = e => { const fl = e.target.files[0]; if (!fl) return; fl.text().then(t => { try { const inc = JSON.parse(t), h = load(LS.hist, []), ids = new Set(h.map(x => x.id)); inc.forEach(x => { if (!ids.has(x.id)) h.push(x); }); h.sort((a, b) => b.id - a.id); save(LS.hist, h); renderHist(); toast('Импортировано'); } catch (er) { alert('Файл не распознан'); } }); };

// ---- настройки ----
function renderSettings() {
  $('sAgent').value = settings.agent || '';
  const years = []; for (let y = 2023; y <= 2035; y++) years.push(y);
  const lm = Object.assign({}, E.LIVING_MIN, settings.livingMin || {});
  $('lmTable').innerHTML = years.map(y => `<div class="row" style="margin:4px 0;align-items:center"><span>${y}</span><input data-y="${y}" inputmode="numeric" value="${lm[y] ? fmt(lm[y]) : ''}" placeholder="не задан"></div>`).join('');
  $('ver').textContent = 'Движок: порт файла «График выплат» (листы first/calc). Ставки: до 15.02.2026 — 8%/7%, после — 9%/8%.';
}
$('sSave').onclick = () => {
  settings.gpA = +$('sGpA').value; settings.agent = $('sAgent').value.trim();
  const lm = {}; document.querySelectorAll('#lmTable input').forEach(i => { const v = num(i.value); if (v) lm[i.dataset.y] = v; });
  settings.livingMin = lm; save(LS.set, settings); $('gpA').value = settings.gpA; toast('Настройки сохранены');
};
renderSettings();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
