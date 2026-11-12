// Mock data for task 6, step 8 "בניית הצעה מנצחת". In production:
//   business, audience, B2B/B2C              -> "אני והעסק" (2)
//   golden sentence, pain, golden objection  -> the client file, "צייד הלקוחות" (4)
//   the core product, what's included, price -> "סל מוצרים" (3)
//   when the money comes in, weekly hours    -> "העסק במספרים" (5)
//   the user's story and authority           -> "דף המסרים" (7)
// The drafts below are what the shark would write for this business with the offer-builder
// prompt (doc/offer-builder-prompt.md). Every fact (price, hours, what's included) comes
// from the user's earlier steps; every value has a basis the user can see and change.
// The demo business here is a baby sleep consultant: דניאל/דניאלה כהן, "לילה שקט".
// The clients are parents, so the text about them is plural third person ("ההורים", "הם"),
// and the guarantee, which is said to them, speaks to them directly ("אתם", "לכם").

export const PARTNER = { name: 'הכריש', role: 'השותף העסקי' };

export const STEP = { n: 8, name: 'בניית הצעה מנצחת', chapterNo: 3, chapter: 'בניית מותג אישי', icon: 'gift' };
export const PARTS = ['התוצאה', 'מה עוצר', 'מה כלול', 'המחיר', 'הבטחה', 'שם'];
// Why each part is there, in one line: on the opening and under the part the user is in now.
export const PART_WHY = [
  'מה הלקוח קונה באמת',
  'מה יגרום לו להגיד לא',
  'מה הוא מקבל, כדי להוריד כל מכשול',
  'שהערך יהיה גדול בהרבה מהמחיר',
  'לקחת ממנו את הסיכון, וסיבה אמיתית לקנות עכשיו',
  'שם שאומר לו "זה בשבילך", ובדיקה אחרונה',
];

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
  business: 'לילה שקט',
  field: 'ייעוץ וליווי שינה לתינוקות ופעוטות',
  audience: 'הורים לתינוקות ופעוטות, מגיל 4 חודשים עד 4 שנים',
  b2b: false,
  experience: g('10 שנים אח בטיפת חלב, ויועץ שינה מוסמך', '10 שנים אחות בטיפת חלב, ויועצת שינה מוסמכת'),
  clientsSoFar: 0,
  // How this business counts new clients (written by the shark from the audience): "5 משפחות חדשות בחודש".
  newClients: 'משפחות חדשות',
};

// "צייד הלקוחות" (4): the golden sentence and the client file.
export const CLIENT_FILE = {
  golden: 'אנחנו עוזרים להורים לתינוקות להגיע ללילות שלמים של שינה, בלי להשאיר את התינוק לבכות לבד',
  pain: 'קמים 4-5 פעמים בלילה, וכבר חודשים לא ישנו לילה שלם',
  trigger: 'עוד לילה שבו התינוק התעורר כל שעה, ובבוקר צריך לתפקד בעבודה',
  where: 'קבוצות הורים בפייסבוק ובוואטסאפ, וטיפות החלב',
  objection: 'כבר ניסינו הכול, והוא פשוט לא ישן',
  market: [
    ['כאב חזק', 'חודשים בלי שינה, וזה פוגע בעבודה ובזוגיות'],
    ['כסף לשלם', 'הורים מוציאים על התינוק בלי לחשוב פעמיים'],
    ['קל להגיע אליהם', 'קבוצות הורים וטיפות חלב'],
    ['שוק שגדל', 'יותר הורים מחפשים ליווי אישי ולא עוד מידע'],
  ],
};

// "סל מוצרים" (3) with the payment terms from "העסק במספרים" (5). Prices include VAT.
export const BASKET = [
  { id: 'e1', name: 'שיחת היכרות (20 דקות)', price: 0, role: 'entry' },
  { id: 'e2', name: 'מדריך: 5 טעויות שמעירות תינוק בלילה', price: 0, role: 'entry' },
  { id: 'b1', name: 'סדנת שינה להורים (זום, שעתיים)', price: 290, role: 'bridge' },
  { id: 'p1', name: 'תוכנית שינה 8 שבועות 1:1', price: 2400, role: 'core', months: 2, hours: 8, pay: 'monthly' },
  { id: 'p2', name: 'ליווי לילי בבית (3 לילות)', price: 3900, role: 'premium' },
  { id: 'r1', name: 'ליווי המשך חודשי', price: 350, role: 'recurring', monthly: true },
];
export const CORE = BASKET.find((p) => p.role === 'core');
// What the user wrote in the basket for the core product ("מה הלקוח מקבל?").
export const CORE_INCLUDES = ['פגישת אבחון', 'תוכנית שינה כתובה', '8 שיחות זום', 'ליווי בוואטסאפ'];
export const FROM_STEP5 = { hoursWeek: 15, salesShare: 30, existingClients: 0 };

// ---------- part 1: the outcome ----------
export const OUTCOMES = [
  {
    id: 'o1',
    text: 'לילות שלמים של שינה, ושגרה שההורים יודעים להחזיק לבד',
    time: '3 שבועות',
    status: 'קמים בבוקר אחרי לילה שלם, עם כוח ליום',
    why: 'הכי קרוב למשפט הזהב שלך',
  },
  {
    id: 'o2',
    text: 'הירדמות תוך 10 דקות, בלי מאבק ובלי לשבת ליד המיטה שעה',
    time: '3 שבועות',
    status: 'הערב שלהם חוזר אליהם',
    why: 'עונה ישר על הכאב של כל ערב',
  },
  {
    id: 'o3',
    text: '11 שעות שינה רצופות בלילה',
    time: '3 שבועות',
    status: 'השעון המעורר מעיר אותם, לא התינוק',
    why: 'מספר מדויק מושך, אבל צריך לעמוד מאחוריו',
    risky: true,
  },
];
export const TIMES = ['שבועיים', '3 שבועות', 'חודש', '8 שבועות'];

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
  ['setup', 'בבניית התוכנית'],
  ['run', 'בלילות הראשונים'],
  ['leads', 'בשבועות שאחרי'],
  ['after', 'אחרי 8 שבועות'],
];
export const PROBLEMS = [
  { id: 'p1', at: 'before', lens: 'work', text: 'כבר ניסינו הכול, והוא פשוט לא ישן', how: 'איך לראות לילה טוב יותר כבר בשבוע הראשון', from: 'התנגדות הזהב' },
  { id: 'p2', at: 'before', lens: 'worth', text: '2,400 ₪ זה הרבה כסף בשבילנו עכשיו', how: 'איך לדעת כמה הלילות האלה כבר עולים לנו' },
  { id: 'p3', at: 'setup', lens: 'hard', text: 'אנחנו לא יודעים מאיפה להתחיל', how: 'איך לדעת מה הצעד הראשון, בלי לקרוא עשרה ספרים' },
  { id: 'p4', at: 'setup', lens: 'time', text: 'אין לנו זמן לשבת על תוכניות', how: 'איך להחזיק את התוכנית בעשר דקות ביום' },
  { id: 'p5', at: 'setup', lens: 'hard', text: 'יש כל כך הרבה שיטות, ואנחנו מבולבלים', how: 'איך לבחור שיטה אחת שמתאימה לנו ולתינוק' },
  { id: 'p6', at: 'run', lens: 'hard', text: 'אנחנו לא יודעים אם זה בכלל עובד', how: 'איך לראות בשורה אחת אם הלילות משתפרים' },
  { id: 'p7', at: 'run', lens: 'work', text: 'אחרי כמה לילות טובים, הכול חוזר', how: 'איך להחזיק את השינה הטובה גם בשבוע השלישי' },
  { id: 'p8', at: 'run', lens: 'worth', text: 'אנחנו לא מוכנים להשאיר אותו לבכות לבד', how: 'איך ללמד אותו להירדם בלי להשאיר אותו לבד בבכי' },
  { id: 'p9', at: 'run', lens: 'work', text: 'הוא מתעורר בשלוש בלילה, ואנחנו נשברים', how: 'איך לדעת בדיוק מה עושים בכל התעוררות' },
  { id: 'p10', at: 'leads', lens: 'time', text: 'אנחנו גמורים מעייפות, אין לנו כוח להתמיד', how: 'איך להחזיק מעמד בשבוע הראשון, גם כשקשה' },
  { id: 'p11', at: 'leads', lens: 'work', text: 'ומה אם הוא יחלה או יצמיח שיניים באמצע?', how: 'איך לעבור מחלה ושיניים בלי לחזור להתחלה' },
  { id: 'p12', at: 'after', lens: 'work', text: 'ומה קורה כשהליווי נגמר?', how: 'איך להמשיך לבד, גם בשינויים של הגיל הבא' },
];

// ---------- part 3: ways to deliver, the 2×2, and the components ----------
// cost = what it costs the business (hours, money); value = what it is worth to the client
// by the four levers. Both are the shark's first guess and the user can flip them.
export const IDEAS = [
  { id: 'd1', text: 'פגישת אבחון של 90 דקות, עם יומן שינה של שבוע', solves: ['p3'], cost: 'high', value: 'high', mode: 'איתך' },
  { id: 'd2', text: 'תוכנית שינה כתובה, לפי הגיל והאופי של התינוק', solves: ['p3', 'p5'], cost: 'high', value: 'high', mode: 'בשבילך' },
  { id: 'd14', text: 'לילה ראשון לפי התוכנית בתוך 3 ימים', solves: ['p1'], cost: 'low', value: 'high', mode: 'בשבילך', win: true },
  { id: 'd8', text: 'עדכון התוכנית כל שבוע, לפי מה שקרה בלילות', solves: ['p7'], cost: 'low', value: 'high', mode: 'בשבילך' },
  { id: 'd7', text: '8 שיחות זום שבועיות של חצי שעה', solves: ['p4', 'p7', 'p8'], cost: 'high', value: 'high', mode: 'איתך' },
  { id: 'd9', text: 'מענה בוואטסאפ כל ערב, עד 22:00', solves: ['p4', 'p1'], cost: 'high', value: 'high', mode: 'איתך' },
  { id: 'd4', text: 'דף אחד: מה עושים בכל התעוררות', solves: ['p9'], cost: 'low', value: 'high', mode: 'לבד' },
  { id: 'd5', text: 'יומן שינה של שורה אחת בכל בוקר, וסיכום בסוף השבוע', solves: ['p6'], cost: 'low', value: 'high', mode: 'בשבילך' },
  // The shark's further ideas: worth a lot, but not in the first cut. "הצעות חדשות מהכריש" offers them three at a time.
  { id: 'd15', text: 'תוכנית מוכנה לנסיעות, לחגים ולמעבר שעון', solves: ['p7'], cost: 'low', value: 'high', mode: 'בשבילך', pool: true },
  { id: 'd16', text: 'שיחה אחת עם שני ההורים יחד, כדי ששניהם יעבדו באותה דרך', solves: ['p5', 'p8'], cost: 'low', value: 'high', mode: 'איתך', pool: true },
  { id: 'd17', text: 'כרטיס למקרר עם שגרת הערב, צעד אחר צעד', solves: ['p4', 'p10'], cost: 'low', value: 'high', mode: 'לבד', pool: true },
  { id: 'd18', text: 'שבועיים של וואטסאפ אחרי סוף התוכנית', solves: ['p12'], cost: 'low', value: 'high', mode: 'איתך', pool: true },
  { id: 'd3', text: 'קורס וידאו על שלבי השינה של תינוקות', solves: ['p5'], cost: 'high', value: 'low', mode: 'לבד', why: 'מוסיף להורים עבודה במקום להוריד' },
  { id: 'd6', text: 'מסמך מחקרי מלא על שינת תינוקות, 30 עמודים', solves: ['p6'], cost: 'low', value: 'low', mode: 'לבד', why: 'מבלבל יותר ממה שעוזר' },
  { id: 'd11', text: 'ביקור בית לסידור חדר השינה', solves: ['p4'], cost: 'high', value: 'low', mode: 'בשבילך', why: 'הרבה זמן ונסיעות, ומשנה מעט' },
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
    name: 'מפת השינה',
    promise: 'יודעים למה הוא מתעורר, כבר מהשבוע הראשון',
    ideas: ['d1'],
    value: 650,
    basis: 'separate',
    note: 'פגישת אבחון אצל יועצת שינה: 500-800 ₪',
  },
  {
    id: 'c2',
    name: 'תוכנית הלילה',
    promise: 'תוכנית כתובה לפי הגיל והאופי שלו, ומתעדכנת כל שבוע',
    ideas: ['d2', 'd14', 'd8'],
    value: 1200,
    basis: 'separate',
    note: 'תוכנית שינה אישית כתובה 800 ₪, ועדכון שבועי 50 ₪ × 8',
  },
  {
    id: 'c3',
    name: '8 שבועות צמוד',
    promise: 'שיחה בשבוע, ומישהו לשאול כל ערב',
    ideas: ['d7', 'd9'],
    value: 2000,
    basis: 'separate',
    note: '8 שיחות × 150 ₪, ועוד זמינות בוואטסאפ 400 ₪ בחודש × 2',
  },
  {
    id: 'c4',
    name: 'מה עושים בשלוש בלילה',
    promise: 'יודעים בדיוק מה לעשות בכל התעוררות',
    ideas: ['d4'],
    value: 350,
    basis: 'separate',
    note: 'דף התעוררויות מותאם אצל יועצת: 300-400 ₪',
  },
  {
    id: 'c5',
    name: 'השורה האחת',
    promise: 'בכל בוקר, בשורה אחת: הלילה השתפר או לא',
    ideas: ['d5'],
    value: 220,
    basis: 'time',
    note: 'חוסך כ-4 שעות של רישום וחישובים, × 55 ₪',
  },
];

// ---------- part 4: bonuses, one for each obstacle that is still open ----------
export const BONUS_DRAFTS = {
  p2: { name: 'המחשבון "כמה עולים לנו הלילות האלה"', what: 'מכניסים ימי מחלה, איחורים ועוד קפה, ורואים כמה הלילות בלי שינה כבר עולים בחודש', kind: 'כלי', value: 90, basis: 'time', note: 'חוסך כשעתיים של חישובים, × 45 ₪' },
  p10: { name: 'שבע הודעות ערב', what: 'הודעה קצרה בכל ערב בשבוע הראשון: מה עושים הלילה, בשלוש שורות', kind: 'תבנית', value: 120, basis: 'separate', note: 'כמו שיחת חיזוק קצרה בכל ערב, 7 × 17 ₪' },
  p11: { name: 'המדריך ללילות חריגים', what: 'מה עושים במחלה, בשיניים, בחופשה ובמעבר שעון, בלי לחזור לנקודת ההתחלה', kind: 'תבנית', value: 150, basis: 'separate', note: 'כמו שיחת ייעוץ קצרה: 150 ₪' },
  p12: { name: 'סדנת השינה להורים', what: 'הסדנה מהסל, בסוף התוכנית: מה משתנה בשינה בגיל הבא, ואיך ממשיכים לבד', kind: 'מהסל', value: 290, basis: 'separate', note: 'המחיר שלה בסל המוצרים שלך', fromBasket: 'b1' },
};

// ---------- part 5: the guarantee and "why now" ----------
export const G_TYPES = [
  { id: 'free', label: 'בלי תנאים', sub: 'לא מרוצים? מקבלים את הכסף', fit: 'שירות זול יחסית, לקוחות פרטיים', icon: 'heart-handshake' },
  { id: 'cond', label: 'מותנית', sub: 'תקפה למי שעשה את מה שנדרש', fit: 'שירות יקר, לקוחות עסקיים', icon: 'list-checks' },
  { id: 'final', label: 'כל המכירות סופיות', sub: 'כשמה שנמסר אי אפשר להחזיר', fit: 'שיטה, קוד, חומרים', icon: 'lock' },
  { id: 'perf', label: 'גלומה במחיר', sub: 'משלמים לפי תוצאה', fit: 'כשהתוצאה נמדדת בשקיפות', icon: 'percent' },
];
// The guarantee is said to the clients, so its sentences speak to them directly
// ("אתם", "לכם"), whatever the user's own gender. Everywhere else they are third person.
export const Z_CHIPS = [
  'נחזיר לכם את כל הכסף',
  'נמשיך ללוות בלי תשלום עד שזה יקרה',
  'שבוע נוסף עלינו',
  'התשלום השני רק אחרי הלילה השלם הראשון',
  'תצאו מהתוכנית בלי קנס',
];
export const GUARANTEE_DRAFTS = {
  free: { y: 'אחרי השבוע הראשון', x: 'לא תראו שינוי בלילות', z: 'נחזיר לכם את כל הכסף', cond: '', name: 'השבוע הראשון עלינו' },
  cond: {
    y: 'תוך 3 שבועות',
    x: 'הוא לא ישן 6 שעות רצוף',
    z: 'נמשיך ללוות בלי תשלום עד שזה יקרה',
    cond: 'בתנאי שעבדתם לפי התוכנית ומילאתם את יומן השינה',
    name: '6 שעות או שממשיכים',
  },
  final: { y: '', x: '', z: '', cond: 'אנחנו עובדים רק עם הורים שמחויבים לתהליך', name: 'רק מחויבים' },
  perf: { y: 'בכל שבוע', x: 'הלילות לא השתפרו', z: 'השבוע הזה לא עולה לכם כלום', cond: 'מינימום 600 ₪, שמכסה את פגישת האבחון', name: 'משלמים על לילות' },
};
export const CANCEL_TEXT = 'אפשר לבטל תוך 14 יום מהעסקה, לפי חוק הגנת הצרכן. דמי ביטול: 5% מהמחיר או 100 ₪, הנמוך מביניהם.';

// "seats" uses the real capacity from "העסק במספרים"; "cohort" and "price" need a real date.
export const URGENCY = [
  { id: 'none', label: 'בלי דחיפות', sub: 'ההצעה זמינה תמיד', icon: 'circle-off' },
  { id: 'seats', label: 'מקומות מוגבלים', sub: '', icon: 'users' },
  { id: 'price', label: 'עליית מחירים', sub: 'המחיר הנוכחי בתוקף עד תאריך', icon: 'trending-up' },
  { id: 'cohort', label: 'תאריך התחלה', sub: 'מתחילים יחד, במחזור הקרוב', icon: 'calendar-days' },
];

// ---------- part 6: the name ----------
// Which of the five parts of a name each option uses (prompt 3.6): סיבה, למי, מטרה, זמן, מעטפת.
export const NAME_PARTS = ['למי', 'מטרה', 'זמן', 'מעטפת', 'סיבה'];
export const NAMES = [
  { id: 'n1', text: 'לילה שקט: 8 שבועות לתינוקות ופעוטות', has: ['למי', 'מטרה', 'זמן', 'מעטפת'] },
  { id: 'n2', text: 'ישנים לילה שלם: ליווי שינה אישי ל-8 שבועות', has: ['מטרה', 'זמן', 'מעטפת'] },
  { id: 'n3', text: 'שינה רצופה תוך 3 שבועות: מסלול להורים לתינוקות', has: ['למי', 'מטרה', 'זמן', 'מעטפת'] },
  { id: 'n4', text: 'בלי מאבק בערב: תוכנית שינה ל-8 שבועות', has: ['מטרה', 'זמן', 'מעטפת'] },
  { id: 'n5', text: 'מההשכבה לבוקר: 8 שבועות להורים עייפים', has: ['למי', 'מטרה', 'זמן'] },
  { id: 'n6', text: 'חוזרים לשגרה, חוזרים לישון: מסלול 8 שבועות להורים', has: ['סיבה', 'למי', 'מטרה', 'זמן', 'מעטפת'], season: true },
];

// ---------- the check mode: an offer the user already has ----------
export const EXISTING_OFFER = 'ייעוץ שינה לתינוקות: פגישת ייעוץ, תוכנית שינה וליווי בוואטסאפ. 2,400 ₪, אפשר ב-2 תשלומים.';
export const REVIEW_DIMS = ['קהל', 'התוצאה', 'הסבירות', 'הזמן', 'המאמץ', 'ייחוד', 'מחיר ותנאים', 'בונוסים', 'הבטחה', 'מחסור ודחיפות', 'שם', 'מודל ההכנסה'];
export const REVIEW_DEMO = {
  line: 'ייעוץ שינה כמו של כולם: ההורים קונים פגישה ותוכנית, ולא יודעים מתי יישנו.',
  scores: [
    ['קהל', 2, '"תינוקות" זה רחב. הקהל שלך ספציפי יותר: הורים לגילאי 4 חודשים עד 4 שנים.'],
    ['התוצאה', 1, 'רשימת שירותים, בלי יעד ובלי זמן.'],
    ['הסבירות', 2, 'אין הוכחה ואין הבטחה. רק הניסיון שלך בטיפת חלב, שלא מוזכר.'],
    ['הזמן', 1, 'לא ברור מתי רואים לילה טוב יותר.'],
    ['המאמץ', 3, 'תוכנית כתובה ומוכנה, וזה טוב. זה לא נאמר במפורש.'],
    ['ייחוד', 1, 'אפשר להשוות שורה מול שורה לכל יועצת שינה.'],
    ['מחיר ותנאים', 3, 'יש פריסה. אין ערך מוצג מול המחיר.'],
    ['בונוסים', 1, 'אין.'],
    ['הבטחה', 1, 'אין, והפחד הכי גדול שלהם הוא "כבר ניסינו הכול".'],
    ['מחסור ודחיפות', 3, 'אין, וזה בסדר. עדיף מאשר מזויף.'],
    ['שם', 1, '"ייעוץ שינה" לא אומר למי ולא מה יוצא מזה.'],
    ['מודל ההכנסה', 3, 'בסל יש סדנה וליווי המשך. הם לא מחוברים להצעה.'],
  ],
  one: { title: 'למכור את הלילה השלם, לא את הפגישה', why: 'ההורים כבר ניסו שיטות ומדריכים ונשברו. מה שיגרום להם לעצור הוא תוצאה ברורה עם זמן, ומה קורה אם היא לא מגיעה.' },
  flags: ['רשימת שירותים במקום תוצאה', 'הצעה לכל ההורים, בלי גיל מוגדר'],
};

// The step finish: what the user saved.
export const SAVED = { amount: 1500, like: 'כמו פגישת בניית הצעה אצל יועץ' };
