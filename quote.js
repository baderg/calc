/* Бизнес-слой: расчёт «как у бота» + текст расчёта */
(function (root) {
'use strict';
const E = root.AnnuEngine || require('./engine.js');
const fmt = E.fmtNum;
const money = n => fmt(n) + ' ₸';
const yearsWord = n => { const a = n % 100, b = n % 10; if (a > 10 && a < 15) return n + ' лет'; if (b === 1) return n + ' год'; if (b >= 2 && b <= 4) return n + ' года'; return n + ' лет'; };
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONTHS_FROM = MONTHS_GEN; // «с ноября 2029»

/**
 * quote(form, settings) → { variants:[...], common:{...} }
 * form: { sign, dob, gender, oppv, disability, enpf, own, lump (необяз.), mode:'min'|'max'|'custom', contract (для custom), gps:[a,b] }
 */
function quote(form, settings) {
  settings = settings || {};
  const lumpPct = (form.lumpPct === 0.06 || +form.lumpPct === 0.06) ? 0.06 : 0.08;
  const opts = { livingMin: settings.livingMin || {} };
  const S = +form.enpf || 0, ownIn = +form.own || 0, surr = form.transfer ? (+form.surrender || 0) : 0;
  const variants = [];
  const gps = form.gps && form.gps.length ? form.gps : [1];
  gps.forEach((gp, idx) => {
    const base = { sign: form.sign, dob: form.dob, gender: form.gender, oppv: form.oppv, disability: form.disability, gp };
    const probe = E.calculate(Object.assign({ enpf: S, own: 0, surrender: 0 }, base), opts);
    let contract;
    if (form.mode === 'max') contract = S + ownIn + surr;
    else if (form.mode === 'custom') contract = +form.contract || 0;
    else contract = form.transfer ? Math.max(probe.minSum, surr) : probe.minSum;   // выкупную сумму уменьшить нельзя
    const r = E.calculate(Object.assign({ enpf: contract, own: 0, surrender: 0 }, base), opts);
    const lump = form.transfer ? 0 : Math.round(contract * lumpPct);
    let enpfIn, surrIn;
    if (form.transfer) { surrIn = Math.min(surr, contract); enpfIn = Math.min(S, Math.max(contract - surrIn, 0)); }   // выкупная фиксирована, ЕНПФ уменьшается
    else { enpfIn = Math.min(S, contract); surrIn = 0; }
    const enpfLeft = Math.max(S - enpfIn, 0);
    const gap = Math.max(contract - enpfIn - surrIn, 0);
    const lumpIn = Math.min(lump, gap);
    const own = gap - lumpIn;
    const toCard = lump - lumpIn;
    let title = gps.length > 1 ? (idx === 0 ? 'С минимальной доплатой' : (idx === 1 ? 'С защитой семьи' : 'Вариант ' + (idx + 1))) : 'Расчёт';
    if (form.mode !== 'min' && gps.length > 1) title = 'Вариант: гарантированный период ' + yearsWord(gp);
    variants.push({ title, gp, contract, enpfIn, enpfLeft, surrIn, lumpIn, own, lumpTotal: lump, toCard,
      monthlyStart: r.monthlyAtStart, minSum: probe.minSum, status: r.status, result: r });
  });
  const r0 = variants[0].result;
  return { form, settings, variants, common: {
    type: r0.type, deferred: r0.deferred, startDateRu: r0.startDateRu, startAge: r0.startAge,
    ageAtSign: r0.ageAtSign, minPayment: r0.minPayment, livingMinMissing: r0.livingMinMissing,
    startDate: r0.startDate, signDate: r0.input.sign } };
}

function headerLine(form, r0) {
  const age = parseInt(r0.ageAtSign, 10);
  const tr = form.transfer ? `, переоформление из другой КСЖ (договор от ${form.oldDate.split('-').reverse().join('.')}, выкупная сумма ${money(+form.surrender || 0)})` : '';
  const sex = form.gender === 'женский' ? 'женщина' : 'мужчина';
  const op = form.oppv === 'да' ? 'с ОППВ' : 'без ОППВ';
  const dis = form.disability && form.disability !== 'нет' ? ', ' + form.disability : '';
  return `${sex}, ${yearsWord(age)}, ${op}${dis}, накопления в ЕНПФ ${money(+form.enpf || 0)}${tr}`;
}

function textReport(q) {
  const f = q.form, c = q.common, L = [];
  const name = (f.name || '').trim();
  L.push('*Ваш расчёт*' + (name ? ' — ' + name : '') + ' (' + headerLine(f, q.variants[0].result) + ')');
  L.push('');
  if (c.deferred) {
    const sd = E_parse(c.startDate), sg = E_parse(c.signDate);
    const yrs = Math.max(0, Math.round((sd - sg) / 86400000 / 365.25));
    L.push(`Выплаты начинаются не сразу. Договор заключаете сейчас, а выплаты стартуют с ${c.startAge} лет, то есть через ${yearsWord(yrs)} (ориентировочно с ${MONTHS_FROM[sd.getUTCMonth()]} ${sd.getUTCFullYear()}).`);
    L.push('');
  } else {
    L.push(`Выплаты начинаются сразу, с ${c.startDateRu}.`);
    L.push('');
  }
  q.variants.forEach(v => {
    if (v.status !== 'ok') { L.push('*' + v.title + '*'); L.push('Расчёт невозможен: ' + v.status); L.push(''); return; }
    L.push('*' + v.title + '*');
    if (f.transfer) L.push('Выкупная сумма из другой КСЖ идёт в договор: ' + money(v.surrIn));
    L.push('Накопления из ЕНПФ идут в договор: ' + money(v.enpfIn));
    if (!f.transfer) L.push('Из единовременной выплаты засчитывается в договор: ' + money(v.lumpIn));
    L.push('Ваши собственные деньги: ' + money(v.own));
    L.push('Сумма договора: ' + money(v.contract));
    if (f.transfer || v.enpfLeft > 0) L.push('Останется в ЕНПФ после оформления договора: ' + money(v.enpfLeft));
    L.push('Ежемесячная выплата: ' + money(v.monthlyStart) + ', пожизненно' + (c.deferred ? ' (на дату начала выплат, с индексацией ' + Math.round(v.result.rates.j * 100) + '% в год)' : ' (с индексацией ' + Math.round(v.result.rates.j * 100) + '% в год)'));
    L.push('Гарантированный период: ' + (v.gp === 0 ? 'без гарантированного периода' : yearsWord(v.gp)));
    if (!f.transfer) { L.push('Единовременная выплата всего: ' + money(v.lumpTotal) + ' (' + Math.round((+f.lumpPct || 0.08) * 100) + '% от суммы договора)'); L.push('Единовременная выплата на карту: ' + money(v.toCard)); }
    L.push('');
  });
  const v0 = q.variants[0];
  if (v0.status === 'ok' && v0.own > 0) L.push(`Накоплений на договор не хватает: ${money(v0.own)} вносятся собственными средствами.`);
  if (q.variants.length > 1 && q.variants[1].status === 'ok') {
    const d = q.variants[1].contract - v0.contract;
    L.push(`Гарантированный период ${yearsWord(q.variants[1].gp)} стоит около ${money(Math.abs(d))} ${d >= 0 ? 'сверху' : 'меньше'}, ежемесячная выплата при этом та же.`);
  }
  L.push('Расчёт предварительный и ориентировочный. Полный график выплат — в приложенном файле PDF.');
  return L.join('\n');
}
function E_parse(s) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); }

const api = { quote, textReport, money, yearsWord, headerLine };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AnnuQuote = api;
})(typeof window !== 'undefined' ? window : globalThis);
