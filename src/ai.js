// The shark's drafts run on Claude with the offer-builder system prompt
// (doc/offer-builder-prompt.md) as written. Only section 7 (the context block) changes:
// it is filled from the user's earlier steps, as the system does in production.
// Each screen asks for one thing and gets JSON back; the screens show it as drafts the
// user approves or edits. Counting (values, ratio, capacity) stays in calc.js.
// The mockup is a static page, so the key is typed by whoever opens it (Shift+D) and kept
// only in that browser. Without a key, the screens use the drafts in data.js.
import { TIMES, USER, CLIENT_FILE, CORE, CORE_INCLUDES, BASKET, LENSES, ROAD, REVIEW_DIMS, g } from './data.js';
import { fmt, capacity, payLine } from './calc.js';

const KEY = 'flowbiz-wo-apikey';
const MODEL = 'claude-opus-5-5';
const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.3.0/+esm';

export const getKey = () => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};
export const setKey = (v) => {
  try {
    if (v) localStorage.setItem(KEY, v.trim());
    else localStorage.removeItem(KEY);
  } catch {}
  client = null;
};
export const hasAI = () => !!getKey();

let client = null;
async function getClient() {
  if (client) return client;
  const { default: Anthropic } = await import(SDK_URL);
  // A key typed into this page by its own user, for a demo; production calls go through the server.
  client = new Anthropic({ apiKey: getKey(), dangerouslyAllowBrowser: true });
  return client;
}

// ---------- the system prompt, with section 7 filled in ----------
let promptText = null;
async function basePrompt() {
  if (promptText) return promptText;
  const res = await fetch(new URL('../doc/offer-builder-prompt.md', import.meta.url));
  if (!res.ok) throw new Error('הפרומפט לא נטען');
  let t = (await res.text()).replace(/\r\n/g, '\n');
  t = t.replace(/(## 7\.[^\n]*\n+)\[[^\]]*\]/, (_, head) => `${head}${contextBlock()}`);
  promptText = t;
  return t;
}

export function contextBlock() {
  const cap = capacity();
  return [
    `שם העסק: ${USER.business}. ${USER.field}.`,
    `בעל העסק: ${USER.fullName}. ${g('פונים אליו בלשון זכר', 'פונים אליה בלשון נקבה')}. ניסיון: ${USER.experience}.`,
    `למי: ${USER.audience} (${USER.b2b ? 'B2B, בעלי עסקים שמחליטים בעצמם' : 'B2C'}). איפה הם: ${CLIENT_FILE.where}.`,
    `משפט הזהב: "${CLIENT_FILE.golden}". הכאב: ${CLIENT_FILE.pain}. הטריגר: ${CLIENT_FILE.trigger}.`,
    `התנגדות הזהב: "${CLIENT_FILE.objection}".`,
    `ההצעה נבנית למוצר: ${CORE.name}, ${fmt(CORE.price)} כולל מע"מ, ${CORE.months} חודשים, ${CORE.hours} שעות עבודה ללקוח. תשלום: ${payLine({ price: CORE.price, pay: CORE.pay })}.`,
    `מה כלול היום (מהסל): ${CORE_INCLUDES.join(', ')}.`,
    `שאר הסל: ${BASKET.filter((p) => p.role !== 'core').map((p) => `${p.name} (${p.price ? fmt(p.price) : 'חינם'})`).join(', ')}.`,
    `קיבולת אמיתית: עד ${cap.perMonth} ${USER.newClients} בחודש.`,
    `הוכחות: ${USER.clientsSoFar ? `${USER.clientsSoFar} לקוחות` : 'עוד אין לקוחות. אסור להמציא עדויות או תוצאות.'}`,
    'כללים של המערכת: לא משתמשים במילה "הנחה" בטקסט למשתמש. לא מציעים הגרלות. מחסור ודחיפות רק אמיתיים.',
  ].join('\n');
}

async function ask({ task, schema, effort = 'low', maxTokens = 6000 }) {
  const anthropic = await getClient();
  const prompt = await basePrompt();
  const res = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    // The prompt is the same in every call, so it is cached; the task follows it.
    system: [
      { type: 'text', text: prompt, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: 'אתה עובד בתוך שלב "בניית הצעה מנצחת" במערכת FlowBiz, לא בצ\'אט. כל קריאה היא משימה אחת של מצב הבנייה, והתשובה שלך היא JSON בלבד שהמסך מציג כטיוטה. בעל העסק מאשר או עורך. אל תשאל שאלות. על הלקוחות של בעל העסק כותבים בגוף שלישי (הוא, או הם כשהלקוחות הם זוג הורים), בתוצאה ובבונוסים. יוצא מן הכלל: משפטי ההבטחה נאמרים ללקוח, ולכן פונים בהם אליו ישירות ("אתה", או "אתם" להורים).' },
    ],
    messages: [{ role: 'user', content: task }],
    output_config: { effort, format: { type: 'json_schema', schema } },
  });
  if (res.stop_reason === 'refusal') throw new Error('המודל סירב לבקשה');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return JSON.parse(text);
}

const str = { type: 'string' };
const obj = (props) => ({ type: 'object', properties: props, required: Object.keys(props), additionalProperties: false });

// Part 1: three ways to say the outcome (interview stage 2).
export async function outcomes(current) {
  const out = await ask({
    task: `שלב 2 בראיון: התוצאה. כתוב שלושה ניסוחים חדשים לתוצאה שהלקוח רוצה, במילים שלו, שונים מאלה: ${current.map((o) => `"${o}"`).join(', ')}. לכל ניסוח: text (בלי פרק הזמן), time (אחד מ: ${TIMES.join(', ')}), status (מה אחרים יראו, המעמד, משפט קצר), why (למה הניסוח הזה, עד 8 מילים), risky (true אם יש בו מספר מדויק שצריך לעמוד מאחוריו).`,
    schema: obj({ items: { type: 'array', items: obj({ text: str, time: str, status: str, why: str, risky: { type: 'boolean' } }) } }),
  });
  return out.items.slice(0, 3).map((o, i) => ({ id: `ai${Date.now()}${i}`, ...o }));
}

// Part 3a: new ways of delivery the offer does not have yet (interview stages 5-6).
export async function ideas(s) {
  const have = s.ideas.map((d) => `"${d.text}"`).join(', ');
  const probs = s.problems.filter((p) => p.on).map((p) => `${p.id}: "${p.text}"`).join('; ');
  const out = await ask({
    task: `שלבים 5-6 בראיון: עוד דברים שאפשר לתת ללקוח. כתוב שלושה רעיונות חדשים, שווים ללקוח הרבה וקלים לבעל העסק לתת, שלא דומים לאלה: ${have}. הבעיות של הלקוח: ${probs}. לכל רעיון: text (קצר, מה מקבלים), solves (מזהי הבעיות שהוא פותר), win (true אם זה ניצחון ראשון בימים הראשונים).`,
    schema: obj({ items: { type: 'array', items: obj({ text: str, solves: { type: 'array', items: str }, win: { type: 'boolean' } }) } }),
  });
  return out.items.slice(0, 3).map((d, i) => ({ id: `aid${Date.now()}${i}`, text: d.text, solves: d.solves, win: d.win, cost: 'low', value: 'high', pool: true, in: false }));
}

// Part 2: a problem the user added → its "איך ל..." and where it sits.
export async function problem(text, lens) {
  const out = await ask({
    task: `שלבים 3-4 בראיון. בעל העסק הוסיף בעיה שהלקוח פוגש: "${text}" (עדשה: ${LENSES[lens].label}). כתוב את הפתרון בפורמט "איך ל..." שהופך אותה (how), ובחר איפה בדרך היא קורית (at, אחד מ: ${ROAD.map((r) => `${r[0]}=${r[1]}`).join(', ')}).`,
    schema: obj({ how: str, at: { type: 'string', enum: ROAD.map((r) => r[0]) } }),
  });
  return out;
}

// Part 4: a bonus for an obstacle that is still open (interview stage 8).
export async function bonus(text) {
  return ask({
    task: `שלב 8 בראיון: בונוס למכשול שעוד לא נפתר: "${text}". כלי, תבנית או רשימת בדיקה עדיפים על הדרכה. אם יש מוצר בסל שמתאים, השתמש בו ובמחיר שלו. החזר: name (שם שמבטיח תוצאה), what (מה זה, משפט אחד), kind (כלי / תבנית / מהסל / שיחה), value (מספר בשקלים), note (מאיפה המספר: מה זה עולה בנפרד או כמה זמן זה חוסך).`,
    schema: obj({ name: str, what: str, kind: str, value: { type: 'integer' }, note: str }),
  });
}

// Part 6: names (interview stage 11).
export async function names(s) {
  const out = await ask({
    task: `שלב 11 בראיון: שם להצעה. התוצאה: "${s.outcome.text}, תוך ${s.outcome.time}". הרכיבים: ${s.comps.map((c) => c.name).join(', ')}. כתוב שישה שמות קצרים. לכל שם: text, has (אילו מחמשת הרכיבים בשם: למי, מטרה, זמן, מעטפת, סיבה). סיבה רק אם יש סיבה אמיתית.`,
    schema: obj({ items: { type: 'array', items: obj({ text: str, has: { type: 'array', items: { type: 'string', enum: ['למי', 'מטרה', 'זמן', 'מעטפת', 'סיבה'] } } }) } }),
  });
  return out.items.slice(0, 6).map((n, i) => ({ id: `ain${Date.now()}${i}`, ...n }));
}

// The check mode (section 6) on an offer the user pasted.
export async function review(text) {
  const out = await ask({
    effort: 'medium',
    task: `מצב בדיקה (סעיף 6). זו ההצעה שבעל העסק הדביק:\n"""\n${text}\n"""\nהחזר: line (בשורה אחת, מה ההצעה היום מנקודת המבט של הלקוח), scores (12 הממדים בסדר הזה: ${REVIEW_DIMS.join(', ')}; לכל אחד score 1-5 ו-why במשפט אחד), one (השיפור האחד: title קצר, why במשפט או שניים), flags (הדגלים האדומים מסעיף 6 שקיימים, ניסוח קצר).`,
    schema: obj({
      line: str,
      scores: { type: 'array', items: obj({ dim: { type: 'string', enum: REVIEW_DIMS }, score: { type: 'integer' }, why: str }) },
      one: obj({ title: str, why: str }),
      flags: { type: 'array', items: str },
    }),
  });
  return {
    ...out,
    scores: REVIEW_DIMS.map((d) => {
      const x = out.scores.find((y) => y.dim === d);
      return [d, Math.max(1, Math.min(5, x?.score || 1)), x?.why || ''];
    }),
  };
}
