// Mock data for task 6, step 8 "בניית הצעה מנצחת". In production:
//   business, audience, B2B/B2C              -> "אני והעסק" (2)
//   golden sentence, pain, golden objection  -> the client file, "צייד הלקוחות" (4)
//   the core product, what's included, price -> "סל מוצרים" (3)
//   when the money comes in, weekly hours    -> "העסק במספרים" (5)
//   the user's story and authority           -> "דף המסרים" (7)
// The drafts below are what the shark would write for this business with the offer-builder
// prompt (doc/offer-builder-prompt.md). Every fact (price, hours, what's included) comes
// from the user's earlier steps; every value has a basis the user can see and change.
// The demo business is the same as in the other mockups: דניאל כהן, "שיווק שעובד".

export const PARTNER = { name: 'הכריש', role: 'השותף העסקי' };

export const STEP = { n: 8, name: 'בניית הצעה מנצחת', chapterNo: 3, chapter: 'בניית מותג אישי', icon: 'gift' };
export const PARTS = ['התוצאה', 'מה עוצר', 'מה כלול', 'מחיר ובונוסים', 'הבטחה', 'שם ובדיקה'];

// ---------- who the user is (?user=f or ?user=m, or the developer panel) ----------
const PROFILES = {
  m: { gender: 'm', firstName: 'דניאל', fullName: 'דניאל כהן' },
  f: { gender: 'f', firstName: 'דניאלה', fullName: 'דניאלה כהן' },
};
const GENDER_KEY = 'flowbiz-wo-gender';
function pickGender() {
  try {
    const q = new URLSearchParams(location.search).get('user');
    if (q === 'f' || q === 'm') {
      localStorage.setItem(GENDER_KEY, q);
      return q;
    }
    return localStorage.getItem(GENDER_KEY) === 'f' ? 'f' : 'm';
  } catch {
    return 'm';
  }
}
export const GENDER = pickGender();
export const g = (m, f) => (GENDER === 'f' ? f : m);
export function setDemoGender(v) {
  try {
    localStorage.setItem(GENDER_KEY, v);
  } catch {}
  const u = new URL(location.href);
  u.searchParams.set('user', v);
  location.href = u.toString();
}

export const USER = {
  ...PROFILES[GENDER],
  business: 'שיווק שעובד',
  field: 'ייעוץ וליווי שיווק דיגיטלי לעסקי שירות מקומיים',
  audience: 'בעלי עסקי שירות עם 1 עד 5 עובדים',
  b2b: true,
  experience: '12 שנים ניהלתי שיווק בחברת צריכה גדולה',
  clientsSoFar: 0,
};

// "צייד הלקוחות" (4): the golden sentence and the client file.
export const CLIENT_FILE = {
  golden: 'אנחנו עוזרים לבעלי עסקי שירות קטנים להגיע לפניות קבועות כל שבוע, בלי לשרוף כסף על פרסום',
  pain: 'משלמים על פרסום כל חודש, ואין מושג מה זה מביא',
  trigger: 'חודש חלש, שבו הטלפון כמעט לא צלצל',
  where: 'קבוצות פייסבוק של בעלי עסקים בצפון',
  objection: 'כבר שרפתי כסף על שיווק, ולא יצא מזה כלום',
  market: [
    ['כאב חזק', 'משלמים כל חודש ולא יודעים על מה'],
    ['כסף לשלם', 'כבר מוציאים על פרסום'],
    ['קל להגיע אליהם', 'קבוצות בעלי עסקים בצפון'],
    ['שוק שגדל', 'יותר עסקים קטנים עוברים לפרסום ברשת'],
  ],
};

// "סל מוצרים" (3) with the payment terms from "העסק במספרים" (5). Prices include VAT.
export const BASKET = [
  { id: 'e1', name: 'שיחת היכרות (30 דקות)', price: 0, role: 'entry' },
  { id: 'e2', name: 'מדריך: 7 טעויות בשיווק עסק קטן', price: 0, role: 'entry' },
  { id: 'b1', name: 'סדנת אסטרטגיה אישית (3 שעות)', price: 890, role: 'bridge' },
  { id: 'p1', name: 'תוכנית ליווי 90 יום 1:1', price: 7500, role: 'core', months: 3, hours: 20, pay: 'monthly' },
  { id: 'p2', name: 'יום VIP אסטרטגי', price: 3900, role: 'premium' },
  { id: 'r1', name: 'ריטיינר ליווי חודשי', price: 2200, role: 'recurring', monthly: true },
];
export const CORE = BASKET.find((p) => p.role === 'core');
// What the user wrote in the basket for the core product ("מה הלקוח מקבל?").
export const CORE_INCLUDES = ['12 מפגשי זום שבועיים של שעה', 'הקמת קמפיין ממומן', 'ליווי בוואטסאפ'];
export const FROM_STEP5 = { hoursWeek: 20, salesShare: 30, existingClients: 0 };

// ---------- part 1: the outcome ----------
export const OUTCOMES = [
  {
    id: 'o1',
    text: 'פניות קבועות כל שבוע, ממערך שיווק שאתה מבין ושולט בו',
    textF: 'פניות קבועות כל שבוע, ממערך שיווק שאת מבינה ושולטת בו',
    time: '90 יום',
    status: 'הטלפון מצלצל, ואתה יודע בדיוק מאיפה הגיעה כל פנייה',
    statusF: 'הטלפון מצלצל, ואת יודעת בדיוק מאיפה הגיעה כל פנייה',
    why: 'הכי קרוב למשפט הזהב שלך',
  },
  {
    id: 'o2',
    text: 'לדעת כמה עולה כל לקוח, ולהפסיק לשלם על פרסום שלא מביא',
    time: '90 יום',
    status: 'כשמישהו שואל "זה משתלם?", יש לך מספר',
    statusF: 'כשמישהו שואל "זה משתלם?", יש לך מספר',
    why: 'עונה ישר על הכאב: "משלמים ולא יודעים על מה"',
  },
  {
    id: 'o3',
    text: '20 פניות בחודש מהפרסום',
    time: '90 יום',
    status: 'היומן מלא, ובחודש חלש כבר לא נלחצים',
    statusF: 'היומן מלא, ובחודש חלש כבר לא נלחצות',
    why: 'מספר מדויק מושך, אבל צריך לעמוד מאחוריו',
    risky: true,
  },
];
export const TIMES = ['30 יום', '60 יום', '90 יום', '6 חודשים'];

// ---------- part 2: what will stop the client on the way ----------
// The four lenses are the four value levers turned around (prompt 3.5, step 2).
export const LENSES = {
  worth: { label: 'לא ישתלם לי', lever: 'התוצאה', icon: 'scale' },
  work: { label: 'לא יעבוד אצלי', lever: 'הסבירות', icon: 'shield-question' },
  hard: { label: 'קשה ומבלבל', lever: 'המאמץ', icon: 'puzzle' },
  time: { label: 'אין לי זמן', lever: 'הזמן', icon: 'hourglass' },
};
export const ROAD = [
  ['before', 'לפני שמתחילים'],
  ['setup', 'בהקמה'],
  ['run', 'כשהפרסום רץ'],
  ['leads', 'כשמגיעות פניות'],
  ['after', 'אחרי 90 יום'],
];
export const PROBLEMS = [
  { id: 'p1', at: 'before', lens: 'work', text: 'כבר שרפתי כסף על שיווק, ולא יצא מזה כלום', how: 'איך לראות תוצאה ראשונה לפני שמשקיעים עוד', from: 'התנגדות הזהב' },
  { id: 'p2', at: 'before', lens: 'worth', text: '7,500 ₪ זה הרבה כסף בשבילי עכשיו', how: 'איך לדעת מראש כמה פניות צריך כדי שזה יחזיר את עצמו' },
  { id: 'p3', at: 'setup', lens: 'hard', text: 'אני לא יודע מה להגיד בפרסום', textF: 'אני לא יודעת מה להגיד בפרסום', how: 'איך לכתוב מודעה בלי להיות קופירייטר' },
  { id: 'p4', at: 'setup', lens: 'time', text: 'אין לי זמן לשבת על שיווק', how: 'איך לנהל את השיווק בשעה בשבוע' },
  { id: 'p5', at: 'setup', lens: 'hard', text: 'אני לא מבין בפיקסלים, קהלים ומנהל מודעות', textF: 'אני לא מבינה בפיקסלים, קהלים ומנהל מודעות', how: 'איך לעלות לאוויר בלי לגעת בהגדרות' },
  { id: 'p6', at: 'run', lens: 'hard', text: 'אני לא מבין את הדוחות', textF: 'אני לא מבינה את הדוחות', how: 'איך לדעת בשורה אחת אם זה עובד' },
  { id: 'p7', at: 'run', lens: 'work', text: 'אחרי חודש זה תמיד מפסיק לעבוד', how: 'איך להחזיק מודעות שמביאות גם בחודש השלישי' },
  { id: 'p8', at: 'run', lens: 'worth', text: 'כמה תקציב פרסום צריך בכלל?', how: 'איך להתחיל בתקציב קטן ולהגדיל רק מה שעובד' },
  { id: 'p9', at: 'leads', lens: 'work', text: 'מגיעות פניות ואני לא סוגר', textF: 'מגיעות פניות ואני לא סוגרת', how: 'איך להפוך פנייה לפגישה בהודעה אחת' },
  { id: 'p10', at: 'leads', lens: 'time', text: 'אני באמצע עבודה, ולא עונה מהר', textF: 'אני באמצע עבודה, ולא עונה מהר', how: 'איך לענות לכל פנייה תוך שעה, בלי לעזוב את העבודה' },
  { id: 'p11', at: 'leads', lens: 'work', text: 'שואלים "כמה זה עולה?" ונעלמים', how: 'איך לענות על "כמה זה עולה" בלי לאבד את הפנייה' },
  { id: 'p12', at: 'after', lens: 'work', text: 'ומה קורה כשהליווי נגמר?', how: 'איך להמשיך לבד אחרי 90 יום' },
];

// ---------- part 3: ways to deliver, the 2×2, and the components ----------
// cost = what it costs the business (hours, money); value = what it is worth to the client
// by the four levers. Both are the shark's first guess and the user can flip them.
export const IDEAS = [
  { id: 'd1', text: 'פגישת אפיון של 90 דקות: למי פונים ומה אומרים', solves: ['p3'], cost: 'high', value: 'high', mode: 'איתך' },
  { id: 'd2', text: 'הקמת קמפיין מוכן, עם שלוש מודעות', solves: ['p3', 'p5'], cost: 'high', value: 'high', mode: 'בשבילך' },
  { id: 'd14', text: 'מודעה ראשונה באוויר בתוך 10 ימים', solves: ['p1'], cost: 'low', value: 'high', mode: 'בשבילך', win: true },
  { id: 'd8', text: 'עדכון המודעות כל שבועיים, לפי התוצאות', solves: ['p7'], cost: 'low', value: 'high', mode: 'בשבילך' },
  { id: 'd7', text: '12 מפגשי ליווי שבועיים בזום', solves: ['p4', 'p7', 'p8'], cost: 'high', value: 'high', mode: 'איתך' },
  { id: 'd9', text: 'מענה בוואטסאפ ביום עסקים', solves: ['p4', 'p1'], cost: 'high', value: 'high', mode: 'איתך' },
  { id: 'd4', text: 'תסריט לשיחה ולוואטסאפ, לפנייה הראשונה', solves: ['p9'], cost: 'low', value: 'high', mode: 'לבד' },
  { id: 'd5', text: 'דוח שבועי של שורה אחת: כמה פניות, כמה עלתה כל אחת', solves: ['p6'], cost: 'low', value: 'high', mode: 'בשבילך' },
  { id: 'd3', text: 'קורס וידאו על מנהל המודעות', solves: ['p5'], cost: 'high', value: 'low', mode: 'לבד', why: 'מוסיף ללקוח עבודה במקום להוריד' },
  { id: 'd6', text: 'דוח אנליטיקס מלא של 12 עמודים', solves: ['p6'], cost: 'low', value: 'low', mode: 'לבד', why: 'מבלבל יותר ממה שעוזר' },
  { id: 'd11', text: 'ניהול הפוסטים בדף העסקי', solves: ['p4'], cost: 'high', value: 'low', mode: 'בשבילך', why: 'הרבה עבודה, ולא מביא פניות' },
];

// What a value is based on (prompt 3.8: every value is explained by something real).
export const BASIS = {
  separate: 'מה זה עולה בנפרד',
  time: 'כמה זמן זה חוסך',
  money: 'כמה כסף זה מכניס או חוסך',
};

export const COMPONENTS = [
  {
    id: 'c1',
    name: 'מפת הלקוח',
    promise: 'יודעים למי פונים ומה אומרים, מהשבוע הראשון',
    ideas: ['d1'],
    value: 1500,
    basis: 'separate',
    note: 'פגישת אפיון אצל יועץ שיווק: 1,200-1,800 ₪',
  },
  {
    id: 'c2',
    name: 'מכונת הפניות',
    promise: 'קמפיין באוויר תוך 10 ימים, ומתעדכן כל שבועיים',
    ideas: ['d2', 'd14', 'd8'],
    value: 4000,
    basis: 'separate',
    note: 'הקמת קמפיין אצל פרילנסר 2,500 ₪, ועדכון 500 ₪ בחודש × 3',
  },
  {
    id: 'c3',
    name: '90 יום צמוד',
    promise: 'שעה בשבוע, ומישהו לשאול כל יום',
    ideas: ['d7', 'd9'],
    value: 6900,
    basis: 'separate',
    note: '12 שעות ייעוץ × 450 ₪, ועוד זמינות בוואטסאפ 500 ₪ בחודש × 3',
  },
  {
    id: 'c4',
    name: 'מהפנייה לפגישה',
    promise: 'יודעים מה לענות, בשיחה ובוואטסאפ',
    ideas: ['d4'],
    value: 800,
    basis: 'separate',
    note: 'תסריט מכירה מותאם אצל יועץ: 600-1,000 ₪',
  },
  {
    id: 'c5',
    name: 'השורה האחת',
    promise: 'בכל שבוע, בשורה אחת: עובד או לא',
    ideas: ['d5'],
    value: 600,
    basis: 'time',
    note: 'חוסך כשעה בשבוע של קריאת דוחות, 12 שבועות × 50 ₪',
  },
];

// ---------- part 4: bonuses, one for each obstacle that is still open ----------
export const BONUS_DRAFTS = {
  p2: { name: 'המחשבון "מתי זה מחזיר את עצמו"', what: 'מכניסים מחיר ממוצע של לקוח, ורואים כמה פניות צריך כדי שהתוכנית תחזיר את עצמה', kind: 'כלי', value: 250, basis: 'time', note: 'חוסך ערב של חישובים באקסל, כ-5 שעות × 50 ₪' },
  p10: { name: 'חמש הודעות שמורות', what: 'הודעות מוכנות לוואטסאפ עסקי, שעונות לפנייה תוך דקה גם באמצע עבודה', kind: 'תבנית', value: 200, basis: 'separate', note: 'חבילת תבניות הודעות אצל קופירייטר: 150-250 ₪' },
  p11: { name: 'עשר תשובות ל"כמה זה עולה?"', what: 'עשר דרכים לענות על השאלה בלי לזרוק מחיר ולאבד את הפנייה', kind: 'תבנית', value: 300, basis: 'separate', note: 'כמו שעת ייעוץ מכירות קצרה: 300 ₪' },
  p12: { name: 'סדנת תכנון ל-90 הימים הבאים', what: 'סדנת האסטרטגיה האישית מהסל, בסוף התוכנית: תוכנית עבודה להמשיך לבד', kind: 'מהסל', value: 890, basis: 'separate', note: 'המחיר שלה בסל המוצרים שלך', fromBasket: 'b1' },
};

// ---------- part 5: the guarantee and "why now" ----------
export const G_TYPES = [
  { id: 'free', label: 'בלי תנאים', sub: 'לא מרוצה? מקבל את הכסף', fit: 'שירות זול יחסית, לקוחות פרטיים', icon: 'heart-handshake' },
  { id: 'cond', label: 'מותנית', sub: 'תקפה למי שעשה את מה שנדרש', fit: 'שירות יקר, לקוחות עסקיים', icon: 'list-checks' },
  { id: 'final', label: 'כל המכירות סופיות', sub: 'כשמה שנמסר אי אפשר להחזיר', fit: 'שיטה, קוד, חומרים', icon: 'lock' },
  { id: 'perf', label: 'גלומה במחיר', sub: 'משלמים לפי תוצאה', fit: 'כשהתוצאה נמדדת בשקיפות', icon: 'percent' },
];
export const Z_CHIPS = [
  'נחזיר לך את כל הכסף',
  'נמשיך לעבוד בלי תשלום עד שזה יקרה',
  'החודש הבא עלינו',
  'התשלום הבא רק אחרי הפנייה הראשונה',
  'תצא מההתחייבות בלי קנס',
];
export const Z_CHIPS_F = [
  'נחזיר לך את כל הכסף',
  'נמשיך לעבוד בלי תשלום עד שזה יקרה',
  'החודש הבא עלינו',
  'התשלום הבא רק אחרי הפנייה הראשונה',
  'תצאי מההתחייבות בלי קנס',
];
export const GUARANTEE_DRAFTS = {
  free: { y: 'אחרי המפגש הראשון', x: g('לא תרגיש שזה שונה ממה שניסית', 'לא תרגישי שזה שונה ממה שניסית'), z: 'נחזיר לך את כל הכסף', cond: '', name: 'המפגש הראשון עלינו' },
  cond: {
    y: 'תוך 90 יום',
    x: 'לא יגיעו 20 פניות בחודש',
    z: 'נמשיך לעבוד בלי תשלום עד שיגיעו',
    cond: g('בתנאי שתקציב הפרסום שסיכמנו רץ, ושחזרת לכל פנייה תוך יום', 'בתנאי שתקציב הפרסום שסיכמנו רץ, ושחזרת לכל פנייה תוך יום'),
    name: '20 או שממשיכים',
  },
  final: { y: '', x: '', z: '', cond: 'אנחנו עובדים רק עם מי שמחויב לתהליך', name: 'רק מחויבים' },
  perf: { y: 'בכל חודש', x: 'לא הגיעו פניות', z: 'החודש הזה לא עולה לך כלום', cond: 'מינימום 1,500 ₪ בחודש, שמכסה את העלות', name: 'משלמים על פניות' },
};
export const CANCEL_TEXT = 'אפשר לבטל תוך 14 יום מהעסקה, לפי חוק הגנת הצרכן. דמי ביטול: 5% מהמחיר או 100 ₪, הנמוך מביניהם.';

export const URGENCY = [
  { id: 'none', label: 'בלי דחיפות', sub: 'ההצעה זמינה תמיד', icon: 'circle-off' },
  { id: 'cohort', label: 'תאריך התחלה', sub: 'מי שנרשם עד התאריך מתחיל במחזור הקרוב', icon: 'calendar-days' },
  { id: 'bonus', label: 'בונוס עד תאריך', sub: 'השירות זמין תמיד, הבונוס נגמר', icon: 'gift' },
  { id: 'price', label: 'המחיר עולה', sub: 'רק אם הוא באמת עולה בתאריך הזה', icon: 'trending-up' },
];

// ---------- part 6: the name ----------
// Which of the five parts of a name each option uses (prompt 3.6): סיבה, למי, מטרה, זמן, מעטפת.
export const NAME_PARTS = ['למי', 'מטרה', 'זמן', 'מעטפת', 'סיבה'];
export const NAMES = [
  { id: 'n1', text: 'מכונת הפניות: 90 יום לעסקי שירות', has: ['למי', 'מטרה', 'זמן', 'מעטפת'] },
  { id: 'n2', text: 'הטלפון מצלצל: ליווי 90 יום לעסקי שירות בצפון', has: ['למי', 'מטרה', 'זמן', 'מעטפת'] },
  { id: 'n3', text: 'פניות כל שבוע תוך 90 יום: מסלול לעסקים קטנים', has: ['למי', 'מטרה', 'זמן', 'מעטפת'] },
  { id: 'n4', text: 'שיווק שאתה מבין: תוכנית 90 יום', textF: 'שיווק שאת מבינה: תוכנית 90 יום', has: ['מטרה', 'זמן', 'מעטפת'] },
  { id: 'n5', text: 'מהפרסום לפגישה: 90 יום לבעלי עסקי שירות', has: ['למי', 'מטרה', 'זמן'] },
  { id: 'n6', text: 'שנה חדשה, פניות חדשות: מסלול 90 יום לעסקים בצפון', has: ['סיבה', 'למי', 'מטרה', 'זמן', 'מעטפת'], season: true },
];

// ---------- the check mode: an offer the user already has ----------
export const EXISTING_OFFER = 'ליווי שיווקי לעסקים: 12 פגישות זום, הקמת קמפיין ודוח חודשי. 7,500 ₪, אפשר ב-3 תשלומים.';
export const REVIEW_DIMS = ['קהל', 'התוצאה', 'הסבירות', 'הזמן', 'המאמץ', 'ייחוד', 'מחיר ותנאים', 'בונוסים', 'הבטחה', 'מחסור ודחיפות', 'שם', 'מודל ההכנסה'];
export const REVIEW_DEMO = {
  line: 'ליווי שיווקי כמו של כולם: הלקוח קונה פגישות, ולא יודע מה יקבל בסוף.',
  scores: [
    ['קהל', 2, '"עסקים" זה כולם. הקהל שלך ספציפי יותר: עסקי שירות עם 1-5 עובדים.'],
    ['התוצאה', 1, 'רשימת שירותים, בלי יעד ובלי זמן.'],
    ['הסבירות', 2, 'אין הוכחה ואין הבטחה. רק הניסיון שלך, שלא מוזכר.'],
    ['הזמן', 1, 'אין ניצחון ראשון מהיר, ולא ברור מתי רואים משהו.'],
    ['המאמץ', 3, 'הקמת הקמפיין עליך, וזה טוב. זה לא נאמר במפורש.'],
    ['ייחוד', 1, 'אפשר להשוות שורה מול שורה לכל סוכנות.'],
    ['מחיר ותנאים', 3, 'יש פריסה. אין ערך מוצג מול המחיר.'],
    ['בונוסים', 1, 'אין.'],
    ['הבטחה', 1, 'אין, והפחד הכי גדול של הקהל הוא לשרוף כסף שוב.'],
    ['מחסור ודחיפות', 3, 'אין, וזה בסדר. עדיף מאשר מזויף.'],
    ['שם', 1, '"ליווי שיווקי" לא אומר למי ולא מה יוצא מזה.'],
    ['מודל ההכנסה', 3, 'בסל יש סדנה וריטיינר. הם לא מחוברים להצעה.'],
  ],
  one: { title: 'למכור את היעד, לא את הפגישות', why: 'הלקוח שלך כבר שילם על "פגישות וקמפיין" ונכווה. מה שיגרום לו לעצור הוא תוצאה ברורה עם זמן, ומה קורה אם היא לא מגיעה.' },
  flags: ['רשימת פיצ\'רים במקום תוצאה', 'הצעה לכולם, בלי קהל מוגדר'],
};

// The step finish: what the user saved.
export const SAVED = { amount: 1500, like: 'כמו פגישת בניית הצעה אצל יועץ' };
