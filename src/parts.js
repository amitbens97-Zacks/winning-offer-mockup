// Parts 1-3 of step 8: the outcome, what stops the client, what is included.
// One question per screen, one short instruction, and only what is needed to answer it.
import { html, useState, Icon, cx } from './lib.js';
import { InlineEdit, Button } from './components.js';
import { inputCls } from './ui.js';
import { Screen, MoneyEdit, From } from './kit.js';
import { OUTCOMES, TIMES, LENSES, BASIS, CLIENT_FILE, GENDER, g } from './data.js';
import { activeComps, ideasOf, loose, compsTotal, covered, openObstacles, fmt, todayText } from './calc.js';

const pickF = (o, k) => (GENDER === 'f' && o[`${k}F`]) || o[k];
const Radio = ({ on }) => html`<span class=${cx('mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition', on ? 'border-brand-600' : 'border-line')}>${on && html`<span class="h-2.5 w-2.5 rounded-full bg-brand-600"></span>`}</span>`;
const MoreLink = ({ onClick, busy, children }) => html`<button type="button" onClick=${onClick} disabled=${busy} class="mt-4 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-600 hover:underline cursor-pointer disabled:text-muted"><${Icon} name="sparkles" size=${16} />${busy ? 'הכריש כותב...' : children}</button>`;

// ---------- part 1: where the client gets to ----------
// A before → after picture on top: today (the pain from the client file) and the end
// (the chosen outcome, with what it looks like). Below it, the shark's three outcomes to pick from.
export function OutcomeScreen({ s, set, aside, onMore, busy }) {
  const o = s.outcome;
  const [editing, setEditing] = useState(false);
  const [editToday, setEditToday] = useState(false);
  const today = todayText(s);
  const todayEdited = today !== CLIENT_FILE.pain;
  const pick = (opt) => {
    setEditing(false);
    set((x) => ({ ...x, outcome: { id: opt.id, text: pickF(opt, 'text'), time: opt.time, status: pickF(opt, 'status'), byShark: true } }));
  };
  const edit = (p) => set((x) => ({ ...x, outcome: { ...x.outcome, ...p, byShark: false } }));
  const options = s.altOutcomes || OUTCOMES;
  const chosen = options.find((x) => x.id === o.id);
  return html`<${Screen} title=${['מה הלקוח ', 'מרוויח', ' בסוף?']} sub=${g('בחר את התוצאה שבשבילה הוא קונה, לא את הדרך: מה ישתנה אצלו.', 'בחרי את התוצאה שבשבילה הוא קונה, לא את הדרך: מה ישתנה אצלו.')} aside=${aside}>
    <!-- Before → after -->
    <section class="grid overflow-hidden rounded-3xl bg-white shadow-[0_12px_32px_-16px_rgba(0,56,184,.35)] ring-1 ring-line md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
      <div class="relative flex flex-col gap-2 bg-canvas p-5 md:p-6">
        <p class="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted"><${Icon} name="cloud-drizzle" size=${16} />היום אצל הלקוח</p>
        ${editToday
          ? html`<div class="rise">
              <textarea rows="3" class=${cx(inputCls, '!h-auto bg-white py-2 text-[16px] font-semibold leading-snug')} value=${today} onInput=${(e) => set((x) => ({ ...x, today: e.target.value }))} aria-label="היום אצל הלקוח"></textarea>
              <button type="button" onClick=${() => (!today.trim() && set((x) => ({ ...x, today: CLIENT_FILE.pain })), setEditToday(false))} class="mt-2 inline-flex h-9 items-center gap-1 rounded-xl bg-brand-600 px-3 text-[14px] font-bold text-white cursor-pointer"><${Icon} name="check" size=${15} />סיום</button>
            </div>`
          : html`<p class="text-[16px] font-semibold leading-snug text-ink-2">${today}</p>
            <p class="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[13px] text-muted">
              <span class="inline-flex items-center gap-1"><${Icon} name="file-user" size=${14} />${todayEdited ? 'ערכת להצעה הזאת' : 'ממה שכתבת בצייד הלקוחות'}</span>
              <button type="button" onClick=${() => setEditToday(true)} class="inline-flex items-center gap-1 font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="pencil" size=${13} />לערוך</button>
              ${todayEdited && html`<button type="button" onClick=${() => set((x) => ({ ...x, today: CLIENT_FILE.pain }))} class="font-bold text-muted hover:text-ink hover:underline cursor-pointer">להחזיר את המקור</button>`}
            </p>`}
        <span aria-hidden="true" class="absolute z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-brand-600 shadow ring-1 ring-line max-md:-bottom-[18px] max-md:left-1/2 max-md:-translate-x-1/2 md:-end-[18px] md:top-1/2 md:-translate-y-1/2"><${Icon} name="arrow-left" size=${18} class="max-md:-rotate-90" /></span>
      </div>
      <div class="relative bg-brand-600 p-5 pt-7 text-white md:p-6 md:ps-9">
        <span aria-hidden="true" class="pointer-events-none absolute -bottom-12 -end-12 h-40 w-40 rounded-full bg-white/10"></span>
        <div class="relative flex items-center justify-between gap-2">
          <p class="inline-flex items-center gap-1.5 text-[13px] font-bold text-white/80"><${Icon} name="sun" size=${16} />בסוף</p>
          <span class="inline-flex h-7 items-center gap-1 rounded-full bg-white/15 px-2.5 text-[13px] font-bold"><${Icon} name="clock" size=${13} />תוך ${o.time}</span>
        </div>
        ${editing
          ? html`<div class="rise relative mt-3">
              <textarea rows="2" class=${cx(inputCls, '!h-auto py-2 text-[17px] font-semibold leading-snug !text-ink')} value=${o.text} onInput=${(e) => edit({ text: e.target.value })} aria-label="התוצאה"></textarea>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                ${TIMES.map((t) => html`<button key=${t} type="button" onClick=${() => edit({ time: t })} class=${cx('h-9 rounded-xl px-3 text-[14px] font-bold transition cursor-pointer', o.time === t ? 'bg-white text-brand-600' : 'bg-white/15 text-white hover:bg-white/25')}>${t}</button>`)}
                <button type="button" onClick=${() => setEditing(false)} class="ms-auto inline-flex h-9 items-center gap-1 rounded-xl bg-white px-3 text-[14px] font-bold text-brand-600 cursor-pointer"><${Icon} name="check" size=${15} />סיום</button>
              </div>
            </div>`
          : html`<div key=${o.id + o.text} class="rise relative">
              <p class="mt-2 font-display text-[22px] font-black leading-tight md:text-[26px]">${o.text}</p>
              ${o.status && html`<p class="mt-2 text-[15px] text-white/85">“${o.status}”</p>`}
              <button type="button" onClick=${() => setEditing(true)} class="mt-3 inline-flex items-center gap-1 rounded-lg px-1 text-[14px] font-bold text-white/90 underline-offset-4 hover:underline cursor-pointer"><${Icon} name="pencil" size=${14} />לערוך את הניסוח</button>
            </div>`}
      </div>
    </section>
    ${chosen?.risky && html`<p class="mt-3 flex items-center gap-1.5 text-[14px] font-semibold text-warn"><${Icon} name="triangle-alert" size=${15} />מספר מדויק: רק אם ${g('אתה יכול', 'את יכולה')} לעמוד מאחוריו</p>`}

    <!-- The shark's three outcomes -->
    <p class="mb-2 mt-7 text-[14px] font-bold text-muted">הכריש הציע שלוש תוצאות. ${g('בחר', 'בחרי')} אחת:</p>
    <div class="grid gap-2.5 md:grid-cols-3" role="radiogroup" aria-label="התוצאה">
      ${options.map((opt) => {
        const on = o.id === opt.id;
        return html`<button key=${opt.id} type="button" role="radio" aria-checked=${on} onClick=${() => !on && pick(opt)} class=${cx('group relative flex flex-col items-start gap-2 rounded-2xl border-[1.5px] p-4 text-start transition cursor-pointer', on ? 'border-brand-600 bg-brand-50 ring-4 ring-brand-100' : 'border-line bg-white hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm')}>
          <span class=${cx('grid h-6 w-6 place-items-center rounded-full transition', on ? 'bg-brand-600 text-white' : 'bg-canvas text-transparent ring-1 ring-line group-hover:text-brand-300')}><${Icon} name="check" size=${14} /></span>
          <b class="font-display text-[16px] leading-snug">${on ? o.text : pickF(opt, 'text')}</b>
          <span class="mt-auto flex flex-wrap gap-1.5">
            <span class="inline-flex h-6 items-center gap-1 rounded-full bg-white px-2 text-[12px] font-bold text-brand-600 ring-1 ring-brand-200"><${Icon} name="clock" size=${12} />תוך ${on ? o.time : opt.time}</span>
            ${opt.risky && html`<span class="inline-flex h-6 items-center rounded-full bg-warn-50 px-2 text-[12px] font-bold text-warn">מספר מדויק</span>`}
          </span>
        </button>`;
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
  // Two moments where a sentence like this stops him: before he buys (he says no) and on the way (he gives up).
  const groups = [
    { id: 'buy', icon: 'circle-x', title: 'לפני שהוא קונה', sub: 'מה יגרום לו להגיד "לא, תודה"', list: s.problems.filter((p) => p.at === 'before') },
    { id: 'way', icon: 'log-out', title: 'באמצע הדרך', sub: 'מה יגרום לו להתייאש ולוותר', list: s.problems.filter((p) => p.at !== 'before') },
  ];
  return html`<${Screen} title=${['מה ', 'יעצור אותו', ' בדרך?']} sub=${g('אלה משפטים שהלקוח אומר לעצמו. כל אחד מהם יכול לגרום לו לא לקנות, או לוותר באמצע. ההצעה שנבנה תענה על כל משפט שתשאיר כאן.', 'אלה משפטים שהלקוח אומר לעצמו. כל אחד מהם יכול לגרום לו לא לקנות, או לוותר באמצע. ההצעה שנבנה תענה על כל משפט שתשאירי כאן.')} aside=${aside}>
    <p class="-mt-3 mb-5 flex flex-wrap items-center gap-2 text-[14px] text-muted"><${From}>מתוך צייד הלקוחות<//>הכריש כתב אותם ממה שסיפרת על הלקוח. מה שלא נכון אצלך, מורידים בלחיצה.</p>
    <div class="flex flex-col gap-5">
      ${groups.map((gr) => html`<section key=${gr.id}>
        <h2 class="mb-2 flex items-baseline gap-2"><span class="inline-flex items-center gap-1.5 font-display text-[18px] font-bold"><${Icon} name=${gr.icon} size=${18} class="self-center text-brand-600" />${gr.title}</span><span class="text-[14px] text-muted">${gr.sub}</span></h2>
        <div class="grid gap-2 sm:grid-cols-2">
          ${gr.list.map((p) => html`<button key=${p.id} type="button" role="checkbox" aria-checked=${p.on} onClick=${() => toggle(p.id)} class=${cx('group flex items-start gap-2.5 rounded-2xl rounded-ss-md border-[1.5px] p-3.5 text-start transition cursor-pointer', p.on ? 'border-line bg-white hover:border-brand-300' : 'border-dashed border-line bg-transparent')}>
            <span class=${cx('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md transition', p.on ? 'bg-brand-600 text-white' : 'bg-white text-faint ring-1 ring-line')}><${Icon} name=${p.on ? 'check' : 'plus'} size=${13} strokeWidth=${3} /></span>
            <span class="min-w-0"><span class=${cx('block text-[12px] font-bold', p.on ? 'text-muted' : 'text-faint')}>${p.on ? 'הוא אומר לעצמו:' : 'ירד מהרשימה'}</span><span class=${cx('text-[16px] font-semibold leading-snug', !p.on && 'text-faint line-through')}>"${p.text}"</span></span>
          </button>`)}
        </div>
      </section>`)}
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
// One list: what the offer includes, sorted by importance (worth a lot to him, then easy to give,
// then first win: the 2×2 of the method). The circle takes an item out. "לערוך" opens the text and
// the three tags. Under the list: the user's own item, and "הצעות חדשות מהכריש", three at a time
// (the shark's further ideas, items taken out that are worth a lot, and with the model, new ones).
const weight = (d) => (d.value === 'high' ? 4 : 0) + (d.cost === 'low' ? 2 : 0) + (d.win ? 1 : 0);
const byWeight = (a, b) => weight(b) - weight(a);
const TAGS = [
  ['שווה לו הרבה', 'bg-money-50 text-money ring-1 ring-money/20', 'הלקוח מרגיש את זה'],
  ['קל לך לתת', 'bg-brand-50 text-brand-600 ring-1 ring-brand-200', 'לא דורש ממך הרבה'],
  ['ניצחון ראשון', 'bg-gold/25 text-ink ring-1 ring-gold/40', 'שינוי כבר בימים הראשונים'],
];
const tagCls = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-bold';
function Tags({ d, edit, onEdit }) {
  const list = [
    { on: d.value === 'high', text: d.value === 'high' ? 'שווה לו הרבה' : 'שווה לו מעט', cls: d.value === 'high' ? TAGS[0][1] : 'bg-canvas text-muted ring-1 ring-line', flip: { value: d.value === 'high' ? 'low' : 'high' } },
    { on: d.cost === 'low', text: d.cost === 'low' ? 'קל לך לתת' : 'דורש ממך הרבה', cls: d.cost === 'low' ? TAGS[1][1] : 'bg-canvas text-muted ring-1 ring-line', flip: { cost: d.cost === 'low' ? 'high' : 'low' } },
    { on: !!d.win, text: 'ניצחון ראשון', icon: 'zap', cls: d.win ? TAGS[2][1] : 'border border-dashed border-line text-faint', flip: { win: !d.win }, hideOff: true },
  ];
  return html`<span class="mt-2 flex flex-wrap gap-1.5">${list.map((x) =>
    edit
      ? html`<button key=${x.text} type="button" title="לשנות" onClick=${() => onEdit(x.flip)} class=${cx(tagCls, x.cls, 'cursor-pointer hover:ring-brand-300')}>${x.icon && html`<${Icon} name=${x.icon} size=${12} />`}${x.text}</button>`
      : (x.on || !x.hideOff) && html`<span key=${x.text} class=${cx(tagCls, x.cls)}>${x.icon && html`<${Icon} name=${x.icon} size=${12} />`}${x.text}</span>`,
  )}</span>`;
}
function IdeaCard({ d, s, editing, onEditing, onOut, onEdit, onRemove }) {
  const solves = (d.solves || []).map((id) => s.problems.find((p) => p.id === id && p.on)).filter(Boolean)[0];
  return html`<div class=${cx('rise group flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 transition', editing ? 'ring-brand-300' : 'ring-line')}>
    <button type="button" onClick=${onOut} title="להוציא מההצעה" aria-label="להוציא מההצעה" class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-error cursor-pointer">
      <${Icon} name="check" size=${15} class="group-hover:hidden" /><${Icon} name="minus" size=${15} class="hidden group-hover:block" />
    </button>
    <div class="min-w-0 flex-1">
      ${editing
        ? html`<b class="block text-[15px] leading-snug text-ink"><${InlineEdit} value=${d.text} placeholder="מה נותנים" onSave=${(v) => v.trim() && onEdit({ text: v.trim() })} class="!whitespace-normal" /></b>`
        : html`<b class="block text-[15px] leading-snug text-ink">${d.text}</b>`}
      ${solves && html`<span class="mt-1 block truncate text-[13px] text-muted">עונה על: “${solves.text}”</span>`}
      <${Tags} d=${d} edit=${editing} onEdit=${onEdit} />
    </div>
    <span class="flex shrink-0 items-center gap-0.5">
      ${editing
        ? html`<button type="button" onClick=${() => onEditing(false)} class="inline-flex h-8 items-center gap-1 rounded-lg bg-brand-100 px-2.5 text-[13px] font-bold text-brand-600 cursor-pointer"><${Icon} name="check" size=${14} />סיום</button>`
        : html`<button type="button" onClick=${() => onEditing(true)} class="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] font-bold text-brand-600 hover:bg-brand-50 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 cursor-pointer"><${Icon} name="pencil" size=${14} />לערוך</button>`}
      ${onRemove && editing && html`<button type="button" onClick=${onRemove} title="למחוק" aria-label="למחוק" class="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-error cursor-pointer"><${Icon} name="trash-2" size=${15} /></button>`}
    </span>
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
export function MatrixScreen({ s, set, aside, notify, onMoreIdeas, busy }) {
  const [editing, setEditing] = useState(null);
  const [shown, setShown] = useState([]); // ids of the shark's suggestions on screen
  const edit = (id, p) => set((x) => ({ ...x, ideas: x.ideas.map((d) => (d.id === id ? { ...d, ...p } : d)) }));
  const remove = (id) => set((x) => ({ ...x, ideas: x.ideas.filter((d) => d.id !== id) }));
  const add = (text) => set((x) => ({ ...x, ideas: [...x.ideas, { id: `u${Date.now()}`, text, solves: [], cost: 'low', value: 'high', in: true, own: true }] }));
  const out = (d) => {
    edit(d.id, { in: false });
    setEditing(null);
    notify('הוצא מההצעה', 'circle-minus', () => edit(d.id, { in: true }));
  };
  const inn = s.ideas.filter((d) => d.in).sort(byWeight);
  // The pool: worth a lot to him and not in the offer. What is worth little stays out (the method's cut).
  const pool = s.ideas.filter((d) => !d.in && d.value === 'high' && !shown.includes(d.id)).sort(byWeight);
  const visible = shown.map((id) => s.ideas.find((d) => d.id === id)).filter((d) => d && !d.in);
  const more = async () => {
    if (pool.length) return setShown((v) => [...v.filter((id) => s.ideas.find((d) => d.id === id && !d.in)), ...pool.slice(0, 3).map((d) => d.id)]);
    const fresh = await onMoreIdeas();
    if (fresh?.length) setShown((v) => [...v, ...fresh.map((d) => d.id)]);
  };
  const empty = !pool.length && !visible.length;
  return html`<${Screen} title=${['מה ', 'נכנס', ' להצעה?']} sub=${g('עבור על הרשימה. מה שלא מתאים, מורידים בלחיצה על העיגול.', 'עברי על הרשימה. מה שלא מתאים, מורידים בלחיצה על העיגול.')} aside=${aside}>
    <p class="-mt-3 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted">${TAGS.map(([t, cls, means], i) => html`<span key=${t} class="inline-flex items-center gap-1.5"><span class=${cx(tagCls, cls)}>${i === 2 && html`<${Icon} name="zap" size=${12} />`}${t}</span>${means}</span>`)}</p>
    <section class="rounded-3xl bg-brand-50 p-3 ring-1 ring-brand-200 md:p-4">
      <p class="mb-3 flex items-center gap-2 px-1 font-display text-[16px] font-black text-brand-600"><${Icon} name="circle-check" size=${18} />מה ההצעה כוללת<span class="rounded-full bg-white px-2 py-0.5 text-[13px] tabular-nums ring-1 ring-line">${inn.length}</span></p>
      <div class="flex flex-col gap-2">
        ${inn.length ? inn.map((d) => html`<${IdeaCard} key=${d.id} d=${d} s=${s} editing=${editing === d.id} onEditing=${(on) => setEditing(on ? d.id : null)} onOut=${() => out(d)} onEdit=${(p) => edit(d.id, p)} onRemove=${d.own ? () => remove(d.id) : null} />`) : html`<p class="px-1 py-4 text-center text-[14px] text-muted">עוד לא נכנס כלום</p>`}
        <${AddIdea} onAdd=${add} />
      </div>
    </section>
    ${visible.length > 0 && html`<section class="rise mt-4 rounded-3xl border-[1.5px] border-dashed border-brand-300 bg-white/70 p-3 md:p-4">
      <p class="mb-3 flex items-center gap-2 px-1 font-display text-[16px] font-black"><${Icon} name="sparkles" size=${17} class="text-brand-600" />הכריש מציע</p>
      <div class="flex flex-col gap-2">${visible.map((d) => {
        const solves = (d.solves || []).map((id) => s.problems.find((p) => p.id === id && p.on)).filter(Boolean)[0];
        return html`<div key=${d.id} class="rise flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-line">
          <div class="min-w-0 flex-1">
            <b class="block text-[15px] leading-snug">${d.text}</b>
            ${solves && html`<span class="mt-1 block truncate text-[13px] text-muted">עונה על: “${solves.text}”</span>`}
            <${Tags} d=${d} />
          </div>
          <${Button} variant="mini" class="shrink-0" onClick=${() => edit(d.id, { in: true })}><${Icon} name="plus" size=${15} />להוסיף<//>
        </div>`;
      })}</div>
    </section>`}
    <div class="mt-4"><${Button} variant="secondary" onClick=${more} disabled=${busy}><${Icon} name="sparkles" size=${16} />${busy ? 'הכריש חושב...' : visible.length && !empty ? 'עוד הצעות מהכריש' : 'הצעות חדשות מהכריש'}<//></div>
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
