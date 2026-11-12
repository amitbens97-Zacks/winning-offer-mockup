// "הסבר מהכריש": on every screen of step 8, a button opens the shark's note with a short, clear
// explanation of the screen (what we do here, what you see, why it matters). From the note you can
// open a chat with the shark about the step: ready questions with written answers, and with an API
// key (Shift+D) any question goes to the model.
import { html, useState, useRef, useEffect, Icon, cx } from './lib.js';
import { SharkAvatar } from './components.js';
import { g } from './data.js';
import * as ai from './ai.js';
import { hasAI } from './ai.js';

export const EXPLAIN = {
  opening: {
    title: 'הפתיחה',
    what: 'בשלב הזה בונים הצעה למוצר המרכזי שלך: מה הלקוח מקבל, כמה זה שווה, מה מוריד ממנו את הסיכון ולמה לקנות עכשיו.',
    see: 'המשוואה של השלב: מה שהלקוח מקבל צריך להיות שווה הרבה יותר ממה שהוא משלם. לידה ששת החלקים, כרבע שעה.',
    why: 'הצעה כזאת מוכרת בלי להוריד מחיר: ללקוח ברור שלא לקנות זה ההפסד.',
    qa: [
      ['מה אם כבר יש לי הצעה?', 'לוחצים "יש לי כבר הצעה" ומדביקים אותה. אני נותן ציון ומראה קודם את הדבר האחד שהכי ישפר אותה, ומשם ממשיכים לבנות.'],
      ['כמה זמן זה לוקח?', 'בערך רבע שעה. הרבה כבר מולא מהשלבים הקודמים, ונשאר רק לאשר או לשנות.'],
    ],
  },
  review: {
    title: 'בדיקת הצעה קיימת',
    what: 'כאן בודקים הצעה שכבר יש לך.',
    see: 'מדביקים את הטקסט, ואני נותן ציון 1-5 ב-12 ממדים, ומראה קודם את הדבר האחד שהכי ישפר אותה.',
    why: 'לא מתקנים הכול בבת אחת. מתחילים ממה שהכי מזיז.',
    qa: [['מה קורה אחרי הבדיקה?', 'ממשיכים לחלקי הבנייה, עם מה שכבר טוב בהצעה, ומחזקים את מה שחלש.']],
  },
  outcome: {
    title: 'התוצאה',
    what: 'כאן בוחרים את התוצאה שהלקוח קונה: איפה הוא יהיה בסוף התהליך.',
    see: 'מימין המצב היום אצל הלקוח, מצייד הלקוחות. משמאל התוצאה בסוף התהליך, עם פרק זמן. מתחת שלוש תוצאות שכתבתי.',
    why: 'אנשים לא קונים שירות. הם קונים את המקום שהם רוצים להגיע אליו.',
    qa: [
      ['למה לא לכתוב "8 שיחות זום"?', 'כי זו הדרך, לא התוצאה. ההורים רוצים לישון לילה שלם. את הדרך מפרטים אחר כך, ברכיבים.'],
      ['מאיפה "המצב היום"?', 'מהכאב שכתבת בצייד הלקוחות. אפשר לערוך אותו להצעה הזאת בלבד, ותיק הלקוח לא משתנה.'],
    ],
  },
  problems: {
    title: 'מה עוצר',
    what: 'כאן אוספים את מה שיכול לעצור את הלקוח: לא לקנות, או לוותר באמצע.',
    see: 'כל כרטיס הוא משפט שהלקוח אומר לעצמו. כתבתי אותם ממה שסיפרת בצייד הלקוחות. מה שלא נכון אצלך, מורידים בלחיצה.',
    why: 'כל משפט שנשאר כאן יקבל תשובה בהמשך: רכיב, בונוס או ההבטחה. כל תשובה היא סיבה פחות להגיד לא.',
    qa: [
      ['כמה משפטים להשאיר?', 'את כל מה שבאמת קורה אצל הלקוחות שלך. אין מספר נכון.'],
      ['מה אם חסר משהו?', 'בלחיצה על "בעיה שחסרה" למטה. כותבים את המשפט במילים של הלקוח.'],
    ],
  },
  matrix: {
    title: 'מה נכנס',
    what: 'כאן בוחרים מה ההצעה כוללת.',
    see: 'לכל פריט תגיות: שווה לו הרבה, קל לך לתת, ניצחון ראשון. העיגול מוציא פריט. למטה הצעות חדשות שלי.',
    why: 'יותר זה לא תמיד טוב יותר. מה ששווה ללקוח מעט רק מעמיס עליו, ועליך.',
    qa: [
      ['מה זה "ניצחון ראשון"?', 'משהו שהלקוח מרגיש כבר בימים הראשונים. זה מה שגורם לו להמשיך ולא לוותר.'],
      ['למה פריט ששווה לו מעט לא מוצע?', 'כי הוא מוסיף לך עבודה בלי להוסיף לו ערך. ההצעה חדה יותר בלעדיו.'],
    ],
  },
  components: {
    title: 'הרכיבים',
    what: 'כאן הפריטים מתאחדים לרכיבים: לכל אחד שם, הבטחה ושווי.',
    see: 'לחיצה על רכיב פותחת עריכה: השם, מה בפנים, וכמה הוא שווה ולמה.',
    why: 'שם שמבטיח תוצאה שווה יותר מעוד שורה ברשימה, ושווי מוסבר מראה ללקוח שהוא מקבל יותר ממה שהוא משלם.',
    qa: [['איך קובעים שווי?', 'לפי אחד משלושה: כמה זה עולה בנפרד, כמה זמן זה חוסך, או כמה כסף זה מכניס. שווי בלי הסבר לא נספר כמוסבר.']],
  },
  value: {
    title: 'המחיר והבונוסים',
    what: 'כאן בודקים שהלקוח מקבל הרבה יותר ממה שהוא משלם.',
    see: 'למעלה מה הוא מקבל מול מה הוא משלם, והסקאלה: פי 2 זה המינימום, ולפי 3 שואפים. מתחת הבונוסים, כל אחד עונה על משפט של הלקוח שעוד פתוח.',
    why: 'לא מורידים מחיר, מוסיפים ערך. בונוס טוב פותר דבר אחד שעוד עוצר אותו, ולא סתם מתנה.',
    qa: [
      ['למה לא פשוט להוריד מחיר?', 'מחיר נמוך אומר ללקוח שזה שווה פחות, ומשאיר לך פחות כדי לתת שירות טוב. ערך גבוה יותר מוכר טוב יותר.'],
      ['מה זה בונוס טוב?', 'משהו שעולה לך מעט, שווה לו הרבה, ועונה על משפט אחד שעוד עוצר אותו. כלים ותבניות עדיפים על עוד שיחות.'],
    ],
  },
  guarantee: {
    title: 'ההבטחה',
    what: 'כאן לוקחים מהלקוח את הסיכון.',
    see: 'למעלה הפחד שלו, במילים שלו. מתחת סוגי ההבטחה, ותעודת ההבטחה: אם לא X תוך Y, אנחנו Z.',
    why: 'כשהסיכון עליך, ללקוח נשאר רק להגיד כן. רוב הלקוחות לא מממשים הבטחה, אבל כמעט כולם צריכים אותה כדי לקנות.',
    qa: [
      ['ומה אם הרבה ידרשו את הכסף?', 'לכן ההבטחה יכולה להיות מותנית: היא תקפה למי שעשה את מה שנדרש. כך היא שומרת גם עליך.'],
      ['איזה סוג לבחור?', 'שירות פרטי וזול יחסית: בלי תנאים. שירות יקר או ללקוחות עסקיים: מותנית.'],
    ],
  },
  urgency: {
    title: 'למה עכשיו',
    what: 'כאן נותנים ללקוח סיבה טובה לקנות עכשיו, ולא "אחרי החגים".',
    see: 'ארבע אפשרויות: בלי, מקומות מוגבלים לפי השעות שלך, עליית מחיר בתאריך, או תאריך התחלה של מחזור.',
    why: 'בלי סיבה לעכשיו הלקוח דוחה, ומי שדוחה בדרך כלל לא חוזר. אבל רק סיבה אמיתית: דחיפות מזויפת נשרפת פעם אחת.',
    qa: [['למה "מקומות מוגבלים" אמיתי?', 'כי הוא מחושב מהשעות שלך: כמה לקוחות חדשים באמת אפשר לקחת בחודש.']],
  },
  name: {
    title: 'השם',
    what: 'כאן נותנים להצעה שם.',
    see: 'שישה שמות שכתבתי, או שם משלך. שם טוב אומר למי זה, מה מקבלים ותוך כמה זמן.',
    why: 'השם הוא הדבר הראשון שהלקוח שומע. שיגיד לו "זה בשבילך".',
    qa: [['שם עונתי זה רעיון טוב?', 'רק אם יש סיבה אמיתית לעונה. אחרת הלקוח מרגיש שזה תרגיל.']],
  },
  done: {
    title: 'ההצעה מוכנה',
    what: 'ההצעה נשמרה בקבצים וב"ההצעות שלי".',
    see: 'מסמך ההצעה, וגרסה לוואטסאפ להעתקה. בצד מה עוד חסר, "למי שאומר לא", ויצירת הצעה נוספת.',
    why: 'ההצעה הזאת מזינה את דף הנחיתה, את מכונת התוכן ואת חדר התרגול.',
    qa: [['מה זה "המינימום"?', 'גרסה קטנה למי שאומר לא: פחות רכיבים, ולכן פחות כסף, בלי הבטחה. אף פעם לא אותה הצעה בזול.']],
  },
  offers: {
    title: 'ההצעות שלי',
    what: 'כאן כל ההצעות שבנית בשלב.',
    see: 'לכל הצעה: סטטוס, מחיר, יחס והבטחה. אפשר לפתוח, לערוך, להעתיק לוואטסאפ, או לבנות הצעה חדשה למוצר אחר מהסל.',
    why: 'כל מוצר נותן תוצאה אחרת, ולכן לכל מוצר הצעה משלו.',
    qa: [['למה לא הצעה אחת לכל המוצרים?', 'כי כל מוצר נותן תוצאה אחרת ללקוח אחר. הצעה אחת לכולם לא משכנעת אף אחד.']],
  },
};

// The button on every screen. It tells the page to open the shark's note (main.js listens).
export function ExplainButton({ class: cls = '' }) {
  return html`<button type="button" onClick=${() => window.dispatchEvent(new CustomEvent('fb:explain'))} class=${cx('no-print inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-white pe-3.5 ps-1 text-[14px] font-bold text-brand-600 ring-1 ring-brand-200 transition hover:bg-brand-50 hover:ring-brand-300 cursor-pointer', cls)}>
    <${SharkAvatar} size=${28} />הסבר מהכריש
  </button>`;
}

// The inside of the shark's note: the explanation, then the chat.
export function SharkTalk({ screen }) {
  const ex = EXPLAIN[screen] || EXPLAIN.opening;
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef(null);
  useEffect(() => list.current?.scrollTo(0, 1e6), [msgs.length, busy]);
  const asked = new Set(msgs.filter((m) => m.me).map((m) => m.text));
  const send = async (q) => {
    q = q.trim();
    if (!q || busy) return;
    setText('');
    const history = [...msgs, { me: true, text: q }];
    setMsgs(history);
    setBusy(true);
    const ready = ex.qa.find(([k]) => k === q);
    let reply;
    if (ready) {
      await new Promise((r) => setTimeout(r, 500));
      reply = ready[1];
    } else if (hasAI()) {
      try {
        reply = await ai.chat(ex.title, history);
      } catch (e) {
        console.error(e);
        reply = 'לא הצלחתי לענות כרגע. אפשר לנסות שוב בעוד רגע.';
      }
    } else {
      await new Promise((r) => setTimeout(r, 400));
      reply = 'במוקאפ אני עונה על השאלות המוכנות. עם מפתח API (Shift+D) אפשר לשאול אותי כל דבר על השלב.';
    }
    setMsgs((m) => [...m, { me: false, text: reply }]);
    setBusy(false);
  };

  if (!chat)
    return html`<div class="text-[15px] leading-relaxed">
      <p class="mb-2 font-display text-[17px] font-bold text-brand-900">${ex.title}</p>
      <p>${ex.what}</p>
      <p class="mt-1.5 text-muted">${ex.see}</p>
      <p class="mt-2 rounded-xl bg-brand-50 px-3 py-2 font-semibold text-brand-900">${ex.why}</p>
      <button type="button" onClick=${() => setChat(true)} class="mt-3 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="message-circle" size=${16} />לשאול את הכריש</button>
    </div>`;

  return html`<div class="text-[15px]">
    <button type="button" onClick=${() => setChat(false)} class="mb-2 inline-flex items-center gap-1 text-[13px] font-bold text-muted hover:text-ink cursor-pointer"><${Icon} name="arrow-right" size=${14} />חזרה להסבר</button>
    <div ref=${list} class="thin-scroll flex max-h-[240px] flex-col gap-2 overflow-y-auto">
      ${msgs.length === 0 && html`<p class="text-muted">${g('מה תרצה לדעת על', 'מה תרצי לדעת על')} "${ex.title}"?</p>`}
      ${msgs.map((m, i) => html`<p key=${i} class=${cx('max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 leading-snug', m.me ? 'self-start rounded-ss-md bg-brand-600 text-white' : 'self-end rounded-se-md bg-canvas ring-1 ring-line')}>${m.text}</p>`)}
      ${busy && html`<p class="self-end rounded-2xl bg-canvas px-3 py-2 text-muted ring-1 ring-line">הכריש כותב...</p>`}
    </div>
    ${ex.qa.some(([q]) => !asked.has(q)) && html`<div class="mt-2.5 flex flex-wrap gap-1.5">${ex.qa.filter(([q]) => !asked.has(q)).map(([q]) => html`<button key=${q} type="button" onClick=${() => send(q)} class="rounded-full bg-white px-2.5 py-1 text-start text-[13px] font-semibold text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50 cursor-pointer">${q}</button>`)}</div>`}
    <form class="mt-2.5 flex gap-1.5" onSubmit=${(e) => (e.preventDefault(), send(text))}>
      <input value=${text} onInput=${(e) => setText(e.target.value)} onKeyDown=${(e) => e.stopPropagation()} placeholder="לשאול על השלב..." aria-label="שאלה לכריש" class="h-10 min-w-0 flex-1 rounded-xl bg-white px-3 text-[15px] ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand-300" />
      <button type="submit" disabled=${!text.trim() || busy} aria-label="לשלוח" class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white disabled:opacity-40 cursor-pointer"><${Icon} name="send" size=${17} /></button>
    </form>
  </div>`;
}
