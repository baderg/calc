/* Бизнес-слой: расчёт «как у бота» + текст расчёта */
(function (root) {
'use strict';
const E = root.AnnuEngine || require('./engine.js');
const I = root.AnnuI18n || require('./i18n.js');
const fmt = E.fmtNum;
const money = n => fmt(n) + ' ₸';
const yearsWord = n => I.years(n);

/**
 * quote(form, settings) → { variants:[...], common:{...} }
 * form: { sign, dob, gender, oppv, disability, enpf, own, lump (необяз.), mode:'min'|'max'|'custom', contract (для custom), gps:[a,b] }
 */
function quote(form, settings) {
  settings = settings || {};
  const lumpPct = (form.lumpPct === 0.06 || +form.lumpPct === 0.06) ? 0.06 : 0.08;
  const opts = { livingMin: settings.livingMin || {} };
  const S = +form.enpf || 0, rsv = [0.005, 0.01, 0.015, 0.02].includes(+form.reserve) ? +form.reserve : 0, Su = Math.floor(S * (1 - rsv)), ownIn = +form.own || 0, surr = form.transfer ? (+form.surrender || 0) : 0;
  const variants = [];
  const gps = form.gps && form.gps.length ? form.gps : [1];
  gps.forEach((gp, idx) => {
    const base = { sign: form.sign, dob: form.dob, gender: form.gender, oppv: form.oppv, disability: form.disability, gp };
    const probe = E.calculate(Object.assign({ enpf: S, own: 0, surrender: 0 }, base), opts);
    let contract;
    if (form.mode === 'max') contract = Su + ownIn + surr;
    else if (form.mode === 'custom') contract = +form.contract || 0;
    else contract = form.transfer ? Math.max(probe.minSum, surr) : probe.minSum;   // выкупную сумму уменьшить нельзя
    const r = E.calculate(Object.assign({ enpf: contract, own: 0, surrender: 0 }, base), opts);
    const lump = form.transfer ? 0 : Math.round(contract * lumpPct);
    let enpfIn, surrIn;
    if (form.transfer) { surrIn = Math.min(surr, contract); enpfIn = Math.min(Su, Math.max(contract - surrIn, 0)); }   // выкупная фиксирована, ЕНПФ уменьшается
    else { enpfIn = Math.min(Su, contract); surrIn = 0; }
    const enpfLeft = Math.max(S - enpfIn, 0);
    const gap = Math.max(contract - enpfIn - surrIn, 0);
    const lumpIn = Math.min(lump, gap);
    const own = gap - lumpIn;
    const toCard = lump - lumpIn;
    let title = gps.length > 1 ? (idx === 0 ? I.t('c.v1') : (idx === 1 ? I.t('c.v2') : I.t('c.var', idx + 1))) : I.t('c.calc');
    if (form.mode !== 'min' && gps.length > 1) title = I.t('c.varGp', yearsWord(gp));
    variants.push({ title, gp, reserve: rsv, contract, enpfIn, enpfLeft, surrIn, lumpIn, own, lumpTotal: lump, toCard,
      monthlyStart: r.monthlyAtStart, minSum: probe.minSum, status: r.status, result: r });
  });
  const r0 = variants[0].result;
  return { form, settings, variants, common: {
    type: I.t(r0.deferred ? 't.def' : 't.imm'), deferred: r0.deferred, startDateRu: r0.startDateRu, startAge: r0.startAge,
    ageAtSign: I.ageText(r0.ageAtSign), minPayment: r0.minPayment, livingMinMissing: r0.livingMinMissing,
    startDate: r0.startDate, signDate: r0.input.sign } };
}

function headerLine(form, r0) {
  const age = parseInt(r0.ageAtSign, 10);
  const tr = form.transfer ? I.t('q.transfer', form.oldDate.split('-').reverse().join('.'), money(+form.surrender || 0)) : '';
  const sex = I.t(form.gender === 'женский' ? 'q.sexF' : 'q.sexM');
  const op = I.t(form.oppv === 'да' ? 'q.oppv' : 'q.noOppv');
  const dis = form.disability && form.disability !== 'нет' ? ', ' + I.disText(form.disability) : '';
  return `${sex}, ${I.ageWord(age)}, ${op}${dis}, ${I.t('q.savings', money(+form.enpf || 0))}${tr}`;
}

function textReport(q) {
  const f = q.form, c = q.common, L = [], t = I.t;
  const name = (f.name || '').trim();
  L.push(t('q.title') + (name ? ' — ' + name : '') + ' (' + headerLine(f, q.variants[0].result) + ')');
  L.push('');
  if (c.deferred) {
    const sd = E_parse(c.startDate), sg = E_parse(c.signDate);
    const yrs = Math.max(0, Math.round((sd - sg) / 86400000 / 365.25));
    L.push(t('q.deferred', c.startAge, yearsWord(yrs), I.monthFrom(sd.getUTCMonth(), sd.getUTCFullYear())));
    L.push('');
  } else {
    L.push(t('q.immediate', c.startDateRu));
    L.push('');
  }
  q.variants.forEach(v => {
    if (v.status !== 'ok') { L.push('*' + v.title + '*'); L.push(t('q.impossible', I.statusText(v.status))); L.push(''); return; }
    const ind = Math.round(v.result.rates.j * 100);
    L.push('*' + v.title + '*');
    if (f.transfer) L.push(t('q.surrIn', money(v.surrIn)));
    L.push(t('q.enpfIn', money(v.enpfIn)));
    if (!f.transfer) L.push(t('q.lumpIn', money(v.lumpIn)));
    L.push(t('q.own', money(v.own)));
    L.push(t('q.contract', money(v.contract)));
    if (f.transfer || v.enpfLeft > 0) L.push(t('q.left', money(v.enpfLeft)));
    if (v.reserve > 0) L.push(t('q.reserve', String(v.reserve * 100).replace('.', ',')));
    L.push(t(c.deferred ? 'q.monthlyDef' : 'q.monthly', money(v.monthlyStart), ind));
    L.push(t('q.gp', v.gp === 0 ? t('q.gpNone') : yearsWord(v.gp)));
    if (!f.transfer) { L.push(t('q.lumpAll', money(v.lumpTotal), Math.round((+f.lumpPct || 0.08) * 100))); L.push(t('q.toCard', money(v.toCard))); }
    L.push('');
  });
  const v0 = q.variants[0];
  if (v0.status === 'ok' && v0.own > 0) L.push(t('q.short', money(v0.own)));
  if (q.variants.length > 1 && q.variants[1].status === 'ok') {
    const d = q.variants[1].contract - v0.contract;
    L.push(t('q.gpDiff', yearsWord(q.variants[1].gp), money(Math.abs(d)), t(d >= 0 ? 'q.more' : 'q.less')));
  }
  L.push(t('q.disc'));
  return L.join('\n');
}
function E_parse(s) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); }

const api = { quote, textReport, money, yearsWord, headerLine };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AnnuQuote = api;
})(typeof window !== 'undefined' ? window : globalThis);
