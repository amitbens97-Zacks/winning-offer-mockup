// Step 8 "בניית הצעה מנצחת": the opening, the check of an offer the user already has,
// the "ההצעה שלך" card beside each screen (done / now / next), and the finish.
import { html, useState, useEffect, Icon, cx, confetti, PencilLine, PencilCheck } from './lib.js';
import { Button, Note } from './components.js';
import { inputCls } from './ui.js';
import { CORE, USER, REVIEW_DIMS, SAVED, PARTS, g } from './data.js';
import { activeComps, activeProblems, bonusList, total, fmt, fmtRatio, ratio, payLine, guaranteeLine, guaranteeOK, capacity, minimum, whatsappText, missing } from './calc.js';

// ---------- opening ----------
export function Opening({ onReview }) {
  return html`<div class="mx-auto grid min-h-full max-w-[1080px] items-center gap-6 px-4 py-8 md:grid-cols-2 md:gap-12 md:px-8">
    <div>
      <p class="fb-eyebrow mb-2">שלב 8 · בניית מותג אישי</p>
      <h1 class="fb-h1 mb-3 text-[34px] leading-[1.1] md:text-[46px]">הצעה <span class="fb-marker">שקשה לסרב לה</span></h1>
      <p class="mb-6 max-w-[40ch] text-[18px] text-ink-2">בונים הצעה כל כך טובה, שהלקוח ירגיש טיפש אם הוא לא לוקח אותה.</p>
      <button type="button" onClick=${onReview} class="inline-flex items-center gap-2 text-[15px] font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="file-search" size=${17} />יש לי כבר הצעה. לבדוק אותה קודם</button>
    </div>
    <${Scale} />
  </div>`;
}

// The idea of the step in one picture: what goes on the value side outweighs the price.
// Blocks drop onto the value pan one by one, then the beam tips.
function Scale() {
  const blocks = [
    { y: 206, w: 92, label: 'התוצאה', d: 0.25 },
    { y: 178, w: 80, label: 'בונוסים', d: 0.6 },
    { y: 150, w: 68, label: 'הבטחה', d: 0.95 },
  ];
  return html`<div class="relative mx-auto w-full max-w-[470px]" aria-hidden="true">
    <svg viewBox="0 0 420 320" class="w-full" style="font-family: Rubik, Assistant, sans-serif">
      <g filter="url(#pencil-rough)" stroke="#2d3e66" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M210 70 L210 282" />
        <path d="M168 288 Q210 274 252 288" />
        <path d="M150 292 L270 292" />
      </g>
      <g class="sc-beam">
        <path d="M72 70 L348 70" stroke="#0038b8" stroke-width="5" stroke-linecap="round" />
        <circle cx="210" cy="70" r="9" fill="#fffefb" stroke="#0038b8" stroke-width="3" />
      </g>
      <g class="sc-left">
        <g stroke="#a0a6af" stroke-width="1.6"><path d="M72 70 L34 228" /><path d="M72 70 L110 228" /></g>
        <path d="M24 228 Q72 254 120 228 Z" fill="#e9effb" stroke="#2d3e66" stroke-width="2.5" filter="url(#pencil-rough)" />
        <g transform="translate(72 206) rotate(-4)">
          <rect x="-40" y="-16" width="80" height="30" rx="8" fill="#fffefb" stroke="#2d3e66" stroke-width="2" />
          <text x="0" y="5" text-anchor="middle" font-size="15" font-weight="800" fill="#2d3e66">${fmt(CORE.price)}</text>
        </g>
        <text x="72" y="276" text-anchor="middle" font-size="14" font-weight="700" fill="#5f6775">מה משלמים</text>
      </g>
      <g class="sc-right">
        <g stroke="#a0a6af" stroke-width="1.6"><path d="M348 70 L298 228" /><path d="M348 70 L398 228" /></g>
        <path d="M288 228 Q348 256 408 228 Z" fill="#e9effb" stroke="#2d3e66" stroke-width="2.5" filter="url(#pencil-rough)" />
        ${blocks.map((b) => html`<g key=${b.label} class="sc-drop" style=${{ animationDelay: `${b.d}s` }}>
          <rect x=${348 - b.w / 2} y=${b.y} width=${b.w} height="26" rx="6" fill="#0038b8" />
          <rect x=${348 - b.w / 2} y=${b.y} width=${b.w} height="26" rx="6" fill="url(#pencil-hatch-light)" />
          <text x="348" y=${b.y + 18} text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${b.label}</text>
        </g>`)}
        <text x="348" y="276" text-anchor="middle" font-size="14" font-weight="700" fill="#5f6775">מה מקבלים</text>
      </g>
    </svg>
    <span class="hand sc-note absolute right-0 -top-3 rotate-[-5deg] text-[32px]">פי 2 מהמחיר!</span>
  </div>`;
}

// ---------- the check mode: an offer the user already has (prompt mode ב, section 6) ----------
export function Review({ result, busy, text, setText }) {
  return html`<div class="mx-auto max-w-[720px] px-4 py-6 md:px-8 md:py-10">
    <h1 class="fb-h1 mb-1.5 text-[28px] md:text-[34px]">מה <span class="fb-marker">עובד</span> בהצעה שלך?</h1>
    <p class="mb-5 text-[17px] text-muted">${g('הדבק', 'הדביקי')} אותה כמו שהיא היום. הכריש יגיד מה הכי חשוב לשפר.</p>
    ${!result && html`<textarea rows="5" class=${cx(inputCls, '!h-auto py-3 leading-relaxed')} value=${text} onInput=${(e) => setText(e.target.value)} aria-label="ההצעה הקיימת"></textarea>
      ${busy && html`<p class="mt-4 flex items-center gap-2 text-[15px] font-bold text-brand-600"><span class="fb-spin"></span>הכריש קורא...</p>`}`}
    ${result && html`<div class="rise">
      <p class="mb-3 text-[17px] text-ink-2">"${result.line}"</p>
      <div class="mb-4 rounded-2xl bg-brand-600 p-5 text-white">
        <p class="text-[13px] font-bold text-brand-200">הדבר האחד שהכי ישפר אותה</p>
        <b class="block font-display text-[23px] leading-tight">${result.one.title}</b>
        <p class="mt-1.5 text-[15px] text-white/90">${result.one.why}</p>
      </div>
      <details class="group rounded-2xl bg-white ring-1 ring-line">
        <summary class="flex cursor-pointer items-center gap-2 px-4 py-3 text-[15px] font-bold">הציון המלא<${Icon} name="chevron-down" size=${16} class="ms-auto transition group-open:rotate-180" /></summary>
        <ul class="divide-y divide-line px-4 pb-2">
          ${result.scores.map(([dim, sc, why]) => html`<li key=${dim} class="flex items-start gap-3 py-2.5">
            <span class="w-24 shrink-0 text-[14px] font-bold">${dim}</span>
            <span class="mt-1.5 flex shrink-0 gap-0.5" aria-label=${`${sc} מתוך 5`}>${[1, 2, 3, 4, 5].map((n) => html`<i key=${n} class=${cx('h-2 w-4 rounded-full', n <= sc ? (sc <= 2 ? 'bg-warn' : 'bg-brand-600') : 'bg-line')}></i>`)}</span>
            <span class="min-w-0 flex-1 text-[14px] text-muted">${why}</span>
          </li>`)}
        </ul>
      </details>
    </div>`}
  </div>`;
}

// Rule-based review for any pasted text, so the step works without a model.
export function reviewByRules(text) {
  const has = (re) => re.test(text);
  const sc = {
    קהל: has(/בעלי|עסקי|הורים|ל(אמהות|מטפלים|קליניקות)|גיל/) ? 3 : 2,
    התוצאה: has(/תוך|ב-?\d+ (יום|ימים|שבועות|חודשים)/) ? 3 : 1,
    הסבירות: has(/הבטח|אחריות|החזר|לקוחות שלנו|המלצ/) ? 3 : 2,
    הזמן: has(/תוך|שבוע ראשון|מהיום/) ? 3 : 1,
    המאמץ: has(/בשבילך|אנחנו (מקימים|עושים|כותבים)|הקמת/) ? 3 : 2,
    ייחוד: 1,
    'מחיר ותנאים': has(/₪|תשלומים/) ? 3 : 1,
    בונוסים: has(/בונוס|מתנה/) ? 3 : 1,
    הבטחה: has(/אם לא/) ? 4 : has(/הבטח|אחריות|החזר/) ? 2 : 1,
    'מחסור ודחיפות': 3,
    שם: has(/^["״]|:/) ? 2 : 1,
    'מודל ההכנסה': 3,
  };
  const why = {
    התוצאה: sc['התוצאה'] < 3 ? 'רשימת שירותים, בלי יעד ובלי זמן.' : 'יש פרק זמן. כדאי לחדד את היעד.',
    הבטחה: sc['הבטחה'] < 3 ? 'אין "אם לא X תוך Y, אנחנו Z".' : 'יש הבטחה עם שיניים.',
    בונוסים: sc['בונוסים'] < 3 ? 'אין.' : 'יש בונוס. האם הוא מפרק מכשול?',
  };
  const scores = REVIEW_DIMS.map((d) => [d, sc[d], why[d] || (sc[d] <= 2 ? 'חלש. נבנה את זה בחלקים הבאים.' : 'סביר.')]);
  const worst = scores.reduce((a, b) => (b[1] < a[1] ? b : a));
  return {
    line: 'הלקוח רואה מה עושים, ולא לאן מגיעים. קל להשוות אותה לאחרות.',
    scores,
    one: worst[0] === 'התוצאה' ? { title: 'למכור את היעד, לא את השירות', why: 'בלי תוצאה עם זמן, הלקוח משווה מחיר מול מחיר.' } : { title: `לחזק את "${worst[0]}"`, why: worst[2] },
    flags: [],
  };
}

// ---------- "ההצעה שלך": the six parts, what is done, what is now, what is next ----------
const ROWS = [
  (s) => s.outcome.text && `${s.outcome.text}, תוך ${s.outcome.time}`,
  (s) => `${activeProblems(s).length} דברים שעוצרים את הלקוח`,
  (s) => `${activeComps(s).length} רכיבים`,
  (s) => `${fmt(s.price)} · ערך ${fmtRatio(ratio(s))}`,
  (s) => guaranteeOK(s.guarantee) && s.guarantee.name,
  (s) => s.name.text,
];
export function JourneyCard({ s, part, onGo }) {
  return html`<div class="paper rounded-[18px] p-4">
    <p class="fb-eyebrow mb-3 !text-[12px]">ההצעה שלך</p>
    <ol class="flex flex-col">
      ${PARTS.map((label, i) => {
        const now = i === part;
        const done = !now && i <= s.reached;
        const next = !now && !done && i === part + 1;
        const value = (done || now) && ROWS[i](s);
        return html`<li key=${label} class="relative flex gap-3 pb-3 last:pb-0">
          ${i < PARTS.length - 1 && html`<span class=${cx('absolute start-[11px] top-7 bottom-0 w-0.5', done ? 'bg-brand-300' : 'bg-line')}></span>`}
          <span class=${cx('relative z-[1] grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-black', now ? 'bg-brand-600 text-white ring-4 ring-brand-100' : done ? 'bg-brand-100' : 'bg-canvas text-faint ring-1 ring-line')}>${done ? html`<${PencilCheck} size=${14} color="#0038b8" weight=${3} />` : i + 1}</span>
          <button type="button" disabled=${!done} onClick=${() => onGo(i)} class=${cx('min-w-0 flex-1 text-start', done && 'cursor-pointer hover:opacity-80')}>
            <span class="flex items-center gap-2">
              <b class=${cx('text-[14px]', now ? 'text-brand-600' : done ? 'text-ink' : 'text-faint')}>${label}</b>
              ${now && html`<span class="rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">עכשיו</span>`}
              ${next && html`<span class="rounded-full bg-canvas px-1.5 text-[11px] font-bold text-muted ring-1 ring-line">הבא</span>`}
            </span>
            ${value && html`<span class="line-clamp-2 text-[13px] leading-snug text-muted">${value}</span>`}
          </button>
        </li>`;
      })}
    </ol>
  </div>`;
}

// ---------- the offer document (prompt 5.1), on paper ----------
export function OfferDoc({ s }) {
  const comps = activeComps(s);
  const bons = bonusList(s);
  const cap = capacity();
  const why = [
    s.urgency.id === 'seats' && `${cap.perMonth} משפחות חדשות בחודש, כדי שכל תוכנית תיבנה אישית.`,
    s.urgency.id === 'cohort' && s.urgency.date && `מי שנרשם עד ${new Date(s.urgency.date).toLocaleDateString('he-IL')} מתחיל במחזור הקרוב.`,
    s.urgency.id === 'price' && s.urgency.date && `המחיר הזה בתוקף עד ${new Date(s.urgency.date).toLocaleDateString('he-IL')}. אחרי זה ${fmt(s.urgency.newPrice)}.`,
  ].filter(Boolean);
  return html`<article id="offer-doc" class="paper rounded-[18px] p-5 md:p-8">
    <header class="mb-5 flex items-center justify-between gap-3 border-b-2 border-brand-600 pb-3">
      <span class="text-[14px] font-bold text-brand-600">${USER.business} · ${USER.fullName}</span>
      <img src="assets/flowbiz-mark-color.png" alt="" class="h-7 w-auto opacity-60" />
    </header>
    <h2 class="font-display text-[26px] font-black leading-tight text-brand-900 md:text-[30px]">${s.name.text || 'ההצעה שלי'}</h2>
    <p class="mt-2 text-[17px]">${s.outcome.text}, <b>תוך ${s.outcome.time}</b>.</p>
    <p class="text-[14px] text-muted">ל${USER.audience}</p>

    <h3 class="mb-2 mt-6 font-display text-[17px] font-bold">מה מקבלים</h3>
    <ul class="flex flex-col">${comps.map((c) => html`<li key=${c.id} class="flex items-start justify-between gap-3 border-b border-dashed border-line py-2 text-[15px]"><span><b>${c.name}</b><br /><span class="text-muted">${c.promise}</span></span><span class="shrink-0 tabular-nums text-muted">${fmt(c.value)}</span></li>`)}</ul>
    ${bons.length > 0 && html`<h3 class="mb-2 mt-5 font-display text-[17px] font-bold">ובנוסף</h3>
      <ul class="flex flex-col">${bons.map((b) => html`<li key=${b.id} class="flex items-start justify-between gap-3 border-b border-dashed border-line py-2 text-[15px]"><b>${b.name}</b><span class="shrink-0 tabular-nums text-muted">${fmt(b.value)}</span></li>`)}</ul>`}
    <div class="mt-4 flex flex-wrap items-baseline justify-between gap-3 rounded-xl bg-canvas p-3">
      <span class="text-[15px]">ערך כולל <b class="font-display text-[20px] tabular-nums text-money">${fmt(total(s))}</b></span>
      <span class="text-[15px]">המחיר <b class="font-display text-[20px] tabular-nums">${fmt(s.price)}</b> <span class="text-[13px] text-muted">${payLine(s)}</span></span>
    </div>
    ${guaranteeOK(s.guarantee) && html`<h3 class="mb-1 mt-5 font-display text-[17px] font-bold">${s.guarantee.name}</h3><p class="text-[15px]">${guaranteeLine(s.guarantee)}</p><p class="mt-1 text-[12px] text-muted">${s.guarantee.cancel}</p>`}
    ${why.length > 0 && html`<h3 class="mb-1 mt-5 font-display text-[17px] font-bold">למה עכשיו</h3>${why.map((w) => html`<p key=${w} class="text-[15px]">${w}</p>`)}`}
  </article>`;
}

// ---------- the finish ----------
export function Done({ s, notify, onAnother, onAddMin, minAdded }) {
  useEffect(() => {
    const t = setTimeout(() => confetti('step'), 250);
    return () => clearTimeout(t);
  }, []);
  const [tab, setTab] = useState('doc');
  const min = minimum(s);
  const miss = missing(s).slice(0, 2);
  const wa = whatsappText(s);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wa);
    } catch {}
    notify('הגרסה לוואטסאפ הועתקה', 'copy');
  };
  return html`<div class="mx-auto max-w-[1080px] px-4 py-6 md:px-8 md:py-8">
    <div class="no-print mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="fb-h1 text-[30px] md:text-[38px]">ההצעה <span class="fb-marker">מוכנה</span></h1>
        <p class="mt-1 text-[16px] text-muted">ערך ${fmtRatio(ratio(s))} מהמחיר, עם הבטחה. נשמרה בקבצים.</p>
      </div>
      <${Note} tone="white" tilt=${-2} class="fb-badge-note !w-[200px] !pt-7 max-md:hidden">
        <span class="fb-note-kicker">חסכת בשלב הזה</span>
        <span class="relative font-display text-[28px] font-black text-money">${fmt(SAVED.amount)}<${PencilLine} color="#12805c" class="absolute inset-x-0 -bottom-1 h-2 w-full" /></span>
        <span class="text-[12px] text-muted">${SAVED.like}</span>
      <//>
    </div>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div class="min-w-0">
        <div class="no-print mb-3 flex items-center gap-1 rounded-2xl bg-white p-1 ring-1 ring-line" role="tablist">
          ${[['doc', 'file-text', 'מסמך ההצעה'], ['wa', 'message-circle', 'לוואטסאפ']].map(([id, icon, l]) => html`<button key=${id} type="button" role="tab" aria-selected=${tab === id} onClick=${() => setTab(id)} class=${cx('flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[14px] font-bold cursor-pointer', tab === id ? 'bg-brand-600 text-white' : 'text-muted hover:text-ink')}><${Icon} name=${icon} size=${16} />${l}</button>`)}
        </div>
        ${tab === 'doc'
          ? html`<${OfferDoc} s=${s} /><div class="no-print mt-3"><${Button} variant="secondary" onClick=${() => window.print()}><${Icon} name="download" size=${17} />הורדה כ-PDF<//></div>`
          : html`<div class="rounded-[18px] bg-[#e9e3d6] p-4 md:p-6"><div class="ms-auto max-w-[460px] whitespace-pre-wrap rounded-2xl rounded-se-sm bg-[#d9fdd3] p-3.5 text-[15px] leading-relaxed shadow-sm">${wa.replace(/\*/g, '')}</div></div>
            <div class="mt-3"><${Button} variant="secondary" onClick=${copy}><${Icon} name="copy" size=${17} />להעתיק<//></div>`}
      </div>
      <div class="no-print flex flex-col gap-3">
        ${miss.length > 0 && html`<section class="rounded-2xl bg-white p-4 ring-1 ring-line">
          <h2 class="mb-2 font-display text-[16px] font-bold">מה עוד חסר</h2>
          <ul class="flex flex-col gap-2">${miss.map((m) => html`<li key=${m.text} class="flex items-start gap-2 text-[14px]"><${Icon} name=${m.icon} size=${16} class="mt-0.5 shrink-0 text-warn" />${m.text}</li>`)}</ul>
        </section>`}
        <details class="group rounded-2xl bg-white ring-1 ring-line">
          <summary class="flex cursor-pointer items-center gap-2 p-4 text-[15px] font-bold">למי שאומר לא<${Icon} name="chevron-down" size=${16} class="ms-auto transition group-open:rotate-180" /></summary>
          <div class="px-4 pb-4">
            <p class="flex items-baseline justify-between gap-2"><b class="text-[15px]">"המינימום"</b><b class="font-display tabular-nums">${fmt(min.price)}</b></p>
            <p class="text-[14px] text-muted">רק ${min.keep.map((c) => c.name).join(' ו')}, בלי הבטחה. פחות רכיבים, ולכן פחות כסף.</p>
            <button type="button" disabled=${minAdded} onClick=${onAddMin} class="mt-2 inline-flex items-center gap-1.5 text-[14px] font-bold text-brand-600 hover:underline disabled:text-muted disabled:no-underline cursor-pointer"><${Icon} name=${minAdded ? 'check' : 'plus'} size=${15} />${minAdded ? 'נוסף לסל המוצרים' : 'להוסיף לסל המוצרים'}</button>
          </div>
        </details>
        <button type="button" onClick=${onAnother} class="flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-brand-300 bg-white p-4 text-start hover:border-brand-600 cursor-pointer">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name="plus" size=${18} /></span>
          <b class="text-[15px]">הצעה למוצר נוסף מהסל</b>
        </button>
      </div>
    </div>
  </div>`;
}
