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
  return html`<${Screen} title=${['מה הלקוח ', 'ישיג', ' בסוף?']} sub=${g('בחר את התוצאה שבשבילה הוא קונה: לא מה תעשה איתו, מה ישתנה אצלו.', 'בחרי את התוצאה שבשבילה הוא קונה: לא מה תעשי איתו, מה ישתנה אצלו.')} aside=${aside}>
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

// ---------- part 3a: what goes into the offer ----------
// Everything the user could give, in two lists: in the offer / left out. The shark's first cut
// keeps what is worth a lot to the client (the 2×2 of the method: worth to him × cost to you).
// Each list is sorted by importance: worth a lot first, then easy to give, then first win.
// The text and both tags can be edited, the user can add items, and a tap on the circle moves one across.
const weight = (d) => (d.value === 'high' ? 4 : 0) + (d.cost === 'low' ? 2 : 0) + (d.win ? 1 : 0);
const byWeight = (a, b) => weight(b) - weight(a);
function IdeaCard({ d, s, onFlip, onEdit, onRemove }) {
  const solves = (d.solves || []).map((id) => s.problems.find((p) => p.id === id && p.on)).filter(Boolean)[0];
  const tag = 'rounded-full px-2 py-0.5 text-[12px] font-bold transition cursor-pointer hover:ring-brand-300';
  return html`<div class=${cx('rise group flex items-start gap-3 rounded-2xl p-3.5 transition', d.in ? 'bg-white shadow-sm ring-1 ring-line' : 'border-[1.5px] border-dashed border-line bg-white/60')}>
    <button type="button" role="switch" aria-checked=${d.in} onClick=${onFlip} title=${d.in ? 'להוציא מההצעה' : 'להכניס להצעה'} aria-label=${d.in ? 'להוציא מההצעה' : 'להכניס להצעה'} class=${cx('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full transition cursor-pointer', d.in ? 'bg-brand-600 text-white hover:bg-error' : 'bg-canvas text-muted ring-1 ring-line hover:bg-brand-600 hover:text-white')}>
      <${Icon} name=${d.in ? 'check' : 'plus'} size=${15} class=${d.in ? 'group-hover:hidden' : ''} />${d.in && html`<${Icon} name="minus" size=${15} class="hidden group-hover:block" />`}
    </button>
    <div class="min-w-0 flex-1">
      <b class=${cx('block text-[15px] leading-snug', d.in ? 'text-ink' : 'text-muted')}><${InlineEdit} value=${d.text} placeholder="מה נותנים" onSave=${(v) => (v.trim() ? onEdit({ text: v.trim() }) : onRemove?.())} class="!whitespace-normal" /></b>
      ${d.in && solves ? html`<span class="mt-1 block truncate text-[13px] text-muted">עונה על: “${solves.text}”</span>` : !d.in && d.why ? html`<span class="mt-1 block text-[13px] text-muted">${d.why}</span>` : null}
      <span class="mt-2 flex flex-wrap gap-1.5">
        <button type="button" title="לשנות" onClick=${() => onEdit({ value: d.value === 'high' ? 'low' : 'high' })} class=${cx(tag, d.value === 'high' ? 'bg-money-50 text-money ring-1 ring-money/20' : 'bg-canvas text-muted ring-1 ring-line')}>${d.value === 'high' ? 'שווה לו הרבה' : 'שווה לו מעט'}</button>
        <button type="button" title="לשנות" onClick=${() => onEdit({ cost: d.cost === 'low' ? 'high' : 'low' })} class=${cx(tag, d.cost === 'low' ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200' : 'bg-canvas text-muted ring-1 ring-line')}>${d.cost === 'low' ? 'קל לך לתת' : 'דורש ממך הרבה'}</button>
        <button type="button" title=${d.win ? 'להוריד' : 'לסמן כניצחון ראשון'} onClick=${() => onEdit({ win: !d.win })} class=${cx(tag, 'items-center gap-1', d.win ? 'inline-flex bg-gold/25 text-ink ring-1 ring-gold/40' : 'hidden border border-dashed border-line text-faint md:group-hover:inline-flex')}><${Icon} name="zap" size=${12} />ניצחון ראשון</button>
      </span>
    </div>
    ${onRemove && html`<button type="button" onClick=${onRemove} title="למחוק" aria-label="למחוק" class="mt-0.5 shrink-0 rounded-md p-1 text-muted hover:bg-canvas hover:text-error md:hidden md:group-hover:block cursor-pointer"><${Icon} name="trash-2" size=${15} /></button>`}
  </div>`;
}
function AddIdea({ onAdd }) {
  const [v, setV] = useState('');
  const add = () => v.trim() && (onAdd(v.trim()), setV(''));
  return html`<form class="mt-1 flex items-center gap-2" onSubmit=${(e) => (e.preventDefault(), add())}>
    <input class=${cx(inputCls, '!h-11 flex-1 bg-white')} placeholder="עוד משהו שאפשר לתת..." value=${v} onInput=${(e) => setV(e.target.value)} aria-label="פריט חדש להצעה" />
    <${Button} variant="secondary" type="submit" disabled=${!v.trim()}><${Icon} name="plus" size=${16} />להוסיף<//>
  </form>`;
}
export function MatrixScreen({ s, set, aside }) {
  const edit = (id, p) => set((x) => ({ ...x, ideas: x.ideas.map((d) => (d.id === id ? { ...d, ...p } : d)) }));
  const remove = (id) => set((x) => ({ ...x, ideas: x.ideas.filter((d) => d.id !== id) }));
  const add = (text) => set((x) => ({ ...x, ideas: [...x.ideas, { id: `u${Date.now()}`, text, solves: [], cost: 'low', value: 'high', in: true, own: true }] }));
  const inn = s.ideas.filter((d) => d.in).sort(byWeight);
  const out = s.ideas.filter((d) => !d.in).sort(byWeight);
  const card = (d) => html`<${IdeaCard} key=${d.id} d=${d} s=${s} onFlip=${() => edit(d.id, { in: !d.in })} onEdit=${(p) => edit(d.id, p)} onRemove=${d.own ? () => remove(d.id) : null} />`;
  const col = (list, head, icon, tone, empty, foot) => html`<section class=${cx('rounded-3xl p-3 md:p-4', tone)}>
    <p class="mb-3 flex items-center gap-2 px-1 font-display text-[16px] font-black"><${Icon} name=${icon} size=${18} />${head}<span class="rounded-full bg-white px-2 py-0.5 text-[13px] tabular-nums ring-1 ring-line">${list.length}</span></p>
    <div class="flex flex-col gap-2">${list.length ? list.map(card) : html`<p class="px-1 py-4 text-center text-[14px] text-muted">${empty}</p>`}${foot}</div>
  </section>`;
  return html`<${Screen} title=${['מה ', 'נכנס', ' להצעה?']} sub="אלה כל הדברים שאפשר לתת ללקוח, מהחשוב ביותר ומטה. העיגול מעביר לצד השני, ואפשר לערוך כל טקסט ותגית או להוסיף משלך." aside=${aside}>
    <div class="grid items-start gap-3 md:grid-cols-[3fr_2fr]">
      ${col(inn, 'בפנים ההצעה', 'circle-check', 'bg-brand-50 text-brand-600 ring-1 ring-brand-200', 'עוד לא נכנס כלום', html`<${AddIdea} onAdd=${add} />`)}
      ${col(out, 'נשאר בחוץ', 'circle-minus', 'bg-canvas text-muted ring-1 ring-line', 'הכול בפנים')}
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
