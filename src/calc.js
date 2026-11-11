// Everything that is counted is counted here, in code, not by the model (scope task 6):
// value totals, the value-to-price ratio, which obstacles are still open, real capacity,
// the ten checks before publishing (method PDF p.10), and the minimum package.
import {
  PROBLEMS, IDEAS, COMPONENTS, BONUS_DRAFTS, OUTCOMES, GUARANTEE_DRAFTS, CANCEL_TEXT, CORE, FROM_STEP5, USER, BASKET, CLIENT_FILE, GENDER, g,
} from './data.js';

const pickF = (o, k) => (GENDER === 'f' && o[`${k}F`]) || o[k];

export function freshState() {
  const o = OUTCOMES[0];
  return {
    outcome: { id: o.id, text: pickF(o, 'text'), time: o.time, status: pickF(o, 'status'), byShark: true },
    problems: PROBLEMS.map((p) => ({ ...p, text: pickF(p, 'text'), on: true })),
    ideas: IDEAS.map((d) => ({ ...d, in: d.value === 'high' })),
    comps: COMPONENTS.map((c) => ({ ...c, ideas: [...c.ideas] })),
    price: CORE.price,
    pay: CORE.pay === 'monthly' ? 'monthly' : 'start',
    anchor: { on: false },
    bonuses: null, // filled by the shark on the first visit to the bonuses screen
    guarantee: { type: 'free', ...GUARANTEE_DRAFTS.free, cancel: CANCEL_TEXT },
    seats: { on: false },
    urgency: { id: 'none', date: '' },
    name: { id: null, text: '' },
    reached: 0,
  };
}

// ---------- what is in the offer ----------
export const activeProblems = (s) => s.problems.filter((p) => p.on);
const keptIdeaIds = (s) => new Set(s.ideas.filter((d) => d.in).map((d) => d.id));
// A component is in the offer while at least one of its ways of delivery is kept.
export const activeComps = (s) => {
  const kept = keptIdeaIds(s);
  return s.comps.filter((c) => c.ideas.some((i) => kept.has(i)));
};
export const ideasOf = (s, c) => s.ideas.filter((d) => d.in && c.ideas.includes(d.id));
// Kept ways of delivery that no component holds yet (the user moved one back in).
export const loose = (s) => {
  const held = new Set(s.comps.flatMap((c) => c.ideas));
  return s.ideas.filter((d) => d.in && !held.has(d.id));
};
export const solvedBy = (s, pid) => s.ideas.filter((d) => d.in && d.solves.includes(pid));

export function covered(s) {
  const kept = keptIdeaIds(s);
  const ids = new Set();
  activeComps(s).forEach((c) => s.ideas.forEach((d) => kept.has(d.id) && c.ideas.includes(d.id) && d.solves.forEach((p) => ids.add(p))));
  return ids;
}
export const bonusList = (s) => (s.bonuses || []).filter((b) => b.on);
// Obstacles that no component solves: each one is a reason someone won't buy (prompt 3.5).
export function openObstacles(s, withBonuses = false) {
  const c = covered(s);
  const b = new Set(withBonuses ? bonusList(s).map((x) => x.for) : []);
  return activeProblems(s).filter((p) => !c.has(p.id) && !b.has(p.id));
}

// The shark's bonuses: one for each open obstacle, from the basket first, tools before lessons.
// They arrive switched off, so the user switches them on and sees the meter move.
export function draftBonuses(s, on = false) {
  return openObstacles(s).map((p) => {
    const d = BONUS_DRAFTS[p.id];
    return d
      ? { id: `b-${p.id}`, for: p.id, on, byShark: true, ...d }
      : { id: `b-${p.id}`, for: p.id, on: false, byShark: true, empty: true, name: '', what: '', kind: 'כלי', value: null, basis: 'separate', note: '' };
  });
}

// ---------- value ----------
export const compsTotal = (s) => activeComps(s).reduce((a, c) => a + (Number(c.value) || 0), 0);
export const bonusTotal = (s) => bonusList(s).reduce((a, b) => a + (Number(b.value) || 0), 0);
export const total = (s) => compsTotal(s) + bonusTotal(s);
export const ratio = (s) => (s.price > 0 ? total(s) / s.price : 0);
export const ratioTone = (r) => (r >= 2 ? 'good' : r >= 1.5 ? 'mid' : 'low');
export const fmtRatio = (r) => `פי ${r.toFixed(1).replace(/\.0$/, '')}`;
// Values with no basis are not counted as "explained".
export const unexplained = (s) => [...activeComps(s), ...bonusList(s)].filter((x) => x.value && !String(x.note || '').trim());

// ---------- payment ----------
export function payLine(s) {
  const months = CORE.months || 1;
  if (s.pay === 'monthly') return `${months} תשלומים של ${fmt(Math.round(s.price / months))}, כל חודש לאורך התוכנית`;
  return 'תשלום אחד, בהתחלה';
}
const nf = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
export const fmt = (n) => `${nf.format(n)} ₪`;

// ---------- real capacity (for "מחסור") ----------
// Hours a week from "העסק במספרים", part of them go to sales and marketing; the rest to
// clients. Each client of the core program takes its hours spread over its months.
export function capacity() {
  const month = (FROM_STEP5.hoursWeek * 52) / 12;
  const forClients = month * (1 - FROM_STEP5.salesShare / 100);
  const perClient = CORE.hours / (CORE.months || 1);
  const atOnce = Math.floor(forClients / perClient) - FROM_STEP5.existingClients;
  const perMonth = Math.max(1, Math.floor(atOnce / (CORE.months || 1)));
  return { month, forClients, perClient, atOnce, perMonth };
}

// ---------- the guarantee ----------
export function guaranteeLine(gu) {
  if (!gu.type) return '';
  if (gu.type === 'final') return gu.cond || '';
  const head = [gu.y, gu.x].filter(Boolean).join(' ');
  if (!head && !gu.z) return '';
  return `אם ${head}, ${gu.z || '...'}.${gu.cond ? ` ${gu.cond}.` : ''}`;
}
export const guaranteeOK = (gu) => !!gu.type && (gu.type === 'final' ? !!gu.cond?.trim() : !!(gu.z?.trim() && gu.x?.trim() && gu.y?.trim()));

// ---------- the ten checks before publishing (method PDF p.10) ----------
// state: ok / todo / na. part = where "לתקן" leads (index into PARTS), screen = which screen.
export function checks(s) {
  const r = ratio(s);
  const win = s.ideas.some((d) => d.in && d.win);
  const forYou = s.ideas.filter((d) => d.in && d.mode === 'בשבילך');
  const named = activeComps(s).filter((c) => c.name?.trim());
  const urgent = s.urgency.id !== 'none';
  const noDate = s.urgency.id === 'cohort' && !s.urgency.date;
  const hasBasketSeq = BASKET.some((p) => p.role === 'recurring') && BASKET.some((p) => p.role === 'bridge');
  return [
    { id: 'audience', q: 'ברור למי ההצעה, והקהל עומד בארבעת התנאים?', state: 'ok', note: `${USER.audience}. ארבעת התנאים סומנו בצייד הלקוחות.` },
    { id: 'outcome', q: 'ההצעה מתארת תוצאה עם פרק זמן, ולא רשימת שירותים?', state: s.outcome.text && s.outcome.time ? 'ok' : 'todo', note: s.outcome.text ? `"${s.outcome.text}", תוך ${s.outcome.time}.` : 'עוד לא נבחרה תוצאה.', screen: 'outcome' },
    { id: 'proof', q: 'יש הוכחה אמיתית שזה עובד, מלקוחות אמיתיים?', state: USER.clientsSoFar > 0 ? 'ok' : 'todo', note: `עוד אין לקוחות, וזה בסדר בהתחלה. בינתיים ההבטחה והניסיון שלך מחזיקים את זה. נוסף ל"מה עוד חסר".`, proof: true },
    { id: 'win', q: 'יש ניצחון ראשון מהיר, והלקוח רואה את ההתקדמות?', state: win ? 'ok' : 'todo', note: win ? 'מודעה ראשונה באוויר בתוך 10 ימים, ודוח של שורה אחת בכל שבוע.' : 'אין ניצחון בשבועות הראשונים. אפשר להחזיר את "מודעה ראשונה באוויר".', screen: 'matrix' },
    { id: 'effort', q: 'ברור מה יורד מהלקוח, ומה אנחנו עושים בשבילו?', state: forYou.length ? 'ok' : 'todo', note: forYou.length ? `${forYou.length} דברים נעשים בשביל הלקוח, למשל ${forYou[0].text.split(',')[0]}.` : 'הכול נשאר על הלקוח.', screen: 'matrix' },
    { id: 'unique', q: 'אי אפשר להשוות את ההצעה לשל מתחרה, שורה מול שורה?', state: named.length >= 3 && guaranteeOK(s.guarantee) ? 'ok' : 'todo', note: named.length >= 3 ? `${named.length} רכיבים עם שם שמבטיח תוצאה${guaranteeOK(s.guarantee) ? ', והבטחה' : ''}. אין "12 פגישות" להשוות.` : 'פחות משלושה רכיבים עם שם.', screen: 'components' },
    { id: 'value', q: 'הערך הכולל, עם ערכים מוסברים, גדול בהרבה מהמחיר?', state: r >= 2 && !unexplained(s).length ? 'ok' : 'todo', note: `${fmt(total(s))} מול ${fmt(s.price)}: ${fmtRatio(r)}.${unexplained(s).length ? ` ל-${unexplained(s).length} ערכים אין עדיין הסבר.` : ''}`, screen: r < 2 ? 'value' : 'components' },
    { id: 'guarantee', q: 'יש הבטחה במבנה "אם לא X תוך Y, אנחנו Z"?', state: guaranteeOK(s.guarantee) ? 'ok' : 'todo', note: guaranteeOK(s.guarantee) ? `"${s.guarantee.name}": ${guaranteeLine(s.guarantee)}` : 'חסר חלק במשפט, או שעוד אין הבטחה.', screen: 'guarantee' },
    { id: 'scarcity', q: 'המחסור והדחיפות אמיתיים, ואפשר להסביר אותם?', state: !urgent ? 'na' : noDate ? 'todo' : 'ok', note: !urgent ? 'לא בשימוש, וזה בסדר.' : noDate ? 'חסר תאריך אמיתי.' : s.urgency.id === 'seats' ? 'לפי הקיבולת האמיתית שלך.' : 'לפי התאריך שקבעת.', screen: 'urgency' },
    { id: 'sequence', q: 'יש הצעה למה שבא אחרי, ולמי שאומר לא?', state: hasBasketSeq ? 'ok' : 'todo', note: 'בסל: ריטיינר אחרי התוכנית, וסדנה למי שאומר לא. בסיום יש גם "המינימום".' },
  ];
}

// ---------- the finish ----------
// "המינימום" for who said no (prompt 3.7): fewer components, lower price by their share.
// Never the same package for less money.
export function minimum(s) {
  const comps = activeComps(s);
  const keep = comps.filter((c) => c.id === 'c2' || c.id === 'c4');
  const all = compsTotal(s) || 1;
  const share = keep.reduce((a, c) => a + c.value, 0) / all;
  const price = Math.round((s.price * share) / 100) * 100;
  return { keep, drop: comps.filter((c) => !keep.includes(c)), share, price };
}

export function whatsappText(s) {
  const comps = activeComps(s);
  const name = s.name.text || 'ההצעה שלי';
  const lines = [
    `*${name}*`,
    '',
    `${CLIENT_FILE.pain}? ${s.outcome.text}, תוך ${s.outcome.time}.`,
    '',
    'מה מקבלים:',
    ...comps.map((c) => `• ${c.name}: ${c.promise}`),
    ...(bonusList(s).length ? ['', 'ובנוסף:', ...bonusList(s).map((b) => `• ${b.name}`)] : []),
    '',
    `${s.guarantee.name ? `*${s.guarantee.name}:* ` : ''}${guaranteeLine(s.guarantee)}`,
    '',
    `${fmt(s.price)}${s.pay === 'monthly' ? ` (${payLine(s).split(',')[0]})` : ''}.`,
    g('רוצה לשמוע איך זה ייראה אצלך? שיחה של 20 דקות, בלי התחייבות.', 'רוצה לשמוע איך זה ייראה אצלך? שיחה של 20 דקות, בלי התחייבות.'),
  ];
  return lines.join('\n');
}

// What is still missing, honestly (prompt 5.1).
export function missing(s) {
  const out = [];
  if (USER.clientsSoFar === 0) out.push({ icon: 'messages-square', text: 'לאסוף שלוש עדויות אמיתיות מהלקוחות הראשונים. עד אז, לא ממציאים.' });
  unexplained(s).forEach((x) => out.push({ icon: 'calculator', text: `להסביר מאיפה הערך של "${x.name}".` }));
  openObstacles(s, true).forEach((p) => out.push({ icon: 'circle-help', text: `עוד אין מענה ל"${p.text}".` }));
  if (s.guarantee.type === 'cond') out.push({ icon: 'scale', text: 'לבדוק את נוסח ההבטחה ומדיניות הביטול מול עורך דין.' });
  return out;
}
