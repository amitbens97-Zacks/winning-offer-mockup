// Parts 1-3 of step 8: the outcome, what stops the client, what is included
// (the 2×2 of ways to deliver, then the named components with their values).
import { html, useState, Icon, cx } from './lib.js';
import { InlineEdit, Button } from './components.js';
import { inputCls } from './ui.js';
import { Screen, SharkTip, From, LensTag, ModeTag, MoneyEdit, Meter } from './kit.js';
import { OUTCOMES, TIMES, LENSES, ROAD, CLIENT_FILE, BASIS, GENDER, g } from './data.js';
import { activeComps, ideasOf, loose, compsTotal, covered, openObstacles, fmt } from './calc.js';

const pickF = (o, k) => (GENDER === 'f' && o[`${k}F`]) || o[k];

// ---------- part 1: where the client gets to ----------
export function OutcomeScreen({ s, set, aside, onMore }) {
  const o = s.outcome;
  const pick = (opt) => set((x) => ({ ...x, outcome: { id: opt.id, text: pickF(opt, 'text'), time: opt.time, status: pickF(opt, 'status'), byShark: true } }));
  const edit = (p) => set((x) => ({ ...x, outcome: { ...x.outcome, ...p, byShark: false } }));
  const options = s.altOutcomes || OUTCOMES;
  return html`<${Screen} title=${['לאן הלקוח ', 'מגיע', '?']} sub=${`מוכרים את היעד, לא את הדרך. ${g('בחר', 'בחרי')} ניסוח אחד, ואפשר לערוך אותו.`} aside=${aside}>
    <p class="mb-4 flex flex-wrap items-center gap-2 text-[15px] text-muted"><${From}>משפט הזהב, צייד הלקוחות<//><span>"${CLIENT_FILE.golden}"</span></p>
    <div class="flex flex-col gap-3" role="radiogroup" aria-label="התוצאה">
      ${options.map((opt) => {
        const on = o.id === opt.id;
        return html`<div key=${opt.id} class=${cx('fb-panel !p-0 transition', on ? '!border-brand-600 ring-4 ring-brand-100' : 'hover:border-brand-300')}>
          <button type="button" role="radio" aria-checked=${on} onClick=${() => !on && pick(opt)} class="flex w-full items-start gap-3 p-4 text-start cursor-pointer">
            <span class=${cx('mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', on ? 'border-brand-600' : 'border-line')}>${on && html`<span class="h-2.5 w-2.5 rounded-full bg-brand-600"></span>`}</span>
            <span class="min-w-0 flex-1">
              <b class="block font-display text-[18px] leading-snug">${on ? o.text : pickF(opt, 'text')}<span class="text-muted">, תוך ${on ? o.time : opt.time}</span></b>
              <span class="mt-1 flex items-start gap-1.5 text-[15px] text-muted"><${Icon} name="eye" size=${15} class="mt-0.5 text-brand-600" />מה אחרים יראו: ${on ? o.status : pickF(opt, 'status')}</span>
              <span class="mt-2 flex flex-wrap gap-1.5">
                <span class="text-[13px] font-semibold text-ink-2">${opt.why}</span>
                ${opt.risky && html`<span class="rounded-full bg-warn-50 px-2 text-[12px] font-bold text-warn">מספר מדויק: רק אם ${g('אתה יכול', 'את יכולה')} לעמוד מאחוריו</span>`}
              </span>
            </span>
          </button>
          ${on && html`<div class="rise border-t border-line px-4 pb-4 pt-3">
            <p class="mb-1 text-[13px] font-bold text-muted">לערוך את הניסוח</p>
            <textarea rows="2" class=${cx(inputCls, '!h-auto py-2 leading-snug')} value=${o.text} onInput=${(e) => edit({ text: e.target.value })} aria-label="התוצאה"></textarea>
            <p class="mb-1.5 mt-3 text-[13px] font-bold text-muted">תוך כמה זמן?</p>
            <div class="flex flex-wrap gap-2">
              ${TIMES.map((t) => html`<button key=${t} type="button" onClick=${() => edit({ time: t })} class=${cx('h-9 rounded-xl border-[1.5px] px-3 text-[14px] font-bold cursor-pointer', o.time === t ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')}>${t}</button>`)}
              <span class="self-center text-[13px] text-muted">התוכנית בסל: 3 חודשים</span>
            </div>
            <p class="mb-1 mt-3 text-[13px] font-bold text-muted">מה אחרים יראו (המעמד)</p>
            <input class=${inputCls} value=${o.status} onInput=${(e) => edit({ status: e.target.value })} aria-label="מה אחרים יראו" />
          </div>`}
        </div>`;
      })}
    </div>
    <button type="button" onClick=${onMore} class="mt-4 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="sparkles" size=${16} />שלושה ניסוחים אחרים</button>
  <//>`;
}

// ---------- part 2: what will stop the client on the way ----------
export function ProblemsScreen({ s, set, aside, onAdd, adding }) {
  const [text, setText] = useState('');
  const [lens, setLens] = useState('work');
  const on = s.problems.filter((p) => p.on);
  const count = (l) => on.filter((p) => p.lens === l).length;
  const toggle = (id) => set((x) => ({ ...x, problems: x.problems.map((p) => (p.id === id ? { ...p, on: !p.on } : p)) }));
  const setHow = (id, how) => set((x) => ({ ...x, problems: x.problems.map((p) => (p.id === id ? { ...p, how } : p)) }));
  const add = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), lens);
    setText('');
  };
  const missingLens = Object.keys(LENSES).find((l) => !count(l));
  return html`<${Screen} title=${['מה ', 'יעצור אותו', ' בדרך?']} sub=${`כל בעיה שנשארת פתוחה היא סיבה לא לקנות. ${g('עבור', 'עברי')} על הרשימה: מה לא נכון, ${g('מסמן', 'מסמנת')} כלא רלוונטי. מה חסר, ${g('מוסיף', 'מוסיפה')}.`} aside=${aside}>
    <div class="mb-5 flex flex-wrap items-center gap-2" aria-label="ארבע העדשות">
      ${Object.entries(LENSES).map(([id, L]) => html`<span key=${id} class=${cx('inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold', count(id) ? 'bg-white text-ink ring-1 ring-line' : 'bg-warn-50 text-warn')}><${Icon} name=${L.icon} size=${14} />${L.label}<span class="tabular-nums opacity-70">${count(id)}</span></span>`)}
    </div>
    <ol class="relative flex flex-col">
      ${ROAD.map(([at, label], gi) => {
        const rows = s.problems.filter((p) => p.at === at);
        if (!rows.length) return null;
        return html`<li key=${at} class="relative ps-0 pb-5 last:pb-0">
          <p class="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-brand-600"><span class="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-[12px] text-white">${gi + 1}</span>${label}</p>
          <ul class="flex flex-col gap-2 border-s-2 border-dashed border-brand-200 ps-4 ms-3">
            ${rows.map((p) => html`<li key=${p.id} class=${cx('fb-panel flex items-start gap-3 !p-3 transition', !p.on && 'opacity-55')}>
              <button type="button" role="checkbox" aria-checked=${p.on} aria-label=${p.on ? 'לסמן כלא רלוונטי' : 'להחזיר לרשימה'} onClick=${() => toggle(p.id)} class=${cx('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 cursor-pointer', p.on ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white')}>${p.on && html`<${Icon} name="check" size=${14} strokeWidth=${3} />`}</button>
              <div class="min-w-0 flex-1">
                <p class=${cx('text-[16px] font-semibold leading-snug', !p.on && 'line-through')}>"${p.text}"</p>
                <p class="mt-1 flex items-start gap-1.5 text-[15px] text-brand-600"><${Icon} name="corner-down-left" size=${15} class="mt-0.5 shrink-0" />
                  <${InlineEdit} value=${p.how} placeholder="איך ל..." onSave=${(v) => setHow(p.id, v)} class="!text-brand-600" />
                </p>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-1">
                <${LensTag} lens=${p.lens} small />
                ${p.from && html`<span class="text-[12px] font-semibold text-muted">${p.from}</span>`}
                ${p.mine && html`<span class="text-[12px] font-semibold text-muted">${g('הוספת', 'הוספת')}</span>`}
              </div>
            </li>`)}
          </ul>
        </li>`;
      })}
    </ol>
    <div class="fb-panel mt-6 !p-4">
      <p class="mb-2 text-[15px] font-bold">בעיה שחסרה, או משהו ששמעת בשיחה</p>
      <div class="flex gap-2 max-sm:flex-col">
        <input class=${inputCls} placeholder='למשל: "צריך להתייעץ עם השותף"' value=${text} onInput=${(e) => setText(e.target.value)} onKeyDown=${(e) => e.key === 'Enter' && (e.preventDefault(), e.stopPropagation(), add())} aria-label="בעיה חדשה" />
        <${Button} variant="mini" class="shrink-0" onClick=${add} disabled=${!text.trim() || adding}>${adding ? 'כותב...' : 'להוסיף'}<//>
      </div>
      <div class="mt-2.5 flex flex-wrap items-center gap-1.5"><span class="me-1 text-[13px] text-muted">מה זה בעצם?</span>
        ${Object.entries(LENSES).map(([id, L]) => html`<button key=${id} type="button" onClick=${() => setLens(id)} class=${cx('h-8 rounded-full border-[1.5px] px-3 text-[13px] font-bold cursor-pointer', lens === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white')}>${L.label}</button>`)}
      </div>
    </div>
    ${missingLens && html`<${SharkTip} tone="warn" class="mt-4">אין אף בעיה של "${LENSES[missingLens].label}". שווה לחשוב: מה מזה יכול לעצור אותו?<//>`}
  <//>`;
}

// ---------- part 3a: the 2×2, what stays in the offer ----------
// Columns: what it costs you (cheap on the right, RTL). Rows: what it is worth to the client.
const QUADS = [
  { cost: 'low', value: 'high', title: 'משאירים קודם', sub: 'זול לך, שווה לו הרבה', keep: true },
  { cost: 'high', value: 'high', title: 'משאירים בזהירות', sub: 'יקר לך, שווה לו הרבה', keep: true },
  { cost: 'low', value: 'low', title: 'מוציאים', sub: 'זול לך, שווה לו מעט' },
  { cost: 'high', value: 'low', title: 'מוציאים ראשון', sub: 'יקר לך, שווה לו מעט' },
];
export function MatrixScreen({ s, set, aside }) {
  const flip = (id) => set((x) => ({ ...x, ideas: x.ideas.map((d) => (d.id === id ? { ...d, in: !d.in } : d)) }));
  const pText = (pid) => s.problems.find((p) => p.id === pid)?.text;
  return html`<${Screen} wide title=${['מה ', 'נכנס', ' להצעה?']} sub="לכל בעיה חשבנו איך לפתור אותה. נשאר מה ששווה ללקוח יותר ממה שעולה לך.">
    <div class="mb-3 hidden grid-cols-2 gap-4 text-center text-[13px] font-bold text-muted md:grid" aria-hidden="true"><span>זול לך</span><span>יקר לך</span></div>
    <div class="grid gap-4 md:grid-cols-2">
      ${QUADS.map((q) => {
        const items = s.ideas.filter((d) => d.cost === q.cost && d.value === q.value);
        return html`<section key=${q.title} class=${cx('rounded-2xl p-3.5', q.keep ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-canvas ring-1 ring-line')}>
          <header class="mb-2.5 flex items-baseline justify-between gap-2">
            <b class=${cx('font-display text-[17px]', q.keep ? 'text-brand-900' : 'text-muted')}>${q.title}</b>
            <span class="text-[13px] text-muted">${q.sub}</span>
          </header>
          <ul class="flex flex-col gap-2">
            ${items.length === 0 && html`<li class="py-3 text-center text-[14px] text-faint">אין כאן כלום</li>`}
            ${items.map((d) => html`<li key=${d.id} class=${cx('rounded-xl bg-white p-3 ring-1 transition', d.in ? 'ring-line' : 'opacity-70 ring-transparent')}>
              <div class="flex items-start gap-2">
                <div class="min-w-0 flex-1">
                  <p class=${cx('text-[15px] font-semibold leading-snug', !d.in && 'line-through decoration-faint')}>${d.text}</p>
                  <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <${ModeTag} mode=${d.mode} />
                    ${d.win && html`<span class="inline-flex h-6 items-center gap-1 rounded-full bg-gold/20 px-2 text-[12px] font-bold text-ink"><${Icon} name="zap" size=${12} />ניצחון ראשון</span>`}
                  </div>
                  <p class="mt-1.5 text-[13px] text-muted">פותר: ${d.solves.map((p) => `"${pText(p)}"`).join(' · ')}</p>
                  ${!q.keep && d.why && html`<p class="mt-1 text-[13px] font-semibold text-ink-2">${d.why}</p>`}
                </div>
                <button type="button" onClick=${() => flip(d.id)} class=${cx('shrink-0 rounded-lg px-2.5 py-1 text-[13px] font-bold cursor-pointer', d.in ? 'text-muted hover:bg-canvas hover:text-ink' : 'bg-brand-100 text-brand-600 hover:bg-brand-200')}>${d.in ? 'להוציא' : 'להחזיר'}</button>
              </div>
            </li>`)}
          </ul>
        </section>`;
      })}
    </div>
    <p class="mt-4 flex items-center gap-1.5 text-[14px] text-muted"><${Icon} name="info" size=${15} />"עושים בשבילו" שווה ללקוח יותר מ"הוא לבד", כי זה מוריד ממנו מאמץ.</p>
  <//>`;
}

// ---------- part 3b: the named components ----------
export function ComponentsScreen({ s, set, aside }) {
  const comps = activeComps(s);
  const setC = (id, p) => set((x) => ({ ...x, comps: x.comps.map((c) => (c.id === id ? { ...c, ...p } : c)) }));
  const pText = (pid) => s.problems.find((p) => p.id === pid)?.text;
  const lost = loose(s);
  const addTo = (ideaId, compId) => set((x) => ({ ...x, comps: x.comps.map((c) => (c.id === compId ? { ...c, ideas: [...c.ideas, ideaId] } : c)) }));
  return html`<${Screen} title=${['ארזנו את זה ל', `${comps.length} רכיבים`, '']} sub="לכל רכיב שם שמבטיח תוצאה, וערך בשקלים עם הסבר מאיפה הוא. אפשר לשנות הכול." aside=${aside}>
    <div class="flex flex-col gap-3">
      ${comps.map((c, i) => {
        const ideas = ideasOf(s, c);
        const solves = [...new Set(ideas.flatMap((d) => d.solves))];
        return html`<article key=${c.id} class="fb-panel !p-4">
          <div class="flex items-start gap-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-[16px] font-black text-brand-600">${i + 1}</span>
            <div class="min-w-0 flex-1">
              <h3 class="font-display text-[19px] font-bold leading-tight"><${InlineEdit} value=${c.name} onSave=${(v) => setC(c.id, { name: v })} placeholder="שם לרכיב" /></h3>
              <p class="text-[15px] text-ink-2"><${InlineEdit} value=${c.promise} onSave=${(v) => setC(c.id, { promise: v })} placeholder="מה הוא מבטיח" /></p>
              <ul class="mt-2 flex flex-col gap-1 text-[14px]">
                ${ideas.map((d) => html`<li key=${d.id} class="flex items-center gap-2"><${Icon} name="dot" size=${16} class="text-brand-600" />${d.text}</li>`)}
              </ul>
              <p class="mt-1.5 text-[13px] text-muted">פותר: ${solves.map((p) => `"${pText(p)}"`).join(' · ')}</p>
            </div>
            <div class="shrink-0 text-end">
              <${MoneyEdit} value=${c.value} onSave=${(v) => setC(c.id, { value: v })} />
              <p class="text-[12px] text-muted">ערך ללקוח</p>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-2.5 text-[13px]">
            <select class="h-8 rounded-lg border border-line bg-white px-2 text-[13px] font-bold" value=${c.basis} onChange=${(e) => setC(c.id, { basis: e.target.value })} aria-label="על מה הערך מבוסס">
              ${Object.entries(BASIS).map(([k, l]) => html`<option value=${k}>${l}</option>`)}
            </select>
            <span class="min-w-0 flex-1 text-muted"><${InlineEdit} value=${c.note} onSave=${(v) => setC(c.id, { note: v })} placeholder="מאיפה המספר? בלי הסבר, הערך לא נספר כמוסבר" /></span>
          </div>
        </article>`;
      })}
    </div>
    ${lost.length > 0 && html`<div class="mt-4 rounded-2xl bg-warn-50 p-4">
      <p class="mb-2 text-[15px] font-bold text-warn">החזרת להצעה, ועוד לא ארוז ברכיב:</p>
      ${lost.map((d) => html`<div key=${d.id} class="flex flex-wrap items-center gap-2 py-1 text-[15px]"><span class="min-w-0 flex-1">${d.text}</span>
        <select class="h-9 rounded-lg border border-line bg-white px-2 text-[14px]" onChange=${(e) => e.target.value && addTo(d.id, e.target.value)} aria-label="לאיזה רכיב">
          <option value="">להוסיף לרכיב...</option>${comps.map((c) => html`<option value=${c.id}>${c.name}</option>`)}
        </select></div>`)}
    </div>`}
    <div class="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-line"><span class="text-[15px] font-bold">ערך הרכיבים</span><b class="font-display text-[22px] tabular-nums text-money">${fmt(compsTotal(s))}</b></div>
  <//>`;
}

export const openCount = (s) => openObstacles(s).length;
export { covered };
