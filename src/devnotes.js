// Developer notes for step 8, plus a jump list of every screen (Shift+D).
import { html, Icon, cx, useState } from './lib.js';
import { GENDER, setDemoGender } from './data.js';
import { getKey, setKey } from './ai.js';

export const JUMPS = [
  { id: 'opening', label: 'מסך פתיחה' },
  { id: 'review', label: 'יש לי כבר הצעה: בדיקה' },
  { id: 'outcome', label: '1. התוצאה' },
  { id: 'problems', label: '2. מה עוצר' },
  { id: 'matrix', label: '3א. מה נכנס' },
  { id: 'components', label: '3ב. הרכיבים' },
  { id: 'value', label: '4. המחיר והבונוסים' },
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
      'הדוגמה במוקאפ: יועץ/ת שינה לתינוקות ("לילה שקט"), תוכנית שינה 8 שבועות 1:1 ב-2,400 ₪. הלקוחות הם הורים, ולכן הטקסט עליהם בגוף שלישי רבים ("ההורים", "הם"); לקוח יחיד יהיה "הוא". יוצא מן הכלל: משפטי ההבטחה נאמרים ללקוח, ולכן פונים בהם אליו ("אתם", "נחזיר לכם"; ללקוח יחיד "אתה"). המגדר של המשתמש (אתה/את) לא משנה את הטקסט על הלקוח.',
      '1 התוצאה = שלב 2. הכותרת: "מה הלקוח ישיג בסוף?". למעלה תמונת "היום → בסוף": הכאב מתיק הלקוח מול התוצאה שנבחרה, עם פרק הזמן ושורה של איך זה נראה (המעמד). מתחת שלושה כרטיסי תוצאה לבחירה, ו"לערוך את הניסוח" פותח עריכה בתוך התמונה. שלושה ניסוחים מהכריש, בחירה אחת. "לערוך" פותח את הניסוח ואת פרק הזמן. "מה אחרים יראו" (המעמד) נשמר מהטיוטה ולא מוצג, כדי לא להעמיס. "תוצאות תוך 30 יום" ו"בלי מאמץ מצדך" יורדים.',
      '2 מה עוצר = שלבים 3-4. המשתמש רואה רק את המשפטים של הלקוח, ומוריד את מה שלא נכון. העדשה, המקום בדרך ו"איך ל..." נשמרים לכל בעיה ומשמשים את הכריש בהמשך (רכיבים, בונוסים), אבל לא מוצגים. בעיה חדשה: בוחרים עדשה, המודל כותב את "איך ל..." ואת המקום בדרך.',
      '3א מה נכנס = שלבים 5-6, המטריצה מעמוד 5 במסמך השיטה, מוצגת כשתי רשימות: "בפנים ההצעה" ו"נשאר בחוץ". כל רשימה ממוינת לפי חשיבות: שווה לו הרבה, אחר כך קל לתת, אחר כך ניצחון ראשון. אפשר לערוך את הטקסט, ללחוץ על כל תגית כדי להפוך אותה, ולהוסיף פריט משלך (נכנס כ"שווה לו הרבה, קל לתת"; פריט שהמשתמש הוסיף אפשר גם למחוק). פריט חדש שלא שייך לרכיב מופיע במסך הרכיבים עם "לאיזה רכיב?". לכל פריט הכריש מעריך שני דברים, ושניהם מוצגים כתגיות: כמה הוא שווה ללקוח (הרבה/מעט) וכמה הוא דורש מהעסק (קל לתת/דורש הרבה). בהתחלה בפנים רק מה ששווה ללקוח הרבה. מתחת לכל פריט בפנים: המשפט של הלקוח שהוא עונה עליו; מתחת לפריט בחוץ: למה הוא בחוץ. העיגול מעביר אותו לצד השני.',
      '3ב הרכיבים = סוף שלב 6. רשימה סגורה: שם, הבטחה ושווי. לחיצה פותחת עריכה: שם, הבטחה, מה בפנים, השווי והבסיס שלו (מה זה עולה בנפרד / כמה זמן חוסך / כמה כסף מכניס). שווי בלי הסבר לא נספר כמוסבר בבדיקה.',
      '4 המחיר והבונוסים = שלבים 7-8 במסך אחד. למעלה מד "מה מקבלים מול מה משלמים" (נדבק בגלילה): ירוק מפי 2, כתום מפי 1.5, אדום מתחת. המחיר מהסל (שינוי מעדכן את הסל, עם ביטול), התשלומים מ"העסק במספרים". מתחת: בונוס אחד לכל בעיה שלא נפתרה ברכיבים, קודם מהסל, כלים ותבניות לפני הדרכות. הבונוסים מגיעים כבויים, והמשתמש מדליק אותם ורואה את המד זז. עוגן (גרסה יקרה) ירד מהשלב.',
      '5א הבטחה = שלב 9. למעלה הפחד במילים של הלקוח (מהתנגדות הזהב), כבועת מחשבה. מתחת ארבעה כרטיסי סוג, ותעודת ההבטחה: שם, ומשפט "אם Y X, Z" עם חלקים מסומנים שלוחצים עליהם. מתחת לתעודה: "מה עושים אם זה לא קרה" כצ׳יפים. החלפת סוג טוענת טיוטה מתאימה (עם ביטול). מדיניות הביטול עוברת לכאן משלב "שירות לקוחות".',
      '5ב למה עכשיו = שלב 10. ארבע אפשרויות, בסדר הזה: בלי (ברירת מחדל) / מקומות מוגבלים / עליית מחירים / תאריך התחלה. מקומות מוגבלים לפי הקיבולת: שעות בשבוע × 52 ÷ 12, פחות 30% לשיווק ומכירות, חלקי שעות ללקוח בחודש, פחות לקוחות קיימים, חלקי משך התוכנית. תאריך התחלה דורש תאריך. עליית מחירים דורשת תאריך ומחיר חדש (ברירת מחדל: המחיר + 15%, מעוגל למאה), ונכנסת למסמך ההצעה: "המחיר הזה בתוקף עד... אחרי זה...". "בונוס עד תאריך" ירד.',
      '6א שם = שלב 11. שישה שמות מהכריש, או שם משלך. שם עונתי מסומן "רק אם באמת".',
      '6ב בדיקה = שלב 12, עשר השאלות מעמוד 10 במסמך השיטה. מוצג רק מה שעוד לא מוכן, עם "לתקן" שמחזיר למסך המתאים. מה שמוכן מקופל. לא חוסמת.',
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
      'הכריש בפינה: משפט אחד לכל מסך. בתוך המסכים אין טיפים והסברים: כותרת שהיא השאלה, שורה אחת שאומרת מה עושים, והתוכן.',
      'עכשיו והבא: הכפתור הראשי אומר לאן ממשיכים ("הבא: מה עוצר"). במסך רחב, הכרטיס "ההצעה שלך" בצד מראה את ששת החלקים: מה כבר נבנה (עם התשובה בקצרה, לחיץ לחזרה), מה עכשיו ומה הבא.',
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
