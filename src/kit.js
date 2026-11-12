// Small pieces shared by the screens of step 8: the screen frame (one question per screen),
// the value meter, the shark's inline tip, tags and a few inputs.
import { html, useState, useEffect, useRef, Icon, cx, PencilCheck } from './lib.js';
import { SharkAvatar } from './components.js';
import { LENSES, PARTNER } from './data.js';
import { fmt, fmtRatio, ratioTone } from './calc.js';

// One screen = one question. The heading is the question, one short line under it,
// then the content. Nothing else competes with it.
export function Screen({ title, sub, children, wide, aside }) {
  return html`<div class=${cx('mx-auto px-4 py-6 md:px-8 md:py-8', aside ? 'max-w-[1180px] xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10' : wide ? 'max-w-[1020px]' : 'max-w-[780px]')}>
    <div class="min-w-0">
      <h1 class="fb-h1 mb-1.5 text-[26px] md:text-[32px]">${title[0]}<span class="fb-marker">${title[1]}</span>${title[2] || ''}</h1>
      ${sub && html`<p class="mb-6 max-w-[62ch] text-[17px] text-muted">${sub}</p>`}
      ${children}
    </div>
    ${aside && html`<aside class="hidden xl:block"><div class="sticky top-6">${aside}</div></aside>`}
  </div>`;
}

// The shark's one tip on a screen, inline, quiet. Never more than one per screen.
export function SharkTip({ children, action, tone, class: cls = '' }) {
  return html`<div class=${cx('flex items-start gap-3 rounded-2xl p-3.5', tone === 'warn' ? 'bg-warn-50' : 'bg-brand-50', cls)}>
    <${SharkAvatar} size=${34} mood=${tone === 'warn' ? 'alert' : 'calm'} />
    <div class="min-w-0 flex-1 text-[15px] leading-relaxed">
      <b class="block text-[13px] text-brand-900">${PARTNER.name}</b>
      ${children}
      ${action && html`<div class="mt-2">${action}</div>`}
    </div>
  </div>`;
}

// Where a prefilled answer came from ("מילאנו לפי...").
export function From({ children }) {
  return html`<span class="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[12px] font-bold text-muted ring-1 ring-line"><${Icon} name="link-2" size=${12} />${children}</span>`;
}

export function LensTag({ lens, small }) {
  const L = LENSES[lens];
  if (!L) return null;
  return html`<span class=${cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white font-bold text-ink-2 ring-1 ring-line', small ? 'h-6 px-2 text-[12px]' : 'h-7 px-2.5 text-[13px]')}><${Icon} name=${L.icon} size=${small ? 12 : 14} class="text-brand-600" />${L.label}</span>`;
}

export const MODE_TONE = { בשבילך: 'bg-brand-600 text-white', איתך: 'bg-brand-100 text-brand-600', לבד: 'bg-canvas text-muted ring-1 ring-line' };
export function ModeTag({ mode }) {
  const label = { בשבילך: 'עושים בשבילו', איתך: 'עושים איתו', לבד: 'הוא לבד' }[mode];
  return html`<span class=${cx('inline-flex h-6 items-center whitespace-nowrap rounded-full px-2 text-[12px] font-bold', MODE_TONE[mode])}>${label}</span>`;
}

// What the client gets vs what they pay: two bars and the ratio, colored by how far apart.
// Green only because this is money (the brand's rule for green).
const TONE = {
  good: { bar: 'bg-money', text: 'text-money', label: 'הערך גדול בהרבה מהמחיר' },
  mid: { bar: 'bg-warn', text: 'text-warn', label: 'גדול מהמחיר, אפשר לחזק' },
  low: { bar: 'bg-error', text: 'text-error', label: 'הערך קרוב מדי למחיר' },
};
export function Meter({ value, price, compact }) {
  const r = price > 0 ? value / price : 0;
  const t = TONE[ratioTone(r)];
  const max = Math.max(value, price, 1);
  return html`<div class=${cx('w-full', compact ? '' : 'fb-panel !p-4')}>
    <div class="mb-2 flex items-baseline justify-between gap-3">
      <span class="text-[14px] font-bold">מה מקבלים מול מה משלמים</span>
      <b class=${cx('font-display text-[22px] tabular-nums', t.text)}>${fmtRatio(r)}</b>
    </div>
    <div class="flex flex-col gap-1.5 text-[13px]">
      <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted">ערך</span><span class="h-3 flex-1 overflow-hidden rounded-full bg-canvas ring-1 ring-line"><span class=${cx('block h-full rounded-full transition-all duration-500', t.bar)} style=${{ width: `${(value / max) * 100}%` }}></span></span><b class="w-[76px] shrink-0 text-end tabular-nums">${fmt(value)}</b></div>
      <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted">מחיר</span><span class="h-3 flex-1 overflow-hidden rounded-full bg-canvas ring-1 ring-line"><span class="block h-full rounded-full bg-ink/70 transition-all duration-500" style=${{ width: `${(price / max) * 100}%` }}></span></span><b class="w-[76px] shrink-0 text-end tabular-nums">${fmt(price)}</b></div>
    </div>
    ${!compact && html`<p class=${cx('mt-2 text-[13px] font-bold', t.text)}>${t.label}</p>`}
  </div>`;
}

// An on/off switch with its label.
export function Switch({ on, onChange, label, sub }) {
  return html`<button type="button" role="switch" aria-checked=${on} onClick=${() => onChange(!on)} class="flex w-full items-center gap-3 text-start cursor-pointer">
    <span class=${cx('relative h-7 w-12 shrink-0 rounded-full transition-colors', on ? 'bg-brand-600' : 'bg-line')}>
      <span class=${cx('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'right-6' : 'right-1')}></span>
    </span>
    <span class="min-w-0"><b class="block text-[16px]">${label}</b>${sub && html`<span class="block text-[14px] text-muted">${sub}</span>`}</span>
  </button>`;
}

// A money amount that becomes an input on click.
export function MoneyEdit({ value, onSave, class: cls = '', big }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(value ?? '');
  const ref = useRef();
  useEffect(() => edit && ref.current?.select(), [edit]);
  const done = () => {
    setEdit(false);
    const n = Number(String(v).replace(/[^\d]/g, ''));
    if (n !== value) onSave(n || 0);
  };
  if (edit)
    return html`<input ref=${ref} inputmode="numeric" dir="ltr" value=${v} onInput=${(e) => setV(e.target.value)} onBlur=${done} onKeyDown=${(e) => {
      if (e.key === 'Enter') (e.preventDefault(), e.stopPropagation(), done());
      if (e.key === 'Escape') (setV(value), setEdit(false));
    }} class=${cx('w-28 rounded-lg border-[1.5px] border-brand-600 bg-white px-2 py-1 text-end font-display font-bold tabular-nums outline-none ring-4 ring-brand-100', big ? 'text-[24px]' : 'text-[16px]')} aria-label="סכום" />`;
  return html`<button type="button" title="לעריכה" onClick=${() => (setV(value ?? ''), setEdit(true))} class=${cx('whitespace-nowrap rounded-md px-1 font-display font-bold tabular-nums decoration-brand-300 decoration-dashed underline-offset-4 hover:bg-brand-50 hover:underline cursor-text', big ? 'text-[24px]' : 'text-[16px]', cls)}>${value == null ? html`<span class="text-faint">סכום</span>` : fmt(value)}</button>`;
}

// "איך זה חושב": a folded explanation next to a number.
export function How({ label = 'איך זה חושב', children }) {
  return html`<details class="group mt-2 text-[14px]">
    <summary class="inline-flex cursor-pointer items-center gap-1 font-bold text-brand-600"><${Icon} name="calculator" size=${14} />${label}<${Icon} name="chevron-down" size=${14} class="transition group-open:rotate-180" /></summary>
    <div class="mt-2 rounded-xl bg-canvas p-3 text-muted ring-1 ring-line">${children}</div>
  </details>`;
}

export function StateIcon({ state }) {
  if (state === 'ok') return html`<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100"><${PencilCheck} size=${17} color="#0038b8" weight=${3} /></span>`;
  if (state === 'todo') return html`<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-warn-50 text-warn"><${Icon} name="circle-dot" size=${15} /></span>`;
  return html`<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-canvas text-faint ring-1 ring-line"><${Icon} name="minus" size=${15} /></span>`;
}

// The price screen's meter, as plain as an equation: what he gets (the components + the bonuses)
// against what he pays, the ratio between them, and a mark where ×2 is (the target).
export function ValueMeter({ value, price, priceSlot, foot, comps = value, bonus = 0 }) {
  const r = price > 0 ? value / price : 0;
  const tone = ratioTone(r);
  const t = TONE[tone];
  const target = price * 2;
  const max = Math.max(value, target * 1.08, 1);
  const pct = (v) => `${(v / max) * 100}%`;
  const gap = Math.max(0, Math.ceil((target - value) / 10) * 10);
  return html`<div class="fb-panel !p-4 md:!p-5">
    <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-2 md:gap-3">
      <div class="min-w-0">
        <p class="text-[13px] font-bold text-muted">מה הוא מקבל</p>
        <b class="whitespace-nowrap font-display text-[24px] font-black tabular-nums text-money md:text-[32px]">${fmt(value)}</b>
        <p class="whitespace-nowrap text-[12px] tabular-nums text-muted md:text-[13px]">רכיבים ${fmt(comps)}${bonus > 0 ? html` <b class="text-money">+ בונוסים ${fmt(bonus)}</b>` : ''}</p>
      </div>
      <span class=${cx('mb-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[15px] font-black md:px-3 md:text-[17px] tabular-nums transition-colors', tone === 'good' ? 'bg-money-50' : tone === 'mid' ? 'bg-warn-50' : 'bg-error-50', t.text)}>${fmtRatio(r)}</span>
      <div class="whitespace-nowrap text-end"><p class="text-[13px] font-bold text-muted">מה הוא משלם</p>${priceSlot}</div>
    </div>
    <div class="relative mt-7 flex flex-col gap-1.5">
      <span class="absolute -top-6 whitespace-nowrap text-[12px] font-bold text-muted" style=${{ insetInlineStart: pct(target), transform: 'translateX(50%)' }}>היעד: פי 2</span>
      <span class="flex h-3.5 overflow-hidden rounded-full bg-canvas ring-1 ring-line">
        <span class=${cx('block h-full transition-all duration-500', t.bar)} style=${{ width: pct(comps) }}></span>
        <span class=${cx('block h-full opacity-50 transition-all duration-500', t.bar)} style=${{ width: pct(bonus) }}></span>
      </span>
      <span class="h-3.5 overflow-hidden rounded-full bg-canvas ring-1 ring-line"><span class="block h-full rounded-full bg-ink/70 transition-all duration-500" style=${{ width: pct(price) }}></span></span>
      <span class="pointer-events-none absolute -bottom-1 -top-1 w-0 border-s-2 border-dashed border-ink/50" style=${{ insetInlineStart: pct(target) }}></span>
    </div>
    <p class=${cx('mt-2.5 text-[15px] font-bold', t.text)}>הלקוח מקבל ${fmtRatio(r)} ממה שהוא משלם. ${tone === 'good' ? 'ההצעה מעל היעד.' : `עוד ${fmt(gap)} של ערך, ומגיעים ליעד.`}</p>
    ${foot}
  </div>`;
}
