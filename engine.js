/* Движок калькулятора ПА ANNU.KZ — порт эксель-файла (листы first / calc / Выплаты / Выплаты по годам) */
(function (root) {
'use strict';
const MORT = root.MORT || (typeof require !== 'undefined' ? require('./mort.js') : null);

// ---------- Excel-подобные хелперы ----------
const DAY = 86400000;
const D = (y, m, d) => new Date(Date.UTC(y, m - 1, d));          // DATE(): нормализует переполнение, как Excel
const Y = d => d.getUTCFullYear(), M = d => d.getUTCMonth() + 1, DD = d => d.getUTCDate();
const addDays = (d, n) => new Date(d.getTime() + n * DAY);
const eq = (a, b) => a.getTime() === b.getTime();
function EOMONTH(d, n) { return D(Y(d), M(d) + n + 1, 0); }
function EDATE(d, n) { const t = D(Y(d), M(d) + n, 1); const last = DD(D(Y(t), M(t) + 1, 0)); return D(Y(t), M(t), Math.min(DD(d), last)); }
function months(d1, d2) { let m = (Y(d2) - Y(d1)) * 12 + (M(d2) - M(d1)); if (DD(d2) < DD(d1)) m--; return m; }
const DATEDIF_y = (a, b) => Math.floor(months(a, b) / 12);
const DATEDIF_ym = (a, b) => months(a, b) % 12;
function ROUND(x, n) {            // ROUND как в Excel (от нуля), с защитой от хвостов двоичной дроби
  if (!isFinite(x)) return x;
  const k = Math.pow(10, n), s = x < 0 ? -1 : 1;
  return s * Math.round(Number((Math.abs(x) * k).toPrecision(15))) / k;
}
const ROUNDUP = (x, n) => { const k = Math.pow(10, n); return Math.ceil(Number((x * k).toPrecision(15))) / k; };
const pad = n => String(n).padStart(2, '0');
const fmtDate = d => pad(DD(d)) + '.' + pad(M(d)) + '.' + Y(d);
const fmtNum = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const iso = d => Y(d) + '-' + pad(M(d)) + '-' + pad(DD(d));
function parseDate(s) { if (s instanceof Date) return s; const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); if (m) return D(+m[1], +m[2], +m[3]); const k = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s); if (k) return D(+k[3], +k[2], +k[1]); throw new Error('Неверная дата: ' + s); }

function ageText(dob, d) {   // "67 г., 2 м., 3 д." как C17/C18
  const dayPart = DD(dob) > DD(d)
    ? ((DD(EOMONTH(EDATE(d, -1), 0)) - DD(dob)) < 0 ? DD(d) : DD(EOMONTH(EDATE(d, -1), 0)) - DD(dob) + DD(d))
    : DD(d) - DD(dob);
  return DATEDIF_y(dob, d) + ' г., ' + DATEDIF_ym(dob, d) + ' м., ' + dayPart + ' д.';
}

// Прожиточный минимум по годам (лист «Фин показатели»). Для 2027+ в файле стоят нули — их нужно вносить.
const LIVING_MIN = { 2023: 40567, 2024: 43407, 2025: 46228, 2026: 50851 };

// Окна для начала выплат у женщин (calc!B6:E12)
const F_ROWS = [
  { b: 52,   half: false, from: D(2021, 1, 1), to: D(2021, 12, 31) },
  { b: 52.5, half: true,  from: D(2022, 1, 1), to: D(2022, 12, 31) },
  { b: 53,   half: false, from: D(2023, 1, 1), to: D(2027, 12, 31) },
  { b: 53.5, half: true,  from: D(2028, 1, 1), to: D(2028, 12, 31) },
  { b: 54,   half: false, from: D(2029, 1, 1), to: D(2029, 12, 31) },
  { b: 54.5, half: true,  from: D(2030, 1, 1), to: D(2030, 12, 31) },
];

/**
 * calculate(inp, opts)
 * inp: { sign:'YYYY-MM-DD', dob:'YYYY-MM-DD', gender:'мужской'|'женский',
 *        enpf, own, surrender, gp (лет гарант. периода), oppv:'да'|'нет',
 *        disability:'нет'|'инвалидность 1 группы'|'инвалидность 2 группы'|'инвалидность 3 группы' }
 * opts: { livingMin: {год: сумма} } — переопределение прожиточного минимума
 */
function calculate(inp, opts) {
  opts = opts || {};
  const sign = parseDate(inp.sign), dob = parseDate(inp.dob);
  const gender = inp.gender, oppv = inp.oppv || 'нет', dis = inp.disability || 'нет';
  const gp = +inp.gp;
  const enpf = +inp.enpf || 0, own = +inp.own || 0, surr = +inp.surrender || 0;
  const C6 = enpf + own + surr;
  const male = gender === 'мужской';

  // ---- calc: параметры ----
  const H3 = 0.015, I3 = 0.03, L3 = 8, M3 = 0;
  const newRates = sign.getTime() >= D(2026, 2, 15).getTime();
  const J3 = newRates ? 0.09 : 0.08, K3 = newRates ? 0.08 : 0.07;
  const J4 = ROUND(Math.pow(1 + J3, 1 / 12) - 1, L3);
  const N3 = months(dob, sign) / 12;

  // код таблицы смертности
  let code;
  if (dis === 'нет') code = (oppv === 'нет' ? '_2_' : '_0_29_') + (male ? 'm' : 'f');
  else if (dis === 'инвалидность 1 группы') code = '_90_100_' + (male ? 'm' : 'f');
  else if (dis === 'инвалидность 2 группы') code = '_60_89_' + (male ? 'm' : 'f');
  else if (dis === 'инвалидность 3 группы') code = '_30_59_' + (male ? 'm' : 'f');
  else throw new Error('Неверное значение инвалидности');
  const A3 = (code === '_2_m' || code === '_2_f') ? 110 : 101;

  // возраст начала выплат у женщин (A5:A13)
  const dobSpecial = (DD(dob) >= 29 && M(dob) === 2);
  const fr = F_ROWS.map(r => {
    let c;
    if (!r.half) {
      c = (dobSpecial || DD(dob) > 30) ? EOMONTH(dob, 12 * r.b) : D(Y(dob) + r.b, M(dob), DD(dob));
    } else {
      c = ((DD(dob) >= 29 && M(dob) === 8) || DD(dob) > 30) ? EOMONTH(dob, 12 * r.b) : D(Math.trunc(Y(dob) + r.b), M(dob) + 6, DD(dob));
    }
    return { c, hit: (c >= r.from && c <= r.to) };
  });
  const A = [];                                            // A6..A11
  for (let i = 0; i < 6; i++) {
    const hit = fr[i].hit ? F_ROWS[i].b : 0;
    A[i] = i === 0 ? hit : hit * (A[i - 1] === 0 ? 1 : 0);
  }
  const A12 = A.reduce((s, x) => s + x, 0) === 0 ? 55 : 0;
  const femaleAge = A.reduce((s, x) => s + x, 0) + A12;
  const C3 = oppv === 'да' ? Math.max(50, Math.trunc(N3)) : (male ? 55 : femaleAge);

  // D3: дата «начало выплат у женщин» (VLOOKUP по A6:A12 → столбец C)
  let D3 = null;
  { const vals = A.concat([A12]); const idx = vals.findIndex(v => v === ROUND(C3, 2));
    if (idx >= 0) D3 = idx < 6 ? fr[idx].c : (dobSpecial || DD(dob) > 30 ? EOMONTH(dob, 12 * 55) : D(Y(dob) + 55, M(dob), DD(dob))); }
  // E3: дата достижения возраста C3
  const E3 = dobSpecial ? D(Y(dob) + C3, M(dob), DD(dob)) : (DD(dob) > 30 ? EOMONTH(dob, 12 * C3) : D(Y(dob) + C3, M(dob), DD(dob)));
  const G3 = D(Y(dob) + A3, M(dob), DD(dob));

  // ---- first: вид ПА ----
  const deferred = (male && N3 >= 45 && N3 < 55 && oppv === 'нет') || (!male && N3 >= 45 && N3 < 53 && oppv === 'нет') || (oppv === 'да' && N3 >= 40 && N3 < 50);
  const type = deferred ? 'отложенный ПА' : 'пенсионный аннуитет';

  let O3;
  if (!deferred) O3 = sign;
  else if (oppv === 'да') O3 = D(Y(dob) + C3, M(dob), DD(dob));
  else if (!male) O3 = D3;
  else O3 = (N3 >= C3) ? sign : E3;
  if (!O3) throw new Error('Не удалось определить дату начала выплат');
  const P3 = D(Y(sign), DD(sign) <= DD(O3) ? M(sign) : M(sign) + 1, DD(O3));

  // ---- calc: годовая таблица (строки 21..920) ----
  const B21 = DD(O3) === DD(P3) ? O3 : addDays(O3, 1);
  const NROW = 900;
  const rows = [];
  const dobAdj = dobSpecial ? addDays(dob, -1) : dob;
  const E21 = DATEDIF_y(dob, B21);
  const roundE21 = Math.trunc(E21);
  const N3floor = Math.trunc(N3);
  const mortCol = MORT[code];
  const lookupF = age => (age < A3) ? (age >= 1 && age <= 110 ? mortCol[age - 1] : NaN) : 0;
  let Bprev = null;
  for (let k = 0; k < NROW; k++) {
    const r = {};
    r.A = k + 1;
    if (k === 0) r.B = B21;
    else r.B = (DD(B21) === 29 && M(B21) === 2) ? EOMONTH(Bprev, 12) : D(Y(Bprev) + 1, M(Bprev), DD(Bprev));
    r.D = k === 0 ? 1 : ROUND(1 / Math.pow(1 + J3, r.A - 1), L3);
    r.E = k === 0 ? E21 : DATEDIF_y(dobAdj, r.B);
    r.F = lookupF(r.E);
    r.G = ROUND(r.E < A3 ? 1 - r.F : 0, L3);
    r.H = k === 0 ? 1 : ROUND(r.E === rows[k - 1].E ? rows[k - 1].H : rows[k - 1].H * rows[k - 1].G, L3);
    r.I = ROUND(Math.pow(1 + K3, Y(r.B) - Y(B21)), L3);
    r.K = ROUND((r.E < (roundE21 + gp) ? 1 : r.H) * r.I * r.D, L3);
    rows.push(r); Bprev = r.B;
  }
  const sumK = rows.reduce((s, r) => s + r.K, 0);
  const B16 = ROUND((sumK - 11 / 24) * (deferred ? Math.pow((1 + K3) / (1 + J3), E21 - N3floor) : 1), 2);
  const C16 = ROUND(B16 * (1 + I3) / (1 - H3), 2);
  const D16 = ROUND(C16 * 12, L3);
  const L21 = ROUND(C6 / D16 * Math.pow(1 + K3, E21 - N3floor), M3);

  // ---- first: итоги ----
  const lm = Object.assign({}, LIVING_MIN, opts.livingMin || {})[Y(sign)];
  let C26 = (lm === undefined) ? null : ROUNDUP(0.7 * lm, 0);
  const livingMinMissing = !lm;                       // 0 или нет данных (2027+ в файле нули)
  const C28 = ROUND((C26 || 0) * D16, M3);
  const C29 = Math.min(C6 - C28, 0);
  let C21, status = 'ok';
  if (C6 < C28) { C21 = null; status = 'накоплений не достаточно'; }
  else if ((N3 >= 45 && N3 < 100) || (oppv === 'да' && N3 >= 40 && N3 <= 100)) C21 = L21;
  else { C21 = null; status = 'возраст не соответствует'; }
  const C20 = deferred ? ROUND(C6 / D16, 0) : C21;
  const C22 = B21;
  const C23 = addDays(EDATE(C22, 12 * gp), -1);

  // ---- помесячный график ----
  const NM = 840;                                        // строки 2..841
  const mo = [];
  let Bm = P3;
  for (let k = 0; k < NM; k++) {
    const r = { A: k };
    if (k > 0) { const a = D(Y(Bm), M(Bm) + 2, 0), b = D(Y(Bm), M(Bm) + 1, DD(P3)); Bm = a < b ? a : b; }
    r.B = Bm;
    r.show = k === 0 ? Bm <= G3 : Bm < G3;                // F<>""
    r.Dv = Math.round(
      Bm < C22 ? 0 : (eq(Bm, B21) ? L21 : (M(B21) === M(Bm) ? (k ? mo[k - 1].Dv : 0) * (1 + K3) : (k ? mo[k - 1].Dv : 0))));
    r.Dv = ROUND(Bm < C22 ? 0 : (eq(Bm, B21) ? L21 : (M(B21) === M(Bm) ? (k ? mo[k - 1].Dv : 0) * (1 + K3) : (k ? mo[k - 1].Dv : 0))), 0);
    r.Ev = ROUND(Bm < C23 ? Math.pow(1 / (1 + J4), r.A) : 0, L3);
    r.G = r.show ? ((Bm < C22 ? 0 : r.Dv) * (Y(Bm) <= Y(dob) + A3 ? 1 : 0)) : null;
    mo.push(r);
  }
  // выкупная сумма I и «выплата гарантированных платежей при смерти» H
  let cum = 0;
  for (let k = 0; k < NM; k++) {
    const r = mo[k];
    if (!r.show) { r.I = null; continue; }
    cum += r.G;
    if (k === 0) r.I = ROUND(Math.max(0, (C6 * (1 - H3) - (1 + I3) * cum) * (1 + J4)), 0);
    else r.I = ROUND(Math.max(0, (mo[k - 1].I - (1 + I3) * r.G) * (1 + J4)), 0);
  }
  // суффиксные суммы для H
  const suf = new Array(NM + 1).fill(0);
  for (let k = NM - 1; k >= 0; k--) suf[k] = suf[k + 1] + mo[k].Ev * (mo[k].G || 0);
  for (let k = 0; k < NM; k++) {
    const r = mo[k];
    if (!r.show) { r.H = null; continue; }
    r.H = (r.G === 0) ? r.I : ROUND(suf[k + 1] * Math.pow(1 + J4, k + 1), M3);
  }
  const schedule = mo.filter(r => r.show).map(r => ({
    n: r.A, date: iso(r.B), dateRu: fmtDate(r.B), label: r.A === 0 ? fmtDate(r.B) : 'До ' + fmtDate(r.B),
    payment: r.G, deathGuarantee: r.H, surrender: r.I,
  }));

  // ---- график по годам ----
  const yearly = [];
  { let b = C22, e = C21 === null ? 0 : C21;
    for (let k = 0; k < 89; k++) {
      if (k > 0) { const nb = EDATE(b, 12); if (nb > G3) break; b = nb; e = ROUND(e * (1 + K3), 0); }
      else if (b > G3) break;
      const end = addDays(EDATE(b, 12), -1);
      yearly.push({ from: fmtDate(b), to: fmtDate(end), monthly: e, year: e * 12, ageFrom: DATEDIF_y(dob, b) });
    } }

  return {
    input: { sign: iso(sign), dob: iso(dob), gender, enpf, own, surrender: surr, gp, oppv, disability: dis },
    type, deferred, status,
    premium: C6, tariff: D16, annuityFactor: C16, factorGP: B16,
    minPayment: C26, minSum: C28, shortfall: C29, livingMinMissing,
    monthlyAtSigning: C20, monthlyAtStart: C21,
    startDate: iso(C22), startDateRu: fmtDate(C22), gpEndRu: fmtDate(C23),
    lastPaymentDateRu: fmtDate(G3), gpPayments: gp * 12,
    ageAtSign: ageText(dob, sign), ageAtStart: ageText(dob, C22),
    deferralPeriod: eq(sign, C22) ? '0' : ageText(sign, C22).replace(/^(\d+ г\., \d+ м\., )(.*)$/, '$1$2'),
    startAge: DATEDIF_y(dob, C22),
    rates: { i: J3, j: K3, c: H3, d: I3 },
    schedule, yearly,
    _debug: { N3, C3, A3, code, O3: iso(O3), P3: iso(P3), E21 },
  };
}

const api = { calculate, fmtNum, LIVING_MIN };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AnnuEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
