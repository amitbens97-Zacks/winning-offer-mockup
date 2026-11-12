// Parts 4-6 of step 8: price and bonuses (one screen), the guarantee and "why now",
// the name and the check before publishing.
import { html, useState, Icon, cx } from './lib.js';
import { InlineEdit, Button } from './components.js';
import { inputCls } from './ui.js';
import { Screen, MoneyEdit, ValueMeter, How, StateIcon } from './kit.js';
import { USER, CLIENT_FILE, G_TYPES, Z_CHIPS, URGENCY, NAMES, CORE, GENDER, g } from './data.js';
import { total, compsTotal, bonusTotal, payLine, capacity, checks, fmt } from './calc.js';

const pickF = (o, k) => (GENDER === 'f' && o[`${k}F`]) || o[k];
const chip = (on) => cx('h-9 rounded-full border-[1.5px] px-3.5 text-[14px] font-bold transition cursor-pointer', on ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300');

// ---------- part 4: the price next to the value, and the bonuses that close the gap ----------
export function ValueScreen({ s, set, aside, onPrice, onSuggest, busyId }) {
  const [payOpen, setPayOpen] = useState(false);
  const list = s.bonuses || [];
  const setB = (id, p) => set((x) => ({ ...x, bonuses: x.bonuses.map((b) => (b.id === id ? { ...b, ...p } : b)) }));
  const pOf = (pid) => s.problems.find((p) => p.id === pid);
  // Each bonus card starts with the client's sentence it answers, so it is clear what the bonus is for.
  const said = (p, on) => html`<div class="flex items-start gap-2 text-[14px]">
    <${Icon} name="message-circle" size=${16} class="mt-0.5 shrink-0 text-muted" />
    <span class="min-w-0 flex-1 text-muted">הוא אומר לעצמו: <b class="font-semibold text-ink">"${p?.text}"</b></span>
    <span class=${cx('shrink-0 rounded-full px-2 py-0.5 text-[12px] font-bold', on ? 'bg-money-50 text-money' : 'bg-warn-50 text-warn')}>${on ? 'יש לזה תשובה' : 'עוד פתוח'}</span>
  </div>`;
  return html`<${Screen} title=${['שווה ', 'הרבה יותר', ' מהמחיר?']} sub='הלקוח צריך להרגיש שהוא מקבל הרבה יותר ממה שהוא משלם: פי 2 לפחות. לא מורידים מחיר, מוסיפים ערך.' aside=${aside}>
    <div class="top-0 z-[2] -mx-2 bg-canvas/95 px-2 pb-3 pt-1 backdrop-blur md:sticky">
      <${ValueMeter}
        value=${total(s)}
        comps=${compsTotal(s)}
        bonus=${bonusTotal(s)}
        price=${s.price}
        priceSlot=${html`<${MoneyEdit} big value=${s.price} onSave=${onPrice} />`}
        foot=${html`<div class="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-2 text-[14px] text-muted">
          <span>${payLine(s)}</span>
          <button type="button" onClick=${() => setPayOpen((o) => !o)} class="font-bold text-brand-600 hover:underline cursor-pointer">לשנות</button>
          ${payOpen && html`<span class="flex basis-full gap-2" role="radiogroup">${[['start', 'הכול בהתחלה'], ['monthly', 'כל חודש']].map(([id, l]) => html`<button key=${id} type="button" role="radio" aria-checked=${s.pay === id} onClick=${() => (set((x) => ({ ...x, pay: id })), setPayOpen(false))} class=${chip(s.pay === id)}>${l}</button>`)}</span>`}
        </div>`}
      />
    </div>
    <section class="mt-4">
      <h2 class="flex items-center gap-2 font-display text-[19px] font-bold"><${Icon} name="gift" size=${19} class="text-brand-600" />הבונוסים: תשובה למה שעוד עוצר אותו</h2>
      <p class="mb-3 mt-1 max-w-[60ch] text-[15px] text-muted">בונוס הוא לא מתנה סתם. כל בונוס עונה על משפט אחד של הלקוח שהרכיבים עוד לא פתרו, וכך הוא גם מוריד סיבה להגיד לא וגם מוסיף ערך, בלי לגעת במחיר.</p>
      <div class="flex flex-col gap-2.5">
        ${list.length === 0 && html`<p class="text-[15px] text-muted">הרכיבים כבר עונים על כל המשפטים של הלקוח. אין צורך בבונוס.</p>`}
        ${list.map((b) => {
          const p = pOf(b.for);
          if (b.empty && !b.name)
            return html`<div key=${b.id} class="rounded-2xl border-[1.5px] border-dashed border-brand-300 bg-white p-3.5">
              ${said(p, false)}
              <div class="mt-2.5 border-t border-dashed border-line pt-2.5"><${Button} variant="mini" onClick=${() => onSuggest(b)} disabled=${busyId === b.id}><${Icon} name="sparkles" size=${15} />${busyId === b.id ? 'הכריש חושב...' : 'הכריש יציע בונוס שעונה על זה'}<//></div>
            </div>`;
          return html`<div key=${b.id} class=${cx('rounded-2xl border-[1.5px] p-3.5 transition', b.on ? 'border-line bg-white' : 'border-dashed border-line bg-transparent')}>
            ${said(p, b.on)}
            <div class="mt-2.5 flex items-center gap-3 border-t border-dashed border-line pt-2.5">
              <button type="button" role="switch" aria-checked=${b.on} aria-label=${b.on ? 'להוציא את הבונוס' : 'להכניס את הבונוס'} onClick=${() => setB(b.id, { on: !b.on })} class=${cx('relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer', b.on ? 'bg-brand-600' : 'bg-line')}>
                <span class=${cx('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', b.on ? 'right-6' : 'right-1')}></span>
              </button>
              <div class=${cx('min-w-0 flex-1', !b.on && 'opacity-60')}>
                <span class="block text-[12px] font-bold text-brand-600">הבונוס שעונה על זה</span>
                <b class="block font-display text-[16px] leading-tight"><${InlineEdit} value=${b.name} onSave=${(v) => setB(b.id, { name: v })} placeholder="שם לבונוס" /></b>
                ${b.what && html`<span class="mt-0.5 block text-[13px] leading-snug text-muted">${b.what}</span>`}
              </div>
              <span class=${cx('shrink-0', !b.on && 'opacity-60')}><${MoneyEdit} value=${b.value} onSave=${(v) => setB(b.id, { value: v })} /></span>
            </div>
          </div>`;
        })}
      </div>
    </section>
  <//>`;
}

// ---------- part 5a: the guarantee ----------
export function GuaranteeScreen({ s, set, aside, onType }) {
  const gu = s.guarantee;
  const setG = (p) => set((x) => ({ ...x, guarantee: { ...x.guarantee, ...p } }));
  const Slot = ({ k, ph }) => html`<span class="inline-block max-w-full rounded-lg border-[1.5px] border-dashed border-brand-300 bg-brand-50 px-1.5 text-brand-700 hover:border-brand-600"><${InlineEdit} value=${gu[k]} placeholder=${ph} onSave=${(v) => setG({ [k]: v })} class="!whitespace-normal !text-brand-700" /></span>`;
  return html`<${Screen} title=${['מה הלקוח ', 'הכי מפחד', ' שיקרה?']} sub=${g('ההבטחה לוקחת ממנו את הסיכון. בחר סוג, וערוך את המילים המסומנות.', 'ההבטחה לוקחת ממנו את הסיכון. בחרי סוג, וערכי את המילים המסומנות.')} aside=${aside}>
    <!-- The fear, in his words, and the promise that answers it. -->
    <div class="mb-5 flex items-start gap-3">
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-error-50 text-error"><${Icon} name="user-round" size=${22} /></span>
      <div class="rounded-2xl rounded-ss-md bg-white px-4 py-3 shadow-sm ring-1 ring-line">
        <p class="text-[12px] font-bold text-muted">הלקוח חושב</p>
        <p class="font-display text-[19px] font-bold leading-snug">“${CLIENT_FILE.objection}”</p>
      </div>
    </div>
    <div class="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4" role="radiogroup" aria-label="סוג ההבטחה">
      ${G_TYPES.map((t) => {
        const on = gu.type === t.id;
        return html`<button key=${t.id} type="button" role="radio" aria-checked=${on} onClick=${() => !on && onType(t.id)} class=${cx('flex flex-col items-start gap-1.5 rounded-2xl border-[1.5px] p-3 text-start transition cursor-pointer', on ? 'border-brand-600 bg-brand-50 ring-4 ring-brand-100' : 'border-line bg-white hover:border-brand-300')}>
          <span class=${cx('grid h-8 w-8 place-items-center rounded-lg', on ? 'bg-brand-600 text-white' : 'bg-canvas text-brand-600')}><${Icon} name=${t.icon} size=${17} /></span>
          <b class="text-[15px] leading-tight">${t.label}</b>
          <span class="text-[12px] leading-snug text-muted">${t.sub}</span>
        </button>`;
      })}
    </div>
    <!-- The promise itself, laid out like a certificate. -->
    <section class="relative overflow-hidden rounded-3xl border-2 border-brand-600 bg-white p-5 shadow-[0_10px_30px_-12px_rgba(0,56,184,.35)] md:p-6">
      <span aria-hidden="true" class="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-brand-50"></span>
      <div class="relative flex items-center gap-3">
        <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-[0_0_0_5px_#fff,0_0_0_7px_#c7d4f2]"><${Icon} name="shield-check" size=${28} /></span>
        <div class="min-w-0">
          <p class="text-[12px] font-bold text-brand-600">ההבטחה</p>
          <p class="font-display text-[22px] font-black leading-tight"><${InlineEdit} value=${gu.name} placeholder="שם להבטחה" onSave=${(v) => setG({ name: v })} /></p>
        </div>
      </div>
      <div class="relative mt-4 border-t border-dashed border-line pt-4">
        ${gu.type === 'final'
          ? html`<p class="font-display text-[20px] leading-relaxed"><${Slot} k="cond" ph="הסיבה האמיתית" /></p>`
          : html`<p class="flex flex-wrap items-center gap-x-1.5 gap-y-2 font-display text-[20px] leading-snug"><span>אם</span><${Slot} k="y" ph="מתי" /><span class="inline-flex max-w-full items-baseline"><${Slot} k="x" ph="מה לא קרה" /><span>,</span></span><span class="inline-flex max-w-full items-baseline"><${Slot} k="z" ph="מה עושים" /><span>.</span></span></p>
            ${gu.cond && html`<p class="mt-2 flex items-start gap-1.5 text-[14px] text-muted"><${Icon} name="info" size=${15} class="mt-0.5 shrink-0" /><${InlineEdit} value=${gu.cond} onSave=${(v) => setG({ cond: v })} placeholder="בתנאי ש..." /></p>`}`}
      </div>
    </section>
    ${gu.type !== 'final' && html`<div class="mt-4">
      <p class="mb-2 text-[14px] font-bold text-muted">ומה עושים אם זה לא קרה?</p>
      <div class="flex flex-wrap gap-1.5">${Z_CHIPS.map((z) => html`<button key=${z} type="button" onClick=${() => setG({ z })} class=${cx('h-9 rounded-full border-[1.5px] px-3 text-[14px] font-bold transition cursor-pointer', gu.z === z ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white hover:border-brand-300')}>${z}</button>`)}</div>
    </div>`}
    <details class="group mt-4">
      <summary class="inline-flex cursor-pointer items-center gap-1 text-[14px] font-bold text-brand-600">מדיניות ביטול<${Icon} name="chevron-down" size=${14} class="transition group-open:rotate-180" /></summary>
      <textarea rows="3" class=${cx(inputCls, 'mt-2 !h-auto py-2 leading-snug')} value=${gu.cancel} onInput=${(e) => setG({ cancel: e.target.value })} aria-label="מדיניות ביטול"></textarea>
    </details>
  <//>`;
}

// ---------- part 5b: why now (only when it is true) ----------
export function UrgencyScreen({ s, set, aside }) {
  const cap = capacity();
  const u = s.urgency;
  const pick = (id) => set((x) => ({ ...x, urgency: { ...x.urgency, id, newPrice: x.urgency.newPrice || Math.round((x.price * 1.15) / 100) * 100 }, seats: { on: id === 'seats' } }));
  const setU = (p) => set((x) => ({ ...x, urgency: { ...x.urgency, ...p } }));
  const dateTxt = u.date ? new Date(u.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) : '...';
  const sub = { seats: `${cap.perMonth} ${USER.newClients} בחודש, לפי השעות שלך` };
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
            <p>"אנחנו מקבלים ${cap.perMonth} משפחות חדשות בחודש, כדי שכל תוכנית תיבנה אישית."</p>
            <${How}><p>${Math.round(cap.forClients)} שעות בחודש ללקוחות ÷ ${cap.perClient.toFixed(1)} שעות ללקוח = ${cap.atOnce} במקביל. התוכנית ${CORE.months} חודשים, אז ${cap.perMonth} ${USER.newClients} בחודש.</p><//>
          </div>`}
          ${on && o.id === 'cohort' && html`<div class="rise flex flex-wrap items-center gap-3 px-4 pb-4 ps-[68px] text-[15px]">
            <input type="date" class=${cx(inputCls, 'max-w-[200px]')} value=${u.date} onInput=${(e) => setU({ date: e.target.value })} aria-label="תאריך ההתחלה" />
            <span class="text-muted">"מי שנרשם עד ${dateTxt} מתחיל במחזור הקרוב."</span>
          </div>`}
          ${on && o.id === 'price' && html`<div class="rise px-4 pb-4 ps-[68px] text-[15px]">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
              <label class="flex items-center gap-2"><span class="font-bold">עד</span><input type="date" class=${cx(inputCls, 'max-w-[180px]')} value=${u.date} onInput=${(e) => setU({ date: e.target.value })} aria-label="עד איזה תאריך המחיר הנוכחי" /></label>
              <span class="flex items-center gap-1.5"><span class="font-bold">ואז</span><${MoneyEdit} value=${u.newPrice} onSave=${(v) => setU({ newPrice: v })} /></span>
            </div>
            <p class="mt-2 text-muted">"עד ${dateTxt} המחיר ${fmt(s.price)}. אחרי זה ${fmt(u.newPrice)}."</p>
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
