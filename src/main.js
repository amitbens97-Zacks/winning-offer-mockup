// Step 8 "בניית הצעה מנצחת", built on the offer-builder system prompt
// (doc/offer-builder-prompt.md) and the method "איך בונים הצעה שקשה לסרב לה" (doc/offer-method.pdf).
// Screens: opening → (review: an offer the user already has) → outcome → problems → matrix →
// components → price → bonuses → guarantee → urgency → name → check → done.
// One question per screen. The offer card beside every screen fills as the user answers.
// Link params: ?screen=<id>, ?user=f, ?embed = phone layout. Shift+D opens the developer notes.
import { html, render, useState, useEffect, useRef, Icon } from './lib.js';
import { PartnerBubble, Progress, TopBar, BottomBar, Status, PrimaryButton, Button, Toast } from './components.js';
import { Sheet } from './ui.js';
import { STEP, PARTS, EXISTING_OFFER, GUARANTEE_DRAFTS, CANCEL_TEXT, ROAD, NAMES, g } from './data.js';
import { freshState, draftBonuses, openObstacles, guaranteeOK, checks } from './calc.js';
import * as ai from './ai.js';
import { hasAI } from './ai.js';
import { OutcomeScreen, ProblemsScreen, MatrixScreen, ComponentsScreen } from './parts.js';
import { PriceScreen, BonusesScreen, GuaranteeScreen, UrgencyScreen, NameScreen, CheckScreen } from './parts2.js';
import { Opening, Review, reviewByRules, OfferCard, Done } from './step.js';
import { DevPanel } from './devnotes.js';
import { EMBED, IS_PHONE, readView, saveView, writeHandoff, takeHandoff, applyPhoneViewport, ViewToggle, PhonePreview } from './viewswitch.js';

const params = new URLSearchParams(location.search);
const FLOW = ['outcome', 'problems', 'matrix', 'components', 'price', 'bonuses', 'guarantee', 'urgency', 'name', 'check'];
const SCREENS = ['opening', 'review', ...FLOW, 'done'];
const PART_OF = { outcome: 0, problems: 1, matrix: 2, components: 2, price: 3, bonuses: 3, guarantee: 4, urgency: 4, name: 5, check: 5 };
const FIRST_OF_PART = ['outcome', 'problems', 'matrix', 'price', 'guarantee', 'name'];

// The shark in the corner: one line per screen, never more.
const SHARK_LINE = {
  opening: g('אנשים לא קונים שירות. הם קונים את המקום שהם רוצים להגיע אליו. בוא נבנה את הדרך לשם.', 'אנשים לא קונים שירות. הם קונים את המקום שהם רוצים להגיע אליו. בואי נבנה את הדרך לשם.'),
  review: 'לא מתקנים הכול. מוצאים את הדבר האחד שהכי מזיז, ומתחילים ממנו.',
  outcome: 'הלקוח לא רוצה 12 פגישות זום. הוא רוצה שהטלפון יצלצל.',
  problems: g('כל בעיה שאתה פותר עבורו היא סיבה פחות להגיד לא.', 'כל בעיה שאת פותרת עבורו היא סיבה פחות להגיד לא.'),
  matrix: 'יותר זה לא תמיד טוב יותר. מה ששווה לו מעט רק מעמיס עליו, ועליך.',
  components: 'שם שמבטיח תוצאה שווה יותר מעוד שורה ברשימה.',
  price: 'לא מורידים מחיר. מעלים ערך.',
  bonuses: 'בונוס טוב פותר בעיה אחת שעוד עוצרת אותו. לא סתם מתנה.',
  guarantee: g('כשאתה לוקח את הסיכון, לו נשאר רק להגיד כן.', 'כשאת לוקחת את הסיכון, לו נשאר רק להגיד כן.'),
  urgency: 'דחיפות מזויפת נשרפת פעם אחת. אמיתית עובדת כל חודש.',
  name: 'השם הוא הדבר הראשון שהלקוח שומע. שיגיד לו "זה בשבילך".',
  check: 'לא צריך עשר מתוך עשר כדי לצאת לדרך. צריך לדעת מה חסר.',
};

// A problem the user added, without a model: a simple "איך ל..." and a place on the road by its lens.
const AT_BY_LENS = { worth: 'before', work: 'run', hard: 'setup', time: 'leads' };
const bonusByRules = (p) => ({
  name: `רשימת בדיקה: "${p.text.replace(/[?."]/g, '').slice(0, 28)}"`,
  what: `דף אחד שעובר על הבעיה צעד אחר צעד, כדי ש${g('הלקוח', 'הלקוח')} לא ייתקע בה`,
  kind: 'תבנית',
  value: 200,
  basis: 'time',
  note: 'חוסכת כ-4 שעות של ניסוי וטעייה, × 50 ₪',
});

function App({ view: shellView, onViewChange }) {
  const handoff = useRef(takeHandoff()).current;
  const [screen, setScreen] = useState(handoff?.screen || startScreen());
  const [s, setS] = useState(handoff?.state || freshState());
  const [review, setReview] = useState({ text: EXISTING_OFFER, result: null });
  const [names, setNames] = useState(null);
  const [busy, setBusy] = useState(null); // 'outcomes' | 'problem' | 'names' | 'review' | bonus id
  const [toast, setToast] = useState(null);
  const [dev, setDev] = useState(false);
  const [unread, setUnread] = useState(true);
  const [cardOpen, setCardOpen] = useState(false);
  const [minAdded, setMinAdded] = useState(false);
  const timers = useRef({});
  const sRef = useRef(s);
  sRef.current = s;

  function startScreen() {
    const q = params.get('screen');
    return SCREENS.includes(q) ? q : 'opening';
  }

  // A deep link straight into a later screen still needs what earlier screens prepare.
  useEffect(() => {
    if (PART_OF[screen] != null || screen === 'done') {
      const reach = screen === 'done' ? PARTS.length - 1 : PART_OF[screen];
      // Past the name screen, a link shows the offer with the shark's first name picked.
      const named = (x) => (['check', 'done'].includes(screen) && !x.name.text ? { ...x, name: { id: NAMES[0].id, text: NAMES[0].text } } : x);
      setS((x) => prep(named({ ...x, reached: Math.max(x.reached, reach) }), screen));
    }
  }, []);

  useEffect(() => {
    window.__flowbizSnapshot = () => ({ screen, state: s });
  });
  useEffect(() => {
    const q = new URLSearchParams();
    q.set('screen', screen);
    if (EMBED) q.set('embed', '1');
    if (params.get('user')) q.set('user', params.get('user'));
    history.replaceState(null, '', `${location.pathname}?${q}`);
    setUnread(true);
    setCardOpen(false);
    document.querySelector('main')?.scrollTo(0, 0);
  }, [screen]);
  useEffect(() => {
    const k = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (e.key === 'D' && e.shiftKey && !typing) setDev((d) => !d);
      if (e.key === 'Enter' && !typing && !e.shiftKey && !dev && !cardOpen) {
        const btn = document.querySelector('[data-primary] button:not([disabled])');
        if (btn && document.activeElement?.tagName !== 'BUTTON') btn.click();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [dev, cardOpen]);

  const notify = (text, icon = 'info', undo) => {
    setToast({ id: Date.now(), text, icon, undo });
    clearTimeout(timers.current.toast);
    timers.current.toast = setTimeout(() => setToast(null), undo ? 5000 : 2800);
  };
  const undoToast = () => {
    toast?.undo?.();
    setToast(null);
  };
  const aiError = (e) => {
    console.error(e);
    const st = e?.status;
    notify(st === 401 ? 'המפתח לא תקין. בודקים אותו בהערות (Shift+D)' : st === 429 || st === 529 ? 'המודל עמוס כרגע. מנסים שוב בעוד רגע' : 'הכריש לא הצליח לענות. מנסים שוב', 'circle-alert');
  };

  // What a screen needs ready when the user arrives (bonuses are drafted on the first visit,
  // and redrafted for obstacles that opened or closed since).
  function prep(x, to) {
    if (to !== 'bonuses' && to !== 'check' && to !== 'done' && FLOW.indexOf(to) < FLOW.indexOf('bonuses')) return x;
    const open = openObstacles(x).map((p) => p.id);
    if (!x.bonuses) return { ...x, bonuses: draftBonuses(x) };
    const kept = x.bonuses.filter((b) => open.includes(b.for));
    const fresh = draftBonuses(x).filter((d) => !kept.some((b) => b.for === d.for));
    const order = (b) => open.indexOf(b.for);
    return { ...x, bonuses: [...kept, ...fresh].sort((a, b) => order(a) - order(b)) };
  }
  const go = (to) => {
    if (PART_OF[to] != null) setS((x) => prep({ ...x, reached: Math.max(x.reached, PART_OF[to]) }, to));
    setScreen(to);
  };
  const next = () => go(FLOW[FLOW.indexOf(screen) + 1] || 'done');
  const back = () => {
    const i = FLOW.indexOf(screen);
    if (i > 0) go(FLOW[i - 1]);
    else if (screen === 'outcome') go(review.result ? 'review' : 'opening');
    else if (screen === 'review') go('opening');
    else if (screen === 'done') go('check');
  };

  // ---------- the shark's drafts (Claude with the prompt, or the drafts written in advance) ----------
  const moreOutcomes = async () => {
    if (!hasAI()) return notify('עם המודל מחובר, הכריש כותב כאן שלושה ניסוחים חדשים', 'sparkles');
    if (busy) return;
    setBusy('outcomes');
    try {
      const shown = (sRef.current.altOutcomes || []).map((o) => o.text).concat(sRef.current.outcome.text);
      const alt = await ai.outcomes(shown);
      setS((x) => ({ ...x, altOutcomes: alt }));
    } catch (e) {
      aiError(e);
    }
    setBusy(null);
  };
  const addProblem = async (text, lens) => {
    const id = `u${Date.now()}`;
    const base = { id, text, lens, at: AT_BY_LENS[lens], how: '', on: true, mine: true };
    if (!hasAI()) {
      setS((x) => ({ ...x, problems: [...x.problems, { ...base, how: 'איך ל...' }] }));
      return notify(`נוסף ל"${ROAD.find((r) => r[0] === base.at)[1]}". אפשר לכתוב את "איך ל..."`, 'plus');
    }
    setBusy('problem');
    try {
      const r = await ai.problem(text, lens);
      setS((x) => ({ ...x, problems: [...x.problems, { ...base, ...r }] }));
    } catch (e) {
      setS((x) => ({ ...x, problems: [...x.problems, base] }));
      aiError(e);
    }
    setBusy(null);
  };
  const suggestBonus = async (b) => {
    const p = sRef.current.problems.find((x) => x.id === b.for);
    const put = (d) => setS((x) => ({ ...x, bonuses: x.bonuses.map((y) => (y.id === b.id ? { ...y, ...d, basis: d.basis || 'separate', on: true, empty: false } : y)) }));
    if (!hasAI()) return put(bonusByRules(p));
    setBusy(b.id);
    try {
      put(await ai.bonus(p.text));
    } catch (e) {
      aiError(e);
    }
    setBusy(null);
  };
  const moreNames = async () => {
    if (!hasAI()) return notify('עם המודל מחובר, הכריש כותב כאן שישה שמות חדשים', 'sparkles');
    if (busy) return;
    setBusy('names');
    try {
      setNames(await ai.names(sRef.current));
    } catch (e) {
      aiError(e);
    }
    setBusy(null);
  };
  const runReview = async () => {
    if (!review.text.trim() || busy) return;
    setBusy('review');
    try {
      const result = hasAI() ? await ai.review(review.text) : await new Promise((r) => setTimeout(() => r(reviewByRules(review.text)), 900));
      setReview((v) => ({ ...v, result }));
    } catch (e) {
      aiError(e);
    }
    setBusy(null);
  };

  // ---------- changes that touch other steps, with undo ----------
  const setPrice = (v) => {
    const prev = sRef.current.price;
    if (!v || v === prev) return;
    setS((x) => ({ ...x, price: v }));
    notify('המחיר עודכן גם בסל המוצרים', 'package', () => setS((x) => ({ ...x, price: prev })));
  };
  const setGuaranteeType = (t) => {
    const prev = sRef.current.guarantee;
    setS((x) => ({ ...x, guarantee: { type: t, ...GUARANTEE_DRAFTS[t], cancel: x.guarantee.cancel || CANCEL_TEXT } }));
    notify('הכריש כתב טיוטה לסוג הזה', 'pen-line', () => setS((x) => ({ ...x, guarantee: prev })));
  };

  const jump = (id) => {
    setDev(false);
    go(id);
  };
  const reset = () => {
    setS(freshState());
    setReview({ text: EXISTING_OFFER, result: null });
    setNames(null);
    setMinAdded(false);
    setDev(false);
    setScreen('opening');
    notify('התחלנו מההתחלה', 'rotate-ccw');
  };

  // ---------- the frame ----------
  const part = PART_OF[screen];
  const inFlow = part != null;
  const devBtn = html`<button type="button" onClick=${() => setDev((d) => !d)} title="הערות למפתחים (Shift+D)" aria-label="הערות למפתחים" class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-brand-50 hover:text-brand-600 cursor-pointer max-md:hidden"><${Icon} name="code-xml" size=${18} /></button>`;
  // Below xl the offer card has no room beside the screen; it opens from the top bar.
  const cardBtn = inFlow && html`<button type="button" onClick=${() => setCardOpen(true)} aria-label="ההצעה שלך" title="ההצעה שלך" class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50 cursor-pointer xl:hidden"><${Icon} name="file-text" size=${18} /></button>`;
  const top = html`<${TopBar}
    step=${STEP}
    progress=${inFlow ? html`<${Progress} parts=${PARTS} current=${part} maxReached=${s.reached} onJump=${(i) => i <= s.reached && go(FIRST_OF_PART[i])} />` : screen === 'done' ? html`<${Progress} parts=${PARTS} current=${PARTS.length - 1} maxReached=${PARTS.length - 1} done onJump=${(i) => go(FIRST_OF_PART[i])} />` : null}
    tools=${html`${cardBtn}${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} class="max-md:hidden" />`}${devBtn}`}
    onHome=${() => notify('במוק-אפ דף הבית לא פעיל. השלב נשאר פתוח במפה', 'house')}
  />`;

  // Why the primary button is off, said in the bar (one status at a time).
  const reason = {
    outcome: !s.outcome.text?.trim() ? 'בוחרים תוצאה' : null,
    problems: !s.problems.some((p) => p.on) ? 'צריך לפחות בעיה אחת' : null,
    matrix: !s.ideas.some((d) => d.in) ? 'צריך להשאיר משהו בהצעה' : null,
    price: !(s.price > 0) ? 'חסר מחיר' : null,
    guarantee: !guaranteeOK(s.guarantee) ? 'חסר חלק במשפט ההבטחה' : null,
    urgency: s.urgency.id !== 'none' && !s.urgency.date ? 'חסר תאריך אמיתי' : null,
    name: !s.name.text?.trim() ? 'בוחרים שם' : null,
  }[screen];
  const okCount = screen === 'check' ? checks(s).filter((c) => c.state === 'ok').length : 0;
  const hint = {
    outcome: 'חלק 1 מתוך 6',
    problems: `${s.problems.filter((p) => p.on).length} בעיות ברשימה`,
    matrix: `${s.ideas.filter((d) => d.in).length} נשארים בהצעה`,
    bonuses: `${(s.bonuses || []).filter((b) => b.on).length} בונוסים`,
    check: `${okCount} מתוך 10 מוכנים`,
  }[screen];

  const backBtn = html`<${Button} variant="secondary" onClick=${back}>חזרה<//>`;
  const primary = (label, onClick, opts = {}) => html`<span data-primary><${PrimaryButton} label=${label} onClick=${onClick} disabled=${!!reason || opts.disabled} check=${opts.check} /></span>`;

  const bottom =
    screen === 'opening'
      ? html`<${BottomBar} status=${html`<${Status} hint="כ-25 דקות · 6 חלקים" />`} primary=${primary('מתחילים', () => go('outcome'))} />`
      : screen === 'review'
        ? html`<${BottomBar}
            back=${backBtn}
            extra=${review.result && html`<${Button} variant="text" onClick=${() => setReview((v) => ({ ...v, result: null }))}><${Icon} name="rotate-ccw" size=${16} />לבדוק טקסט אחר<//>`}
            status=${html`<${Status} reason=${!review.text.trim() ? 'חסר טקסט לבדיקה' : null} />`}
            primary=${review.result ? primary('לבנות גרסה משופרת', () => go('outcome')) : primary(busy === 'review' ? 'הכריש קורא...' : 'לבדוק', runReview, { disabled: !review.text.trim() || busy === 'review' })}
          />`
        : screen === 'done'
          ? html`<${BottomBar} back=${backBtn} status=${html`<span></span>`} primary=${primary('לשלב הבא', () => notify('השלב הבא נפתח במפה: שלב 9, דף נחיתה', 'arrow-left'))} />`
          : html`<${BottomBar}
              back=${backBtn}
              status=${html`<${Status} reason=${reason} hint=${hint} />`}
              primary=${screen === 'check' ? primary('סיום השלב', () => go('done'), { check: true }) : primary('המשך', next)}
            />`;

  // On the price screen the big meter is the content, so the card leaves its own out.
  const aside = html`<${OfferCard} s=${s} noMeter=${screen === 'price'} />`;
  const props = { s, set: setS, aside };
  const body = {
    opening: html`<${Opening} onReview=${() => go('review')} />`,
    review: html`<${Review} result=${review.result} busy=${busy === 'review'} onCheck=${runReview} text=${review.text} setText=${(t) => setReview((v) => ({ ...v, text: t }))} />`,
    outcome: html`<${OutcomeScreen} ...${props} onMore=${moreOutcomes} />`,
    problems: html`<${ProblemsScreen} ...${props} onAdd=${addProblem} adding=${busy === 'problem'} />`,
    matrix: html`<${MatrixScreen} ...${props} />`,
    components: html`<${ComponentsScreen} ...${props} />`,
    price: html`<${PriceScreen} ...${props} onPrice=${setPrice} />`,
    bonuses: html`<${BonusesScreen} ...${props} onSuggest=${suggestBonus} busyId=${busy} />`,
    guarantee: html`<${GuaranteeScreen} ...${props} onType=${setGuaranteeType} />`,
    urgency: html`<${UrgencyScreen} ...${props} />`,
    name: html`<${NameScreen} ...${props} names=${names} onMore=${moreNames} busy=${busy === 'names'} />`,
    check: html`<${CheckScreen} s=${s} aside=${aside} onFix=${(to) => go(to)} />`,
    done: html`<${Done} s=${s} notify=${notify} minAdded=${minAdded} onAddMin=${() => (setMinAdded(true), notify('"המינימום" נוסף לסל המוצרים', 'package'))} onAnother=${() => notify('במערכת: בוחרים מוצר מהסל, והחלקים מתחילים מחדש עם מה שכבר ידוע', 'plus')} />`,
  }[screen];

  return html`<div class="fb-notebook flex h-dvh flex-col text-ink" dir="rtl">
    ${top}
    <main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
      ${body}
      ${SHARK_LINE[screen] && html`<${PartnerBubble} key=${screen} message=${SHARK_LINE[screen]} unread=${unread} onRead=${() => setUnread(false)} />`}
    </main>
    ${bottom}
    <${Toast} toast=${toast} onUndo=${undoToast} />
    ${cardOpen && html`<${Sheet} title="ההצעה שלך" onClose=${() => setCardOpen(false)}><${OfferCard} s=${s} /><//>`}
    <${DevPanel} open=${dev} onClose=${() => setDev(false)} onJump=${jump} onReset=${reset} notify=${notify} />
  </div>`;
}

function Root() {
  const [view, setView] = useState(readView);
  useEffect(() => applyPhoneViewport(view), [view]);
  const change = (v) => {
    if (v === 'mobile') {
      try {
        writeHandoff(window.__flowbizSnapshot?.());
      } catch {}
    }
    saveView(v);
    setView(v);
  };
  if (!EMBED && !IS_PHONE && view === 'mobile') return html`<${PhonePreview} onSwitch=${change} title="בניית הצעה מנצחת" />`;
  return html`<${App} view=${view} onViewChange=${change} />`;
}

applyPhoneViewport(readView());
render(html`<${Root} />`, document.getElementById('app'));
