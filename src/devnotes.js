// Developer notes for step 8, plus a jump list of every screen (Shift+D).
import { html, Icon, cx, useState } from './lib.js';
import { GENDER, setDemoGender } from './data.js';
import { getKey, setKey } from './ai.js';

export const JUMPS = [
  { id: 'opening', label: 'מסך פתיחה' },
  { id: 'review', label: 'יש לי כבר הצעה: בדיקה' },
  { id: 'outcome', label: '1. התוצאה' },
  { id: 'problems', label: '2. מה עוצר' },
  { id: 'matrix', label: '3א. מה נכנס (2×2)' },
  { id: 'components', label: '3ב. הרכיבים' },
  { id: 'price', label: '4א. המחיר' },
  { id: 'bonuses', label: '4ב. בונוסים' },
  { id: 'guarantee', label: '5א. הבטחה' },
  { id: 'urgency', label: '5ב. למה עכשיו' },
  { id: 'name', label: '6א. שם' },
  { id: 'check', label: '6ב. בדיקה לפני פרסום' },
  { id: 'done', label: 'סיום: ההצעה' },
];

const NOTES = [
  {
    title: 'מה יש כאן',
    items: [
      'שלב 8 "בניית הצעה מנצחת", בפרק "בניית מותג אישי". ההצעה נבנית למוצר המרכזי בסל, ובסוף אפשר לבנות הצעה למוצר נוסף.',
      'הבסיס: הסיסטם פרומפט "בונה הצעות" (doc/offer-builder-prompt.md) ומסמך השיטה "איך בונים הצעה שקשה לסרב לה" (doc/offer-method.pdf). שלבי הראיון בסעיף 4 בפרומפט הופכים למסכים, מסך אחד לכל החלטה.',
      'עם מפתח API (למעלה בפאנל) הכריש כותב על Claude (claude-opus-5-5) עם הפרומפט המלא: ניסוחי תוצאה, "איך ל..." לבעיה שהמשתמש הוסיף, בונוס למכשול, שמות, ובדיקת הצעה קיימת. סעיף 7 בפרומפט (בלוק ההקשר) נבנה בקוד מהנתונים של המשתמש (src/ai.js, contextBlock). בלי מפתח, המסכים מציגים טיוטות שנכתבו מראש לדניאל (src/data.js).',
      'כל החישובים בקוד ולא במודל (src/calc.js): ערך כולל, היחס בין הערך למחיר, אילו בעיות עוד פתוחות, הקיבולת, עשר הבדיקות, "המינימום".',
    ],
  },
  {
    title: 'מה לא נשאל, כי כבר ידוע',
    items: [
      'שלב 1 בראיון (העסק והשוק) לא מופיע כמסך: הקהל, B2B/B2C ("אני והעסק"), משפט הזהב, הכאב, הטריגר, התנגדות הזהב וארבעת תנאי השוק (צייד הלקוחות), המוצר, מה כלול והמחיר (סל המוצרים), מתי הכסף נכנס והשעות ("העסק במספרים"), הניסיון (דף המסרים).',
      'כל שדה שמולא מהשלבים הקודמים מסומן במקור שלו (תגית "סל המוצרים" וכו\') ונשאר ניתן לעריכה. שינוי מחיר כאן מעדכן גם את הסל, עם ביטול.',
    ],
  },
  {
    title: 'מהפרומפט למסכים',
    items: [
      '1 התוצאה = שלב 2. שלושה ניסוחים מהכריש, בחירה אחת, עריכה של הניסוח, פרק הזמן ו"מה אחרים יראו". "תוצאות תוך 30 יום" ו"בלי מאמץ מצדך" יורדים.',
      '2 מה עוצר = שלבים 3-4. רשימה לפי הסדר בדרך (לפני / בהקמה / כשהפרסום רץ / כשמגיעות פניות / אחרי), כל בעיה עם עדשה מארבע העדשות ועם "איך ל...". פס העדשות מתריע כשעדשה ריקה. בעיה חדשה: המודל כותב את "איך ל..." ואת המקום בדרך.',
      '3א מה נכנס = שלבים 5-6, המטריצה מעמוד 5 במסמך השיטה. כל דרך מסירה מקבלת עלות לעסק וערך ללקוח (ההערכה של הכריש), ונכנסת לרבע. מה שברבעים העליונים נשאר, מה שבתחתונים יוצא. המשתמש יכול להוציא או להחזיר כל פריט.',
      '3ב הרכיבים = סוף שלב 6. הכריש מקבץ ל-3-6 רכיבים עם שם שמבטיח תוצאה. לכל ערך יש בסיס (מה זה עולה בנפרד / כמה זמן חוסך / כמה כסף מכניס) והסבר. ערך בלי הסבר לא נספר כמוסבר בבדיקה.',
      '4א המחיר = שלב 7. המחיר מהסל, מתי הכסף נכנס מ"העסק במספרים". מד "מה מקבלים מול מה משלמים": ירוק מפי 2, כתום מפי 1.5, אדום מתחת. עוגן: רשות, רק אם המשתמש מסמן שהוא באמת יספק אותו. מוצר פרימיום זול מההצעה לא מוצג כעוגן.',
      '4ב בונוסים = שלב 8. בונוס אחד לכל בעיה שלא נפתרה ברכיבים, קודם מהסל, כלים ותבניות לפני הדרכות. בבעיה שהמשתמש הוסיף, "הכריש יציע בונוס" קורא למודל.',
      '5א הבטחה = שלב 9. הפחד מגיע מהתנגדות הזהב. ארבעה סוגים, ומשפט "אם Y X, Z" עם חלקים שלוחצים עליהם. החלפת סוג טוענת טיוטה מתאימה (עם ביטול). מדיניות הביטול עוברת לכאן משלב "שירות לקוחות".',
      '5ב למה עכשיו = שלב 10. הקיבולת מחושבת מהשעות: שעות בשבוע × 52 ÷ 12, פחות 30% לשיווק ומכירות, חלקי שעות ללקוח בחודש, פחות לקוחות קיימים, חלקי משך התוכנית. כבוי כברירת מחדל. דחיפות: בלי / תאריך התחלה / בונוס עד תאריך / המחיר עולה, ותאריך אמיתי חובה.',
      '6א שם = שלב 11. שישה שמות, לכל אחד הנקודות של חמשת רכיבי השם. שם עונתי מסומן "רק אם באמת".',
      '6ב בדיקה = שלב 12, עשר השאלות מעמוד 10 במסמך השיטה. לא חוסמת. "לתקן" מחזיר למסך המתאים. 2 ו-6 נבדקות במערכת גם במודל.',
      'מצב בדיקה (סעיף 6): "יש לי כבר הצעה" במסך הפתיחה. 12 ממדים, השיפור האחד, דגלים אדומים, ומשם לחלקי הבנייה.',
      'שלב 13 (מודל ההכנסה): בסיום, כרטיס "הרצף סביב ההצעה" מהתפקידים בסל, ו"המינימום" למי שאמר לא: פחות רכיבים, המחיר לפי החלק שלהם בערך, בלי הבטחה. "להוסיף לסל המוצרים".',
      'טקסט לשיווק (סעיף 5.2) ונוסח לשיחת מכירה (5.3) לא בשלב הזה: דף הנחיתה ומכונת התוכן כותבים מההצעה, וחדר התרגול מתרגל את ההצגה שלה.',
    ],
  },
  {
    title: 'מה נשמר, ולאן זה הולך',
    items: [
      'ההצעה נשמרת כאובייקט אחד למוצר: התוצאה, הבעיות, דרכי המסירה (בפנים/בחוץ), הרכיבים עם ערכים ובסיס, המחיר ותנאי התשלום, הבונוסים, ההבטחה ומדיניות הביטול, המחסור והדחיפות, השם.',
      'תוצרים: מסמך ההצעה (PDF ממותג, בעמוד אחד) בקבצים › בניית מותג אישי, וגרסה לוואטסאפ להעתקה. לכל הצעה דף ב"הדפים שלי" (משימה 3).',
      'ההצעה מזינה: דף הנחיתה (שלב 9), מכונת התוכן (10), חדר התרגול (12: בלוק ההקשר, והבונוסים כהפתעה אחרי "כן"), ולוח התשלומים במרכז הפיננסי (תנאי התשלום לכל עסקה שנסגרת).',
    ],
  },
  {
    title: 'כללים',
    items: [
      'לא משתמשים במילה "הנחה" בטקסט שהמשתמש רואה. אין הגרלות (דורשות היתר בישראל).',
      'אין עדויות ממוצאות. כשאין לקוחות, בדיקה 3 מסומנת "עוד לא" ונכנסת ל"מה עוד חסר".',
      'פנייה למשתמש לפי "איך נפנה אליך?". הפרומפט כתוב בלשון זכר, וההנחיה למודל כוללת את המגדר.',
      'הכריש בפינה: משפט אחד לכל מסך. בתוך המסך לכל היותר טיפ אחד שלו.',
    ],
  },
];

function KeyBox({ notify }) {
  const [has, setHas] = useState(!!getKey());
  const [val, setVal] = useState('');
  const save = () => {
    if (!val.trim()) return;
    setKey(val);
    setVal('');
    setHas(true);
    notify?.('המפתח נשמר. הכריש כותב עכשיו על המודל', 'sparkles');
  };
  return html`<section class="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
    <h3 class="mb-1 font-bold text-brand-900">המודל</h3>
    <p class="mb-2 flex items-center gap-1.5 text-[13px] font-bold ${has ? 'text-brand-600' : 'text-muted'}"><${Icon} name=${has ? 'sparkles' : 'cog'} size=${14} />${has ? 'Claude עם הפרומפט המלא' : 'בלי מפתח: טיוטות כתובות מראש'}</p>
    ${has
      ? html`<button type="button" class="text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => (setKey(''), setHas(false))}>למחוק את המפתח מהדפדפן</button>`
      : html`<div class="flex gap-1.5"><input type="password" autocomplete="off" dir="ltr" placeholder="sk-ant-..." value=${val} onInput=${(e) => setVal(e.target.value)} onKeyDown=${(e) => e.key === 'Enter' && save()} class="min-w-0 flex-1 rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-[13px]" aria-label="מפתח Anthropic API" /><button type="button" class="rounded-lg bg-brand-600 px-3 text-[13px] font-bold text-white cursor-pointer" onClick=${save}>לשמור</button></div>`}
    <p class="mt-2 text-[12px] text-muted">המפתח נשמר רק בדפדפן הזה ונשלח רק ל-Anthropic. במערכת עצמה הקריאה עוברת דרך השרת.</p>
  </section>`;
}

export function DevPanel({ open, onClose, onJump, onReset, notify }) {
  return html`<aside
    class=${cx(
      'fixed inset-y-0 end-0 z-[70] flex w-full max-w-sm flex-col border-s border-slate-200 bg-white shadow-2xl transition-transform duration-200',
      open ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible',
    )}
    aria-hidden=${!open}
  >
    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 class="flex items-center gap-2 text-[16px] font-bold text-slate-900"><${Icon} name="code-xml" size=${17} /> הערות למפתחים</h2>
      <button type="button" onClick=${onClose} aria-label="סגירה" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"><${Icon} name="x" size=${18} /></button>
    </div>
    <div class="thin-scroll flex-1 overflow-y-auto p-4 text-[14px] leading-relaxed text-slate-700">
      <${KeyBox} notify=${notify} />
      <section class="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">המשתמש לדוגמה</h3>
        <div class="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="המשתמש לדוגמה">
          ${[
            ['m', 'דניאל', 'פנייה בלשון זכר'],
            ['f', 'דניאלה', 'פנייה בלשון נקבה'],
          ].map(
            ([id, name, sub]) => html`<button key=${id} type="button" role="radio" aria-checked=${GENDER === id} onClick=${() => GENDER !== id && setDemoGender(id)} class=${cx('rounded-lg border px-3 py-1.5 text-start cursor-pointer', GENDER === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-brand-200 bg-white text-brand-900')}><b class="block text-[14px]">${name}</b><small class="text-[12px]">${sub}</small></button>`,
          )}
        </div>
        <button type="button" class="mt-2 text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${onReset}>להתחיל מההתחלה</button>
      </section>
      <section class="mb-5 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">מעבר מהיר בין המסכים</h3>
        <div class="flex flex-col gap-1.5">
          ${JUMPS.map((j) => html`<button key=${j.id} type="button" onClick=${() => onJump(j.id)} class="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-start text-[13px] font-semibold hover:bg-brand-50 cursor-pointer">${j.label}</button>`)}
        </div>
      </section>
      ${NOTES.map(
        (n) => html`<section key=${n.title} class="mb-4 p-1">
          <h3 class="mb-1.5 font-bold text-slate-900">${n.title}</h3>
          <ul class="list-disc space-y-1 ps-4">${n.items.map((t) => html`<li>${t}</li>`)}</ul>
        </section>`,
      )}
    </div>
  </aside>`;
}
