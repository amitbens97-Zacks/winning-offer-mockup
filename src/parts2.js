// Parts 4-6 of step 8: price and bonuses (one screen), the guarantee and "why now",
// the name and the check before publishing.
import { html, useState, Icon, cx } from './lib.js';
import { InlineEdit, Button } from './components.js';
import { inputCls } from './ui.js';
import { Screen, MoneyEdit, ValueMeter, How, StateIcon } from './kit.js';
import { CLIENT_FILE, G_TYPES, Z_CHIPS, Z_CHIPS_F, URGENCY, NAMES, GENDER, g } from './data.js';
import { total, payLine, capacity, checks } from './calc.js';

const pickF = (o, k) => (GENDER === 'f' && o[`${k}F`]) || o[k];
const chip = (on) => cx('h-9 rounded-full border-[1.5px] px-3.5 text-[14px] font-bold transition cursor-pointer', on ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300');

// ---------- part 4: the price next to the value, and the bonuses that close the gap ----------
export function ValueScreen({ s, set, aside, onPrice, onSuggest, busyId }) {
  const [payOpen, setPayOpen] = useState(false);
  const list = s.bonuses || [];
  const setB = (id, p) => set((x) => ({ ...x, bonuses: x.bonuses.map((b) => (b.id === id ? { ...b, ...p } : b)) }));
  const pOf = (pid) => s.problems.find((p) => p.id === pid);
  return html`<${Screen} title=${['שווה ', 'הרבה יותר', ' מהמחיר?']} sub=${g('לא מורידים מחיר, מוסיפים ערך. הדלק בונוסים וראה את המד זז.', 'לא מורידים מחיר, מוסיפים ערך. הדליקי בונוסים וראי את המד זז.')} aside=${aside}>
    <div class="sticky top-0 z-[2] -mx-2 bg-canvas/95 px-2 pb-3 pt-1 backdrop-blur">
      <${ValueMeter}
        value=${total(s)}
        price=${s.price}
        priceSlot=${html`<${MoneyEdit} big value=${s.price} onSave=${onPrice} />`}
        foot=${html`<div class="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-2 text-[14px] text-muted">
          <span>${payLine(s)}</span>
          <button type="button" onClick=${() => setPayOpen((o) => !o)} class="font-bold text-brand-600 hover:underline cursor-pointer">לשנות</button>
          ${payOpen && html`<span class="flex basis-full gap-2" role="radiogroup">${[['start', 'הכול בהתחלה'], ['monthly', 'כל חודש']].map(([id, l]) => html`<button key=${id} type="button" role="radio" aria-checked=${s.pay === id} onClick=${() => (set((x) => ({ ...x, pay: id })), setPayOpen(false))} class=${chip(s.pay === id)}>${l}</button>`)}</span>`}
        </div>`}
      />
    </div>
    <p class="mb-2 mt-3 text-[15px] font-bold">בונוס לכל דבר שעוד עוצר אותו</p>
    <div class="flex flex-col gap-2">
      ${list.length === 0 && html`<p class="text-[15px] text-muted">הרכיבים כבר פותרים הכול. אין צורך בבונוס.</p>`}
      ${list.map((b) => {
        const p = pOf(b.for);
        if (b.empty && !b.name)
          return html`<div key=${b.id} class="flex flex-wrap items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-brand-300 bg-white p-3.5">
            <span class="min-w-0 flex-1 text-[15px] text-muted">"${p?.text}"</span>
            <${Button} variant="mini" onClick=${() => onSuggest(b)} disabled=${busyId === b.id}><${Icon} name="sparkles" size=${15} />${busyId === b.id ? 'הכריש חושב...' : 'הכריש יציע בונוס'}<//>
          </div>`;
        return html`<div key=${b.id} class=${cx('flex items-center gap-3 rounded-2xl border-[1.5px] p-3.5 transition', b.on ? 'border-line bg-white' : 'border-dashed border-line bg-transparent')}>
          <button type="button" role="switch" aria-checked=${b.on} aria-label=${b.on ? 'להוציא את הבונוס' : 'להכניס את הבונוס'} onClick=${() => setB(b.id, { on: !b.on })} class=${cx('relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer', b.on ? 'bg-brand-600' : 'bg-line')}>
            <span class=${cx('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', b.on ? 'right-6' : 'right-1')}></span>
          </button>
          <div class=${cx('min-w-0 flex-1', !b.on && 'opacity-60')}>
            <b class="block font-display text-[16px] leading-tight"><${InlineEdit} value=${b.name} onSave=${(v) => setB(b.id, { name: v })} placeholder="שם לבונוס" /></b>
            <span class="block truncate text-[13px] text-muted">פותר: "${p?.text}"</span>
          </div>
          <span class=${cx('shrink-0', !b.on && 'opacity-60')}><${MoneyEdit} value=${b.value} onSave=${(v) => setB(b.id, { value: v })} /></span>
        </div>`;
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
  return html`<${Screen} title=${['מה הלקוח ', 'הכי מפחד', ' שיקרה?']} sub=${`"${CLIENT_FILE.objection}". הבטחה טובה לוקחת ממנו את הסיכון הזה.`} aside=${aside}>
    <div class="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="סוג ההבטחה">
      ${G_TYPES.map((t) => html`<button key=${t.id} type="button" role="radio" aria-checked=${gu.type === t.id} onClick=${() => gu.type !== t.id && onType(t.id)} class=${chip(gu.type === t.id)}>${t.label}</button>`)}
    </div>
    <section class="fb-panel !p-5">
      ${gu.type === 'final'
        ? html`<p class="font-display text-[21px] leading-relaxed"><${Slot} k="cond" ph="הסיבה האמיתית" /></p>`
        : html`<p class="flex flex-wrap items-center gap-x-1.5 gap-y-2 font-display text-[21px] leading-snug"><span>אם</span><${Slot} k="y" ph="מתי" /><${Slot} k="x" ph="מה לא קרה" /><span>,</span><${Slot} k="z" ph="מה אנחנו עושים" /><span>.</span></p>
          ${gu.cond && html`<p class="mt-2 text-[15px] text-muted"><${InlineEdit} value=${gu.cond} onSave=${(v) => setG({ cond: v })} placeholder="בתנאי ש..." /></p>`}
          <div class="mt-4 flex flex-wrap gap-1.5">${zChips.map((z) => html`<button key=${z} type="button" onClick=${() => setG({ z })} class=${cx('h-8 rounded-full border-[1.5px] px-3 text-[13px] font-bold cursor-pointer', gu.z === z ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')}>${z}</button>`)}</div>`}
      <p class="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3"><span class="text-[14px] font-bold text-muted">השם שלה:</span><span class="font-display text-[18px] font-bold"><${InlineEdit} value=${gu.name} placeholder="למשל: המפגש הראשון עלינו" onSave=${(v) => setG({ name: v })} /></span></p>
    </section>
    <details class="group mt-3">
      <summary class="inline-flex cursor-pointer items-center gap-1 text-[14px] font-bold text-brand-600">מדיניות ביטול<${Icon} name="chevron-down" size=${14} class="transition group-open:rotate-180" /></summary>
      <textarea rows="3" class=${cx(inputCls, 'mt-2 !h-auto py-2 leading-snug')} value=${gu.cancel} onInput=${(e) => setG({ cancel: e.target.value })} aria-label="מדיניות ביטול"></textarea>
    </details>
  <//>`;
}

// ---------- part 5b: why now (only when it is true) ----------
export function UrgencyScreen({ s, set, aside }) {
  const cap = capacity();
  const u = s.urgency;
  const pick = (id) => set((x) => ({ ...x, urgency: { ...x.urgency, id }, seats: { on: id === 'seats' } }));
  const dateTxt = u.date ? new Date(u.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) : '...';
  const sub = { seats: `${cap.perMonth} לקוחות חדשים בחודש, לפי השעות שלך` };
  return html`<${Screen} title=${['למה לקנות ', 'עכשיו', '?']} sub="רק אם זה אמיתי. הצעה בלי דחיפות עדיפה על דחיפות מזויפת." aside=${aside}>
    <div class="flex flex-col gap-2" role="radiogroup" aria-label="למה עכשיו">
      ${URGENCY.map((o) => {
        const on = u.id === o.id;
        return html`<div key=${o.id} class=${cx('rounded-2xl border-[1.5px] bg-white transition', on ? 'border-brand-600 ring-4 ring-brand-100' : 'border-line hover:border-brand-300')}>
          <button type="button" role="radio" aria-checked=${on} onClick=${() => pick(o.id)} class="flex w-full items-center gap-3 p-4 text-start cursor-pointer">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><${Icon} name=${o.icon} size=${20} /></span>
            <span class="min-w-0 flex-1"><b class="block text-[16px]">${o.label}</b><span class="text-[14px] text-muted">${sub[o.id] || o.sub}</span></span>
          </button>
          ${on && o.id === 'seats' && html`<div class="rise px-4 pb-4 ps-[68px] text-[15px]">
            <p>"אנחנו מקבלים ${cap.perMonth} עסקים חדשים בחודש, כדי שכל קמפיין ייבנה אישית."</p>
            <${How}><p>${Math.round(cap.forClients)} שעות בחודש ללקוחות ÷ ${cap.perClient.toFixed(1)} שעות ללקוח = ${cap.atOnce} במקביל. התוכנית 3 חודשים, אז ${cap.perMonth} חדשים בחודש.</p><//>
          </div>`}
          ${on && o.id === 'cohort' && html`<div class="rise flex flex-wrap items-center gap-3 px-4 pb-4 ps-[68px] text-[15px]">
            <input type="date" class=${cx(inputCls, 'max-w-[200px]')} value=${u.date} onInput=${(e) => set((x) => ({ ...x, urgency: { ...x.urgency, date: e.target.value } }))} aria-label="תאריך ההתחלה" />
            <span class="text-muted">"מי שנרשם עד ${dateTxt} מתחיל במחזור הקרוב."</span>
          </div>`}
        </div>`;
      })}
    </div>
  <//>`;
}

// ---------- part 6a: the name ----------
export function NameScreen({ s, set, aside, names, onMore, busy }) {
  const [own, setOwn] = useState(s.name.id === 'own' ? s.name.text : '');
  const list = names || NAMES;
  const pick = (n) => {
    setOwn('');
    set((x) => ({ ...x, name: { id: n.id, text: pickF(n, 'text') } }));
  };
  return html`<${Screen} title=${['איך ', 'קוראים', ' להצעה?']} sub=${`שם שאומר ללקוח הנכון "זה בשבילך". ${g('בחר', 'בחרי')} או ${g('כתוב', 'כתבי')} משלך.`} aside=${aside}>
    <div class="flex flex-col gap-2" role="radiogroup" aria-label="שם להצעה">
      ${list.map((n) => {
        const on = s.name.id === n.id;
        return html`<button key=${n.id} type="button" role="radio" aria-checked=${on} onClick=${() => pick(n)} class=${cx('flex items-center gap-3 rounded-2xl border-[1.5px] bg-white px-4 py-3.5 text-start transition cursor-pointer', on ? 'border-brand-600 ring-4 ring-brand-100' : 'border-line hover:border-brand-300')}>
          <span class=${cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', on ? 'border-brand-600' : 'border-line')}>${on && html`<span class="h-2.5 w-2.5 rounded-full bg-brand-600"></span>`}</span>
          <span class="min-w-0 flex-1"><b class="block font-display text-[18px] leading-snug">${pickF(n, 'text')}</b>${n.season && html`<span class="text-[13px] font-semibold text-warn">רק אם באמת יוצאים בתחילת השנה</span>`}</span>
        </button>`;
      })}
      <input class=${cx(inputCls, '!h-12', s.name.id === 'own' && '!border-brand-600')} placeholder=${g('או שם שאתה כותב...', 'או שם שאת כותבת...')} value=${own} onInput=${(e) => {
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
  const ok = list.filter((c) => c.state === 'ok');
  const todo = list.filter((c) => c.state === 'todo');
  const rest = list.filter((c) => c.state !== 'todo');
  const pct = (ok.length / list.length) * 100;
  return html`<${Screen} title=${['כמעט ', 'מוכן', '']} sub="עשר שאלות לפני שמפרסמים. מה שעוד לא, לא חוסם." aside=${aside}>
    <div class="mb-4 flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
      <span class="relative grid h-16 w-16 shrink-0 place-items-center">
        <svg viewBox="0 0 36 36" class="absolute inset-0 -rotate-90" aria-hidden="true"><circle cx="18" cy="18" r="15.5" fill="none" stroke="#e7e1d5" stroke-width="3.5" /><circle cx="18" cy="18" r="15.5" fill="none" stroke="#0038b8" stroke-width="3.5" stroke-linecap="round" stroke-dasharray=${`${(pct * 97.4) / 100} 97.4`} /></svg>
        <b class="font-display text-[18px] font-black tabular-nums">${ok.length}/${list.length}</b>
      </span>
      <span class="text-[16px] font-semibold">${todo.length === 0 ? 'ההצעה מוכנה לצאת לעולם.' : `${todo.length === 1 ? 'נשאר דבר אחד לחזק' : `נשארו ${todo.length} דברים לחזק`}. אפשר עכשיו, או אחר כך.`}</span>
    </div>
    <div class="flex flex-col gap-2">
      ${todo.map((c) => html`<div key=${c.id} class="flex items-start gap-3 rounded-2xl border-[1.5px] border-warn/30 bg-white p-3.5">
        <${StateIcon} state="todo" />
        <div class="min-w-0 flex-1"><p class="text-[15px] font-bold leading-snug">${c.q}</p><p class="mt-0.5 text-[14px] text-muted">${c.note}</p></div>
        ${c.screen && html`<button type="button" onClick=${() => onFix(c.screen)} class="shrink-0 rounded-lg bg-brand-100 px-3 py-1 text-[13px] font-bold text-brand-600 hover:bg-brand-200 cursor-pointer">לתקן</button>`}
      </div>`)}
    </div>
    <details class="group mt-3 rounded-2xl bg-white ring-1 ring-line">
      <summary class="flex cursor-pointer items-center gap-2 px-4 py-3 text-[15px] font-bold"><${StateIcon} state="ok" />${ok.length} כבר מוכנים<${Icon} name="chevron-down" size=${16} class="ms-auto transition group-open:rotate-180" /></summary>
      <ul class="divide-y divide-line px-4 pb-2">${rest.map((c) => html`<li key=${c.id} class="flex items-start gap-3 py-2.5"><${StateIcon} state=${c.state} /><span class="text-[14px]">${c.q}</span></li>`)}</ul>
    </details>
  <//>`;
}
