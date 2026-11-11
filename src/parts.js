// Parts 1-3 of step 8: the outcome, what stops the client, what is included.
// One question per screen, one short instruction, and only what is needed to answer it.
import { html, useState, Icon, cx } from './lib.js';
import { InlineEdit, Button } from './components.js';
import { inputCls } from './ui.js';
import { Screen, MoneyEdit } from './kit.js';
import { OUTCOMES, TIMES, LENSES, BASIS, GENDER, g } from './data.js';
import { activeComps, ideasOf, loose, compsTotal, covered, openObstacles, fmt } from './calc.js';

const pickF = (o, k) => (GENDER === 'f' && o[`${k}F`]) || o[k];
const Radio = ({ on }) => html`<span class=${cx('mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition', on ? 'border-brand-600' : 'border-line')}>${on && html`<span class="h-2.5 w-2.5 rounded-full bg-brand-600"></span>`}</span>`;
const MoreLink = ({ onClick, busy, children }) => html`<button type="button" onClick=${onClick} disabled=${busy} class="mt-4 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-600 hover:underline cursor-pointer disabled:text-muted"><${Icon} name="sparkles" size=${16} />${busy ? 'הכריש כותב...' : children}</button>`;

// ---------- part 1: where the client gets to ----------
export function OutcomeScreen({ s, set, aside, onMore, busy }) {
  const o = s.outcome;
  const [editing, setEditing] = useState(false);
  const pick = (opt) => {
    setEditing(false);
    set((x) => ({ ...x, outcome: { id: opt.id, text: pickF(opt, 'text'), time: opt.time, status: pickF(opt, 'status'), byShark: true } }));
  };
  const edit = (p) => set((x) => ({ ...x, outcome: { ...x.outcome, ...p, byShark: false } }));
  const options = s.altOutcomes || OUTCOMES;
  return html`<${Screen} title=${['לאן הלקוח ', 'מגיע', '?']} sub=${g('בחר את היעד שהלקוח בעצם קונה.', 'בחרי את היעד שהלקוח בעצם קונה.')} aside=${aside}>
    <div class="flex flex-col gap-3" role="radiogroup" aria-label="התוצאה">
      ${options.map((opt) => {
        const on = o.id === opt.id;
        return html`<div key=${opt.id} class=${cx('rounded-2xl border-[1.5px] bg-white transition', on ? 'border-brand-600 ring-4 ring-brand-100' : 'border-line hover:border-brand-300')}>
          <button type="button" role="radio" aria-checked=${on} onClick=${() => !on && pick(opt)} class="flex w-full items-start gap-3 p-4 text-start cursor-pointer">
            <${Radio} on=${on} />
            <span class="min-w-0 flex-1">
              <b class="block font-display text-[19px] leading-snug">${on ? o.text : pickF(opt, 'text')}</b>
              <span class="mt-2 inline-flex h-7 items-center gap-1 rounded-full bg-brand-50 px-2.5 text-[13px] font-bold text-brand-600"><${Icon} name="clock" size=${13} />תוך ${on ? o.time : opt.time}</span>
            </span>
          </button>
          ${on && !editing && html`<div class="flex items-center justify-between gap-3 px-4 pb-3 ps-12">
            ${opt.risky ? html`<span class="text-[13px] font-semibold text-warn">מספר מדויק: רק אם ${g('אתה יכול', 'את יכולה')} לעמוד מאחוריו</span>` : html`<span></span>`}
            <button type="button" onClick=${() => setEditing(true)} class="inline-flex items-center gap-1 text-[14px] font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="pencil" size=${14} />לערוך</button>
          </div>`}
          ${on && editing && html`<div class="rise border-t border-line p-4 ps-12">
            <textarea rows="2" class=${cx(inputCls, '!h-auto py-2 leading-snug')} value=${o.text} onInput=${(e) => edit({ text: e.target.value })} aria-label="התוצאה"></textarea>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              ${TIMES.map((t) => html`<button key=${t} type="button" onClick=${() => edit({ time: t })} class=${cx('h-9 rounded-xl border-[1.5px] px-3 text-[14px] font-bold cursor-pointer', o.time === t ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white hover:border-brand-300')}>${t}</button>`)}
              <${Button} variant="mini" class="ms-auto" onClick=${() => setEditing(false)}>סיום<//>
            </div>
          </div>`}
        </div>`;
      })}
    </div>
    <${MoreLink} onClick=${onMore} busy=${busy}>ניסוחים אחרים<//>
  <//>`;
}

// ---------- part 2: what will stop the client on the way ----------
export function ProblemsScreen({ s, set, aside, onAdd, adding }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [lens, setLens] = useState('work');
  const toggle = (id) => set((x) => ({ ...x, problems: x.problems.map((p) => (p.id === id ? { ...p, on: !p.on } : p)) }));
  const add = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), lens);
    setText('');
    setOpen(false);
  };
  return html`<${Screen} title=${['מה ', 'יעצור אותו', ' בדרך?']} sub=${g('אלה הדברים שהלקוח שלך אומר לעצמו. הורד את מה שלא נכון אצלך.', 'אלה הדברים שהלקוח שלך אומר לעצמו. הורידי את מה שלא נכון אצלך.')} aside=${aside}>
    <div class="grid gap-2 sm:grid-cols-2">
      ${s.problems.map((p) => html`<button key=${p.id} type="button" role="checkbox" aria-checked=${p.on} onClick=${() => toggle(p.id)} class=${cx('group flex items-start gap-2.5 rounded-2xl border-[1.5px] p-3.5 text-start transition cursor-pointer', p.on ? 'border-line bg-white hover:border-brand-300' : 'border-dashed border-line bg-transparent')}>
        <span class=${cx('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md transition', p.on ? 'bg-brand-600 text-white' : 'bg-white text-faint ring-1 ring-line')}><${Icon} name=${p.on ? 'check' : 'plus'} size=${13} strokeWidth=${3} /></span>
        <span class=${cx('text-[16px] font-semibold leading-snug', !p.on && 'text-faint line-through')}>"${p.text}"</span>
      </button>`)}
    </div>
    ${!open
      ? html`<button type="button" onClick=${() => setOpen(true)} disabled=${adding} class="mt-3 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="plus" size=${16} />${adding ? 'מוסיף...' : 'בעיה שחסרה'}</button>`
      : html`<div class="rise mt-3 rounded-2xl bg-white p-3.5 ring-1 ring-brand-200">
          <div class="flex gap-2 max-sm:flex-col">
            <input class=${inputCls} autofocus placeholder='למשל: "צריך להתייעץ עם השותף"' value=${text} onInput=${(e) => setText(e.target.value)} onKeyDown=${(e) => e.key === 'Enter' && (e.preventDefault(), e.stopPropagation(), add())} aria-label="בעיה חדשה" />
            <${Button} variant="mini" class="shrink-0" onClick=${add} disabled=${!text.trim()}>להוסיף<//>
          </div>
          <div class="mt-2.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label="מה זה בעצם">
            ${Object.entries(LENSES).map(([id, L]) => html`<button key=${id} type="button" role="radio" aria-checked=${lens === id} onClick=${() => setLens(id)} class=${cx('h-8 rounded-full border-[1.5px] px-3 text-[13px] font-bold cursor-pointer', lens === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-line bg-white')}>${L.label}</button>`)}
          </div>
        </div>`}
  <//>`;
}

// ---------- part 3a: the 2×2, what stays in the offer ----------
// Top row stays in (worth a lot to the client), bottom row goes out. Cheap for you on the right (RTL).
const QUADS = [
  { cost: 'low', value: 'high', title: 'זול לך, שווה לו הרבה', keep: true },
  { cost: 'high', value: 'high', title: 'יקר לך, שווה לו הרבה', keep: true },
  { cost: 'low', value: 'low', title: 'זול לך, שווה לו מעט' },
  { cost: 'high', value: 'low', title: 'יקר לך, שווה לו מעט' },
];
export function MatrixScreen({ s, set, aside }) {
  const flip = (id) => set((x) => ({ ...x, ideas: x.ideas.map((d) => (d.id === id ? { ...d, in: !d.in } : d)) }));
  return html`<${Screen} title=${['מה ', 'נכנס', ' להצעה?']} sub="הכריש מיין את מה שאפשר לתת. למעלה בפנים, למטה בחוץ. לחיצה מזיזה." aside=${aside}>
    <div class="grid gap-3 md:grid-cols-2">
      ${QUADS.map((q) => {
        const items = s.ideas.filter((d) => d.cost === q.cost && d.value === q.value);
        return html`<section key=${q.title} class=${cx('rounded-2xl p-3', q.keep ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-canvas ring-1 ring-line')}>
          <p class=${cx('mb-2 flex items-center gap-1.5 text-[13px] font-bold', q.keep ? 'text-brand-600' : 'text-muted')}><${Icon} name=${q.keep ? 'circle-check' : 'circle-minus'} size=${14} />${q.title}</p>
          <div class="flex flex-col gap-1.5">
            ${items.map((d) => html`<button key=${d.id} type="button" role="switch" aria-checked=${d.in} onClick=${() => flip(d.id)} title=${d.in ? 'להוציא' : 'להכניס'} class=${cx('flex items-center gap-2 rounded-xl px-3 py-2.5 text-start text-[15px] font-semibold leading-snug transition cursor-pointer', d.in ? 'bg-white text-ink shadow-sm ring-1 ring-line hover:ring-brand-300' : 'text-faint line-through decoration-faint hover:bg-white/60')}>
              <span class="min-w-0 flex-1">${d.text}</span>
              ${d.win && d.in && html`<span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/25 px-2 py-0.5 text-[12px] font-bold text-ink no-underline"><${Icon} name="zap" size=${12} />ניצחון ראשון</span>`}
            </button>`)}
          </div>
        </section>`;
      })}
    </div>
  <//>`;
}

// ---------- part 3b: the named components ----------
export function ComponentsScreen({ s, set, aside }) {
  const [open, setOpen] = useState(null);
  const comps = activeComps(s);
  const setC = (id, p) => set((x) => ({ ...x, comps: x.comps.map((c) => (c.id === id ? { ...c, ...p } : c)) }));
  const lost = loose(s);
  const addTo = (ideaId, compId) => set((x) => ({ ...x, comps: x.comps.map((c) => (c.id === compId ? { ...c, ideas: [...c.ideas, ideaId] } : c)) }));
  return html`<${Screen} title=${['ארזנו את זה ל', `${comps.length} רכיבים`, '']} sub="לכל רכיב שם שמבטיח תוצאה, ושווי ללקוח. לחיצה פותחת לעריכה." aside=${aside}>
    <div class="flex flex-col gap-2">
      ${comps.map((c, i) => {
        const isOpen = open === c.id;
        return html`<article key=${c.id} class=${cx('rounded-2xl border-[1.5px] bg-white transition', isOpen ? 'border-brand-600' : 'border-line hover:border-brand-300')}>
          <button type="button" onClick=${() => setOpen(isOpen ? null : c.id)} aria-expanded=${isOpen} class="flex w-full items-center gap-3 p-3.5 text-start cursor-pointer">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-[15px] font-black text-brand-600">${i + 1}</span>
            <span class="min-w-0 flex-1"><b class="block font-display text-[17px] leading-tight">${c.name}</b><span class="block truncate text-[14px] text-muted">${c.promise}</span></span>
            <b class="shrink-0 font-display text-[16px] tabular-nums">${fmt(c.value)}</b>
            <${Icon} name="chevron-down" size=${16} class=${cx('shrink-0 text-muted transition', isOpen && 'rotate-180')} />
          </button>
          ${isOpen && html`<div class="rise border-t border-line px-4 pb-4 pt-3 text-[15px]">
            <p class="text-[13px] font-bold text-muted">שם</p>
            <p class="font-display text-[17px] font-bold"><${InlineEdit} value=${c.name} onSave=${(v) => setC(c.id, { name: v })} placeholder="שם לרכיב" /></p>
            <p class="mt-2 text-[13px] font-bold text-muted">מה הוא מבטיח</p>
            <p><${InlineEdit} value=${c.promise} onSave=${(v) => setC(c.id, { promise: v })} placeholder="מה הוא מבטיח" /></p>
            <p class="mt-2 text-[13px] font-bold text-muted">מה בפנים</p>
            <ul class="list-disc ps-5 text-[14px]">${ideasOf(s, c).map((d) => html`<li key=${d.id}>${d.text}</li>`)}</ul>
            <div class="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-canvas p-2.5 text-[14px]">
              <span class="font-bold">שווי</span><${MoneyEdit} value=${c.value} onSave=${(v) => setC(c.id, { value: v })} />
              <select class="h-8 rounded-lg border border-line bg-white px-2 text-[13px] font-bold" value=${c.basis} onChange=${(e) => setC(c.id, { basis: e.target.value })} aria-label="על מה השווי מבוסס">
                ${Object.entries(BASIS).map(([k, l]) => html`<option value=${k}>${l}</option>`)}
              </select>
              <span class="min-w-0 basis-full text-muted"><${InlineEdit} value=${c.note} onSave=${(v) => setC(c.id, { note: v })} placeholder="מאיפה המספר?" /></span>
            </div>
          </div>`}
        </article>`;
      })}
    </div>
    ${lost.length > 0 && html`<div class="mt-3 rounded-2xl bg-warn-50 p-3.5">
      ${lost.map((d) => html`<div key=${d.id} class="flex flex-wrap items-center gap-2 text-[15px]"><span class="min-w-0 flex-1">${d.text}</span>
        <select class="h-9 rounded-lg border border-line bg-white px-2 text-[14px]" onChange=${(e) => e.target.value && addTo(d.id, e.target.value)} aria-label="לאיזה רכיב">
          <option value="">לאיזה רכיב?</option>${comps.map((c) => html`<option value=${c.id}>${c.name}</option>`)}
        </select></div>`)}
    </div>`}
    <div class="mt-3 flex items-center justify-between px-4 py-2"><span class="text-[15px] font-bold text-muted">שווי כולל</span><b class="font-display text-[22px] tabular-nums text-money">${fmt(compsTotal(s))}</b></div>
  <//>`;
}

export const openCount = (s) => openObstacles(s).length;
export { covered };
