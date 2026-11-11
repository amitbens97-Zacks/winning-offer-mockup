// Parts 4-6 of step 8: price and bonuses, the guarantee and "why now", the name and the
// check before publishing.
import { html, useState, Icon, cx } from './lib.js';
import { InlineEdit, Button } from './components.js';
import { inputCls } from './ui.js';
import { Screen, SharkTip, From, LensTag, MoneyEdit, Meter, Switch, How, StateIcon } from './kit.js';
import { CORE, BASKET, CLIENT_FILE, G_TYPES, Z_CHIPS, Z_CHIPS_F, URGENCY, NAMES, NAME_PARTS, BASIS, GENDER, USER, g } from './data.js';
import { total, compsTotal, bonusList, ratio, ratioTone, fmt, fmtRatio, payLine, capacity, guaranteeLine, guaranteeOK, checks, openObstacles } from './calc.js';

const pickF = (o, k) => (GENDER === 'f' && o[`${k}F`]) || o[k];

// ---------- part 4a: the price, next to what the client gets ----------
export function PriceScreen({ s, set, aside, onPrice }) {
  const [anchorOpen, setAnchorOpen] = useState(false);
  const r = ratio(s);
  const tone = ratioTone(r);
  const premium = BASKET.find((p) => p.role === 'premium');
  const anchor = { name: 'שיווק שעובד בשבילך', what: 'שישה חודשים, אנחנו מריצים הכול: קמפיין, תוכן ומענה לפניות', price: 36000 };
  return html`<${Screen} title=${['המחיר, מול ', 'מה שמקבלים', '']} sub="המחיר והתשלומים כבר נקבעו בשלבים הקודמים. כאן רואים אותם ליד הערך." aside=${aside}>
    <div class="grid gap-4 md:grid-cols-2">
      <section class="fb-panel !p-4">
        <p class="mb-1 flex items-center justify-between gap-2 text-[14px] font-bold">המחיר <${From}>סל המוצרים<//></p>
        <${MoneyEdit} big value=${s.price} onSave=${onPrice} />
        <p class="mt-1 text-[13px] text-muted">${CORE.name}, כולל מע"מ</p>
      </section>
      <section class="fb-panel !p-4">
        <p class="mb-2 flex items-center justify-between gap-2 text-[14px] font-bold">מתי הכסף נכנס <${From}>העסק במספרים<//></p>
        <div class="flex flex-wrap gap-2" role="radiogroup">
          ${[['start', 'הכול בהתחלה'], ['monthly', 'כל חודש לאורך התוכנית']].map(([id, l]) => html`<button key=${id} type="button" role="radio" aria-checked=${s.pay === id} onClick=${() => set((x) => ({ ...x, pay: id }))} class=${cx('h-10 rounded-xl border-[1.5px] px-3 text-[14px] font-bold cursor-pointer', s.pay === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')}>${l}</button>`)}
        </div>
        <p class="mt-2 text-[14px] text-muted">${payLine(s)}</p>
      </section>
    </div>
    <div class="mt-4"><${Meter} value=${total(s)} price=${s.price} /></div>
    <${How}>
      <p>ערך הרכיבים ${fmt(compsTotal(s))}${bonusList(s).length ? ` ועוד בונוסים ${fmt(total(s) - compsTotal(s))}` : ''} = ${fmt(total(s))}.</p>
      <p>${fmt(total(s))} ÷ ${fmt(s.price)} = ${fmtRatio(r)}. ירוק מפי 2, כתום מפי 1.5.</p>
    <//>
    ${tone !== 'good' && html`<${SharkTip} class="mt-4">${bonusList(s).length ? 'הערך גדול מהמחיר, אבל לא בהרבה. אפשר להוסיף בונוס, או רכיב שהוצאת.' : `לא מורידים מחיר, מוסיפים ערך. בחלק הבא ${openObstacles(s).length} בונוסים יסגרו את הבעיות שעוד פתוחות, וזה יזיז את המספר.`}<//>`}

    <section class="mt-6 border-t border-line pt-4">
      <button type="button" onClick=${() => setAnchorOpen((o) => !o)} class="flex w-full items-center gap-2 text-start text-[16px] font-bold cursor-pointer" aria-expanded=${anchorOpen}>
        <${Icon} name="anchor" size=${18} class="text-brand-600" />עוגן: להציג קודם גרסה יקרה יותר
        <span class="text-[13px] font-semibold text-muted">רשות</span>
        <${Icon} name="chevron-down" size=${16} class=${cx('ms-auto transition', anchorOpen && 'rotate-180')} />
      </button>
      ${anchorOpen && html`<div class="rise mt-3">
        <p class="mb-3 text-[15px] text-muted">כשרואים קודם גרסה של פי 5 בערך, ההצעה העיקרית נראית סבירה. ${premium ? `"${premium.name}" (${fmt(premium.price)}) זול מההצעה, אז הוא לא עוגן.` : ''}</p>
        <div class=${cx('fb-panel !p-4', s.anchor.on && '!border-brand-600')}>
          <div class="flex items-start justify-between gap-3">
            <div><b class="block font-display text-[17px]">${anchor.name}</b><span class="text-[14px] text-muted">${anchor.what}</span></div>
            <b class="font-display text-[18px] tabular-nums">${fmt(anchor.price)}</b>
          </div>
          <div class="mt-3 border-t border-line pt-3">
            <${Switch} on=${s.anchor.on} onChange=${(v) => set((x) => ({ ...x, anchor: v ? { on: true, ...anchor } : { on: false } }))} label=${`אני ${g('מוכן', 'מוכנה')} לספק את זה באמת`} sub="עוגן הוא הצעה אמיתית. חלק מהלקוחות יקנו אותה." />
          </div>
        </div>
      </div>`}
    </section>
  <//>`;
}

// ---------- part 4b: one bonus for each obstacle still open ----------
export function BonusesScreen({ s, set, aside, onSuggest, busyId }) {
  const list = s.bonuses || [];
  const setB = (id, p) => set((x) => ({ ...x, bonuses: x.bonuses.map((b) => (b.id === id ? { ...b, ...p } : b)) }));
  const pOf = (pid) => s.problems.find((p) => p.id === pid);
  return html`<${Screen} title=${['בונוס ', 'לכל מכשול', ' שנשאר']} sub=${`${list.length} בעיות לא נפתרו ברכיבים. לכל אחת הכריש הציע בונוס. כלי או תבנית קודמים לעוד הדרכה, כי הם דורשים מהלקוח פחות.`} aside=${aside}>
    <div class="sticky top-0 z-[2] -mx-1 mb-4 bg-canvas/95 px-1 py-2 backdrop-blur xl:hidden"><${Meter} compact value=${total(s)} price=${s.price} /></div>
    ${list.length === 0 && html`<${SharkTip}>כל הבעיות כבר נפתרות ברכיבים. אין צורך בבונוס כדי לסגור מכשול.<//>`}
    <div class="flex flex-col gap-3">
      ${list.map((b) => {
        const p = pOf(b.for);
        return html`<article key=${b.id} class=${cx('fb-panel !p-0 transition', !b.on && 'opacity-60')}>
          <div class="flex items-center gap-2 border-b border-line bg-canvas/60 px-4 py-2.5 text-[14px]">
            <${Icon} name="circle-alert" size=${15} class="text-warn" /><span class="min-w-0 flex-1 font-semibold">"${p?.text}"</span>${p && html`<${LensTag} lens=${p.lens} small />`}
          </div>
          ${b.empty && !b.name
            ? html`<div class="p-4"><p class="mb-2 text-[15px] text-muted">עוד אין בונוס לבעיה הזאת.</p><${Button} variant="mini" onClick=${() => onSuggest(b)} disabled=${busyId === b.id}><${Icon} name="sparkles" size=${15} />${busyId === b.id ? 'הכריש חושב...' : 'הכריש יציע בונוס'}<//></div>`
            : html`<div class="flex items-start gap-3 p-4">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name=${b.kind === 'מהסל' ? 'package' : b.kind === 'כלי' ? 'calculator' : 'file-text'} size=${20} /></span>
                <div class="min-w-0 flex-1">
                  <h3 class="font-display text-[18px] font-bold leading-tight"><${InlineEdit} value=${b.name} onSave=${(v) => setB(b.id, { name: v })} placeholder="שם לבונוס" /></h3>
                  <p class="text-[15px] text-ink-2"><${InlineEdit} value=${b.what} multiline onSave=${(v) => setB(b.id, { what: v })} placeholder="מה זה" /></p>
                  <p class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] text-muted"><span class="rounded-full bg-canvas px-2 py-0.5 font-bold ring-1 ring-line">${b.kind}</span>${BASIS[b.basis]}: <${InlineEdit} value=${b.note} onSave=${(v) => setB(b.id, { note: v })} placeholder="מאיפה המספר?" /></p>
                </div>
                <div class="flex shrink-0 flex-col items-end gap-2">
                  <${MoneyEdit} value=${b.value} onSave=${(v) => setB(b.id, { value: v })} />
                  <button type="button" role="switch" aria-checked=${b.on} onClick=${() => setB(b.id, { on: !b.on })} class=${cx('rounded-lg px-2.5 py-1 text-[13px] font-bold cursor-pointer', b.on ? 'text-muted hover:bg-canvas' : 'bg-brand-100 text-brand-600')}>${b.on ? 'להוציא' : 'להחזיר'}</button>
                </div>
              </div>`}
        </article>`;
      })}
    </div>
  <//>`;
}

// ---------- part 5a: the guarantee ----------
export function GuaranteeScreen({ s, set, aside, onType }) {
  const gu = s.guarantee;
  const setG = (p) => set((x) => ({ ...x, guarantee: { ...x.guarantee, ...p } }));
  const zChips = GENDER === 'f' ? Z_CHIPS_F : Z_CHIPS;
  const Slot = ({ k, ph }) => html`<span class="inline-block max-w-full rounded-lg bg-brand-50 px-1.5 text-brand-700 ring-1 ring-dashed ring-brand-300"><${InlineEdit} value=${gu[k]} placeholder=${ph} onSave=${(v) => setG({ [k]: v })} class="!whitespace-normal !text-brand-700" /></span>`;
  return html`<${Screen} title=${['מה הלקוח ', 'הכי מפחד', ' שיקרה?']} sub="הבטחה מעבירה את הסיכון מהלקוח אליך. בלי החלק של מה אנחנו עושים, זו רק סיסמה." aside=${aside}>
    <div class="mb-5 flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
      <${Icon} name="quote" size=${20} class="mt-0.5 text-brand-600" />
      <div class="min-w-0 flex-1"><p class="text-[17px] font-semibold">"${CLIENT_FILE.objection}"</p><p class="mt-1"><${From}>התנגדות הזהב, צייד הלקוחות<//></p></div>
    </div>
    <p class="mb-2 text-[15px] font-bold">איזו הבטחה מורידה את הפחד הזה?</p>
    <div class="grid grid-cols-2 gap-2 md:grid-cols-4" role="radiogroup" aria-label="סוג ההבטחה">
      ${G_TYPES.map((t) => {
        const on = gu.type === t.id;
        const fits = t.id === 'free' || t.id === 'cond';
        return html`<button key=${t.id} type="button" role="radio" aria-checked=${on} onClick=${() => !on && onType(t.id)} class=${cx('relative flex flex-col items-start gap-1 rounded-2xl border-[1.5px] p-3 text-start transition cursor-pointer', on ? 'border-brand-600 bg-brand-100' : 'border-line bg-white hover:border-brand-300')}>
          ${fits && html`<span class="absolute -top-2.5 left-2 rounded-full bg-brand-600 px-2 text-[11px] font-bold text-white">מתאים לך</span>`}
          <${Icon} name=${t.icon} size=${20} class="text-brand-600" />
          <b class="text-[15px]">${t.label}</b>
          <span class="text-[13px] leading-snug text-muted">${t.sub}</span>
        </button>`;
      })}
    </div>
    <p class="mt-2 text-[13px] text-muted">${G_TYPES.find((t) => t.id === gu.type)?.fit ? `מתאימה ל: ${G_TYPES.find((t) => t.id === gu.type).fit}.` : ''}</p>

    <section class="fb-panel mt-5 !p-5">
      <p class="mb-3 flex items-center justify-between gap-2 text-[14px] font-bold">ההבטחה, במשפט אחד <span class="text-[12px] font-semibold text-muted">לחיצה על חלק משנה אותו</span></p>
      ${gu.type === 'final'
        ? html`<p class="font-display text-[20px] leading-relaxed"><${Slot} k="cond" ph="הסיבה האמיתית" /></p>`
        : html`<p class="flex flex-wrap items-center gap-x-1.5 gap-y-2 font-display text-[20px] leading-snug"><span>אם</span><${Slot} k="y" ph="מתי" /><${Slot} k="x" ph="מה לא קרה" /><span>,</span><${Slot} k="z" ph="מה אנחנו עושים" /><span>.</span></p>
          <div class="mt-3"><p class="mb-1.5 text-[13px] font-bold text-muted">מה אנחנו עושים</p><div class="flex flex-wrap gap-1.5">${zChips.map((z) => html`<button key=${z} type="button" onClick=${() => setG({ z })} class=${cx('h-8 rounded-full border-[1.5px] px-3 text-[13px] font-bold cursor-pointer', gu.z === z ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')}>${z}</button>`)}</div></div>
          ${(gu.type === 'cond' || gu.type === 'perf' || gu.cond) && html`<div class="mt-3"><p class="mb-1 text-[13px] font-bold text-muted">התנאים</p><p class="text-[15px]"><${Slot} k="cond" ph="בתנאי ש..." /></p><p class="mt-1 text-[13px] text-muted">התנאים הטובים הם בדיוק מה שמביא להצלחה.</p></div>`}`}
      <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3"><span class="text-[14px] font-bold">שם להבטחה:</span><span class="font-display text-[17px] font-bold"><${InlineEdit} value=${gu.name} placeholder="למשל: המפגש הראשון עלינו" onSave=${(v) => setG({ name: v })} /></span></div>
    </section>

    <details class="group mt-4 rounded-2xl bg-white ring-1 ring-line">
      <summary class="flex cursor-pointer items-center gap-2 px-4 py-3 text-[15px] font-bold"><${Icon} name="file-text" size=${16} class="text-brand-600" />מדיניות ביטול<span class="text-[13px] font-semibold text-muted">עברה לכאן מ"שירות לקוחות", כדי ששני הטקסטים יתאימו</span><${Icon} name="chevron-down" size=${16} class="ms-auto transition group-open:rotate-180" /></summary>
      <div class="px-4 pb-4">
        <textarea rows="3" class=${cx(inputCls, '!h-auto py-2 leading-snug')} value=${gu.cancel} onInput=${(e) => setG({ cancel: e.target.value })} aria-label="מדיניות ביטול"></textarea>
        <p class="mt-1.5 text-[13px] text-muted">ההבטחה באה מעל זכות הביטול שבחוק, לא במקומה. כדאי לבדוק את הנוסח מול עורך דין.</p>
      </div>
    </details>
  <//>`;
}

// ---------- part 5b: why now (only when it is true) ----------
export function UrgencyScreen({ s, set, aside }) {
  const cap = capacity();
  const u = s.urgency;
  const setU = (p) => set((x) => ({ ...x, urgency: { ...x.urgency, ...p } }));
  const dateTxt = u.date ? new Date(u.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) : '...';
  const preview = {
    cohort: `מי שנרשם עד ${dateTxt} מתחיל במחזור הקרוב. אחרת, המחזור הבא.`,
    bonus: `מי שמצטרף עד ${dateTxt} מקבל גם את ${bonusList(s)[0]?.name || 'הבונוס'}.`,
    price: `ב-${dateTxt} המחיר עולה. מי שנרשם עד אז, נשאר במחיר של היום.`,
  }[u.id];
  return html`<${Screen} title=${['למה ', 'עכשיו', '?']} sub="מחסור ודחיפות מגדילים ביקוש, רק כשהם אמיתיים. אפשר גם בלי, וזה עדיף על מזויף." aside=${aside}>
    <section class="fb-panel !p-5">
      <p class="mb-1 text-[14px] font-bold text-muted">כמה לקוחות חדשים ${g('אתה יכול', 'את יכולה')} לקבל בחודש, באמת?</p>
      <p class="font-display text-[30px] font-black text-brand-900">${cap.perMonth} <span class="text-[20px] font-bold">לקוחות חדשים בחודש</span></p>
      <${How}>
        <p>${FROM_HOURS(cap)}</p>
      <//>
      <div class="mt-4 border-t border-line pt-4">
        <${Switch} on=${s.seats.on} onChange=${(v) => set((x) => ({ ...x, seats: { on: v } }))} label="להגיד את זה בהצעה" sub=${s.seats.on ? `"אנחנו מקבלים ${cap.perMonth} עסקים חדשים בחודש, כדי שכל קמפיין ייבנה אישית."` : 'כבוי. אפשר להדליק כשמתחילים להתמלא.'} />
      </div>
    </section>

    <p class="mb-2 mt-6 text-[15px] font-bold">עד מתי?</p>
    <div class="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="דחיפות">
      ${URGENCY.map((o) => html`<button key=${o.id} type="button" role="radio" aria-checked=${u.id === o.id} onClick=${() => setU({ id: o.id })} class=${cx('flex items-start gap-3 rounded-2xl border-[1.5px] p-3 text-start cursor-pointer', u.id === o.id ? 'border-brand-600 bg-brand-100' : 'border-line bg-white hover:border-brand-300')}>
        <${Icon} name=${o.icon} size=${20} class="mt-0.5 text-brand-600" /><span><b class="block text-[15px]">${o.label}</b><span class="text-[13px] text-muted">${o.sub}</span></span>
      </button>`)}
    </div>
    ${u.id !== 'none' && html`<div class="rise fb-panel mt-3 !p-4">
      <label class="block"><span class="mb-1 block text-[14px] font-bold">תאריך אמיתי</span><input type="date" class=${cx(inputCls, 'max-w-[220px]')} value=${u.date} onInput=${(e) => setU({ date: e.target.value })} /></label>
      <p class="mt-3 text-[15px]"><span class="text-muted">איך זה ייכתב: </span>${preview}</p>
      ${u.id === 'price' && html`<p class="mt-2 text-[13px] font-bold text-warn">רק אם המחיר באמת עולה בתאריך הזה. מי שראה דדליין שעבר ושום דבר לא קרה, לא יאמין לבא.</p>`}
    </div>`}
  <//>`;
}
const FROM_HOURS = (c) =>
  `מ"העסק במספרים": 20 שעות בשבוע = ${Math.round(c.month)} שעות בחודש. 30% מהן לשיווק ומכירות, נשארות ${Math.round(c.forClients)} ללקוחות. כל לקוח בתוכנית לוקח 20 שעות על פני 3 חודשים, כ-${c.perClient.toFixed(1)} בחודש. אז ${c.atOnce} לקוחות במקביל, וכל אחד נשאר 3 חודשים: ${c.perMonth} חדשים בחודש.`;

// ---------- part 6a: the name ----------
export function NameScreen({ s, set, aside, names, onMore, busy }) {
  const [own, setOwn] = useState(s.name.id === 'own' ? s.name.text : '');
  const list = names || NAMES;
  const pick = (n) => set((x) => ({ ...x, name: { id: n.id, text: pickF(n, 'text') } }));
  return html`<${Screen} title=${['איך ', 'קוראים', ' להצעה?']} sub=${`שם טוב אומר ללקוח הנכון "זה בשבילך". ${g('בחר', 'בחרי')} אחד, או ${g('כתוב', 'כתבי')} משלך.`} aside=${aside}>
    <p class="mb-3 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">שם חזק משתמש ב-3 עד 5 מאלה: ${NAME_PARTS.map((p) => html`<span key=${p} class="rounded-full bg-white px-2 py-0.5 font-bold text-ink-2 ring-1 ring-line">${p}</span>`)}</p>
    <div class="flex flex-col gap-2" role="radiogroup" aria-label="שם להצעה">
      ${list.map((n) => {
        const on = s.name.id === n.id;
        return html`<button key=${n.id} type="button" role="radio" aria-checked=${on} onClick=${() => pick(n)} class=${cx('flex items-center gap-3 rounded-2xl border-[1.5px] bg-white px-4 py-3 text-start transition cursor-pointer', on ? 'border-brand-600 ring-4 ring-brand-100' : 'border-line hover:border-brand-300')}>
          <span class=${cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', on ? 'border-brand-600' : 'border-line')}>${on && html`<span class="h-2.5 w-2.5 rounded-full bg-brand-600"></span>`}</span>
          <span class="min-w-0 flex-1"><b class="block font-display text-[18px] leading-snug">${pickF(n, 'text')}</b>
            ${n.season && html`<span class="text-[13px] font-semibold text-warn">רק אם באמת יוצאים בתחילת השנה</span>`}
          </span>
          <span class="flex shrink-0 gap-1" aria-label=${`משתמש ב: ${n.has.join(', ')}`}>${NAME_PARTS.map((p) => html`<i key=${p} title=${p} class=${cx('h-2 w-2 rounded-full', n.has.includes(p) ? 'bg-brand-600' : 'bg-line')}></i>`)}</span>
        </button>`;
      })}
    </div>
    <div class="mt-4 flex gap-2 max-sm:flex-col">
      <input class=${inputCls} placeholder=${g('או שם שאתה כותב', 'או שם שאת כותבת')} value=${own} onInput=${(e) => {
        setOwn(e.target.value);
        set((x) => ({ ...x, name: e.target.value.trim() ? { id: 'own', text: e.target.value } : { id: null, text: '' } }));
      }} aria-label="שם משלך" />
    </div>
    <button type="button" onClick=${onMore} disabled=${busy} class="mt-4 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="sparkles" size=${16} />${busy ? 'הכריש כותב...' : 'עוד שמות'}</button>
  <//>`;
}

// ---------- part 6b: the check before publishing ----------
export function CheckScreen({ s, aside, onFix }) {
  const list = checks(s);
  const ok = list.filter((c) => c.state === 'ok').length;
  const todo = list.filter((c) => c.state === 'todo').length;
  return html`<${Screen} title=${['לפני ', 'שמפרסמים', '']} sub="עשר שאלות על ההצעה. מה שעוד לא, לא חוסם: אפשר לתקן עכשיו, או לחזור לזה אחר כך." aside=${aside}>
    <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
      <b class="font-display text-[32px] font-black tabular-nums text-brand-900">${ok}<span class="text-[18px] text-muted">/10</span></b>
      <span class="text-[15px]">${todo === 0 ? 'ההצעה מוכנה לצאת לעולם.' : `${todo === 1 ? 'דבר אחד' : `${todo} דברים`} לחזק. ${ok >= 8 ? 'ההצעה כבר חזקה.' : ''}`}</span>
    </div>
    <ol class="flex flex-col divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
      ${list.map((c, i) => html`<li key=${c.id} class="flex items-start gap-3 px-4 py-3">
        <${StateIcon} state=${c.state} />
        <div class="min-w-0 flex-1">
          <p class="text-[15px] font-bold leading-snug"><span class="text-muted">${i + 1}.</span> ${c.q}</p>
          <p class="mt-0.5 text-[14px] text-muted">${c.note}</p>
        </div>
        ${c.state === 'todo' && c.screen && html`<button type="button" onClick=${() => onFix(c.screen)} class="shrink-0 rounded-lg bg-brand-100 px-3 py-1 text-[13px] font-bold text-brand-600 hover:bg-brand-200 cursor-pointer">לתקן</button>`}
      </li>`)}
    </ol>
    <p class="mt-3 text-[13px] text-muted">שאלות 6 ו-2 נבדקות במערכת גם על ידי הכריש (האם התוצאה היא יעד ולא רשימת שירותים). כל השאר נבדק בחישוב.</p>
  <//>`;
}
