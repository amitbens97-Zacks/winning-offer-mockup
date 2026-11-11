// Step 8 "בניית הצעה מנצחת": the opening, the check of an offer the user already has,
// the live offer card beside every screen, and the finish (the offer document, the
// WhatsApp version, what's missing, the sequence around the offer).
import { html, useState, useEffect, Icon, cx, confetti, PencilLine } from './lib.js';
import { Button, Note, StepHeading } from './components.js';
import { inputCls } from './ui.js';
import { SharkTip, From, Meter, StateIcon } from './kit.js';
import { PARTS, CORE, USER, BASKET, EXISTING_OFFER, REVIEW_DIMS, SAVED, g } from './data.js';
import { activeComps, bonusList, total, fmt, fmtRatio, ratio, payLine, guaranteeLine, guaranteeOK, capacity, minimum, whatsappText, missing } from './calc.js';

// ---------- opening (first entry only) ----------
export function Opening({ onReview }) {
  return html`<div class="mx-auto grid max-w-[1120px] items-center gap-8 px-4 py-6 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:px-8 md:py-8">
    <div>
      <${StepHeading} n="8" eyebrow="שלב 8 · בניית מותג אישי" title=${['הצעה ', 'שקשה לסרב לה', '']} />
      <p class="mb-5 max-w-[50ch] text-[18px] text-ink">לוקחים את המוצר המרכזי מהסל, ובונים סביבו הצעה: תוצאה ברורה, מענה לכל מה שעוצר את הלקוח, בונוסים והבטחה. בסוף ${g('יש לך', 'יש לך')} מסמך הצעה ממותג וגרסה לוואטסאפ.</p>
      <div class="mb-5 flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-line">
        <span class="fb-chip-ic h-10 w-10 shrink-0"><${Icon} name="package" size=${20} /></span>
        <span class="min-w-0 flex-1"><small class="block text-[13px] font-bold text-muted">בונים הצעה ל</small><b class="text-[17px]">${CORE.name} · ${fmt(CORE.price)}</b></span>
        <${From}>המוצר המרכזי בסל<//>
      </div>
      <div class="flex flex-col gap-2 border-t border-line pt-4 text-[15px]">
        <p class="flex flex-wrap items-center gap-x-2 gap-y-1"><${Icon} name="list" size=${17} class="text-brand-600" /><b>החלקים:</b> ${PARTS.join(' · ')}</p>
        <p class="flex items-center gap-2"><${Icon} name="clock" size=${17} class="text-brand-600" /><b>זמן:</b> כ-25 דקות</p>
        <p class="flex items-center gap-2"><${Icon} name="file-check-2" size=${17} class="text-brand-600" /><b>התוצר:</b> מסמך הצעה בעמוד אחד, וגרסה קצרה לוואטסאפ</p>
        <button type="button" onClick=${onReview} class="mt-1 inline-flex w-fit items-center gap-2 font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="file-search" size=${17} />יש לי כבר הצעה. לבדוק אותה קודם</button>
      </div>
    </div>
    <div class="relative flex justify-center pb-16" aria-hidden="true">
      <div class="paper w-[330px] rotate-[1deg] rounded-[18px] p-5">
        <p class="text-[12px] font-bold text-muted">שיווק שעובד</p>
        <b class="mb-3 block font-display text-[19px] leading-tight">מכונת הפניות: 90 יום לעסקי שירות</b>
        ${[['מפת הלקוח', 1500], ['מכונת הפניות', 4000], ['90 יום צמוד', 6900], ['מהפנייה לפגישה', 800]].map(([n, v]) => html`<p key=${n} class="flex justify-between border-b border-dashed border-line py-1.5 text-[14px]"><span>${n}</span><span class="tabular-nums text-muted">${fmt(v)}</span></p>`)}
        <p class="mt-2 flex justify-between text-[14px]"><span class="text-muted">ערך כולל</span><b class="tabular-nums text-money">15,440 ₪</b></p>
        <p class="flex justify-between text-[14px]"><span class="text-muted">המחיר</span><b class="tabular-nums">7,500 ₪</b></p>
      </div>
      <${Note} tone="white" tilt=${-3} class="absolute bottom-0 left-2 w-[200px] !p-3 text-[14px]">
        <span class="fb-note-kicker">ההבטחה</span>
        <span>המפגש הראשון עלינו</span>
      <//>
      <span class="hand absolute -top-3 right-2 rotate-[3deg] text-[26px]">פי 2 מהמחיר</span>
    </div>
  </div>`;
}

// ---------- the check mode: an offer the user already has (prompt mode ב, section 6) ----------
export function Review({ result, busy, onCheck, text, setText }) {
  return html`<div class="mx-auto max-w-[780px] px-4 py-6 md:px-8 md:py-8">
    <h1 class="fb-h1 mb-1.5 text-[26px] md:text-[32px]">מה <span class="fb-marker">עובד</span> בהצעה שלך?</h1>
    <p class="mb-5 text-[17px] text-muted">${g('הדבק', 'הדביקי')} את ההצעה כמו שהיא היום: ממודעה, מדף נחיתה או מהודעה ללקוח. הכריש נותן ציון, מראה מה הכי חלש, ומשם בונים גרסה משופרת.</p>
    ${!result && html`<textarea rows="5" class=${cx(inputCls, '!h-auto py-3 leading-relaxed')} value=${text} onInput=${(e) => setText(e.target.value)} aria-label="ההצעה הקיימת"></textarea>
      <p class="mt-1.5 text-[13px] text-muted">במוק-אפ: ההצעה של דניאל לפני, לדוגמה. אפשר להחליף.</p>
      ${busy && html`<p class="mt-4 flex items-center gap-2 text-[15px] font-bold text-brand-600"><span class="fb-spin"></span>הכריש קורא את ההצעה...</p>`}`}
    ${result && html`<div class="rise">
      <div class="fb-panel mb-4 !p-4"><p class="mb-1 text-[13px] font-bold text-muted">ההצעה היום, בעיני הלקוח</p><p class="text-[17px] font-semibold">${result.line}</p></div>
      <div class="mb-4 rounded-2xl bg-brand-600 p-4 text-white">
        <p class="text-[13px] font-bold text-brand-200">השיפור האחד הכי משמעותי</p>
        <b class="block font-display text-[21px]">${result.one.title}</b>
        <p class="mt-1 text-[15px] text-white/90">${result.one.why}</p>
      </div>
      <details class="group rounded-2xl bg-white ring-1 ring-line" open>
        <summary class="flex cursor-pointer items-center gap-2 px-4 py-3 text-[15px] font-bold">הציון בכל ממד<span class="text-[13px] font-semibold text-muted">1 עד 5</span><${Icon} name="chevron-down" size=${16} class="ms-auto transition group-open:rotate-180" /></summary>
        <ul class="divide-y divide-line px-4 pb-2">
          ${result.scores.map(([dim, sc, why]) => html`<li key=${dim} class="flex items-start gap-3 py-2.5">
            <span class="w-24 shrink-0 text-[14px] font-bold">${dim}</span>
            <span class="mt-1.5 flex shrink-0 gap-0.5" aria-label=${`${sc} מתוך 5`}>${[1, 2, 3, 4, 5].map((n) => html`<i key=${n} class=${cx('h-2 w-4 rounded-full', n <= sc ? (sc <= 2 ? 'bg-warn' : 'bg-brand-600') : 'bg-line')}></i>`)}</span>
            <span class="min-w-0 flex-1 text-[14px] text-muted">${why}</span>
          </li>`)}
        </ul>
      </details>
      ${result.flags?.length > 0 && html`<p class="mt-3 flex flex-wrap items-center gap-1.5 text-[14px]"><b class="text-warn">שימו לב:</b>${result.flags.map((f) => html`<span key=${f} class="rounded-full bg-warn-50 px-2 py-0.5 font-semibold text-warn">${f}</span>`)}</p>`}
      <${SharkTip} class="mt-5">בחלקים הבאים בונים את הגרסה המשופרת. מה שכבר ידוע מההצעה שלך ומהשלבים הקודמים, כבר ממולא.<//>
    </div>`}
  </div>`;
}

// Rule-based review for any pasted text, so the mockup works without a model.
export function reviewByRules(text) {
  const has = (re) => re.test(text);
  const sc = {
    קהל: has(/בעלי|עסקי|ל(אמהות|מטפלים|קליניקות)/) ? 3 : 2,
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
    line: 'הצעה שאפשר להשוות לאחרות: הלקוח רואה מה עושים, ולא לאן מגיעים.',
    scores,
    one: worst[0] === 'התוצאה' ? { title: 'למכור את היעד, לא את השירות', why: 'בלי תוצאה עם זמן, הלקוח משווה מחיר מול מחיר.' } : { title: `לחזק את "${worst[0]}"`, why: worst[2] },
    flags: [...(sc['התוצאה'] < 3 ? ["רשימת פיצ'רים במקום תוצאה"] : []), ...(has(/הנחה|מבצע/) ? ['הנחה היא הכלי המרכזי'] : [])],
  };
}

// ---------- the live offer card (beside each screen on wide screens) ----------
export function OfferCard({ s, noMeter }) {
  const comps = activeComps(s);
  const bons = bonusList(s);
  const Row = ({ k, children, empty }) => html`<div class="border-b border-dashed border-line py-2 last:border-0"><p class="text-[12px] font-bold text-muted">${k}</p>${empty ? html`<p class="text-[14px] text-faint">${empty}</p>` : children}</div>`;
  return html`<div class="paper rounded-[18px] p-4">
    <p class="fb-eyebrow mb-0.5 !text-[12px]">ההצעה שלך</p>
    <p class="mb-2 text-[12px] text-muted">מתמלאת עם כל תשובה</p>
    <b class=${cx('block font-display text-[17px] leading-tight', !s.name.text && 'text-faint')}>${s.name.text || 'עוד בלי שם'}</b>
    <div class="mt-2">
      <${Row} k="התוצאה" empty=${!s.outcome.text && 'עוד לא נבחרה'}><p class="text-[14px] leading-snug">${s.outcome.text}, תוך ${s.outcome.time}</p><//>
      <${Row} k=${`מה כלול${comps.length ? ` · ${comps.length}` : ''}`}>${comps.map((c) => html`<p key=${c.id} class="flex justify-between gap-2 text-[14px]"><span class="truncate">${c.name}</span><span class="shrink-0 tabular-nums text-muted">${fmt(c.value)}</span></p>`)}<//>
      ${bons.length > 0 && html`<${Row} k=${`בונוסים · ${bons.length}`}>${bons.map((b) => html`<p key=${b.id} class="truncate text-[14px]">${b.name}</p>`)}<//>`}
      ${!noMeter && html`<div class="py-2"><${Meter} compact value=${total(s)} price=${s.price} /></div>`}
      <${Row} k="ההבטחה" empty=${!guaranteeOK(s.guarantee) && 'עוד לא'}><p class="text-[14px] font-bold">${s.guarantee.name}</p><//>
    </div>
  </div>`;
}

// ---------- the offer document (prompt 5.1), on paper ----------
export function OfferDoc({ s }) {
  const comps = activeComps(s);
  const bons = bonusList(s);
  const pText = (pid) => s.problems.find((p) => p.id === pid)?.text;
  const cap = capacity();
  const why = [
    s.seats.on && `${cap.perMonth} עסקים חדשים בחודש, כדי שכל קמפיין ייבנה אישית.`,
    s.urgency.id !== 'none' && s.urgency.date && `עד ${new Date(s.urgency.date).toLocaleDateString('he-IL')}.`,
  ].filter(Boolean);
  return html`<article id="offer-doc" class="paper rounded-[18px] p-5 md:p-8">
    <header class="mb-5 flex items-center justify-between gap-3 border-b-2 border-brand-600 pb-3">
      <span class="text-[14px] font-bold text-brand-600">${USER.business} · ${USER.fullName}</span>
      <img src="assets/flowbiz-mark-color.png" alt="" class="h-7 w-auto opacity-60" />
    </header>
    <h2 class="font-display text-[26px] font-black leading-tight text-brand-900 md:text-[30px]">${s.name.text || 'ההצעה שלי'}</h2>
    <p class="mt-1 text-[15px]"><b>למי:</b> ${USER.audience}</p>
    <p class="text-[15px]"><b>התוצאה:</b> ${s.outcome.text}, תוך ${s.outcome.time}</p>

    <h3 class="mb-2 mt-5 font-display text-[17px] font-bold">מה כלול</h3>
    <table class="w-full text-[14px]">
      <thead><tr class="border-b border-line text-start text-[12px] text-muted"><th class="py-1.5 text-start font-bold">רכיב</th><th class="py-1.5 text-start font-bold max-sm:hidden">מה זה פותר</th><th class="py-1.5 text-end font-bold">ערך</th></tr></thead>
      <tbody>${comps.map((c) => {
        const solves = [...new Set(s.ideas.filter((d) => d.in && c.ideas.includes(d.id)).flatMap((d) => d.solves))];
        return html`<tr key=${c.id} class="border-b border-dashed border-line align-top"><td class="py-2 pe-2"><b>${c.name}</b><br /><span class="text-muted">${c.promise}</span></td><td class="py-2 pe-2 text-muted max-sm:hidden">"${pText(solves[0])}"</td><td class="py-2 text-end tabular-nums">${fmt(c.value)}</td></tr>`;
      })}</tbody>
    </table>
    ${bons.length > 0 && html`<h3 class="mb-2 mt-5 font-display text-[17px] font-bold">בונוסים</h3>
      <table class="w-full text-[14px]"><tbody>${bons.map((b) => html`<tr key=${b.id} class="border-b border-dashed border-line align-top"><td class="py-2 pe-2"><b>${b.name}</b></td><td class="py-2 pe-2 text-muted max-sm:hidden">"${pText(b.for)}"</td><td class="py-2 text-end tabular-nums">${fmt(b.value)}</td></tr>`)}</tbody></table>`}
    <div class="mt-4 flex flex-wrap items-baseline justify-between gap-3 rounded-xl bg-canvas p-3">
      <span class="text-[15px]">ערך כולל <b class="font-display text-[20px] tabular-nums text-money">${fmt(total(s))}</b></span>
      <span class="text-[15px]">המחיר <b class="font-display text-[20px] tabular-nums">${fmt(s.price)}</b> <span class="text-[13px] text-muted">${payLine(s)}</span></span>
    </div>
    ${guaranteeOK(s.guarantee) && html`<h3 class="mb-1 mt-5 font-display text-[17px] font-bold">ההבטחה: ${s.guarantee.name}</h3><p class="text-[15px]">${guaranteeLine(s.guarantee)}</p><p class="mt-1 text-[12px] text-muted">${s.guarantee.cancel}</p>`}
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
  const miss = missing(s);
  const wa = whatsappText(s);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wa);
    } catch {}
    notify('הגרסה לוואטסאפ הועתקה', 'copy');
  };
  const entry = BASKET.find((p) => p.role === 'entry');
  const recurring = BASKET.find((p) => p.role === 'recurring');
  const bridge = BASKET.find((p) => p.role === 'bridge');
  return html`<div class="mx-auto max-w-[1120px] px-4 py-6 md:px-8 md:py-8">
    <div class="no-print mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="fb-eyebrow mb-1">סיימת את שלב 8</p>
        <h1 class="fb-h1 text-[28px] md:text-[36px]">ההצעה <span class="fb-marker">מוכנה</span></h1>
        <p class="mt-1 text-[16px] text-muted">${fmtRatio(ratio(s))} מהמחיר, עם הבטחה. נשמרה בקבצים › בניית מותג אישי.</p>
      </div>
      <${Note} tone="white" tilt=${-2} class="fb-badge-note !w-[220px] !pt-8 max-md:hidden">
        <span class="fb-note-kicker">שלב הושלם</span>
        <span class="text-[13px]">חסכת בשלב הזה</span>
        <span class="relative font-display text-[30px] font-black text-money">${fmt(SAVED.amount)}<${PencilLine} color="#12805c" class="absolute inset-x-0 -bottom-1 h-2 w-full" /></span>
        <span class="text-[12px] text-muted">${SAVED.like}</span>
      <//>
    </div>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div class="min-w-0">
        <div class="no-print mb-3 flex items-center gap-1 rounded-2xl bg-white p-1 ring-1 ring-line" role="tablist">
          ${[['doc', 'file-text', 'מסמך ההצעה'], ['wa', 'message-circle', 'גרסה לוואטסאפ']].map(([id, icon, l]) => html`<button key=${id} type="button" role="tab" aria-selected=${tab === id} onClick=${() => setTab(id)} class=${cx('flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[14px] font-bold cursor-pointer', tab === id ? 'bg-brand-600 text-white' : 'text-muted hover:text-ink')}><${Icon} name=${icon} size=${16} />${l}</button>`)}
        </div>
        ${tab === 'doc'
          ? html`<${OfferDoc} s=${s} />
            <div class="no-print mt-3 flex flex-wrap gap-2"><${Button} variant="secondary" onClick=${() => window.print()}><${Icon} name="download" size=${17} />הורדה כ-PDF<//><${Button} variant="text" onClick=${() => notify('במערכת: נפתח עמוד ההצעה ב"הדפים שלי"', 'layout-template')}><${Icon} name="layout-template" size=${17} />לדף ההצעה<//></div>`
          : html`<div class="rounded-[18px] bg-[#e9e3d6] p-4 md:p-6">
              <div class="ms-auto max-w-[460px] whitespace-pre-wrap rounded-2xl rounded-se-sm bg-[#d9fdd3] p-3.5 text-[15px] leading-relaxed shadow-sm">${wa.replace(/\*/g, '')}</div>
            </div>
            <div class="mt-3"><${Button} variant="secondary" onClick=${copy}><${Icon} name="copy" size=${17} />להעתיק<//></div>`}
      </div>
      <div class="no-print flex flex-col gap-4">
        ${miss.length > 0 && html`<section class="fb-panel !p-4">
          <h2 class="mb-2 font-display text-[17px] font-bold">מה עוד חסר</h2>
          <ul class="flex flex-col gap-2">${miss.map((m) => html`<li key=${m.text} class="flex items-start gap-2 text-[14px]"><${Icon} name=${m.icon} size=${16} class="mt-0.5 text-warn" />${m.text}</li>`)}</ul>
        </section>`}
        <section class="fb-panel !p-4">
          <h2 class="mb-1 font-display text-[17px] font-bold">הרצף סביב ההצעה</h2>
          <p class="mb-2 text-[13px] text-muted">מה בא לפני, אחרי, ולמי שאומר לא. מהסל שלך.</p>
          <ul class="flex flex-col gap-2 text-[14px]">
            <li class="flex gap-2"><b class="w-[72px] shrink-0">לפני</b><span>${entry?.name}, חינם</span></li>
            <li class="flex gap-2"><b class="w-[72px] shrink-0">ההצעה</b><span>${s.name.text || CORE.name}</span></li>
            <li class="flex gap-2"><b class="w-[72px] shrink-0">אחרי</b><span>${recurring?.name}, ${fmt(recurring?.price)} בחודש</span></li>
            <li class="flex gap-2"><b class="w-[72px] shrink-0">אמר לא</b><span>${bridge?.name}, ${fmt(bridge?.price)}, או "המינימום"</span></li>
          </ul>
          <div class="mt-3 rounded-xl bg-canvas p-3 ring-1 ring-line">
            <p class="flex items-baseline justify-between gap-2"><b class="text-[15px]">המינימום</b><b class="font-display tabular-nums">${fmt(min.price)}</b></p>
            <p class="text-[13px] text-muted">רק ${min.keep.map((c) => c.name).join(' ו')}, ${g('הלקוח עושה', 'הלקוח עושה')} בעצמו. בלי ${min.drop.map((c) => c.name).join(', ')} ובלי הבטחה.</p>
            <p class="mt-1 text-[12px] text-muted">לא אותה חבילה בפחות: פחות רכיבים, ולכן פחות כסף (${Math.round(min.share * 100)}% מהערך).</p>
            <button type="button" disabled=${minAdded} onClick=${onAddMin} class="mt-2 inline-flex items-center gap-1.5 text-[14px] font-bold text-brand-600 hover:underline disabled:text-muted disabled:no-underline cursor-pointer"><${Icon} name=${minAdded ? 'check' : 'plus'} size=${15} />${minAdded ? 'נוסף לסל המוצרים' : 'להוסיף לסל המוצרים'}</button>
          </div>
        </section>
        <button type="button" onClick=${onAnother} class="flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-brand-300 bg-white p-4 text-start hover:border-brand-600 cursor-pointer">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><${Icon} name="plus" size=${20} /></span>
          <span><b class="block text-[15px]">לבנות הצעה למוצר נוסף</b><span class="text-[13px] text-muted">אותם חלקים, למוצר אחר מהסל</span></span>
        </button>
      </div>
    </div>
  </div>`;
}
